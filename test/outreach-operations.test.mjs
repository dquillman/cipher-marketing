import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const app = fs.readFileSync(new URL('../site/app.html', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../site/outreach.html', import.meta.url), 'utf8');
const runtime = fs.readFileSync(new URL('../site/assets/outreach.js', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../site/assets/outreach-data.js', import.meta.url), 'utf8');
const packageVersion = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox);
const data = sandbox.window.CIPHER_OUTREACH_DATA;

test('outreach operations is a first-class Cipher Marketing page', () => {
  assert.match(app, /data-route="outreach"/);
  assert.match(app, /Outreach operations/);
  assert.ok(app.includes(`assets/outreach-data.js?v=${packageVersion}`));
  assert.ok(app.includes(`assets/outreach.js?v=${packageVersion}`));
  assert.match(page, /id="outreach-page"/);
});

test('gauntlet research keeps outreach lanes distinct', () => {
  assert.equal(data.gauntletStatus, 'PASS');
  assert.equal(data.researchedAt, '2026-08-13');
  assert.equal(data.targets.find((target) => target.id === 'kiyoo')?.lane, 'earned');
  assert.equal(data.targets.find((target) => target.id === 'rebels')?.lane, 'paid');
  assert.equal(data.targets.find((target) => target.id === 'ciat')?.lane, 'partnership');
  assert.ok(data.reject.some((target) => target.name === 'Alvin the PM'));
});

test('automation prepares and tracks but cannot send outreach', () => {
  assert.match(runtime, /localStorage/);
  assert.match(runtime, /Copy draft/);
  assert.match(runtime, /Sent manually/);
  assert.match(runtime, /current\.stage !== "approved"/);
  assert.doesNotMatch(runtime, /\bfetch\s*\(/);
  assert.doesNotMatch(runtime, /XMLHttpRequest|sendBeacon|mailto:/);
  assert.ok(data.guardrails.some((rule) => rule.includes('never sends')));
  assert.ok(data.guardrails.some((rule) => rule.includes('Dave approves')));
});

test('outcomes prioritize activation over link volume', () => {
  assert.match(page, /Activated users/);
  assert.match(runtime, /current\.activations/);
  assert.match(runtime, /Activated users/);
  assert.ok(data.targets.every((target) => target.utm.includes('utm_source=')));
});
