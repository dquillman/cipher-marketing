import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(new URL('../' + path, import.meta.url), 'utf8');
}

test('Firestore rules reject anonymous access and require the admin claim', () => {
  const rules = read('firestore.rules');
  assert.doesNotMatch(rules, /allow\s+read\s*,\s*write\s*:\s*if\s+true/);
  assert.match(rules, /request\.auth\s*!=\s*null/);
  assert.match(rules, /request\.auth\.token\.marketingAdmin\s*==\s*true/);
});

test('hosted HTML contains no private state or post snapshots', () => {
  for (const file of ['site/app.html', 'site/launch-campaign.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /window\.__CAMPAIGN_STATE__\s*=\s*\{/);
    assert.doesNotMatch(html, /window\.__POSTS__\s*=\s*\{/);
  }
});

test('operator dashboard includes auth and protected mutation headers', () => {
  const app = read('site/app.html');
  const operatorAuth = read('site/assets/operator-auth.js');
  const siteJs = read('site/assets/site.js');
  const resetJs = read('site/assets/campaign-reset.js');
  assert.match(app, /firebase-auth-compat\.js/);
  assert.match(app, /assets\/operator-auth\.js/);
  assert.match(operatorAuth, /\/api\/operator\/bootstrap/);
  assert.match(siteJs, /cipherAuthHeaders/);
  assert.match(resetJs, /cipherAuthHeaders/);
});

test('first-login bootstrap is verified-email-only and preserves existing claims', () => {
  const fn = read('functions/index.js');
  const security = read('functions/security.js');
  const firebase = JSON.parse(read('firebase.json'));
  assert.match(fn, /requireBootstrapOperator\(await verifyBearerToken\(req\)\)/);
  assert.match(fn, /\.\.\.\(user\.customClaims \|\| \{\}\)/);
  assert.match(fn, /marketingAdmin: true/);
  assert.match(security, /email_verified !== true/);
  assert.equal(firebase.hosting.rewrites[0].source, '/api/operator/bootstrap');
  assert.equal(firebase.hosting.rewrites[0].function, 'bootstrapMarketingAdmin');
});

test('standalone operational pages require the operator claim and avoid static state', () => {
  for (const file of ['site/funnel.html', 'site/sprint.html']) {
    const html = read(file);
    assert.match(html, /firebase-auth-compat\.js/);
    assert.match(html, /assets\/operator-auth\.js/);
    assert.match(html, /_cipherAuthReady/);
    assert.doesNotMatch(html, /fetch\('data\/campaign-state\.json'/);
  }
});

test('competitor markdown escapes HTML before adding formatting', () => {
  for (const file of ['site/app.html', 'site/competitors.html']) {
    const html = read(file);
    const escapeAt = html.indexOf("String(t).replace(/[&<>]/g");
    const renderAt = html.indexOf("replace(/\\*\\*(.+?)\\*\\*/g", escapeAt);
    assert.ok(escapeAt >= 0, file + ' must escape markdown input');
    assert.ok(renderAt > escapeAt, file + ' must escape before rendering markdown');
    assert.doesNotMatch(html, /fetch\(FSBASE/);
  }
});

test('scheduled post date fields agree with the canonical timestamp', () => {
  const data = JSON.parse(read('site/data/posts.json'));
  for (const post of data.posts) {
    if (!post.scheduledTime) continue;
    const canonicalDate = post.scheduledTime.slice(0, 10);
    assert.equal(post.scheduled, canonicalDate, post.id + ' scheduled date mismatch');
    if (post.scheduledTimeLocal) {
      assert.equal(post.scheduledTimeLocal.slice(0, 10), canonicalDate, post.id + ' local date mismatch');
    }
  }
});

test('local APIs do not allow wildcard CORS and mutations require auth', () => {
  const server = read('serve.mjs');
  assert.doesNotMatch(server, /Access-Control-Allow-Origin/);
  assert.match(server, /authenticateOperator\(req\)/);
  assert.match(server, /requireHttpUrl/);
  assert.match(server, /64 \* 1024/);
  const getPosts = server.indexOf('url === "/api/posts"');
  const getTestimonials = server.indexOf('url === "/api/testimonials"');
  assert.ok(server.indexOf('authenticateOperator(req)', getPosts) > getPosts);
  assert.ok(server.indexOf('authenticateOperator(req)', getTestimonials) > getTestimonials);
});

test('grading function authenticates, validates, and rate limits before AI use', () => {
  const fn = read('functions/index.js');
  const authAt = fn.indexOf('authenticateOperator(req)');
  const validateAt = fn.indexOf('validateGradePayload(req.body)');
  const rateAt = fn.indexOf('enforceGradeRateLimit(db, operator.uid)');
  const aiAt = fn.indexOf('await aiNotes(');
  assert.ok(authAt >= 0 && validateAt > authAt);
  assert.ok(rateAt > validateAt && aiAt > rateAt);
  assert.doesNotMatch(fn, /cors:\s*true/);
});

test('build treats app.html as canonical and never writes it', () => {
  const build = read('site/build-app.mjs');
  assert.match(build, /canonical app\.html/);
  assert.doesNotMatch(build, /writeFileSync\(join\(HERE, "app\.html"/);
});
