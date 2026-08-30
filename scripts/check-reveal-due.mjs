#!/usr/bin/env node
// Decides which live posts still owe their promised answer reveal.
//
// WHY THIS IS CODE AND NOT PROSE
// ------------------------------
// The `cipher-reveal-due` scheduled task used to carry this predicate as a
// bullet list, and every run re-derived it by hand. One of those bullets read
// "firstCommentPostedAt is earlier than the post's own postedAt date", which
// each run implemented as a STRING compare of a day stamp:
//
//     firstCommentPostedAt  <  postedAt.slice(0, 10)
//
// `firstCommentPostedAt` was written as a CENTRAL TIME day; `postedAt` is UTC.
// Dave's standing LinkedIn slot is 19:20 CT, which is past midnight UTC all
// year round - so a post published the evening of Aug 28 CT carries
// postedAt 2026-08-29T00:21Z, and a correctly stamped same-evening reveal
// ("2026-08-28") compares as EARLIER than its own post. The task then declared
// a reveal owed that was already live and pushed a false alarm to Dave's
// phone. 6 of 6 evening-slot posts cross that boundary; 0 of 8 morning posts
// do, which is why it went unnoticed for so long.
//
// A day-granular compare also cannot see a reveal that went up LATE - and
// "Frame test A's reveal went up a DAY late" is the reason the task exists at
// all. li-frame-test-01 passed the old check clean while being ~28h late.
//
// So: this script owns the predicate. It compares Date OBJECTS, tolerates both
// stored stamp formats, and measures lateness in hours instead of days.
//
// Stored formats it accepts for `firstCommentPostedAt`:
//   - full ISO instant   "2026-08-29T00:31:00.000Z"   (what we write now)
//   - legacy day stamp   "2026-08-28"                  (Central Time day)
// A legacy day stamp is resolved to END OF DAY Central, so an old record can
// never spuriously read as predating its own post.
//
// Usage:
//   node scripts/check-reveal-due.mjs          owed posts as JSON on stdout
//   node scripts/check-reveal-due.mjs --all    every evaluated post, owed or not
//
// stdout is always a JSON array. stderr carries the human summary.

import { getDb, credentialHelp } from "./lib/firestore-access.mjs";

// How long after publishing a reveal may land before it counts as late.
// Dave's rule (2026-08-28): the answer comment goes up within ~60 seconds.
// Two hours is the same floor the scheduled task uses before it will look at a
// post at all, so a reveal inside it is never reported as late.
const REVEAL_SLA_HOURS = 2;

// SKILL.md: "Older posts still on file carry the old 'in the first comment
// tomorrow morning' wording; judge those against what their own copy promised,
// not against the new rule." A post that said "tomorrow morning" and delivered
// the next morning kept its promise, so it gets an overnight allowance instead
// of the 2h SLA. Same regex check-comment-promise.mjs uses to BLOCK that
// wording in anything still unposted.
const LEGACY_SLA_HOURS = 24;
const DELAYED_PROMISE =
  /tomorrow|next morning|in the morning|later today|later tonight|within 24 hours|by morning/i;

const CAMPAIGN_TZ = "America/Chicago";

const showAll = process.argv.slice(2).includes("--all");

// Offset (ms) between the wall clock in `tz` and UTC at instant `ts`.
function tzOffsetMs(ts, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(ts));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const hour = p.hour === "24" ? "00" : p.hour;
  return Date.UTC(+p.year, +p.month - 1, +p.day, +hour, +p.minute, +p.second) - ts;
}

// A wall-clock time in `tz` -> the UTC instant it names. Two passes so a value
// that lands near a DST switch resolves against its own offset, not the offset
// of the naive UTC guess.
export function zonedToUtc(y, mo, d, h, mi, s, ms, tz) {
  const base = Date.UTC(y, mo - 1, d, h, mi, s, ms);
  let ts = base - tzOffsetMs(base, tz);
  ts = base - tzOffsetMs(ts, tz);
  return new Date(ts);
}

// Parse whatever is sitting in firstCommentPostedAt into a WINDOW of possible
// instants. A full ISO stamp collapses to a point; a legacy day stamp spans
// the whole Central day, because the hour was simply never recorded.
//
// Both ends matter. Reading a day stamp as midnight recreates the exact bug
// this file exists for. Reading it as end-of-day instead manufactures up to
// 24h of lateness that never happened - which would push a false "reveal owed"
// alarm at Dave's phone just as surely, only from the other direction. So keep
// both and let the caller pick the end that suits the question: the LATEST for
// "could this have been late", the EARLIEST for "can I prove it was".
//
// Returns { earliest: Date, latest: Date, format: "iso" | "legacy-day" } or null.
export function parseRevealStamp(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, mo, d] = trimmed.split("-").map(Number);
    return {
      earliest: zonedToUtc(y, mo, d, 0, 0, 0, 0, CAMPAIGN_TZ),
      latest: zonedToUtc(y, mo, d, 23, 59, 59, 999, CAMPAIGN_TZ),
      format: "legacy-day",
    };
  }
  const at = new Date(trimmed);
  if (Number.isNaN(at.getTime())) return null;
  return { earliest: at, latest: at, format: "iso" };
}

// The scheduled task's step-1 gate: does this post PROMISE a reveal?
// SKILL.md words it as "its copy mentions the first comment"; card.gated is the
// structured expression of the same intent, so either counts.
function isGated(post) {
  if (post.card && post.card.gated === true) return true;
  return /first comment/i.test(post.copy || "");
}

// Copy that promises a reveal without using the words "first comment" - how
// li-frame-test-01 phrased it. Outside the gate the task acts on, but worth
// showing under --all rather than pretending it does not exist.
const LOOSE_PROMISE = /in this thread|in the comments/i;

let db;
try {
  db = await getDb();
} catch (err) {
  console.error(`x  ${err.message}`);
  console.error(credentialHelp());
  process.exit(1);
}

const snap = await db.doc("campaign/posts").get();
if (!snap.exists) {
  console.error("x  campaign/posts does not exist in Firestore");
  process.exit(1);
}

const posts = Array.isArray((snap.data() || {}).posts) ? snap.data().posts : [];
const now = Date.now();
const rows = [];

for (const post of posts) {
  if (post.status !== "posted") continue;
  if (!post.postUrl) continue;
  if (!post.firstComment) continue;

  const postedAt = post.postedAt ? new Date(post.postedAt) : null;
  if (!postedAt || Number.isNaN(postedAt.getTime())) continue;

  const ageHours = (now - postedAt.getTime()) / 3600000;
  const gate = isGated(post);
  const legacyPromise = DELAYED_PROMISE.test(post.copy || "");
  const slaHours = legacyPromise ? LEGACY_SLA_HOURS : REVEAL_SLA_HOURS;
  const reveal = parseRevealStamp(post.firstCommentPostedAt);
  const hoursAfter = (d) => (d.getTime() - postedAt.getTime()) / 3600000;
  // The soonest the reveal can have gone up is bounded below by the post
  // itself - a comment cannot precede its own post.
  const lateHours = reveal ? Math.max(hoursAfter(reveal.earliest), 0) : null;
  const lateHoursMax = reveal ? hoursAfter(reveal.latest) : null;
  const exact = reveal ? reveal.format === "iso" : false;
  const window = !reveal
    ? "never"
    : exact
      ? `${lateHours.toFixed(1)}h`
      : `between ${lateHours.toFixed(1)}h and ${Math.max(lateHoursMax, 0).toFixed(1)}h`;

  // TWO DIFFERENT THINGS, deliberately kept apart.
  //
  //   owed = the reveal has NOT been delivered. This is the only state that
  //          earns a push, because step 3's action is to send Dave paste-ready
  //          text. Sending him text that is already live on the post is the
  //          same false alarm this whole script was written to stop.
  //
  //   late = a reveal exists but landed past the SLA. Real, worth seeing, and
  //          never push-worthy - there is nothing left to paste. Before
  //          2026-08-29 this was invisible: the day-granular string compare
  //          could not measure hours, and "Frame test A went up a DAY late" is
  //          the reason the task exists at all.
  let owed = false;
  let late = false;
  let reason;

  if (!reveal) {
    reason = "no firstCommentPostedAt recorded - the reveal was never delivered";
    owed = true;
  } else if (lateHoursMax < 0) {
    // Even the LAST instant the stamp could mean is before the post. Nothing
    // resolves that - the record is wrong, so we cannot claim it was delivered.
    reason = `reveal ${post.firstCommentPostedAt} precedes postedAt entirely - the stamp is wrong`;
    owed = true;
  } else if (lateHours > slaHours) {
    // Uses the EARLIEST possible instant, so lateness is provable, not inferred.
    reason =
      `reveal landed ${window} after the post, SLA is ${slaHours}h` +
      `${legacyPromise ? ' (its own copy said "tomorrow morning")' : ""}`;
    late = true;
  } else if (lateHoursMax > slaHours) {
    reason =
      `reveal landed ${window} after the post - a day-only stamp cannot say ` +
      `whether it beat the ${slaHours}h SLA`;
  } else {
    reason =
      `reveal landed ${window} after the post` +
      `${legacyPromise ? ` - within the ${slaHours}h its own copy promised` : ""}`;
  }

  // Too fresh to judge either way.
  if (ageHours < slaHours) {
    owed = false;
    late = false;
    reason = `posted ${ageHours.toFixed(1)}h ago - inside the ${slaHours}h floor, too early to judge`;
  }

  // `gate` (copy literally says "first comment") used to VETO the owed decision.
  // That is one layer deeper than the timezone bug it replaced: sme-04 promised
  // "the answer and the full elimination on all four options go in this thread
  // tonight" - never the words "first comment" - so it was filed out of scope and
  // would have stayed silent forever had Dave not posted it anyway. A promise is a
  // promise however it is worded (found 2026-08-29 by firing the task for real).
  //
  // So only a post that promised NOTHING drops out. `gate` survives as the
  // strict/high-confidence tier in the output, never as a veto.
  const promised = gate || LOOSE_PROMISE.test(post.copy || "");
  if (!promised) {
    owed = false;
    late = false;
    reason = `${reason} (copy promises no reveal at all)`;
  } else if (!gate && (owed || late)) {
    reason = `${reason} (loose promise: commits to a reveal without saying "first comment")`;
  }

  rows.push({
    id: post.id,
    channel: post.channel || null,
    postUrl: post.postUrl,
    postedAt: postedAt.toISOString(),
    firstCommentPostedAt: post.firstCommentPostedAt || null,
    stampFormat: reveal ? reveal.format : null,
    // lateHours is the provable floor. For a full ISO stamp it is exact; for a
    // legacy day stamp the truth is somewhere up to lateHoursMax.
    lateHours: lateHours === null ? null : Number(lateHours.toFixed(2)),
    lateHoursMax: lateHoursMax === null ? null : Number(Math.max(lateHoursMax, 0).toFixed(2)),
    lateHoursExact: exact,
    slaHours,
    gate,
    loosePromise: LOOSE_PROMISE.test(post.copy || ""),
    owed,
    late,
    reason,
  });
}

const owedRows = rows.filter((r) => r.owed);
process.stdout.write(JSON.stringify(showAll ? rows : owedRows, null, 2) + "\n");

// The label is a retrospective read, so it uses the UPPER bound: a day-only
// stamp that COULD hide a late reveal should catch the eye under --all, even
// though the owed decision above refuses to act on the same number.
const label = (r) => {
  if (r.owed) return "OWED";
  if (r.late) return "LATE";
  if (r.lateHours === null) return "----";
  if (r.lateHoursMax > r.slaHours) return r.lateHoursExact ? "LATE" : "LATE?";
  return "ok";
};

console.error("");
console.error(
  `reveal check  ${rows.length} posted post(s) carrying a reveal, ` +
  `${owedRows.length} owed  (SLA ${REVEAL_SLA_HOURS}h)`,
);
for (const r of showAll ? rows : owedRows) {
  console.error(`  ${label(r).padEnd(5)}  ${r.id.padEnd(35)} ${r.reason}`);
}
if (!owedRows.length) console.error("  no reveal owed");
const legacy = rows.filter((r) => r.stampFormat === "legacy-day");
if (showAll && legacy.length) {
  console.error(
    `\n  ${legacy.length} legacy day-only stamp(s), read as a full ${CAMPAIGN_TZ} day: ` +
    legacy.map((r) => r.id).join(", "),
  );
}
console.error("");
