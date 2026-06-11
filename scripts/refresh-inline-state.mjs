// One-off: refresh ONLY the <!--INLINE-STATE--> block in site/app.html from
// site/data/*.json. Does NOT touch markup or scripts (unlike inline-assets.mjs,
// which rebuilds the whole file and wipes direct edits — never run that one).
import { readFileSync, writeFileSync } from 'node:fs';

const APP = new URL('../site/app.html', import.meta.url);
const state = JSON.parse(readFileSync(new URL('../site/data/campaign-state.json', import.meta.url), 'utf8'));
const posts = JSON.parse(readFileSync(new URL('../site/data/posts.json', import.meta.url), 'utf8'));

const html = readFileSync(APP, 'utf8');
const START = '<!--INLINE-STATE-->';
const END = '<!--/INLINE-STATE-->';
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a === -1 || b === -1) { console.error('markers not found'); process.exit(1); }

const block = [
  START,
  '<script>window.__CAMPAIGN_STATE__ = ' + JSON.stringify(state, null, 2) + ';</script>',
  '<script>window.__POSTS__ = ' + JSON.stringify(posts, null, 2) + ';</script>',
].join('\n') + '\n';

writeFileSync(APP, html.slice(0, a) + block + html.slice(b), 'utf8');
console.log('inline state refreshed:', state._meta.lastUpdatedAt, '/', posts._meta.lastUpdatedAt);
