/* Firebase operator authentication for the private Cipher Marketing dashboard. */
(function () {
  if (window.location.protocol === 'file:') {
    window._cipherAuthReady = Promise.resolve(null);

    function showLocalLaunchHelp() {
      document.documentElement.classList.add('cipher-auth-pending');
      var style = document.createElement('style');
      style.id = 'cipher-auth-styles';
      style.textContent = ''
        + 'html.cipher-auth-pending body > *:not(#cipher-auth-gate){visibility:hidden}'
        + '#cipher-auth-gate{visibility:visible;position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:#090b12;color:#f5f7ff;font-family:system-ui,sans-serif;padding:24px}'
        + '#cipher-auth-gate .auth-card{width:min(500px,100%);padding:28px;border:1px solid #2b3042;border-radius:16px;background:#121621;box-shadow:0 24px 80px rgba(0,0,0,.45)}'
        + '#cipher-auth-gate h1{font-size:1.35rem;margin:0 0 10px}'
        + '#cipher-auth-gate p{color:#aeb6ca;line-height:1.55;margin:0 0 18px}'
        + '#cipher-auth-gate strong{color:#f5f7ff}'
        + '#cipher-auth-gate button{border:0;border-radius:9px;padding:11px 15px;font-weight:700;cursor:pointer;background:#7c5cff;color:white}';
      document.head.appendChild(style);

      var gate = document.createElement('div');
      gate.id = 'cipher-auth-gate';
      gate.innerHTML = ''
        + '<div class="auth-card">'
        + '<h1>Open Cipher Marketing with its launcher</h1>'
        + '<p>This page was opened as a file, so the browser cannot load campaign data. Close this tab and double-click <strong>Open Cipher Marketing.vbs</strong> in the cipher-marketing folder.</p>'
        + '<button id="cipher-open-local" type="button">Try the running app</button>'
        + '</div>';
      document.body.appendChild(gate);
      gate.querySelector('#cipher-open-local').addEventListener('click', function () {
        window.location.href = 'http://localhost:8766/app.html';
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showLocalLaunchHelp);
    } else {
      showLocalLaunchHelp();
    }
    return;
  }

  var ADMIN_CLAIM = 'marketingAdmin';
  var readyResolve;
  var readyReject;
  var settled = false;

  window._cipherAuthReady = new Promise(function (resolve, reject) {
    readyResolve = resolve;
    readyReject = reject;
  });

  function settleReady(user) {
    if (settled) return;
    settled = true;
    readyResolve(user);
  }

  function failReady(error) {
    if (settled) return;
    settled = true;
    readyReject(error);
  }

  function ensureStyles() {
    if (document.getElementById('cipher-auth-styles')) return;
    var style = document.createElement('style');
    style.id = 'cipher-auth-styles';
    style.textContent = ''
      + 'html.cipher-auth-pending body > *:not(#cipher-auth-gate){visibility:hidden}'
      + '#cipher-auth-gate{visibility:visible;position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:#090b12;color:#f5f7ff;font-family:system-ui,sans-serif;padding:24px}'
      + '#cipher-auth-gate .auth-card{width:min(420px,100%);padding:28px;border:1px solid #2b3042;border-radius:16px;background:#121621;box-shadow:0 24px 80px rgba(0,0,0,.45)}'
      + '#cipher-auth-gate h1{font-size:1.35rem;margin:0 0 10px}'
      + '#cipher-auth-gate p{color:#aeb6ca;line-height:1.5;margin:0 0 18px}'
      + '#cipher-auth-gate button{border:0;border-radius:9px;padding:10px 14px;font-weight:700;cursor:pointer;background:#7c5cff;color:white}'
      + '#cipher-auth-gate button.secondary{margin-left:8px;background:#2b3042}'
      + '#cipher-auth-error{color:#fca5a5!important;font-size:.88rem;min-height:1.3em;margin-top:12px!important}';
    document.head.appendChild(style);
  }

  function ensureGate() {
    ensureStyles();
    document.documentElement.classList.add('cipher-auth-pending');
    var gate = document.getElementById('cipher-auth-gate');
    if (gate) return gate;
    gate = document.createElement('div');
    gate.id = 'cipher-auth-gate';
    gate.innerHTML = ''
      + '<div class="auth-card">'
      + '<h1>Cipher Marketing operator access</h1>'
      + '<p id="cipher-auth-message">Sign in with the Google account authorized to manage this dashboard.</p>'
      + '<button id="cipher-auth-sign-in" type="button">Sign in with Google</button>'
      + '<button id="cipher-auth-sign-out" class="secondary" type="button" hidden>Sign out</button>'
      + '<p id="cipher-auth-error" role="alert"></p>'
      + '</div>';
    document.body.appendChild(gate);
    return gate;
  }

  function setGateState(message, error, denied) {
    var gate = ensureGate();
    gate.querySelector('#cipher-auth-message').textContent = message;
    gate.querySelector('#cipher-auth-error').textContent = error || '';
    gate.querySelector('#cipher-auth-sign-in').hidden = !!denied;
    gate.querySelector('#cipher-auth-sign-out').hidden = !denied;
  }

  function unlock() {
    document.documentElement.classList.remove('cipher-auth-pending');
    var gate = document.getElementById('cipher-auth-gate');
    if (gate) gate.remove();
  }

  async function requireAdmin(forceRefresh) {
    var auth = window._cipherAuth;
    if (!auth) throw new Error('Firebase Authentication is unavailable.');
    var user = auth.currentUser;
    if (!user) throw new Error('Operator sign-in required.');
    var tokenResult = await user.getIdTokenResult(!!forceRefresh);
    if (tokenResult.claims[ADMIN_CLAIM] !== true) {
      throw new Error('This account is not authorized for Cipher Marketing.');
    }
    return user;
  }

  async function bootstrapAdmin(user) {
    var response = await fetch('/api/operator/bootstrap', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + await user.getIdToken() }
    });
    var result = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(result.error || 'This account is not authorized for Cipher Marketing.');
    }
    await user.getIdToken(true);
    return requireAdmin(true);
  }

  function completeAuthorization(user) {
    unlock();
    settleReady(user);
    document.dispatchEvent(new CustomEvent('cipher:operator-ready', { detail: { uid: user.uid } }));
  }

  window.cipherRequireAdmin = requireAdmin;
  window.cipherAuthHeaders = async function () {
    var user = await requireAdmin(false);
    return { Authorization: 'Bearer ' + await user.getIdToken() };
  };

  async function start() {
    ensureGate();
    var auth = window._cipherAuth;
    if (!auth) {
      var unavailable = new Error('Firebase Authentication failed to initialize.');
      setGateState('Operator access is unavailable.', unavailable.message, false);
      failReady(unavailable);
      return;
    }

    var gate = document.getElementById('cipher-auth-gate');
    gate.querySelector('#cipher-auth-sign-in').addEventListener('click', async function () {
      try {
        gate.querySelector('#cipher-auth-error').textContent = '';
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await auth.signInWithPopup(provider);
      } catch (error) {
        setGateState('Sign in with the authorized Google account.', error.message, false);
      }
    });
    gate.querySelector('#cipher-auth-sign-out').addEventListener('click', async function () {
      await auth.signOut();
      window.location.reload();
    });

    auth.onAuthStateChanged(async function (user) {
      if (!user) {
        setGateState('Sign in with the Google account authorized to manage this dashboard.', '', false);
        return;
      }
      try {
        try {
          await requireAdmin(true);
        } catch {
          await bootstrapAdmin(user);
        }
        completeAuthorization(user);
      } catch (error) {
        setGateState(
          'Signed in as ' + (user.email || user.uid) + ', but this account is not authorized.',
          error.message || 'Use one of the approved Google accounts.',
          true
        );
      }
    });
  }

  document.documentElement.classList.add('cipher-auth-pending');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
