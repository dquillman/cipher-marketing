// Operator ID tokens for unattended scripts calling /api/grade.
//
// The grade endpoint authenticates a Firebase ID token carrying the
// marketingAdmin claim — the dashboard gets one from an interactive Google
// sign-in. A scheduled routine has no browser, so it mints one instead:
//
//   service-account key -> custom token (with the claim) -> ID token
//
// Writing grades straight to Firestore with the Admin SDK would skip the
// endpoint entirely, and with it the letter-grade rubric, the AI notes, and
// the derived rates. A second copy of that logic would drift from the first,
// so the routine goes through the same door the dashboard does.

import { readFileSync } from 'node:fs';
import { PROJECT_ID } from './firestore-access.mjs';

// Public client key — same value already shipped in site/app.html. Only used
// here to exchange a custom token; it grants nothing on its own.
const WEB_API_KEY = 'AIzaSyDDSPC14tdDzMfkDrYLFykg2CFOZK9B4Ts';

// Dedicated identity so automated grades are attributable in the audit trail
// and can be revoked without touching Dave's own account.
export const ROUTINE_UID = 'cipher-marketing-routine';

export const API_BASE = 'https://cipher-marketing-daveq.web.app';

let cachedToken = null;
let cachedUntil = 0;

export async function operatorIdToken() {
  // ID tokens live an hour; a routine grading several posts should mint once.
  if (cachedToken && Date.now() < cachedUntil) return cachedToken;

  const { initializeApp, cert, applicationDefault, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credential = keyPath ? cert(JSON.parse(readFileSync(keyPath, 'utf8'))) : applicationDefault();
  if (!getApps().length) initializeApp({ credential, projectId: PROJECT_ID });

  const auth = getAuth();
  // The routine user need not pre-exist; a custom token creates it on first
  // exchange. The claim rides on the token itself, so no setCustomUserClaims
  // round-trip is needed.
  const customToken = await auth.createCustomToken(ROUTINE_UID, { marketingAdmin: true });

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  const json = await res.json();
  if (!res.ok || !json.idToken) {
    throw new Error(
      `could not mint an operator token: ${json?.error?.message || `HTTP ${res.status}`}`,
    );
  }

  cachedToken = json.idToken;
  cachedUntil = Date.now() + 50 * 60 * 1000;
  return cachedToken;
}

export async function authHeaders() {
  return { Authorization: `Bearer ${await operatorIdToken()}` };
}
