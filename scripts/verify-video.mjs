#!/usr/bin/env node
// Automated QA for a rendered post video. Checks the things that have
// actually broken in production rather than the things that are easy to check.
//
// Why this exists: the CTA-timing bug survived three rounds of "looks right"
// because it was verified by eyeballing two screenshots. A spring animation
// started its fade at 2s but did not finish settling until ~3s, which reads as
// arriving far later than intended. Pixel measurement caught it immediately.
//
// Usage:
//   node scripts/verify-video.mjs <url-or-path>
//   node scripts/verify-video.mjs <url> --aspect 4:5
//   npm run verify:video -- <url-or-path>
//
// Requires ffmpeg + ffprobe on PATH.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = promisify(execFile);

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const aspectFlag = (() => {
  const i = args.indexOf("--aspect");
  return i !== -1 ? args[i + 1] : null;
})();

if (!target) {
  console.error("Usage: node scripts/verify-video.mjs <url-or-path> [--aspect 1:1|4:5]");
  process.exit(1);
}

// Expectations. CTA_VISIBLE_AT mirrors the template constant — if the template
// moves the CTA, update both.
const EXPECT = {
  fps: 60,
  durationSec: 7,
  durationToleranceSec: 0.35,
  maxBytes: 10 * 1024 * 1024,
  codec: "h264",
  ctaVisibleAtSec: 2.0,
  ctaDarkBeforeSec: 1.6,
};
const DIMS = { "1:1": [1080, 1080], "4:5": [1080, 1350] };

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
}

async function toLocalFile(src) {
  if (!/^https?:\/\//i.test(src)) return { path: src, cleanup: async () => {} };
  const res = await fetch(src);
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const path = join(tmpdir(), `verify-${Date.now()}.mp4`);
  await writeFile(path, buf);
  return { path, cleanup: () => unlink(path).catch(() => {}) };
}

// Mean luminance of a cropped region at a timestamp, without needing any
// image library: decode one frame to raw 8-bit gray and average the bytes.
async function regionBrightness(file, seconds, crop) {
  const { stdout } = await run(
    "ffmpeg",
    ["-v", "error", "-ss", String(seconds), "-i", file, "-vf", `crop=${crop},format=gray`,
     "-frames:v", "1", "-f", "rawvideo", "-"],
    { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 }
  );
  if (!stdout.length) throw new Error(`no frame decoded at ${seconds}s`);
  let sum = 0;
  for (const b of stdout) sum += b;
  return sum / stdout.length;
}

async function main() {
  const { path, cleanup } = await toLocalFile(target);
  try {
    const { stdout } = await run("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration,size",
      "-show_entries", "stream=codec_name,width,height,r_frame_rate",
      "-of", "json", path,
    ]);
    const probe = JSON.parse(stdout);
    const video = (probe.streams || []).find((s) => s.width) || {};
    const width = Number(video.width);
    const height = Number(video.height);
    const duration = Number(probe.format?.duration || 0);
    const size = Number(probe.format?.size || 0);
    const fps = (() => {
      const [n, d] = String(video.r_frame_rate || "0/1").split("/").map(Number);
      return d ? Math.round(n / d) : 0;
    })();

    const aspect = aspectFlag || (height === 1350 ? "4:5" : "1:1");
    const [wantW, wantH] = DIMS[aspect] || DIMS["1:1"];

    check("codec is h264", video.codec_name === EXPECT.codec, `got ${video.codec_name}`);
    check(`dimensions ${wantW}x${wantH} (${aspect})`, width === wantW && height === wantH, `got ${width}x${height}`);
    check(`fps ${EXPECT.fps}`, fps === EXPECT.fps, `got ${fps}`);
    check(
      `duration ~${EXPECT.durationSec}s`,
      Math.abs(duration - EXPECT.durationSec) <= EXPECT.durationToleranceSec,
      `got ${duration.toFixed(2)}s`
    );
    check(
      `file under ${(EXPECT.maxBytes / 1024 / 1024).toFixed(0)}MB`,
      size > 0 && size <= EXPECT.maxBytes,
      `got ${(size / 1024).toFixed(0)}KB`
    );

    // CTA occupies the lower band of the frame. It must be dark before the
    // fade starts and fully lit exactly at the 2s mark.
    const bandH = Math.round(height * 0.17);
    const bandY = height - bandH - Math.round(height * 0.01);
    const crop = `${width}:${bandH}:0:${bandY}`;
    const before = await regionBrightness(path, EXPECT.ctaDarkBeforeSec, crop);
    const at = await regionBrightness(path, EXPECT.ctaVisibleAtSec, crop);

    check(
      `CTA hidden before ${EXPECT.ctaDarkBeforeSec}s`,
      before < 9,
      `luminance ${before.toFixed(1)} (want < 9)`
    );
    check(
      `CTA fully visible at ${EXPECT.ctaVisibleAtSec}s`,
      at > before * 2 && at > 14,
      `luminance ${at.toFixed(1)} vs ${before.toFixed(1)} before (want > 14 and 2x)`
    );
  } finally {
    await cleanup();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\nVideo QA — ${target}\n`);
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} checks passed\n`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error("verify-video failed:", err.message);
  process.exit(2);
});
