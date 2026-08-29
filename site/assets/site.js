/* CipherExam campaign site — shared JS (vanilla, no deps) */

// ---------- CONFIG ----------
// Defaults — overridden by data/campaign-state.json at runtime if reachable.
let CAMPAIGN_START = '2026-05-18';
let CURRENT_ACTIVATED = 0;
let ACTIVATION_GATE = 25;
let ACTIVATION_TARGET_4WK = 55;
let STATE = null;                              // populated by loadState()

function applyState(j) {
  if (!j) return null;
  STATE = j;
  if (j.campaign?.start) CAMPAIGN_START = j.campaign.start;
  if (j.campaign?.activationGate != null) ACTIVATION_GATE = j.campaign.activationGate;
  if (j.campaign?.activationTarget4wk != null) ACTIVATION_TARGET_4WK = j.campaign.activationTarget4wk;
  if (j.metrics?.activatedUsersTotal != null) CURRENT_ACTIVATED = j.metrics.activatedUsersTotal;
  return j;
}

async function loadState() {
  try {
    if (!window._cipherAuthReady || !window._cipherDb) {
      throw new Error('Authenticated Firestore is unavailable.');
    }
    await window._cipherAuthReady;
    const snap = await window._cipherDb.collection('campaign').doc('state').get();
    if (!snap.exists) throw new Error('campaign/state is missing.');
    window.__CAMPAIGN_STATE__ = snap.data();
    return applyState(window.__CAMPAIGN_STATE__);
  } catch (e) {
    console.warn('[campaign-state] authenticated load failed:', e.message);
    return null;
  }
}

// ---------- 4-WEEK CALENDAR DATA (from 00-campaign-brief.md §3) ----------
// Week 0 = pre-launch (engineering blockers from 06-engineering-handoff.md §7).
// Weekdays only Mon–Fri; weekends graceful.
const CALENDAR = {
  // ---- PRE-LAUNCH WEEK (week 0) ----
  preLaunch: {
    label: 'Pre-launch — engineering blockers',
    tasks: [
      'Three Tier 1 LPs (PMP, Sec+, SHRM-CP) deployed and reachable',
      'Try-a-Question widget renders on each LP with explanation panel working',
      'GA4 signup_complete fires on a real test signup (verify in DebugView)',
      'Meta Conversions API server-side test event received',
      'LinkedIn Insight Tag firing on /lp/* pages',
      'Resend Day 0 email sends to test address with merge tags populated',
      'Resend suppresses correctly when test user upgrades mid-trial',
      'In-app testimonial prompt fires at 10th-question milestone',
      'UTM source/medium/campaign/exam tags resolve cleanly in GA4'
    ]
  },
  // ---- ACTIVE 4 WEEKS ----
  weeks: [
    { // Week 1 (prep)
      label: 'Week 1 — prep & cornerstone',
      days: {
        Mon: { tasks: ['Publish cornerstone blog (01-cornerstone-cipherexam-thinking.md)'] },
        Tue: { tasks: ['PMP LP live (no ads yet) — verify analytics fire'] },
        Wed: { tasks: ['Security+ LP live (no ads yet) — verify analytics fire'] },
        Thu: { tasks: ['SHRM-CP LP live (no ads yet) — verify analytics fire'] },
        Fri: { tasks: ['LinkedIn founder post: PMP worked-question (LI long-form #1 from 02-multi-exam-social.md)'] }
      }
    },
    { // Week 2
      label: 'Week 2 — Sec+ + Reddit value posts',
      days: {
        Mon: { tasks: ['LinkedIn founder post: Sec+ PBQ walkthrough (LI long-form #1)'] },
        Tue: { tasks: ['Reddit r/pmp value post (no link)'] },
        Wed: { tasks: ['Reddit r/CompTIA value post (no link)'] },
        Thu: { tasks: ['LinkedIn founder post: SHRM-CP Competency Lens (LI long-form #1)'] },
        Fri: { tasks: ['Mid-campaign read: which channel is producing signups? Pull GA4 by-source.'] }
      }
    },
    { // Week 3
      label: 'Week 3 — X/Twitter + warm outreach',
      days: {
        Mon: { tasks: ['Reddit r/humanresources value post (no link)'] },
        Tue: { tasks: ['X/Twitter PMP worked-question thread'] },
        Wed: { tasks: ['X/Twitter Sec+ "the question you\'ll see" hook (uses the one allowed decode wordplay)'] },
        Thu: { tasks: ['LinkedIn warm-outreach push: 10–15 personalized DMs (exam-merge-tagged template from 02 §exam-agnostic)'] },
        Fri: { tasks: ['LinkedIn founder post #2: PMP (worked-question variant)'] }
      }
    },
    { // Week 4
      label: 'Week 4 — retro + paid-gate decision',
      days: {
        Mon: { tasks: ['LinkedIn founder post #2: Security+'] },
        Tue: { tasks: ['LinkedIn founder post #2: SHRM-CP'] },
        Wed: { tasks: ['X/Twitter SHRM-CP worked question'] },
        Thu: { tasks: ['4-week retro: which cluster activated most users? Pull GA4 by examId.'] },
        Fri: { tasks: ['Decision day: hit the 25-activated-user paid-spend gate yet?', 'If yes — turn on $2/day retargeting on highest-leverage channel (Reddit Promoted or Google Search RT of LP visitors).', 'If no — extend organic. Tier 2 expansion is gated on hitting cluster targets.'] }
        }
    }
  ],
  postCampaign: {
    label: 'Post-campaign — retro & next cycle',
    tasks: [
      'Campaign done — write retro: cluster-level activation rates vs. target',
      'Decide which Tier 1 cluster gets sustained organic + paid retargeting',
      'Decide whether to start Tier 2 rollout (Network+, Six Sigma GB, CSM SEO)',
      'Update cipher-exam-context skill with real conversion-rate numbers'
    ]
  }
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ---------- VIDEO CREATIVE PER DAY ----------
// Keyed by `${weekIndex}-${weekday}` (week 1-4, weekday Mon-Fri).
// Days not present here are text-only / no video.
// LinkedIn-targeted days use the -li (4:5) variants so they don't get
// letterboxed in the LinkedIn desktop feed. X/Twitter and blog-embed days
// use the original 9:16 or 1:1 versions.
const CALENDAR_VIDEOS = {
  '1-Mon': { id: 'launch-teaser-pmp',           title: 'Launch teaser — PMP (1:1)',                            use: 'Embed at top of the cornerstone blog post',         why: 'Sets up "we teach you how the exam thinks" before the long read.' },
  '1-Fri': { id: 'ai-tutor-demo-pmp-li',        title: 'AI tutor demo — PMP scenario #1 (4:5 LinkedIn)',       use: 'LinkedIn founder post — PMP worked question',       why: 'Stakeholder-excluded scenario shows the Exam Lens. 4:5 fits LinkedIn feed without letterboxing.' },
  '2-Mon': { id: 'pbq-walkthrough-secplus-li',  title: 'Sec+ PBQ walkthrough (4:5 LinkedIn)',                  use: 'LinkedIn founder post — PBQ walkthrough',           why: 'PBQ-native demo. CompTIA-family differentiator. 4:5 for LinkedIn.' },
  '2-Thu': { id: 'ai-tutor-demo-shrm-li',       title: 'AI tutor demo — SHRM-CP (4:5 LinkedIn)',               use: 'LinkedIn founder post — Exam Lens',                 why: 'Worked scenario showing the Exam Lens. 4:5 for LinkedIn.' },
  '3-Tue': { id: 'ai-tutor-demo-pmp',           title: 'AI tutor demo — PMP (9:16)',                           use: 'X/Twitter thread — PMP worked question',            why: '9:16 vertical works on X mobile. Reusing the PMP demo as a thread anchor.' },
  '3-Wed': { id: 'launch-teaser-secplus',       title: 'Launch teaser — Security+ (1:1)',                      use: 'X/Twitter — Sec+ "the question you\'ll see" hook',  why: '1:1 hook fits X feed cleanly.' },
  '3-Fri': { id: 'ai-tutor-demo-pmp2-li',       title: 'AI tutor demo — PMP #2 / scope creep (4:5 LinkedIn)',  use: 'LinkedIn founder post #2 — PMP variant',            why: 'Different angle: change-control scenario. 4:5 for LinkedIn.' },
  '4-Mon': { id: 'ai-tutor-demo-secplus2-li',   title: 'AI tutor demo — Sec+ #2 / incident response (4:5 LI)', use: 'LinkedIn founder post #2 — Sec+',                   why: 'Ransomware containment scenario. 4:5 for LinkedIn.' },
  '4-Tue': { id: 'ai-tutor-demo-shrm2-li',      title: 'AI tutor demo — SHRM-CP #2 / business acumen (4:5 LI)', use: 'LinkedIn founder post #2 — SHRM-CP',              why: 'Termination-readiness scenario, Business Acumen lens. 4:5 for LinkedIn.' },
  '4-Wed': { id: 'ai-tutor-demo-shrm',          title: 'AI tutor demo — SHRM-CP (9:16)',                       use: 'X/Twitter — SHRM-CP worked question',               why: '9:16 works on X mobile. Re-use Round 1 SHRM demo as X thread anchor.' },
};

function videoPathFor(id) {
  // Videos live one level up in `videos/out/`. The site/ http server can't reach
  // outside its root, so show a relative path the user can open from disk or
  // serve separately. Returns a string to display, not a working <video src>.
  return `videos/out/${id}.mp4`;
}

// ---------- DATE / STAGE HELPERS ----------
function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((b.getTime() - a.getTime()) / ms);
}

function weekdayName(d) {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
}

function formatDateLong(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Returns {stage, weekIndex, weekday, label, tasks, isWeekend}
 *   stage: 'pre' | 'active' | 'post'
 *   weekIndex: 1-4 when active; null otherwise
 *   weekday: Mon..Fri or Sat/Sun
 */
function stageFor(date) {
  const start = parseISO(CAMPAIGN_START);
  const diff = daysBetween(start, date);
  const wd = weekdayName(date);
  const isWeekend = wd === 'Sat' || wd === 'Sun';

  if (diff < 0) {
    // Pre-launch: prefer the per-item checklist from campaign-state.json if present,
    // so the dashboard reflects done / N/A / pending-runtime status set by Brad.
    // Falls back to the flat string array for older state files.
    const checklist = STATE?.preLaunchChecklist;
    const tasks = Array.isArray(checklist) && checklist.length > 0
      ? checklist
      : CALENDAR.preLaunch.tasks;
    return { stage: 'pre', weekIndex: null, weekday: wd, label: CALENDAR.preLaunch.label, tasks, isWeekend };
  }
  const weekIndex = Math.floor(diff / 7) + 1; // day 0 → week 1
  if (weekIndex > 4) {
    return { stage: 'post', weekIndex: null, weekday: wd, label: CALENDAR.postCampaign.label, tasks: CALENDAR.postCampaign.tasks, isWeekend };
  }
  const wk = CALENDAR.weeks[weekIndex - 1];
  if (isWeekend) {
    return { stage: 'active', weekIndex, weekday: wd, label: `${wk.label} — Weekend`, tasks: [], isWeekend: true };
  }
  const dayEntry = wk.days[wd] || { tasks: [] };
  return { stage: 'active', weekIndex, weekday: wd, label: `${wk.label} — ${wd}`, tasks: dayEntry.tasks, isWeekend: false };
}

// ---------- LOCALSTORAGE ----------
function loadDone(scope, dateKey) {
  try { return JSON.parse(localStorage.getItem(`ce.${scope}.${dateKey}`) || '{}'); }
  catch { return {}; }
}
function saveDone(scope, dateKey, obj) {
  localStorage.setItem(`ce.${scope}.${dateKey}`, JSON.stringify(obj));
}

// ---------- RENDER HELPERS ----------
function renderTaskList(container, info, dateKey, opts = {}) {
  container.innerHTML = '';
  if (info.isWeekend && info.tasks.length === 0) {
    container.innerHTML = '<p style="color:var(--dim);font-style:italic;">Weekend — no scheduled tasks. Recharge.</p>';
    return;
  }
  if (info.tasks.length === 0) {
    container.innerHTML = '<p style="color:var(--dim);">No scheduled tasks for this day.</p>';
    return;
  }
  const done = opts.readonly ? (opts.doneOverride || {}) : loadDone(opts.scope || 'today', dateKey);

  // Detect structured tasks (objects with status) vs the legacy flat string list.
  const isStructured = typeof info.tasks[0] === 'object' && info.tasks[0] !== null;

  if (isStructured) {
    // Group by status so the eye sees "what's left" first.
    const groups = { 'pending-runtime': [], 'in-progress': [], pending: [], done: [], na: [] };
    info.tasks.forEach((t, i) => {
      const k = (groups[t.status] ? t.status : 'pending');
      groups[k].push({ task: t, index: i });
    });

    const doneCount = groups.done.length;
    const naCount = groups.na.length;
    const pendingRuntime = groups['pending-runtime'].length;
    const inProgress = groups['in-progress'].length;
    const pending = groups.pending.length;
    const total = info.tasks.length;
    const remaining = pendingRuntime + inProgress + pending;

    const summary = document.createElement('div');
    summary.className = 'task-summary';
    summary.innerHTML = `
      <div class="task-summary-line">
        <span class="status-good"><strong>${doneCount}</strong> of ${total} done</span>
        ${inProgress > 0 ? ` · <span class="status-warn"><strong>${inProgress}</strong> in progress</span>` : ''}
        ${pendingRuntime > 0 ? ` · <span class="status-warn"><strong>${pendingRuntime}</strong> awaiting Day-1 verification</span>` : ''}
        ${pending > 0 ? ` · <span class="status-bad"><strong>${pending}</strong> pending</span>` : ''}
        ${naCount > 0 ? ` · <span style="color:var(--dim);"><strong>${naCount}</strong> N/A</span>` : ''}
      </div>
      ${remaining === 0 ? '<div class="task-summary-sub status-good">All actionable items cleared — runtime checks deferred to Day 1.</div>' : ''}
    `;
    container.appendChild(summary);

    // Render groups in priority order. Hide pending-runtime/done/na behind collapsible
    // <details> blocks if they're not the "thing you have to do right now" group.
    const ORDER = [
      { key: 'in-progress',      label: 'In progress',                 statusClass: 'warn', collapsed: false },
      { key: 'pending',          label: 'Pending — action required',   statusClass: 'bad',  collapsed: false },
      { key: 'pending-runtime',  label: 'Awaiting Day-1 verification', statusClass: 'warn', collapsed: true  },
      { key: 'done',             label: 'Done',                        statusClass: 'good', collapsed: true  },
      { key: 'na',               label: 'N/A — deferred',              statusClass: 'dim',  collapsed: true  }
    ];

    for (const g of ORDER) {
      const items = groups[g.key];
      if (items.length === 0) continue;
      const details = document.createElement('details');
      if (!g.collapsed) details.open = true;
      const sum = document.createElement('summary');
      sum.innerHTML = `<span class="pill ${g.statusClass}">${g.label}</span> <span style="color:var(--dim);font-size:0.88rem;">${items.length}</span>`;
      details.appendChild(sum);

      items.forEach(({ task, index }) => {
        const row = document.createElement('div');
        const serverDone = task.status === 'done' || task.status === 'na';
        const isLocalDone = !!done[index];
        const visibleDone = serverDone || isLocalDone;
        const statusCls = task.status === 'done' ? 'good'
          : task.status === 'na' ? 'dim'
          : task.status === 'pending-runtime' || task.status === 'in-progress' ? 'warn'
          : 'bad';
        row.className = 'task-row' + (opts.readonly ? ' readonly' : '') + (visibleDone ? ' done' : '') + ` status-${statusCls}`;
        const id = `${opts.scope || 'today'}-${dateKey}-${index}`;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = id;
        cb.checked = visibleDone;
        // Disable when server has already marked done/na — local checkbox shouldn't override truth.
        if (opts.readonly || serverDone) cb.disabled = true;
        cb.addEventListener('change', () => {
          const cur = loadDone(opts.scope || 'today', dateKey);
          cur[index] = cb.checked;
          saveDone(opts.scope || 'today', dateKey, cur);
          row.classList.toggle('done', cb.checked);
        });
        const lab = document.createElement('label');
        lab.htmlFor = id;
        lab.textContent = task.label;
        row.appendChild(cb);
        row.appendChild(lab);
        if (task.note) {
          const noteEl = document.createElement('div');
          noteEl.className = 'task-note';
          noteEl.textContent = task.note;
          row.appendChild(noteEl);
        }
        details.appendChild(row);
      });
      container.appendChild(details);
    }
    return;
  }

  // Legacy: flat string-array tasks.
  info.tasks.forEach((task, i) => {
    const row = document.createElement('div');
    const isDone = !!done[i];
    row.className = 'task-row' + (opts.readonly ? ' readonly' : '') + (isDone ? ' done status-good' : ' status-bad');
    const id = `${opts.scope || 'today'}-${dateKey}-${i}`;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.checked = isDone;
    if (opts.readonly) cb.disabled = true;
    cb.addEventListener('change', () => {
      const cur = loadDone(opts.scope || 'today', dateKey);
      cur[i] = cb.checked;
      saveDone(opts.scope || 'today', dateKey, cur);
      row.classList.toggle('done', cb.checked);
      row.classList.toggle('status-good', cb.checked);
      row.classList.toggle('status-bad', !cb.checked);
    });
    const lab = document.createElement('label');
    lab.htmlFor = id;
    lab.textContent = task;
    row.appendChild(cb);
    row.appendChild(lab);
    container.appendChild(row);
  });
}

function renderWeekStrip(container, refDate) {
  container.innerHTML = '';
  const today = new Date(refDate);
  const todayDow = today.getDay(); // 0..6
  // Anchor to Monday of current week
  const monOffset = (todayDow === 0 ? -6 : 1 - todayDow);
  const monday = new Date(today);
  monday.setDate(today.getDate() + monOffset);

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const wd = weekdayName(d);
    const isToday = dayKey(d) === dayKey(today);
    const el = document.createElement('div');
    el.className = 'day' + (isToday ? ' today' : '');
    el.innerHTML = `<span class="label">${wd}</span>${d.getDate()}`;
    container.appendChild(el);
  }
}

function renderProgressBar(container, current, total) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  // For the paid-spend gate: red < 33%, yellow 33–99%, green at 100%.
  const status = current >= total ? 'good' : (pct >= 33 ? 'warn' : 'bad');
  container.innerHTML = `
    <div class="progress-meta">
      <span><strong class="status-${status}">${current}</strong> of ${total} activated users</span>
      <span class="status-${status}">${pct}%</span>
    </div>
    <div class="progress-bar"><div class="fill status-${status}" style="width:${pct}%"></div></div>
  `;
}

// ---------- NAV CURRENT-PAGE HIGHLIGHT ----------
function highlightNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('current');
  });
}

// ---------- TODAY CREATIVE (which video to attach to today's post) ----------
function renderTodayCreative(container) {
  if (!container) return;
  const today = new Date();
  const info = stageFor(today);
  if (info.stage !== 'active' || info.isWeekend) {
    container.innerHTML = `<p style="color:var(--dim);margin:0;">${info.stage === 'pre' ? 'Pre-launch — no campaign-day creative yet. Once Week 1 starts, today\'s recommended video will appear here.' : 'No video creative scheduled today.'}</p>`;
    return;
  }
  const key = `${info.weekIndex}-${info.weekday}`;
  const v = CALENDAR_VIDEOS[key];
  if (!v) {
    container.innerHTML = '<p style="color:var(--dim);margin:0;"><strong>Text-only day.</strong> No video creative scheduled — focus on the copy.</p>';
    return;
  }
  container.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">
      <div style="flex:1;min-width:240px;">
        <div style="font-family:'Satoshi',sans-serif;font-size:0.75rem;font-weight:700;color:var(--purple);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;">Today's video creative</div>
        <div style="font-family:'Satoshi',sans-serif;font-size:1.2rem;font-weight:700;color:var(--cyan);margin-bottom:6px;">${escapeHtml(v.title)}</div>
        <div style="font-size:0.92rem;margin-bottom:4px;"><strong>Use:</strong> ${escapeHtml(v.use)}</div>
        <div style="font-size:0.88rem;color:var(--dim);"><strong>Why this one:</strong> ${escapeHtml(v.why)}</div>
      </div>
      <div style="flex:0 0 auto;text-align:right;font-size:0.82rem;">
        <div style="color:var(--muted);margin-bottom:4px;">File:</div>
        <code style="display:inline-block;font-size:0.82rem;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--cyan);">${videoPathFor(v.id)}</code>
      </div>
    </div>`;
}

// ---------- STATE RENDERERS ----------
function renderDailyLog(container, max = 7) {
  if (!container || !STATE?.dailyLog) return;
  const items = [...STATE.dailyLog].reverse().slice(0, max);
  if (items.length === 0) {
    container.innerHTML = '<p style="color:var(--dim);font-style:italic;">No entries yet — tell Claude what happened today and it\'ll appear here.</p>';
    return;
  }
  container.innerHTML = items.map(e =>
    `<div class="log-entry"><div class="log-date">${e.date}</div><div class="log-body">${escapeHtml(e.entry)}</div></div>`
  ).join('');
}

function renderBlockers(container) {
  if (!container || !STATE?.blockers) return;
  const items = STATE.blockers;
  if (items.length === 0) {
    container.innerHTML = '<p style="color:var(--good);">No open blockers.</p>';
    return;
  }
  container.innerHTML = items.map(b => {
    const statusClass = b.status === 'done' ? 'good' : (b.status === 'in-progress' ? 'warn' : 'bad');
    const statusLabel = b.status === 'done' ? '✓ done' : (b.status === 'in-progress' ? '⋯ in-progress' : '○ pending');
    return `<div class="blocker-row">
      <span class="pill ${statusClass}">${statusLabel}</span>
      <span class="blocker-label">${escapeHtml(b.label)}</span>
      <span class="blocker-meta">${escapeHtml(b.owner)} · due ${escapeHtml(b.due || '—')}</span>
    </div>`;
  }).join('');
}

function renderClusterKpis(container) {
  if (!container || !STATE?.metrics?.perCluster) return;
  const c = STATE.metrics.perCluster;
  container.innerHTML = Object.entries(c).map(([name, v]) => {
    const pct = v.target > 0 ? Math.min(100, Math.round((v.activated / v.target) * 100)) : 0;
    const s = statusFor(v.activated, v.target);
    return `<div class="kpi-card status-${s}">
      <div class="label">${escapeHtml(name)}</div>
      <div class="value status-${s}">${v.activated} <span style="font-size:0.55em;color:var(--dim);">/ ${v.target}</span></div>
      <div class="sub">${v.signups} signups · ${pct}% to target</div>
    </div>`;
  }).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// Health-status helper: map (value, target) -> 'bad' | 'warn' | 'good'
//   bad:  < badAbove  (default 0.25)
//   warn: badAbove .. warnAbove
//   good: >= warnAbove (default 0.75)
function statusFor(value, target, opts) {
  const o = opts || {};
  const badAbove = o.badAbove != null ? o.badAbove : 0.25;
  const warnAbove = o.warnAbove != null ? o.warnAbove : 0.75;
  if (!target || target <= 0) return 'good';
  const ratio = value / target;
  if (ratio >= warnAbove) return 'good';
  if (ratio >= badAbove) return 'warn';
  return 'bad';
}

// ---------- SCRATCHPAD + COPY-FOR-CLAUDE ----------
function initScratchpad() {
  const ta = document.getElementById('scratchpad');
  const btn = document.getElementById('copy-update-btn');
  const status = document.getElementById('copy-status');
  if (!ta || !btn) return;

  const today = new Date();
  const key = `ce.scratchpad.${dayKey(today)}`;
  ta.value = localStorage.getItem(key) || '';
  ta.addEventListener('input', () => localStorage.setItem(key, ta.value));

  btn.addEventListener('click', async () => {
    const info = stageFor(today);
    const dKey = dayKey(today);
    const done = loadDone('today', dKey);
    // Tasks may be plain strings (active-week calendar) or structured objects
    // (pre-launch checklist). For the scratchpad we want a plain label string.
    const taskLabel = (t) => (typeof t === 'string' ? t : (t && t.label) || String(t));
    const completedTasks = info.tasks.filter((_, i) => done[i]).map(taskLabel);
    const notes = ta.value.trim();

    const parts = [];
    parts.push(`[CipherExam campaign update — ${dKey}]`);
    parts.push(`Stage: ${info.label}`);
    parts.push('');
    if (completedTasks.length > 0) {
      parts.push('Tasks completed today:');
      completedTasks.forEach(t => parts.push(`- ${t}`));
      parts.push('');
    }
    if (notes) {
      parts.push('Notes:');
      parts.push(notes);
      parts.push('');
    }
    parts.push('---');
    parts.push('Please update site/data/campaign-state.json:');
    parts.push('1. Append this to dailyLog (use today\'s date)');
    parts.push('2. Update any KPI numbers I mentioned (activatedUsersTotal, trialSignupsTotal, perCluster)');
    parts.push('3. Mark any blockers as done/in-progress if I named them');
    parts.push('4. Bump _meta.lastUpdatedAt');

    const message = parts.join('\n');
    if (window.cipherAskBrad) {
      window.cipherAskBrad(message);
      if (status) { status.textContent = '✓ Sent to Brad.'; status.classList.add('good'); }
      setTimeout(() => { if (status) { status.textContent = ''; status.classList.remove('good'); } }, 4000);
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      if (status) { status.textContent = 'Brad is unavailable. Update copied as a fallback.'; status.classList.add('bad'); }
    } catch (e) {
      if (status) { status.textContent = 'Brad is unavailable. Select the update below and copy it manually.'; status.classList.add('bad'); }
      const fallback = document.getElementById('copy-fallback');
      if (fallback) { fallback.value = message; fallback.style.display = 'block'; }
    }
  });
}

// ---------- TODAY PAGE ENTRY ----------
function initTodayPage() {
  const today = new Date();
  const info = stageFor(today);
  const banner = document.getElementById('stage-banner');
  if (banner) {
    banner.innerHTML = `
      <div class="stage">${info.label}</div>
      <div class="date">${formatDateLong(today)}</div>
    `;
  }

  const todayList = document.getElementById('today-tasks');
  if (todayList) renderTaskList(todayList, info, dayKey(today), { scope: 'today' });

  // Yesterday recap
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const yInfo = stageFor(yest);
  const yList = document.getElementById('yesterday-tasks');
  if (yList) renderTaskList(yList, yInfo, dayKey(yest), { scope: 'today' });
  const ySum = document.getElementById('yesterday-summary');
  if (ySum) ySum.textContent = `Yesterday — ${weekdayName(yest)} ${yest.toLocaleDateString()}`;

  // Tomorrow preview (read-only)
  const tmrw = new Date(today); tmrw.setDate(tmrw.getDate() + 1);
  const tInfo = stageFor(tmrw);
  const tList = document.getElementById('tomorrow-tasks');
  if (tList) renderTaskList(tList, tInfo, dayKey(tmrw), { scope: 'today', readonly: true });
  const tSum = document.getElementById('tomorrow-summary');
  if (tSum) tSum.textContent = `Tomorrow — ${weekdayName(tmrw)} ${tmrw.toLocaleDateString()}`;

  // Week strip
  const strip = document.getElementById('week-strip');
  if (strip) renderWeekStrip(strip, today);

  // Paid-spend gate progress
  const gate = document.getElementById('gate-progress');
  if (gate) renderProgressBar(gate, CURRENT_ACTIVATED, ACTIVATION_GATE);
  const gateNote = document.getElementById('gate-note');
  if (gateNote) {
    if (CURRENT_ACTIVATED >= ACTIVATION_GATE) {
      gateNote.innerHTML = '<span class="pill good">UNLOCKED</span> $2/day retargeting is eligible — pick Reddit Promoted or Google Search RT.';
    } else {
      gateNote.innerHTML = `<span class="pill warn">LOCKED</span> $0 paid until ${ACTIVATION_GATE - CURRENT_ACTIVATED} more activated users land organically.`;
    }
  }

  // Live KPI cards from state
  const kpiSnap = document.getElementById('kpi-snapshot');
  if (kpiSnap) renderClusterKpis(kpiSnap);
  const stateNote = document.getElementById('state-source');
  if (stateNote && STATE?._meta?.lastUpdatedAt) {
    stateNote.textContent = `Campaign numbers last changed ${new Date(STATE._meta.lastUpdatedAt).toLocaleString()}`;
  }

  // Today's recommended video creative
  const creative = document.getElementById('today-creative');
  if (creative) renderTodayCreative(creative);

  // Daily log
  const log = document.getElementById('daily-log');
  if (log) renderDailyLog(log, 7);

  // Scratchpad
  initScratchpad();
}

// ---------- INDEX PAGE TODAY WIDGET ----------
function initIndexWidget() {
  const today = new Date();
  const info = stageFor(today);
  const widget = document.getElementById('index-today-widget');
  if (!widget) return;
  const top = info.tasks.slice(0, 3);
  let html = `<div class="meta" style="color:var(--purple);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${info.label}</div>`;
  if (top.length === 0) {
    html += '<p style="color:var(--dim);margin:0;">No tasks scheduled today.</p>';
  } else {
    html += '<ul style="margin:0 0 8px;padding-left:18px;">';
    top.forEach(t => { html += `<li style="margin-bottom:4px;">${t}</li>`; });
    html += '</ul>';
  }
  // In app.html, cipherShow exists and switches sections.
  // In a standalone page, fall back to today.html.
  html += '<a href="today.html" onclick="if(typeof cipherShow===\'function\'){cipherShow(\'today\');return false;}" style="font-size:0.88rem;font-weight:600;">Full daily view →</a>';
  widget.innerHTML = html;
}

// ---------- ENGINEERING CHECKLIST (separate localStorage scope) ----------
function initEngineeringChecklist() {
  document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(cb => {
    const key = cb.dataset.key;
    if (!key) return;
    const stored = localStorage.getItem(`ce.eng.${key}`) === '1';
    cb.checked = stored;
    applyChecklistStatus(cb);
    cb.addEventListener('change', () => {
      localStorage.setItem(`ce.eng.${key}`, cb.checked ? '1' : '0');
      applyChecklistStatus(cb);
    });
  });
}
function applyChecklistStatus(cb) {
  const item = cb.parentElement;
  item.classList.toggle('done', cb.checked);
  item.classList.toggle('status-good', cb.checked);
  item.classList.toggle('status-bad', !cb.checked);
}

// ---------- INDEX PAGE STATE RENDERERS ----------
function initIndexState() {
  const blockers = document.getElementById('index-blockers');
  if (blockers) renderBlockers(blockers);

  const log = document.getElementById('index-daily-log');
  if (log) renderDailyLog(log, 3);

  const activatedHeader = document.getElementById('index-activated-total');
  if (activatedHeader && STATE?.metrics) {
    const v = STATE.metrics.activatedUsersTotal;
    const t = STATE.campaign.activationTarget4wk;
    const s = statusFor(v, t);
    activatedHeader.className = 'status-' + s;
    activatedHeader.textContent = `${v} / ${t}`;
  }

  const gateProgress = document.getElementById('index-gate-progress');
  if (gateProgress) renderProgressBar(gateProgress, CURRENT_ACTIVATED, ACTIVATION_GATE);

  const lastUpdated = document.getElementById('index-state-updated');
  if (lastUpdated && STATE?._meta?.lastUpdatedAt) {
    lastUpdated.textContent = STATE._meta.lastUpdatedAt;
  }
}

// ---------- BOOT ----------
// Run inits via readyState check rather than DOMContentLoaded so this still
// works if the script tag is encountered after DOMContentLoaded has fired
// (some preview sandboxes inject the script late). Each init is try/caught
// so one failure can't prevent the others from running.
async function boot() {
  try { highlightNav(); } catch (e) { console.warn('highlightNav:', e); }
  try { await loadState(); } catch (e) { console.warn('loadState:', e); }
  try { if (document.getElementById('today-tasks')) initTodayPage(); } catch (e) { console.warn('initTodayPage:', e); }
  try { if (document.getElementById('index-today-widget')) initIndexWidget(); } catch (e) { console.warn('initIndexWidget:', e); }
  try { if (document.getElementById('index-blockers') || document.getElementById('index-daily-log')) initIndexState(); } catch (e) { console.warn('initIndexState:', e); }
  try { if (document.querySelector('.checklist-item')) initEngineeringChecklist(); } catch (e) { console.warn('initEngineeringChecklist:', e); }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// ---- Firebase live sync (wires up after boot so applyState is defined) ----
(function () {
  function wireFirestore() {
    var db = window._cipherDb;
    if (!db) return; // Firebase SDK not available (offline / CDN blocked)

    // Live campaign state → updates header metrics, blockers, etc.
    db.collection('campaign').doc('state').onSnapshot(function (snap) {
      if (!snap.exists) return;
      window.__CAMPAIGN_STATE__ = snap.data();
      applyState(window.__CAMPAIGN_STATE__);
      document.dispatchEvent(new CustomEvent('cipher:state-updated'));
    }, function (err) {
      console.warn('[cipher] Firestore state sync error:', err.message);
    });

    // Live posts → notifies schedule + posts tabs to re-render
    db.collection('campaign').doc('posts').onSnapshot(function (snap) {
      if (!snap.exists) return;
      window.__POSTS__ = snap.data();
      document.dispatchEvent(new CustomEvent('cipher:posts-updated'));
    }, function (err) {
      console.warn('[cipher] Firestore posts sync error:', err.message);
    });
  }

  function startAuthenticatedSync() {
    var ready = window._cipherAuthReady || Promise.reject(new Error('Operator authentication is unavailable.'));
    ready.then(wireFirestore).catch(function (err) {
      console.warn('[cipher] Firestore sync not started:', err.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAuthenticatedSync);
  } else {
    startAuthenticatedSync();
  }
})();

// ---- Grade modal (shared across schedule + posts pages) ----
(function () {
  var MODAL_HTML = ''
    + '<div id="grade-modal" class="grade-modal" aria-hidden="true">'
    +   '<div class="grade-modal-backdrop" data-grade-close></div>'
    +   '<div class="grade-modal-body" role="dialog" aria-labelledby="grade-modal-title">'
    +     '<div class="grade-modal-head">'
    +       '<h3 id="grade-modal-title">Grade post</h3>'
    +       '<button type="button" class="grade-modal-x" data-grade-close aria-label="Close">×</button>'
    +     '</div>'
    +     '<p class="grade-modal-sub" id="grade-modal-sub"></p>'
    +     '<form id="grade-form" class="grade-form">'
    +       '<div class="grade-form-section imp-field">'
    +         '<div class="grade-form-section-label">Discovery</div>'
    +         '<label>Impressions <input type="number" min="0" name="impressions" required></label>'
    +         '<label class="li-field">Members reached <input type="number" min="0" name="membersReached" placeholder="blank if not shown"></label>'
    +         '<label class="li-field">In-network % <input type="number" min="0" max="100" step="0.01" name="inNetworkPct" placeholder="e.g. 59"></label>'
    +         '<label class="li-field">Out-of-network % <input type="number" min="0" max="100" step="0.01" name="outOfNetworkPct" placeholder="e.g. 41 — expansion signal"></label>'
    +       '</div>'
    +       '<div class="grade-form-section ro-field">'
    +         '<div class="grade-form-section-label">Reddit post</div>'
    +         '<label>Upvotes <input type="number" min="0" name="upvotes" value="0"></label>'
    +         '<label>Upvote ratio (0–1) <input type="number" min="0" max="1" step="0.01" name="upvoteRatio" placeholder="e.g. 0.92 — leave blank if unknown"></label>'
    +         '<label style="grid-template-columns:auto 1fr;align-items:center;">Auto-removed by mods? <input type="checkbox" name="autoRemoved" style="width:16px;height:16px;justify-self:start;"></label>'
    +       '</div>'
    +       '<div class="grade-form-section video-field">'
    +         '<div class="grade-form-section-label">Video</div>'
    +         '<label>Video views <input type="number" min="0" name="videoViews" value="0"></label>'
    +         '<label class="li-field">Total watch time (sec) <input type="number" min="0" name="watchTimeSeconds" value="0" placeholder="4m 8s → 248"></label>'
    +         '<label>Avg watch time (sec) <input type="number" min="0" name="avgWatchTimeSeconds" value="0" placeholder="10s → 10"></label>'
    +       '</div>'
    +       '<div class="grade-form-section">'
    +         '<div class="grade-form-section-label">Engagement</div>'
    +         '<label class="li-field">Social engagements <input type="number" min="0" name="socialEngagements" value="0"></label>'
    +         '<label class="li-field">Reactions <input type="number" min="0" name="reactions" value="0"></label>'
    +         '<label class="x-field">Likes <input type="number" min="0" name="likes" value="0"></label>'
    +         '<label>Comments / replies <input type="number" min="0" name="comments" value="0"></label>'
    +         '<label class="not-ro">Reposts <input type="number" min="0" name="reposts" value="0"></label>'
    +         '<label class="li-field">Saves <input type="number" min="0" name="saves" value="0"></label>'
    +         '<label class="li-field">Sends <input type="number" min="0" name="sends" value="0"></label>'
    +         '<label class="x-field">Bookmarks <input type="number" min="0" name="bookmarks" value="0"></label>'
    +         '<label class="x-field">Detail expands <input type="number" min="0" name="detailExpands" placeholder="X only"></label>'
    +         '<label class="not-ro">Link clicks <input type="number" min="0" name="linkClicks" placeholder="LinkedIn: from GA4, else blank"></label>'
    +       '</div>'
    +       '<div class="grade-form-section ra-field">'
    +         '<div class="grade-form-section-label">Ad spend</div>'
    +         '<label>Total ad spend (USD) <input type="number" min="0" step="0.01" name="totalSpendUsd" value="0" placeholder="used for CPC penalty"></label>'
    +       '</div>'
    +       '<div class="grade-form-section">'
    +         '<div class="grade-form-section-label">Profile activity</div>'
    +         '<label class="li-field">Profile viewers from post <input type="number" min="0" name="profileViewers" value="0"></label>'
    +         '<label class="li-field">Followers gained <input type="number" min="0" name="followersGained" value="0"></label>'
    +         '<label class="x-field">Profile visits <input type="number" min="0" name="profileVisits" value="0"></label>'
    +         '<label class="x-field">Follows gained <input type="number" min="0" name="followsGained" value="0"></label>'
    +       '</div>'
    +       '<div class="grade-form-section">'
    +         '<div class="grade-form-section-label">Conversion</div>'
    +         '<label>Trial signups attributed <input type="number" min="0" name="trialSignups" value="0"></label>'
    +       '</div>'
    +       '<div class="grade-form-actions">'
    +         '<button type="submit" class="btn-primary" id="grade-submit-btn">Submit grade</button>'
    +         '<button type="button" class="btn-secondary" data-grade-close>Cancel</button>'
    +       '</div>'
    +       '<div class="grade-form-status" id="grade-form-status" aria-live="polite"></div>'
    +     '</form>'
    +   '</div>'
    + '</div>';

  var currentPostId = null;

  function ensureModal() {
    if (document.getElementById('grade-modal')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = MODAL_HTML;
    document.body.appendChild(wrap.firstChild);
  }

  function openModal(postId) {
    ensureModal();
    var posts = (window.__POSTS__ && window.__POSTS__.posts) || [];
    var post = posts.find(function (p) { return p.id === postId; });
    if (!post) { console.warn('[grade] post not found:', postId); return; }
    currentPostId = postId;
    var modal = document.getElementById('grade-modal');
    document.getElementById('grade-modal-title').textContent = 'Grade post — ' + (post.channel || '').toUpperCase() + ' · ' + (post.scheduled || '');
    var sourceLabel = ({
      'linkedin':       'LinkedIn analytics',
      'x':              'X analytics',
      'reddit-organic': 'the Reddit post (upvotes, comments, upvote ratio from the post page)',
      'reddit-ads':     'the Reddit Ads dashboard'
    })[post.channel] || 'the platform\'s analytics';
    document.getElementById('grade-modal-sub').textContent = 'Enter the metrics from ' + sourceLabel + '. Brad will grade it and write notes.';
    document.getElementById('grade-form-status').textContent = '';
    var form = document.getElementById('grade-form');
    form.reset();
    form.setAttribute('data-channel', post.channel || 'linkedin');
    if (post.video) { form.setAttribute('data-has-video', ''); } else { form.removeAttribute('data-has-video'); }
    // Reddit organic exposes no impressions — drop the required flag so the form can submit.
    var impInput = form.querySelector('input[name="impressions"]');
    if (impInput) impInput.required = (post.channel !== 'reddit-organic');
    document.getElementById('grade-submit-btn').disabled = false;
    document.getElementById('grade-submit-btn').textContent = 'Submit grade';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    var first = modal.querySelector(post.channel === 'reddit-organic' ? 'input[name="upvotes"]' : 'input[name="impressions"]');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function closeModal() {
    var modal = document.getElementById('grade-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    currentPostId = null;
  }

  async function submitGrade(form) {
    if (!currentPostId) return;
    var statusEl = document.getElementById('grade-form-status');
    var btn = document.getElementById('grade-submit-btn');
    var fd = new FormData(form);
    var posts = (window.__POSTS__ && window.__POSTS__.posts) || [];
    var post  = posts.find(function (p) { return p.id === currentPostId; });
    var channel = (post && post.channel) || 'linkedin';
    var hasVideo = !!(post && post.video);
    var metrics = {};
    if (channel === 'reddit-organic') {
      // No impressions on organic Reddit — the API grades on absolute numbers.
      metrics.upvotes              = Number(fd.get('upvotes') || 0);
      metrics.comments             = Number(fd.get('comments') || 0);
      var ratioRaw = fd.get('upvoteRatio');
      if (ratioRaw !== null && String(ratioRaw).trim() !== '') metrics.upvoteRatio = Number(ratioRaw);
      metrics.autoRemoved          = fd.get('autoRemoved') === 'on';
    } else if (channel === 'linkedin') {
      // BLANK MEANS NOT MEASURED. `Number(fd.get(x) || 0)` turned every field
      // the operator left empty into a measured zero, and the grader bands an
      // exact 0 at -1 — so not filling in a box actively lowered the grade,
      // and a blank membersReached fabricated a 0.00% reach ratio, the exact
      // zero site/data/metrics-schema.md forbids. This page is DEPLOYED
      // (posts.html is absent from firebase.json's ignore list), so it was
      // producing different letters from app.html for the same post: replaying
      // the corpus, li-thu-2026-08-07-sponsor-scenario came out A via app.html
      // and B here, and 3 more posts differed by a letter. Found 2026-08-29.
      var num = function (name) {
        var raw = fd.get(name);
        if (raw === null || String(raw).trim() === '') return null;
        var n = Number(raw);
        return Number.isFinite(n) ? n : null;
      };
      metrics.impressions          = Number(fd.get('impressions') || 0);
      metrics.membersReached       = num('membersReached');
      metrics.socialEngagements    = num('socialEngagements');
      metrics.reactions            = num('reactions');
      metrics.comments             = num('comments');
      metrics.reposts              = num('reposts');
      metrics.saves                = num('saves');
      metrics.sends                = num('sends');
      metrics.linkClicks           = num('linkClicks');
      metrics.profileViewers       = num('profileViewers');
      metrics.followersGained      = num('followersGained');
      // The network split is the strongest distribution signal the rubric has
      // and this modal never sent it, silently changing max from 6 to 4.
      metrics.inNetworkPct         = num('inNetworkPct');
      metrics.outOfNetworkPct      = num('outOfNetworkPct');
      // The grading API reads engagementActions for the engagement-rate
      // component. The parts are nullable now, so sum only what was actually
      // entered and leave it off entirely when nothing was — the server
      // derives it in that case rather than being handed a fabricated 0.
      if (metrics.socialEngagements != null && metrics.socialEngagements > 0) {
        metrics.engagementActions = metrics.socialEngagements;
      } else {
        var parts = [metrics.reactions, metrics.comments, metrics.reposts].filter(function (v) { return v != null; });
        if (parts.length) {
          metrics.engagementActions = parts.reduce(function (a, b) { return a + b; }, 0);
        }
      }
      if (hasVideo) {
        metrics.videoViews         = num('videoViews');
        metrics.watchTimeSeconds   = num('watchTimeSeconds');
        metrics.avgWatchTimeSeconds= num('avgWatchTimeSeconds');
      }
    } else if (channel === 'reddit-ads') {
      metrics.impressions          = Number(fd.get('impressions') || 0);
      metrics.comments             = Number(fd.get('comments') || 0);
      metrics.reposts              = Number(fd.get('reposts') || 0);
      metrics.linkClicks           = Number(fd.get('linkClicks') || 0);
      metrics.totalSpendUsd        = Number(fd.get('totalSpendUsd') || 0);
      metrics.engagementActions    = metrics.comments + metrics.reposts;
      if (hasVideo) {
        metrics.videoViews         = Number(fd.get('videoViews') || 0);
        metrics.avgWatchTimeSeconds= Number(fd.get('avgWatchTimeSeconds') || 0);
      }
    } else {
      metrics.impressions          = Number(fd.get('impressions') || 0);
      metrics.likes                = Number(fd.get('likes') || 0);
      metrics.replies              = Number(fd.get('comments') || 0);
      metrics.reposts              = Number(fd.get('reposts') || 0);
      metrics.bookmarks            = Number(fd.get('bookmarks') || 0);
      metrics.linkClicks           = Number(fd.get('linkClicks') || 0);
      metrics.profileVisits        = Number(fd.get('profileVisits') || 0);
      metrics.followsGained        = Number(fd.get('followsGained') || 0);
      metrics.engagementActions    = metrics.likes + metrics.replies + metrics.reposts;
      if (hasVideo) {
        metrics.videoViews         = Number(fd.get('videoViews') || 0);
        metrics.avgWatchTimeSeconds= Number(fd.get('avgWatchTimeSeconds') || 0);
      }
    }
    metrics.trialSignupsAttributed = Number(fd.get('trialSignups') || 0);
    statusEl.textContent = 'Brad is grading…';
    statusEl.className = 'grade-form-status';
    btn.disabled = true;
    btn.textContent = 'Grading…';
    try {
      var authHeaders = await window.cipherAuthHeaders();
      var res = await fetch('/api/grade', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders),
        body: JSON.stringify({ postId: currentPostId, metrics: metrics }),
      });
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || ('HTTP ' + res.status));
      statusEl.className = 'grade-form-status ok';
      statusEl.textContent = 'Graded ' + json.grade + ' — closing…';
      setTimeout(closeModal, 900);
    } catch (e) {
      console.error('[grade] submit failed:', e);
      statusEl.className = 'grade-form-status err';
      statusEl.textContent = 'Failed: ' + (e.message || 'unknown error');
      btn.disabled = false;
      btn.textContent = 'Submit grade';
    }
  }

  // Event delegation — survives any number of re-renders.
  document.addEventListener('click', function (e) {
    var reviseBtn = e.target.closest && e.target.closest('[data-revise-draft]');
    if (reviseBtn) {
      e.preventDefault();
      var reviseId = reviseBtn.getAttribute('data-revise-draft');
      var revisePost = ((window.__POSTS__ && window.__POSTS__.posts) || []).find(function (post) {
        return post.id === reviseId;
      });
      if (!revisePost) {
        window.alert('That draft could not be found. Refresh the page and try again.');
        return;
      }
      var revisePrompt = [
        'Brad, start a revision request for exactly one CipherExam draft.',
        '',
        'Selected draft:',
        '- ID: ' + (revisePost.id || '?'),
        '- Channel: ' + (revisePost.channel || '?'),
        '- Exam: ' + (revisePost.examFocus || '?'),
        '- Scheduled: ' + (revisePost.scheduled || '?'),
        '- Hook: ' + (revisePost.hook || '?'),
        '',
        'Current copy:',
        revisePost.copy || '(no copy)',
        '',
        'First ask me what I want changed. Do not revise, approve, reschedule, or alter any draft yet.',
        'After I answer, update only this draft ID, preserve its date and draft status unless I explicitly request otherwise, show me the revised copy, and wait for my approval.'
      ].join('\n');
      if (window.cipherAskBrad) {
        window.cipherAskBrad(revisePrompt);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(revisePrompt);
        window.alert('Brad is unavailable. The revision request was copied so you can paste it into Brad.');
      } else {
        window.alert('Open Brad from the right edge and identify draft ' + reviseId + '.');
      }
      return;
    }

    var openBtn = e.target.closest && e.target.closest('[data-grade-open]');
    if (openBtn) {
      e.preventDefault();
      openModal(openBtn.getAttribute('data-grade-open'));
      return;
    }
    if (e.target.matches && e.target.matches('[data-grade-close]')) {
      e.preventDefault();
      closeModal();
      return;
    }

    // Mark Posted flow — works on any tab that renders [data-sched-*] buttons.
    // Both the Schedule tab and the Posts tab use the same publish-form markup.
    var pubBtn = e.target.closest && e.target.closest('[data-sched-publish]');
    if (pubBtn) {
      e.preventDefault();
      var pid = pubBtn.getAttribute('data-sched-publish');
      var pform = document.getElementById('pub-form-' + pid);
      if (pform) {
        pform.classList.toggle('show');
        if (pform.classList.contains('show')) {
          var pinput = document.getElementById('pub-url-' + pid);
          if (pinput) setTimeout(function () { pinput.focus(); }, 50);
        }
      }
      return;
    }

    var cancelBtn = e.target.closest && e.target.closest('[data-sched-cancel]');
    if (cancelBtn) {
      e.preventDefault();
      var cid = cancelBtn.getAttribute('data-sched-cancel');
      var cform = document.getElementById('pub-form-' + cid);
      if (cform) cform.classList.remove('show');
      var cerr = document.getElementById('pub-err-' + cid);
      if (cerr) { cerr.textContent = ''; cerr.classList.remove('show'); }
      return;
    }

    var submitBtn = e.target.closest && e.target.closest('[data-sched-submit]');
    if (submitBtn) {
      e.preventDefault();
      var sid = submitBtn.getAttribute('data-sched-submit');
      var sInput = document.getElementById('pub-url-' + sid);
      var sErr   = document.getElementById('pub-err-' + sid);
      var postUrl = sInput ? sInput.value.trim() : '';
      if (!postUrl || !postUrl.startsWith('http')) {
        if (sErr) { sErr.textContent = 'Please enter a valid URL starting with http'; sErr.classList.add('show'); }
        return;
      }
      if (sErr) { sErr.textContent = ''; sErr.classList.remove('show'); }
      submitBtn.textContent = 'Saving…';
      submitBtn.disabled = true;
      var db = window._cipherDb;
      if (!db) {
        if (sErr) { sErr.textContent = 'Firebase not loaded — check your internet connection and refresh.'; sErr.classList.add('show'); }
        submitBtn.textContent = 'Mark Posted';
        submitBtn.disabled = false;
        return;
      }
      var docRef = db.collection('campaign').doc('posts');
      docRef.get()
        .then(function (snap) {
          var data = snap.data();
          var postsList = data.posts;
          var idx = postsList.findIndex(function (p) { return p.id === sid; });
          if (idx === -1) throw new Error('Post "' + sid + '" not found in Firestore');
          var now = new Date().toISOString();
          postsList[idx].status   = 'posted';
          postsList[idx].postedAt = now;
          postsList[idx].postUrl  = postUrl;
          data._meta = data._meta || {};
          data._meta.lastUpdatedAt = now;
          data._meta.lastUpdatedBy = 'dashboard mark-posted';
          return docRef.set(data);
        })
        .catch(function (err) {
          if (sErr) { sErr.textContent = 'Error: ' + (err.message || 'Firestore write failed'); sErr.classList.add('show'); }
          submitBtn.textContent = 'Mark Posted';
          submitBtn.disabled = false;
        });
      return;
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'grade-form') {
      e.preventDefault();
      submitGrade(e.target);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();

// ---- Shared grade utilities (added 2026-05-21) -------------------------------
// Used by the Posts page (avg grade summary) and the Schedule cards (Grade
// pill). Inline copies still exist in app.html / posts.html for cache-warm
// renders before site.js loads; the implementations match exactly so the
// later-declared site.js wins-but-equals when both load.

// Map A/B/C/D → numeric (4 = best). Returns 0 for any unknown grade.
function gradeToNum(g) {
  return ({ A: 4, B: 3, C: 2, D: 1 })[g] || 0;
}

// Map a numeric avg-grade (1=D … 4=A) to the matching grade-A/B/C/D CSS
// class. 0.5-band rounding so 1.5 lands in C, 2.5 in B, 3.5 in A.
function avgGradeClass(n) {
  if (n === '—' || n == null) return '';
  var v = Number(n);
  if (isNaN(v)) return '';
  if (v >= 3.5) return 'grade-A';
  if (v >= 2.5) return 'grade-B';
  if (v >= 1.5) return 'grade-C';
  if (v >   0)  return 'grade-D';
  return '';
}

// Minimal HTML escaper for safely injecting user-controlled strings into
// innerHTML.
function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
