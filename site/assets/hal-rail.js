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
.hal-winhead { display:flex; align-items:center; gap:8px; padding:10px 12px;
  border-bottom:1px solid #16181d; user-select:none; }
.hal-lens { position:relative; width:24px; height:24px; border-radius:9999px; flex:none;
  background:radial-gradient(circle at 50% 44%, #fff7d6 0%, #ffc24a 5%, #ff5a00 16%,
    #d61a00 30%, #6e0700 52%, #1c0100 74%, #000 92%);
  box-shadow:0 0 8px 2px rgba(255,42,0,.5); animation:halBreathe 4.5s ease-in-out infinite; }
.hal-lens.thinking { animation:halBreathe 1.4s ease-in-out infinite; }
.hal-lens.speaking { animation:halSpeak .55s ease-in-out infinite; }
.hal-glint { position:absolute; width:6px; height:4px; border-radius:9999px; top:30%; left:38%;
  background:rgba(255,255,255,.85); filter:blur(1px); transform:rotate(-25deg); }
.hal-name { letter-spacing:.28em; color:#9db4ff; font-size:12px; }
.hal-status { letter-spacing:.2em; color:#5a6578; font-size:9px; }
.hal-spacer { flex:1; }
.hal-faces { display:flex; gap:9px; align-items:center; }
.hal-faces button { width:13px; height:13px; border-radius:9999px; border:none; cursor:pointer;
  opacity:.4; transition:all .15s; }
.hal-faces button.on { opacity:1; box-shadow:0 0 8px 1px currentColor; }
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
`;
    var styleEl = document.createElement("style");
    styleEl.id = "hal-rail-style";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ---- markup ------------------------------------------------------------
    var railHTML =
      '<aside class="hal-rail" id="halw-rail" aria-label="HAL assistant">' +
      '  <button class="hal-handle" id="halw-collapse" title="Collapse / expand HAL" aria-label="Collapse or expand HAL">' +
      '    <span class="hal-handle-eye"></span>' +
      '    <span class="hal-handle-label">HAL</span>' +
      '    <span class="hal-handle-chev" id="halw-chev">&#8250;</span>' +
      '  </button>' +
      '  <div class="hal-panel">' +
      '    <div class="hal-winhead" id="halw-winhead">' +
      '      <span class="hal-lens" id="halw-lens"><span class="hal-glint"></span></span>' +
      '      <span class="hal-name" id="halw-facename">HAL 9000</span>' +
      '      <span class="hal-faces" id="halw-faces" role="group" aria-label="Choose persona"></span>' +
      '      <span class="hal-spacer"></span>' +
      '      <span class="hal-status" id="halw-status">OPERATIONAL</span>' +
      '    </div>' +
      '    <div class="hal-log" id="halw-log"></div>' +
      '    <form class="hal-controls" id="halw-form">' +
      '      <input class="hal-input" id="halw-input" placeholder="Ask HAL about the campaign&#8230;" autocomplete="off">' +
      '      <button type="submit" class="hal-btn" id="halw-send">SEND</button>' +
      '      <button type="button" class="hal-btn" id="halw-mic" style="display:none">MIC</button>' +
      '      <button type="button" class="hal-btn" id="halw-voice">VOICE ON</button>' +
      '      <button type="button" class="hal-btn" id="halw-dream" title="HAL\'s proactive pass - reviews the brain + recent commits (~1-2 min)">DREAM</button>' +
      '      <button type="button" class="hal-btn" id="halw-lastdream" title="Show the most recent dream instantly">LAST DREAM</button>' +
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
      assistant: { name:"ASSISTANT", dot:"#9aa4b2", tint:"saturate(0.15) brightness(1.15)",
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
    var face = "hal";
    try { var f0 = localStorage.getItem("hal-console-face"); if (FACES[f0]) face = f0; } catch (e) {}
    var busy = false, speaking = false, listening = false, voiceOn = true, pendingGreeting = null, chat = [];
    var lens = document.getElementById("halw-lens"), statusEl = document.getElementById("halw-status"),
        log = document.getElementById("halw-log"), input = document.getElementById("halw-input"),
        sendBtn = document.getElementById("halw-send"), micBtn = document.getElementById("halw-mic"),
        voiceBtn = document.getElementById("halw-voice");

    function setState() {
      statusEl.textContent = listening ? "LISTENING" : speaking ? "SPEAKING" : busy ? "PROCESSING" : "OPERATIONAL";
      lens.className = "hal-lens" + (speaking ? " speaking" : busy ? " thinking" : "");
      lens.style.filter = FACES[face].tint;
      sendBtn.disabled = busy || !input.value.trim();
    }
    input.addEventListener("input", setState);

    function append(role, text, files) {
      var d = document.createElement("div"); d.className = "hal-line " + (role === "assistant" ? "hal" : "dave");
      var w = document.createElement("span"); w.className = "who";
      w.textContent = role === "assistant" ? FACES[face].name : "DAVE"; d.appendChild(w);
      d.appendChild(document.createTextNode(text));
      if (files && files.length) {
        var c = document.createElement("div"); c.className = "hal-cite";
        c.textContent = "MEMORY: " + files.join("  \\u00B7  "); d.appendChild(c);
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
      var synth = window.speechSynthesis; synth.cancel();
      var p = FACES[face], utt = new SpeechSynthesisUtterance(text);
      utt.lang = p.lang; utt.rate = p.rate; utt.pitch = p.pitch; utt.volume = 1;
      var voices = synth.getVoices(), pick = null;
      for (var i = 0; i < p.pref.length && !pick; i++) { for (var j = 0; j < voices.length; j++) { if (voices[j].name === p.pref[i]) { pick = voices[j]; break; } } }
      if (!pick) { for (var k = 0; k < voices.length; k++) { if (voices[k].lang === p.lang) { pick = voices[k]; break; } } }
      if (!pick) { for (var k2 = 0; k2 < voices.length; k2++) { if (voices[k2].lang.indexOf("en") === 0) { pick = voices[k2]; break; } } }
      if (pick) utt.voice = pick;
      if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
      keepAlive = setInterval(function () { if (!synth.speaking) { clearInterval(keepAlive); keepAlive = null; return; } synth.pause(); synth.resume(); }, 10000);
      var finish = function () { if (keepAlive) { clearInterval(keepAlive); keepAlive = null; } speaking = false; setState(); };
      utt.onend = finish; utt.onerror = finish;
      utt.onstart = function () { pendingGreeting = null; speaking = true; setState(); };
      synth.speak(utt);
    }
    function send(raw) {
      var text = (raw !== undefined ? raw : input.value).trim();
      if (!text || busy) return;
      pendingGreeting = null; input.value = ""; append("user", text); busy = true; setState();
      fetch(HAL_API + "/api/ask", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: chat.slice(-16), face: face }) })
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
    voiceBtn.addEventListener("click", function () {
      if (voiceOn) window.speechSynthesis && window.speechSynthesis.cancel();
      voiceOn = !voiceOn; voiceBtn.textContent = "VOICE " + (voiceOn ? "ON" : "OFF");
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
    if (Rec) {
      micBtn.style.display = "";
      micBtn.addEventListener("click", function () {
        if (listening) { append("assistant", "(I'm already listening - go ahead and speak.)"); return; }
        if (busy) { append("assistant", "(One moment - still finishing the previous request. Try the mic again in a second.)"); return; }
        if (location.protocol === "file:") {
          append("assistant", "Voice input cannot work from a double-clicked file - the browser refuses microphone access to file:// pages. Open the dashboard over http:// instead.");
          return;
        }
        var clickedAt = Date.now();
        var rec = new Rec(); rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
        rec.onresult = function (e) { var t = (e.results[0] && e.results[0][0] && e.results[0][0].transcript) || ""; if (t) send(t); };
        rec.onend = function () { listening = false; micBtn.textContent = "MIC"; micBtn.classList.remove("live"); setState(); };
        var MIC_ERRORS = {
          "not-allowed": "My ears are blocked, Dave - the browser is denying microphone access for this page. Click the lock icon in the address bar, set Microphone to Allow, and try again.",
          "service-not-allowed": "The browser blocked the speech service for this page - check Site settings, Microphone.",
          "audio-capture": "I find no microphone, Dave. Check that one is connected and not in use elsewhere.",
          "network": "The speech service is unreachable - Chrome's recognition needs internet.",
          "no-speech": "I didn't catch anything, Dave. Try again, a little closer to the microphone."
        };
        rec.onerror = function (e) {
          rec.onend(); var code = (e && e.error) || "unknown";
          var why = MIC_ERRORS[code];
          var instant = (Date.now() - clickedAt) < 400;
          append("assistant", (why || ("Microphone error: " + code + ".")) +
            (instant ? " (This failed instantly - the LISTENING state reverted before it was visible.)" : ""));
          statusEl.textContent = "MIC ERROR: " + code.toUpperCase();
          setTimeout(setState, 3500);
        };
        listening = true; micBtn.textContent = "\\u25CF LISTENING"; micBtn.classList.add("live"); setState();
        try { rec.start(); } catch (err) { rec.onend(); append("assistant", "The microphone could not be started in this window, Dave: " + err.message); }
      });
    }

    var facesEl = document.getElementById("halw-faces"), nameEl = document.getElementById("halw-facename");
    function renderFaces() {
      nameEl.textContent = FACES[face].name;
      var btns = facesEl.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) { btns[i].className = btns[i].getAttribute("data-face") === face ? "on" : ""; }
    }
    Object.keys(FACES).forEach(function (f) {
      var b = document.createElement("button"); b.setAttribute("data-face", f); b.title = FACES[f].name;
      b.setAttribute("aria-label", "Talk to " + FACES[f].name);
      b.style.background = FACES[f].dot; b.style.color = FACES[f].dot;
      b.addEventListener("click", function () {
        if (face === f) return;
        window.speechSynthesis && window.speechSynthesis.cancel(); speaking = false; face = f;
        try { localStorage.setItem("hal-console-face", f); } catch (e) {}
        renderFaces(); setState();
        if (chat.length === 0) { var gg = pickGreeting(); append("assistant", gg); pendingGreeting = gg; speak(gg); }
      });
      facesEl.appendChild(b);
    });
    renderFaces();

    // ---- collapse: a permanent dock with an escape hatch -------------------
    var collapsed = false;
    try {
      var cs = localStorage.getItem("hal-rail-collapsed");
      if (cs === "1") collapsed = true;
      else if (cs === null && window.innerWidth < 1024) collapsed = true;  // start tucked on small screens
    } catch (e) {}
    document.body.classList.toggle("hal-collapsed", collapsed);
    function setCollapsed(v) {
      collapsed = v; document.body.classList.toggle("hal-collapsed", v);
      try { localStorage.setItem("hal-rail-collapsed", v ? "1" : "0"); } catch (e) {}
      if (!v) { setTimeout(function () { input.focus(); }, 220); }
    }
    document.getElementById("halw-collapse").addEventListener("click", function () { setCollapsed(!collapsed); });

    // Greet once on load - text only (browsers block speech before a gesture).
    if (chat.length === 0) { var g0 = pickGreeting(); append("assistant", g0); }
    setState();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
