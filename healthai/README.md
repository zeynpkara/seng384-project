# HEALTH AI — Co-Creation & Innovation Platform

> Connecting healthcare professionals with engineers to build the next generation of health technology.

**Course:** SENG 384 — Software Project III

---

## What is HEALTH AI?

A purpose-built web platform where healthcare professionals (doctors, clinicians, researchers) post collaboration opportunities and engineers (AI specialists, software developers) discover and respond to them. The platform handles structured matching, NDA-aware meeting requests, and scheduling coordination.

**Not a:** medical advice tool, patient data system, contract platform, or video conferencing service.

---

## Tech Stack

| | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 15 (SQLAlchemy 2.0 async + Alembic) |
| Auth | JWT — access token (15 min) + refresh token (7 days, httpOnly cookie) |
| Email | Resend API |
| Deployment | Vercel (frontend) + Railway (backend + database) |

---

## Project Structure

```
healthai/
├── frontend/     React SPA
└── backend/      FastAPI + PostgreSQL
```

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL
npm run dev
```

Runs on `http://localhost:5173`

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in DATABASE_URL, SECRET_KEY, RESEND_API_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`  
API docs (debug mode): `http://localhost:8000/docs`

---

## Environment Variables

### Backend — `backend/.env`
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/healthai
SECRET_KEY=your-secret-key
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

### Frontend — `frontend/.env.local`
```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=true
```

---

## Development Phases

| Phase | Deliverable | Status |
|---|---|---|
| Phase 1 | Frontend (mock data) + SRS | In progress |
| Phase 2 | Full stack integration + SDD | Upcoming |
| Phase 3 | Final submission + User Guide + Demo | Upcoming |

---

## Key Constraints

- Only institutional `.edu` / `.edu.tr` emails are accepted
- No patient data or clinical records are stored — enforced at schema level
- Admin role is not self-assignable — assigned via database seed only
- Meetings take place on external platforms (Zoom, Teams); this platform only coordinates scheduling

---

## Documentation

| Document | Location |
|---|---|
| Project Plan (scope + technical) | `../PLAN.md` |
| Software Requirements Specification | `../SRS.md` |
| Software Design Document | `../SDD.md` |
