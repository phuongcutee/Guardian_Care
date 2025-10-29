// Shared JavaScript across all pages
document.addEventListener('DOMContentLoaded', () => {
    // Auth Modal Handling
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    loginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    registerBtn.addEventListener('click', () => {
        registerModal.classList.remove('hidden');
    });

    closeLoginModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    closeRegisterModal.addEventListener('click', () => {
        registerModal.classList.add('hidden');
    });

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
        if (e.target === registerModal) {
            registerModal.classList.add('hidden');
        }
    });

    // Firebase Auth Handling
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    alert(error.message);
                });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
            
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // v7: create user doc on register
                    try {
                      if (firebase.firestore){
                        var db = firebase.firestore();
                        var u = userCredential.user;
                        db.collection('users').doc(u.uid).set({ uid: u.uid, email: u.email, active: false }, { merge: true });
                      }
                    } catch(e){ console.warn('create user doc failed', e); }
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    alert(error.message);
                });
        });
    }
});
function __gc_extractYouTubeId(input){
  if (!input) return "";
  try {
    // Nếu input không bắt đầu bằng http(s), coi như là ID
    if (!/^https?:\/\//i.test(input)) return input;
    const u = new URL(input);
    // youtu.be/<id>
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//,'').split('/')[0];
      if (id) return id;
    }
    // youtube.com/watch?v=<id>
    const v = u.searchParams.get('v');
    if (v) return v;
    // youtube.com/embed/<id>
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('embed');
    if (idx >= 0 && parts[idx+1]) return parts[idx+1];
  } catch(e){}
  return input;
}

// Firebase init guard (v8)
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps || !firebase.apps.length) {
      if (window.firebaseConfig) {
        firebase.initializeApp(window.firebaseConfig);
      }
    }
  }
} catch(e) { console.warn('Firebase init guard error:', e); }


// Dashboard auth & UI
const onReady = () => {
  const logoutEl = document.getElementById('logoutBtn');
  if (logoutEl) {
    logoutEl.addEventListener('click', () => {
      try {
        firebase.auth().signOut().then(() => {
          window.location.href = 'index.html';
        }).catch(err => alert(err.message));
      } catch (e) {
        alert(e.message || e);
      }
    });
  }
  if (window.location.pathname.endsWith('dashboard.html')) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        window.location.href = 'index.html';
      } else {
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = user.displayName || user.email || 'User';
      }
    });
  }
  const lastCheckEl = document.getElementById('lastCheck');
  const alertsCountEl = document.getElementById('alertsCount');
  if (lastCheckEl) {
    const updateCheck = () => {
      const mins = Math.max(1, Math.round((Date.now() - (window.__lastCheckTs || (Date.now() - 5*60*1000))) / 60000));
      lastCheckEl.textContent = `${mins} min ago`;
      window.__lastCheckTs = Date.now();
    };
    updateCheck();
    setInterval(updateCheck, 15*1000);
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) updateCheck(); });
    // v9: Last Check booster
  }
  if (alertsCountEl) {
    const n = Number(localStorage.getItem('alertsCount') || '0');
    alertsCountEl.textContent = String(n);
  }
  const remainEl = document.getElementById('toolRemain');
  const setTestBtn = document.getElementById('setDemoExpiry');
  if (remainEl) {
    const renderRemain = () => {
      const expiry = Number(localStorage.getItem('tool_expiry') || '0');
      if (!expiry) { remainEl.textContent = 'Free plan (no expiry set)'; return; }
      const ms = expiry - Date.now();
      if (ms <= 0) { remainEl.textContent = 'Expired'; }
      else {
        const d = Math.floor(ms/86400000);
        const h = Math.floor((ms%86400000)/3600000);
        const m = Math.floor((ms%3600000)/60000);
        remainEl.textContent = `${d}d ${h}h ${m}m remaining`;
      }
    };
    renderRemain();
    setInterval(renderRemain, 60000);
    if (setTestBtn) {
      setTestBtn.addEventListener('click', () => {
        const hours = prompt('Set expiry in hours from now:', '72');
        const hrs = Number(hours||'0');
        localStorage.setItem('tool_expiry', String(Date.now() + hrs*3600000));
        renderRemain();
      });
    }
  }
};
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(onReady, 0);
} else {
  document.addEventListener('DOMContentLoaded', onReady);
}


// Pricing QR modal handlers
(function(){
  const modal = document.getElementById('qrModal');
  if (!modal) return;
  const openBtns = Array.from(document.querySelectorAll('button[data-plan]'));
  const title = document.getElementById('qrTitle');
  const img = document.getElementById('qrImage');
  const feat = document.getElementById('planFeatures');
  const closeEls = [document.getElementById('qrClose'), document.getElementById('qrOk')];

  const FEATURES = {
    free: ['Basic dashboard', 'Community support'],
    monthly: ['24/7 monitoring', 'Priority support', 'Email alerts'],
    yearly: ['All monthly features', '2 months free', 'Priority SLA']
  };

  function setPlan(plan){
    if (plan === 'monthly') {
      title.textContent = 'Monthly — 69.000đ/tháng';
      img.src = 'assets/qr_monthly.png';
    } else if (plan === 'yearly') {
      title.textContent = 'Yearly — 690.000đ/năm';
      img.src = 'assets/qr_yearly.png';
    } else {
      title.textContent = 'Free';
      img.src = 'assets/qr.png';
    }
    const list = FEATURES[plan] || [];
    feat.innerHTML = '<ul class="list-disc pl-5">' + list.map(i=>`<li>${i}</li>`).join('') + '</ul>';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      setPlan(plan);
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });
  closeEls.forEach(el => el && el.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
})();


// Emergency Test handler
(function(){
  const btn = document.getElementById('testEmergencyBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const user = (firebase && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser : null;
    const payload = {
      type: 'EMERGENCY_TEST',
      when: new Date().toISOString(),
      user: user ? (user.email || user.uid) : 'anonymous'
    };
    try {
      if (window.ALERT_EMAIL_ENDPOINT) {
        await fetch(window.ALERT_EMAIL_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      } else {
        window.location.href = 'mailto:support@guardian.care?subject=Emergency%20Test&body=' + encodeURIComponent(JSON.stringify(payload, null, 2));
      }
    } catch(e){ console.warn('Email alert failed', e); }
    try {
      if (window.ALERT_TELEGRAM_ENDPOINT) {
        await fetch(window.ALERT_TELEGRAM_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      } else {
        alert('Telegram endpoint chưa cấu hình. Đặt window.ALERT_TELEGRAM_ENDPOINT trong alerts-config.js');
      }
    } catch(e){ console.warn('Telegram alert failed', e); }
    alert('Emergency test triggered.');
  });
})();


// Demo modal (YouTube)
(function(){
  const open = document.getElementById('openDemoBtn');
  const modal = document.getElementById('demoModal');
  const close = document.getElementById('closeDemoBtn');
  const frame = document.getElementById('demoFrame');
  const makeURL = (id) => id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : '';
  if (!modal) return;
  function show(){ 
    if (!window.DEMO_YT_ID) { alert('Chưa cấu hình DEMO_YT_ID trong alerts-config.js'); }
    frame.src = makeURL(window.DEMO_YT_ID || '');
    modal.classList.remove('hidden'); 
    modal.classList.add('flex'); 
  }
  function hide(){ 
    frame.src = '';
    modal.classList.add('hidden'); 
    modal.classList.remove('flex'); 
  }
  if (open) open.addEventListener('click', show);
  if (close) close.addEventListener('click', hide);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) hide(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hide(); });
})();


// ===== Demo video helpers =====
(function(){
  function toEmbedUrl(input){
    if (!input) return "";
    // If it's already an embed URL
    if (input.includes("/embed/")) return input;
    // Extract ID from full watch URL
    var id = "";
    try {
      var u = new URL(input, window.location.origin);
      id = u.searchParams.get("v") || "";
      // preserve extra params except v
      u.pathname = "/embed/" + (id || input);
      u.searchParams.delete("v");
      return u.origin + u.pathname + (u.search ? u.search : "");
    } catch(e){
      // maybe input is a bare ID
      return "https://www.youtube.com/embed/" + input;
    }
  }
  // Locate/create persistent section
  function ensureDemoSection(){
    // v9: if page already has an embedded product demo, do not inject a duplicate
    if (document.getElementById('productDemoFrame') || document.getElementById('demoModal')) {
      return document.getElementById('demoVideoSection') || ({});
    }
    var sec = document.getElementById('demoVideoSection');
    if (!sec){
      // inject right before Features or at end of hero
      var hero = document.getElementById('hero') || document.body;
      var container = document.createElement('section');
      container.id = 'demoVideoSection';
      container.className = 'py-8 bg-white hidden';
      container.innerHTML = [
        '<div class="container mx-auto px-6">',
        '  <h2 class="text-2xl font-bold mb-4">Product Demo</h2>',
        '  <div class="relative" style="padding-top:56.25%">',
        '    <iframe id="demoVideoFrame" class="absolute inset-0 w-full h-full" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
        '  </div>',
        '</div>'
      ].join('');
      hero.parentNode.insertBefore(container, hero.nextSibling);
      sec = container;
    }
    return sec;
  }

  function showPersistentDemo(){
    var sec = ensureDemoSection();
    var frame = document.getElementById('demoVideoFrame');
    var url = window.DEMO_YT_URL || window.DEMO_YT || window.DEMO_YT_ID || "";
    frame.src = toEmbedUrl(url);
    sec.classList.remove('hidden');
  }
  function hidePersistentDemo(){
    var sec = document.getElementById('demoVideoSection');
    var frame = document.getElementById('demoVideoFrame');
    if (frame) frame.src = "";
    if (sec) sec.classList.add('hidden');
  }

  // Hide the old modal trigger/button if present
  var oldBtn = document.getElementById('openDemoBtn');
  if (oldBtn) oldBtn.style.display = 'none';

  // Hook into Firebase auth to toggle demo section
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(function(user){
        if (user) showPersistentDemo();
        else hidePersistentDemo();
      });
    }
  } catch(e){ console.warn('Auth hook error', e); }
})();

// v7: Global Subscription modal (inject-on-demand)
window.__openSubscriptionModal = function(){
  var id = 'subscriptionModal';
  var m = document.getElementById(id);
  if (!m){
    m = document.createElement('div');
    m.id = id;
    m.className = 'fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-50';
    m.innerHTML = [
      '<div class="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">',
      '  <div class="flex justify-between items-center px-4 py-3 border-b">',
      '    <h3 class="text-lg font-semibold">Subscription</h3>',
      '    <button id="closeSubBtn" class="text-gray-500 hover:text-black">&times;</button>',
      '  </div>',
      '  <div class="p-4 space-y-3">',
      '    <div class="flex justify-between"><span class="font-medium">Current Plan</span><span id="subPlan" class="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">...</span></div>',
      '    <div class="flex justify-between"><span class="font-medium">Expiry</span><span id="subExpiry">...</span></div>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(m);
  }
  function setText(id, text){ var el = document.getElementById(id); if (el) el.textContent = text; }
  function fmtDate(d){
    if (!d) return '—';
    try { var x = (d instanceof Date) ? d : new Date(d); return x.toISOString().slice(0,10); } catch(e){ return String(d); }
  }
  // Defaults
  var plan = window.BILLING_DEFAULT_PLAN || 'Free';
  var exp = window.BILLING_DEFAULT_EXPIRY || null;

  // Try Firestore if available
  try {
    var user = (firebase && firebase.auth) ? firebase.auth().currentUser : null;
    if (user && firebase.firestore) {
      var db = firebase.firestore();
      db.collection('subscriptions').doc(user.uid).get().then(function(doc){
        if (doc.exists){
          var data = doc.data() || {};
          setText('subPlan', data.plan || plan);
          setText('subExpiry', fmtDate(data.expiry || exp));
        } else {
          setText('subPlan', plan);
          setText('subExpiry', fmtDate(exp));
        }
      }).catch(function(){
        setText('subPlan', plan);
        setText('subExpiry', fmtDate(exp));
      });
    } else {
      setText('subPlan', plan);
      setText('subExpiry', fmtDate(exp));
    }
  } catch(e){
    setText('subPlan', plan);
    setText('subExpiry', fmtDate(exp));
  }

  m.classList.remove('hidden'); m.classList.add('flex');
  var close = document.getElementById('closeSubBtn');
  if (close) close.onclick = function(){ m.classList.add('hidden'); m.classList.remove('flex'); };
};

// v7: Global Live Demo modal (stub)
window.__openLiveDemoModal = function(){
  var id = 'liveDemoModal';
  var m = document.getElementById(id);
  if (!m){
    m = document.createElement('div');
    m.id = id;
    m.className = 'fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-50';
    m.innerHTML = [
      '<div class="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">',
      '  <div class="flex justify-between items-center px-4 py-3 border-b">',
      '    <h3 class="text-lg font-semibold">Live Demo</h3>',
      '    <button id="closeLiveBtn" class="text-gray-500 hover:text-black">&times;</button>',
      '  </div>',
      '  <div class="p-4 space-y-3">',
      '    <p class="text-sm text-gray-600">Tính năng đang phát triển: Quản lý & coi key, coi IP camera.</p>',
      '    <div class="grid grid-cols-1 gap-3">',
      '      <button id="btnManageKeys" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-left">Manage / View Keys</button>',
      '      <button id="btnViewIpCam" class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-left">View IP Camera</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(m);
  }
  m.classList.remove('hidden'); m.classList.add('flex');
  var close = document.getElementById('closeLiveBtn');
  if (close) close.onclick = function(){ m.classList.add('hidden'); m.classList.remove('flex'); };
};
