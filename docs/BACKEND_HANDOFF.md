
# Backend Handoff & Build Instructions
**Role:** Backend Developer (Gemini)
**Target**: `silverstar-backend` (FastAPI / Python)

## 1. Objective
Build a production-ready FastAPI backend that strictly implements the OpenAPI contract defined in `api-contract/openapi.yaml`. The frontend is 100% complete and relies on `libs/api.ts` which expects these endpoints to exist.

## 2. Core Architecture
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL 15+ (Use SQLModel or SQLAlchemy + Alembic)
- **Async Tasks**: Celery + Redis
- **Auth**: JWT (OAuth2PasswordBearer)

## 3. Implementation Checklist (Priority Order)

### A. Database Schema (Mirror `libs/api.ts` types)
1. **User**: `id, email, password_hash, role, name, phone`
2. **Appointment**: `id, patient_id, doctor_id, service_id, start_time, status, type`
3. **Document**: `id, user_id, filename, s3_url, status`
4. **AI_Log**: `id, query, response, timestamp, source_documents`
5. **Twilio_Config**: `id, account_sid, auth_token, phone_number`

### B. API Endpoints (Must match `openapi.yaml`)
- `POST /auth/login` -> Returns `{ access_token, user }`
- `POST /auth/register` -> Creates User + Patient profile
- `GET /appointments?patientId=...` -> List appointments
- `POST /appointments` -> Create appointment (Check slot availability)
- `GET /integrations/twilio` -> Return config (Masked secrets)
- `POST /integrations/twilio` -> Save config (Encrypt in DB)

### C. AI Module (Crucial)
The frontend `ChatWidget` currently uses the Google GenAI SDK directly on the client for the MVP. **For Production**, you must:
1. Implement `POST /ai/chat` endpoint.
2. Move the `chatWithGemini` logic from `frontend/services/ai.ts` to backend `backend/services/ai_service.py`.
3. Keep the API Key server-side.
4. Implement RAG:
   - When PDF uploaded (`POST /documents`), extract text -> Chunk -> Embed -> Store in Vector DB (Chroma/Weaviate).
   - On Chat, retrieve context -> Inject into System Prompt.

### D. Telephony (Twilio)
1. Expose `POST /webhooks/twilio/voice`
2. Logic:
   - Receive call -> TwiML `Say` greeting -> `Record` input.
   - Send recording to STT (Google Speech or Whisper).
   - Pass text to Gemini.
   - Return TwiML `Say` with response.

## 4. Environment Variables
```env
DATABASE_URL=postgresql://user:pass@db:5432/silverstar
REDIS_URL=redis://redis:6379/0
GOOGLE_API_KEY=sk-... (Server Side)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
JWT_SECRET=...
```

## 5. Deployment
- Use the `docker-compose.yml` provided in root.
- Ensure `backend` service is healthy before frontend connects.
- Run `alembic upgrade head` on startup.

**Final Note**: Do not change the frontend `api-contract`. If you need to change the API, you must update `openapi.yaml` and regenerate the client.
