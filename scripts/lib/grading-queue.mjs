// Which posted posts the grader owns, and which pass owns each one.
//
// One classifier, shared by scripts/list-ungraded-posts.mjs and its test, so
// the routing rule below cannot drift away from the thing that checks it.
//
// THE RULE: a post counts as GRADED only when `metrics.gradedAt` parses. Not
// when a `metrics` object merely exists.
//
// The difference is load-bearing, and it cost three days. `li-volume-metric`
// was recovered on 2026-08-31 with a hand-entered `{reactions, comments}` and
// no gradedAt. That made it invisible to BOTH passes: the grade pass skipped it
// because `metrics` was truthy, and the regrade pass skipped it because there
// was no gradedAt to measure a milestone against. It was graded on 2026-09-02
// only because a human read the skip line. Any recovery path that writes some
// metrics without grading creates another one, so the test is the timestamp the
// grader itself writes — never the presence of the object.
//
// Every pass is total: a posted post lands in `ready` or in `skipped` with a
// reason, never in neither. A routine that prints "0 ready" looks identical
// whether everything is graded or everything is malformed, so nothing is
// allowed to vanish silently.

// 48h turned out to be far too short on this account, and nothing ever re-read
// a post once it had metrics. Measured 2026-08-12: li-thu-2026-08-07-sponsor-
// scenario was graded at 732 impressions, was 1,220 a day later, and 2,134 two
// days after that — 2.9x growth AFTER its grade was assigned. Grades feed
// grading-lessons.md and that file constrains draft-week-posts, so an
// understated grade propagates into drafting rules.
export const REGRADE_MILESTONE_DAYS = [7, 30];

export const DEFAULT_MIN_AGE_HOURS = 48;

/** ms since epoch of the grader's own timestamp, or null if never graded. */
export function gradedAtMs(post) {
  const t = Date.parse(post?.metrics?.gradedAt ?? '');
  return Number.isFinite(t) ? t : null;
}

/**
 * Split posted posts into { ready, skipped } for one pass.
 *
 * @param {object[]} posts
 * @param {{ now?: number, minAgeHours?: number, regradeMode?: boolean }} opts
 */
export function classifyPosts(posts, opts = {}) {
  const now = opts.now ?? Date.now();
  const minAgeHours = opts.minAgeHours ?? DEFAULT_MIN_AGE_HOURS;
  const regradeMode = !!opts.regradeMode;

  const ready = [];
  const skipped = [];

  for (const p of posts ?? []) {
    if (p.status !== 'posted') continue;

    const graded = gradedAtMs(p);

    if (regradeMode) {
      // Ungraded — including a post carrying partial metrics with no gradedAt.
      // The grade pass owns every one of these.
      if (graded === null) continue;
      if (!p.postedAt) continue; // no timestamp, no milestone to be due for
      if (!p.postUrl) {
        // Must be reported, never silently dropped: a graded post with no URL
        // can never be re-read, and a bare "0 due" would look fine.
        skipped.push({
          id: p.id,
          reason: 'graded but has no postUrl — can never be re-measured; backfill the URL',
        });
        continue;
      }
      const postedMs = Date.parse(p.postedAt);
      if (!Number.isFinite(postedMs)) {
        skipped.push({ id: p.id, reason: `unparseable postedAt "${p.postedAt}"` });
        continue;
      }
      const ageDays = (now - postedMs) / 86_400_000;
      const gradeAgeDays = (graded - postedMs) / 86_400_000;
      // Due when the post has passed a milestone that its last reading predates.
      const due = REGRADE_MILESTONE_DAYS.filter((m) => ageDays >= m && gradeAgeDays < m);
      if (!due.length) continue;
      ready.push({
        id: p.id,
        channel: p.channel,
        postUrl: p.postUrl,
        postedAt: p.postedAt,
        ageHours: Number((ageDays * 24).toFixed(1)),
        milestone: `${Math.max(...due)}d`,
        lastImpressions: p.metrics.impressions ?? null,
        lastGradedAtDays: Number(gradeAgeDays.toFixed(1)),
        hasVideo: !!p.video,
        examFocus: p.examFocus ?? null,
      });
      continue;
    }

    if (graded !== null) continue; // already graded — see regradeMode

    if (!p.postedAt) {
      skipped.push({ id: p.id, reason: 'no postedAt timestamp — cannot tell if it is old enough' });
      continue;
    }
    const ageHours = (now - Date.parse(p.postedAt)) / 3_600_000;
    if (!Number.isFinite(ageHours)) {
      skipped.push({ id: p.id, reason: `unparseable postedAt "${p.postedAt}"` });
      continue;
    }
    if (ageHours < minAgeHours) {
      skipped.push({ id: p.id, reason: `only ${ageHours.toFixed(1)}h old (needs ${minAgeHours}h)` });
      continue;
    }
    if (!p.postUrl) {
      // The routine navigates to postUrl to read analytics. Without it there is
      // nothing to open, and guessing a URL would grade the wrong post.
      skipped.push({ id: p.id, reason: 'no postUrl — nothing for the scraper to open' });
      continue;
    }

    ready.push({
      id: p.id,
      channel: p.channel,
      postUrl: p.postUrl,
      postedAt: p.postedAt,
      ageHours: Number(ageHours.toFixed(1)),
      hasVideo: !!p.video,
      examFocus: p.examFocus ?? null,
      // Partial numbers from a recovery, never graded. Say so: submitting a
      // full read REPLACES them, and a silent overwrite of a hand-entered
      // value is exactly the kind of thing that should be visible.
      partialMetrics: p.metrics ? Object.keys(p.metrics) : null,
    });
  }

  ready.sort((a, b) => b.ageHours - a.ageHours);
  return { ready, skipped };
}
