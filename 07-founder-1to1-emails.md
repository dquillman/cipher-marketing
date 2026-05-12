# 07 — Founder 1:1 Emails (Week 1)

> **Why this exists.** The automated Resend onboarding drip (blocker `resend-sequence`) is deferred until Week 2. For Week 1, every signup gets a personal email from Dave instead. At <25 activated users, founder touches outperform any drip on signal-quality, testimonial-yield, and brand loyalty.

## Rules of engagement

1. **Send these from your personal email address, not a no-reply.** Dave Quillman → user. Looks like a human, gets answered like a human.
2. **Reply within the email — never close a thread.** If they reply with feedback, that's gold; engage back.
3. **Save every reply** that contains feedback or a quote-worthy line — paste it to Brad and we'll log it.
4. **No CTA in Day 0 or Day 3.** These are listening emails, not selling emails. Day 6 has a soft CTA.

---

## Day 0 — sent within 4 hours of signup

**Subject:** Hey from CipherExam

```
Hey {firstName} —

Dave from CipherExam. Just saw you signed up — thanks for trying it out.

Quick question: what made you check us out? I'm trying to understand who CipherExam actually helps so I can build it better.

(Just hit reply — three words is fine.)

— Dave
```

**Why this works:**
- Founder shows up personally, immediately. That alone is rare and memorable.
- Asks ONE question. "Three words is fine" lowers the bar — they actually answer.
- No CTA. They're not yet activated; pushing them to do something would feel salesy.

---

## Day 3 — only if user has activated (`activated_user` event fired)

**Subject:** Saw you hit question 10 — what's the gut take?

```
Hey {firstName} —

Saw you got past 10 questions on {examName} — that's the milestone that tells me you actually used the thing, not just looked at it. So thank you.

What's your honest reaction so far? Specifically:

1. Did the AI explanations make sense, or was anything confusing?
2. What's missing that would make this an obvious yes for you?

If there's nothing useful here, that's also a totally valid answer. I just want to know.

— Dave
```

**Why this works:**
- They've ALREADY engaged (10 questions = real signal), so this isn't a cold ask.
- "Honest reaction" + "totally valid" gives them permission to criticize. That's where the gold is.
- Two specific questions are easier to answer than one open question.

---

## Day 6 — soft CTA, only if user hasn't yet converted to paid

**Subject:** A favor + a question on day 6

```
Hey {firstName} —

You're 6 days into the free trial. Two things:

The favor — if CipherExam has been useful, mind dropping a one-sentence reaction inside the app? You'll see a prompt the next time you finish 10 questions. It's the kind of thing that helps other people studying for {examName} find this.

The question — when is your {examName} exam? Trying to map our content roadmap to when people actually need it most.

— Dave

P.S. Trial ends in {daysLeft}. $99 lifetime is still on if you want it: cipherexam.com/lp/{examSlug}
```

**Why this works:**
- Soft testimonial ask piggybacks on the in-app prompt (cipher#10).
- Asking about exam date is a useful signal AND makes them feel seen.
- P.S. mentions trial expiry and price without pushing — they already know it's there.

---

## Per-exam tweaks

Swap `{examName}` and `{examSlug}` per user:
- PMP → `PMP` / `pmp`
- Security+ → `Security+` / `security-plus`
- SHRM-CP → `SHRM-CP` / `shrm-cp`

---

## How Brad surfaces these in the daily walkthrough

When Dave runs the morning briefing, Brad asks: *"Any new signups since yesterday?"* If Dave reports signups, Brad asks for each: name, email, exam, days since signup. Then Brad:

- **Day 0 unsent** → recommend Day 0 template
- **Day 3 + activated** → recommend Day 3 template
- **Day 3 + not activated** → recommend a one-off nudge ("Want help getting unstuck?")
- **Day 6 + not paid** → recommend Day 6 template

Dave pastes the email into his email client, personalizes the `{firstName}`, sends, then tells Brad *"sent"*. Brad logs the touch in `campaign-state.json → dailyLog`.

---

## Migration plan to Resend drip (Week 2)

Once Week 1 ends and we have ~5-10 founder emails sent + replies analyzed:

1. Identify the 2-3 reply themes that came back most often
2. Use those themes to write Email 4-7 of the automated drip (Resend takes over)
3. Day 0 + Day 3 + Day 6 founder emails stay manual until activated count > 50/week — they remain the highest-leverage touches.
