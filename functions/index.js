// HTTP function: POST /api/grade { postId, metrics }
// 1. Loads the post + benchmarks from Firestore
// 2. Computes a letter grade mechanically from engagement + link-click rates
// 3. Asks Claude for short interpretive notes + one recommendation
// 4. Writes metrics, grade, gradeNotes, recommendations back onto the post
// 5. Live-sync onSnapshot in the dashboard picks up the change automatically

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import Anthropic from "@anthropic-ai/sdk";

initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const MODEL = "claude-sonnet-4-6";

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
  { secrets: [ANTHROPIC_API_KEY], cors: true, region: "us-central1", invoker: "public" },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "POST only" });
        return;
      }
      const { postId, metrics } = req.body || {};
      if (!postId || !metrics || typeof metrics !== "object") {
        res.status(400).json({ error: "postId + metrics required" });
        return;
      }

      const db = getFirestore();
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
      res.status(500).json({ error: e.message || "unknown error" });
    }
  }
);
