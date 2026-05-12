#!/usr/bin/env node
// Local HTTP server for the CipherExam marketing dashboard.
//
// Default: http://localhost:8766/app.html
// Override port: PORT=9000 node serve.mjs
// Override bind: HOST=0.0.0.0 node serve.mjs   (accessible on LAN)
//
// Press Ctrl-C to stop.

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

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

const server = http.createServer(async (req, res) => {
  const t0 = Date.now();
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
