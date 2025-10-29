class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        nav {
          background: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-img {
          height: 2rem;
        }
        .logo-text {
          color: #4f46e5;
          font-weight: bold;
          font-size: 1.25rem;
        }
        ul { 
          display: flex; 
          gap: 1.5rem; 
          list-style: none; 
          margin: 0; 
          padding: 0; 
          align-items: center;
        }
        a { 
          color: #4b5563; 
          text-decoration: none; 
          transition: color 0.2s; 
          font-weight: 500;
        }
        a:hover { 
          color: #4f46e5; 
        }
        .auth-buttons {
          display: flex;
          gap: 0.75rem;
        }
        .login-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
        }
        .register-btn {
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
        }
        .register-btn:hover {
          background-color: #4338ca;
        }
        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          ul {
            flex-direction: column;
            width: 100%;
          }
        }
      </style>
      <nav>
        <a class="logo-container" href="https://guardian-care-web.web.app/dashboard.html">
          <img src="assets/logo.png" alt="GuardianCare Logo" class="logo-img">
          <span class="logo-text">GuardianCare</span>
        </a>
        <ul>
          <li><a href="https://guardian-care-web.web.app/dashboard.html">Home</a></li>
          <li><a href="#" id="navDownloadBtn">Download</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="pricing.html">Pricing</a></li>
          <li><a href="#" id="navSubscriptionBtn">Subscription</a></li>
          <div class="auth-buttons">
            <a href="#" id="navLoginBtn" class="login-btn">Login</a>
            <a href="#" id="navRegisterBtn" class="register-btn">Register</a>
          </div>
        </ul>
      </nav>
    `;
    
    // Add event listeners to buttons
    setTimeout(() => {
      const dlBtn = this.shadowRoot.getElementById('navDownloadBtn');
      if (dlBtn) {
        try {
          const url = window.DOWNLOAD_LINK || '#';
          dlBtn.setAttribute('href', url);
          dlBtn.setAttribute('target', '_blank');
          dlBtn.addEventListener('click', (e) => {
            // allow default to open new tab
          });
        } catch(e) { console.warn('DOWNLOAD_LINK not set', e); }
      }
      const loginBtn = this.shadowRoot.getElementById('navLoginBtn');
      const registerBtn = this.shadowRoot.getElementById('navRegisterBtn');
      const subBtn = this.shadowRoot.getElementById('navSubscriptionBtn');
      
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').classList.remove('hidden');
      });
      
      if (subBtn) subBtn.addEventListener('click', (e) => { e.preventDefault(); if (window.__openSubscriptionModal) window.__openSubscriptionModal(); });
      registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerModal').classList.remove('hidden');
      });
    
      // Toggle auth buttons by Firebase auth state
      try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          firebase.auth().onAuthStateChanged((user) => {
            const authBox = this.shadowRoot.querySelector('.auth-buttons');
            if (authBox) authBox.style.display = user ? 'none' : 'flex';
          });
        }
      } catch(e){ console.warn('Auth toggle failed', e); }
    
    }, 100);
  }
}
customElements.define('custom-navbar', CustomNavbar);