class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        footer {
          background: #1f2937;
          color: white;
          padding: 3rem 2rem;
          margin-top: auto;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .footer-logo img {
          height: 1.5rem;
        }
        .footer-logo span {
          font-weight: bold;
          color: white;
        }
        .footer-heading {
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1.125rem;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .footer-links a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: white;
        }
        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .social-links a {
          color: white;
          background: #374151;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .social-links a:hover {
          background: #4f46e5;
        }
        .copyright {
          text-align: center;
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid #374151;
          color: #9ca3af;
        }
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <footer>
        <div class="footer-container">
          <div>
            <div class="footer-logo">
              <img src="assets/logo-white.png" alt="GuardianCare Logo">
              <span>GuardianCare</span>
            </div>
            <p class="text-gray-300 mt-2">AI-powered fall detection for peace of mind</p>
            <div class="social-links">
              <a href="#"><i data-feather="facebook"></i></a>
              <a href="#"><i data-feather="instagram"></i></a>
              <a href="#"><i data-feather="message-square"></i></a>
            </div>
          </div>
          <div>
            <h3 class="footer-heading">Product</h3>
            <div class="footer-links">
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Demo</a>
              <a href="#">API</a>
            </div>
          </div>
          <div>
            <h3 class="footer-heading">Company</h3>
            <div class="footer-links">
              <a href="about.html">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press</a>
            </div>
          </div>
          <div>
            <h3 class="footer-heading">Support</h3>
            <div class="footer-links">
              <a href="contact.html">Contact</a>
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div class="copyright">
          &copy; ${new Date().getFullYear()} GuardianCare. All rights reserved.
        </div>
      </footer>
    `;
  }
}
customElements.define('custom-footer', CustomFooter);