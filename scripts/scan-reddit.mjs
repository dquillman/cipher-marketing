#!/usr/bin/env node
// Scans cert-prep subreddits for outliers using the official Reddit API, applying
// the cipher-trend-scout's documented rule: score >= 2x the subreddit's median for
// the window, or >= 50 comments.
//
// This is what makes the scout an outlier scanner rather than a topic scanner.
// RSS and embed.reddit.com expose no score, so before this existed the rule could
// not be applied at all and every scan carried a caveat saying so.
//
// Usage:
//   node scripts/scan-reddit.mjs                       # all default subs, 7 days
//   node scripts/scan-reddit.mjs --exam pmp            # just r/pmp
//   node scripts/scan-reddit.mjs --sub CompTIA         # one specific sub
//   node scripts/scan-reddit.mjs --json                # machine-readable, for the scout
//   node scripts/scan-reddit.mjs --all                 # include non-outliers

import { fetchTop, findOutliers, hasCredentials, RedditCredentialError } from "./lib/reddit-api.mjs";

const EXAM_SUBS = {
  pmp: ["pmp", "projectmanagement"],
  "security+": ["CompTIA", "cybersecurity"],
  secplus: ["CompTIA", "cybersecurity"],
  "shrm-cp": ["humanresources"],
  shrm: ["humanresources"],
};

const DEFAULT_SUBS = ["pmp", "CompTIA", "humanresources"];

function parseArgs() {
  const a = process.argv.slice(2);
  const val = (flag) => {
    const i = a.indexOf(flag);
    return i === -1 ? null : a[i + 1];
  };
  const exam = val("--exam");
  const sub = val("--sub");

  let subs = DEFAULT_SUBS;
  if (sub) subs = [sub];
  else if (exam) {
    subs = EXAM_SUBS[exam.toLowerCase()];
    if (!subs) {
      console.error(`Unknown --exam "${exam}". Known: ${Object.keys(EXAM_SUBS).join(", ")}`);
      process.exit(1);
    }
  }

  return { subs, json: a.includes("--json"), all: a.includes("--all") };
}

async function main() {
  const { subs, json, all } = parseArgs();

  if (!hasCredentials()) {
    try {
      await fetchTop("pmp");
    } catch (err) {
      if (err instanceof RedditCredentialError) {
        console.error("❌ Reddit API is not configured.\n");
        console.error(err.message);
        process.exit(1);
      }
      throw err;
    }
  }

  const report = { scannedAt: new Date().toISOString(), window: "week", subreddits: [] };

  for (const sub of subs) {
    let posts;
    try {
      posts = await fetchTop(sub, { t: "week", limit: 100 });
    } catch (err) {
      console.error(`⚠  r/${sub}: ${err.message}`);
      report.subreddits.push({ subreddit: sub, error: err.message });
      continue;
    }

    const { baseline, scoreCut, sampleSize, outliers } = findOutliers(posts);
    report.subreddits.push({
      subreddit: sub,
      sampleSize,
      medianScore: baseline,
      outlierScoreCut: scoreCut,
      outlierCount: outliers.length,
      outliers: outliers.map((o) => ({
        title: o.title,
        score: o.score,
        upvoteRatio: o.upvoteRatio,
        numComments: o.numComments,
        scoreRatio: o.scoreRatio,
        reasons: o.reasons,
        createdIso: o.createdIso,
        permalink: o.permalink,
        flair: o.flair,
        excerpt: o.selftext.slice(0, 400),
      })),
      ...(all ? { allPosts: posts.map((p) => ({ title: p.title, score: p.score, numComments: p.numComments })) } : {}),
    });
  }

  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  for (const s of report.subreddits) {
    if (s.error) {
      console.log(`\nr/${s.subreddit} — ERROR: ${s.error}`);
      continue;
    }
    console.log(
      `\nr/${s.subreddit} — ${s.sampleSize} posts this week · median score ${s.medianScore} · ` +
        `outlier cut ${s.outlierScoreCut} or 50+ comments`
    );
    if (s.outliers.length === 0) {
      console.log("  (no outliers — genuinely quiet week, not a tooling failure)");
      continue;
    }
    for (const o of s.outliers) {
      console.log(`  ▲ ${o.score} pts (${o.scoreRatio}x median) · ${o.numComments} comments · ratio ${o.upvoteRatio}`);
      console.log(`    ${o.title}`);
      console.log(`    ${o.reasons.join(" | ")}`);
      console.log(`    ${o.permalink}`);
    }
  }

  const total = report.subreddits.reduce((n, s) => n + (s.outlierCount || 0), 0);
  console.log(`\n${total} outlier(s) across ${report.subreddits.length} subreddit(s).`);
}

main().catch((err) => {
  console.error("\n❌ Scan failed:", err.message);
  process.exit(1);
});
