# GuardianCare — v4 Full Refactor

## What changed
1) **Folder structure**
   - Moved JS into `assets/js/`:
     - `assets/js/firebase-config.js` (Firebase keys only)
     - `assets/js/app-config.js` (**single source of truth** for social links + demo YouTube URL)
     - `assets/js/script.js` (shared behavior)
     - `assets/js/social-links.js` (auto-rewrite social links on every page)
2) **YouTube demo video**
   - Removed the old "Demo" button. After login, a **persistent video section** appears on the home page automatically.
   - Configure the link once in `assets/js/app-config.js` via `window.DEMO_YT_URL` (paste full YouTube link).
3) **Centralized social links**
   - Set links once in `assets/js/app-config.js` under `window.SOCIAL_LINKS`.
   - They propagate to:
     - Floating FAB links on all pages (light DOM)
     - Footer component (shadow DOM) via an internal binding
4) **Firebase config**
   - Uses `assets/js/firebase-config.js`, initialized safely in `assets/js/script.js` (v8 compat).
5) **Assets inventory**
   - See `ASSETS_USED.txt` for all asset paths referenced in HTML/CSS/JS.

## How to use
- Edit **only** `assets/js/app-config.js` for social links and demo video URL.
- Put your Firebase keys in **`assets/js/firebase-config.js`**.
- Deploy to Firebase Hosting as usual.

## Notes
- Backward compatibility: script accepts `DEMO_YT_URL` (preferred), but also works if you kept the old `DEMO_YT` or `DEMO_YT_ID`.

## v7 (2025-10-28 00:21)
- Replaced **Live Demo** card in `dashboard.html` by **Product Demo** (YouTube embed from `window.DEMO_YT_URL`).
- Added **Live Demo** as a separate button (opens a modal stub: Manage/View Keys, View IP Camera).
- Moved **Payment & Subscription** panel into a **Subscription** button next to **Pricing** in the navbar (works on all pages). Clicking opens a modal showing current plan + expiry (reads Firestore `subscriptions/<uid>` if present, else falls back to defaults).
- Implemented **Admin-only activation** at `/admin.html`:
  - Only emails in `window.ADMIN_EMAILS` (see `assets/js/app-config.js`) can access.
  - Admin can activate users by email and toggle `active` status in Firestore `users` collection.
  - Registration now writes `users/<uid> {uid, email, active:false}` (Firestore) for admin approval.
  - Dashboard has an activation guard: non-activated users are redirected to landing.
- No visual theme changes beyond requested buttons/labels.
