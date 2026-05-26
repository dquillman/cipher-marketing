#!/usr/bin/env node
/**
 * Renders all OGCard-* compositions as 1200×630 PNG stills and copies them
 * into the Cipher web/public/ directory so they're served as og:image targets.
 *
 * Run from the remotion/ directory:
 *   node scripts/render-og-cards.mjs
 *
 * Outputs:
 *   G:/Users/daveq/Cipher/web/public/og-default.png
 *   G:/Users/daveq/Cipher/web/public/og-pmp.png
 *   G:/Users/daveq/Cipher/web/public/og-security-plus.png
 *   G:/Users/daveq/Cipher/web/public/og-shrm-cp.png
 *   G:/Users/daveq/Cipher/web/public/og-story.png
 */
import { execSync } from 'node:child_process';
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REMOTION_ROOT = join(__dirname, '..');
const ENTRY = 'src/index.ts';
const OUT_DIR = join(REMOTION_ROOT, 'out', 'og');
const TARGET_DIR = 'G:/Users/daveq/Cipher/web/public';

const cards = [
  { compId: 'OGCard-Default', outName: 'og-default.png' },
  { compId: 'OGCard-PMP', outName: 'og-pmp.png' },
  { compId: 'OGCard-SecurityPlus', outName: 'og-security-plus.png' },
  { compId: 'OGCard-SHRMCP', outName: 'og-shrm-cp.png' },
  { compId: 'OGCard-Story', outName: 'og-story.png' },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const card of cards) {
  const outPath = join(OUT_DIR, card.outName);
  console.log(`▶ Rendering ${card.compId} → ${outPath}`);
  execSync(
    `npx remotion still ${ENTRY} ${card.compId} "${outPath}" --image-format=png`,
    { cwd: REMOTION_ROOT, stdio: 'inherit' },
  );

  if (existsSync(TARGET_DIR)) {
    const targetPath = join(TARGET_DIR, card.outName);
    copyFileSync(outPath, targetPath);
    console.log(`✓ Copied to ${targetPath}`);
  } else {
    console.warn(`⚠ Target dir ${TARGET_DIR} not found — skipping copy`);
  }
}

console.log(`\n✓ All ${cards.length} OG cards rendered.`);
