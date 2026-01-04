
# 📘 PractiZone™© Deployment Bible v1.0.7
**Status:** 🚀 DEPLOYMENT READY
**Environment:** Android (Termux) / LocalHost / Static Web

---

## 1. 🏁 Deployment Instructions (Termux / Local)

### A. Pre-requisites
On your Android device (Termux) or PC:
1.  Install Node.js: `pkg install nodejs` (Termux) or download installer.
2.  Install Git: `pkg install git`.

### B. Installation
1.  Navigate to project folder.
2.  Run: `npm install`
    *   *Note:* If you see errors about optional dependencies (rollup), ignore them. The build will still work.

### C. Configuration
Create a `.env` file in the root:
```env
VITE_GOOGLE_API_KEY=AIzaSy... (Your Key Here)
```
*Tip: You can also enter the API Key inside the App via: Admin Console -> AI Console -> Providers.*

### D. Running (Dev Mode)
```bash
npm run dev
```
*   Access at: `http://localhost:3000`
*   From another device on Wi-Fi: `http://<phone-ip>:3000`

### E. Building (Production Mode)
```bash
npm run build
npx serve -s dist
```
*   This serves the optimized, minified static files.

---

## 2. 🧪 Architecture Reference (Thick Client)

### The "Brain": `libs/api.ts`
*   This file is the **Virtual Server**.
*   It intercepts calls like `api.auth.login()` and queries the browser's `IndexedDB`.
*   **Crucial:** Do not delete or simplify this file. It is the only thing making the app "work" without a Python server.

### The "Eyes & Ears": `services/ai.ts`
*   Direct connection to Google Gemini.
*   **Chat:** `gemini-2.5-flash`
*   **Voice:** `gemini-live` (WebSockets)
*   **Images:** `gemini-2.5-flash-image`

---

## 3. 🚨 Troubleshooting "Ghost UI"
If the app seems stuck or old data persists:
1.  Go to **Developer Console** (Login: `dev@practizone.system` / `sudo`).
2.  Click **"Force Reset App & Cache"**.
3.  This wipes the Service Worker and IndexedDB.

---

**Signed:** Gim (Master Architect)
