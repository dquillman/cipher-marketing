# 11 — PMI-LP Testimonial Rollout (board todo #1)

> **Shipped 2026-05-28.** Implements board todo item #1 (testimonial strip on all 3 Tier 1 LPs) under the PMI-LP attribution rule encoded in `cipher-exam-context` on 2026-05-28.

## What changed

| Surface | Before | After |
|---|---|---|
| `/lp/pmp` (PMI LP) | No testimonial (hero badge disabled, no mid-page strip) | Hero badge + mid-page TestimonialsSection — **institutional credential only, no contributor name anywhere in source or rendered output** |
| `/lp/security-plus` (non-PMI) | Hero badge only (credential, no name) | Hero badge + mid-page TestimonialsSection with full attribution |
| `/lp/shrm-cp` (non-PMI) | Hero badge only (credential, no name) | Hero badge + mid-page TestimonialsSection with full attribution |

## Architecture — why a name cannot leak on PMI LPs

Two separate data files; tree-shaking guarantees PMI LP route bundles never include any banned strings.

```
src/data/
  testimonials.pmi-safe.ts   ← imported by /lp/pmp. Neutral IDs.
                                 No name, no PgMP credential. Period.
  testimonials.full.ts       ← imported by /lp/security-plus and
                                 /lp/shrm-cp. Full attribution.

src/components/
  TestimonialsSection.tsx    ← discriminated-union variant prop;
                                 TS prevents calling variant="pmi-safe"
                                 against full data, or vice versa.

src/pages/landing/
  LandingShell.tsx           ← Hero now takes testimonialBadge variant
                                 ("pmi-safe" | "full" | "none"). Reads from
                                 the matching data file. Source comments
                                 scrubbed of contributor name.

  PmpPracticeLP.tsx          ← uses testimonialBadge="pmi-safe" + <TestimonialsSection variant="pmi-safe" />
  SecurityPlusPracticeLP.tsx ← uses default ("full") + <TestimonialsSection variant="full" />
  ShrmCpPracticeLP.tsx       ← uses default ("full") + <TestimonialsSection variant="full" />

tests/
  testimonials-attribution.spec.ts ← Playwright E2E. Renders each LP and
                                       asserts no banned strings in HTML.
                                       Fails CI on regression.
```

## The PMI-safe attribution string

On `/lp/pmp` (and any future PMI LP), the rendered attribution is:

> `— PMI AI Standards Core Team Member, CipherExam beta tester`

Not the name. Not "PgMP". Just the institutional credential plus the generic role.

## Files changed

**New (5):**
- `web/src/data/testimonials.pmi-safe.ts`
- `web/src/data/testimonials.full.ts`
- `web/src/components/TestimonialsSection.tsx`
- `web/tests/testimonials-attribution.spec.ts`
- `cipher-marketing/11-pmi-lp-testimonial-rollout.md` (this file)

**Modified (4):**
- `web/src/pages/landing/LandingShell.tsx` — renamed `showMarkusBadge` → `testimonialBadge` (variant), scrubbed name from source comments, badge now pulls from data files
- `web/src/pages/landing/PmpPracticeLP.tsx` — re-enabled badge as `testimonialBadge="pmi-safe"`, added `<TestimonialsSection variant="pmi-safe" />` mid-page
- `web/src/pages/landing/SecurityPlusPracticeLP.tsx` — added `<TestimonialsSection variant="full" />` mid-page
- `web/src/pages/landing/ShrmCpPracticeLP.tsx` — added `<TestimonialsSection variant="full" />` mid-page

## Visual spec

### Hero badge (all 3 LPs)
- Existing component, unchanged layout — rounded-full pill, dark slate `bg-slate-900/50`, brand-400 quote marks, slate-300 italic quote text, slate-700 separator, slate-300 credential text
- Mobile: stacks vertically (column)
- Desktop: row layout with vertical separator

### Mid-page TestimonialsSection (all 3 LPs)
- Positioned between the TryAQuestion CTA and PricingCard — tips the scale right before the pricing decision
- Heading: `"What credentialed practitioners are saying"` (intentionally generic; works for both PMI-safe and full variants)
- Grid: `sm:grid-cols-2 lg:grid-cols-3` — currently renders 1 card filled + 2 empty slots (filled as more testimonials are collected)
- Card: rounded-2xl, `border-slate-800`, `bg-slate-900/50`, padding 6, brand-400 quote marks, slate-300 italic body, slate-400 attribution
- Background: inherits LP dark surface (no contrasting band; section is `max-w-5xl mx-auto` with `py-12`)
- Brand fonts: Satoshi + General Sans inherited from the LP shell (Tailwind 4 theme tokens)

### Empty-slot strategy
The PMI-safe data file currently has 1 testimonial + 2 commented "slots." On a 3-col layout this renders as 1 filled card. As 2 more PMP-cluster testimonials are collected (from non-conflicting beta testers), they get appended to `PMI_SAFE_TESTIMONIALS` and the grid fills out. No code changes needed — just data appends.

## Testing

```bash
cd web
npx playwright test tests/testimonials-attribution.spec.ts
```

5 assertions:
- `/lp/pmp` rendered HTML contains none of `["Markus", "Kopko", "PgMP"]`
- `/lp/pmp` rendered HTML DOES contain `"PMI AI Standards Core Team Member"`
- `/lp/security-plus` rendered HTML contains `"Markus Kopko"`
- `/lp/shrm-cp` rendered HTML contains `"Markus Kopko"`
- (Implicit) Build emits a separate route bundle that, when grep'd, contains no banned strings on the PMP route

## Pre/post measurement plan

Mark deploy in `campaign-state.json` so we can compare activation rate windows:

```json
{
  "date": "2026-05-28",
  "entry": "Testimonial strips deployed on all 3 Tier 1 LPs. PMP uses pmi-safe variant (institutional credential only). Sec+/SHRM-CP use full attribution. Marker for pre/post activation rate comparison."
}
```

7-day post-deploy review: did activation rate on `/lp/pmp` move from 0/55 baseline? Anything below +1 activation on PMP after 7 days suggests the testimonial isn't the bottleneck — pivot to board todo #5 (Clarity session recordings) to find the real funnel drop.

## Rollback

If a name leak is discovered post-deploy:

```bash
# Revert the 4 page/shell modifications and the data files
cd G:\Users\daveq\Cipher
git revert <commit>
npm run build && firebase deploy --only hosting
```

The Playwright test is the early-warning. CI failing on `testimonials-attribution.spec.ts` blocks deploy automatically.

## Anti-patterns to avoid going forward

- ❌ Importing `testimonials.full.ts` into any PMI LP component — defeats tree-shaking
- ❌ Adding a `fullName` field (or any name string) to `testimonials.pmi-safe.ts` — fails CI
- ❌ Renaming the variant from `"pmi-safe"` to something abbreviated — `"safe"` etc. — keep it descriptive so the call-site reads as a policy choice
- ❌ Putting a contributor name in a `data-*` attribute, alt text, or JSON-LD schema on a PMI LP — Playwright greps full HTML, so it'd catch this, but design it out before someone tries
- ❌ Re-enabling the old `showMarkusBadge` prop name — the rename was deliberate to scrub source-code leaks of the codename
