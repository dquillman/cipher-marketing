import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app = fs.readFileSync(new URL('../site/app.html', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../site/assets/persona-theme.css', import.meta.url), 'utf8');

test('Persona is an opt-in preview and does not replace the default theme', () => {
  assert.match(app, /get\('theme'\) !== 'persona'/);
  assert.match(app, /assets\/persona-theme\.css/);
  assert.doesNotMatch(app, /<link[^>]+persona-theme\.css/);
});

test('Persona preserves the command-center hierarchy across desktop and mobile', () => {
  assert.match(theme, /\.nav \{[\s\S]*position: fixed/);
  assert.match(theme, /\.command-center \{[\s\S]*background: var\(--persona-ink\)/);
  assert.match(theme, /\.wrap \{[\s\S]*margin: 0 0 0 244px/);
  assert.match(theme, /@media \(max-width: 900px\)[\s\S]*\.wrap \{ margin-left: 0/);
});

test('Persona uses the saved ink paper brass palette', () => {
  assert.match(theme, /--persona-ink: #0b1220/);
  assert.match(theme, /--persona-paper: #f3efe5/);
  assert.match(theme, /--persona-brass: #d8a84e/);
  assert.match(theme, /--persona-card: #fbf8f1/);
});
