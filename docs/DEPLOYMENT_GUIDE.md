
# 🚀 Deployment Guide: Android (Termux) & Cloud (Vercel)

## ⚠️ CRITICAL STORAGE WARNING (Android)
**Do NOT** clone this project into `/sdcard` or `/storage/emulated/0`.
Android's shared storage does not support the file permissions or symlinks required by `npm install`.

**ALWAYS** work inside the Termux Local File System (Home Directory).

---

## 1. 📲 Android (Termux) Local Hosting

1.  **Open Termux** and ensure you are in the home directory:
    ```bash
    cd ~
    ```

2.  **Install Environment**:
    ```bash
    pkg update && pkg upgrade
    pkg install nodejs git
    ```

3.  **Copy/Clone Project**:
    *   If you downloaded the code to your phone's Downloads folder, move it to Termux Home:
    ```bash
    # Example moving from Downloads to Home
    cp -r /sdcard/Download/silverstar-frontend-mvp ~/practizone
    cd ~/practizone
    ```

4.  **Install Dependencies**:
    ```bash
    # This MUST run in Termux Home (~), not /sdcard
    npm install
    ```

5.  **Run Server**:
    ```bash
    npm run dev
    ```
    *   **Access**: `http://localhost:3000`

---

## 2. ☁️ Deploying to Vercel (Public Web)

This application is optimized for Vercel.

### A. Setup
1.  Push this code to a GitHub, GitLab, or Bitbucket repository.
2.  Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3.  Import your repository.

### B. Environment Variables (Critical)
Before clicking "Deploy", expand the **"Environment Variables"** section and add:

| Name | Value Example | Required? | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_GOOGLE_API_KEY` | `AIzaSy...` | **YES** | Powers Chat, Image Gen, and Voice Mode (Gemini). |
| `VITE_OPENROUTER_API_KEY` | `sk-or-v1...` | No | Optional backup provider (configure in Admin Console). |

### C. Build Settings
Vercel usually detects these automatically, but if not:
*   **Framework Preset**: Vite
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`

---

## 3. 📦 Building for Production (Manual)

To compile the app into static files (HTML/CSS/JS) manually:

```bash
npm run build
```

*   **Output**: The files will be saved to `dist/`.
*   **Hosting**: You can drag and drop the `dist` folder into **Netlify Drop** or host it on any static server (Apache/Nginx).

### To Backup Your Build (Android)
If you want to move the built app out of Termux to your Phone Storage:

```bash
# This copies the 'dist' folder to your Android Downloads folder
cp -r dist/ /sdcard/Download/practizone_build
```

---

## 4. 🧠 AI Configuration

1.  Open the App.
2.  Log in as **Admin** or **Developer**.
3.  Go to **AI Console** -> **Providers**.
4.  You can manually override API Keys here if you didn't set them in Vercel Environment Variables.
5.  Click **Save Config**.
