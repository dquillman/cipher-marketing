(function () {
  "use strict";

  var DATA = window.CIPHER_OUTREACH_DATA;
  var STORAGE_KEY = "cipher-outreach-ops-v1";
  var state = loadState();

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function loadState() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderSummary();
    renderNextAction();
  }

  function targetState(id) {
    state.targets = state.targets || {};
    state.targets[id] = state.targets[id] || { stage: "not_started", visits: 0, trials: 0, activations: 0, cost: 0 };
    return state.targets[id];
  }

  function addBusinessDays(date, days) {
    var result = new Date(date);
    var remaining = days;
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) remaining -= 1;
    }
    return result.toISOString().slice(0, 10);
  }

  function copyText(text, statusId, message) {
    var done = function () {
      var status = document.getElementById(statusId);
      if (status) {
        status.textContent = message;
        setTimeout(function () { status.textContent = ""; }, 2600);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text); done();
    }
  }

  function fallbackCopy(text) {
    var box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    document.execCommand("copy");
    box.remove();
  }

  function renderSummary() {
    if (!DATA) return;
    var contacted = 0, replies = 0, published = 0, activations = 0;
    DATA.targets.forEach(function (target) {
      var current = targetState(target.id);
      if (["sent", "follow_up", "responded", "published", "closed"].indexOf(current.stage) >= 0) contacted += 1;
      if (["responded", "published", "closed"].indexOf(current.stage) >= 0) replies += 1;
      if (current.stage === "published") published += 1;
      activations += Number(current.activations || 0);
    });
    setText("outreach-contacted", contacted);
    setText("outreach-replies", replies);
    setText("outreach-published", published);
    setText("outreach-activations", activations);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderNextAction() {
    var title = document.getElementById("outreach-next-title");
    var detail = document.getElementById("outreach-next-detail");
    if (!title || !detail || !DATA) return;
    state.checks = state.checks || {};
    var incomplete = DATA.workflow.find(function (item) { return !state.checks[item.id]; });
    if (incomplete) {
      title.textContent = incomplete.label;
      detail.textContent = incomplete.help;
      return;
    }
    var kiyoo = targetState("kiyoo");
    if (kiyoo.stage === "not_started") {
      title.textContent = "Prepare the Kiyoo outreach";
      detail.textContent = "Copy the draft, personalize it, and move it to Approval needed. The page will not send it.";
      return;
    }
    var follow = DATA.targets.find(function (target) {
      var current = targetState(target.id);
      return current.stage === "sent" && current.followUpDate && current.followUpDate <= new Date().toISOString().slice(0, 10);
    });
    if (follow) {
      title.textContent = "Follow up with " + follow.name;
      detail.textContent = "The seven-business-day follow-up window has arrived. Send one follow-up, then stop unless they respond.";
      return;
    }
    title.textContent = "Review the active outreach pipeline";
    detail.textContent = "Update replies, visits, trials and activations. Activated users—not backlink count—decide what continues.";
  }

  function renderWorkflow() {
    var container = document.getElementById("outreach-workflow");
    if (!container || !DATA) return;
    state.checks = state.checks || {};
    container.innerHTML = DATA.workflow.map(function (item) {
      return '<label class="outreach-check">' +
        '<input type="checkbox" data-outreach-check="' + esc(item.id) + '"' + (state.checks[item.id] ? " checked" : "") + '>' +
        '<span><strong>' + esc(item.label) + '</strong><small>' + esc(item.help) + '</small></span></label>';
    }).join("");
  }

  function renderAds() {
    var container = document.getElementById("outreach-ad-evidence");
    if (!container || !DATA) return;
    container.innerHTML = DATA.adRecords.map(function (item) {
      return '<article><strong>' + esc(item.count) + '</strong><b>' + esc(item.competitor) + '</b><p>' + esc(item.scope) + '</p>' +
        '<p>' + esc(item.interpretation) + '</p><a href="' + esc(item.url) + '" target="_blank" rel="noopener">Open evidence ↗</a></article>';
    }).join("");
  }

  function renderChannels() {
    var body = document.getElementById("outreach-channel-body");
    if (!body || !DATA) return;
    body.innerHTML = DATA.channels.map(function (item) {
      return '<tr><td><strong>' + esc(item.name) + '</strong><br><span class="muted">' + esc(item.type) + '</span></td><td>' +
        esc(item.confirmed) + '</td><td>' + esc(item.implication) + '</td></tr>';
    }).join("");
  }

  function options(selected) {
    var stages = [
      ["not_started", "Not started"], ["researching", "Researching"], ["ready", "Draft ready"],
      ["approval_needed", "Approval needed"], ["approved", "Approved by Dave"], ["sent", "Sent manually"],
      ["follow_up", "Follow-up sent"], ["responded", "Responded"], ["published", "Published"], ["closed", "Closed"]
    ];
    var canMarkSent = ["approved", "sent", "follow_up", "responded", "published", "closed"].indexOf(selected) >= 0;
    return stages.map(function (stage) {
      var disabled = stage[0] === "sent" && !canMarkSent ? " disabled" : "";
      return '<option value="' + stage[0] + '"' + (selected === stage[0] ? " selected" : "") + disabled + '>' + stage[1] + '</option>';
    }).join("");
  }

  function renderTargets(filter) {
    var container = document.getElementById("outreach-targets");
    if (!container || !DATA) return;
    var targets = DATA.targets.filter(function (target) { return !filter || filter === "all" || target.lane === filter; });
    if (!targets.length) {
      container.innerHTML = '<div class="outreach-empty">No targets in this lane.</div>';
      return;
    }
    container.innerHTML = targets.map(function (target) {
      var current = targetState(target.id);
      var score = target.score == null ? "—" : target.score;
      return '<article class="outreach-card" data-lane="' + esc(target.lane) + '">' +
        '<div class="outreach-card-head"><div class="outreach-rank">' + esc(target.rank) + '</div><div><h3>' + esc(target.name) + '</h3><div class="audience">' + esc(target.audience) + '</div></div>' +
        '<div class="outreach-score"><strong>' + esc(score) + '</strong><span>fit score</span></div></div>' +
        '<div class="outreach-badges"><span class="outreach-badge">' + esc(target.laneLabel) + '</span><span class="outreach-badge verdict">' + esc(target.verdict) + '</span>' +
        (current.followUpDate ? '<span class="outreach-badge">Follow up ' + esc(current.followUpDate) + '</span>' : "") + '</div>' +
        '<div class="outreach-card-grid"><div><b>Evidence</b><span>' + esc(target.evidence) + '</span></div><div><b>Pitch</b><span>' + esc(target.pitch) + '</span></div></div>' +
        '<div class="outreach-controls"><select aria-label="Outreach stage for ' + esc(target.name) + '" data-outreach-stage="' + esc(target.id) + '">' + options(current.stage) + '</select>' +
        '<button type="button" class="secondary" data-copy-draft="' + esc(target.id) + '">Copy draft</button>' +
        '<button type="button" class="secondary" data-copy-utm="' + esc(target.id) + '">Copy UTM</button>' +
        '<a href="' + esc(target.contactUrl) + '" target="_blank" rel="noopener">Open contact ↗</a></div>' +
        '<div class="outreach-tracking">' + metricInput(target.id, "visits", "Visits", current.visits) + metricInput(target.id, "trials", "Trials", current.trials) +
        metricInput(target.id, "activations", "Activations", current.activations) + metricInput(target.id, "cost", "Cost $", current.cost) +
        '<label>First contact<input type="date" data-outreach-metric="firstContact" data-target="' + esc(target.id) + '" value="' + esc(current.firstContact || "") + '"></label></div>' +
        '<div class="outreach-status" id="outreach-status-' + esc(target.id) + '" aria-live="polite"></div></article>';
    }).join("");
  }

  function metricInput(id, field, label, value) {
    var step = field === "cost" ? "0.01" : "1";
    return '<label>' + esc(label) + '<input type="number" min="0" step="' + step + '" data-outreach-metric="' + esc(field) + '" data-target="' + esc(id) + '" value="' + esc(value || 0) + '"></label>';
  }

  function renderRejects() {
    var container = document.getElementById("outreach-reject");
    if (!container || !DATA) return;
    container.innerHTML = DATA.reject.map(function (item) {
      return '<div><strong>' + esc(item.name) + (item.score == null ? "" : " · " + esc(item.score)) + '</strong><span>' + esc(item.reason) + '</span></div>';
    }).join("");
  }

  function renderGuardrails() {
    var container = document.getElementById("outreach-guardrails");
    if (!container || !DATA) return;
    container.innerHTML = DATA.guardrails.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join("");
  }

  function bindEvents() {
    document.addEventListener("change", function (event) {
      var checkId = event.target.getAttribute("data-outreach-check");
      if (checkId) {
        state.checks = state.checks || {};
        state.checks[checkId] = event.target.checked;
        saveState();
        return;
      }
      var stageId = event.target.getAttribute("data-outreach-stage");
      if (stageId) {
        var current = targetState(stageId);
        if (event.target.value === "sent" && current.stage !== "approved") {
          event.target.value = current.stage;
          var blockedStatus = document.getElementById("outreach-status-" + stageId);
          if (blockedStatus) blockedStatus.textContent = "Move this to Approved by Dave before recording a manual send.";
          return;
        }
        current.stage = event.target.value;
        if (event.target.value === "sent" && !current.firstContact) {
          current.firstContact = new Date().toISOString().slice(0, 10);
          current.followUpDate = addBusinessDays(new Date(), 7);
        }
        saveState();
        renderTargets(activeFilter());
        return;
      }
      var metric = event.target.getAttribute("data-outreach-metric");
      var targetId = event.target.getAttribute("data-target");
      if (metric && targetId) {
        var target = targetState(targetId);
        target[metric] = metric === "firstContact" ? event.target.value : Number(event.target.value || 0);
        if (metric === "firstContact" && event.target.value) target.followUpDate = addBusinessDays(new Date(event.target.value + "T12:00:00"), 7);
        saveState();
      }
    });

    document.addEventListener("click", function (event) {
      var filterButton = event.target.closest("[data-outreach-filter]");
      if (filterButton) {
        document.querySelectorAll("[data-outreach-filter]").forEach(function (button) { button.classList.remove("active"); });
        filterButton.classList.add("active");
        renderTargets(filterButton.getAttribute("data-outreach-filter"));
        return;
      }
      var draftId = event.target.getAttribute("data-copy-draft");
      if (draftId) {
        var draftTarget = DATA.targets.find(function (item) { return item.id === draftId; });
        if (draftTarget) copyText(draftTarget.draft + "\n\n" + draftTarget.utm, "outreach-status-" + draftId, "Draft and tracking URL copied. Review before sending.");
        return;
      }
      var utmId = event.target.getAttribute("data-copy-utm");
      if (utmId) {
        var utmTarget = DATA.targets.find(function (item) { return item.id === utmId; });
        if (utmTarget) copyText(utmTarget.utm, "outreach-status-" + utmId, "Tracking URL copied.");
      }
    });
  }

  function activeFilter() {
    var active = document.querySelector("[data-outreach-filter].active");
    return active ? active.getAttribute("data-outreach-filter") : "all";
  }

  function init() {
    if (!DATA || !document.getElementById("outreach-page")) return;
    setText("outreach-research-date", DATA.researchedAt);
    setText("outreach-gauntlet-status", DATA.gauntletStatus);
    setText("outreach-summary", DATA.summary);
    renderWorkflow();
    renderAds();
    renderChannels();
    renderTargets("all");
    renderRejects();
    renderGuardrails();
    renderSummary();
    renderNextAction();
    bindEvents();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
