/*
 * Canonical Cipher Marketing page knowledge.
 *
 * This is the one source used by the in-app Brad/HAL/JARVIS rail and by the
 * local Cipher Marketing HAL expert. Keep the object valid JSON so hal.py can
 * parse it without executing JavaScript.
 */
(function () {
  "use strict";

  window.CIPHER_PAGE_KNOWLEDGE = {
    "today": {
      "label": "Today",
      "route": "today",
      "aliases": ["home", "daily plan", "daily command center", "right now"],
      "purpose": "Your daily command center. It reduces the campaign to the next decision, this week's review load, today's sequence, and the few numbers that need attention.",
      "sections": ["Right now", "This week's priorities", "Today's sequence", "Reports", "Today's tasks", "KPI snapshot", "Creative", "Trend Scout", "Scratchpad", "Daily log", "Recap and preview", "Paid-spend gate"],
      "steps": ["Read the Right now card", "Complete Today's sequence from top to bottom", "Use the remaining sections only when the sequence points to them"],
      "start": "Do the action in the Right now card before reading the rest of the page.",
      "terms": ["Right now = the single current priority", "Paid-spend gate = the activation threshold required before advertising"],
      "watchFor": "This page is intentionally comprehensive, but most of it is reference material. Do not treat every card as a task for today.",
      "related": ["Create", "Publish", "Results"]
    },
    "posts": {
      "label": "Create",
      "route": "posts",
      "aliases": ["posts", "drafts", "create posts", "manage posts", "draft weeks"],
      "purpose": "Create, review, revise, and approve campaign posts. Drafts are grouped by dated publishing week so you can work on one week at a time.",
      "sections": ["Drafts by week", "Posted awaiting metrics", "Graded posts"],
      "steps": ["Open the earliest week with pending drafts", "Review one draft and its exact date, exam, channel, and hook", "Use Ask Brad to revise if needed, or approve it when the copy is ready"],
      "start": "Open the earliest week with pending drafts and review only its first draft.",
      "terms": ["Draft = editable copy not yet approved", "Approved = ready for the Publish page", "Posted awaiting metrics = live, but not yet graded", "Graded = performance data has been recorded"],
      "watchFor": "Ask Brad to revise is post-specific. State what should change, then approve the revised copy before publishing.",
      "related": ["Today", "Publish", "Results"]
    },
    "schedule": {
      "label": "Publish",
      "route": "schedule",
      "aliases": ["schedule", "publishing", "calendar", "post queue"],
      "purpose": "Turn approved drafts into live posts, attach any required video, and save the live URL so performance can be measured later.",
      "sections": ["Topic cooldown", "Scheduled post cards", "Copy and publish controls", "Live URL and posted status"],
      "steps": ["Find the next approved post that is due", "Copy its text and publish it on the named channel", "Paste the live URL and choose Mark Posted"],
      "start": "Open the next approved post due for publication. Ignore later weeks until that post is complete.",
      "terms": ["Topic cooldown = spacing that prevents repetitive themes", "Mark Posted = records the live post and moves it toward metric collection"],
      "watchFor": "A draft must be approved before it is ready to publish. Saving the live URL is required for later grading.",
      "related": ["Create", "Results"]
    },
    "dashboard": {
      "label": "Results",
      "route": "dashboard",
      "aliases": ["dashboard", "performance", "metrics", "analytics", "results"],
      "purpose": "See campaign performance, conversion health, activation progress, blockers, and links to detailed diagnostic tools.",
      "sections": ["KPI summary", "Tier 1 clusters", "Week at a glance", "Activation target", "Blockers", "Daily log", "Quick links"],
      "steps": ["Read the highest-priority blocker", "Check activation progress and the weakest KPI", "Enter post metrics 24 to 48 hours after publishing"],
      "start": "Resolve the highest-priority blocker before trying to optimize a healthy metric.",
      "terms": ["Activated user = a user who selected an exam and answered at least 10 questions", "KPI = a result used to judge campaign health"],
      "watchFor": "Results are only as current as their displayed update date and recorded post metrics.",
      "related": ["Funnel Diagnostic", "Activation Sprint", "Create"]
    },
    "strategy": {
      "label": "Strategy",
      "route": "strategy",
      "aliases": ["campaign strategy", "plan", "priorities", "exam tiers"],
      "purpose": "Explain why the campaign targets each exam, how budget and effort are allocated, which KPIs matter, and what evidence permits scaling.",
      "sections": ["Exam scoring matrix", "Tier rationale", "Budget", "Four-week calendar", "KPIs", "Scaling triggers", "Anti-patterns"],
      "steps": ["Find the decision you are trying to make", "Read only the matching matrix, KPI, budget, or scaling section", "Apply the stated threshold instead of changing direction from one anecdote"],
      "start": "Start with the exam scoring matrix when deciding what to market; start with scaling triggers when deciding whether to spend.",
      "terms": ["Tier = campaign priority based on opportunity and readiness", "Scaling trigger = measurable evidence required before increasing spend or scope"],
      "watchFor": "This is a decision reference, not a daily checklist.",
      "related": ["Results", "Competitors", "Funnel Diagnostic"]
    },
    "content": {
      "label": "Content",
      "route": "content",
      "aliases": ["content library", "library", "emails", "social content", "cornerstone"],
      "purpose": "Store reusable campaign assets: cornerstone content, SEO metadata, social copy, outreach, and the onboarding email sequence.",
      "sections": ["Cornerstone blog", "SEO metadata", "Social posts", "Outreach", "Seven-day email sequence"],
      "steps": ["Choose the asset type and channel you need", "Open the relevant content section", "Copy or adapt the asset while preserving the verified product promise"],
      "start": "Decide whether you need a social post, article, outreach message, or email before opening a section.",
      "terms": ["Cornerstone content = the main long-form resource reused across channels", "Sequence = ordered emails sent over several days"],
      "watchFor": "Library content is a source asset, not proof that it has been scheduled or published.",
      "related": ["Create", "Brand Voice", "Landing Pages"]
    },
    "landing": {
      "label": "Landing Pages",
      "route": "landing",
      "aliases": ["landing", "landing page drafts", "lp drafts", "landing pages"],
      "purpose": "Review draft campaign landing pages for each exam, including positioning, proof, pricing, FAQs, and calls to action.",
      "sections": ["PMP draft", "Security+ draft", "SHRM-CP draft", "Metadata", "Hero", "Problem", "Solution", "Proof widget", "Pricing", "FAQ", "Call to action"],
      "steps": ["Choose the landing page for the active exam", "Review the promise, proof, and objection handling", "Confirm pricing and the call to action before engineering deploys it"],
      "start": "Open the draft for the exam currently being marketed and review its hero promise first.",
      "terms": ["Hero = the first screen and primary promise", "CTA = the action the visitor is asked to take", "LP = landing page"],
      "watchFor": "These are drafts inside the marketing console; they are not evidence that the public CipherExam landing page is live.",
      "related": ["Engineering", "Brand Voice", "Content"]
    },
    "engineering": {
      "label": "Engineering",
      "route": "engineering",
      "aliases": ["engineering handoff", "implementation", "technical checklist", "tracking"],
      "purpose": "Translate the campaign into product and measurement work that must be implemented and verified before traffic is scaled.",
      "sections": ["Landing-page handoff", "Conversion events", "Testimonial prompt", "Onboarding", "Reddit pixel", "Prelaunch checklist"],
      "steps": ["Find the first incomplete measurement or conversion item", "Confirm the requirement in plain language", "Implement and verify it in the owning product before checking it off"],
      "start": "Start with any incomplete conversion-tracking requirement because missing data makes later decisions unreliable.",
      "terms": ["Conversion event = a recorded user action such as signup or activation", "Pixel = a third-party tracking script", "Handoff = implementation instructions, not completed work"],
      "watchFor": "This page is a handoff and checklist. It can describe intended work that is not yet implemented in the CipherExam product.",
      "related": ["Landing Pages", "Results", "Funnel Diagnostic"]
    },
    "voice": {
      "label": "Brand Voice",
      "route": "voice",
      "aliases": ["voice", "brand", "brand review", "copy standards", "brand voice"],
      "purpose": "Audit campaign assets for clarity, tone, claim safety, consistency, and alignment with CipherExam's approved voice.",
      "sections": ["Overall brand check", "Severity scale", "Asset-specific findings", "Cross-asset consistency"],
      "steps": ["Read the overall pass or fail result", "Fix BLOCK findings, then WARN findings", "Use NOTE findings only when they materially improve the current asset"],
      "start": "If there are no BLOCK or WARN findings, do not reread the full report; open only the notes for the asset you are editing.",
      "terms": ["BLOCK = must fix before publishing", "WARN = meaningful risk or inconsistency", "NOTE = optional improvement"],
      "watchFor": "A long report does not mean the campaign failed. Severity determines what deserves attention.",
      "related": ["Create", "Content", "Landing Pages"]
    },
    "competitors": {
      "label": "Competitors",
      "route": "competitors",
      "aliases": ["competitor intel", "competition", "competitive research", "landscape"],
      "purpose": "Summarize competitor positioning, verified gaps, and specific marketing angles CipherExam can use without overclaiming.",
      "sections": ["Latest competitive review", "Evidence and sources", "Landscape comparison", "Recommended angles"],
      "steps": ["Check the report date", "Read the newest summary and supporting evidence", "Turn one verified gap into one campaign angle"],
      "start": "Confirm the report is current enough for the decision, then read the newest summary.",
      "terms": ["Positioning = how a product distinguishes itself", "Competitive angle = a truthful contrast used in messaging"],
      "watchFor": "Competitor features and pricing change. Treat older reports as historical context and refresh them before a major decision.",
      "related": ["Strategy", "Content", "Brand Voice"]
    },
    "outreach": {
      "label": "Outreach",
      "route": "outreach",
      "aliases": ["backlinks", "link outreach", "reviewer outreach", "prospects", "competitor channels"],
      "purpose": "Turn verified competitor acquisition research into a controlled reviewer, media, and partnership pipeline without confusing paid placement with earned editorial links.",
      "sections": ["Next controlled action", "Readiness gate", "Recommended options", "Verified advertising evidence", "Competitor distribution channels", "Do not contact list", "Automation boundary"],
      "steps": ["Complete the readiness gate from top to bottom", "Start with Kiyoo Networks, the only immediate earned-editorial target", "Copy and personalize the draft, then obtain Dave's approval before sending it manually", "Record replies, visits, trials and activated users"],
      "start": "Correct public comparison claims before preparing outreach, then review the Kiyoo Networks draft as the first prospect action.",
      "terms": ["Earned editorial = independent coverage without payment", "Commercial test = a source whose affiliate or sponsorship terms must be verified", "Activated user = a user who selected an exam and answered at least 10 questions"],
      "watchFor": "This page never sends messages. Paid reviews require disclosure and sponsored or nofollow links; direct competitors, closed certification bodies and UGC forums are not ordinary backlink prospects.",
      "related": ["Competitors", "Results", "Brand Voice"]
    },
    "testimonials": {
      "label": "Testimonials",
      "route": "testimonials",
      "aliases": ["proof", "customer proof", "reviews", "testimonials"],
      "purpose": "Show approved, consent-cleared customer quotes that can support a specific campaign claim.",
      "sections": ["Approved testimonial cards", "Exam and outcome context", "Consent status"],
      "steps": ["Confirm approved testimonial cards are present", "Choose proof matching the exam and outcome you are discussing", "Use the quote without changing the customer's meaning"],
      "start": "First check whether the page contains approved testimonial cards. An empty page means there is no usable proof shown here yet.",
      "terms": ["Consent-cleared = permission to use the quote has been recorded", "Approved proof = a quote cleared for marketing use"],
      "watchFor": "The current empty state does not distinguish no approved testimonials from a loading or data problem. Do not invent or paraphrase customer proof.",
      "related": ["Landing Pages", "Content", "Brand Voice"]
    },
    "settings": {
      "label": "Settings",
      "route": "settings",
      "aliases": ["campaign settings", "maintenance", "reset", "archive campaign"],
      "purpose": "Handle deliberate campaign maintenance, especially archiving the current campaign and starting a new cycle.",
      "sections": ["Archive and reset warning", "Current campaign summary", "Three-part confirmation", "Interface note"],
      "steps": ["Read the archive and replacement scope", "Confirm that a genuinely new campaign is intended", "Complete all confirmations only when you accept the irreversible operational change"],
      "start": "Leave this page without changing anything during normal campaign work.",
      "terms": ["Archive = preserve the old campaign as history", "Reset = replace the active campaign state with a new cycle"],
      "watchFor": "This is the highest-risk page. A reset changes production campaign state and must never be treated as a routine cleanup action.",
      "related": ["Today", "Strategy"]
    },
    "funnel": {
      "label": "Funnel Diagnostic",
      "path": "funnel.html",
      "aliases": ["funnel", "conversion funnel", "funnel diagnostics", "daily funnel"],
      "purpose": "Diagnose the five-step path from reach to activation and identify the single measured bottleneck worth solving next.",
      "sections": ["Activation gate", "Five funnel stages", "Insights", "Per-cluster results", "Data update instructions", "Last-updated timestamp"],
      "steps": ["Check the data timestamp and activation gate", "Find the worst conversion between adjacent stages", "Fix that one bottleneck and measure the funnel again"],
      "start": "Start with the worst measured conversion arrow, not the largest raw count.",
      "terms": ["LP visit = a visit to a campaign landing page", "Activated = selected an exam and answered at least 10 questions", "Cluster = one exam audience"],
      "watchFor": "Stale or missing campaign metrics make the diagnosis unreliable. This page currently describes a file-edit ritual even though production data is loaded from authenticated Firestore.",
      "related": ["Results", "Activation Sprint", "Engineering"]
    },
    "sprint": {
      "label": "Activation Sprint",
      "path": "sprint.html",
      "aliases": ["sprint", "activation", "activation plan", "candidate tracker"],
      "purpose": "Hand-recruit a small set of real PMP candidates, track their path to activation and Day-2 return, and prove value before paid scaling.",
      "sections": ["Sprint KPIs", "Progress to sprint goal", "Progress to paid-spend gate", "Today's recruiting targets", "Candidate tracker"],
      "steps": ["Open today's recruiting targets", "Contact candidates with the free demo", "Record signup, activation, and Day-2 return in the candidate tracker"],
      "start": "Contact the next uncontacted candidate from today's target communities.",
      "terms": ["Sprint goal = five activated candidates", "Paid-spend gate = 25 activated users", "Day-2 return = the candidate comes back the next day"],
      "watchFor": "The page is a tracker, but its visible update note still tells the operator to edit campaign-state.json while production reads authenticated Firestore.",
      "related": ["Funnel Diagnostic", "Results", "Today"]
    }
  };
})();
