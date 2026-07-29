import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

test('all inline dashboard scripts parse', () => {
  const files = readdirSync(new URL('../site/', import.meta.url))
    .filter((file) => file.endsWith('.html'));
  let checked = 0;

  for (const file of files) {
    const html = readFileSync(new URL('../site/' + file, import.meta.url), 'utf8');
    const scripts = html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi);
    let index = 0;
    for (const match of scripts) {
      index += 1;
      if (/\bsrc\s*=|type=["'](?:application\/json|importmap)["']/i.test(match[1])) continue;
      assert.doesNotThrow(
        () => new vm.Script(match[2], { filename: file + ':inline-' + index }),
        file + ' inline script ' + index + ' must parse',
      );
      checked += 1;
    }
  }

  assert.ok(checked > 0);
});
