import test from "node:test";
import assert from "node:assert/strict";
import { classifyPosts, gradedAtMs } from "../scripts/lib/grading-queue.mjs";

// Fixed clock so ages are exact and the suite cannot rot.
const NOW = Date.parse("2026-09-02T12:00:00.000Z");
const POSTED = "2026-08-20T12:00:00.000Z"; // 13 days before NOW
const opts = (extra) => ({ now: NOW, ...extra });

const base = {
  id: "p",
  status: "posted",
  channel: "linkedin",
  postedAt: POSTED,
  postUrl: "https://example.test/p",
};

const ids = (rows) => rows.map((r) => r.id);

test("gradedAt is the test for graded, not the presence of a metrics object", () => {
  assert.equal(gradedAtMs({ metrics: { reactions: 1 } }), null);
  assert.equal(gradedAtMs({ metrics: {} }), null);
  assert.equal(gradedAtMs({}), null);
  assert.equal(
    gradedAtMs({ metrics: { gradedAt: "2026-08-22T12:00:00.000Z" } }),
    Date.parse("2026-08-22T12:00:00.000Z"),
  );
});

// The regression this file exists for. li-volume-metric was recovered with a
// hand-entered {reactions, comments} and no gradedAt, which made it invisible
// to BOTH passes for three days.
test("a post with partial metrics and no gradedAt goes to the GRADE pass", () => {
  const posts = [{ ...base, id: "trap", metrics: { reactions: 1, comments: 0 } }];

  const grade = classifyPosts(posts, opts());
  assert.deepEqual(ids(grade.ready), ["trap"]);

  const regrade = classifyPosts(posts, opts({ regradeMode: true }));
  assert.deepEqual(regrade.ready, []);
  assert.deepEqual(regrade.skipped, []);
});

test("an empty metrics object is also ungraded, not graded", () => {
  const posts = [{ ...base, id: "empty", metrics: {} }];
  assert.deepEqual(ids(classifyPosts(posts, opts()).ready), ["empty"]);
});

test("partial metrics are named on the ready row so the overwrite is visible", () => {
  const posts = [
    { ...base, id: "trap", metrics: { reactions: 1, comments: 0 } },
    { ...base, id: "clean" },
  ];
  const { ready } = classifyPosts(posts, opts());
  const byId = Object.fromEntries(ready.map((r) => [r.id, r]));
  assert.deepEqual(byId.trap.partialMetrics, ["reactions", "comments"]);
  assert.equal(byId.clean.partialMetrics, null);
});

// The invariant is about UNGRADED posts. A graded post with no milestone
// outstanding correctly appears in neither list — there is nothing to do with
// it — and asserting otherwise would be asserting busywork.
test("no UNGRADED posted post ever falls through both passes", () => {
  const posts = [
    { ...base, id: "never-touched" },
    { ...base, id: "partial", metrics: { reactions: 1 } },
    { ...base, id: "empty-obj", metrics: {} },
    { ...base, id: "graded-due", metrics: { impressions: 100, gradedAt: "2026-08-22T12:00:00.000Z" } },
    { ...base, id: "graded-fresh", metrics: { impressions: 100, gradedAt: "2026-09-01T12:00:00.000Z" } },
    { ...base, id: "no-url", postUrl: undefined },
    { ...base, id: "no-url-graded", postUrl: undefined, metrics: { gradedAt: "2026-08-22T12:00:00.000Z" } },
    { ...base, id: "too-young", postedAt: "2026-09-02T00:00:00.000Z" },
  ];

  const grade = classifyPosts(posts, opts());
  const regrade = classifyPosts(posts, opts({ regradeMode: true }));

  const accounted = new Set([
    ...ids(grade.ready),
    ...grade.skipped.map((s) => s.id),
    ...ids(regrade.ready),
    ...regrade.skipped.map((s) => s.id),
  ]);
  for (const p of posts) {
    if (gradedAtMs(p) !== null) continue; // graded; see the milestone checks below
    assert.ok(accounted.has(p.id), `${p.id} fell through both passes`);
  }

  // A graded post is allowed to be silent, but only when no milestone is due.
  assert.ok(!accounted.has("graded-fresh"), "read after 7d, nothing outstanding");

  // And each lands in the pass that can actually act on it.
  assert.deepEqual(ids(grade.ready).sort(), ["empty-obj", "never-touched", "partial"]);
  assert.deepEqual(ids(regrade.ready), ["graded-due"]);

});

test("a graded post with no postUrl is reported, never silently dropped", () => {
  const posts = [
    { ...base, id: "no-url-graded", postUrl: undefined, metrics: { gradedAt: "2026-08-22T12:00:00.000Z" } },
  ];
  const { ready, skipped } = classifyPosts(posts, opts({ regradeMode: true }));
  assert.deepEqual(ready, []);
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].reason, /never be re-measured/);
});

test("the 48h floor holds and is reported with its age", () => {
  const posts = [{ ...base, id: "young", postedAt: "2026-09-02T00:00:00.000Z" }];
  const { ready, skipped } = classifyPosts(posts, opts());
  assert.deepEqual(ready, []);
  assert.match(skipped[0].reason, /12\.0h old \(needs 48h\)/);
});

test("only posted posts are considered", () => {
  const posts = [
    { ...base, id: "draft", status: "draft" },
    { ...base, id: "scheduled", status: "scheduled" },
  ];
  assert.deepEqual(classifyPosts(posts, opts()).ready, []);
  assert.deepEqual(classifyPosts(posts, opts()).skipped, []);
});

test("a 30d milestone is due even when the 7d read was taken", () => {
  const posts = [
    {
      ...base,
      id: "old",
      postedAt: "2026-07-01T12:00:00.000Z",
      metrics: { impressions: 500, gradedAt: "2026-07-08T12:00:00.000Z" },
    },
  ];
  const { ready } = classifyPosts(posts, opts({ regradeMode: true }));
  assert.equal(ready.length, 1);
  assert.equal(ready[0].milestone, "30d");
});

test("unparseable postedAt is reported in both passes rather than crashing", () => {
  const grade = classifyPosts([{ ...base, id: "bad" , postedAt: "not-a-date" }], opts());
  assert.match(grade.skipped[0].reason, /unparseable postedAt/);

  const regrade = classifyPosts(
    [{ ...base, id: "bad", postedAt: "not-a-date", metrics: { gradedAt: "2026-08-22T12:00:00.000Z" } }],
    opts({ regradeMode: true }),
  );
  assert.match(regrade.skipped[0].reason, /unparseable postedAt/);
});
