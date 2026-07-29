import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const appPath = new URL('../site/app.html', import.meta.url);
const halPath = new URL('../site/assets/hal-rail.js', import.meta.url);
const authPath = new URL('../site/assets/operator-auth.js', import.meta.url);
const launcherPath = new URL('../Open Cipher Marketing.vbs', import.meta.url);
const app = fs.readFileSync(appPath, 'utf8');
const hal = fs.readFileSync(halPath, 'utf8');
const auth = fs.readFileSync(authPath, 'utf8');
const launcher = fs.readFileSync(launcherPath, 'utf8');

test('operator navigation is organized around four primary jobs', () => {
  const primaryNav = app.match(/<div class="nav-links">[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.match(primaryNav, />Today</);
  assert.match(primaryNav, />Create</);
  assert.match(primaryNav, />Publish</);
  assert.match(primaryNav, />Results</);
  assert.doesNotMatch(primaryNav, />Posts</);
  assert.doesNotMatch(primaryNav, />Schedule</);
});

test('campaign completion leads to a deliberate next-cycle decision', () => {
  assert.match(app, /campaign-ended/);
  assert.match(app, /Campaign complete — choose the next cycle/);
  assert.match(app, /durationWeeks/);
  assert.match(app, /data-route="settings"/);

  const settingsIndex = app.indexOf('data-route="settings"');
  const resetIndex = app.indexOf('id="campaign-reset-form"');
  assert.ok(settingsIndex >= 0 && resetIndex > settingsIndex);
});

test('operator actions and trust signals are available in the interface', () => {
  assert.match(app, /id="sync-health"/);
  assert.match(app, /data-approve-drafts/);
  assert.match(app, /window\.cipherAskBrad/);
  assert.match(app, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
  assert.doesNotMatch(app, /America\/Denver/);
});

test('Brad starts collapsed and keeps the essential controls', () => {
  assert.match(hal, /var collapsed = true/);
  assert.match(hal, /window\.cipherAskBrad/);
  assert.match(hal, /Ask Brad/);
  assert.match(hal, /id="halw-pause"/);
  assert.match(hal, /id="halw-mute"/);
});

test('direct file opening is intercepted with a one-click Windows recovery path', () => {
  assert.match(app, /window\.location\.protocol === 'file:'/);
  assert.match(app, /window\.__cipherFileMode = true/);
  assert.match(auth, /Open Cipher Marketing\.vbs/);
  assert.match(auth, /http:\/\/localhost:8766\/app\.html/);
  assert.match(app, /window\.location\.hostname === '127\.0\.0\.1'/);
  assert.match(app, /localUrl\.hostname = 'localhost'/);
  assert.match(launcher, /node serve\.mjs/);
  assert.match(launcher, /MSXML2\.ServerXMLHTTP\.6\.0/);
});

test('draft ownership is explicit and drafts are grouped into dated weeks', () => {
  assert.match(app, /Brad analyzes the evidence\. You approve the final copy\./);
  assert.match(app, /Current trends/);
  assert.match(app, /Past post grades/);
  assert.match(app, /function renderDraftWeeks\(items\)/);
  assert.match(app, /Week of /);
  assert.match(app, /class="post-week-group"/);
  assert.match(app, /renderPost\(post, true\)/);
  assert.match(app, /var draftWeeksByStart = \{\}/);
  assert.match(app, /class="cc-week-row/);
  assert.match(app, /Review one week at a time\./);
  assert.match(app, /Review this week/);
  assert.doesNotMatch(app, /pendingDrafts\.slice\(0, 8\)/);
  assert.doesNotMatch(app, /Approve with Brad/);
});
