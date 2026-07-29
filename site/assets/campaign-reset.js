/* Recoverable full-campaign reset control. */
(function () {
  var CONFIRMATION = 'RESET CAMPAIGN';

  function validDate(startDate) {
    var parts = startDate.split('-').map(Number);
    var parsed = parts.length === 3 ? new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])) : null;
    return /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      && parsed
      && parsed.getUTCFullYear() === parts[0]
      && parsed.getUTCMonth() === parts[1] - 1
      && parsed.getUTCDate() === parts[2];
  }

  function clearCampaignBrowserState() {
    var keys = [];
    for (var i = 0; i < localStorage.length; i += 1) {
      var key = localStorage.key(i);
      if (key && key.indexOf('ce.') === 0 && key !== 'ce.fx') keys.push(key);
    }
    keys.forEach(function (key) { localStorage.removeItem(key); });
  }

  function requestId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID().replace(/-/g, '_');
    }
    return 'reset_' + Date.now() + '_' + Math.random().toString(36).slice(2, 14);
  }

  function init() {
    var form = document.getElementById('campaign-reset-form');
    var input = document.getElementById('campaign-reset-start');
    var confirmation = document.getElementById('campaign-reset-confirmation');
    var acknowledgement = document.getElementById('campaign-reset-ack');
    var status = document.getElementById('campaign-reset-status');
    if (!form || !input || !confirmation || !acknowledgement || !status || form.dataset.ready === 'true') return;
    form.dataset.ready = 'true';

    var today = new Date();
    var nextMonday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    var daysUntilMonday = (8 - nextMonday.getUTCDay()) % 7 || 7;
    nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
    input.value = nextMonday.toISOString().slice(0, 10);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var startDate = input.value;
      if (!validDate(startDate)) {
        status.textContent = 'Choose a valid start date.';
        status.className = 'status-bad';
        return;
      }
      if (!acknowledgement.checked || confirmation.value.trim() !== CONFIRMATION) {
        status.textContent = 'Check the acknowledgement and type ' + CONFIRMATION + '.';
        status.className = 'status-bad';
        return;
      }

      var message = 'Archive the current campaign and replace ALL campaign data with the new PMP campaign starting '
        + startDate + '?\n\nThis resets posts, grades, metrics, funnel, sprint, logs, schedules, campaign decisions, and competitor reports. Operator access and app code are preserved.';
      if (!window.confirm(message)) return;

      var authHeaders;
      try {
        authHeaders = await window.cipherAuthHeaders();
      } catch (authError) {
        status.textContent = 'Reset failed: ' + authError.message;
        status.className = 'status-bad';
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      status.textContent = 'Archiving the current campaign and creating the new plan...';
      status.className = '';

      try {
        var response = await fetch('/api/campaign/reset', {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders),
          body: JSON.stringify({
            startDate: startDate,
            confirmation: CONFIRMATION,
            requestId: requestId()
          })
        });
        var result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Reset request failed.');

        clearCampaignBrowserState();
        status.textContent = 'Reset complete. Recovery archive: ' + result.archiveId + '. Reloading...';
        status.className = 'status-good';
        setTimeout(function () { window.location.reload(); }, 1100);
      } catch (error) {
        status.textContent = 'Reset failed safely: ' + (error.message || 'unknown error');
        status.className = 'status-bad';
        button.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
