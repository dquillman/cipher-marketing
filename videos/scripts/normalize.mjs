// Normalize every rendered MP4 in out/ to a LinkedIn/X/Reddit-safe encoding.
//
// Why this exists: Remotion renders full-range H.264 (`yuvj420p` / color_range
// pc), and LinkedIn's uploader REJECTS that with "File(s) not supported."
// Platforms want standard limited-range `yuv420p`. This pass also sets a High
// profile, AAC audio, and +faststart. Idempotent — safe to run repeatedly.
//
// Usage:  node scripts/normalize.mjs        (all of out/)
//         npm run normalize
import { readdirSync, statSync, renameSync } from "node:fs";
import { join, extname } from "node:path";
import { spawnSync } from "node:child_process";

const OUT = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else if (extname(p).toLowerCase() === ".mp4") files.push(p);
  }
  return files;
}

const args = (input, output) => [
  "-y", "-i", input,
  "-vf", "scale=in_range=full:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
  "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
  output,
];

const files = walk(OUT);
let ok = 0, fail = 0;
for (const f of files) {
  const tmp = f + ".norm.mp4";
  const r = spawnSync("ffmpeg", args(f, tmp), { stdio: ["ignore", "ignore", "ignore"] });
  if (r.status === 0) { renameSync(tmp, f); ok++; console.log("  ✓ " + f.replace(OUT, "")); }
  else { fail++; console.error("  ✗ FAILED: " + f + (r.error ? " (" + r.error.message + ")" : "")); }
}
console.log(`\nnormalized ${ok}/${files.length} (LinkedIn-safe yuv420p)${fail ? ` — ${fail} failed` : ""}`);
if (fail) process.exit(1);
