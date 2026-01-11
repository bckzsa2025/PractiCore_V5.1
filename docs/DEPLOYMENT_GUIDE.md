
# 🚀 Deployment Guide: Standalone PWA

## 1. 🏗️ Build for Production (Laptop/Desktop)

The application is configured as a "Thick Client" PWA. It contains all necessary logic to run without an external backend server, utilizing the browser's `IndexedDB` for data storage and `Google GenAI SDK` for intelligence.

### Prerequisites
*   Node.js (v18+)
*   NPM or Yarn

### Step-by-Step
1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Create a `.env` file in the root:
    ```env
    VITE_GOOGLE_API_KEY=AIzaSy... (Your Google AI Studio Key)
    ```

3.  **Development Mode**:
    ```bash
    npm run dev
    ```
    Opens `http://localhost:3000` with Hot Module Replacement.

4.  **Production Build**:
    ```bash
    npm run build
    ```
    This compiles assets into the `dist/` directory.
    - **Optimized CSS**: Tailwind is purged and minified.
    - **Chunk Splitting**: JS is split for faster loading.
    - **Service Worker**: `sw.js` is generated for offline capabilities.

5.  **Preview Production Build**:
    ```bash
    npm run preview
    ```

---

## 2. ☁️ Hosting (Netlify / Vercel / Static)

Since the app is a static SPA (Single Page Application), it can be hosted anywhere.

### Vercel (Recommended)
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Set the Environment Variable `VITE_GOOGLE_API_KEY` in the Vercel Dashboard.

### Netlify Drop
1.  Run `npm run build`.
2.  Drag the `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 3. 📱 PWA Installation

Once deployed (or running locally):
1.  Open the URL in Chrome/Edge.
2.  Look for the **"Install"** icon in the address bar OR the "Install App" banner inside the application.
3.  The app will install as a native desktop/mobile application.
