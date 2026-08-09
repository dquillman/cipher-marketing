// GA4 Data API access for the campaign scripts.
//
// LinkedIn never reports link clicks and X's number counts clicks rather than
// arrivals, so GA4 is the truer source for both (site/data/metrics-schema.md).
// Every CTA already carries utm_source / utm_campaign / utm_content, which map
// onto sessionSource / sessionCampaignName / sessionManualAdContent here.

import { readFileSync } from 'node:fs';

// Dave's Google account holds four Analytics accounts and analytics.google.com
// opens the WRONG one by default: "ad-creator" (property 528557004), which
// expects tag G-X3BBWWT2YB and has never received a hit. cipherexam.com serves
// G-HY0QBN84Y6, which belongs to this property. Querying the default one
// returns a clean set of zeros that reads as "nobody clicked" — verified and
// pinned 2026-08-08. Do not make this configurable without a very good reason.
export const GA4_PROPERTY_ID = '528695114';

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

let cachedToken = null;
let cachedUntil = 0;

async function accessToken() {
  if (cachedToken && Date.now() < cachedUntil) return cachedToken;

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    throw new Error(
      'set FIREBASE_SERVICE_ACCOUNT to a service-account key path.\n' +
      'That account also needs Viewer on GA4 property ' + GA4_PROPERTY_ID + '.',
    );
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));

  const { JWT } = await import('google-auth-library');
  const jwt = new JWT({ email: key.client_email, key: key.private_key, scopes: [SCOPE] });
  const { token } = await jwt.getAccessToken();
  if (!token) throw new Error('GA4 auth returned no access token');

  cachedToken = token;
  cachedUntil = Date.now() + 45 * 60 * 1000;
  return cachedToken;
}

export async function runReport(body) {
  const token = await accessToken();
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const json = await res.json();
  if (!res.ok) {
    const message = json?.error?.message || `HTTP ${res.status}`;
    if (res.status === 403) {
      throw new Error(
        `${message}\nGrant Viewer on GA4 property ${GA4_PROPERTY_ID} to the service account.`,
      );
    }
    throw new Error(message);
  }
  return json;
}

// utm_content is the per-post key. Reusing one across posts collapses their
// data together permanently — that is what happened in launch week 1.
export function utmsFromCta(cta) {
  if (!cta) return null;
  let url;
  try {
    url = new URL(cta);
  } catch {
    return null;
  }
  const campaign = url.searchParams.get('utm_campaign');
  const content = url.searchParams.get('utm_content');
  if (!campaign || !content) return null;
  return { campaign, content, source: url.searchParams.get('utm_source') };
}

// Some posts store LinkedIn's lnkd.in shortener as their CTA rather than the
// original URL, so the UTMs are not readable from the stored string. The
// redirect preserves the full query string (verified 2026-08-06), so follow it
// rather than treating the post as unattributable.
export async function resolveUtms(cta) {
  const direct = utmsFromCta(cta);
  if (direct) return direct;

  let host;
  try {
    host = new URL(cta).hostname;
  } catch {
    return null;
  }
  if (host !== 'lnkd.in') return null;

  // lnkd.in does not answer with a 3xx — it serves a 200 interstitial with the
  // destination embedded in the HTML, entity-escaped. So read the body rather
  // than trusting res.url, which stays on lnkd.in.
  try {
    const res = await fetch(cta, { redirect: 'follow' });
    if (!res.ok) return null;
    const body = await res.text();
    const match = body.match(/https?:\/\/[^"'<>\s\\]*utm_[^"'<>\s\\]*/);
    if (!match) return null;

    const destination = match[0].replace(/&amp;/g, '&');
    // The body is remote content. Only trust a destination on our own domain —
    // a URL scraped from a page is data, not something to follow blindly.
    if (!/^https?:\/\/(www\.)?cipherexam\.com\//.test(destination)) return null;
    return utmsFromCta(destination);
  } catch {
    return null;
  }
}

function utmFilter({ campaign, content, source }) {
  const expressions = [
    { filter: { fieldName: 'sessionCampaignName', stringFilter: { value: campaign } } },
    { filter: { fieldName: 'sessionManualAdContent', stringFilter: { value: content } } },
  ];
  // Every launch-week post ships as a LinkedIn/X pair sharing one utm_content,
  // so campaign+content alone returns the pair's combined sessions and hands
  // each post the other's clicks. utm_source separates them. Without this the
  // May 11 pair both reported 4 clicks when LinkedIn had all 4 and X had none.
  if (source) {
    expressions.push({ filter: { fieldName: 'sessionSource', stringFilter: { value: source } } });
  }
  return { andGroup: { expressions } };
}

function firstMetric(json) {
  return Number(json.rows?.[0]?.metricValues?.[0]?.value ?? 0);
}

// Sessions, not GA4's own "clicks" — GA4 counts arrivals, which is the number
// that survives a bot click or an abandoned redirect.
export async function sessionsForUtm(utms, startDate) {
  return firstMetric(await runReport({
    dateRanges: [{ startDate, endDate: 'today' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: utmFilter(utms),
  }));
}

export async function eventCountForUtm(utms, eventName, startDate) {
  return firstMetric(await runReport({
    dateRanges: [{ startDate, endDate: 'today' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          ...utmFilter(utms).andGroup.expressions,
          { filter: { fieldName: 'eventName', stringFilter: { value: eventName } } },
        ],
      },
    },
  }));
}
