#!/usr/bin/env node
// Local HTTP server for the CipherExam marketing dashboard.
//
// Default: http://localhost:8766/app.html
// Override port: PORT=9000 node serve.mjs
// Override bind: HOST=0.0.0.0 node serve.mjs   (accessible on LAN)
//
// Press Ctrl-C to stop.

import http from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile, execSync, spawn } from "node:child_process";
import {
  RESET_CONFIRMATION,
  buildFreshCompetitors,
  buildFreshPosts,
  buildFreshState,
} from "./functions/campaign-blueprint.js";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
  RequestError,
  requireBootstrapOperator,
  requireMarketingAdmin,
} from "./functions/security.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "site");
const PORT = Number(process.env.PORT || 8766);
const HOST = process.env.HOST || "127.0.0.1";
if (!getApps().length) {
  initializeApp({ projectId: "cipher-marketing-daveq" });
}


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
const COMPETITORS_FILE  = join(ROOT, "data/competitors.json");
const ARCHIVES_DIR      = join(ROOT, "data/archives");
const TESTIMONIALS_FILE = join(ROOT, "data/testimonials.json");

function jsonOk(res, body) {
  const payload = JSON.stringify(body);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(payload);
}
function jsonErr(res, code, msg) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: msg }));
}
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    let rejected = false;
    req.on("data", chunk => {
      if (rejected) return;
      buf += chunk;
      if (Buffer.byteLength(buf, "utf8") > 64 * 1024) {
        rejected = true;
        reject(new RequestError(413, "request body is too large"));
      }
    });
    req.on("end", () => {
      if (rejected) return;
      try { resolve(JSON.parse(buf)); }
      catch { reject(new RequestError(400, "request body must be valid JSON")); }
    });
    req.on("error", reject);
  });
}
async function verifyOperatorToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) throw new RequestError(401, "Bearer authentication required.");
  try {
    return await getAuth().verifyIdToken(match[1]);
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(401, "Invalid or expired operator token.");
  }
}

async function authenticateOperator(req) {
  return requireMarketingAdmin(await verifyOperatorToken(req));
}

function requireHttpUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
    return parsed.toString();
  } catch {
    throw new RequestError(400, "postUrl must be a valid http(s) URL");
  }
}

function apiError(res, error) {
  const status = Number(error.statusCode) || 500;
  jsonErr(res, status, status >= 500 ? "request failed" : error.message);
}

function triggerRebuild() {
  try {
    execSync("node inline-assets.mjs && node build-app.mjs", { cwd: ROOT, stdio: "ignore" });
  } catch (e) {
    console.error("[rebuild] failed:", e.message);
  }
}

// ---- Named-task runner ----
// CM's operations are Claude Code agents/skills, not HTTP services, so the
// dashboard's buttons and Brad's rail land here: spawn `claude -p` headless
// with a per-task prompt and a scoped tool allowlist. The child inherits this
// process's env (FIREBASE_SERVICE_ACCOUNT etc). This is a fixed ALLOWLIST of
// named tasks — deliberately not a general run-any-prompt pipe, because that
// would let any authenticated page execute arbitrary commands on this machine.
// One task at a time; per-task log in site/data (never deployed).
const TASK_TIMEOUT_MS = 25 * 60 * 1000;
const TASK_ALLOWED_TOOLS =
  "Task,Read,Glob,Grep,Write,Edit,WebSearch,WebFetch,Bash(node:*)";

const TASKS = {
  "trend-scout": {
    label: "trend scout",
    prompt:
      "Run the cipher-trend-scout subagent now for all active exams (PMP, Security+, SHRM-CP). " +
      "Follow its agent definition exactly, including writing the structured scan to the Firestore " +
      "document campaign/trendScout in project cipher-marketing-daveq. This is a headless run: X and " +
      "LinkedIn cannot be scanned - record them as unscanned in honestyCaveat rather than reporting " +
      "them as quiet. For Reddit, run node scripts/scan-reddit.mjs --json; without API credentials it " +
      "falls back to RSS top-of-week order automatically - use that data under the agent definition's " +
      "RSS rules (cite rank order, never invent scores).",
  },
  "draft-week-posts": {
    label: "draft next week's posts",
    prompt:
      "Use the draft-week-posts skill to draft next week's CipherExam posts now. Follow the skill " +
      "exactly: check current campaign status and existing drafts first, fold in the latest trend " +
      "scout angles from Firestore campaign/trendScout, respect the 2026-08-07 decision that X " +
      "standalone posts are paused, and write the drafts to site/data/posts.json with status " +
      "\"draft\" only - Dave approves before anything is scheduled. Never mark anything posted or " +
      "scheduled yourself.",
  },
};

const taskState = {
  running: false,
  task: null,
  startedAt: null,
  finishedAt: null,
  exitCode: null,
  error: null,
};

function startTask(id) {
  const def = TASKS[id];
  taskState.running = true;
  taskState.task = id;
  taskState.startedAt = new Date().toISOString();
  taskState.finishedAt = null;
  taskState.exitCode = null;
  taskState.error = null;

  const logPath = join(ROOT, `data/${id}-run.log`);
  let log = `=== ${def.label} run ${taskState.startedAt} ===\n`;
  const finish = (code, error) => {
    if (!taskState.running) return;
    taskState.running = false;
    taskState.finishedAt = new Date().toISOString();
    taskState.exitCode = code;
    taskState.error = error || null;
    log += `\n=== finished ${taskState.finishedAt} exit=${code}${error ? " error=" + error : ""} ===\n`;
    writeFile(logPath, log, "utf8").catch(() => {});
    console.log(`[task:${id}] finished: exit=${code}${error ? " (" + error + ")" : ""}`);
  };

  let child;
  try {
    // shell:true so Windows resolves the `claude` shim; prompt goes via stdin
    // to sidestep cmd.exe quoting entirely.
    child = spawn("claude", ["-p", "--allowedTools", `"${TASK_ALLOWED_TOOLS}"`], {
      cwd: HERE,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (e) {
    finish(null, e.message);
    return;
  }
  child.stdin.write(def.prompt);
  child.stdin.end();
  child.stdout.on("data", (d) => { log += d; });
  child.stderr.on("data", (d) => { log += d; });
  child.on("error", (e) => finish(null, e.message));
  child.on("close", (code) => finish(code));
  const timer = setTimeout(() => {
    finish(null, `timed out after ${TASK_TIMEOUT_MS / 60000} min`);
    try { child.kill(); } catch { /* ignore */ }
  }, TASK_TIMEOUT_MS);
  timer.unref?.();
  console.log(`[task:${id}] started headless`);
}

// ---- API routes ----
async function handleApi(req, res) {
  const url = req.url.split("?")[0];

  if (req.method === "OPTIONS") {
    jsonErr(res, 405, "cross-origin requests are not allowed"); return;
  }

  // POST /api/operator/bootstrap - local mirror of the deployed claim bootstrap.
  if (req.method === "POST" && url === "/api/operator/bootstrap") {
    try {
      const decoded = requireBootstrapOperator(await verifyOperatorToken(req));
      const auth = getAuth();
      const user = await auth.getUser(decoded.uid);
      await auth.setCustomUserClaims(user.uid, {
        ...(user.customClaims || {}),
        marketingAdmin: true,
      });
      jsonOk(res, { ok: true });
    } catch (error) {
      apiError(res, error);
    }
    return;
  }

  // GET /api/posts — always-fresh posts.json (bypasses inline cache)
  if (req.method === "GET" && url === "/api/posts") {
    try { await authenticateOperator(req); } catch (error) { apiError(res, error); return; }
    try {
      const raw = await readFile(POSTS_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(raw); return;
    } catch { jsonErr(res, 500, "could not read posts.json"); return; }
  }

  // GET /api/testimonials — always-fresh testimonials.json (mirrors /api/posts).
  // Read-only: the testimonials come from a public CipherExam Firestore
  // collection via scripts/pull-testimonials.mjs; the dashboard never writes them.
  // If the file doesn't exist yet (pull never run), return a tidy empty payload
  // instead of a 500 so the panel can show its empty state.
  if (req.method === "GET" && url === "/api/testimonials") {
    try { await authenticateOperator(req); } catch (error) { apiError(res, error); return; }
    try {
      const raw = await readFile(TESTIMONIALS_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(raw); return;
    } catch {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ _meta: { count: 0, note: "testimonials.json not found - run node scripts/pull-testimonials.mjs" }, testimonials: [] }));
      return;
    }
  }

  // POST /api/publish — mark a post as published
  if (req.method === "POST" && url === "/api/publish") {
    try {
      await authenticateOperator(req);
    } catch (error) {
      apiError(res, error); return;
    }
    let body;
    try { body = await readBody(req); } catch (error) { apiError(res, error); return; }
    const { id, postUrl } = body;
    if (!id || !postUrl) { jsonErr(res, 400, "id and postUrl required"); return; }
    let safePostUrl;
    try { safePostUrl = requireHttpUrl(postUrl); } catch (error) { apiError(res, error); return; }
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
      post.postUrl  = safePostUrl;
      data._meta.lastUpdatedAt = now;
      await writeFile(POSTS_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
      // Rebuild dashboard in background so the inline state reflects the change
      setImmediate(triggerRebuild);
      console.log(`[api] published: ${id} → ${safePostUrl}`);
      jsonOk(res, { ok: true, id, status: "posted", postedAt: now });
    } catch (e) { apiError(res, e); }
    return;
  }

  // POST /api/campaign/reset - local mirror of the recoverable full reset.
  if (req.method === "POST" && url === "/api/campaign/reset") {
    try { await authenticateOperator(req); } catch (error) { apiError(res, error); return; }
    let body;
    try { body = await readBody(req); } catch (error) { apiError(res, error); return; }
    try {
      if (body.confirmation !== RESET_CONFIRMATION) {
        jsonErr(res, 400, `Type ${RESET_CONFIRMATION} to confirm.`); return;
      }
      if (typeof body.requestId !== "string" || !/^[a-zA-Z0-9_-]{12,80}$/.test(body.requestId)) {
        jsonErr(res, 400, "A valid reset request ID is required."); return;
      }
      const [currentState, currentPosts, currentCompetitors] = await Promise.all([
        readFile(STATE_FILE, "utf8").then(JSON.parse),
        readFile(POSTS_FILE, "utf8").then(JSON.parse),
        readFile(COMPETITORS_FILE, "utf8").then(JSON.parse),
      ]);
      const now = new Date();
      const archive = {
        archiveId: body.requestId,
        createdAt: now.toISOString(),
        previousCampaignStart: currentState?.campaign?.start || null,
        newCampaignStart: body.startDate,
        state: currentState,
        posts: currentPosts,
        competitors: currentCompetitors,
      };
      const freshState = buildFreshState(currentState, body.startDate, now);
      const freshPosts = buildFreshPosts(currentPosts, body.startDate, now);
      const freshCompetitors = buildFreshCompetitors(now);
      await mkdir(ARCHIVES_DIR, { recursive: true });
      await Promise.all([
        writeFile(join(ARCHIVES_DIR, `${body.requestId}.json`), JSON.stringify(archive, null, 2) + "\n", "utf8"),
        writeFile(STATE_FILE, JSON.stringify(freshState, null, 2) + "\n", "utf8"),
        writeFile(POSTS_FILE, JSON.stringify(freshPosts, null, 2) + "\n", "utf8"),
        writeFile(COMPETITORS_FILE, JSON.stringify(freshCompetitors, null, 2) + "\n", "utf8"),
      ]);
      console.log(`[api] full campaign reset: ${body.requestId} -> ${freshState.campaign.start}`);
      jsonOk(res, { ok: true, archiveId: body.requestId, newCampaignStart: body.startDate, recoverable: true });
    } catch (e) {
      const validationError = /startDate|calendar date|confirm|request ID/.test(e.message);
      jsonErr(res, validationError ? 400 : 500, validationError ? e.message : "request failed");
    }
    return;
  }
  // Named tasks: POST /api/tasks/run {task} starts an allowlisted headless
  // task for the operator (one at a time, whole-server); GET /api/tasks/status
  // is the poll target. /api/trend-scout/* remains as an alias so the deployed
  // dashboard's button keeps working against older pages.
  if (url === "/api/tasks/run" || url === "/api/tasks/status" ||
      url === "/api/trend-scout/run" || url === "/api/trend-scout/status") {
    try { await authenticateOperator(req); } catch (error) { apiError(res, error); return; }
    const isStatus = url.endsWith("/status");
    if (req.method === "GET" && isStatus) {
      jsonOk(res, { ok: true, tasks: Object.keys(TASKS), ...taskState });
    } else if (req.method === "POST" && !isStatus) {
      let id = "trend-scout";
      if (url === "/api/tasks/run") {
        let body;
        try { body = await readBody(req); } catch (error) { apiError(res, error); return; }
        id = String(body.task || "");
        if (!TASKS[id]) { jsonErr(res, 400, `unknown task "${id}" - known: ${Object.keys(TASKS).join(", ")}`); return; }
      }
      if (taskState.running) {
        jsonErr(res, 409, `task "${taskState.task}" is already in progress`);
      } else {
        startTask(id);
        jsonOk(res, { ok: true, task: id, startedAt: taskState.startedAt });
      }
    } else {
      jsonErr(res, 405, "method not allowed");
    }
    return;
  }

  // POST /api/grade - proxy to the deployed grading function. Grading lives in
  // a Cloud Function behind a hosting rewrite; the deployed dashboard reaches
  // it at the same relative path, but this local server never did, so the
  // grade modal AND Brad's voice grading 404'd locally (caught 2026-08-21).
  // The operator token is verified upstream - forward it untouched.
  if (req.method === "POST" && url === "/api/grade") {
    let body;
    try { body = await readBody(req); } catch (error) { apiError(res, error); return; }
    try {
      const up = await fetch("https://cipher-marketing-daveq.web.app/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: req.headers.authorization || "" },
        body: JSON.stringify(body),
      });
      const text = await up.text();
      res.writeHead(up.status, { "Content-Type": "application/json" });
      res.end(text);
    } catch (e) {
      jsonErr(res, 502, "grader unreachable: " + e.message);
    }
    return;
  }

  // GET /api/ga4-clicks?post=<id> - link clicks + attributed trial signups for
  // one post, resolved from its CTA's UTM tags against GA4. LinkedIn never
  // shows clicks, so this is the only honest source; Brad's rail calls it
  // before submitting a grade so a voice-graded post is not graded blind
  // (signups are the one metric that can lift a grade a full letter).
  if (req.method === "GET" && url === "/api/ga4-clicks") {
    try { await authenticateOperator(req); } catch (error) { apiError(res, error); return; }
    const postId = new URL(req.url, "http://x").searchParams.get("post") || "";
    if (!/^[a-z0-9-]+$/i.test(postId)) { jsonErr(res, 400, "post id required"); return; }
    try {
      const out = await new Promise((resolve, reject) => {
        execFile(process.execPath, [join(HERE, "scripts/pull-ga4-clicks.mjs"), "--post", postId, "--json"],
          { cwd: HERE, timeout: 60000, maxBuffer: 1024 * 1024 },
          (err, stdout, stderr) => {
            // The script intermittently trips a libuv assertion ON EXIT, after
            // it has already printed its JSON (seen 2026-08-21). A nonzero exit
            // with good output is still good output - only fail when the
            // JSON is genuinely absent.
            if (stdout && stdout.indexOf("{") !== -1) return resolve(stdout);
            reject(new Error(((stderr || (err && err.message) || "no output")).trim().slice(0, 300)));
          });
      });
      const parsed = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
      jsonOk(res, { ok: true, ...parsed });
    } catch (e) {
      jsonErr(res, 502, "GA4 lookup failed: " + e.message);
    }
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
  // Use localhost in browser-facing URLs because Firebase OAuth authorizes
  // hostnames, and 127.0.0.1 is intentionally not an authorized domain.
  const url = `http://${HOST === "0.0.0.0" || HOST === "127.0.0.1" ? "localhost" : HOST}:${PORT}/`;
  console.log(`\n  CipherExam marketing dashboard`);
  console.log(`  Serving:  ${ROOT}`);
  console.log(`  URL:      ${url}app.html`);
  console.log(`  Rollup:   ${url}launch-campaign.html`);
  if (HOST === "0.0.0.0") {
    console.log(`  LAN:      accessible from other devices on this network`);
  }
  console.log(`\n  Press Ctrl-C to stop.\n`);
});

// Keep published testimonials fresh automatically — no manual pull needed.
// Runs the read-only pull script on startup and every 10 min while the server
// is up, refreshing site/data/testimonials.json from the public CipherExam
// collection. Non-blocking; failures are ignored (panel falls back to last good
// data / empty state). Run `node scripts/pull-testimonials.mjs` for an instant
// refresh between intervals.
function refreshTestimonials() {
  try {
    const child = spawn(process.execPath, [join(HERE, "scripts/pull-testimonials.mjs")], { stdio: "ignore" });
    child.on("error", () => {});
  } catch { /* ignore */ }
}
refreshTestimonials();
setInterval(refreshTestimonials, 10 * 60 * 1000).unref?.();

process.on("SIGINT", () => { console.log("\n  Server stopped."); process.exit(0); });
