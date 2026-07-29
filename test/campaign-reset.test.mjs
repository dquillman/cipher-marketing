import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFreshCompetitors,
  buildFreshPosts,
  resetCampaignState,
  validateCampaignStart,
} from "../campaign-reset.mjs";

test("accepts a real ISO calendar date", () => {
  assert.equal(validateCampaignStart("2026-08-03"), "2026-08-03");
});

test("rejects malformed and impossible dates", () => {
  assert.throws(() => validateCampaignStart("08/03/2026"), /YYYY-MM-DD/);
  assert.throws(() => validateCampaignStart("2026-02-30"), /real calendar date/);
});

test("reinitializes campaign data while preserving reusable configuration", () => {
  const original = {
    _meta: { schemaVersion: 1, lastUpdatedBy: "before" },
    campaign: { start: "2026-05-18", activationGate: 25 },
    metrics: { activatedUsersTotal: 7 },
    dailyLog: [{ date: "2026-07-28", entry: "kept" }],
    communityEngagement: { byExam: { PMP: { reddit: [] } } },
  };
  const now = new Date("2026-07-28T18:00:00.000Z");
  const updated = resetCampaignState(original, "2026-08-03", now);

  assert.equal(updated.campaign.start, "2026-08-03");
  assert.equal(updated.campaign.activationGate, 25);
  assert.equal(updated.metrics.activatedUsersTotal, 0);
  assert.deepEqual(updated.dailyLog, []);
  assert.deepEqual(updated.communityEngagement.byExam, original.communityEngagement.byExam);
  assert.equal(updated._meta.schemaVersion, 2);
  assert.equal(updated._meta.lastUpdatedAt, now.toISOString());
  assert.equal(updated._meta.lastUpdatedBy, "full-campaign-reset");
  assert.equal(original.campaign.start, "2026-05-18");
});

test("generates a four-week PMP schedule from the chosen date", () => {
  const result = buildFreshPosts({ benchmarks: { linkedin: { engagementRatePctGoodAtLeast: 2 } } }, "2026-08-03");
  assert.equal(result.posts.length, 12);
  assert.equal(result.posts[0].scheduled, "2026-08-03");
  assert.equal(result.posts.at(-1).scheduled, "2026-08-28");
  assert.ok(result.posts.every((post) => post.status === "draft" && post.examFocus === "PMP"));
  assert.equal(result.benchmarks.linkedin.engagementRatePctGoodAtLeast, 2);
});

test("competitor review corrects stale claims about explanations", () => {
  const result = buildFreshCompetitors();
  const pocketPrep = result.competitors.find((item) => item.id === "pocket-prep");
  assert.match(pocketPrep.primaryStrength, /2,450 PMP questions/);
  assert.doesNotMatch(pocketPrep.knownWeakness, /No answer explanations/i);
});
