export type ExamVariant =
  | "pmp" | "secplus" | "shrm"
  | "pmp2" | "secplus2" | "shrm2";

export type QuestionOption = {
  letter: string;
  text: string;
};

export type ExplanationLine = {
  label: string;
  body: string;
};

export type Domain = {
  number: number;
  name: string;
  weight: number;
  highlight?: boolean;
};

export type ExamConfig = {
  variant: ExamVariant;
  // Teaser
  hookLine1: string;
  hookLine2: string;
  hookLine3: string;
  // AI tutor demo
  lensName: string;
  questionDomain: string;
  questionBody: string;
  questionEmphasis: string;
  options: QuestionOption[];
  wrongLetter: string;
  correctLetter: string;
  explanation: ExplanationLine[];
  // Domain weights
  domainTitleEyebrow: string;
  domainTitleHeading: string;
  domains: Domain[];
  maxWeight: number;
  callout: string;
};

export const PMP_CONFIG: ExamConfig = {
  variant: "pmp",
  hookLine1: "Most PMP prep tools",
  hookLine2: "tell you the right answer.",
  hookLine3: "We teach you how PMP thinks.",
  lensName: "Exam Lens",
  questionDomain: "PMP · Domain: Process · Scenario",
  questionBody:
    "A project manager discovers a key stakeholder has been excluded from status meetings. What should the PM do",
  questionEmphasis: "first",
  options: [
    { letter: "A", text: "Add the stakeholder to the next meeting invite" },
    { letter: "B", text: "Review the communications management plan" },
    { letter: "C", text: "Escalate to the project sponsor" },
    { letter: "D", text: "Document the issue in the risk register" },
  ],
  wrongLetter: "A",
  correctLetter: "B",
  explanation: [
    { label: "Why A was a trap:", body: "Feels helpful, but PMP wants you to check your plan first — not act on instinct." },
    { label: "Why B is right:", body: "The comms plan already defines who gets what info. Review before you act." },
    { label: "Exam Lens:", body: "What would PMI want you to do? Follow the process — that's the discipline being tested." },
  ],
  domainTitleEyebrow: "PMP Exam Content Outline",
  domainTitleHeading: "Where the PMP actually tests you",
  domains: [
    { number: 1, name: "People", weight: 42 },
    { number: 2, name: "Process", weight: 50, highlight: true },
    { number: 3, name: "Business Environment", weight: 8 },
  ],
  maxWeight: 55,
  callout:
    "92% of PMP questions are People + Process scenarios. Memorizing definitions won't save you.",
};

export const SECPLUS_CONFIG: ExamConfig = {
  variant: "secplus",
  hookLine1: "Most Security+ prep tools",
  hookLine2: "tell you the right answer.",
  hookLine3: "We teach you how the exam thinks.",
  lensName: "Exam Lens",
  questionDomain: "SY0-701 · Domain: Security Operations · Scenario",
  questionBody:
    "An analyst sees repeated failed logins followed by one successful login from an unfamiliar IP. What should they investigate",
  questionEmphasis: "first",
  options: [
    { letter: "A", text: "Block the source IP at the firewall" },
    { letter: "B", text: "Reset the affected account password" },
    { letter: "C", text: "Determine whether the successful login is legitimate" },
    { letter: "D", text: "Review the user's role-based access permissions" },
  ],
  wrongLetter: "A",
  correctLetter: "C",
  explanation: [
    { label: "Why A was a trap:", body: "Acting before investigating destroys evidence. You don't know if it's an attack yet." },
    { label: "Why C is right:", body: "Confirm whether confidentiality was actually breached. Investigate, then respond." },
    { label: "Exam Lens:", body: "Which CIA principle is at risk? Here it's confidentiality — verify the breach first." },
  ],
  domainTitleEyebrow: "CompTIA Security+ (SY0-701)",
  domainTitleHeading: "Where Security+ actually tests you",
  domains: [
    { number: 1, name: "General Security Concepts", weight: 12 },
    { number: 2, name: "Threats, Vulns, Mitigations", weight: 22 },
    { number: 3, name: "Security Architecture", weight: 18 },
    { number: 4, name: "Security Operations", weight: 28, highlight: true },
    { number: 5, name: "Security Program Management", weight: 20 },
  ],
  maxWeight: 32,
  callout:
    "Domain 4 alone is 28% of the exam. Operations isn't a tools test — it's a process test.",
};

export const SHRM_CONFIG: ExamConfig = {
  variant: "shrm",
  hookLine1: "Most SHRM-CP prep tools",
  hookLine2: "tell you the right answer.",
  hookLine3: "We teach you how the exam thinks.",
  lensName: "Exam Lens",
  questionDomain: "SHRM-CP · Behavioral Competency · Scenario",
  questionBody:
    "A tenured employee starts missing deadlines after a new manager takes over the team. HR is consulted. What should the HR business partner do",
  questionEmphasis: "first",
  options: [
    { letter: "A", text: "Schedule a performance improvement plan for the employee" },
    { letter: "B", text: "Coach the manager to have a direct conversation about expectations" },
    { letter: "C", text: "Document the missed deadlines for the personnel file" },
    { letter: "D", text: "Escalate to senior HR leadership for review" },
  ],
  wrongLetter: "A",
  correctLetter: "B",
  explanation: [
    { label: "Why A was a trap:", body: "Jumping to a PIP skips the manager–employee relationship that SHRM expects you to support." },
    { label: "Why B is right:", body: "HR's role is to enable the manager, not bypass them. Coach first, intervene later." },
    { label: "Exam Lens:", body: "Which behavioral competency applies? Here: Interpersonal — strengthen the relationship before escalating." },
  ],
  domainTitleEyebrow: "SHRM-CP Body of Knowledge",
  domainTitleHeading: "Where SHRM-CP actually tests you",
  domains: [
    { number: 1, name: "HR Functional Knowledge", weight: 51 },
    { number: 2, name: "Behavioral Competencies", weight: 49, highlight: true },
  ],
  maxWeight: 60,
  callout:
    "Half the SHRM-CP is behavioral competency, not HR facts. Memorizing won't carry you.",
};

// ============================================================================
// ROUND 2 SCENARIOS — different angle for each Tier 1 cert
// ============================================================================

export const PMP2_CONFIG: ExamConfig = {
  variant: "pmp2",
  hookLine1: "Most PMP prep tools",
  hookLine2: "drill on PMBOK terms.",
  hookLine3: "We drill on PMI's reasoning.",
  lensName: "Exam Lens",
  questionDomain: "PMP · Domain: Process · Scope-creep scenario",
  questionBody:
    "Mid-execution, a stakeholder verbally requests a \"minor\" addition to project scope. What should the PM do",
  questionEmphasis: "first",
  options: [
    { letter: "A", text: "Implement immediately — it's a minor change" },
    { letter: "B", text: "Decline — change control is closed" },
    { letter: "C", text: "Submit it through integrated change control" },
    { letter: "D", text: "Escalate to the project sponsor for a decision" },
  ],
  wrongLetter: "A",
  correctLetter: "C",
  explanation: [
    { label: "Why A was a trap:", body: "\"Minor\" changes still bypass the process. PMI cares about the process, not the size." },
    { label: "Why C is right:", body: "Integrated change control is the PMI-prescribed path. Always route changes through it, no matter how small." },
    { label: "Exam Lens:", body: "What would PMI want you to do? Follow the process. The PM is the steward of integrated change control." },
  ],
  domainTitleEyebrow: "PMP Exam Content Outline",
  domainTitleHeading: "Where the PMP actually tests you",
  domains: [
    { number: 1, name: "People", weight: 42 },
    { number: 2, name: "Process", weight: 50, highlight: true },
    { number: 3, name: "Business Environment", weight: 8 },
  ],
  maxWeight: 55,
  callout:
    "Half of PMP is Process — and Process is judgement, not memory.",
};

export const SECPLUS2_CONFIG: ExamConfig = {
  variant: "secplus2",
  hookLine1: "Most Security+ prep tools",
  hookLine2: "test recall of definitions.",
  hookLine3: "We test how you respond.",
  lensName: "Exam Lens",
  questionDomain: "SY0-701 · Domain: Security Ops · Incident response",
  questionBody:
    "A SOC analyst sees ransomware encrypting files on a production server. What should they do",
  questionEmphasis: "first",
  options: [
    { letter: "A", text: "Begin malware analysis to identify the variant" },
    { letter: "B", text: "Notify executive leadership" },
    { letter: "C", text: "Isolate the affected server from the network" },
    { letter: "D", text: "Restore from the most recent backup" },
  ],
  wrongLetter: "D",
  correctLetter: "C",
  explanation: [
    { label: "Why D was a trap:", body: "Recovery before containment lets the attack keep spreading. You can't restore your way out of an active incident." },
    { label: "Why C is right:", body: "Containment is the next phase after identification. Isolate first — analyze, communicate, and recover after." },
    { label: "Exam Lens:", body: "Availability is under active attack. Containment protects what's still healthy. Phases: Identify → Contain → Eradicate → Recover." },
  ],
  domainTitleEyebrow: "CompTIA Security+ (SY0-701)",
  domainTitleHeading: "Where Security+ actually tests you",
  domains: [
    { number: 1, name: "General Security Concepts", weight: 12 },
    { number: 2, name: "Threats, Vulns, Mitigations", weight: 22 },
    { number: 3, name: "Security Architecture", weight: 18 },
    { number: 4, name: "Security Operations", weight: 28, highlight: true },
    { number: 5, name: "Security Program Management", weight: 20 },
  ],
  maxWeight: 32,
  callout:
    "28% of Security+ is Operations. Operations is process — knowing the IR phases beats knowing every tool.",
};

export const SHRM2_CONFIG: ExamConfig = {
  variant: "shrm2",
  hookLine1: "Most SHRM-CP prep tools",
  hookLine2: "drill on HR facts.",
  hookLine3: "We drill on HR judgment.",
  lensName: "Exam Lens",
  questionDomain: "SHRM-CP · Behavioral Competency · Business Acumen",
  questionBody:
    "A department head asks HR to fast-track terminating an underperforming employee in a protected class. Documentation is thin. What should the HR business partner do",
  questionEmphasis: "first",
  options: [
    { letter: "A", text: "Recommend immediate termination — performance is documented" },
    { letter: "B", text: "Ensure consistent progressive-discipline records exist first" },
    { letter: "C", text: "Refer the case to outside legal counsel" },
    { letter: "D", text: "Initiate the termination paperwork and schedule the conversation" },
  ],
  wrongLetter: "A",
  correctLetter: "B",
  explanation: [
    { label: "Why A was a trap:", body: "Skipping progressive discipline creates legal exposure — especially with a protected-class employee." },
    { label: "Why B is right:", body: "SHRM expects HR to balance business need with risk and process. Build the record before recommending action." },
    { label: "Exam Lens:", body: "Which competency applies? Business Acumen — protect the business by following the process, not by moving faster." },
  ],
  domainTitleEyebrow: "SHRM-CP Body of Knowledge",
  domainTitleHeading: "Where SHRM-CP actually tests you",
  domains: [
    { number: 1, name: "HR Functional Knowledge", weight: 51 },
    { number: 2, name: "Behavioral Competencies", weight: 49, highlight: true },
  ],
  maxWeight: 60,
  callout:
    "Half the SHRM-CP is judgment under HR Competencies. There's no flashcard for judgment.",
};

export const VARIANTS: Record<ExamVariant, ExamConfig> = {
  pmp: PMP_CONFIG,
  secplus: SECPLUS_CONFIG,
  shrm: SHRM_CONFIG,
  pmp2: PMP2_CONFIG,
  secplus2: SECPLUS2_CONFIG,
  shrm2: SHRM2_CONFIG,
};
