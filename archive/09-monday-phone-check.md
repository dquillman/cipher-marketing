# Monday Morning Phone Check — 2026-05-18

**Purpose:** 30-second spot-check from your phone that the launch posts actually went out. Not a deep review — just "did Buffer fire?"

**When:** Two checks Monday morning ET:
1. **08:05 AM ET** — five minutes after the LinkedIn post should have published
2. **09:05 AM ET** — five minutes after the X post should have published

Buffer publishes within ~30 seconds of the scheduled time, so a 5-minute buffer is plenty.

---

## 08:05 AM ET — LinkedIn check (15 seconds)

1. Open LinkedIn app
2. Tap your profile picture / **Me** → **View Profile**
3. Scroll to your most recent activity / posts
4. **Confirm:** the launch post (starts with "Cert prep tools haven't changed since 2010.") is visible, timestamped today
5. **Confirm:** the video is attached and renders a thumbnail (not a broken file icon)
6. **Done.** If it's there with video, move on.

## 09:05 AM ET — X check (15 seconds)

1. Open X app
2. Tap your profile → **Posts** tab
3. **Confirm:** the launch post (starts with "Cert prep tools haven't changed since 2010. Bigger banks.") is visible, timestamped today
4. **Confirm:** the video is attached and the thumbnail looks right
5. **Done.**

---

## What to do if something failed

### LinkedIn post didn't appear

1. Open Buffer mobile app → Queue
2. Look for the Monday 08:00 ET LinkedIn post — three possible states:
   - **Failed** (red icon) → tap it, read the error, **tap Retry**. Common cause: temporary auth lapse with LinkedIn. Retry usually clears it.
   - **Still in queue, scheduled for the future** → timezone misconfiguration. Edit the time to "now," save, hit Share Now.
   - **Gone / nothing in queue** → the post got eaten. Open `08-buffer-setup-sunday.md` on your phone (in the GitHub mobile app or via the dashboard at `http://localhost:8766/app.html` if you're near a laptop), copy Post 1's text + grab the video from your laptop, and post manually via the LinkedIn app.
3. If manual posting from phone is impractical (no laptop access), **don't panic** — the Wednesday post is the next beat. Skip Monday LinkedIn and tell Brad "Monday LinkedIn failed, recovered with [X]" during the walkthrough.

### X post didn't appear

Same flow as LinkedIn:
1. Buffer → Queue → find the Monday 09:00 ET X post
2. Retry if Failed, fix timezone if Scheduled in future, manually post from `08-buffer-setup-sunday.md` Post 2 copy if Gone.
3. X is more forgiving than LinkedIn for off-time posting — if you have to publish manually at 09:30 instead of 09:00, the algorithm difference is negligible.

### Both posts went out but the video looks broken

1. Open the post, tap the video to play. If it plays inline, you're fine — broken-looking thumbnails are usually cosmetic.
2. If it genuinely won't play, delete the post, re-upload the video from your laptop, and re-publish manually.
3. Make a mental note for the Wednesday/Friday posts: re-verify video uploads when scheduling.

### Both posts went out, video plays, BUT the UTM link looks wrong (e.g., points to wrong page)

1. **Don't delete the post** — engagement on a live post is more valuable than a clean UTM.
2. Log the issue in tomorrow's walkthrough so Brad records it in `dailyLog`.
3. We'll attribute the post's contribution to the Mon column manually if needed.

---

## After both checks pass (the normal case)

Text or DM yourself: "Mon launch posts live ✓" and move on with your day. Brad will pick up the actual engagement-grading conversation at the Tuesday morning walkthrough (24h gives meaningful early signal on LinkedIn impressions and X views).

**Don't** open Buffer analytics on your phone Monday — too noisy in the first few hours, too easy to over-react. Grade on Tuesday.

---

## Repeat checks for Wed 5/20 and Fri 5/22

Same drill: 08:05 ET LinkedIn check, 09:05 ET X check. The Wednesday and Friday posts use different videos but the same publishing rhythm. If Monday goes clean, Wed and Fri are usually a non-event — but still do the 30-second spot-check, because Buffer queues can quietly fail and you won't notice until Brad pulls metrics 48h later.
