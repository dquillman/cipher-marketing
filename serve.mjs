#!/usr/bin/env node
// Local HTTP server for the CipherExam marketing dashboard.
//
// Default: http://localhost:8766/app.html
// Override port: PORT=9000 node serve.mjs
// Override bind: HOST=0.0.0.0 node serve.mjs   (accessible on LAN)
//
// Press Ctrl-C to stop.

import http from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "site");
const PORT = Number(process.env.PORT || 8766);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".mp4":  "video/mp4",
};

// Safe path resolution — refuse anything that climbs above ROOT.
function resolveSafe(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  let p = normalize(join(ROOT, clean === "/" ? "/app.html" : clean));
  if (!p.startsWith(ROOT)) return null;
  return p;
}

// ---- API helpers ----
const POSTS_FILE        = join(ROOT, "data/posts.json");
const STATE_FILE        = join(ROOT, "data/campaign-state.json");
const TESTIMONIALS_FILE = join(ROOT, "data/testimonials.json");

function jsonOk(res, body) {
  const payload = JSON.stringify(body);
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(payload);
}
function jsonErr(res, code, msg) {
  res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify({ ok: false, error: msg }));
}
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    req.on("data", c => buf += c);
    req.on("end", () => {
      try { resolve(JSON.parse(buf)); } catch { resolve({}); }
    });
    req.on("error", reject);
  });
}
function triggerRebuild() {
  try {
    execSync("node inline-assets.mjs && node build-app.mjs", { cwd: ROOT, stdio: "ignore" });
  } catch (e) {
    console.error("[rebuild] failed:", e.message);
  }
}

// ---- API routes ----
async function handleApi(req, res) {
  const url = req.url.split("?")[0];

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST", "Access-Control-Allow-Headers": "Content-Type" });
    res.end(); return;
  }

  // GET /api/posts — always-fresh posts.json (bypasses inline cache)
  if (req.method === "GET" && url === "/api/posts") {
    try {
      const raw = await readFile(POSTS_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" });
      res.end(raw); return;
    } catch { jsonErr(res, 500, "could not read posts.json"); return; }
  }

  // GET /api/testimonials — always-fresh testimonials.json (mirrors /api/posts).
  // Read-only: the testimonials come from a public CipherExam Firestore
  // collection via scripts/pull-testimonials.mjs; the dashboard never writes them.
  // If the file doesn't exist yet (pull never run), return a tidy empty payload
  // instead of a 500 so the panel can show its empty state.
  if (req.method === "GET" && url === "/api/testimonials") {
    try {
      const raw = await readFile(TESTIMONIALS_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" });
      res.end(raw); return;
    } catch {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ _meta: { count: 0, note: "testimonials.json not found — run node scripts/pull-testimonials.mjs" }, testimonials: [] }));
      return;
    }
  }

  // POST /api/publish — mark a post as published
  if (req.method === "POST" && url === "/api/publish") {
    const body = await readBody(req);
    const { id, postUrl } = body;
    if (!id || !postUrl) { jsonErr(res, 400, "id and postUrl required"); return; }
    if (!postUrl.startsWith("http")) { jsonErr(res, 400, "postUrl must start with http"); return; }
    try {
      const data = JSON.parse(await readFile(POSTS_FILE, "utf8"));
      const post = data.posts.find(p => p.id === id);
      if (!post) { jsonErr(res, 404, `no post with id "${id}"`); return; }
      if (post.status === "published" || post.status === "posted") {
        jsonErr(res, 409, `post "${id}" is already marked ${post.status}`); return;
      }
      const now = new Date().toISOString();
      post.status   = "posted";
      post.postedAt = now;
      post.postUrl  = postUrl;
      data._meta.lastUpdatedAt = now;
      await writeFile(POSTS_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
      // Rebuild dashboard in background so the inline state reflects the change
      setImmediate(triggerRebuild);
      console.log(`[api] published: ${id} → ${postUrl}`);
      jsonOk(res, { ok: true, id, status: "posted", postedAt: now });
    } catch (e) { jsonErr(res, 500, e.message); }
    return;
  }

  jsonErr(res, 404, "unknown api route");
}

const server = http.createServer(async (req, res) => {
  const t0 = Date.now();

  // Route API calls before static serving
  if (req.url.startsWith("/api/")) {
    await handleApi(req, res);
    const ms = Date.now() - t0;
    console.log(`[${new Date().toISOString().slice(11,19)}] ${res.statusCode} ${req.method} ${req.url} (${ms}ms)`);
    return;
  }

  const fp = resolveSafe(req.url);
  if (!fp) { res.writeHead(403); res.end("forbidden"); return; }

  try {
    const s = await stat(fp);
    if (s.isDirectory()) {
      // Auto-serve index.html if it exists, else app.html
      const candidates = [join(fp, "index.html"), join(fp, "app.html")];
      let found = null;
      for (const c of candidates) {
        try { await stat(c); found = c; break; } catch {}
      }
      if (!found) { res.writeHead(404); res.end("not found"); return; }
      const data = await readFile(found);
      res.writeHead(200, { "Content-Type": MIME[extname(found)] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(data);
    } else {
      const data = await readFile(fp);
      res.writeHead(200, { "Content-Type": MIME[extname(fp)] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(data);
    }
  } catch (e) {
    res.writeHead(404);
    res.end("not found: " + req.url);
  }

  const ms = Date.now() - t0;
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${res.statusCode} ${req.method} ${req.url} (${ms}ms)`);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/`;
  console.log(`\n  CipherExam marketing dashboard`);
  console.log(`  Serving:  ${ROOT}`);
  console.log(`  URL:      ${url}app.html`);
  console.log(`  Rollup:   ${url}launch-campaign.html`);
  if (HOST === "0.0.0.0") {
    console.log(`  LAN:      accessible from other devices on this network`);
  }
  console.log(`\n  Press Ctrl-C to stop.\n`);
});

process.on("SIGINT", () => { console.log("\n  Server stopped."); process.exit(0); });
