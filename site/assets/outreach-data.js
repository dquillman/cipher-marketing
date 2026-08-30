(function () {
  "use strict";

  window.CIPHER_OUTREACH_DATA = {
    researchedAt: "2026-08-13",
    gauntletStatus: "PASS",
    summary: "One immediate earned-editorial prospect, three transparent commercial tests, and a separate future/partnership queue.",
    evidenceRules: [
      "Paid advertising requires an ad-library record or explicit sponsorship disclosure.",
      "Organic posts, owned media, affiliate programs, and partnerships are separate channels.",
      "A competitor mention is not automatically a backlink; the source and destination must be visible.",
      "Never buy a followed link or request exact anchor text."
    ],
    adRecords: [
      {
        competitor: "Pocket Prep",
        count: "~300",
        scope: "Google Ads Transparency Center · United States · Any time",
        interpretation: "Historical creative records; not proof of current spend, reach, or active inventory.",
        url: "https://adstransparency.google.com/advertiser/AR03377466555343306753?hl=en&region=US"
      },
      {
        competitor: "PM PrepCast",
        count: "51",
        scope: "Google Ads Transparency Center · United States · Any time",
        interpretation: "Historical creative records; not proof of current spend, reach, or active inventory.",
        url: "https://adstransparency.google.com/advertiser/AR03217180368721412097?hl=en&region=US"
      },
      {
        competitor: "Brain Sensei",
        count: "18",
        scope: "Google Ads Transparency Center · United States · Any time",
        interpretation: "Historical creative records; advertiser claims are not adopted as product facts.",
        url: "https://adstransparency.google.com/advertiser/AR04322744464410935297?hl=en&region=US"
      }
    ],
    channels: [
      { name: "Pocket Prep", type: "Direct multi-exam", confirmed: "Google ads, creator affiliates, instructor partnerships, creator sponsorships, owned SEO/social", implication: "Their distribution system is as important as their question bank." },
      { name: "PM PrepCast", type: "Direct PMP", confirmed: "Google ads, website affiliates, owned podcasts, SEO and organic LinkedIn", implication: "Comparison publishers and affiliates are a core acquisition lane." },
      { name: "Brain Sensei", type: "Direct PMP", confirmed: "Google ads, affiliate comparison sites, owned SEO and free trials", implication: "Competes on guarantees, volume and structured course positioning." },
      { name: "TIA / Andrew Ramdayal", type: "Direct PMP", confirmed: "YouTube, Udemy, Amazon and owned-site funnel", implication: "Instructor trust and video reach are the moat; no paid-ad claim was verified." },
      { name: "Dion Training", type: "Direct CompTIA / ITIL", confirmed: "YouTube, Udemy, owned resources, vouchers and referral program", implication: "Marketplace and creator authority dominate this lane." },
      { name: "Professor Messer", type: "CompTIA substitute", confirmed: "Free YouTube courses, livestreams, SEO, newsletter and paid notes/exams", implication: "Free education feeds paid study materials without requiring conventional ads." },
      { name: "Official systems", type: "PMI / SHRM / CompTIA", confirmed: "Certification-body stores, chapters, study groups, authorized partners and resellers", implication: "Closed ecosystems; partnership targets, not ordinary backlink prospects." },
      { name: "Mometrix / PrepSolution", type: "Direct SHRM", confirmed: "Free practice content, SEO comparisons and paid question banks", implication: "SHRM outreach needs its own evidence and pitch, not a recycled PMP message." }
    ],
    workflow: [
      { id: "claims_fixed", label: "Public comparison claims corrected", help: "Remove broad claims that competitors do not explain answers. Lead with reasoning-pattern diagnosis." },
      { id: "reviewer_kit", label: "Reviewer package ready", help: "Include product facts, screenshots, one Exam Lens example, PBQ proof, pricing and honest-review permission." },
      { id: "tracking_ready", label: "GA4 and activation tracking confirmed", help: "Measure activated users: signup, exam chosen, and at least 10 questions answered." },
      { id: "kiyoo_draft", label: "Kiyoo draft reviewed by Dave", help: "The first outreach draft must be approved before any message is sent." }
    ],
    targets: [
      {
        id: "kiyoo",
        rank: 1,
        name: "Kiyoo Networks",
        lane: "earned",
        laneLabel: "Earned editorial",
        score: 82,
        verdict: "APPROACH NOW",
        audience: "CompTIA Security+ · Network+ · A+",
        evidence: "The CompTIA Trifecta article links or recommends Dion, Udemy and Professor Messer. No evident competing product or affiliate conflict.",
        sourceUrl: "https://kiyoo.net/p/how-i-completed-the-comptia-trifecta",
        contactUrl: "https://kiyoo.net/about",
        pitch: "Offer temporary reviewer access and a useful Security+/PBQ resource. Ask for an honest evaluation or resource inclusion, never a backlink.",
        utm: "https://cipherexam.com/?utm_source=kiyoo&utm_medium=editorial_review&utm_campaign=reviewer_outreach",
        draft: "Subject: A different kind of CompTIA practice tool\n\nHi Jonas,\n\nI found your CompTIA Trifecta article while researching the resources candidates actually use. Your discussion of Crucial Exams, Dion and Professor Messer was unusually practical.\n\nI built CipherExam, a certification-practice platform that focuses on how candidates reason through questions—not only which objectives they miss. For Security+, Network+ and A+ it uses scenario-driven items, Exam Lens explanations and recurring thinking-trap detection. To be straight with you up front: it does not simulate PBQs — no drag-and-drop, topology or CLI items. It trains the judgment those items grade, and I would rather you knew that before you opened it than after.\n\nWould you be interested in testing it? I can provide complete reviewer access. There is no requirement for a positive review, link or endorsement. If it is not useful, I would still value the criticism.\n\nDave\nFounder, CipherExam"
      },
      {
        id: "pmaspirant",
        rank: 2,
        name: "PMAspirant",
        lane: "commercial-test",
        laneLabel: "Commercial test",
        score: 69,
        verdict: "VERIFY TERMS",
        audience: "PMP candidates",
        evidence: "Current PrepCast comparison and resource library with an explicit affiliate disclosure.",
        sourceUrl: "https://pmaspirant.com/pm-prepcast-review",
        contactUrl: "https://pmaspirant.com/contact-us/",
        pitch: "Offer independent reviewer access. Ask about affiliate or sponsorship terms before supplying access.",
        utm: "https://cipherexam.com/?utm_source=pmaspirant&utm_medium=review&utm_campaign=reviewer_outreach",
        draft: "Subject: CipherExam for a future PMP simulator comparison\n\nHi Andrew,\n\nYour PrepCast review and PMP simulator comparisons examine explanations, reporting and question quality—not only bank size.\n\nI am the founder of CipherExam. It approaches PMP practice differently by classifying questions using Bloom's Taxonomy and identifying recurring reasoning traps across a candidate's answers.\n\nI would like to offer complete reviewer access for an independent evaluation or future comparison. There is no requirement for favorable coverage.\n\nBefore proceeding, could you tell me whether your reviews involve affiliate, sponsorship or other commercial terms?\n\nDave\nFounder, CipherExam"
      },
      {
        id: "katalyst",
        rank: 3,
        name: "Katalyst Prep",
        lane: "commercial-test",
        laneLabel: "Commercial test",
        score: 68,
        verdict: "VERIFY OPERATOR",
        audience: "PMP candidates",
        evidence: "A current PMP review hub covering PMTraining, Project Management Academy and Brain Sensei. Commercial relationships require verification.",
        sourceUrl: "https://katalystprep.com/pmp/",
        contactUrl: "https://katalystprep.com/contact/",
        pitch: "First verify who performs reviews, how products are selected, and whether payment affects inclusion or ranking.",
        utm: "https://cipherexam.com/?utm_source=katalyst&utm_medium=review&utm_campaign=reviewer_outreach",
        draft: "Subject: Question about your PMP review process\n\nHi,\n\nI am the founder of CipherExam, a PMP practice and diagnostic platform. I am interested in submitting it for a possible independent review.\n\nBefore sending access, could you clarify your review process: who performs the evaluation, whether reviewed providers pay or participate in affiliate arrangements, and whether compensation affects inclusion or rankings?\n\nWe do not purchase favorable reviews or followed links.\n\nDave\nCipherExam"
      },
      {
        id: "rebels",
        rank: 4,
        name: "Rebel's Guide to Project Management",
        lane: "paid",
        laneLabel: "Paid media",
        score: 67,
        verdict: "RATE CARD ONLY",
        audience: "PMP candidates and project managers",
        evidence: "Authoritative current simulator comparisons, but the pitch policy includes paid reviews and sponsorships.",
        sourceUrl: "https://rebelsguidetopm.com/the-best-pmp-exam-simulators/",
        contactUrl: "https://rebelsguidetopm.com/contact/pitch-policy/",
        pitch: "Request rates, testing method, disclosure, link attributes, article duration and reporting. Treat as paid PR, never earned SEO.",
        utm: "https://cipherexam.com/?utm_source=rebels_guide&utm_medium=sponsored_review&utm_campaign=reviewer_outreach",
        draft: "Subject: CipherExam review and sponsorship terms\n\nHi Elizabeth,\n\nI am evaluating a possible independent review of CipherExam for PMP candidates. Before deciding, could you send the current review and sponsorship options, including how the product is tested, disclosure placement, link attributes, article duration, newsletter or social distribution, and post-campaign reporting?\n\nWe do not require favorable coverage and would expect any compensated links to be marked sponsored or nofollow.\n\nDave\nFounder, CipherExam"
      },
      {
        id: "sudhir",
        rank: 5,
        name: "Sudhir CISSP journey",
        lane: "future",
        laneLabel: "Future",
        score: 84,
        verdict: "WAIT FOR CISSP",
        audience: "CISSP candidates",
        evidence: "Strong judgment-oriented personal study report mentioning LearnZapp and Pocket Prep.",
        sourceUrl: "https://sudhir.is-a.dev/posts/cissp-passing-journey/",
        contactUrl: "https://sudhir.is-a.dev/",
        pitch: "Do not approach until CipherExam CISSP is live and independently testable. Beta recruiting must be labeled as such.",
        utm: "https://cipherexam.com/?utm_source=sudhir&utm_medium=editorial_review&utm_campaign=cissp_launch",
        draft: "Hold until CipherExam CISSP is live."
      },
      {
        id: "ciat",
        rank: 6,
        name: "CIAT / Crucial Exams",
        lane: "partnership",
        laneLabel: "Partnership",
        score: null,
        verdict: "B2B ONLY",
        audience: "Institutional certification learners",
        evidence: "A formal product-integration partnership, not an editorial resource link.",
        sourceUrl: "https://www.ciat.edu/partnerships/crucial-exams",
        contactUrl: "https://www.ciat.edu/contact-us",
        pitch: "Approach only when CipherExam has institutional licensing, support, procurement and data-processing readiness.",
        utm: "https://cipherexam.com/?utm_source=ciat&utm_medium=partnership&utm_campaign=institutional",
        draft: "No outreach until an institutional offer exists."
      }
    ],
    reject: [
      { name: "Alvin the PM", score: 31, reason: "Direct simulator competitor plus affiliate conflict." },
      { name: "PM for the Masses", score: 48, reason: "Stale compensated affiliate resource page." },
      { name: "Miami Herald commerce", score: 44, reason: "Commercial affiliate placement, not earned newsroom coverage." },
      { name: "CertForums", score: 30, reason: "UGC community; soliciting link insertion would be manipulative." },
      { name: "Techademy", score: null, reason: "Direct training competitor." }
    ],
    guardrails: [
      "Dave approves every final message before it is sent.",
      "Automation may prepare, copy, score, remind and track. It never sends.",
      "Compensation or free access must be disclosed.",
      "Compensated links must be sponsored or nofollow.",
      "Use accurate headers, an honest subject, a postal address and an opt-out for commercial email.",
      "Do not imply PMI, SHRM or CompTIA endorsement or use protected exam content."
    ]
  };
}());
