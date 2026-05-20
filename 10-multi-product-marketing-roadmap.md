# 10 — Multi-Product Marketing Roadmap

> **Status:** Vision doc. Not for execution yet — written 2026-05-18, launch day of CipherExam Week 1.
> **Trigger:** Dave wants Brad to eventually orchestrate marketing across his full app portfolio (CipherExam, Migraine Tracker, and beyond) — not just CipherExam.
> **Guiding principle:** Generalize ONLY after the pattern works for one product. CipherExam Week 1–4 is the proof. Multi-product work starts after that signal is in.

---

## Vision (one paragraph)

Brad becomes a **multi-product marketing orchestrator**. When Dave says "draft tomorrow's post," Brad knows which product is in scope (from context or a quick clarifying question), pulls the product's brand voice + competitive landscape, drafts copy that's both on-brand AND positioned against that product's specific competitors, then writes to that product's campaign state. The dashboard at `dashboard.[primary-domain]` shows a product picker — Dave switches products with one click and sees that product's posts, decisions, blockers, and metrics in isolation.

---

## The architecture (replicable per product)

Brad's current design is already modular, which makes it scale. The replicable pieces:

| Layer | What it is | Per-product? | Where it lives |
|---|---|---|---|
| **Agent file** | Persona, workflow, delegation logic | One per product (sharing a core) | `~/.claude/agents/<product>-marketing.md` |
| **Context skill** | Product facts, audience, brand voice, **competition** | One per product | `~/.claude/skills/<product>-context/SKILL.md` |
| **State files** | Campaign progress, posts, decisions, log | One per product | `G:\Users\daveq\<product>-marketing\` |
| **Dashboard** | UI to see/edit state | Shared (multi-tenant) | `dashboard.[primary-domain]` post-Firebase |

---

## Phased rollout

### Phase 1 — Prove the pattern with CipherExam (NOW — through ~2026-06-15)
**Goal:** One product, one Brad, real numbers. Don't generalize until this works.

- Run CipherExam Week 1 through Week 4 (2026-05-18 → 2026-06-15)
- Hit the 55 activated-user target (PMP 30 / Sec+ 15 / SHRM-CP 10)
- Identify which hook converts (tool-builder, why-B-is-a-trap, domain-weights)
- Migrate dashboard to Firebase + Firestore (Week 2 work, see roadmap entry below)
- Lock the Brad pattern: what worked, what didn't, what should generalize vs. stay product-specific

**Gate:** Don't start Phase 2 until at least 25 activated CipherExam users + 1 graded post with metrics.

### Phase 2 — Refactor Brad into "core + product-specific" (~2026-06-15 → 06-22)
**Goal:** Extract the reusable pattern without breaking CipherExam.

- Create `~/.claude/agents/marketing-orchestrator-core.md` — the shared persona/workflow logic
- Refactor `cipher-exam-marketing.md` into a thin file that **extends** the core + adds CipherExam-specific overrides (briefing format preferences, delegation routes, etc.)
- Verify zero behavioral regression on CipherExam runs
- Document the "how to add a product" playbook (see checklist below)

### Phase 3 — Add Migraine Tracker as product #2 (~2026-06-22 → 07-06)
**Goal:** First validation that the pattern transfers.

- Write `migraine-tracker-context` skill (with full competitive landscape — Migraine Buddy, N1-Headache, Bearable, etc.)
- Create `migraine-marketing.md` agent (extends marketing-orchestrator-core)
- Set up `G:\Users\daveq\migraine-tracker-marketing\` with starter `posts.json` + `campaign-state.json`
- Run a 2-week Migraine Tracker campaign in parallel with ongoing CipherExam work
- Measure: does the same Brad pattern produce on-brand work for a totally different product/audience? If yes → Phase 4. If not → debug.

### Phase 4 — Multi-tenant dashboard (~2026-07-06 → 07-20)
**Goal:** One UI for all products.

- Firebase project gets a `products/` collection with one doc per product
- Dashboard nav gets a product picker dropdown
- Switching product loads that product's `posts/`, `campaignState/`, `dailyLog/` collections
- Brad picks up product context from the dashboard's selected product

### Phase 5+ — Scale to remaining apps (~2026-07-20 onward)
Add additional products as they become marketing priorities. Per-product setup time should be ~4 hours once the pattern is stable.

---

## Per-product setup checklist

When adding a new product to the multi-product Brad system:

1. **Discovery (interview Dave for 30 min):**
   - What does the product do, in one sentence?
   - Who is the target user (job/life-stage/pain point)?
   - What is the pricing model?
   - Who are the top 3–5 competitors? What's each one's positioning?
   - What's the founder narrative for this product (if it's also a founder-marketing channel)?
   - What's the brand voice? Same as CipherExam (direct, plain-spoken) or different?

2. **Write the context skill (3–5 hr):**
   - Verify product details against the live site/app
   - Write a competitive landscape table (competitor / their angle / their weakness / your wedge)
   - Define brand voice guardrails (frames to use, frames to avoid)
   - List existing content (blog, social, ads) that already exists — Brad shouldn't duplicate it
   - Tag assumptions clearly so they can be confirmed later

3. **Create the agent file (30 min):**
   - Copy the marketing-orchestrator-core template
   - Override per-product preferences (briefing format, default channels, delegation routes)
   - Reference the product's context skill explicitly

4. **Set up campaign state (2–3 hr):**
   - Create `G:\Users\daveq\<product>-marketing\` (or in Firestore once multi-tenant ships)
   - Initialize `posts.json` schema + `campaign-state.json` schema
   - Write the first campaign brief (`00-campaign-brief.md`)

5. **First-week test campaign (ongoing):**
   - Have Brad draft 3 posts for the new product
   - Voice-check against the context skill
   - Course-correct if anything reads off-brand

---

## Competition-aware Brad — how it works

This is the wedge that makes multi-product Brad actually valuable (vs. a generic copywriter).

### Static layer (today, hand-curated)

Each product's context skill has a **Competitive landscape** section like:

```markdown
## Competition (verified YYYY-MM-DD)

| Competitor | Their angle | Their weakness | Our wedge against them |
|---|---|---|---|
| Migraine Buddy | Tracking + community, free w/ ads | Generic insights | Personalized pattern recognition |
| N1-Headache | Clinical-grade, $X/mo | Cold, intimidating UX | Warm, "your migraine, not stats" |
| Bearable | All-symptoms tracker | Tries to do everything | Migraine-specific depth |
```

When Brad drafts copy, he reads this section and **picks a hook that explicitly contrasts to a competitor weakness**.

Example (Migraine Tracker, riffing on "Migraine Buddy's averages"):
> "Your migraine app's 'insights' are just averages from strangers.
> Yours should be from you.
> [App name] learns YOUR pattern."

Same logic CipherExam already uses:
> "Cert prep tools haven't changed since 2010."
> ← that's a direct shot at Magoosh / Mometrix / Boson without naming them.

### Dynamic layer (future — see Phase 6 below)

A `competitor-researcher` subagent that Brad delegates to. Refreshes the table from live web research instead of relying on hand-curated info that goes stale.

---

## Phase 6 — Active competitive intelligence (marketing-aligned) — ~2026-08+

**Goal:** Brad doesn't just *use* competitor info — he refreshes it.

### How it works

```
Dave: "Brad, refresh competitive intel for CipherExam"
    ↓
Brad delegates to → competitor-researcher subagent (NEW)
    ↓
Subagent uses WebSearch / WebFetch on:
  - Competitor websites (pricing, feature pages, blog)
  - LinkedIn Ad Library + Meta Ad Library (their active ads)
  - Recent press releases / product hunt launches
  - Review sites (G2, Capterra, Trustpilot) for sentiment shifts
    ↓
Returns a PROPOSED DIFF to the product's context skill:
  - "Add new competitor: Foo Cert Prep launched 2026-07-11"
  - "Update Magoosh: their pricing dropped from $99 to $79"
  - "Update Boson weakness column: now offers PBQs (was our wedge)"
    ↓
Dave reviews the diff → approves or rejects
    ↓
Skill file gets updated → future Brad ads use fresh intel
```

### Constraints

- **Never auto-updates the skill file** — always proposes for human review. Hallucinated competitor info would be worse than stale info.
- **Cites sources** — every claim in the proposed diff includes a URL.
- **Runs quarterly per product** — not daily. Markets don't shift that fast, and the cost (Brad's tokens + your review time) compounds.
- **On-demand also supported** — "Brad, did anyone launch in the PMP space this week?" → researcher runs a targeted scan.

### Effort

- Build time: 1–2 days
- Maintenance per product per quarter: ~2 hr (Dave reviews the diff, approves)

---

## Phase 7 — Product feedback loop (product-aligned, NOT Brad) — ~2026-09+

**Goal:** Surface product change recommendations based on competitive gaps + user signals. This is a **separate function from Brad** — Brad is your CMO, this is your product strategist.

### Why a separate agent

Brad's job is to sell what exists. A product strategist's job is to recommend what should exist next. Those decision frames conflict — a marketer should never be the one deciding the roadmap.

### How it works

```
Dave: "Run product signal review for CipherExam"
    ↓
NEW product-strategist agent reads:
  - Refreshed competitive intel (from Brad's Phase 6 work)
  - Firestore user feedback / testimonials / support tickets
  - GA4 funnel drop-off data + activation analytics
  - Recent reviews / app store ratings
    ↓
Returns a prioritized list of signals:
  - "Top request from candidates: feature X (12 mentions this month)"
  - "Competitor Y launched Z — closes our wedge from May"
  - "Activation drops 40% at step 3 of onboarding"
    ↓
Dave decides what hits the product roadmap
```

### Constraints

- **Does NOT auto-prioritize** — surfaces signals with evidence, Dave decides.
- **Runs monthly per product** — slower cadence than Brad's quarterly because product roadmap moves slower than marketing.
- **Never recommends without evidence** — every signal has either a competitor URL, a user quote, or a metric.
- **Routes to the right backlog** — CipherExam product changes go to the Cipher repo's roadmap, not into Brad's marketing world.

### Effort

- Build time: 3–5 days (needs Firestore read access, possibly support-ticket integration)
- Maintenance per product per month: ~1 hr (Dave reviews signals, decides what to act on)

---

## Updated phase timeline

| Phase | Description | Window | Gate |
|---|---|---|---|
| 1 | Prove CipherExam pattern (single product) | 2026-05-18 → 06-15 | Hit 25+ activated users |
| 2 | Extract `marketing-orchestrator-core` | 2026-06-15 → 06-22 | Zero CipherExam regression |
| 3 | Add Migraine Tracker (product #2) | 2026-06-22 → 07-06 | Pattern transfers to different audience |
| 4 | Multi-tenant dashboard | 2026-07-06 → 07-20 | Product picker works, Brad reads selected product |
| 5 | Scale to remaining apps | 2026-07-20+ | Per-product setup time ≤ 4 hr |
| **6** | **Active competitive intelligence** (new) | **~2026-08+** | **Quarterly refresh works without hallucinations** |
| **7** | **Product feedback loop** (new, separate agent) | **~2026-09+** | **Monthly signal review feeds product roadmap** |

**Maintenance:** Competitor landscape refresh quarterly (Phase 6); product signal review monthly (Phase 7). Both should have calendar reminders once running.

---

## Brad evolution path (4-step)

1. **One Brad, one product** ← TODAY. CipherExam-only.
2. **Core + extensions** — `marketing-orchestrator-core` (shared) + `cipher-exam-marketing` (extends core). Same behavior, cleaner code.
3. **Multiple specialist Brads** — Cipher Brad, Migraine Brad, etc. Each is a thin extension of the core. Dave invokes them by product context.
4. **Top-level orchestrator Brad** — Dave just says "Brad" without naming the product. Top-level Brad asks "which product?" or infers from recent context, then delegates to the specialist.

Step 4 is overkill until you have 3+ products live. Skip it unless multi-product becomes the daily mode.

---

## Open questions (resolve at decision-points, not now)

| Question | When to answer | Default until then |
|---|---|---|
| Should each product have its own X / LinkedIn account, or do they all share Dave's personal accounts? | Phase 3 (Migraine launch) | Default: founder personal accounts. Spawn brand accounts only when a product has product-led growth (not founder-led). |
| Should the unified dashboard live at `dashboard.cipherexam.com` or a neutral domain (e.g., `daveq.app/dashboard`)? | Phase 4 | Default: neutral domain — `dashboard.cipherexam.com` ties the dashboard to one product visually. |
| How does Brad route email replies / DMs from multiple products? | Phase 3 | Default: separate inboxes per product. Brad helps draft replies on request, doesn't auto-respond. |
| Should grading benchmarks be per-product (LinkedIn engagement floors differ by audience)? | Phase 3 (when migraine post data lands) | Default: yes, per-product benchmarks live in each product's `posts.json` `benchmarks` section. |
| Do we extract a "voice-check" subagent that all products share? | Phase 4 | Default: each product's context skill has voice rules. Voice-check is a workflow inside each Brad. |

---

## Out of scope (won't do)

- A SaaS platform sold to other founders for marketing their products. This roadmap is for Dave's own apps only.
- Auto-posting (no Buffer, no Publer) — manual posting via native schedulers remains the model.
- Multiple brand voices per product. One product = one voice. If a product needs two voices, that's a sign it should be two products.
- AI-generated competitive intel without human review. Competitor research stays human-curated and refreshed quarterly.

---

## Reference docs (related)

- [00-campaign-brief.md](00-campaign-brief.md) — Week 1 CipherExam launch brief
- [06-engineering-handoff.md](06-engineering-handoff.md) — current state of code-shipped vs. runtime-pending
- [08-enhancement-backlog.md](08-enhancement-backlog.md) — Tier 1-4 enhancement priorities
- `~/.claude/skills/cipher-exam-context/SKILL.md` — first product context skill (template for future ones)
- `~/.claude/agents/brad.md` — current single-product Brad (template for marketing-orchestrator-core extraction)

---

## Status updates

- **2026-05-18:** Doc created on CipherExam launch day after Dave asked "can Brad be modified to market multiple apps and understand competition." Vision captured, sequencing gated on Week 1–4 CipherExam signal. Next review: 2026-06-15 (end of CipherExam Week 4).
- **2026-05-18 (later):** Dave asked follow-up: "Will Brad look for competitors and analyze how the app can change?" Added Phase 6 (active competitive intelligence — marketing-aligned, stays inside Brad) and Phase 7 (product feedback loop — explicitly separate `product-strategist` agent). Drew a hard boundary between marketing decisions and product roadmap decisions — Brad never recommends product changes; product-strategist never writes ad copy. Both new phases gated on Phase 5 being stable.
