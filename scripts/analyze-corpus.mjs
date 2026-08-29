#!/usr/bin/env node
// Corpus-level analysis across ALL graded posts — what actually correlates with
// reach, and which variables are hopelessly tangled with each other.
//
//   node scripts/analyze-corpus.mjs            # human-readable
//   node scripts/analyze-corpus.mjs --json     # for the auto-grade routine
//   node scripts/analyze-corpus.mjs --channel linkedin
//
// Reads Firestore (campaign/posts). Writes nothing.
//
// WHY THIS EXISTS
// The post-performance-grader looks at one post at a time. That is how it
// produced the recommendation attached to the 2026-08-10 D grade — "end with a
// direct, answerable question" — which is under-specified and had already failed
// three times on this account (li-fri-2026-05-15-domains closed on exactly such a
// question and drew zero comments). Nothing in the pipeline ever compared posts
// to each other, so the pattern that actually separated the 2,134-impression post
// from the 238-impression one was invisible to it.
//
// This script does the comparison. It is deliberately blunt: with n in the single
// digits per group, it reports medians and counts and REFUSES to imply
// significance. Its most valuable output is the confound section — when two
// features move together across every post, no split can tell them apart, and
// saying so is the honest result.

import { getDb, credentialHelp } from './lib/firestore-access.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const chIdx = args.indexOf('--channel');
const channelFilter = chIdx === -1 ? null : args[chIdx + 1];

// ---- Feature detection ------------------------------------------------------
// Each returns a boolean for one post. Keep these mechanical and inspectable —
// a feature nobody can verify by eye is a feature nobody should trust.

const FEATURES = {
  // A/B/C/D on their own lines. The reader answers with one character.
  labeledOptions: (c) => (c.match(/^\s*[A-D][.)]\s+\S/gm) || []).length >= 3,
  // Asks for justification, not just an answer. Every substantive comment on the
  // 08-07 post came from this instruction.
  asksForReason: (c) => /\byour reason\b|\band why\b|\bwhy\?|more importantly, your reason/i.test(c),
  // Answer withheld + reveal promised. This is what makes commenting the way to
  // find out.
  // Third-person reveal promises count too. The first version matched only
  // first-person ("I'll share the answer..."), so li-wed-2026-08-19-sme-04 —
  // "The answer and the full elimination on all four options go in this thread
  // tonight" — was scored as NOT withholding, which put a withholding post in
  // the control group and understated the split (found 2026-08-27).
  // Third and fourth misses, same shape (found 2026-08-29): the 08-27 pattern
  // requires a leading article, so both li-frame-test-02 ("Answer and full
  // elimination in the first comment tomorrow morning.") and
  // li-fri-2026-08-21-magnet-02-secplus ("Full elimination on all four options
  // goes in this thread tonight") opened the sentence on a bare noun and were
  // again scored as NOT withholding. The bare-noun form is only safe anchored to
  // a sentence or line start; matching "answer" anywhere would also catch "post
  // your answer in the comments", which ASKS for an answer rather than
  // withholding one. Hence two arms: article-anywhere, bare-noun-at-start.
  // Residual known gap: a line that literally opens "Answer in the comments
  // below" would still false-positive. No post in the corpus does; if one ever
  // does, the flag is wrong and the by-eye spot-check below is what catches it.
  withholdsAnswer: (c) =>
    /I(?: will|'ll) (?:share|post|put)\b[^.]*\b(?:pattern|answer|reasoning)\b|after the discussion|once the discussion/i.test(c) ||
    /\b(?:the answer|the reasoning|the pattern|the full elimination|the breakdown)\b[^.]{0,120}?\b(?:thread|comments?|first comment)\b/i.test(c) ||
    /(?:^|[.!?]\s|\n)\s*(?:answer|reasoning|full elimination|breakdown)\b[^.]{0,120}?\b(?:thread|comments?|first comment)\b/im.test(c),
  // Any question mark at all — the naive reading of the grader's advice, kept
  // here specifically so the report can show it does NOT separate the groups.
  anyQuestionMark: (c) => c.includes('?'),
  // A CTA in the body is a CTA in the body whether or not it carries a scheme.
  // The first version of this checked only /https?:\/\// and therefore scored
  // li-mon-2026-05-11-launch and li-wed-2026-05-13-trap as having NO body link —
  // both closed on a bare "cipherexam.com/lp/pmp?utm_source=..." with no
  // https://. That mislabelled 2 of the 5 body-link posts and computed the whole
  // split on the wrong groups. Match a scheme OR any bare domain followed by a
  // path, which is what a reader and the algorithm both see as a link.
  urlInBody: (c) => /https?:\/\//.test(c) || /(?:^|[\s(])(?:www\.)?[a-z0-9][a-z0-9-]*\.(?:com|io|app|co|net|org)\//im.test(c),
  // Fifth miss of the same shape, found 2026-08-29 by hand-labelling all 15
  // posts blind. This matched a percentage or an explicit "on <Month> <day>",
  // and so read two openers that lead on a date as plain prose:
  //   "Cert prep tools haven't changed since 2010."                 (bare year)
  //   "CompTIA is flipping Security+ ... around October."           (month, no day)
  // Both are the same move as "The PMP exam changed on July 9, 2026", which it
  // already caught. A 4-digit year and a bare month name now count.
  // Deliberately NOT counted: relative time ("Last week", "Two days before a
  // release") — those openers were hand-labelled false and a reader does not
  // read them as leading on a statistic.
  datedStatOpener: (c) => {
    const first = (c.split('\n').find((l) => l.trim()) || '');
    return /\b\d{1,3}%/.test(first)
      || /\b(?:19|20)\d{2}\b/.test(first)
      || /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(first);
  },
};

// The full gate = all three load-bearing mechanics shipping together.
const isGated = (f) => f.labeledOptions && f.asksForReason && f.withholdsAnswer;

const median = (xs) => {
  const s = xs.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

// postedAt is the ONLY trustworthy send time. scheduledTimeLocal records intent
// and says a default slot time on every post regardless of what actually happened.
const mtHour = (iso) => {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  // Hour in the campaign's zone. Central since 2026-08-22; a real zone
  // lookup so historical posts still bucket correctly across DST.
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false }).format(new Date(t)));
};

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`FAIL — could not authenticate: ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const posts = (await db.collection('campaign').doc('posts').get()).data()?.posts ?? [];

const rows = [];
for (const p of posts) {
  if (p.status !== 'posted' || !p.metrics) continue;
  if (channelFilter && p.channel !== channelFilter) continue;
  const copy = p.copy || '';
  const f = Object.fromEntries(Object.entries(FEATURES).map(([k, fn]) => [k, fn(copy)]));
  const hour = mtHour(p.postedAt);
  rows.push({
    id: p.id,
    channel: p.channel,
    grade: p.grade ?? null,
    impressions: p.metrics.impressions ?? null,
    membersReached: p.metrics.membersReached ?? null,
    comments: p.metrics.comments ?? null,
    hourMT: hour,
    slot: hour === null ? null : hour < 12 ? 'morning' : hour < 17 ? 'midday' : 'evening',
    gated: isGated(f),
    ...f,
  });
}

rows.sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0));

// ---- Splits -----------------------------------------------------------------
function split(label, predicate) {
  const yes = rows.filter(predicate);
  const no = rows.filter((r) => !predicate(r));
  return {
    feature: label,
    withN: yes.length,
    withoutN: no.length,
    medianWith: median(yes.map((r) => r.impressions)),
    medianWithout: median(no.map((r) => r.impressions)),
    commentsWith: yes.reduce((s, r) => s + (r.comments || 0), 0),
    commentsWithout: no.reduce((s, r) => s + (r.comments || 0), 0),
  };
}

const splits = [
  split('full comment-gate (all 3 mechanics)', (r) => r.gated),
  split('labeled A-D options', (r) => r.labeledOptions),
  split('asks for the REASON', (r) => r.asksForReason),
  split('withholds the answer', (r) => r.withholdsAnswer),
  split('any question mark (naive test)', (r) => r.anyQuestionMark),
  split('URL in post body', (r) => r.urlInBody),
  split('dated-stat opener', (r) => r.datedStatOpener),
  split('sent in the evening (>=17:00 CT)', (r) => r.slot === 'evening'),
];

// ---- Confounds --------------------------------------------------------------
// Two features are tangled when they agree on every post that has either. No
// split can separate them, and any lesson naming one is equally a lesson about
// the other. Naming this is the whole point — it is exactly what nobody noticed
// when format and time-of-day changed on the same post on 2026-08-07.
const keys = [...Object.keys(FEATURES), 'gated', 'isEvening'];
const valueOf = (r, k) => (k === 'isEvening' ? r.slot === 'evening' : r[k]);
const confounds = [];
const untestable = [];
for (let i = 0; i < keys.length; i++) {
  for (let j = i + 1; j < keys.length; j++) {
    const a = keys[i], b = keys[j];
    const relevant = rows.filter((r) => valueOf(r, a) || valueOf(r, b));
    if (!relevant.length) continue;
    if (!relevant.every((r) => valueOf(r, a) === valueOf(r, b))) continue;
    // Identical wherever either appears. With only one such post the pair is
    // perfectly tangled AND unsplittable — report it as untestable rather than
    // letting it fall through into a clean "none detected", which would read as
    // an all-clear when it is really an absence of evidence.
    (relevant.length < 2 ? untestable : confounds).push({ a, b, acrossPosts: relevant.length });
  }
}

const result = { postsAnalyzed: rows.length, channel: channelFilter ?? 'all', rows, splits, confounds };

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(`\nCorpus analysis — ${rows.length} graded posts${channelFilter ? ` (${channelFilter})` : ''}\n`);
console.log('  impr | reach | cmt | grade | slot     | gate | id');
for (const r of rows) {
  console.log(
    [
      String(r.impressions ?? '?').padStart(6),
      String(r.membersReached ?? '?').padStart(5),
      String(r.comments ?? '?').padStart(4),
      (r.grade ?? '?').padEnd(5),
      (r.slot ?? '?').padEnd(8),
      r.gated ? 'GATE' : '    ',
      r.id,
    ].join(' | '),
  );
}

console.log(`\n${'─'.repeat(78)}\nFeature splits — median impressions\n`);
for (const s of splits) {
  if (!s.withN || !s.withoutN) {
    console.log(`  ${s.feature.padEnd(38)} — no contrast (${s.withN} with / ${s.withoutN} without)`);
    continue;
  }
  const dir = s.medianWith > s.medianWithout ? '↑' : s.medianWith < s.medianWithout ? '↓' : '=';
  console.log(
    `  ${s.feature.padEnd(38)} ${dir} ${String(s.medianWith).padStart(5)} (n=${s.withN})  vs  ${String(s.medianWithout).padStart(5)} (n=${s.withoutN})   comments ${s.commentsWith} vs ${s.commentsWithout}`,
  );
}

console.log(`\n${'─'.repeat(78)}\nConfounded features — these move together, no split can separate them\n`);
if (!confounds.length) {
  console.log('  none separable-but-tangled');
} else {
  for (const c of confounds) console.log(`  ${c.a}  ==  ${c.b}   (identical across ${c.acrossPosts} posts)`);
  console.log('\n  A lesson naming one of these is equally a lesson about the other.');
  console.log('  To separate them, ship a post that varies ONE and holds the other constant.');
}

if (untestable.length) {
  const single = [...new Set(untestable.flatMap((c) => [c.a, c.b]))];
  console.log(`\n  UNTESTABLE — only ONE post carries any of: ${single.join(', ')}`);
  console.log('  These features are perfectly correlated because they have all shipped exactly');
  console.log('  once, together. The corpus CANNOT attribute that post\'s result to any one of');
  console.log('  them. This is an absence of evidence, not an all-clear — a second post');
  console.log('  carrying some-but-not-all of them is what makes the question answerable.');
}

console.log(`\n${'─'.repeat(78)}`);
console.log('n is small. These are medians and counts, not significance tests.');
console.log('Treat every split above as a hypothesis to test, never as a proven rule.\n');
