// Where a post's link is allowed to live, and whether GA4 can ever see it.
//
// One rule, shared by the deploy gate (scripts/check-post-links.mjs) and the
// paste path (scripts/post-copy.mjs), so the two cannot drift apart.
//
// Rule 1 — no URL in a LinkedIn post BODY. Measured on the 18 graded LinkedIn
// posts (scripts/analyze-corpus.mjs --channel linkedin, 2026-09-01): median
// 127 impressions with a body URL (n=7) vs 241 without (n=11), and 0 comments
// vs 31. Observational, not an experiment — the body-URL group is mostly older
// copy, and 19 of those 31 comments are one post — so this is the default, not
// a law. LinkedIn autolinks a bare "cipherexam.com" too, so dropping the
// https:// does not dodge it; it only breaks attribution as well. X is exempt:
// it has no first-comment culture, so its link belongs in the body.
//
// Rule 2 — every post needs a UTM-tagged `cta`. scripts/pull-ga4-clicks.mjs
// resolves post.cta against GA4; with cta null it returns "cannot attribute"
// and the post gets graded blind on impressions alone. That is how
// li-cognitive-levels earned a D on 2026-09-01 with linkClicks and
// trialSignupsAttributed both null.
//
// The link goes in the first comment. `cta` carries the tagged URL GA4 matches
// on, even when the comment shows a /go/ short link.

// A full URL, or a bare domain LinkedIn will autolink anyway.
export const URL_IN_BODY =
  /(https?:\/\/\S+|\b(?:[a-z0-9-]+\.)+(?:com|io|co|ai|net|org|app|dev|ly|me)\b(?:\/\S*)?)/i;

const BODY_MUST_BE_LINKLESS = new Set(["linkedin"]);

export function ctaProblem(cta) {
  if (!cta) return "has no cta — GA4 can never attribute clicks or signups";
  // lnkd.in wraps a tagged destination we cannot read without a network call.
  // resolveUtms() unwraps it at grade time; trust it here rather than fetch.
  if (/^https?:\/\/lnkd\.in\//i.test(cta)) return null;
  const missing = ["utm_campaign", "utm_content"].filter((k) => !cta.includes(k + "="));
  if (missing.length) return `cta is missing ${missing.join(" and ")} — GA4 cannot attribute it`;
  return null;
}

// Returns [] for a clean post, or one string per broken rule.
export function linkProblems(post) {
  const problems = [];
  const copy = post.copy || "";
  if (BODY_MUST_BE_LINKLESS.has(post.channel) && URL_IN_BODY.test(copy)) {
    problems.push(
      `body contains a link ("${copy.match(URL_IN_BODY)[1]}") — it belongs in the first comment`,
    );
  }
  const cta = ctaProblem(post.cta);
  if (cta) problems.push(cta);
  return problems;
}

// Placeholder rows the drafting skill has not filled in yet. They owe copy and
// a cta in the same pass; flagging them as violations is noise, not a finding.
export function isStub(post) {
  return (post.copy || "").trimStart().toUpperCase().startsWith("[TO DRAFT");
}

export const FIX_HINT =
  "Body carries the offer, never the URL. Put the link in firstComment,\n" +
  "and set cta to the utm_campaign + utm_content URL GA4 matches on.\n" +
  "Evidence: analyze-corpus.mjs --channel linkedin — body URL, median 127 impressions vs 241.";
