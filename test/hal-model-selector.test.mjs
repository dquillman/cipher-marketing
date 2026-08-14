import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
  new URL('../site/assets/hal-rail.js', import.meta.url),
  'utf8',
);

test('HAL model controls stay visible and preserve all four real modes', () => {
  assert.doesNotMatch(source, /\.hal-model-row,#halw-dream/);
  assert.match(source, /var MODELS = \["offline", "haiku", "sonnet", "ollama"\]/);
  assert.match(source, /if \(MODELS\.indexOf\(m0\) !== -1\) halModel = m0/);
});

test('the selected model is sent with every HAL request', () => {
  assert.match(source, /model: halModel/);
  assert.match(source, /localStorage\.setItem\("hal-model", halModel\)/);
});
