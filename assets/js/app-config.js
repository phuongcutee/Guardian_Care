// Global app config — edit here once to change everywhere
// Social links
window.SOCIAL_LINKS = {
  "facebook": "https://www.facebook.com/people/Guardian-Care-FPTU/100086061074330",
  "instagram": "https://www.instagram.com/yourpage",
  "zalo": "https://zalo.me/g/iguxgq111"
};


// Global download link (shown in navbar)
window.DOWNLOAD_LINK = "https://drive.google.com/drive/folders/1VZlY0KE0qrXXwPqiFKaPYbXkHIj8Co45?usp=sharing"; // TODO: set your download URL

// Product demo video: paste a full YouTube URL (watch?v=...)
window.DEMO_YT_URL = "https://www.youtube.com/watch?v=uvmq1d76rN8";




// Admin emails allowed to access admin dashboard
window.ADMIN_EMAILS = ["nguyendphuong2004@gmail.com"]; // TODO: replace with your admin email(s)

// Default billing fallback (used if Firestore not configured)
window.BILLING_DEFAULT_PLAN = "Free";
window.BILLING_DEFAULT_EXPIRY = null; // e.g., "2026-12-31" or null
// Global app config — ensure this loads BEFORE admin.js

window.ADMIN_EMAILS = ["nguyendphuong2004@gmail.com"];
window.__APP_CONFIG_READY = true;

// Dev-only bypass (set to true to allow any signed-in user to access admin)
window.FORCE_ADMIN = false;
