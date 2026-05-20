# Grade-post Cloud Function — deploy steps

The dashboard's "Grade this post" button POSTs to `/api/grade`, which is rewritten by Firebase Hosting to this Cloud Function. The function:

1. Loads the post + benchmarks from Firestore (`campaign/posts`).
2. Computes engagement rate + link click rate.
3. Compares against channel benchmarks → assigns A/B/C/D.
4. Calls Claude (Sonnet 4.6) for short interpretive notes + one recommendation.
5. Writes `metrics`, `grade`, `gradeNotes`, `recommendations` back to the post.
6. Firestore `onSnapshot` in the dashboard live-updates the card automatically.

## One-time setup

### 1. Confirm the project is on Blaze plan
Cloud Functions require pay-as-you-go. Free tier covers ~2M invocations/mo — grading volume will sit at $0.

- Open: https://console.firebase.google.com/project/cipher-marketing-daveq/usage/details
- If it says "Spark" → click "Modify plan" → choose "Blaze" → add a billing card.

### 2. Install function dependencies (one-time)

```
cd functions
npm install
cd ..
```

### 3. Create an Anthropic API key

- Go to https://console.anthropic.com/settings/keys
- Click "Create Key" → name it `cipher-grade-fn` → copy the key (starts with `sk-ant-...`).

### 4. Store the key as a Firebase secret

```
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Paste the key when prompted. The secret is stored in Google Secret Manager and only the function can read it.

### 5. Deploy

```
firebase deploy --only functions,hosting
```

First deploy takes ~3 min (function build + container push). Subsequent deploys are ~30s.

### Verify it works

Open the dashboard → click "Grade this post" on any posted-status card → fill metrics → submit. Should show "Graded X — closing…" within a few seconds, and the card should re-render with the grade pill.

## Maintenance

- **Rotate the API key**: re-run `firebase functions:secrets:set ANTHROPIC_API_KEY` then re-deploy.
- **Change model**: edit `MODEL` in `functions/index.js` and redeploy.
- **Adjust benchmarks**: edit `site/data/posts.json` `benchmarks` block, then `node scripts/seed-firestore.mjs` to push to Firestore.

## Local testing

To test locally without deploying:

```
firebase emulators:start --only functions,firestore,hosting
```

Then the dashboard at `localhost:5000` will route `/api/grade` to the local emulated function. (Still needs the API key — set it via `.runtimeconfig.json` or pass `ANTHROPIC_API_KEY` env var.)
