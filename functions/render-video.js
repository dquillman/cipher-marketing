// Firestore-triggered function: creating a doc in `videoRenderQueue` renders
// a post's copy into a branded motion video via Remotion, uploads it to
// Firebase Storage, and attaches the result to the post record in
// `campaign/posts` (auto-attach — no separate manual "Attach to Post" step,
// per the fully-automatic MVP scope). Sends an email notification on success.
//
// Deploy note: headless rendering needs a real Chromium binary. Remotion's
// ensureBrowser() downloads its Chrome Headless Shell at runtime on first
// use per instance — gen2 functions run on Cloud Run with a writable
// in-memory filesystem, so this works where build-time puppeteer downloads
// don't (the buildpack does not persist puppeteer's postinstall cache into
// the runtime image; both /www-data-home and /workspace .cache paths came
// back missing in production, 2026-07-31). The download (~150MB) counts
// toward instance memory, hence 4GiB. Fallback if this ever breaks: move
// the render step to a dedicated Cloud Run service with Chrome baked in.

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, ensureBrowser } from "@remotion/renderer";
import nodemailer from "nodemailer";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { lookupExamSitFee } from "./remotion/examPricing.js";
import { pickTheme } from "./remotion/videoThemes.js";
import { pickChip } from "./remotion/postChip.js";
import { VIDEO_TEMPLATE_VERSION } from "./remotion/templateVersion.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const NOTIFY_EMAIL = "dquillman2112@gmail.com";
// LinkedIn recommends 4:5 (more feed height); X and the rest take 1:1.
const COMPOSITION_1X1 = "post-video";
const COMPOSITION_4X5 = "post-video-4x5";

// One-time (per instance) bucket CORS setup so the dashboard can fetch
// rendered MP4s as blobs for the Download button — the default bucket ships
// with no CORS config, which blocks page-context fetch() of videoUrl. Runs
// under the function's service account (local dev credentials can't do
// this). Idempotent: skips if a CORS config already exists.
let corsEnsured = false;
async function ensureBucketCors(bucket) {
  if (corsEnsured) return;
  try {
    const [meta] = await bucket.getMetadata();
    if (!meta.cors || meta.cors.length === 0) {
      await bucket.setCorsConfiguration([
        {
          origin: ["*"],
          method: ["GET", "HEAD"],
          maxAgeSeconds: 3600,
          responseHeader: ["Content-Type", "Range", "Content-Length", "Content-Range"],
        },
      ]);
      console.log("[render-video] bucket CORS configured");
    }
    corsEnsured = true;
  } catch (error) {
    console.warn("[render-video] could not ensure bucket CORS:", error.message);
  }
}

// Cached across warm invocations of the same container instance.
let bundleLocationPromise = null;
function getBundleLocation() {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({
      entryPoint: path.join(HERE, "remotion", "index.jsx"),
      outDir: path.join(os.tmpdir(), "remotion-bundle"),
    });
  }
  return bundleLocationPromise;
}

function deriveHookText(copy) {
  if (!copy) return "Learn how certification exams think.";
  const firstParagraph = copy.split(/\n\s*\n/)[0].trim();
  const collapsed = firstParagraph.replace(/\s+/g, " ");
  if (collapsed.length <= 140) return collapsed;
  return collapsed.slice(0, 137).trimEnd() + "…";
}

// Transactional: every post lives inside the single campaign/posts document,
// so concurrent renders doing read-modify-write clobber each other — with 4
// videos queued at once, two finished renders had their videoUrl silently
// overwritten by a slower sibling's stale snapshot (observed 2026-07-31).
async function updatePostRecord(postId, patch) {
  const db = getFirestore();
  const postsRef = db.collection("campaign").doc("posts");
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(postsRef);
    if (!snap.exists) return;
    const data = snap.data();
    const idx = data.posts.findIndex((p) => p.id === postId);
    if (idx === -1) return;
    data.posts[idx] = { ...data.posts[idx], ...patch };
    data._meta = {
      ...(data._meta || {}),
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: "render-post-video-fn",
    };
    tx.set(postsRef, data);
  });
}

async function sendCompletionEmail({ post, videoUrl }) {
  let appPassword;
  try {
    appPassword = GMAIL_APP_PASSWORD.value();
  } catch {
    appPassword = null;
  }
  // "unset" is the placeholder seeded at first deploy so the secret binding
  // exists before Dave supplies the real Gmail app password
  // (firebase functions:secrets:set GMAIL_APP_PASSWORD).
  if (appPassword === "unset") appPassword = null;
  if (!appPassword) {
    console.warn("[render-video] GMAIL_APP_PASSWORD secret not set — skipping email notification.");
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: NOTIFY_EMAIL, pass: appPassword },
  });
  await transporter.sendMail({
    from: NOTIFY_EMAIL,
    to: NOTIFY_EMAIL,
    subject: `Video ready — ${post.examFocus || post.channel || "post"} (${post.scheduled || post.id})`,
    text:
      `Your generated video is ready.\n\n` +
      `Post: ${post.id}\n` +
      `Channel: ${post.channel || "n/a"}\n` +
      `Exam: ${post.examFocus || "n/a"}\n\n` +
      `Watch it: ${videoUrl}\n\n` +
      `It's already attached to the post in the dashboard.`,
  });
}

export const renderPostVideo = onDocumentCreated(
  {
    document: "videoRenderQueue/{jobId}",
    region: "us-central1",
    memory: "4GiB",
    cpu: 2,
    timeoutSeconds: 480,
    secrets: [GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const jobId = event.params.jobId;
    const jobRef = event.data.ref;
    const job = event.data.data();
    const postId = job && job.postId;

    if (!postId) {
      await jobRef.set({ status: "error", error: "queue doc missing postId" }, { merge: true });
      return;
    }

    let outputPath;
    try {
      const db = getFirestore();
      const postsSnap = await db.collection("campaign").doc("posts").get();
      if (!postsSnap.exists) throw new Error("campaign/posts doc missing");
      const post = postsSnap.data().posts.find((p) => p.id === postId);
      if (!post) throw new Error(`post "${postId}" not found`);

      await jobRef.set(
        { status: "rendering", stage: "bundling", progress: 0, startedAt: new Date().toISOString() },
        { merge: true }
      );
      await updatePostRecord(postId, { videoStatus: "rendering" });

      const examName = post.examFocus || "";
      const examPrice = lookupExamSitFee(examName);
      const hookText = deriveHookText(post.copy);
      // Visual format rotates by scheduled week (post.videoTheme pins one).
      const chosenTheme = pickTheme(post.scheduled, post.videoTheme);
      // Chip states the fact that supports THIS post — the fee is reserved
      // for cost/risk posts so it stays a jolt instead of wallpaper.
      const chip = pickChip(post, examName, examPrice);
      const inputProps = {
        examName,
        examPrice,
        hookText,
        ctaText: "Start Free Trial",
        themeId: chosenTheme.id,
        chipLabel: chip ? chip.label : null,
        chipValue: chip ? chip.value : null,
      };

      await ensureBrowser();
      const serveUrl = await getBundleLocation();
      const compositionId =
        (post.channel || "") === "linkedin" ? COMPOSITION_4X5 : COMPOSITION_1X1;
      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
      });

      await jobRef.set({ stage: "rendering", progress: 0 }, { merge: true });

      outputPath = path.join(os.tmpdir(), `${jobId}.mp4`);
      // Stream render progress to the job doc in 5% steps — the dashboard
      // modal subscribes to this doc and drives its progress bar off it.
      let lastProgressBucket = -1;
      await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        outputLocation: outputPath,
        inputProps,
        chromiumOptions: { headless: true },
        onProgress: ({ progress }) => {
          const bucket = Math.floor(progress * 20);
          if (bucket > lastProgressBucket) {
            lastProgressBucket = bucket;
            jobRef
              .set({ progress: Math.round(progress * 100) }, { merge: true })
              .catch(() => {});
          }
        },
      });

      await jobRef.set({ stage: "uploading", progress: 100 }, { merge: true });

      const storagePath = `post-videos/${postId}/${jobId}.mp4`;
      const bucket = getStorage().bucket();
      await ensureBucketCors(bucket);
      await bucket.upload(outputPath, {
        destination: storagePath,
        metadata: { contentType: "video/mp4", cacheControl: "public, max-age=31536000" },
      });

      const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;
      const renderedAt = new Date().toISOString();

      // videoThemeUsed is recorded so grading can correlate format vs. performance.
      await updatePostRecord(postId, {
        videoUrl,
        videoStatus: "ready",
        renderedAt,
        videoThemeUsed: chosenTheme.id,
        videoChipUsed: chip ? chip.value : "none",
        videoAspect: compositionId === COMPOSITION_4X5 ? "4:5" : "1:1",
        videoTemplateVersion: VIDEO_TEMPLATE_VERSION,
      });
      await jobRef.set(
        { status: "ready", stage: "done", progress: 100, videoUrl, completedAt: renderedAt },
        { merge: true }
      );

      await sendCompletionEmail({ post, videoUrl }).catch((err) => {
        console.warn("[render-video] email notification failed:", err.message);
      });
    } catch (error) {
      console.error("[render-video] render failed:", error);
      await updatePostRecord(postId, { videoStatus: "error" }).catch(() => {});
      await jobRef.set({ status: "error", error: error.message }, { merge: true }).catch(() => {});
    } finally {
      if (outputPath) await fs.unlink(outputPath).catch(() => {});
    }
  }
);
