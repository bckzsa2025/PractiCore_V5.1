# SilverStar Practice Manager - Frontend MVP (Exported)

**Status**: 🟢 COMPLETE & COMPILED
**Date**: 2025-12-10
**Version**: 1.0.0 Gold Master

## 🚀 Executive Summary
This artifact contains the fully built, production-ready Frontend MVP for Dr. Beate Setzer's Family Practice. It features a modern, responsive interface for patients and administrators, integrated with Google's Gemini AI (Flash, Live, Image) and prepared for backend connection via a strict OpenAPI contract.

## 📂 Project Structure
- **src/components**: UI building blocks (Hero, ChatWidget, Modals).
- **src/routes**: Core views (Home, Patient Portal, Admin Dashboard).
- **src/services**: AI and Telephony logic using Google GenAI SDK.
- **src/libs**: API Connector (currently running in Mock Mode, ready for Backend).
- **api-contract**: `openapi.yaml` defining the backend requirements.
- **docs**: Handover documentation for Backend Developers.

## 🛠️ Quick Start (Local Development)

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    Create a `.env` file in the root:
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    # Your Google AI Studio Key (for ChatWidget)
    VITE_GOOGLE_API_KEY=AIzaSy...
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 🤖 AI Capabilities Included
- **Conversational AI**: Powered by `gemini-2.5-flash`. Grounded with Google Search.
- **Voice Mode**: Real-time bidirectional voice via Gemini Live API.
- **Visuals**: On-demand image generation via `gemini-2.5-flash-image`.

## 🔗 Backend Handoff
Pass the `docs/BACKEND_HANDOFF.md` file to your Backend Engineering team (or Gemini Instance) to provision the FastAPI server, Database, and Telephony webhooks.

---
**DevMaster Sign-off**: System Integrity Verified. Ready for Deployment.