#!/usr/bin/env node
// Renders the SEO review section from site/data/seo-audit.json and injects it
// into site/app.html and site/seo.html between the <!--SEO-SECTION--> markers.
//
// Why a generator: app.html is hand-edited and must never be regenerated
// wholesale (see build-app.mjs), but this one section has ~1,500 lines of
// data-driven markup. Marker-scoped replacement keeps every other hand edit
// intact while giving the audit a single source of truth.
//
// Re-run after editing site/data/seo-audit.json:
//   npm run seo:build

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OPEN = "<!--SEO-SECTION-->";
const CLOSE = "<!--/SEO-SECTION-->";

const audit = JSON.parse(readFileSync(join(ROOT, "site/data/seo-audit.json"), "utf8"));

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SEV = {
  critical: { label: "Critical", color: "var(--bad)" },
  high:     { label: "High",     color: "var(--warn)" },
  medium:   { label: "Medium",   color: "var(--cyan)" },
  low:      { label: "Low",      color: "var(--dim)" },
};

function scoreColor(n) {
  if (n >= 8) return "var(--good)";
  if (n >= 6) return "var(--warn)";
  return "var(--bad)";
}

// ---------- blocks ----------

function hero() {
  const m = audit.meta;
  return `
  <div class="hero">
    <h1>SEO &amp; Answer-Engine Review</h1>
    <p class="sub">${esc(m.target)} · crawled ${esc(m.crawled_at)} · ${m.pages_crawled} pages, ${m.probes} probe URLs. <span style="color:var(--dim)">${esc(m.next_refresh)}</span></p>
  </div>

  <div class="card seo-method">
    <p style="margin-top:0"><strong>How this was measured.</strong> ${esc(m.method)}</p>
    <p style="margin-bottom:6px"><strong>What is deliberately absent.</strong></p>
    <ul style="margin-top:0">${m.data_not_available.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <p style="margin-bottom:0;color:var(--dim);font-size:.86rem">${esc(m.scope_note)}</p>
  </div>`;
}

function scorecard() {
  const s = audit.scorecard;
  return `
  <h2>Scorecard</h2>
  <div class="seo-overall card">
    <div class="seo-overall-num" style="color:${scoreColor(s.overall / 10)}">${s.overall}<span>/100</span></div>
    <div class="seo-overall-body">
      <div class="seo-grade">Grade ${esc(s.grade)}${s.history ? ` · ${s.history.map((h) => `${h.score} (${esc(h.date)})`).join(" → ")}` : ""}</div>
      <p>${esc(s.verdict)}</p>
    </div>
  </div>
  <div class="seo-dim-grid">
    ${s.dimensions.map((d) => `
    <div class="seo-dim">
      <div class="seo-dim-head"><span class="seo-dim-name">${esc(d.name)}</span><span class="seo-dim-score" style="color:${scoreColor(d.score)}">${d.score}<em>/10</em></span></div>
      <div class="seo-meter"><span style="width:${d.score * 10}%;background:${scoreColor(d.score)}"></span></div>
      <p>${esc(d.note)}</p>
    </div>`).join("")}
  </div>`;
}

function findings() {
  const order = ["critical", "high", "medium", "low"];
  const list = [...audit.findings].sort((a, b) => (a.status === "resolved") - (b.status === "resolved") || order.indexOf(a.severity) - order.indexOf(b.severity));
  const counts = order.map((k) => `${list.filter((f) => f.severity === k).length} ${SEV[k].label.toLowerCase()}`).join(" · ");
  return `
  <h2>Findings <span class="seo-count">${list.length} — ${counts}</span></h2>
  <div class="seo-findings">
    ${list.map((f) => `
    <details class="seo-finding${f.status === "resolved" ? " is-resolved" : ""}" data-sev="${esc(f.severity)}">
      <summary>
        ${f.status === "resolved" ? `<span class="seo-sev" style="background:var(--good)">Resolved</span>` : `<span class="seo-sev" style="background:${SEV[f.severity].color}">${SEV[f.severity].label}</span>`}
        <span class="seo-fid">${esc(f.id)}</span>
        <span class="seo-ftitle">${esc(f.title)}</span>
        <span class="seo-fmeta">${esc(f.effort)}</span>
      </summary>
      <div class="seo-finding-body">
        <p><strong>Evidence.</strong> ${esc(f.evidence)}</p>
        <p><strong>Why it matters.</strong> ${esc(f.why)}</p>
        <p><strong>Fix.</strong> ${esc(f.fix)}</p>
        ${f.resolution ? `<p class="seo-resolution"><strong>Done.</strong> ${esc(f.resolution)}</p>` : ""}
        <p class="seo-fbadges"><span>Effort ${esc(f.effort)}</span><span>Impact ${esc(f.impact)}</span></p>
      </div>
    </details>`).join("")}
  </div>`;
}

function crawlTable() {
  const c = audit.crawl;
  const head = ["Page", "Title", "Desc", "Words", "H2", "H3", "Out", "In", "LD", "Canon", "Img", "No alt"];
  const flag = (v, bad, warn) => (bad(v) ? ' class="seo-bad"' : warn && warn(v) ? ' class="seo-warn"' : "");
  return `
  <h2>Crawl snapshot <span class="seo-count">${c.rows.length} URLs, all HTTP 200</span></h2>
  <p style="color:var(--dim);font-size:.86rem;margin-top:-6px">${esc(c.legend)}</p>
  <div class="seo-table-wrap">
    <table class="seo-table">
      <thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>
      ${c.rows.map((r) => {
        const [p, tl, dl, w, h2, h3, out, inl, ld, self, im, na] = r;
        return `<tr>
          <td class="seo-path"><a href="${esc(audit.meta.target + p)}" target="cipherexam" rel="noopener">${esc(p)}</a></td>
          <td${flag(tl, (v) => v > 60)}>${tl}</td>
          <td${flag(dl, (v) => v > 160)}>${dl}</td>
          <td${flag(w, (v) => v < 700)}>${w}</td>
          <td${flag(h2, (v) => v === 0)}>${h2}</td>
          <td>${h3}</td>
          <td>${out}</td>
          <td${flag(inl, (v) => v === 0, (v) => v <= 4)}>${inl}</td>
          <td${flag(ld, (v) => v < 2)}>${ld}</td>
          <td${self ? "" : ' class="seo-bad"'}>${self ? "self" : "→ /"}</td>
          <td>${im}</td>
          <td${flag(na, () => false, (v) => v > 0)}>${na}</td>
        </tr>`;
      }).join("")}
      </tbody>
    </table>
  </div>
  <p style="color:var(--dim);font-size:.82rem">Red = defect. Amber = worth a look. <strong>In</strong> is inbound internal links from the other 22 crawled pages — the column that explains most of this report.</p>`;
}

function keywordMap() {
  return `
  <h2>Keyword map</h2>
  <p style="color:var(--dim);font-size:.86rem;margin-top:-6px">No search volumes — no keyword tool was used and inventing them would be worse than leaving them out. Assign volume once Search Console has 28 days of data.</p>
  <div class="seo-table-wrap">
    <table class="seo-table seo-table-wide">
      <thead><tr><th>Page</th><th>Primary target</th><th>Intent</th><th>Current H1</th><th>Gap</th></tr></thead>
      <tbody>
      ${audit.keyword_map.map((k) => `<tr${k.page === "MISSING" ? ' class="seo-row-missing"' : ""}>
        <td class="seo-path">${k.page === "MISSING" ? '<span class="seo-missing">no page</span>' : `<a href="${esc(audit.meta.target + k.page)}" target="cipherexam" rel="noopener">${esc(k.page)}</a>`}</td>
        <td><strong>${esc(k.primary)}</strong></td>
        <td>${esc(k.intent)}</td>
        <td>${esc(k.current_h1)}</td>
        <td>${esc(k.gap)}</td>
      </tr>`).join("")}
      </tbody>
    </table>
  </div>`;
}

function contentPlan() {
  return `
  <h2>Content plan</h2>
  <div class="seo-wave-grid">
    ${audit.content_plan.map((w) => `
    <div class="seo-wave">
      <h3>${esc(w.wave)}</h3>
      <ul>${w.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>`).join("")}
  </div>`;
}

function aeo() {
  const dot = { present: "var(--good)", partial: "var(--warn)", missing: "var(--bad)", broken: "var(--bad)" };
  return `
  <h2>Answer-engine readiness</h2>
  <div class="seo-aeo-grid">
    ${audit.aeo.map((a) => `
    <div class="seo-aeo">
      <div class="seo-aeo-head"><span class="seo-dot" style="background:${dot[a.status] || "var(--dim)"}"></span><strong>${esc(a.item)}</strong><span class="seo-aeo-status">${esc(a.status)}</span></div>
      <p>${esc(a.note)}</p>
    </div>`).join("")}
  </div>`;
}

function competitors() {
  const c = audit.competitors;
  return `
  <h2>Competitor gap</h2>
  <p style="color:var(--dim);font-size:.86rem;margin-top:-6px">${esc(c.method)}</p>
  <div class="seo-serp-grid">
    ${c.serps.map((s) => `
    <div class="seo-serp">
      <div class="seo-serp-head"><code>${esc(s.query)}</code><span class="seo-serp-flag">${s.cipherexam_present ? "present" : "not on page 1"}</span></div>
      <p><strong>Who owns it.</strong> ${esc(s.who_owns_it)}</p>
      <p>${esc(s.read)}</p>
    </div>`).join("")}
  </div>
  <h3>From the September landscape scan</h3>
  <ul class="seo-intel">${c.from_repo_intel.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

function plan90() {
  return `
  <h2>90-day plan</h2>
  <div class="seo-plan">
    ${audit.plan_90.map((p) => `
    <div class="seo-plan-window">
      <div class="seo-plan-head"><h3>${esc(p.window)}</h3><span>${esc(p.outcome)}</span></div>
      <ol>${p.actions.map((a) => `<li>${esc(a)}</li>`).join("")}</ol>
    </div>`).join("")}
  </div>`;
}

function blindSpots() {
  return `
  <h2>Blind spots, risks and assumptions</h2>
  <div class="card seo-blind">
    <ol>${audit.blind_spots.map((b) => `<li>${esc(b)}</li>`).join("")}</ol>
  </div>`;
}


function priorityQueue() {
  const q = audit.priority;
  const tiers = [];
  q.actions.forEach((a) => {
    const t = tiers.find((x) => x.name === a.tier);
    if (t) t.items.push(a); else tiers.push({ name: a.tier, items: [a] });
  });
  return `
  <div class="seo-pq-head card">
    <div class="seo-pq-score">
      <div class="seo-pq-now"><span id="seo-live-score">${audit.scorecard.overall}</span><em>/100</em></div>
      <div class="seo-pq-track"><span id="seo-live-bar" style="width:${audit.scorecard.overall}%"></span><i style="left:${q.ceiling}%"></i></div>
      <div class="seo-pq-legend"><span>now ${audit.scorecard.overall}</span><span id="seo-live-note">tick items to project</span><span>ceiling ${q.ceiling}</span></div>
    </div>
    <div class="seo-pq-copy">
      <h2 style="margin:0 0 6px">Do these in this order</h2>
      <p style="margin:0 0 8px">${esc(q.scoring_note)}</p>
      <p style="margin:0;color:var(--dim);font-size:.85rem">${esc(q.ceiling_note)}</p>
    </div>
  </div>

  <div class="seo-pq">
    ${tiers.map((t) => `
    <div class="seo-pq-tier">
      <div class="seo-pq-tier-head"><h3>${esc(t.name)}</h3><span>${t.items.filter((i) => !i.done).reduce((s, i) => s + i.points, 0).toFixed(1)} pts open · ${t.items.filter((i) => i.done).length ? t.items.filter((i) => i.done).length + " shipped · " : ""}${t.items.length} item${t.items.length > 1 ? "s" : ""}</span></div>
      ${t.items.map((a) => `
      <details class="seo-act${a.done ? " is-shipped" : ""}" data-points="${a.done ? 0 : a.points}" data-rank="${a.rank}">
        <summary>
          <input type="checkbox" class="seo-act-box" data-rank="${a.rank}" onclick="event.stopPropagation()" aria-label="Mark done"${a.done ? " checked disabled" : ""}>
          <span class="seo-act-rank">${a.rank === 0 ? "0" : a.rank}</span>
          <span class="seo-act-title">${esc(a.title)}</span>
          ${a.done ? `<span class="seo-act-shipped">shipped ${esc(a.done_at)} · +${a.points.toFixed(1)} banked</span>` : `<span class="seo-act-pts${a.points === 0 ? " zero" : ""}">${a.points === 0 ? "0 pts" : "+" + a.points.toFixed(1)}</span>`}
          <span class="seo-act-effort">${esc(a.effort)}</span>
        </summary>
        <div class="seo-act-body">
          ${a.dimension && a.dimension !== "\u2014" ? `<p class="seo-act-dim">${esc(a.dimension)}</p>` : ""}
          <ol class="seo-act-steps">${a.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
          <p class="seo-act-why">${esc(a.why)}</p>
          ${a.ref && a.ref !== "\u2014" ? `<p class="seo-act-ref">Detail: finding ${esc(a.ref)} below</p>` : ""}
        </div>
      </details>`).join("")}
    </div>`).join("")}
  </div>

  <script>
  (function () {
    var KEY = 'cipherSeoDone';
    var base = ${audit.scorecard.overall};
    function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
    function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
    function paint() {
      var done = read();
      var gained = 0, total = 0, count = 0;
      document.querySelectorAll('.seo-act').forEach(function (el) {
        var rank = el.getAttribute('data-rank');
        var pts = parseFloat(el.getAttribute('data-points')) || 0;
        var box = el.querySelector('.seo-act-box');
        if (el.classList.contains('is-shipped')) { return; }
        var on = done.indexOf(rank) !== -1;
        if (box) box.checked = on;
        el.classList.toggle('is-done', on);
        total += pts;
        if (on) { gained += pts; count++; }
      });
      var score = Math.round(base + gained);
      var s = document.getElementById('seo-live-score');
      var bar = document.getElementById('seo-live-bar');
      var note = document.getElementById('seo-live-note');
      if (s) s.textContent = score;
      if (bar) bar.style.width = Math.min(100, score) + '%';
      if (note) note.textContent = count
        ? count + ' done · ' + (total - gained).toFixed(1) + ' pts left on the table'
        : 'tick items to project';
    }
    document.addEventListener('change', function (e) {
      if (!e.target.classList || !e.target.classList.contains('seo-act-box')) return;
      var rank = e.target.getAttribute('data-rank');
      var done = read();
      var i = done.indexOf(rank);
      if (e.target.checked) { if (i === -1) done.push(rank); }
      else if (i !== -1) { done.splice(i, 1); }
      write(done);
      paint();
    });
    paint();
  })();
  <\/script>`;
}

const CSS = `
  <style>
  .seo-pq-head { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; border-color: rgba(125,211,252,.35); }
  .seo-pq-score { flex: 0 0 220px; }
  .seo-pq-now { font-family: 'Satoshi', system-ui, sans-serif; font-size: 3rem; font-weight: 800; line-height: 1; color: var(--cyan); }
  .seo-pq-now em { font-style: normal; font-size: 1rem; color: var(--dim); font-weight: 600; }
  .seo-pq-track { position: relative; height: 8px; border-radius: 4px; background: var(--surface-2); margin: 10px 0 6px; overflow: visible; }
  .seo-pq-track span { display: block; height: 100%; border-radius: 4px; background: var(--cyan); transition: width .25s ease; }
  .seo-pq-track i { position: absolute; top: -3px; width: 2px; height: 14px; background: var(--good); }
  .seo-pq-legend { display: flex; justify-content: space-between; font-size: .72rem; color: var(--dim); gap: 8px; }
  .seo-pq-copy { flex: 1 1 340px; font-size: .88rem; line-height: 1.6; color: var(--muted); }
  .seo-pq { display: flex; flex-direction: column; gap: 18px; margin: 18px 0 26px; }
  .seo-pq-tier-head { display: flex; align-items: baseline; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-bottom: 8px; }
  .seo-pq-tier-head h3 { margin: 0; font-size: .82rem; text-transform: uppercase; letter-spacing: .1em; color: var(--purple); font-family: 'Satoshi', system-ui, sans-serif; }
  .seo-pq-tier-head span { margin-left: auto; font-size: .74rem; color: var(--dim); }
  details.seo-act { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 7px; overflow: hidden; }
  details.seo-act.is-done { opacity: .5; }
  details.seo-act.is-shipped { border-left: 3px solid var(--good); opacity: .75; }
  details.seo-act.is-shipped .seo-act-title { text-decoration: line-through; color: var(--muted); }
  .seo-act-shipped { font-size: .72rem; font-weight: 700; color: var(--good); background: rgba(74,222,128,.10); border: 1px solid rgba(74,222,128,.25); border-radius: 5px; padding: 2px 8px; }
  details.seo-finding.is-resolved { opacity: .7; border-left: 3px solid var(--good) !important; }
  .seo-resolution { color: var(--good); }
  details.seo-act.is-done .seo-act-title { text-decoration: line-through; }
  details.seo-act > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 11px 14px; font-family: 'Satoshi', system-ui, sans-serif; }
  details.seo-act > summary::-webkit-details-marker { display: none; }
  .seo-act-box { width: 16px; height: 16px; accent-color: var(--cyan); cursor: pointer; flex: none; }
  .seo-act-rank { font-size: .74rem; font-weight: 800; color: var(--dim); width: 18px; text-align: center; flex: none; }
  .seo-act-title { font-weight: 700; font-size: .93rem; flex: 1 1 300px; }
  .seo-act-pts { font-size: .74rem; font-weight: 800; color: var(--good); background: rgba(74,222,128,.12); border: 1px solid rgba(74,222,128,.3); border-radius: 5px; padding: 2px 8px; }
  .seo-act-pts.zero { color: var(--dim); background: var(--surface-2); border-color: var(--border); }
  .seo-act-effort { font-size: .74rem; color: var(--muted); min-width: 60px; text-align: right; }
  .seo-act-body { padding: 4px 16px 14px 44px; font-size: .89rem; line-height: 1.6; }
  .seo-act-dim { margin: 0 0 8px; font-size: .74rem; color: var(--cyan); text-transform: uppercase; letter-spacing: .06em; }
  ol.seo-act-steps { margin: 0 0 10px; padding-left: 1.2em; }
  ol.seo-act-steps li { margin-bottom: 4px; }
  .seo-act-why { margin: 0 0 6px; color: var(--muted); }
  .seo-act-ref { margin: 0; font-size: .76rem; color: var(--dim); }
  details.seo-detail { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); margin-bottom: 10px; }
  details.seo-detail > summary { list-style: none; cursor: pointer; padding: 12px 16px; background: var(--surface-2); font-family: 'Satoshi', system-ui, sans-serif; font-weight: 700; font-size: .9rem; color: var(--cyan); }
  details.seo-detail > summary::-webkit-details-marker { display: none; }
  details.seo-detail > summary::before { content: '\u25B8'; margin-right: 8px; display: inline-block; transition: transform .15s ease; }
  details.seo-detail[open] > summary::before { transform: rotate(90deg); }
  .seo-detail-body { padding: 4px 18px 18px; }
  .seo-detail-body > h2:first-child { margin-top: 12px; }
  .seo-method { border-color: rgba(125,211,252,.35); font-size: .92rem; line-height: 1.6; }
  .seo-method ul { margin-bottom: 10px; padding-left: 1.2em; }
  .seo-count { font-size: .78rem; font-weight: 500; color: var(--dim); letter-spacing: 0; text-transform: none; margin-left: 8px; }
  .seo-overall { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; border-color: rgba(125,211,252,.35); }
  .seo-overall-num { font-family: 'Satoshi', system-ui, sans-serif; font-size: 3.4rem; font-weight: 800; line-height: 1; }
  .seo-overall-num span { font-size: 1.1rem; color: var(--dim); font-weight: 600; }
  .seo-overall-body { flex: 1 1 320px; }
  .seo-grade { font-family: 'Satoshi', system-ui, sans-serif; font-weight: 700; color: var(--cyan); font-size: .82rem; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
  .seo-overall-body p { margin: 0; line-height: 1.6; }
  .seo-dim-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin: 16px 0 8px; }
  .seo-dim { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; }
  .seo-dim-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .seo-dim-name { font-family: 'Satoshi', system-ui, sans-serif; font-weight: 700; font-size: .92rem; }
  .seo-dim-score { font-family: 'Satoshi', system-ui, sans-serif; font-weight: 800; font-size: 1.25rem; }
  .seo-dim-score em { font-style: normal; font-size: .72rem; color: var(--dim); }
  .seo-meter { height: 5px; border-radius: 3px; background: var(--surface-2); margin: 8px 0 10px; overflow: hidden; }
  .seo-meter span { display: block; height: 100%; border-radius: 3px; }
  .seo-dim p { margin: 0; font-size: .85rem; color: var(--muted); line-height: 1.55; }
  .seo-findings { display: flex; flex-direction: column; gap: 8px; }
  details.seo-finding { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  details.seo-finding[data-sev="critical"] { border-left: 3px solid var(--bad); }
  details.seo-finding[data-sev="high"] { border-left: 3px solid var(--warn); }
  details.seo-finding[open] { border-color: rgba(125,211,252,.4); }
  details.seo-finding > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 16px; background: var(--surface-2); font-family: 'Satoshi', system-ui, sans-serif; }
  details.seo-finding > summary::-webkit-details-marker { display: none; }
  .seo-sev { font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #06121f; padding: 2px 7px; border-radius: 4px; }
  .seo-fid { font-size: .74rem; color: var(--dim); font-weight: 700; }
  .seo-ftitle { font-weight: 700; font-size: .93rem; flex: 1 1 320px; }
  .seo-fmeta { font-size: .74rem; color: var(--muted); margin-left: auto; }
  .seo-finding-body { padding: 14px 18px; font-size: .9rem; line-height: 1.65; }
  .seo-finding-body p { margin: 0 0 10px; }
  .seo-fbadges { display: flex; gap: 8px; margin-bottom: 0 !important; }
  .seo-fbadges span { font-size: .72rem; color: var(--muted); background: var(--surface-2); border: 1px solid var(--border); border-radius: 5px; padding: 2px 8px; }
  .seo-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
  table.seo-table { border-collapse: collapse; width: 100%; font-size: .82rem; }
  table.seo-table th { text-align: left; padding: 9px 10px; background: var(--surface-2); color: var(--dim); font-family: 'Satoshi', system-ui, sans-serif; font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; position: sticky; top: 0; }
  table.seo-table td { padding: 8px 10px; border-top: 1px solid var(--border); vertical-align: top; }
  table.seo-table td.seo-path { white-space: nowrap; }
  table.seo-table td.seo-path a { color: var(--cyan); text-decoration: none; }
  table.seo-table td.seo-path a:hover { text-decoration: underline; }
  td.seo-bad { color: var(--bad); font-weight: 700; }
  td.seo-warn { color: var(--warn); }
  table.seo-table-wide td { white-space: normal; min-width: 120px; }
  table.seo-table-wide td:last-child { min-width: 260px; color: var(--muted); }
  tr.seo-row-missing { background: rgba(248,113,113,.06); }
  .seo-missing { color: var(--bad); font-weight: 700; font-size: .78rem; text-transform: uppercase; letter-spacing: .05em; }
  .seo-wave-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
  .seo-wave { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; }
  .seo-wave h3 { margin: 0 0 8px; font-size: .92rem; color: var(--cyan); }
  .seo-wave ul { margin: 0; padding-left: 1.15em; font-size: .86rem; line-height: 1.6; }
  .seo-wave li { margin-bottom: 6px; }
  .seo-aeo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 10px; }
  .seo-aeo { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
  .seo-aeo-head { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: .9rem; }
  .seo-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
  .seo-aeo-status { margin-left: auto; font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); }
  .seo-aeo p { margin: 0; font-size: .84rem; color: var(--muted); line-height: 1.55; }
  .seo-serp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
  .seo-serp { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; }
  .seo-serp-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .seo-serp-head code { background: var(--surface-2); border: 1px solid var(--border); border-radius: 5px; padding: 3px 8px; font-size: .82rem; color: var(--text); }
  .seo-serp-flag { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--bad); font-weight: 700; }
  .seo-serp p { margin: 0 0 8px; font-size: .86rem; line-height: 1.6; color: var(--muted); }
  .seo-serp p:last-child { margin-bottom: 0; }
  ul.seo-intel { font-size: .88rem; line-height: 1.65; padding-left: 1.15em; }
  ul.seo-intel li { margin-bottom: 8px; }
  .seo-plan { display: flex; flex-direction: column; gap: 12px; }
  .seo-plan-window { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; }
  .seo-plan-head { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 8px; }
  .seo-plan-head h3 { margin: 0; font-size: .95rem; color: var(--cyan); }
  .seo-plan-head span { font-size: .82rem; color: var(--dim); }
  .seo-plan-window ol { margin: 0; padding-left: 1.3em; font-size: .88rem; line-height: 1.65; }
  .seo-plan-window li { margin-bottom: 5px; }
  .seo-blind { border-color: rgba(250,204,21,.35); }
  .seo-blind ol { margin: 0; padding-left: 1.3em; font-size: .92rem; line-height: 1.7; }
  .seo-blind li { margin-bottom: 10px; }
  @media (max-width: 700px) { .seo-overall-num { font-size: 2.6rem; } .seo-fmeta { margin-left: 0; } }
  </style>`;

const wrap = (title, body) =>
  `<details class="seo-detail"><summary>${title}</summary><div class="seo-detail-body">${body}</div></details>`;

const SECTION = [
  CSS,
  hero(),
  priorityQueue(),
  blindSpots(),
  `<h2>Supporting detail</h2>`,
  wrap("Scorecard — how the 63 is calculated", scorecard()),
  wrap("Findings — the 13 defects behind the actions", findings()),
  wrap("Crawl snapshot — all 23 URLs, measured", crawlTable()),
  wrap("Keyword map — page by page", keywordMap()),
  wrap("Answer-engine readiness checklist", aeo()),
  wrap("Competitor gap — who owns your four target queries", competitors()),
  wrap("Content plan and 90-day schedule", contentPlan() + plan90()),
].join("\n");

function inject(relPath) {
  const path = join(ROOT, relPath);
  let html;
  try { html = readFileSync(path, "utf8"); }
  catch { console.log(`skip (not present): ${relPath}`); return; }
  const re = new RegExp(`${OPEN}[\\s\\S]*?${CLOSE}`);
  if (!re.test(html)) { console.error(`  MISSING MARKERS in ${relPath} — nothing injected`); process.exitCode = 1; return; }
  const next = html.replace(re, `${OPEN}\n${SECTION}\n${CLOSE}`);
  if (next !== html) { writeFileSync(path, next); console.log(`injected: ${relPath} (${SECTION.length} bytes)`); }
  else console.log(`unchanged: ${relPath}`);
}

inject("site/app.html");
inject("site/seo.html");
console.log(`\nSEO section rendered from site/data/seo-audit.json — ${audit.findings.length} findings, ${audit.crawl.rows.length} crawled URLs.`);
