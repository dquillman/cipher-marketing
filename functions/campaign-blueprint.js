const DAY_MS = 86_400_000;

export const RESET_CONFIRMATION = "RESET CAMPAIGN";

export function validateCampaignStart(startDate) {
  if (typeof startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("startDate must use YYYY-MM-DD");
  }
  const [year, month, day] = startDate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("startDate must be a real calendar date");
  }
  return startDate;
}

function dateAtOffset(startDate, offset) {
  return new Date(Date.parse(`${startDate}T00:00:00Z`) + offset * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function freshFunnel(startDate) {
  const zero = { impressions: 0, lpVisits: 0, signups: 0, examPicked: 0, activated: 0 };
  return {
    asOf: `${startDate}T00:00:00.000Z`,
    windowDays: 7,
    instructions: "Hand-entered rolling 7-day funnel. Activated = signup + exam selected + at least 10 questions.",
    aggregate: { ...zero },
    perCluster: {
      PMP: { ...zero },
      "Security+": { ...zero },
      "SHRM-CP": { ...zero },
    },
  };
}

export function buildFreshState(current, startDate, now = new Date()) {
  validateCampaignStart(startDate);
  const source = current && typeof current === "object" ? current : {};
  const checklist = Array.isArray(source.preLaunchChecklist)
    ? source.preLaunchChecklist.map((item) => ({
        ...item,
        status: "pending",
        note: item.id === "lps-deployed"
          ? "Verify the live PMP landing page and updated-exam messaging before Day 1."
          : "",
      }))
    : [];

  return {
    _meta: {
      schemaVersion: 2,
      lastUpdatedAt: now.toISOString(),
      lastUpdatedBy: "full-campaign-reset",
      resetMode: "archive-and-reinitialize",
      strategyVersion: "pmp-judgment-2026",
    },
    postingHold: {
      active: false,
      affectedPosts: [],
      reason: null,
      since: null,
      liftedAt: null,
      scope: "All campaign publishing and proactive community engagement.",
    },
    campaign: {
      start: startDate,
      name: "PMP Judgment Sprint — Updated 2026 Exam",
      primaryExam: "PMP",
      tier1: ["PMP"],
      secondaryExams: ["Security+", "SHRM-CP"],
      objective: "Create activated PMP trial users by proving CipherExam teaches judgment, not answer memorization.",
      primaryKpi: "activated users",
      activationDefinition: "signup + PMP selected + at least 10 questions",
      paidSpendCap: 2,
      activationGate: 25,
      activationTarget4wk: 55,
      audience: "Experienced PMP candidates preparing for the July 2026 exam who struggle to choose the best or first action.",
      offer: "7-day free trial, no credit card",
      primaryCta: "Start Free Trial",
      primaryChannel: "LinkedIn",
      distributionChannel: "PMP communities",
      paidPolicy: "$0 until 25 cumulative activated users; after the gate, retargeting only, capped at $2/day total.",
      weeklyThemes: [
        "The July 2026 exam changed the judgment being tested",
        "Why experienced project managers choose the second-best answer",
        "How to reason through AI, sustainability, value, and stakeholder scenarios",
        "Proof, activation challenge, and conversion",
      ],
    },
    metrics: {
      activatedUsersTotal: 0,
      trialSignupsTotal: 0,
      paidSpendThisWeek: 0,
      perCluster: {
        PMP: { signups: 0, activated: 0, target: 55 },
        "Security+": { signups: 0, activated: 0, target: 0 },
        "SHRM-CP": { signups: 0, activated: 0, target: 0 },
      },
      funnel: freshFunnel(startDate),
    },
    activationSprint: {
      instructions: "Recruit real PMP candidates. Activated = signup + PMP selected + at least 10 questions. Track Day-2 return separately.",
      startedAt: startDate,
      exam: "PMP",
      targetActivated: 25,
      gate: 25,
      dailyInteractionTarget: 6,
      candidates: [],
      totals: { contacted: 0, signedUp: 0, activated: 0, day2Returned: 0 },
    },
    communityEngagement: {
      ...(source.communityEngagement || {}),
      paused: false,
      pausedSince: null,
      pausedReason: null,
      resumedAt: now.toISOString(),
      preHoldDailyTarget: 3,
      dailyTarget: 3,
      instructions: "Each weekday: three useful LinkedIn comments and three value-first community replies. No unsolicited product link; disclose affiliation if CipherExam is relevant.",
    },
    preLaunchChecklist: checklist,
    blockers: [],
    decisions: [
      {
        at: now.toISOString(),
        decision: "Reset the entire campaign and archive the prior state before starting the PMP Judgment Sprint.",
        owner: "Dave",
      },
      {
        at: now.toISOString(),
        decision: "Concentrate publishing on LinkedIn; use PMP communities for research and value-first distribution.",
        owner: "Campaign strategy",
      },
      {
        at: now.toISOString(),
        decision: "Keep paid acquisition at $0 until 25 cumulative activated users; then retarget only at no more than $2/day.",
        owner: "Campaign governance",
      },
    ],
    dailyLog: [],
    boardPriorities: {
      cycleDate: startDate,
      mirroredAt: now.toISOString(),
      source: "PMP Judgment Sprint reset blueprint",
      items: [
        { priority: "P0", text: "Validate the updated-exam judgment message with five real PMP candidates." },
        { priority: "P0", text: "Reach 25 activated users before spending on acquisition." },
        { priority: "P0", text: "Publish three strong LinkedIn posts each week and record every post grade." },
        { priority: "P1", text: "Complete six value-first community interactions each weekday without unsolicited promotion." },
        { priority: "P1", text: "Review activation and Day-2 return every Friday; change one variable for the next week." },
      ],
    },
  };
}

const POST_BLUEPRINTS = [
  {
    offset: 0, hook: "the-exam-changed", predictedGrade: "B",
    copy: "The PMP exam changed on July 9, 2026.\n\nThe important shift is not a new list of terms to memorize. PMI increased Business Environment from 8% to 26% and added AI, sustainability, stakeholder engagement, value, and business impact to its scenarios.\n\nThat means more questions where several actions are reasonable and one is best for the outcome.\n\nBefore you buy another question bank, ask one question: does it teach you why the best answer wins under the updated exam outline?\n\nCipherExam's Exam Lens breaks down that judgment after every question.\n\nStart Free Trial — 7 days, no credit card.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 2, hook: "experience-trap", predictedGrade: "B",
    copy: "The people who struggle with the PMP are often experienced project managers.\n\nAt work, speed and context matter. You know when to escalate, when to improvise, and when the written process is not enough.\n\nOn the exam, that same instinct can make you choose the second-best answer.\n\nThe PMP usually rewards a sequence: assess before acting, engage the right person directly, protect value, then escalate when the situation warrants it.\n\nYour experience is not wrong. It is answering a more detailed question than the exam asked.\n\nCipherExam shows the reasoning frame behind each option so you can separate real-world instinct from exam-day judgment.\n\nStart Free Trial — no credit card.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 4, hook: "scenario-poll-1", predictedGrade: "A",
    copy: "PMP scenario:\n\nA sponsor asks you to accelerate delivery by skipping a planned stakeholder review. The team can meet the date, but a high-impact dependency may be affected.\n\nWhat do you do first?\n\nA. Accept the sponsor's direction\nB. Escalate to the steering committee\nC. Assess the dependency impact with the relevant stakeholders\nD. Update the schedule and record the risk\n\nPost your answer and, more importantly, your reason.\n\nI'll share the decision pattern after the discussion. The updated PMP exam is increasingly about judgment under competing priorities, not recalling a definition.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 7, hook: "business-environment-26", predictedGrade: "B",
    copy: "Business Environment used to be 8% of the PMP exam. It is now 26%.\n\nThat is not a small content update. It changes what good preparation looks like.\n\nCandidates now need to reason about value, external change, organizational strategy, compliance, and sustainability inside realistic project scenarios.\n\nA flashcard can tell you what a concept means. It cannot reliably teach you what to do first when value, risk, and stakeholder expectations conflict.\n\nThis week I am breaking down the decision patterns behind the new domain weighting.\n\nStart with a free PMP diagnostic in CipherExam. No credit card.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 9, hook: "ai-is-context", predictedGrade: "B",
    copy: "AI is now explicit in the updated PMP exam, but the test is not trying to turn project managers into machine-learning engineers.\n\nThe judgment question is more practical:\n\nWhen AI changes the work, what should the project leader assess, communicate, govern, and measure?\n\nThe weak answer usually jumps to the tool. The stronger answer starts with value, stakeholders, risk, data, and responsible adoption.\n\nThat is the pattern worth practicing.\n\nCipherExam explains why each plausible option ranks where it does, so new topics do not become a guessing game.\n\nStart Free Trial — 7 days, no credit card.\n\n#PMP #AI #ProjectManagement",
  },
  {
    offset: 11, hook: "score-is-not-readiness", predictedGrade: "A",
    copy: "A 78% practice score can hide the exact weakness that fails a PMP candidate.\n\nIf you remember the question, recognize the wording, or eliminate two weak distractors, the score rises. None of that proves you can resolve a new scenario where all four choices are plausible.\n\nReadiness is not only “how many did I get right?”\n\nIt is “can I explain why the best action comes before the other reasonable actions?”\n\nAfter your next practice set, review three correct answers and explain the rejected options out loud. If the reasoning is fuzzy, the score is overstating readiness.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 14, hook: "stakeholder-sequence", predictedGrade: "B",
    copy: "Most PMP stakeholder questions are sequence questions disguised as people problems.\n\nA resistant stakeholder, unclear expectation, or late objection creates pressure to act quickly. The distractors offer actions that may eventually be appropriate: escalate, update the plan, log a risk, or change the communication approach.\n\nThe exam asks which action belongs first.\n\nA reliable frame:\n1. Understand the concern.\n2. Assess impact and interests.\n3. Engage directly.\n4. Agree on the next action.\n5. Escalate only when authority or resolution requires it.\n\nPractice the sequence, not just the vocabulary.\n\nStart Free Trial — no credit card.\n\n#PMP #StakeholderManagement",
  },
  {
    offset: 16, hook: "sustainability-tradeoff", predictedGrade: "B",
    copy: "Sustainability on the updated PMP exam is not a trivia category.\n\nExpect tradeoffs.\n\nA lower-cost option may create a larger lifecycle impact. A faster delivery path may conflict with an organizational commitment. A stakeholder request may solve today's problem while reducing long-term value.\n\nThe project manager's job is not to choose a fashionable answer. It is to assess impact, connect the decision to agreed objectives, involve the right stakeholders, and protect value.\n\nThat is why scenario practice matters more than memorizing a sustainability glossary.\n\n#PMP #Sustainability #ProjectManagement",
  },
  {
    offset: 18, hook: "scenario-poll-2", predictedGrade: "A",
    copy: "PMP scenario:\n\nA new AI tool could shorten a critical activity, but the team has not assessed data privacy or output quality. A senior stakeholder wants it used immediately.\n\nWhat should the project manager do first?\n\nA. Begin a limited rollout to protect the schedule\nB. Ask the sponsor to accept the risk\nC. Assess value, data, quality, and governance impacts with the appropriate experts\nD. Reject the tool until organizational policy is updated\n\nReply with your answer and reasoning. The best response is determined by sequence and impact, not whether you are “pro-AI” or “anti-AI.”\n\n#PMP #AI #ProjectManagement",
  },
  {
    offset: 21, hook: "ten-question-challenge", predictedGrade: "B",
    copy: "Try this PMP readiness test today:\n\nAnswer 10 scenario questions. For every miss, write one sentence for each wrong option:\n\n“Reasonable, but not first because…”\n“Correct in a different condition, but not here because…”\n\nIf you cannot finish those sentences, do not rush into another 50 questions. The gap is judgment, not volume.\n\nCipherExam's Coach Breakdown does this comparison after every answer. The free trial is enough to run the 10-question challenge and see whether the reasoning clicks.\n\nStart Free Trial — no credit card.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 23, hook: "practice-quality-checklist", predictedGrade: "B",
    copy: "Four checks for any PMP practice tool in 2026:\n\n1. It explicitly aligns to the July 2026 Exam Content Outline.\n2. It covers the new domain weighting and future-focused scenarios.\n3. Its explanations address every option, not only the correct one.\n4. It teaches a decision pattern you can transfer to a question you have never seen.\n\nQuestion count matters. Transferable reasoning matters more.\n\nUse this list on CipherExam, PMI Study Hall, or any other resource you are considering. The standard should be the same.\n\n#PMP #ProjectManagement",
  },
  {
    offset: 25, hook: "founder-proof-loop", predictedGrade: "B",
    copy: "The most useful signal from this campaign will not be impressions.\n\nIt will be whether a PMP candidate:\n- starts the trial,\n- selects the PMP exam,\n- completes at least 10 questions,\n- and returns the next day.\n\nThat sequence tells me the product created enough clarity to earn another study session.\n\nI am building CipherExam around that standard: explanations should change how you approach the next question, not merely tell you what you missed.\n\nIf you are preparing for the updated PMP exam, try the free diagnostic and tell me where the reasoning still feels unclear.\n\nStart Free Trial — 7 days, no credit card.\n\n#PMP #BuildInPublic #ProjectManagement",
  },
];

export function buildFreshPosts(current, startDate, now = new Date()) {
  validateCampaignStart(startDate);
  const benchmarks = current?.benchmarks || {
    linkedin: {
      engagementRatePctGreatAtLeast: 5,
      linkClickRatePctGoodAtLeast: 1,
      linkClickRatePctGreatAtLeast: 2.5,
      engagementRatePctGoodAtLeast: 2,
    },
  };
  const posts = POST_BLUEPRINTS.map((blueprint, index) => {
    const scheduled = dateAtOffset(startDate, blueprint.offset);
    const slug = blueprint.hook;
    return {
      id: `li-${scheduled}-${slug}`,
      scheduled,
      scheduledTime: `${scheduled}T15:30:00Z`,
      scheduledTimeLocal: `${scheduled} 10:30 CT`,
      channel: "linkedin",
      channelAccount: "personal",
      status: "draft",
      examFocus: "PMP",
      hook: slug,
      video: null,
      videoFormat: null,
      imageUrl: null,
      canvaDesignId: null,
      canvaCandidate: index === 2 || index === 8,
      copy: blueprint.copy,
      cta: `https://cipherexam.com/lp/pmp?utm_source=linkedin&utm_campaign=pmp_judgment_2026&utm_content=${slug}`,
      postedAt: null,
      postUrl: null,
      metrics: null,
      grade: null,
      gradeNotes: null,
      recommendations: null,
      humanizerTellsStripped: 0,
      predictedGrade: blueprint.predictedGrade,
      predictionNote: "New-campaign draft. Review after live distribution data; do not treat predicted grade as evidence.",
    };
  });
  return {
    posts,
    benchmarks,
    _meta: {
      schemaVersion: 2,
      lastUpdatedAt: now.toISOString(),
      lastUpdatedBy: "full-campaign-reset",
      strategy: "Three LinkedIn posts per week; community participation supplies distribution. Approve drafts before publishing.",
    },
  };
}

export function buildFreshCompetitors(now = new Date()) {
  return {
    _meta: {
      lastUpdatedAt: now.toISOString(),
      lastUpdatedBy: "competitor-review-2026-07-28",
      researchDate: "2026-07-28",
    },
    competitors: [
      {
        id: "pmi-study-hall", name: "PMI Study Hall", category: "official PMP practice platform",
        exams: ["PMP"], primaryStrength: "Official authority, $49/$79 quarterly options, full and mini exams, updated-exam resources",
        knownWeakness: "Broad official study environment; the differentiation opportunity is clearer option-by-option judgment coaching",
        threat: "high", url: "https://www.pmi.org/shop/p-/digital-product/project-management-professional-%28pmp%29-pmi-study-hall-plus-%28subscription%29-/dp014",
      },
      {
        id: "pocket-prep", name: "Pocket Prep", category: "mobile-first multi-exam practice",
        exams: ["PMP", "Security+", "SHRM-CP", "many"], primaryStrength: "2,450 PMP questions, strong mobile habits, 80 free questions, broad professional bundle",
        knownWeakness: "Competes on breadth, quiz modes, and weak-area repetition; CipherExam can own explicit scenario-judgment transfer",
        threat: "high", url: "https://www.pocketprep.com/exams/pmi-pmp/",
      },
      {
        id: "tia-exam-simulator", name: "TIA PMP Exam Simulator", category: "instructor-led simulator",
        exams: ["PMP"], primaryStrength: "1,100+ questions, video explanations, 60-day access, strong Andrew Ramdayal audience",
        knownWeakness: "Video volume depends on the instructor; CipherExam can provide faster option-level feedback inside every practice loop",
        threat: "high", url: "https://www.tiaexams.com/course/tiapmpsimulator",
      },
      {
        id: "prepcast", name: "PM PrepCast Simulator", category: "premium PMP simulator",
        exams: ["PMP"], primaryStrength: "Deep 1,900+ question bank, full simulations, established readiness positioning",
        knownWeakness: "$99-$149 simulator tiers create a price and immediacy opening for a no-card trial with concise reasoning coaching",
        threat: "medium-high", url: "https://store.project-management-prepcast.com/pmp-exam-simulator",
      },
    ],
  };
}

export function buildCompetitorReports(now = new Date()) {
  const generated_at = now.toISOString();
  return {
    landscape: {
      generated_at,
      content: "## Executive summary\nThe July 2026 PMP exam is live. The category leaders now compete on official authority (PMI Study Hall), question-bank breadth and mobile habit (Pocket Prep), instructor-led video explanation (TIA), or simulation depth (PrepCast).\n\n**CipherExam's defensible wedge:** teach why the best action comes before the other plausible actions under the updated exam outline. Do not compete on raw question count.\n\n## Threat ranking\n1. **PMI Study Hall — High.** Official, current, and priced at $49 or $79 per quarter.\n2. **Pocket Prep — High.** 2,450 PMP questions, 80 free, polished mobile repetition, and broad professional-exam access.\n3. **TIA Simulator — High.** Strong instructor audience, video explanations, 1,100+ questions, and updated 2026 positioning.\n4. **PM PrepCast — Medium-high.** Deep simulator reputation and 1,900+ questions, but $99-$149 simulator pricing.\n\n## Three moves\n1. Own the phrase **judgment for the updated PMP exam**.\n2. Demonstrate option-by-option reasoning with scenario polls and Coach Breakdown clips.\n3. Optimize for activated trials and Day-2 return, not reach alone.\n\n## Evidence reviewed\nPMI new-exam page and Study Hall store; Pocket Prep PMP page; TIA simulator page; PM PrepCast simulator store. Research date: 2026-07-28.",
    },
    deepdive: {
      generated_at,
      content: "## Deep dive: Pocket Prep\nPocket Prep is the strongest habit and breadth competitor. Its PMP page lists 2,450 questions, multiple quiz modes, weak-subject targeting, mobile and web access, 80 free questions, and $20.99 monthly / $49.99 quarterly / $124.99 annual pricing.\n\n## What not to attack\nDo not claim Pocket Prep lacks explanations; its current product explicitly includes detailed explanations. Do not compete on question volume or mobile polish.\n\n## Gap to exploit\nIts public story emphasizes quantity, modes, streaks, scoring, and weak areas. CipherExam should demonstrate a narrower outcome: transferring a decision pattern from one scenario to the next by ranking every plausible option.\n\n## Post hook\n> A high practice score can still hide a judgment gap. Can you explain why the second-best option is not first?\n\nUse the competitor only in internal strategy. Customer-facing copy should make the category distinction without naming or disparaging alternatives.",
    },
    battlecard: {
      generated_at,
      content: "## CipherExam PMP battlecard\n### Category\n**Judgment training for the updated PMP exam.**\n\n### Three points\n1. **Current:** Messaging is anchored to PMI's July 2026 outline: AI, sustainability, stakeholder engagement, value, and the new domain weighting.\n2. **Transferable:** Exam Lens and Coach Breakdown compare plausible options so candidates learn a reusable decision sequence.\n3. **Low friction:** Start a 7-day free trial with no credit card and prove value in the first 10 questions.\n\n### Against official prep\nPMI owns authority. CipherExam wins on focused explanation speed and option-level reasoning.\n\n### Against large banks\nThey own breadth. CipherExam wins when candidates are scoring but still cannot explain why the best action is first.\n\n### Against instructor video\nThey own personality and long-form teaching. CipherExam wins with immediate feedback inside the practice loop.\n\n### Guardrails\nNo pass guarantee. No unsupported pass-rate claims. No invented urgency. Do not market CISSP or AWS as live. Use **Exam Lens** only as the customer-facing framework name.",
    },
  };
}
