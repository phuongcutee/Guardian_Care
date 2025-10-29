// Admin-only activation panel (v7.1) — with config-wait + diagnostics
(function(){
  window.__ADMIN_PATCH_V7 = '1.1.0';
  if (!window.ADMIN_EMAILS) window.ADMIN_EMAILS = [];
  const norm = (s)=> (s||'').trim().toLowerCase();
  function normGmailLike(email){
    email = norm(email);
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    // For Gmail/Googlemail, ignore dots and plus suffix
    if (domain === 'gmail.com' || domain === 'googlemail.com'){
      const noPlus = local.split('+')[0] || '';
      const noDots = noPlus.replace(/\./g,'');
      return noDots + '@' + domain;
    }
    return email;
  }


  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  async function waitForConfig(maxMs=3000){
    const started = Date.now();
    while(Date.now()-started < maxMs){
      if (Array.isArray(window.ADMIN_EMAILS) || window.__APP_CONFIG_READY) return true;
      await sleep(100);
    }
    return false;
  }

  async function isAdmin(user){
    if (window.FORCE_ADMIN === true) { console.warn('[admin] FORCE_ADMIN enabled — bypassing checks'); return !!user; }
    const email = norm(user && user.email);
    console.log('[admin] signed-in email =', email, 'uid =', user && user.uid, 'patch', window.__ADMIN_PATCH_V7);

    try{
      // 1) Allowlist from app-config.js
      const allow = (window.ADMIN_EMAILS||[]).map(norm);
      console.log('[admin] allowlist =', allow);
      if (email && allow.includes(email)) { console.log('[admin] ✔ allowlist match'); return true; }
      // gmail-normalized comparison
      const allowG = (window.ADMIN_EMAILS||[]).map(normGmailLike);
      const emailG = normGmailLike(email);
      if (emailG && allowG.includes(emailG)) { console.log('[admin] ✔ allowlist gmail-normalized'); return true; }

      // 2) Custom claims
      if (user && user.getIdTokenResult) {
        try {
          const token = await user.getIdTokenResult(true);
          console.log('[admin] claims =', token && token.claims);
          if (token && token.claims && token.claims.admin === true) { console.log('[admin] ✔ custom claim match'); return true; }
        } catch(e){ console.warn('[admin] custom-claims check failed', e); }
      }

      // 3) Firestore `admins` collection
      if (firebase && firebase.firestore){
        const db = firebase.firestore();
        try{
          const byEmail = email ? await db.collection('admins').doc(email).get() : {exists:false};
          console.log('[admin] admins/<email> exists =', byEmail.exists);
          if (byEmail.exists) { console.log('[admin] ✔ admins by email'); return true; }
        }catch(e){ console.warn('[admin] admins by email error', e); }
        try{
          const byUid = user && user.uid ? await db.collection('admins').doc(user.uid).get() : {exists:false};
          console.log('[admin] admins/<uid> exists =', byUid.exists);
          if (byUid.exists) { console.log('[admin] ✔ admins by uid'); return true; }
        }catch(e){ console.warn('[admin] admins by uid error', e); }
      }else{
        console.warn('[admin] Firestore not loaded');
      }
    } catch(e){ console.warn('[admin] isAdmin error', e); }
    return false;
  }

  function deny(msg){
    console.warn('[admin] deny:', msg);
    const g = document.getElementById('adminGuard');
    if (g){ g.classList.remove('hidden'); g.textContent = 'Access denied. ' + msg; }
    const app = document.getElementById('adminApp');
    if (app) app.classList.add('hidden');
  }

  async function guard(){
    if (!firebase || !firebase.auth) return deny('Firebase not loaded');
    await waitForConfig(3000); // ensure app-config likely loaded
    firebase.auth().onAuthStateChanged(async function(user){
      if (!user){ return deny('Not signed in'); }
      const ok = await isAdmin(user);
      if (!ok) return deny('Not admin');
      const g = document.getElementById('adminGuard');
      if (g) g.classList.add('hidden');
      const app = document.getElementById('adminApp');
      if (app) app.classList.remove('hidden');
      boot();
    });
  }

  function boot(){
    if (!firebase.firestore){ console.warn('[admin] Firestore not loaded for app'); return; }
    const db = firebase.firestore();
    const tbody = document.getElementById('usersTbody');

    async function load(){
      tbody.innerHTML = '';
      const snap = await db.collection('users').orderBy('email').limit(100).get();
      snap.forEach(doc => {
        const u = doc.data() || {};
        const tr = document.createElement('tr');
        tr.innerHTML = [
          `<td class="py-2 pr-4">${u.email||''}</td>`,
          `<td class="py-2 pr-4">${u.uid||doc.id}</td>`,
          `<td class="py-2 pr-4">${u.active ? '✅' : '❌'}</td>`,
          `<td class="py-2 pr-4"><button data-id="${doc.id}" class="toggle px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Toggle</button></td>`
        ].join('');
        tbody.appendChild(tr);
      });
      Array.from(tbody.querySelectorAll('button.toggle')).forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          const ref = db.collection('users').doc(id);
          const d = await ref.get(); 
          const data = d.exists ? d.data() : {};
          await ref.set({ active: !data.active, email: data.email||'', uid: data.uid||id }, { merge: true });
          load();
        });
      });
    }

    const refresh = document.getElementById('refreshBtn');
    if (refresh) refresh.addEventListener('click', load);

    const form = document.getElementById('activateForm');
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('emailInput');
      if (!emailInput) return;
      const email = (emailInput.value||'').trim().toLowerCase();
      if (!email) return;
      const q = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!q.empty){
        const doc = q.docs[0];
        await db.collection('users').doc(doc.id).set({ active: true }, { merge: true });
      } else {
        const id = email.replace(/[@.]/g,'_');
        await db.collection('users').doc(id).set({ email: email, active: true, uid: id }, { merge: true });
      }
      load();
      e.target.reset();
    });

    load();
  }

  guard();
})();
