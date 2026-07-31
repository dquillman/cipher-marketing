import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const appPath = new URL('../site/app.html', import.meta.url);
const halPath = new URL('../site/assets/hal-rail.js', import.meta.url);
const pageKnowledgePath = new URL('../site/assets/page-knowledge.js', import.meta.url);
const authPath = new URL('../site/assets/operator-auth.js', import.meta.url);
const launcherPath = new URL('../Open Cipher Marketing.vbs', import.meta.url);
const app = fs.readFileSync(appPath, 'utf8');
const hal = fs.readFileSync(halPath, 'utf8');
const pageKnowledgeSource = fs.readFileSync(pageKnowledgePath, 'utf8');
const pageKnowledge = JSON.parse(
  pageKnowledgeSource.match(/window\.CIPHER_PAGE_KNOWLEDGE\s*=\s*(\{[\s\S]*\})\s*;\s*\}\)\(\)/)?.[1] ?? '{}'
);
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

test('Brad handles natural page navigation locally', () => {
  assert.match(hal, /\(\?:hey\\s\+\)\?\(\?:hal\|brad\|jarvis\|assistant\)/);
  assert.match(hal, /\|change to\|/);
  assert.match(hal, /var nav = halFindNav\(text\)/);
});

test('every app page has shared navigation and expert help', () => {
  const routes = [...app.matchAll(/<section class="route-section(?: active)?" data-route="([^"]+)">/g)]
    .map((match) => match[1]);
  assert.ok(routes.length >= 12);
  for (const route of routes) {
    assert.ok(pageKnowledge[route], `missing page guide for ${route}`);
  }
  assert.ok(pageKnowledge.funnel);
  assert.ok(pageKnowledge.sprint);
  assert.match(hal, /window\.CIPHER_PAGE_KNOWLEDGE/);
  assert.match(hal, /id="halw-page-help"/);
  assert.match(hal, /function currentPageGuide\(\)/);
  assert.match(hal, /function findMentionedPageGuide\(value\)/);
  assert.match(hal, /function pageContextQuestion\(question\)/);
  assert.match(hal, /\[CURRENT APP PAGE\]/);
  assert.match(hal, /Explain this page and tell me exactly what I should do first\./);
  assert.match(hal, /what\(\?:'s\| is\) \(\?:on\|in\)/);
  assert.match(hal, /what does \(\?:this\|the current\) page/);
});

test('all fourteen pages have reviewed expert knowledge', () => {
  assert.equal(Object.keys(pageKnowledge).length, 14);
  for (const [key, guide] of Object.entries(pageKnowledge)) {
    assert.ok(guide.label, `${key} needs a label`);
    assert.ok(guide.purpose?.length > 40, `${key} needs a useful purpose`);
    assert.ok(guide.sections?.length >= 3, `${key} needs key sections`);
    assert.ok(guide.steps?.length >= 3, `${key} needs a workflow`);
    assert.ok(guide.start?.length > 20, `${key} needs a first action`);
    assert.ok(guide.terms?.length >= 2, `${key} needs plain-language terms`);
    assert.ok(guide.watchFor?.length > 20, `${key} needs a caution`);
    assert.ok(guide.related?.length >= 2, `${key} needs related pages`);
  }
});

test('page knowledge loads before the assistant rail', () => {
  const knowledgeIndex = app.indexOf('assets/page-knowledge.js?v=1.10.4');
  const halIndex = app.indexOf('assets/hal-rail.js?v=1.10.4');
  assert.ok(knowledgeIndex >= 0);
  assert.ok(halIndex > knowledgeIndex);
});

test('Brad, HAL, and JARVIS share the page tools', () => {
  assert.match(hal, /b\.textContent = f === "assistant" \? "BRAD" : f === "hal" \? "HAL" : "JARVIS"/);
  assert.doesNotMatch(hal, /\.hal-faces,\.hal-model-row/);
  assert.match(hal, /activatePage\(nav\)/);
  assert.match(hal, /pageHelpReply\(helpGuide\)/);
  assert.match(hal, /localStorage\.getItem\("hal-console-face"\)/);
});

test('Cipher Marketing sends the branded Brad persona to the app expert', () => {
  assert.match(hal, /function apiFace\(\)/);
  assert.match(hal, /return face === "assistant" \? "brad" : face/);
  assert.match(hal, /face: apiFace\(\)/);
  assert.doesNotMatch(hal, /face: face, model: halModel/);
});

test('the assistant rail URL is release-versioned to prevent stale page help', () => {
  assert.match(app, /Dashboard version">v1\.10\.4</);
  assert.match(app, /assets\/page-knowledge\.js\?v=1\.10\.4/);
  assert.match(app, /assets\/hal-rail\.js\?v=1\.10\.4/);
});

test('hidden legacy model preferences migrate to the subscription expert', () => {
  assert.match(hal, /if \(m0 === "sonnet"\) halModel = "sonnet"/);
  assert.doesNotMatch(
    hal,
    /if \(MODELS\.indexOf\(m0\) >= 0\) halModel = m0/
  );
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

test('each draft can start a post-specific Brad revision request', () => {
  assert.match(app, /data-revise-draft=/);
  assert.match(app, />Ask Brad to revise<\/button>/);
  assert.match(app, /Brad, start a revision request for exactly one CipherExam draft\./);
  assert.match(app, /First ask me what I want changed\./);
  assert.match(app, /update only this draft ID/);
  assert.match(app, /preserve its date and draft status/);
  assert.match(app, /revisePost\.copy/);
});
