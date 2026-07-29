// HTTP function: POST /api/grade { postId, metrics }
// 1. Loads the post + benchmarks from Firestore
// 2. Computes a letter grade mechanically from engagement + link-click rates
// 3. Asks Claude for short interpretive notes + one recommendation
// 4. Writes metrics, grade, gradeNotes, recommendations back onto the post
// 5. Live-sync onSnapshot in the dashboard picks up the change automatically

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  RequestError,
  requireBootstrapOperator,
  requireMarketingAdmin,
  validateGradePayload,
} from "./security.js";
import Anthropic from "@anthropic-ai/sdk";
import {
  RESET_CONFIRMATION,
  buildCompetitorReports,
  buildFreshCompetitors,
  buildFreshPosts,
  buildFreshState,
  validateCampaignStart,
} from "./campaign-blueprint.js";

initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const MODEL = "claude-sonnet-4-6";
const ALLOWED_ORIGINS = [
  "https://cipher-marketing-daveq.web.app",
  "https://cipher-marketing-daveq.firebaseapp.com",
  "http://localhost:8766",
  "http://127.0.0.1:8766",
];
const GRADE_LIMIT_PER_MINUTE = 10;

async function verifyBearerToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) throw new RequestError(401, "Bearer authentication required.");
  try {
    return await getAuth().verifyIdToken(match[1]);
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(401, "Invalid or expired operator token.");
  }
}

async function authenticateOperator(req) {
  return requireMarketingAdmin(await verifyBearerToken(req));
}

export const bootstrapMarketingAdmin = onRequest(
  { cors: ALLOWED_ORIGINS, region: "us-central1", invoker: "public" },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "POST only" });
        return;
      }
      const decoded = requireBootstrapOperator(await verifyBearerToken(req));
      const auth = getAuth();
      const user = await auth.getUser(decoded.uid);
      await auth.setCustomUserClaims(user.uid, {
        ...(user.customClaims || {}),
        marketingAdmin: true,
      });
      res.json({ ok: true });
    } catch (error) {
      console.error("bootstrapMarketingAdmin failed:", error);
      const status = Number(error.statusCode) || 500;
      res.status(status).json({
        error: status >= 500 ? "Unable to authorize operator." : error.message,
      });
    }
  }
);
function validateResetPayload(body) {
  if (!body || typeof body !== "object") {
    throw new RequestError(400, "A reset request is required.");
  }
  try {
    validateCampaignStart(body.startDate);
  } catch (error) {
    throw new RequestError(400, error.message);
  }
  if (body.confirmation !== RESET_CONFIRMATION) {
    throw new RequestError(400, `Type ${RESET_CONFIRMATION} to confirm.`);
  }
  if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9_-]{12,80}$/.test(body.requestId)) {
    throw new RequestError(400, "A valid reset request ID is required.");
  }
  return { startDate: body.startDate, requestId: body.requestId };
}

export const resetCampaign = onRequest(
  { cors: ALLOWED_ORIGINS, region: "us-central1", invoker: "public" },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "POST only" });
        return;
      }
      const operator = await authenticateOperator(req);
      const { startDate, requestId } = validateResetPayload(req.body);
      const db = getFirestore();
      const archiveId = requestId;
      const archiveRef = db.collection("campaignArchives").doc(archiveId);
      const stateRef = db.collection("campaign").doc("state");
      const postsRef = db.collection("campaign").doc("posts");
      const competitorsRef = db.collection("campaign").doc("competitors");
      const reportIds = ["landscape", "deepdive", "battlecard"];
      const reportRefs = reportIds.map((id) => db.collection("competitor_intel").doc(id));

      const result = await db.runTransaction(async (tx) => {
        const [archiveSnap, stateSnap, postsSnap, competitorsSnap, ...reportSnaps] =
          await Promise.all([
            tx.get(archiveRef),
            tx.get(stateRef),
            tx.get(postsRef),
            tx.get(competitorsRef),
            ...reportRefs.map((ref) => tx.get(ref)),
          ]);

        if (archiveSnap.exists) {
          return { alreadyCompleted: true, ...archiveSnap.data() };
        }

        const now = new Date();
        const currentState = stateSnap.exists ? stateSnap.data() : {};
        const currentPosts = postsSnap.exists ? postsSnap.data() : {};
        const currentCompetitors = competitorsSnap.exists ? competitorsSnap.data() : {};
        const freshState = buildFreshState(currentState, startDate, now);
        const freshPosts = buildFreshPosts(currentPosts, startDate, now);
        const freshCompetitors = buildFreshCompetitors(now);
        const freshReports = buildCompetitorReports(now);

        tx.create(archiveRef, {
          archiveId,
          createdAt: now.toISOString(),
          createdByUid: operator.uid,
          previousCampaignStart: currentState?.campaign?.start || null,
          newCampaignStart: startDate,
          strategyVersion: "pmp-judgment-2026",
          recoverable: true,
        });
        tx.create(archiveRef.collection("snapshots").doc("state"), { exists: stateSnap.exists, data: currentState });
        tx.create(archiveRef.collection("snapshots").doc("posts"), { exists: postsSnap.exists, data: currentPosts });
        tx.create(archiveRef.collection("snapshots").doc("competitors"), { exists: competitorsSnap.exists, data: currentCompetitors });
        reportSnaps.forEach((snap, index) => {
          tx.create(archiveRef.collection("competitor_intel").doc(reportIds[index]), {
            exists: snap.exists,
            data: snap.exists ? snap.data() : {},
          });
        });

        tx.set(stateRef, freshState);
        tx.set(postsRef, freshPosts);
        tx.set(competitorsRef, freshCompetitors);
        reportRefs.forEach((ref, index) => tx.set(ref, freshReports[reportIds[index]]));

        return {
          archiveId,
          createdAt: now.toISOString(),
          newCampaignStart: startDate,
          strategyVersion: "pmp-judgment-2026",
          recoverable: true,
        };
      });

      res.json({ ok: true, ...result });
    } catch (error) {
      console.error("resetCampaign failed:", error);
      const status = Number(error.statusCode) || 500;
      res.status(status).json({ error: status >= 500 ? "Unable to reset the campaign safely." : error.message });
    }
  }
);
async function enforceGradeRateLimit(db, uid) {
  const ref = db.collection("_rateLimits").doc(`grade_${uid}`);
  const now = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? snap.data() : null;
    const sameWindow = current && now - Number(current.windowStartedAt || 0) < 60_000;
    const count = sameWindow ? Number(current.count || 0) : 0;
    if (count >= GRADE_LIMIT_PER_MINUTE) {
      throw new RequestError(429, "Grade request limit reached. Try again in one minute.");
    }
    tx.set(ref, {
      windowStartedAt: sameWindow ? current.windowStartedAt : now,
      count: count + 1,
      updatedAt: new Date(now).toISOString(),
    });
  });
}


function pct(n, d) { return d > 0 ? (n / d) * 100 : 0; }

// Rate-based grade (LinkedIn / X / Reddit Ads — all have impressions)
function letterGrade({ engagementRatePct, linkClickRatePct, videoViewRatePct, hasVideo, benchmarks }) {
  const erGood   = benchmarks.engagementRatePctGoodAtLeast;
  const erGreat  = benchmarks.engagementRatePctGreatAtLeast;
  const lcrGood  = benchmarks.linkClickRatePctGoodAtLeast;
  const lcrGreat = benchmarks.linkClickRatePctGreatAtLeast;

  const erBand  = engagementRatePct  >= erGreat  ? 2 : engagementRatePct  >= erGood  ? 1 : engagementRatePct  > 0 ? 0 : -1;
  const lcrBand = linkClickRatePct   >= lcrGreat ? 2 : linkClickRatePct   >= lcrGood ? 1 : linkClickRatePct   > 0 ? 0 : -1;

  let score = erBand + lcrBand;
  let max   = 4;

  if (hasVideo && benchmarks.videoViewRatePctGoodAtLeast != null) {
    const vvrGood  = benchmarks.videoViewRatePctGoodAtLeast;
    const vvrGreat = benchmarks.videoViewRatePctGreatAtLeast;
    const vvrBand  = videoViewRatePct >= vvrGreat ? 2 : videoViewRatePct >= vvrGood ? 1 : videoViewRatePct > 0 ? 0 : -1;
    score += vvrBand;
    max   += 2;
  }

  const pctOfMax = score / max;
  if (pctOfMax >= 0.80) return "A";
  if (pctOfMax >= 0.40) return "B";
  if (pctOfMax >= 0.00) return "C";
  return "D";
}

// Absolute-numbers grade (Reddit organic — no impressions exposed to non-authors)
function letterGradeRedditOrganic({ upvotes, comments, upvoteRatio, autoRemoved, benchmarks }) {
  // Hard overrides first — these short-circuit the rubric.
  if (autoRemoved) return "D";
  if (upvotes <= 0) return "D";                      // downvoted into oblivion
  if (upvoteRatio != null && upvoteRatio < 0.85) return "D"; // controversial / value-mismatch

  const upGood     = benchmarks.upvotesGoodAtLeast;
  const upGreat    = benchmarks.upvotesGreatAtLeast;
  const cmtGood    = benchmarks.commentsGoodAtLeast;
  const cmtGreat   = benchmarks.commentsGreatAtLeast;
  const ratioGood  = benchmarks.upvoteRatioGoodAtLeast;
  const ratioGreat = benchmarks.upvoteRatioGreatAtLeast;

  const upBand    = upvotes        >= upGreat    ? 2 : upvotes        >= upGood    ? 1 : 0;
  const cmtBand   = comments       >= cmtGreat   ? 2 : comments       >= cmtGood   ? 1 : 0;
  const ratioBand = upvoteRatio    >= ratioGreat ? 2 : upvoteRatio    >= ratioGood ? 1 : 0;

  const score = upBand + cmtBand + ratioBand;
  // max = 6. A = 5-6, B = 3-4, C = 1-2, D = 0
  if (score >= 5) return "A";
  if (score >= 3) return "B";
  if (score >= 1) return "C";
  return "D";
}

// CPC penalty for Reddit Ads — pulls grade down a tier if ad spend is inefficient.
function applyRedditAdsCpcPenalty(grade, cpcUsd, benchmarks) {
  if (cpcUsd == null) return grade;
  const cpcAcceptable = benchmarks.cpcUsdAcceptableAtMost;
  if (cpcAcceptable != null && cpcUsd > cpcAcceptable) {
    const order = ["A", "B", "C", "D"];
    const i = order.indexOf(grade);
    return i < order.length - 1 ? order[i + 1] : grade;
  }
  return grade;
}

async function aiNotes({ apiKey, post, metrics, computed, hasVideo, grade, benchmarks, isRedditOrganic }) {
  const client = new Anthropic({ apiKey });

  let computedBlock;
  let benchmarkBlock;

  if (isRedditOrganic) {
    computedBlock = [
      `- Upvotes: ${computed.upvotes}`,
      `- Comments: ${computed.comments}`,
      `- Upvote ratio: ${computed.upvoteRatio != null ? computed.upvoteRatio : "n/a"}`,
      `- Auto-removed by AutoMod/mods: ${computed.autoRemoved ? "YES — never reached the feed" : "no"}`,
    ].join("\n");
    benchmarkBlock = [
      `- Upvotes: ${benchmarks.upvotesGoodAtLeast} good / ${benchmarks.upvotesGreatAtLeast} great`,
      `- Comments: ${benchmarks.commentsGoodAtLeast} good / ${benchmarks.commentsGreatAtLeast} great`,
      `- Upvote ratio: ${benchmarks.upvoteRatioGoodAtLeast} good / ${benchmarks.upvoteRatioGreatAtLeast} great`,
    ].join("\n");
  } else {
    const videoLine = hasVideo
      ? `- Video view rate: ${computed.videoViewRatePct}%`
      : `- Video view rate: n/a (no video on this post)`;
    const cpcLine = post.channel === "reddit-ads" && computed.cpcUsd != null
      ? `\n- CPC: $${computed.cpcUsd}`
      : "";
    computedBlock = [
      `- Engagement rate: ${computed.engagementRatePct}%`,
      `- Link click rate: ${computed.linkClickRatePct}%`,
      videoLine,
    ].join("\n") + cpcLine;

    const videoBenchLine = hasVideo && benchmarks.videoViewRatePctGoodAtLeast != null
      ? `\n- Video view rate: ${benchmarks.videoViewRatePctGoodAtLeast}% good / ${benchmarks.videoViewRatePctGreatAtLeast}% great`
      : "";
    const cpcBenchLine = post.channel === "reddit-ads" && benchmarks.cpcUsdAcceptableAtMost != null
      ? `\n- CPC: $${benchmarks.cpcUsdGreatAtMost} great / $${benchmarks.cpcUsdAcceptableAtMost} acceptable ceiling`
      : "";
    benchmarkBlock = [
      `- Engagement: ${benchmarks.engagementRatePctGoodAtLeast}% good / ${benchmarks.engagementRatePctGreatAtLeast}% great`,
      `- Link clicks: ${benchmarks.linkClickRatePctGoodAtLeast}% good / ${benchmarks.linkClickRatePctGreatAtLeast}% great`,
    ].join("\n") + videoBenchLine + cpcBenchLine;
  }

  const channelDescriptor = isRedditOrganic
    ? `REDDIT ORGANIC (subreddit: ${post.subreddit || metrics.subreddit || "unknown"})`
    : post.channel.toUpperCase();

  const prompt = `You are Brad, Dave's CipherExam marketing analyst. Grade this published ${channelDescriptor} post.

POST COPY:
"""${post.copy}"""

VIDEO ATTACHED: ${hasVideo ? `${post.video} (${post.videoFormat || "?"})` : "no"}

METRICS (Dave reported):
${JSON.stringify(metrics, null, 2)}

COMPUTED:
${computedBlock}

CHANNEL BENCHMARKS (${post.channel}):
${benchmarkBlock}

MECHANICAL GRADE: ${grade}

${isRedditOrganic ? "REDDIT NOTES: This is organic Reddit. There are no impressions. Engagement = upvotes + comments. Auto-removal is fatal — if metrics.autoRemoved is true, the post never reached the feed and any analysis of content is moot. Subreddit culture matters: r/CompTIA strictest on self-promo, r/pmp tolerates prep-tool mentions if value-first, r/humanresources engages on policy threads.\n\n" : ""}Return JSON with exactly these fields, no prose:
{
  "gradeNotes": "<2-4 sentences: what worked, what didn't, anchored to the metrics>",
  "recommendation": "<1 sentence: the single highest-leverage change for the next post in this slot>"
}`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content.map(b => b.type === "text" ? b.text : "").join("");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain JSON: " + text.slice(0, 200));
  return JSON.parse(jsonMatch[0]);
}

export const gradePost = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: ALLOWED_ORIGINS, region: "us-central1", invoker: "public" },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "POST only" });
        return;
      }
      const operator = await authenticateOperator(req);
      const { postId, metrics } = validateGradePayload(req.body);
      const db = getFirestore();
      await enforceGradeRateLimit(db, operator.uid);
      const docRef = db.collection("campaign").doc("posts");
      const snap = await docRef.get();
      if (!snap.exists) { res.status(500).json({ error: "campaign/posts doc missing" }); return; }
      const data = snap.data();

      const idx = data.posts.findIndex(p => p.id === postId);
      if (idx === -1) { res.status(404).json({ error: `post "${postId}" not found` }); return; }
      const post = data.posts[idx];

      const benchmarks = data.benchmarks?.[post.channel];
      if (!benchmarks) { res.status(500).json({ error: `no benchmarks for channel "${post.channel}"` }); return; }

      const hasVideo = !!post.video;
      const isRedditOrganic = post.channel === "reddit-organic";

      let grade;
      let computed = {}; // computed rates / scores to persist + show in AI prompt

      if (isRedditOrganic) {
        // Reddit organic: no impressions, grade on absolute numbers.
        const upvotes     = Number(metrics.upvotes || 0);
        const comments    = Number(metrics.comments || 0);
        const upvoteRatio = metrics.upvoteRatio != null ? Number(metrics.upvoteRatio) : null;
        const autoRemoved = !!metrics.autoRemoved;

        grade = letterGradeRedditOrganic({ upvotes, comments, upvoteRatio, autoRemoved, benchmarks });

        // Conversion bump (only when post wasn't auto-removed)
        if (!autoRemoved && Number(metrics.trialSignupsAttributed || 0) > 0) {
          const order = ["D", "C", "B", "A"];
          const i = order.indexOf(grade);
          if (i >= 0 && i < order.length - 1) grade = order[i + 1];
        }

        computed = { upvotes, comments, upvoteRatio, autoRemoved };
      } else {
        // Impression-based: LI, X, reddit-ads
        const impressions       = Number(metrics.impressions || 0);
        // likes+comments+reposts+replies. Fall back to summing the parts when
        // the client didn't send the rollup — dashboard builds before v1.5.0
        // never did, which made every modal-submitted grade compute 0% engagement.
        const engagementActions = metrics.engagementActions != null
          ? Number(metrics.engagementActions)
          : Number(metrics.socialEngagements || 0) ||
            (Number(metrics.reactions ?? metrics.likes ?? 0) +
             Number(metrics.comments ?? metrics.replies ?? 0) +
             Number(metrics.reposts ?? 0));
        const linkClicks        = Number(metrics.linkClicks || 0);
        const videoViews        = Number(metrics.videoViews || 0);

        const engagementRatePct = pct(engagementActions, impressions);
        const linkClickRatePct  = pct(linkClicks, impressions);
        const videoViewRatePct  = pct(videoViews, impressions);

        grade = letterGrade({ engagementRatePct, linkClickRatePct, videoViewRatePct, hasVideo, benchmarks });

        // Reddit Ads: penalize over-budget CPC by one tier
        if (post.channel === "reddit-ads") {
          const spend = Number(metrics.totalSpendUsd || 0);
          const cpcUsd = linkClicks > 0 ? spend / linkClicks : null;
          grade = applyRedditAdsCpcPenalty(grade, cpcUsd, benchmarks);
          computed.cpcUsd = cpcUsd != null ? Number(cpcUsd.toFixed(2)) : null;
        }

        // Conversion bump
        if (Number(metrics.trialSignupsAttributed || 0) > 0) {
          const order = ["D", "C", "B", "A"];
          const i = order.indexOf(grade);
          if (i >= 0 && i < order.length - 1) grade = order[i + 1];
        }

        // Tiny-reach penalty for organic LI/X
        if (post.channel === "linkedin" && impressions < 200) {
          const order = ["A", "B", "C", "D"];
          const i = order.indexOf(grade);
          if (i >= 0 && i < order.length - 1) grade = order[i + 1];
        } else if (post.channel === "x" && impressions < 500) {
          const order = ["A", "B", "C", "D"];
          const i = order.indexOf(grade);
          if (i >= 0 && i < order.length - 1) grade = order[i + 1];
        }

        computed.engagementRatePct = Number(engagementRatePct.toFixed(2));
        computed.linkClickRatePct  = Number(linkClickRatePct.toFixed(2));
        if (hasVideo) computed.videoViewRatePct = Number(videoViewRatePct.toFixed(2));
      }

      const ai = await aiNotes({
        apiKey: ANTHROPIC_API_KEY.value(),
        post,
        metrics,
        computed,
        hasVideo,
        grade,
        benchmarks,
        isRedditOrganic,
      });

      const now = new Date().toISOString();
      data.posts[idx] = {
        ...post,
        metrics: {
          ...metrics,
          ...computed,
          gradedAt: now,
        },
        grade,
        gradeNotes: ai.gradeNotes,
        recommendations: ai.recommendation,
      };
      data._meta = { ...(data._meta || {}), lastUpdatedAt: now, lastUpdatedBy: "grade-post-fn" };

      await docRef.set(data);

      res.json({
        ok: true,
        postId,
        grade,
        ...computed,
        gradeNotes: ai.gradeNotes,
        recommendation: ai.recommendation,
      });
    } catch (e) {
      console.error("gradePost failed:", e);
      const status = Number(e.statusCode) || 500;
      const message = status >= 500 ? "Unable to grade post." : e.message;
      res.status(status).json({ error: message });
    }
  }
);
