// Authenticated Firestore access for the CLI scripts.
//
// campaign/* used to be world-readable, so the scripts talked to the REST API
// with just an API key. firestore.rules now requires an authenticated
// marketingAdmin, which made every unauthenticated read and write return 403 —
// seed-firestore.mjs was silently dead until this was noticed on 2026-08-01.
//
// Credential resolution, first match wins:
//   1. FIREBASE_SERVICE_ACCOUNT  — path to a service-account JSON key
//   2. GOOGLE_APPLICATION_CREDENTIALS — the standard ADC env var
//   3. Application Default Credentials already on the machine
//
// Anything the Admin SDK opens bypasses security rules, which is why this is
// deliberately explicit rather than magic: you know when a script is running
// with elevated access.

import { readFileSync } from "node:fs";

export const PROJECT_ID = "cipher-marketing-daveq";

let cached = null;

export async function getDb() {
  if (cached) return cached;

  const { initializeApp, cert, applicationDefault, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let credential;
  let via;

  if (keyPath) {
    const parsed = JSON.parse(readFileSync(keyPath, "utf8"));
    if (parsed.project_id && parsed.project_id !== PROJECT_ID) {
      throw new Error(
        `service account is for project "${parsed.project_id}", not ${PROJECT_ID}.\n` +
        `A key from another project cannot read this campaign data.`
      );
    }
    credential = cert(parsed);
    via = `service account (${keyPath})`;
  } else {
    credential = applicationDefault();
    via = "application default credentials";
  }

  if (!getApps().length) initializeApp({ credential, projectId: PROJECT_ID });
  cached = getFirestore();
  cached.__via = via;
  return cached;
}

export function credentialHelp() {
  return [
    "",
    "Firestore needs an authenticated credential.",
    `campaign/* requires a marketingAdmin, so the anonymous REST path returns 403.`,
    "",
    "To enable these scripts, create a service-account key once:",
    "  1. https://console.firebase.google.com/project/cipher-marketing-daveq/settings/serviceaccounts/adminsdk",
    "  2. Generate a new private key (downloads a JSON file)",
    "  3. Point the scripts at it:",
    "       set FIREBASE_SERVICE_ACCOUNT=C:\\path\\to\\key.json      (cmd)",
    "       $env:FIREBASE_SERVICE_ACCOUNT='C:\\path\\to\\key.json'   (PowerShell)",
    "",
    "Keep the key out of the repo — it grants full admin access and bypasses rules.",
    "",
  ].join("\n");
}
