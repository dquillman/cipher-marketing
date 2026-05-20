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

function letterGrade({ engagementRatePct, linkClickRatePct, benchmarks }) {
  const erGood   = benchmarks.engagementRatePctGoodAtLeast;
  const erGreat  = benchmarks.engagementRatePctGreatAtLeast;
  const lcrGood  = benchmarks.linkClickRatePctGoodAtLeast;
  const lcrGreat = benchmarks.linkClickRatePctGreatAtLeast;

  const erBand  = engagementRatePct  >= erGreat  ? 2 : engagementRatePct  >= erGood  ? 1 : engagementRatePct  > 0 ? 0 : -1;
  const lcrBand = linkClickRatePct   >= lcrGreat ? 2 : linkClickRatePct   >= lcrGood ? 1 : linkClickRatePct   > 0 ? 0 : -1;

  const score = erBand + lcrBand;
  if (score >= 4)  return "A";
  if (score >= 2)  return "B";
  if (score >= 0)  return "C";
  return "D";
}

async function aiNotes({ apiKey, post, metrics, engagementRatePct, linkClickRatePct, grade, benchmarks }) {
  const client = new Anthropic({ apiKey });
  const prompt = `You are Brad, Dave's CipherExam marketing analyst. Grade this published ${post.channel.toUpperCase()} post.

POST COPY:
"""${post.copy}"""

METRICS (Dave reported):
${JSON.stringify(metrics, null, 2)}

COMPUTED RATES:
- Engagement rate: ${engagementRatePct.toFixed(2)}%
- Link click rate: ${linkClickRatePct.toFixed(2)}%

CHANNEL BENCHMARKS (${post.channel}):
- Engagement: ${benchmarks.engagementRatePctGoodAtLeast}% good / ${benchmarks.engagementRatePctGreatAtLeast}% great
- Link clicks: ${benchmarks.linkClickRatePctGoodAtLeast}% good / ${benchmarks.linkClickRatePctGreatAtLeast}% great

MECHANICAL GRADE: ${grade}

Return JSON with exactly these fields, no prose:
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

      const impressions       = Number(metrics.impressions || 0);
      const engagementActions = Number(metrics.engagementActions || 0); // likes+comments+reposts+replies
      const linkClicks        = Number(metrics.linkClicks || 0);

      const engagementRatePct = pct(engagementActions, impressions);
      const linkClickRatePct  = pct(linkClicks, impressions);

      const grade = letterGrade({ engagementRatePct, linkClickRatePct, benchmarks });

      const ai = await aiNotes({
        apiKey: ANTHROPIC_API_KEY.value(),
        post,
        metrics,
        engagementRatePct,
        linkClickRatePct,
        grade,
        benchmarks,
      });

      const now = new Date().toISOString();
      data.posts[idx] = {
        ...post,
        metrics: {
          ...metrics,
          engagementRatePct: Number(engagementRatePct.toFixed(2)),
          linkClickRatePct:  Number(linkClickRatePct.toFixed(2)),
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
        engagementRatePct: Number(engagementRatePct.toFixed(2)),
        linkClickRatePct: Number(linkClickRatePct.toFixed(2)),
        gradeNotes: ai.gradeNotes,
        recommendation: ai.recommendation,
      });
    } catch (e) {
      console.error("gradePost failed:", e);
      res.status(500).json({ error: e.message || "unknown error" });
    }
  }
);
