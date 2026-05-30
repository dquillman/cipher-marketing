# 12 — Free-Tier Taste Window (board todo #7)

> **Shipped 2026-05-28.** Loosens the free-tier daily cap from a flat 5/day to a 7-day "taste window" of 20/day followed by 5/day steady-state. Addresses board feedback that 5/day is the *opposite* of "let me show you what this is."

## What changed

| State | Before | After |
|---|---|---|
| Pro / active trial / tester | Unlimited | Unlimited (unchanged) |
| Free-tier, account age < 7d, no trial yet | 5/day | **20/day** |
| Free-tier, within 7 days of trial expiration | 5/day | **20/day** |
| Free-tier, beyond 7 days post-signup AND beyond 7 days post-trial | 5/day | 5/day (unchanged) |

### Why anchor to "max(signup, trial-end)"?

The current product flow auto-grants a 14-day trial on signup. If the taste window started at signup alone, it'd be entirely consumed by the trial — never user-visible. Anchoring to `max(createdAt, trialEndsAt)` gives a soft 7-day landing AFTER the trial expires (the high-churn moment), AND gives a soft landing to users who somehow end up free-tier without a trial (edge case).

## Files

**NEW (2):**
- `Cipher/web/src/utils/freeTier.ts` — frontend helper
- `Cipher/functions/src/freeTier.ts` — backend helper (mirror — must stay in sync)

**MODIFIED (2):**
- `Cipher/web/src/contexts/SubscriptionContext.tsx` — replaced `const DAILY_LIMIT = 5` with computed value from `getFreeTierDailyLimit(...)`
- `Cipher/functions/src/validateQuizStart.ts` — same swap on the backend

## The policy in code

```typescript
export const FREE_TIER = {
  STEADY_LIMIT: 5,
  TASTE_LIMIT: 20,
  TASTE_WINDOW_DAYS: 7,
} as const;

// Returns 20 if (now - max(accountCreatedAt, trialEndsAt)) < 7 days, else 5.
// Returns 5 if both anchors are null/invalid (safe default).
getFreeTierDailyLimit({ accountCreatedAt, trialEndsAt });
```

## The sync rule

Frontend and backend each have their own copy. They MUST stay in sync, or client and server will disagree on the cap (presents as flaky "you're over / no you're not" UX). The doc-comment in each file says this explicitly.

If you ever change the constants, change both. The 4-line policy means a diff in either file is obvious in code review.

## Testing — manual smoke

```powershell
# Frontend
cd G:\Users\daveq\Cipher\web
npm run build  # tsc should pass clean
npm run dev    # open localhost, sign up a fresh test user, observe banner

# Backend
cd G:\Users\daveq\Cipher\functions
npm run build  # tsc
firebase emulators:start --only functions
# Call validateQuizStart from the emulator console with a test uid
```

Manual scenarios to verify:
1. **Brand-new signup, trial active:** banner shouldn't show (Pro/trial bypasses)
2. **Trial-expired yesterday:** banner shows "X / 20 questions" — not "X / 5"
3. **Trial expired 10 days ago:** banner shows "X / 5"
4. **Free-tier from day 0 (edge case, no trial):** banner shows "X / 20"

## Visual UI consideration

The existing banner reads "Free plan: X / 5 questions used today" — that text is computed from `dailyLimit` in `SubscriptionContext`, so it now dynamically shows 20 or 5 with no copy change required. Worth a quick visual check after deploy that the banner color thresholds (amber at 3, red at 5) feel right when the cap is 20. Recommend bumping those thresholds proportionally if needed: amber at 14, red at 20. Not blocking — current thresholds just feel cautious sooner.

## Marketing copy implications

The `/pricing` page currently says Starter "Daily Quiz (5 questions/day)." That copy is now wrong for users in the taste window. Options:

- **(A) Leave it.** It's the worst-case cap; the taste window is a soft surprise that delights, not a promise.
- **(B) Update to:** "Daily Quiz — up to 20 questions/day in your first week, then 5/day."

Recommend (B) only if the board todo #2 (lead magnets) ships in the same week — otherwise the LP copy is inconsistent with itself. For now leave (A) and revisit when the LP testimonial deploy lands.

## Rollback

```bash
cd G:\Users\daveq\Cipher
git revert <commit>
cd web && npm run build && firebase deploy --only hosting
cd ../functions && npm run build && firebase deploy --only functions:validateQuizStart
```

The constants are isolated; reverting either side independently is safe but leaves the other side disagreeing on the cap — revert both at once.
