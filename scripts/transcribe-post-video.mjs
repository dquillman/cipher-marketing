#!/usr/bin/env node
// Turns a LinkedIn video post into text so the comment scan can draft a reply
// to it instead of handing it to Dave as a "write this live" dead end.
//
// Why this exists: Andrew Ramdayal has the largest PMP audience on the
// platform and posts almost nothing but video. His practice-question clips
// print the question on the frame, so they can be screenshotted and answered
// — but his talking-head clips carry the content ONLY in the audio. Those went
// into the queue's `manual` list, where one sat unanswered for three days at
// 28 reactions and ZERO comments (2026-08-29 to 08-31) before this existed.
//
// Usage:
//   node scripts/transcribe-post-video.mjs <linkedin-post-url|local-file>
//   node scripts/transcribe-post-video.mjs <url> --json
//   node scripts/transcribe-post-video.mjs <url> --model small.en --force
//
// Everything runs LOCALLY. yt-dlp fetches the media, ffmpeg strips the audio,
// faster-whisper transcribes it on the CPU. No API key, no per-minute cost,
// and the audio never leaves this machine.
//
// No cookies either: yt-dlp's LinkedIn extractor reads public posts straight
// from the page, so this never touches Dave's session. If a post ever needs
// auth, that is the signal to STOP rather than to start handing over cookies.

import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const FORCE = args.includes("--force");
const MODEL = (args[args.indexOf("--model") + 1] && args.includes("--model"))
  ? args[args.indexOf("--model") + 1]
  : "base.en";
const target = args.find((a) => !a.startsWith("--") && a !== MODEL);

if (!target) {
  console.error("usage: node scripts/transcribe-post-video.mjs <linkedin-post-url|file> [--json] [--force] [--model base.en]");
  process.exit(1);
}

// A transcript is expensive to make and never changes, so it is cached by the
// post's activity id. Re-running the scan on the same target costs nothing.
const CACHE_DIR = join(process.cwd(), "site", "data", "video-transcripts");
const idMatch = /urn:li:activity:(\d+)/.exec(target);
const cacheKey = idMatch ? idMatch[1] : null;
const cacheFile = cacheKey ? join(CACHE_DIR, cacheKey + ".json") : null;

if (cacheFile && existsSync(cacheFile) && !FORCE) {
  const hit = JSON.parse(readFileSync(cacheFile, "utf8"));
  emit(hit, true);
  process.exit(0);
}

// The interpreter has to carry BOTH yt_dlp and faster_whisper. The `python` on
// PATH is an agent venv with no pip, so it cannot be repaired if it drifts —
// probe candidates and use the first complete one rather than assuming.
function findPython() {
  const candidates = [
    "G:\\Python311\\python.exe",
    "python",
    "python3",
  ];
  for (const p of candidates) {
    try {
      execFileSync(p, ["-c", "import yt_dlp, faster_whisper"], { stdio: "ignore" });
      return p;
    } catch { /* try the next one */ }
  }
  return null;
}

const PY = findPython();
if (!PY) {
  console.error("No Python found carrying both yt-dlp and faster-whisper.");
  console.error("Install them into one interpreter, e.g.:");
  console.error("  G:\\Python311\\python.exe -m pip install yt-dlp faster-whisper");
  process.exit(1);
}

try {
  execSync("ffmpeg -version", { stdio: "ignore" });
} catch {
  console.error("ffmpeg is not on PATH — it is needed to strip the audio track.");
  process.exit(1);
}

const work = join(tmpdir(), "cipher-transcribe-" + (cacheKey || String(Date.now())));
mkdirSync(work, { recursive: true });
const mediaPath = join(work, "media.mp4");
const wavPath = join(work, "audio.wav");

try {
  if (/^https?:/.test(target)) {
    log("Fetching the video…");
    // -f best keeps one muxed file; the audio track is all that matters and
    // these clips are seconds long, so quality selection is not worth the
    // extra round trip.
    execFileSync(PY, ["-m", "yt_dlp", "--no-warnings", "--quiet", "-f", "best",
      "-o", mediaPath, target], { stdio: ["ignore", "ignore", "pipe"] });
  } else {
    execFileSync("cmd", ["/c", "copy", "/y", target, mediaPath], { stdio: "ignore" });
  }

  if (!existsSync(mediaPath)) throw new Error("no media file was produced");

  log("Stripping the audio…");
  // 16 kHz mono is what Whisper wants; anything richer is resampled away.
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mediaPath,
    "-ac", "1", "-ar", "16000", "-vn", wavPath], { stdio: "inherit" });

  log(`Transcribing with ${MODEL} (CPU, local)…`);
  const script = `
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel(${JSON.stringify(MODEL)}, device="cpu", compute_type="int8")
segs, info = m.transcribe(${JSON.stringify(wavPath)}, vad_filter=True)
segs = [{"start": round(s.start, 1), "end": round(s.end, 1), "text": s.text.strip()} for s in segs]
print(json.dumps({
  "durationSec": round(info.duration, 1),
  "language": info.language,
  "segments": segs,
  "text": " ".join(s["text"] for s in segs),
}))
`;
  const raw = execFileSync(PY, ["-c", script], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "inherit"],
  });
  const out = JSON.parse(raw);
  out.source = target;
  out.model = MODEL;
  out.transcribedAt = new Date().toISOString();

  if (cacheFile) {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cacheFile, JSON.stringify(out, null, 2) + "\n");
  }
  emit(out, false);
} finally {
  try { rmSync(work, { recursive: true, force: true }); } catch { /* best effort */ }
}

function log(msg) {
  // Progress goes to stderr so `--json` stdout stays machine-readable.
  if (!JSON_OUT) console.error(msg);
}

function emit(out, cached) {
  if (JSON_OUT) {
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  console.log(`\n${out.durationSec}s · ${out.language} · ${out.model}${cached ? " · cached" : ""}`);
  console.log("—".repeat(60));
  for (const s of out.segments) {
    console.log(`[${String(Math.round(s.start)).padStart(3)}s] ${s.text}`);
  }
  console.log("—".repeat(60));
  console.log("\nFull text:\n" + out.text);
}
