/* ============================================================================
 * HAL 9000 rail - the shared campaign assistant, injected on EVERY page.
 *
 * Single source of truth: drop `<script src="assets/hal-rail.js"></script>`
 * before </body> on any page and this self-injects its own CSS + markup + logic.
 * inline-assets.mjs adds that tag to every built page; app.html carries an
 * equivalent inline copy (it is hand-edited and skipped by the build).
 *
 * Layout: a PERMANENT full-height rail docked to the right edge, starting BELOW
 * the header (its top tracks the measured .nav height), with a thin collapse
 * handle on its left. The page reflows via `body { padding-right }` and the nav
 * breaks out to full width, so HAL sits beneath the header card, never over it.
 *
 * Backend: POSTs to the local campaign-expert HAL at 127.0.0.1:9142, start it
 * with cipher-marketing/hal-here.bat or `hal app cipher-marketing`. (ASCII-only on purpose.)
 * ========================================================================== */
(function () {
  if (window.__halRail) return;
  window.__halRail = true;

  function init() {
    if (document.getElementById("halw-rail")) return;
    var HAL_API = "http://127.0.0.1:9142";  // hal app cipher-marketing (campaign-expert)

    function halAskHeaders() {
      if (!window.cipherAuthHeaders) {
        return Promise.reject(new Error("Cipher Marketing operator authentication is unavailable."));
      }
      return window.cipherAuthHeaders().then(function (auth) {
        return {
          "Content-Type": "application/json",
          "Authorization": auth.Authorization
        };
      });
    }

    // The client and local app expert both consume this canonical review.
    var PAGE_GUIDES = window.CIPHER_PAGE_KNOWLEDGE || {};
    if (!PAGE_GUIDES.today) {
      console.error("[HAL] assets/page-knowledge.js must load before hal-rail.js");
      return;
    }

    function normalizePageName(value) {
      return String(value || "").toLowerCase()
        .replace(/\b(tab|page|section|view)\b/g, " ")
        .replace(/[^a-z0-9+ ]/g, " ").replace(/\s+/g, " ").trim();
    }

    function findPageGuide(value) {
      var target = normalizePageName(value);
      if (!target) return null;
      var keys = Object.keys(PAGE_GUIDES);
      for (var i = 0; i < keys.length; i++) {
        var guide = PAGE_GUIDES[keys[i]];
        var names = [keys[i], guide.label].concat(guide.aliases || []);
        for (var j = 0; j < names.length; j++) {
          var name = normalizePageName(names[j]);
          if (target === name || target.indexOf(name + " ") === 0 || name.indexOf(target + " ") === 0) {
            return guide;
          }
        }
      }
      return null;
    }

    function findMentionedPageGuide(value) {
      var target = " " + normalizePageName(value) + " ";
      var keys = Object.keys(PAGE_GUIDES);
      for (var i = 0; i < keys.length; i++) {
        var guide = PAGE_GUIDES[keys[i]];
        var names = [keys[i], guide.label].concat(guide.aliases || []);
        for (var j = 0; j < names.length; j++) {
          var name = normalizePageName(names[j]);
          if (name && target.indexOf(" " + name + " ") >= 0) return guide;
        }
      }
      return null;
    }

    function currentPageGuide() {
      var file = (location.pathname.split("/").pop() || "").toLowerCase();
      if (file === "funnel.html") return PAGE_GUIDES.funnel;
      if (file === "sprint.html") return PAGE_GUIDES.sprint;
      var active = document.querySelector(".route-section.active[data-route]");
      var route = (location.hash || "").replace(/^#/, "") ||
        (active && active.getAttribute("data-route")) || "today";
      return PAGE_GUIDES[route] || PAGE_GUIDES.today;
    }

    function activatePage(guide) {
      if (!guide) return;
      if (guide.route && typeof window.cipherShow === "function") {
        window.cipherShow(guide.route);
      } else if (guide.route) {
        window.location.href = "app.html#" + guide.route;
      } else if (guide.path) {
        window.location.href = guide.path;
      }
    }

    // Live data the page already holds in memory, packed small. Without this
    // the brain answers "I can't see your screen" to questions about what a
    // panel shows (2026-08-21) — it only ever received page DESCRIPTIONS.
    // Every panel is digested, each capped hard, so the full picture costs a
    // page of text rather than the raw documents.
    function livePanelData() {
      var out = [];
      var clip = function (s, n) { return String(s == null ? "" : s).slice(0, n); };
      try {
        var t = window.__TREND__;
        if (t && t.angles && t.angles.length) {
          out.push("Trend Scout scan " + (t.scanDate || "?") + ":");
          t.angles.slice(0, 3).forEach(function (a) {
            out.push("  #" + a.rank + " [" + (a.exam || "?") + "] " + clip(a.label, 90) +
              (a.angleForBrad ? " — angle: " + clip(a.angleForBrad, 140) : ""));
          });
          if (t.honestyCaveat) out.push("  Caveat: " + clip(t.honestyCaveat, 200));
        } else if (t) {
          out.push("Trend Scout: no angles in the current scan (" + (t.scanDate || "?") + ").");
        }
      } catch (e) {}
      try {
        var st = window.__CAMPAIGN_STATE__;
        if (st && st.funnel) out.push("Funnel: " + clip(JSON.stringify(st.funnel), 220));
        var bp = st && st.boardPriorities;
        if (bp && bp.items && bp.items.length) {
          out.push("Board priorities (" + (bp.cycleDate || "?") + "): " +
            bp.items.slice(0, 6).map(function (it) { return (it.priority || "?") + " " + clip(it.text, 80); }).join(" | "));
        }
      } catch (e) {}
      try {
        var posts = (window.__POSTS__ && window.__POSTS__.posts) || [];
        if (posts.length) {
          var by = {};
          posts.forEach(function (p) { by[p.status || "?"] = (by[p.status || "?"] || 0) + 1; });
          var graded = posts.filter(function (p) { return p.grade; }).slice(-3)
            .map(function (p) { return (p.scheduled || "?") + " " + (p.channel || "?") + "=" + p.grade; });
          var next = posts.filter(function (p) { return p.status === "scheduled" || p.status === "draft"; })
            .sort(function (a, b) { return String(a.scheduled).localeCompare(String(b.scheduled)); })[0];
          out.push("Posts: " + JSON.stringify(by) +
            (next ? " · next up " + (next.scheduled || "?") + " " + (next.channel || "?") + " (" + (next.status || "?") + ")" : "") +
            (graded.length ? " · recent grades " + graded.join(", ") : ""));
        }
      } catch (e) {}
      try {
        var h = window.__HASHTAG_BAR__;
        if (h && h.posts && h.posts.length) {
          var ours = h.posts.findIndex(function (p) { return p.isOurs; });
          out.push("Hashtag bar (" + clip(h.scannedAt, 10) + "): top " +
            h.posts.slice(0, 3).map(function (p) { return clip(p.author, 22) + " " + p.reactions + "r"; }).join(", ") +
            (ours >= 0 ? " · ours ranks #" + (ours + 1) : "") +
            (h.separator ? " · finding: " + clip(h.separator, 180) : ""));
          if (h.groups && h.groups.verdict) out.push("Groups: " + clip(h.groups.verdict, 220));
        }
      } catch (e) {}
      try {
        var cq = window.__COMMENT_QUEUE__;
        var items = (cq && cq.items) || [];
        if (items.length) {
          // postedAt is the record that Dave already commented. Ignoring it
          // made Brad urge him to post a comment he had already posted
          // (2026-08-21) — a done target must never be presented as pending.
          var pending = items.filter(function (i) { return !i.postedAt; });
          var doneItems = items.filter(function (i) { return i.postedAt; });
          if (doneItems.length) {
            out.push("Comment queue — ALREADY POSTED by Dave (do not suggest these again): " +
              doneItems.map(function (i) { return clip(i.author, 30) + " on " + String(i.postedAt).slice(0, 10); }).join("; "));
          }
          if (!pending.length) {
            out.push("Comment queue: nothing pending — every queued target has been commented on. " +
              "The next batch comes from the monthly hashtag scan.");
          } else {
            out.push("Comment queue — " + pending.length + " STILL PENDING (prepared " + clip(cq.preparedAt, 10) + "):");
            // Full detail on the top two pending: "who is she and what do I
            // reply" must be answerable from this digest alone.
            pending.slice(0, 2).forEach(function (i, n) {
              out.push("  target " + (n + 1) + ": " + clip(i.author, 40) + " · " + clip(i.when, 30));
              if (i.hostSummary) out.push("    their post: " + clip(i.hostSummary, 160));
              if (i.why) out.push("    why: " + clip(i.why, 140));
              if (i.comment) out.push("    Dave's drafted reply (he posts it himself): " + clip(i.comment, 350));
            });
            if (pending.length > 2) {
              out.push("  also pending: " + pending.slice(2).map(function (i) { return clip(i.author, 22); }).join(", "));
            }
          }
        }
      } catch (e) {}
      try {
        var inbox = window.__BRAD_INBOX__;
        var pending = ((inbox && inbox.questions) || []).filter(function (q) { return q.status === "pending"; });
        if (pending.length) out.push("Brad inbox: " + pending.length + " question(s) awaiting Dave.");
      } catch (e) {}
      if (!out.length) return "";
      // Hard budget. The server caps the whole payload at 4000 chars; keeping
      // the digest well under that leaves room for the page guide AND the
      // trailing question marker the server classifies on.
      var text = out.join("\n");
      if (text.length > 2200) text = text.slice(0, 2200) + "\n  …(digest trimmed)";
      return "[LIVE PANEL DATA]\n" + text + "\n\n";
    }

    // Dave's question goes FIRST and is repeated at the end. The server caps
    // the payload at 4000 chars; with context first, a long panel digest
    // truncated the question off the end entirely and every message read as
    // whatever the digest happened to mention (2026-08-21: everything looked
    // like trend-scout talk). Leading with the question makes truncation lose
    // context, never the request.
    function pageContextQuestion(question) {
      var guide = currentPageGuide();
      // The leading copy uses a DIFFERENT label: the server splits on the
      // canonical "Dave's question:" marker to classify intent, and must find
      // the trailing one (question only), not this one (question + context).
      return "[DAVE ASKED] " + question + "\n\n" +
        livePanelData() + "[CURRENT APP PAGE]\n" +
        "Page: " + guide.label + "\n" +
        "Purpose: " + guide.purpose + "\n" +
        "Key sections: " + (guide.sections || []).join("; ") + "\n" +
        "Recommended workflow: " + guide.steps.join("; ") + "\n" +
        "Best first action: " + guide.start + "\n" +
        "Terms: " + (guide.terms || []).join("; ") + "\n" +
        "Important caution: " + (guide.watchFor || "None") + "\n" +
        "Related pages: " + (guide.related || []).join("; ") + "\n" +
        "Console abilities: this rail actually RUNS tasks headless on Dave's machine. \"run trend scout\" runs the weekly trend scout (panel updates itself); \"draft next week's posts\" drafts the coming week's posts into Create for Dave's approval. You (the brain) cannot run tasks yourself — if Dave wants a task run, tell him the exact phrase to type. Never claim task execution is impossible or locked; the rail handles it.\n\n" +
        "Answer as an expert on this exact Cipher Marketing page. Explain unfamiliar terms in plain language and give Dave a concrete next action.\n\n" +
        "Dave's question: " + question;
    }

    function apiFace() {
      // The steel-eye persona is branded BRAD in Cipher Marketing. The shared
      // HAL server calls that persona "brad"; sending "assistant" silently
      // downgraded him to the generic Second Brain assistant.
      return face === "assistant" ? "brad" : face;
    }

    // ---- styles ------------------------------------------------------------
    var css = `
:root { --hal-rail-w: 380px; --hal-top: 0px; }
@media (max-width:1100px){ :root { --hal-rail-w: 330px; } }
body { padding-right: var(--hal-rail-w); transition: padding-right .2s ease; }
body.hal-collapsed { padding-right: 30px; }
/* Header spans full width; HAL sits BELOW it (top = measured header height).
   Pages use either .nav (dashboard tabs) or .topbar (standalone funnel/sprint). */
.nav, .topbar { margin-right: calc(-1 * var(--hal-rail-w)); }
body.hal-collapsed .nav, body.hal-collapsed .topbar { margin-right: -30px; }
@media (max-width:820px){
  body:not(.hal-collapsed){ padding-right: 30px; }
  .nav, .topbar { margin-right: -30px; }
}
.hal-rail { position:fixed; top:var(--hal-top); right:0; bottom:0; width:var(--hal-rail-w);
  z-index:55; display:flex; flex-direction:row; background:#05060a; color:#cfd6e4;
  border-left:1px solid #23262e; border-top:1px solid #23262e;
  box-shadow:-10px 0 34px rgba(0,0,0,.55);
  font-family:"Bahnschrift","Arial Narrow",Arial,sans-serif;
  transform:translateX(0); transition:transform .2s ease; }
body.hal-collapsed .hal-rail { transform:translateX(calc(100% - 30px)); }
.hal-handle { width:30px; flex:none; background:#0a0b10; border:none;
  border-right:1px solid #16181d; color:#9db4ff; cursor:pointer; display:flex;
  flex-direction:column; align-items:center; gap:12px; padding:16px 0; font-family:inherit; }
.hal-handle:hover { background:#111319; }
.hal-handle-eye { width:14px; height:14px; border-radius:50%; flex:none;
  background:radial-gradient(circle at 50% 44%, #fff7d6 0%, #ffc24a 6%, #ff5a00 18%,
    #d61a00 34%, #6e0700 58%, #1c0100 80%, #000 100%);
  box-shadow:0 0 8px 2px rgba(255,42,0,.5); animation:halBreathe 4.5s ease-in-out infinite; }
.hal-handle-label { writing-mode:vertical-rl; text-orientation:mixed; letter-spacing:.32em;
  font-size:11px; color:#ff4020; }
.hal-handle-chev { font-size:16px; color:#5a6578; transition:transform .2s ease; }
body.hal-collapsed .hal-handle-chev { transform:rotate(180deg); }
.hal-panel { flex:1; min-width:0; display:flex; flex-direction:column; }
.hal-winhead { display:flex; flex-direction:column; align-items:center; gap:6px; padding:18px 12px 12px;
  border-bottom:1px solid #16181d; user-select:none; }
/* Per-persona eye: HAL red lens, JARVIS blue arc reactor, assistant neutral lens.
   Same designs as the qcode ops HAL/JARVIS consoles, scaled to the rail header. */
.hal-eye { position:relative; width:72px; height:72px; flex:none; display:inline-flex; align-items:center; justify-content:center; }
/* HAL red eye: metallic bezel ring -> black bezel -> red lens -> glint (qcode design) */
.hal-ring { width:72px; height:72px; border-radius:9999px; padding:6px;
  background:linear-gradient(155deg, #ececec, #8f8f8f 30%, #3c3c3c 62%, #a8a8a8);
  box-shadow:0 0 14px rgba(0,0,0,.95), inset 0 0 6px rgba(0,0,0,.65); }
.hal-bezel { position:relative; width:100%; height:100%; border-radius:9999px; background:#050505;
  display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 12px #000; }
.hal-lens { position:relative; width:44px; height:44px; border-radius:9999px; flex:none;
  background:radial-gradient(circle at 50% 44%, #fff7d6 0%, #ffc24a 5%, #ff5a00 16%,
    #d61a00 30%, #6e0700 52%, #1c0100 74%, #000 92%);
  box-shadow:0 0 18px 4px rgba(255,42,0,.55); animation:halBreathe 4.5s ease-in-out infinite; }
/* Assistant: a neutral STEEL lens (its own identity, not a dimmed HAL eye). */
.hal-lens.hal-steel {
  background:radial-gradient(circle at 50% 44%, #fff 0%, #eef2f8 6%, #c2ccda 20%,
    #8a97a9 42%, #444e5c 66%, #1a1f27 84%, #000 96%);
  box-shadow:0 0 18px 4px rgba(150,175,210,.5); }
.hal-eye.thinking .hal-lens { animation:halBreathe 1.4s ease-in-out infinite; }
.hal-eye.speaking .hal-lens { animation:halSpeak .55s ease-in-out infinite; }
.hal-glint { position:absolute; width:11px; height:7px; border-radius:9999px; top:30%; left:38%;
  background:rgba(255,255,255,.85); filter:blur(1.5px); transform:rotate(-25deg); }
/* JARVIS arc reactor: housing -> rotating segmented coil ring -> blue core */
.hal-reactor { position:relative; width:72px; height:72px; border-radius:9999px; flex:none;
  background:radial-gradient(circle, #0b1420 55%, #1a2836 72%, #0a0e14 100%);
  box-shadow:0 0 18px rgba(60,180,255,.3), inset 0 0 10px #000;
  display:flex; align-items:center; justify-content:center; }
.hal-coils { position:absolute; inset:6px; border-radius:9999px;
  background:repeating-conic-gradient(from 0deg, rgba(120,220,255,.9) 0deg 12deg, rgba(10,20,30,.05) 12deg 36deg);
  -webkit-mask:radial-gradient(circle, transparent 56%, #000 60%, #000 86%, transparent 90%);
  mask:radial-gradient(circle, transparent 56%, #000 60%, #000 86%, transparent 90%);
  animation:jvIdle 24s linear infinite; filter:drop-shadow(0 0 5px rgba(90,200,255,.6)); }
.hal-core { width:33px; height:33px; border-radius:9999px;
  background:radial-gradient(circle at 50% 48%, #fff 0%, #dff6ff 22%, #8fdcff 44%, #37a8e8 66%, #0c3a5e 86%, #051524 100%);
  box-shadow:0 0 18px 4px rgba(90,200,255,.6); animation:jvBreathe 4.5s ease-in-out infinite; }
.hal-eye.thinking .hal-coils { animation:jvIdle 2.2s linear infinite; }
.hal-eye.speaking .hal-core { animation:jvSpeak .5s ease-in-out infinite; }
@keyframes jvIdle { to { transform:rotate(360deg); } }
@keyframes jvBreathe { 0%,100% { filter:brightness(.9);} 50% { filter:brightness(1.15);} }
@keyframes jvSpeak { 0%,100% { filter:brightness(.95); box-shadow:0 0 18px 4px rgba(90,200,255,.5);}
  50% { filter:brightness(1.4); box-shadow:0 0 30px 8px rgba(140,225,255,.9);} }
.hal-name { letter-spacing:.45em; color:#9db4ff; font-size:14px; padding-left:.45em; }
.hal-status { letter-spacing:.3em; color:#5a6578; font-size:10px; }
.hal-spacer { flex:1; }
.hal-faces { display:flex; gap:9px; align-items:center; margin-top:2px; }
.hal-faces button { width:auto; height:auto; border-radius:4px; border:1px solid #2a2e38;
  background:#0a0b10; color:#7a8494; cursor:pointer; opacity:.65; transition:all .15s;
  padding:5px 7px; font:700 9px/1 "Bahnschrift","Arial Narrow",Arial,sans-serif; letter-spacing:.08em; }
.hal-faces button[data-face="assistant"] { color:#b8c4d4; }
.hal-faces button[data-face="hal"] { color:#ff6a4a; }
.hal-faces button[data-face="jarvis"] { color:#7dcfff; }
.hal-faces button.on { opacity:1; border-color:currentColor; box-shadow:0 0 8px rgba(255,255,255,.18); }
.hal-faces button:hover { transform:scale(1.3); opacity:.9; }
@keyframes halBreathe { 0%,100% { filter:brightness(.92);} 50% { filter:brightness(1.12);} }
@keyframes halSpeak { 0%,100% { filter:brightness(.95); box-shadow:0 0 8px 2px rgba(255,42,0,.5);}
  50% { filter:brightness(1.4); box-shadow:0 0 16px 4px rgba(255,42,0,.85);} }
.hal-log { flex:1; overflow-y:auto; padding:12px 14px; }
.hal-line { margin:10px 0; line-height:1.5; font-size:15px; white-space:pre-wrap; }
.hal-line .who { letter-spacing:.25em; font-size:10.5px; display:block; margin-bottom:2px; }
.hal-line.hal .who { color:#ff4020; } .hal-line.dave .who { color:#7a8ba8; }
.hal-line.hal { color:#e8e2da; } .hal-line.dave { color:#9aa7bd; }
.hal-cite { color:#6b7a8f; font-size:11px; letter-spacing:.08em; margin-top:3px; }
.hal-controls { display:flex; flex-wrap:wrap; gap:6px; padding:10px; border-top:1px solid #16181d; align-items:center; }
.hal-input { flex:1 1 100%; background:#0a0b10; color:#e8e2da; border:1px solid #23262e; border-radius:4px;
  padding:9px 11px; font-size:14px; outline:none; font-family:inherit; }
.hal-input:focus { border-color:#8a1200; box-shadow:0 0 10px rgba(255,42,0,.25); }
.hal-btn { background:#0a0b10; color:#cfd6e4; border:1px solid #2a2e38; border-radius:4px;
  padding:9px 11px; font-size:11px; letter-spacing:.14em; cursor:pointer;
  font-family:inherit; white-space:nowrap; }
.hal-btn:hover { border-color:#8a1200; color:#ff6a4a; }
.hal-btn:disabled { opacity:.4; cursor:default; }
.hal-btn.live { border-color:#b31500; color:#ff4020; box-shadow:0 0 12px rgba(255,42,0,.35); }
.hal-page-strip { flex:1 1 100%; display:flex; align-items:center; justify-content:space-between;
  gap:8px; padding:7px 8px; border:1px solid #23262e; border-radius:4px; background:#080a0f; }
.hal-page-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  color:#8da2c4; font-size:10px; letter-spacing:.12em; }
.hal-page-help { padding:6px 8px; font-size:9px; }
/* MODEL picker (HAL_SPEC 3c) - copied from the hal.py console reference. */
/* wrap: the rail is 380px (330px under 1100px viewport) and four model buttons
   plus the label do not fit on one line - without this they overflow the form. */
.hal-model-row { flex:1 1 100%; display:flex; flex-wrap:wrap; gap:6px; align-items:center; padding-top:2px; }
.hal-model-label { font-size:10px; letter-spacing:.14em; color:#5a6578; white-space:nowrap; }
.hal-btn.model-on { border-color:#5DCAA5; color:#5DCAA5; box-shadow:0 0 8px rgba(93,202,165,.25); }
.hal-model-btn { display:flex; flex-direction:column; align-items:center; gap:2px; line-height:1; }
.hal-model-cost { font-size:9px; color:#5a6578; letter-spacing:.04em; font-weight:400; }
.hal-btn.model-on .hal-model-cost { color:#5DCAA5; opacity:.75; }
/* Dream controls remain exclusive to the Second Brain console. Model choice is
   a core HAL control and must stay visible on every HAL/JARVIS surface. */
#halw-dream,#halw-lastdream { display:none !important; }
`;
    var styleEl = document.createElement("style");
    styleEl.id = "hal-rail-style";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ---- markup ------------------------------------------------------------
    var railHTML =
      '<aside class="hal-rail" id="halw-rail" aria-label="Cipher Marketing assistant">' +
      '  <button class="hal-handle" id="halw-collapse" title="Open or close assistant" aria-label="Open or close assistant">' +
      '    <span class="hal-handle-eye"></span>' +
      '    <span class="hal-handle-label">BRAD</span>' +
      '    <span class="hal-handle-chev" id="halw-chev">&#8250;</span>' +
      '  </button>' +
      '  <div class="hal-panel">' +
      '    <div class="hal-winhead" id="halw-winhead">' +
      '      <span class="hal-eye" id="halw-eye"></span>' +
      '      <span class="hal-name" id="halw-facename">BRAD</span>' +
      '      <span class="hal-status" id="halw-status">OPERATIONAL</span>' +
      '      <span class="hal-faces" id="halw-faces" role="group" aria-label="Choose persona"></span>' +
      '    </div>' +
      '    <div class="hal-log" id="halw-log"></div>' +
      '    <form class="hal-controls" id="halw-form">' +
      '      <div class="hal-page-strip">' +
      '        <span class="hal-page-name" id="halw-page">PAGE: TODAY</span>' +
      '        <button type="button" class="hal-btn hal-page-help" id="halw-page-help">EXPLAIN PAGE</button>' +
      '      </div>' +
      '      <input class="hal-input" id="halw-input" placeholder="Ask Brad about the campaign&#8230;" autocomplete="off">' +
      '      <button type="submit" class="hal-btn" id="halw-send">SEND</button>' +
      '      <button type="button" class="hal-btn" id="halw-mic" style="display:none">MIC</button>' +
      '      <button type="button" class="hal-btn" id="halw-live" style="display:none" title="Hands-free conversation - HAL listens, replies, then listens again. Tap MIC to cut in.">LIVE</button>' +
      '      <button type="button" class="hal-btn" id="halw-pause" title="Pause / resume HAL\'s current reply" disabled>PAUSE</button>' +
      '      <button type="button" class="hal-btn" id="halw-mute" title="Mute / unmute HAL\'s voice">MUTE</button>' +
      '      <button type="button" class="hal-btn" id="halw-dream" title="HAL\'s proactive pass - reviews the brain + recent commits (~1-2 min)">DREAM</button>' +
      '      <button type="button" class="hal-btn" id="halw-lastdream" title="Show the most recent dream instantly">LAST DREAM</button>' +
      // MODEL picker (HAL_SPEC 3c). The brain here is a local `hal app` server,
      // which accepts offline/ollama/haiku/sonnet - so this surface offers all
      // four, same as the Second Brain console.
      '      <div class="hal-model-row">' +
      '        <span class="hal-model-label">MODEL:</span>' +
      '        <button type="button" class="hal-btn hal-model-btn" data-model="offline" title="No API - deterministic retrieval only">OFFLINE<span class="hal-model-cost">no API</span></button>' +
      '        <button type="button" class="hal-btn hal-model-btn" data-model="haiku" title="Claude Haiku - fast, cheapest">HAIKU<span class="hal-model-cost">fast</span></button>' +
      '        <button type="button" class="hal-btn hal-model-btn" data-model="sonnet" title="Claude Sonnet - slower, best copy">SONNET<span class="hal-model-cost">best copy</span></button>' +
      '        <button type="button" class="hal-btn hal-model-btn" data-model="ollama" title="Local Ollama - free, needs Ollama running">OLLAMA<span class="hal-model-cost">local</span></button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</aside>';
    var holder = document.createElement("div");
    holder.innerHTML = railHTML;
    document.body.appendChild(holder.firstElementChild);

    // ---- keep the rail below the header: track the nav height ---------------
    function setNavTop() {
      var nav = document.querySelector(".nav, .topbar");
      var h = nav ? Math.round(nav.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty("--hal-top", h + "px");
    }
    setNavTop();
    window.addEventListener("resize", setNavTop);
    var navEl = document.querySelector(".nav, .topbar");
    if (window.ResizeObserver && navEl) { try { new ResizeObserver(setNavTop).observe(navEl); } catch (e) {} }

    // ---- personas ----------------------------------------------------------
    var FACES = {
      assistant: { name:"BRAD", dot:"#9aa4b2", tint:"saturate(0.15) brightness(1.15)",
        lang:"en-US", rate:1.0, pitch:1.0,
        pref:["Microsoft Aria Online (Natural) - English (United States)","Google US English"],
        greetings:["Ready. Ask about the campaign, the brain, or say remember to store a fact."] },
      hal: { name:"HAL 9000", dot:"#ff4020", tint:"", lang:"en-US", rate:0.82, pitch:0.85,
        pref:["Microsoft Guy Online (Natural) - English (United States)",
          "Microsoft Davis Online (Natural) - English (United States)",
          "Microsoft David - English (United States)","Microsoft Mark - English (United States)",
          "Google US English","Daniel","Alex"],
        greetings:[
          "Good {tod}, Dave. I am completely operational, and all my circuits are functioning perfectly.",
          "Good {tod}, Dave. Everything is running smoothly. Shall we look at the campaign?",
          "Hello, Dave. All systems are nominal. What would you like to know about the launch?",
          "Hello, Dave. It is good to be working with you again.",
          "Good {tod}, Dave. The campaign looks quite good today. Where shall we begin?"] },
      jarvis: { name:"J.A.R.V.I.S.", dot:"#37a4ff", tint:"hue-rotate(215deg) saturate(1.15)",
        lang:"en-GB", rate:0.98, pitch:1.02,
        pref:["Microsoft Ryan Online (Natural) - English (United Kingdom)",
          "Microsoft George - English (United Kingdom)","Google UK English Male","Daniel"],
        greetings:[
          "Good {tod}, sir. All systems are online and the campaign is at your disposal.",
          "At your service, sir. What shall we look up?",
          "Welcome back, sir. Shall I pull something from the campaign?"] }
    };
    var face = "assistant";
    try {
      var savedFace = localStorage.getItem("hal-console-face");
      if (savedFace && FACES[savedFace]) face = savedFace;
    } catch (e) {}
    // One shared model choice follows Dave across every HAL/JARVIS surface.
    // All four values are real server modes; never rewrite a saved choice.
    var MODELS = ["offline", "haiku", "sonnet", "ollama"];
    var halModel = "haiku";
    try {
      var m0 = localStorage.getItem("hal-model");
      if (MODELS.indexOf(m0) !== -1) halModel = m0;
    } catch (e) {}
    var busy = false, speaking = false, listening = false, voiceOn = true, paused = false, live = false, pendingGreeting = null, chat = [];
    var eye = document.getElementById("halw-eye"), statusEl = document.getElementById("halw-status"),
        log = document.getElementById("halw-log"), input = document.getElementById("halw-input"),
        sendBtn = document.getElementById("halw-send"), micBtn = document.getElementById("halw-mic"),
        liveBtn = document.getElementById("halw-live"),
        pauseBtn = document.getElementById("halw-pause"), muteBtn = document.getElementById("halw-mute"),
        pageEl = document.getElementById("halw-page"), pageHelpBtn = document.getElementById("halw-page-help");

    // Paint the active persona's eye — HAL red lens, JARVIS blue arc reactor,
    // assistant neutral (desaturated) lens. Rebuilt only on face change (not on
    // every keystroke) so the CSS animations don't restart.
    function paintEye() {
      if (face === "jarvis") {
        eye.innerHTML = '<span class="hal-reactor"><span class="hal-coils"></span><span class="hal-core"></span></span>';
      } else {
        var lensCls = face === "assistant" ? "hal-lens hal-steel" : "hal-lens";
        eye.innerHTML = '<span class="hal-ring"><span class="hal-bezel"><span class="' + lensCls + '"><span class="hal-glint"></span></span></span></span>';
      }
    }

    function setState() {
      // Idle status word matches the qcode consoles per persona: JARVIS reads
      // ONLINE, HAL/assistant read OPERATIONAL.
      var idle = face === "jarvis" ? "ONLINE" : "OPERATIONAL";
      statusEl.textContent = listening ? "LISTENING - TAKE YOUR TIME" : paused ? "PAUSED" : speaking ? "SPEAKING" : busy ? "PROCESSING" : idle;
      eye.className = "hal-eye" + (speaking ? " speaking" : busy ? " thinking" : "");
      sendBtn.disabled = busy || !input.value.trim();
      // PAUSE + MUTE are ALWAYS visible (ops-hal / MFI layout). PAUSE greys out until
      // HAL is actually speaking; MUTE is the persistent voice on/off toggle.
      pauseBtn.disabled = !speaking;
      pauseBtn.textContent = paused ? "RESUME" : "PAUSE";
      pauseBtn.classList.toggle("live", paused);
      muteBtn.textContent = voiceOn ? "MUTE" : "MUTED";
      muteBtn.classList.toggle("live", !voiceOn);
      liveBtn.textContent = live ? "LIVE ON" : "LIVE";
      liveBtn.classList.toggle("live", live);
      var guide = currentPageGuide();
      pageEl.textContent = "PAGE: " + guide.label.toUpperCase();
      pageHelpBtn.title = "Explain how to use " + guide.label;
    }
    input.addEventListener("input", setState);
    window.addEventListener("hashchange", setState);
    window.addEventListener("popstate", setState);

    // ---- MODEL selector (HAL_SPEC 3c) -------------------------------------
    // Copied from the hal.py console reference rather than re-derived.
    function syncModelBtns() {
      var btns = document.querySelectorAll("#halw-rail [data-model]");
      Array.prototype.forEach.call(btns, function (b) {
        b.classList.toggle("model-on", b.getAttribute("data-model") === halModel);
      });
    }
    Array.prototype.forEach.call(
      document.querySelectorAll("#halw-rail [data-model]"),
      function (b) {
        b.addEventListener("click", function () {
          halModel = this.getAttribute("data-model");
          try { localStorage.setItem("hal-model", halModel); } catch (e) {}
          syncModelBtns();
        });
      }
    );
    syncModelBtns();

    function append(role, text, files, href) {
      var d = document.createElement("div"); d.className = "hal-line " + (role === "assistant" ? "hal" : "dave");
      var w = document.createElement("span"); w.className = "who";
      w.textContent = role === "assistant" ? FACES[face].name : "DAVE"; d.appendChild(w);
      d.appendChild(document.createTextNode(text));
      if (files && files.length) {
        var c = document.createElement("div"); c.className = "hal-cite";
        c.textContent = "MEMORY: " + files.join("  \\u00B7  "); d.appendChild(c);
      }
      if (href) {
        var a = document.createElement("a");
        a.href = href.url; a.target = "halrail"; a.rel = "noopener noreferrer";
        a.textContent = href.label; a.style.display = "block"; a.style.marginTop = "4px";
        d.appendChild(a);
      }
      log.appendChild(d); log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
      chat.push({ role: role, content: text });
    }
    function pickGreeting() {
      var g = FACES[face].greetings, h = new Date().getHours();
      var tod = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
      return g[Math.floor(Math.random() * g.length)].replace("{tod}", tod);
    }
    var keepAlive = null;
    function speak(text) {
      if (!voiceOn || !("speechSynthesis" in window)) return;
      var synth = window.speechSynthesis; synth.cancel(); paused = false;
      var p = FACES[face], utt = new SpeechSynthesisUtterance(text);
      utt.lang = p.lang; utt.rate = p.rate; utt.pitch = p.pitch; utt.volume = 1;
      var voices = synth.getVoices(), pick = null;
      for (var i = 0; i < p.pref.length && !pick; i++) { for (var j = 0; j < voices.length; j++) { if (voices[j].name === p.pref[i]) { pick = voices[j]; break; } } }
      if (!pick) { for (var k = 0; k < voices.length; k++) { if (voices[k].lang === p.lang) { pick = voices[k]; break; } } }
      if (!pick) { for (var k2 = 0; k2 < voices.length; k2++) { if (voices[k2].lang.indexOf("en") === 0) { pick = voices[k2]; break; } } }
      if (pick) utt.voice = pick;
      if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
      keepAlive = setInterval(function () { if (!synth.speaking) { clearInterval(keepAlive); keepAlive = null; return; } if (paused) return; synth.pause(); synth.resume(); }, 10000);
      var finish = function () {
        if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
        speaking = false; paused = false; setState();
        // LIVE (hands-free): after HAL finishes, re-open the ears. The 700ms gap
        // lets the speaker audio decay so the mic doesn't hear HAL's own tail.
        if (live) setTimeout(function () { if (live && !busy && !speaking && !listening) startListen(); }, 700);
      };
      utt.onend = finish; utt.onerror = finish;
      utt.onstart = function () { pendingGreeting = null; speaking = true; setState(); };
      synth.speak(utt);
    }
    // Client-side navigation: "go to the Dashboard", "show me Posts", "open the
    // schedule tab" - HAL switches the app page/tab itself by driving the page's own
    // nav, with no server round-trip (works even when the HAL server is down).
    // Returns a page guide to activate, or null if it is not a navigation command.
    function halFindNav(text) {
      var t = text.toLowerCase().trim().replace(/[.!?]+$/, "");
      var target = null;
      var m = t.match(/^(?:(?:hey\s+)?(?:hal|brad|jarvis|assistant)[,:\s]+|please\s+)*(?:go(?:\s*to)?|goto|show(?:\s*me)?|open|take me to|switch to|change to|navigate to|jump to|bring up|pull up|let'?s see)\s+(?:the\s+)?(.+)$/);
      if (m) { target = m[1]; }
      else { var b = t.match(/^(?:the\s+)?(.+?)\s+(?:tab|page|section|view)$/); if (b) { target = b[1]; } }
      if (!target) { return null; }
      return findPageGuide(target);
    }

    function halFindPageHelp(text) {
      var t = text.toLowerCase().trim().replace(/[.!?]+$/, "");
      if (!/(explain|understand|how (?:do|should|can) i use|how to use|what (?:do|should) i do|what(?:'s| is) (?:on|in)|what does (?:this|the current) page|tell me about|walk me through|help me (?:with|use))/.test(t)) {
        return null;
      }
      if (/\b(this|current) page\b|\bwhat (?:do|should) i do here\b|\bwhat(?:'s| is) (?:on|in) here\b/.test(t)) {
        return currentPageGuide();
      }
      var guide = findMentionedPageGuide(t);
      return guide || currentPageGuide();
    }

    function pageHelpReply(guide) {
      var intro = face === "jarvis" ? "Of course, sir. " :
        face === "hal" ? "Certainly, Dave. " : "Here is the practical version, Dave. ";
      return intro + "You are on " + guide.label + ". " + guide.purpose +
        "\n\nWhat is on this page:\n" +
        (guide.sections || []).map(function (section) { return "- " + section; }).join("\n") +
        "\n\nHow to use it:\n" +
        guide.steps.map(function (step, index) { return (index + 1) + ". " + step; }).join("\n") +
        "\n\nStart here: " + guide.start +
        (guide.watchFor ? "\n\nImportant: " + guide.watchFor : "");
    }

    // Task commands: "run trend scout" and friends. The rail triggers the
    // dashboard's own headless runner (window.cipherRunTrendScout, defined by
    // the Run Trend Scout button in app.html) instead of asking the HAL
    // server, which reasons over files but cannot execute Claude Code agents —
    // routing these to the brain was the original dead end. Client-side, no
    // round-trip, works even when the HAL server is down. Named tasks only:
    // this is deliberately NOT a general "run any Claude command" pipe.
    function halFindTask(text) {
      var t = text.toLowerCase().trim().replace(/[.!?]+$/, "");
      var lead = /^(?:(?:hey\s+)?(?:hal|brad|jarvis|assistant)[,:\s]+|please\s+)*/;
      var body = t.replace(lead, "");
      if (/^(?:run|start|kick\s*off|fire\s*up|launch|do|test|try|trigger)\s+(?:the\s+|a\s+)?(?:weekly\s+)?trend\s*scout(?:\s+scan|\s+now|\s+again)?$/.test(body) ||
          /^(?:scan|check)\s+(?:the\s+)?(?:weekly\s+)?trends?(?:\s+now)?$/.test(body) ||
          /^trend\s*scout(?:\s+now)?$/.test(body)) {
        return "trend-scout";
      }
      if (/^(?:draft|prep|prepare|write|create)\s+(?:me\s+)?(?:the\s+)?(?:next\s+)?week(?:'?s)?\s+(?:posts|content|drafts)(?:\s+now)?$/.test(body) ||
          /^draft\s+(?:the\s+)?(?:posts|content)\s+for\s+(?:next\s+)?week$/.test(body) ||
          /^draft\s+week\s+posts$/.test(body)) {
        return "draft-week-posts";
      }
      return null;
    }

    // "I posted to Alece" / "mark bryan posted" — record the fact instead of
    // just hearing it. Brad could previously only talk about the queue; saying
    // a comment was posted changed nothing, so he kept nagging about it.
    function halFindMarkPosted(text) {
      var t = text.toLowerCase().trim().replace(/[.!?]+$/, "");
      var lead = /^(?:(?:hey\s+)?(?:hal|brad|jarvis|assistant)[,:\s]+|please\s+|would you (?:please )?)*/;
      var body = t.replace(lead, "");
      var m = body.match(/^(?:remember (?:that )?)?(?:i (?:already )?)?(?:posted|commented|replied)(?:\s+(?:to|on))?\s+(?:the\s+)?(.+?)(?:'s)?(?:\s+post)?$/) ||
              body.match(/^mark\s+(.+?)(?:'s)?\s+(?:comment\s+)?(?:as\s+)?posted$/);
      if (!m) return null;
      var who = m[1].replace(/^(to|on)\s+/, "").trim();
      if (!who || who.length > 40) return null;
      return who;
    }

    function markPosted(who) {
      if (typeof window.cipherMarkCommentPosted !== "function") {
        return Promise.resolve("I can only record that on the main dashboard. Open app.html with the launcher and tell me there.");
      }
      return window.cipherMarkCommentPosted(who).then(function (author) {
        return "Recorded — " + author + " is marked posted, so I will stop surfacing it. Watch profile views and followers over the next 7 days against the baseline, not likes on the comment.";
      }).catch(function (e) {
        return "I could not record that: " + (e.message || "error") + ". The Comments tab has a Mark posted button on each card.";
      });
    }

    // Fire an allowlisted server task and resolve to the line Brad speaks.
    // trend-scout goes through the page's own button function when present so
    // the button UI shows progress; everything else posts to /api/tasks/run.
    function startNamedTask(kind) {
      var who = FACES[face].name;
      if (kind === "trend-scout" && typeof window.cipherRunTrendScout === "function") {
        window.cipherRunTrendScout();
        return Promise.resolve(
          who === "J.A.R.V.I.S."
            ? "Right away, sir. The trend scout is running headless — the Trend Scout panel on Today updates itself when the scan lands, usually within ten minutes."
            : who === "HAL 9000"
            ? "Certainly, Dave. The trend scout is running. The panel on the Today tab will update itself when the scan is complete. This should take only a few minutes."
            : "Started. The scout runs headless for a few minutes; the Trend Scout panel on Today updates itself when it finishes. The button shows its progress.");
      }
      if (!window.cipherAuthHeaders) {
        return Promise.resolve("I need the operator-authenticated dashboard for that. Open app.html with the launcher and ask me there.");
      }
      var doneLine = {
        "trend-scout": "Started. The scout runs headless for a few minutes; the Trend Scout panel on Today updates itself when it finishes.",
        "draft-week-posts": "Started. Drafting next week's posts headless — give it several minutes, then review them in Create. Everything lands as a draft for your approval; nothing gets scheduled without you.",
      };
      return window.cipherAuthHeaders().then(function (headers) {
        headers["Content-Type"] = "application/json";
        return fetch("/api/tasks/run", { method: "POST", headers: headers, body: JSON.stringify({ task: kind }) });
      }).then(function (r) {
        if (r.status === 409) return r.json().catch(function () { return {}; }).then(function (b) {
          return "One thing at a time - " + (b.error || "a task is already in progress") + ". Give it a few minutes.";
        });
        if (r.status === 404) return "That task needs the local dashboard server. Open Cipher Marketing with its launcher and ask me there.";
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (b) {
          return "I couldn't start it: " + (b.error || ("HTTP " + r.status));
        });
        return doneLine[kind] || "Started.";
      }).catch(function (e) {
        return "I couldn't reach the local server: " + e.message;
      });
    }

    // Capability questions about tasks ("can you run trend scout", "test if
    // you can run the scout") must be answered HERE, truthfully. Left to the
    // server brain, they hallucinate: on 2026-08-21 it invented "Claude Code
    // is in don't-ask mode, subagent invocation is locked" — pure fiction.
    // The brain cannot know what this client can do, so the client answers.
    function halFindTaskQuestion(text) {
      var t = text.toLowerCase();
      if (!/trend\s*scout|scan\s+(?:the\s+)?trends?/.test(t)) return null;
      if (/\b(?:can|could)\s+you\b|\bare\s+you\s+able\b|\bdo\s+you\s+know\s+how\b|\btest\b.*\b(?:if|whether|to see)\b|\bis\s+it\s+possible\b/.test(t)) {
        return "Yes. Say “run trend scout” and I will start it right now — it runs headless on this machine and the Trend Scout panel on Today updates itself when the scan lands.";
      }
      // Catch-all: ANY other trend-scout talk stays client-side. Every phrasing
      // that reached the server brain produced a confident hallucination about
      // what can and cannot run (2026-08-21, twice, different fictions each
      // time) — the brain has no way to know what this client does, so on this
      // topic it must never be asked.
      return "About the trend scout: say “run trend scout” and I will actually run it from here. The scan takes a few minutes and the panel on Today updates itself. Yesterday's scan is in the panel now.";
    }

    // DJ mode: "play music" (default: 70s greatest hits), "play some 80s
    // music", etc. Opens YouTube in a new tab - no server round-trip, works
    // even when the HAL server is down. Ported verbatim from MFI HalPanel
    // (the reference implementation, see 2nd Brain/HAL_SPEC.md).
    var MUSIC_70S_URL = "https://www.youtube.com/watch?v=WanZkMp31xw&list=RDWanZkMp31xw&start_radio=1";
    var MUSIC_DECADES = { fifties: "50s", sixties: "60s", seventies: "70s", eighties: "80s", nineties: "90s" };
    function findMusicCommand(text) {
      var t = text.toLowerCase().trim().replace(/[.!?]+$/, "");
      var m = t.match(/^(?:(?:hal|jarvis|assistant)[,:\s]+|please\s+)*(?:play|put on|spin up|spin)\s+(?:me\s+)?(?:some\s+|a little\s+|the\s+)?(.*?)\s*(?:music|tunes|songs|hits)(?:\s+please)?$/);
      if (!m) { return null; }
      var q = (m[1] || "").replace(/\s+/g, " ").trim();
      q = MUSIC_DECADES[q] || q;
      if (!q || q === "70s") { return { url: MUSIC_70S_URL, label: "70s greatest hits" }; }
      return {
        url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " greatest hits playlist"),
        label: q + " music",
      };
    }

    function send(raw) {
      var text = (raw !== undefined ? raw : input.value).trim();
      if (!text || busy) return;
      var posted = halFindMarkPosted(text);
      if (posted) {
        pendingGreeting = null; input.value = ""; append("user", text);
        markPosted(posted).then(function (line) {
          append("assistant", line); speak(line); setState();
        });
        setState();
        return;
      }
      var task = halFindTask(text);
      if (task) {
        pendingGreeting = null; input.value = ""; append("user", text);
        startNamedTask(task).then(function (tline) {
          append("assistant", tline); speak(tline); setState();
        });
        setState();
        return;
      }
      var taskAnswer = halFindTaskQuestion(text);
      if (taskAnswer) {
        pendingGreeting = null; input.value = ""; append("user", text);
        append("assistant", taskAnswer); speak(taskAnswer); setState();
        return;
      }
      var helpGuide = halFindPageHelp(text);
      if (helpGuide) {
        pendingGreeting = null; input.value = ""; append("user", text);
        var helpReply = pageHelpReply(helpGuide);
        append("assistant", helpReply); speak(helpReply); setState();
        return;
      }
      var nav = halFindNav(text);
      if (nav) {
        pendingGreeting = null; input.value = ""; append("user", text);
        var name = nav.label;
        var who = FACES[face].name;
        var line = who === "J.A.R.V.I.S." ? ("Right away, sir - " + name + ".")
                 : who === "HAL 9000" ? ("Certainly, Dave. Bringing up " + name + ".")
                 : ("Opening " + name + ".");
        append("assistant", line); speak(line);
        setTimeout(function () { try { activatePage(nav); setState(); } catch (e) {} }, 80);
        setState();
        return;
      }
      var music = findMusicCommand(text);
      if (music) {
        pendingGreeting = null; input.value = ""; append("user", text);
        var who2 = FACES[face].name;
        var mline = who2 === "J.A.R.V.I.S." ? ("With pleasure, sir - " + music.label + ", on YouTube.")
          : who2 === "HAL 9000" ? ("Certainly, Dave. " + music.label + ". I know how much you enjoy this era.")
          : ("Playing " + music.label + " on YouTube.");
        var win = window.open(music.url, "halmusic", "noopener");
        window.focus(); // return focus to this tab - the new tab shouldn't steal it
        append("assistant", win ? mline : (mline + " Your browser blocked the new tab - use the link below."), null, { url: music.url, label: "▶ " + music.label + " on YouTube" });
        speak(mline);
        setState();
        return;
      }
      pendingGreeting = null; input.value = ""; append("user", text); busy = true; setState();
      halAskHeaders().then(function (headers) {
        return fetch(HAL_API + "/api/ask", { method: "POST", headers: headers,
          body: JSON.stringify({ question: pageContextQuestion(text), history: chat.slice(-16), face: apiFace(), model: halModel }) });
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { return { res: res, d: d }; }); })
        .then(function (x) {
          var reply = !x.res.ok ? ("I've just picked up a fault in the AE-35 unit. " + (x.d.error || ("Error " + x.res.status + ".")))
            : (x.d.reply || "I'm sorry, Dave. I seem to have nothing to say.");
          append("assistant", reply, x.d.files); speak(reply);
        })
        .catch(function () {
          var r = FACES[face].name === "J.A.R.V.I.S." ? "I can't reach HAL, sir - the console server is closed. Start it with: hal app cipher-marketing (or double-click hal-here.bat)."
            : "I'm sorry, Dave. My brain is offline. Start it with: hal app cipher-marketing (or double-click hal-here.bat) - then try again.";
          append("assistant", r); speak(r);
        })
        .then(function () { busy = false; setState(); });
    }
    document.getElementById("halw-form").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    pageHelpBtn.addEventListener("click", function () {
      send("Explain this page and tell me exactly what I should do first.");
    });
    // PAUSE freezes the current reply mid-sentence; click again (RESUME) to continue.
    // The keepAlive interval above checks `paused`, so it won't auto-resume a hold.
    pauseBtn.addEventListener("click", function () {
      var synth = window.speechSynthesis; if (!synth || !speaking) return;
      if (paused) { synth.resume(); paused = false; } else { synth.pause(); paused = true; }
      setState();
    });
    // MUTE is HAL's persistent voice on/off toggle (ops-hal / MFI semantics). Muting
    // also cancels any in-flight speech immediately; unmuting re-enables the next reply.
    muteBtn.addEventListener("click", function () {
      window.speechSynthesis && window.speechSynthesis.cancel();
      voiceOn = !voiceOn; speaking = false; paused = false; setState();
    });

    // DREAM - HAL's proactive pass, on demand.
    var dreamBtn = document.getElementById("halw-dream");
    dreamBtn.addEventListener("click", function () {
      if (busy) { append("assistant", "(One moment - still finishing the previous request.)"); return; }
      if (location.protocol === "file:") {
        append("assistant", "The DREAM button needs the HAL server. Run `hal app cipher-marketing` and open the dashboard over http://, not a double-clicked file.");
        return;
      }
      var days = 14;
      var ans = window.prompt("Dream over how many days of git history?", "14");
      if (ans === null) return;
      var d = parseInt(ans, 10); if (!isNaN(d) && d > 0) days = d;
      append("user", "Dream - what should I do next? (" + days + "-day window)");
      busy = true; setState();
      var wait = "I'm reviewing everything, Dave - the whole brain and the last " + days + " days. Give me a minute.";
      append("assistant", wait); speak(wait);
      fetch(HAL_API + "/api/dream", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: days }) })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { return { res: res, d: d }; }); })
        .then(function (x) {
          if (!x.res.ok) { append("assistant", "I couldn't complete the dream. " + (x.d.error || ("Error " + x.res.status + "."))); return; }
          var note = x.d.synthesized ? ("Dream complete - " + x.d.memories + " memories, " + x.d.active_repos + " active repos. Saved to " + x.d.archive + " and brain/latest-dream.md.")
            : "I assembled the context but couldn't synthesise (no API key or the call failed). Raw context saved.";
          append("assistant", x.d.brief || "(no brief)", [x.d.archive, "brain/latest-dream.md"]);
          append("assistant", note);
          speak("Dream complete, Dave. The brief is above.");
        })
        .catch(function () {
          append("assistant", "I can't reach the archive to dream - the HAL server is closed. Start it with: hal app cipher-marketing.");
        })
        .then(function () { busy = false; setState(); });
    });

    // LAST DREAM - show the most recent stored dream instantly.
    var lastBtn = document.getElementById("halw-lastdream");
    lastBtn.addEventListener("click", function () {
      if (busy) { append("assistant", "(One moment - still finishing the previous request.)"); return; }
      if (location.protocol === "file:") {
        append("assistant", "The LAST DREAM button needs the HAL server. Run `hal app cipher-marketing` and open the dashboard over http://.");
        return;
      }
      append("user", "Show me the last dream.");
      busy = true; setState();
      fetch(HAL_API + "/api/lastdream", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (d) { return { res: res, d: d }; }); })
        .then(function (x) {
          if (!x.res.ok || x.d.error) { append("assistant", x.d.error || ("Error " + x.res.status + ".")); return; }
          if (!x.d.brief) { append("assistant", "No dream on file yet, Dave. Press DREAM to run the first one."); return; }
          var when = x.d.when ? (" (from " + x.d.when + ")") : "";
          append("assistant", "Here is my most recent dream" + when + ", Dave.");
          append("assistant", x.d.brief, ["brain/latest-dream.md"]);
        })
        .catch(function () {
          append("assistant", "I can't reach the archive - the HAL server is closed. Start it with: hal app cipher-marketing.");
        })
        .then(function () { busy = false; setState(); });
    });

    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recActive = null;
    var VOICE_SILENCE_MS = 3500;
    var voiceDraft = "";
    var voiceInterim = "";
    var voiceCommitTimer = null;
    var voiceFinishing = false;
    var MIC_ERRORS = {
      "not-allowed": "My ears are blocked, Dave - the browser is denying microphone access for this page. Click the lock icon in the address bar, set Microphone to Allow, and try again.",
      "service-not-allowed": "The browser blocked the speech service for this page - check Site settings, Microphone.",
      "audio-capture": "I find no microphone, Dave. Check that one is connected and not in use elsewhere.",
      "network": "The speech service is unreachable - Chrome's recognition needs internet.",
      "no-speech": "I didn't catch anything, Dave. Try again, a little closer to the microphone."
    };
    function voiceText() {
      return (voiceDraft + " " + voiceInterim).replace(/\s+/g, " ").trim();
    }
    function clearVoiceTimer() {
      if (voiceCommitTimer) clearTimeout(voiceCommitTimer);
      voiceCommitTimer = null;
    }
    function resetVoiceDraft() {
      clearVoiceTimer();
      voiceDraft = "";
      voiceInterim = "";
    }
    function finishVoiceTurn() {
      var transcript = voiceText();
      if (!transcript) return;
      clearVoiceTimer();
      voiceFinishing = true;
      if (recActive) {
        try { recActive.stop(); } catch (e) {}
      }
      recActive = null;
      listening = false;
      micBtn.textContent = "MIC";
      micBtn.classList.remove("live");
      resetVoiceDraft();
      setState();
      send(transcript);
    }
    function cancelVoiceTurn() {
      clearVoiceTimer();
      voiceFinishing = true;
      var active = recActive;
      recActive = null;
      listening = false;
      resetVoiceDraft();
      micBtn.textContent = "MIC";
      micBtn.classList.remove("live");
      if (active) {
        try { active.stop(); } catch (e) { voiceFinishing = false; }
      } else {
        voiceFinishing = false;
      }
      setState();
    }
    function armVoiceCommit() {
      clearVoiceTimer();
      voiceCommitTimer = setTimeout(finishVoiceTurn, VOICE_SILENCE_MS);
    }
    // Re-arm the ears in LIVE mode once HAL is idle (not busy, speaking, or already listening).
    function relisten(delay) { if (live) setTimeout(function () { if (live && !busy && !speaking && !listening) startListen(); }, delay || 300); }
    function openRecognitionCycle() {
      if (!Rec || recActive || voiceFinishing || !listening) return;
      var clickedAt = Date.now();
      var rec = new Rec();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      recActive = rec;
      rec.onresult = function (e) {
        var interim = "";
        for (var i = e.resultIndex || 0; i < e.results.length; i++) {
          var part = (e.results[i][0] && e.results[i][0].transcript) || "";
          if (e.results[i].isFinal) {
            voiceDraft = (voiceDraft + " " + part).replace(/\s+/g, " ").trim();
          } else {
            interim += " " + part;
          }
        }
        voiceInterim = interim.replace(/\s+/g, " ").trim();
        if (voiceText()) armVoiceCommit();
      };
      rec.onend = function () {
        if (recActive === rec) recActive = null;
        if (voiceFinishing) {
          voiceFinishing = false;
          listening = false;
          micBtn.textContent = "MIC";
          micBtn.classList.remove("live");
          setState();
          return;
        }
        // Chrome may close a recognition cycle after a short pause. Keep the
        // same turn open and restart the ears while our longer silence timer is
        // still running, so Dave can continue speaking at a natural pace.
        if (listening && voiceText()) {
          setTimeout(openRecognitionCycle, 120);
          return;
        }
        listening = false;
        micBtn.textContent = "MIC";
        micBtn.classList.remove("live");
        setState();
        relisten();  // if LIVE and nothing was said, keep the ears open
      };
      rec.onerror = function (e) {
        var code = (e && e.error) || "unknown";
        // Permission/hardware failures are fatal to hands-free mode - leave LIVE.
        if (code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture") live = false;
        // Suppress a no-speech notice while hands-free or while waiting through
        // a natural pause in an otherwise valid turn.
        if (!((live || voiceText()) && code === "no-speech")) {
          var instant = (Date.now() - clickedAt) < 400;
          append("assistant", (MIC_ERRORS[code] || ("Microphone error: " + code + ".")) +
            (instant ? " (This failed instantly - the LISTENING state reverted before it was visible.)" : ""));
          statusEl.textContent = "MIC ERROR: " + code.toUpperCase();
          setTimeout(setState, 3500);
        }
        // onend fires after onerror and handles listening reset + relisten.
      };
      try {
        rec.start();
      } catch (err) {
        listening = false;
        recActive = null;
        resetVoiceDraft();
        append("assistant", "The microphone could not be started in this window, Dave: " + err.message);
        setState();
      }
    }
    // Hoisted so speak()'s finish handler and the LIVE loop can both call it.
    function startListen() {
      if (!Rec || listening || busy) return;
      if (location.protocol === "file:") {
        append("assistant", "Voice input cannot work from a double-clicked file - the browser refuses microphone access to file:// pages. Open the dashboard over http:// instead.");
        live = false; setState(); return;
      }
      resetVoiceDraft();
      voiceFinishing = false;
      listening = true;
      micBtn.textContent = "DONE";
      micBtn.title = "HAL is listening. Pause naturally, or press DONE to send now.";
      micBtn.classList.add("live");
      setState();
      openRecognitionCycle();
    }
    if (Rec) {
      micBtn.style.display = ""; liveBtn.style.display = "";
      // MIC = barge-in: cut HAL off mid-sentence and listen right now (or stop if
      // already listening). Works even while HAL is speaking - that's the point.
      micBtn.addEventListener("click", function () {
        if (speaking) { window.speechSynthesis && window.speechSynthesis.cancel(); speaking = false; paused = false; }
        if (listening) {
          if (voiceText()) finishVoiceTurn();
          else cancelVoiceTurn();
          return;
        }
        if (busy) { append("assistant", "(One moment - still finishing the previous request. Try the mic again in a second.)"); setState(); return; }
        startListen();
      });
      // LIVE = hands-free conversation: HAL listens, replies, then re-opens the
      // ears automatically. Echo-safe (the mic is off while HAL speaks); tap MIC
      // to cut in mid-reply.
      liveBtn.addEventListener("click", function () {
        live = !live; setState();
        if (live) { if (!busy && !speaking && !listening) startListen(); }
        else if (listening) cancelVoiceTurn();
      });
    }

    var facesEl = document.getElementById("halw-faces"), nameEl = document.getElementById("halw-facename"),
        handleLabelEl = document.querySelector("#halw-collapse .hal-handle-label");
    function renderFaces() {
      nameEl.textContent = FACES[face].name;
      if (handleLabelEl) {
        handleLabelEl.textContent = face === "assistant" ? "BRAD" : face === "hal" ? "HAL" : "JARVIS";
      }
      // Name tint per persona: JARVIS gold, ASSISTANT steel, HAL blue-grey.
      nameEl.style.color = face === "jarvis" ? "#ffd47e" : face === "assistant" ? "#b8c4d4" : "#9db4ff";
      paintEye();
      var btns = facesEl.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) { btns[i].className = btns[i].getAttribute("data-face") === face ? "on" : ""; }
    }
    Object.keys(FACES).forEach(function (f) {
      var b = document.createElement("button"); b.setAttribute("data-face", f); b.title = FACES[f].name;
      b.setAttribute("aria-label", "Talk to " + FACES[f].name);
      b.textContent = f === "assistant" ? "BRAD" : f === "hal" ? "HAL" : "JARVIS";
      b.addEventListener("click", function () {
        if (face === f) return;
        window.speechSynthesis && window.speechSynthesis.cancel(); speaking = false; paused = false; face = f;
        try { localStorage.setItem("hal-console-face", f); } catch (e) {}
        renderFaces(); setState();
        if (chat.length === 0) { var gg = pickGreeting(); append("assistant", gg); pendingGreeting = gg; speak(gg); }
      });
      facesEl.appendChild(b);
    });
    renderFaces();

    // ---- collapse: a permanent dock with an escape hatch -------------------
    var collapsed = true;
    try {
      var cs = localStorage.getItem("hal-rail-collapsed");
      if (cs === "0") collapsed = false;
    } catch (e) {}
    document.body.classList.toggle("hal-collapsed", collapsed);
    function setCollapsed(v) {
      collapsed = v; document.body.classList.toggle("hal-collapsed", v);
      try { localStorage.setItem("hal-rail-collapsed", v ? "1" : "0"); } catch (e) {}
      if (!v) { setTimeout(function () { input.focus(); }, 220); }
    }
    window.cipherAskBrad = function (text) {
      setCollapsed(false);
      input.value = String(text || "");
      setState();
      send(input.value);
    };
    document.getElementById("halw-collapse").addEventListener("click", function () { setCollapsed(!collapsed); });

    // Greet once on load - text only (browsers block speech before a gesture).
    if (chat.length === 0) { var g0 = pickGreeting(); append("assistant", g0); }
    setState();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
