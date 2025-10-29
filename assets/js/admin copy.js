// Admin-only activation panel (v7)
(function(){
  if (!window.ADMIN_EMAILS) window.ADMIN_EMAILS = ["nguyendphuong2004@gmail.com"];
  function guard(){
    try {
      if (!firebase || !firebase.auth) return deny('Firebase not loaded');
      firebase.auth().onAuthStateChanged(function(user){
        if (!user){ return deny('Not signed in'); }
        const ok = window.ADMIN_EMAILS.includes(user.email);
        if (!ok) return deny('Not admin');
        document.getElementById('adminGuard').classList.add('hidden');
        document.getElementById('adminApp').classList.remove('hidden');
        boot();
      });
    } catch(e){ deny('Error: ' + e); }
  }
  function deny(msg){
    console.warn('admin deny:', msg);
    const g = document.getElementById('adminGuard');
    g.classList.remove('hidden'); g.textContent = 'Access denied. ' + msg;
    document.getElementById('adminApp').classList.add('hidden');
  }
  function boot(){
    if (!firebase.firestore){ console.warn('Firestore not loaded'); return; }
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
          `<td class="py-2 pr-4"><button data-id="${doc.id}" class="toggle px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Toggle</button></td>`
        ].join('');
        tbody.appendChild(tr);
      });
      Array.from(tbody.querySelectorAll('button.toggle')).forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          const ref = db.collection('users').doc(id);
          const d = await ref.get(); const data = d.exists ? d.data() : {};
          await ref.set({ active: !data.active, email: data.email||'', uid: data.uid||id }, { merge: true });
          load();
        });
      });
    }
    document.getElementById('refreshBtn').addEventListener('click', load);
    document.getElementById('activateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('emailInput').value.trim().toLowerCase();
      if (!email) return;
      // find a user doc by email; else create with email as key-ish (normalized)
      const q = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!q.empty){
        const doc = q.docs[0];
        await db.collection('users').doc(doc.id).set({ active: true }, { merge: true });
      } else {
        // create doc with email as id-safe (replace @ and .)
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


















