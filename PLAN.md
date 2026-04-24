# HEALTH AI — Co-Creation & Innovation Platform
## Master Project Document

**Course:** SENG 384 — Software Project III  
**Last Updated:** 2026-04-25

---

## 1. What We're Building

A purpose-built web platform that connects **healthcare professionals** (doctors, clinicians, researchers) with **engineers** (AI specialists, software developers) to co-create health technology projects. Users post collaboration opportunities, discover partners by domain and city, and coordinate meetings through a structured request-and-confirmation workflow.

**Explicitly out of scope:**
- Financial transactions or contract management
- Medical advice or clinical decision support
- Patient data or clinical records (zero tolerance — by design)
- Video conferencing (meetings happen on Zoom/Teams; platform only coordinates scheduling)

---

## 2. User Roles

| Role | How Created | Core Capabilities |
|---|---|---|
| **Engineer** | Self-register (.edu) | Create posts, browse all active posts, send/receive meeting requests, manage profile |
| **Healthcare Professional** | Self-register (.edu) | Same as Engineer |
| **Admin** | DB seed only — not selectable in UI | Manage all users/posts, view/export activity logs |

> Admin role is never shown in the registration form. Any attempt to pass `role: admin` via API returns 422.

---

## 3. Tech Stack (Final)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite 5 | SPA, lazy-loaded routes |
| Styling | Tailwind CSS 3 + shadcn/ui | Dark/light mode, CSS variables |
| State | Zustand 4 + persist | Auth store persisted to localStorage |
| HTTP | Axios | Bearer interceptor + silent refresh on 401 |
| Router | React Router v6 | ProtectedRoute / AdminRoute / PublicOnlyRoute guards |
| Backend | FastAPI 0.111 (Python 3.12) | Async, auto Swagger docs in DEBUG mode |
| ORM | SQLAlchemy 2.0 async | Mapped + mapped_column style |
| Migrations | Alembic | Async env.py |
| Database | PostgreSQL 15 | JSONB for proposed_times, ENUMs for status fields |
| Auth | JWT — python-jose | access token 15 min (body), refresh token 7 days (httpOnly cookie) |
| Password | bcrypt via passlib | cost factor 12 |
| Email | Resend API | httpx async calls from FastAPI |
| Rate Limiting | slowapi | 5 req/min/IP on all /api/auth/* routes |
| Scheduler | APScheduler | Nightly 02:00 UTC — auto-expire stale posts |
| Deployment | Vercel (FE) + Railway (BE + PG) | Free tier for both |

---

## 4. Database Schema (Final)

### `users`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM(engineer, healthcare_professional, admin) | NOT NULL |
| full_name | VARCHAR(150) | NOT NULL |
| institution | VARCHAR(200) | nullable |
| city | VARCHAR(100) | nullable |
| expertise | VARCHAR(200) | nullable |
| email_verified | BOOLEAN | DEFAULT false |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | server default |

### `posts`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users CASCADE |
| title | VARCHAR(200) | NOT NULL |
| domain | VARCHAR(100) | NOT NULL, indexed |
| expertise_req | VARCHAR(200) | NOT NULL |
| project_stage | ENUM(idea, prototype, research, clinical_trial) | NOT NULL |
| confidentiality | ENUM(public, nda) | DEFAULT public |
| city | VARCHAR(100) | NOT NULL, indexed |
| description | TEXT | NOT NULL |
| status | ENUM(draft, active, meeting_scheduled, partner_found, expired) | DEFAULT draft, indexed |
| expires_at | TIMESTAMP | nullable — set to created_at + 30 days on publish |
| created_at / updated_at | TIMESTAMP | server default / onupdate |

### `meeting_requests`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| post_id | UUID | FK → posts CASCADE |
| requester_id | UUID | FK → users CASCADE |
| status | ENUM(pending, accepted, declined, scheduled, completed, cancelled) | DEFAULT pending |
| proposed_times | JSONB | `[{"slot": "2026-05-01T14:00:00Z"}, ...]` — 1 to 3 slots |
| accepted_time | TIMESTAMP | nullable |
| nda_accepted | BOOLEAN | DEFAULT false |
| message | TEXT | nullable, max 500 chars |
| created_at | TIMESTAMP | server default |

### `activity_logs`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users SET NULL (preserved after account deletion) |
| action_type | VARCHAR(100) | indexed |
| metadata | JSONB | nullable — contextual data (post_id, ip, etc.) |
| created_at | TIMESTAMP | server default |

**Tracked action types:** `login, logout, register, email_verified, post_create, post_publish, post_edit, post_delete, post_expired, post_partner_found, meeting_request_sent, meeting_accepted, meeting_declined, meeting_cancelled, meeting_completed, admin_user_suspend, admin_user_delete, admin_post_remove, account_deleted, data_exported`

### `notifications`
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users CASCADE |
| type | VARCHAR(100) | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | server default |

---

## 5. API Endpoints (Final)

### Auth — `/api/auth`
```
POST /register              body: {email, password, role, full_name}
POST /login                 body: {email, password} → access_token (body) + refresh_token (httpOnly cookie)
POST /logout                clears cookie
POST /verify-email          body: {token}
POST /resend-verification   body: {email}
POST /refresh               reads cookie → new access_token + rotated cookie
```

### Posts — `/api/posts`
```
GET    /                    ?domain=&city=&status=&expertise=&q=&page=&limit=
POST   /                    create post
GET    /mine                own posts
GET    /:id                 post detail
PUT    /:id                 update (owner, draft|active only)
PATCH  /:id/status          body: {status: active|partner_found}
DELETE /:id                 owner only
```

### Meetings — `/api/meetings`
```
POST   /                    body: {post_id, nda_accepted, proposed_times, message?}
GET    /                    ?post_id= or ?as=requester
GET    /:id
PATCH  /:id/accept          body: {accepted_time}
PATCH  /:id/decline
PATCH  /:id/complete
PATCH  /:id/cancel
```

### Profile & GDPR — `/api/users`
```
GET    /me
PUT    /me                  body: {full_name?, institution?, city?, expertise?}
DELETE /me                  hard delete — CASCADE + log anonymize
GET    /me/export           JSON bundle of all personal data
```

### Notifications — `/api/notifications`
```
GET    /
PATCH  /:id/read
PATCH  /read-all
```

### Admin — `/api/admin`
```
GET    /users               ?role=&is_active=
GET    /users/:id
PATCH  /users/:id/suspend   body: {is_active: bool}
DELETE /users/:id
GET    /posts               ?status=&domain=
DELETE /posts/:id
GET    /logs                ?user_id=&action_type=&from=&to=
GET    /logs/export         → CSV download
```

---

## 6. Frontend Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Landing | Public |
| `/login` | Login | Public only |
| `/register` | Register | Public only |
| `/verify-email` | Email verification | Public |
| `/dashboard` | Post feed + filters | Protected |
| `/posts/new` | Create post form | Protected |
| `/posts/:id` | Post detail + meeting request | Protected |
| `/my-posts` | Own posts + lifecycle controls | Protected |
| `/meetings` | Sent/received meeting requests | Protected |
| `/profile` | Profile edit, GDPR export/delete | Protected |
| `/notifications` | Notification list | Protected |
| `/admin/users` | User management | Admin |
| `/admin/posts` | Post management | Admin |
| `/admin/logs` | Activity logs + CSV export | Admin |

---

## 7. State Machines

### Post Lifecycle
```
draft ──[Publish]──► active ──[Request accepted]──► meeting_scheduled ──[Mark Partner Found]──► partner_found
                       │                                    │
                  [30 days no activity]              [Either party cancels]
                       ▼                                    ▼
                    expired                              active
```

### Meeting Request Lifecycle
```
pending ──[Owner accepts]──► scheduled ──[Owner marks complete]──► completed
   │                              │
[Owner declines]           [Either cancels]
   ▼                              ▼
declined                      cancelled
```

---

## 8. Security Decisions

| Concern | Decision |
|---|---|
| Refresh token storage | httpOnly + Secure + SameSite=Lax cookie |
| Access token storage | Zustand in-memory (lost on page reload → silent refresh via cookie) |
| Admin self-registration | Blocked at Pydantic schema level — 422 if attempted |
| Rate limiting | 5 req/min/IP on `/api/auth/*` via slowapi |
| CORS | Only FRONTEND_URL origin allowed |
| Password | bcrypt cost 12 — never logged or stored plain |
| GDPR delete | Hard DELETE cascade + ActivityLog user_id SET NULL |
| Suspended accounts | 403 with human-readable message on login |
| Post expiry | APScheduler cron — nightly 02:00 UTC |
| No patient data | Enforced by schema design — no such fields exist anywhere |

---

## 9. Project Structure

```
seng384/
├── PLAN.md          ← this file
├── SRS.md           ← Software Requirements Specification
├── SDD.md           ← Software Design Document
└── healthai/
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── layout/    Navbar, AppLayout
    │   │   │   ├── shared/    PostCard, Badge, etc.
    │   │   │   └── ui/        shadcn components
    │   │   ├── pages/
    │   │   │   ├── auth/      Login, Register, VerifyEmail
    │   │   │   ├── dashboard/ Dashboard
    │   │   │   ├── posts/     CreatePost, PostDetail, MyPosts
    │   │   │   ├── meetings/  Meetings
    │   │   │   ├── profile/   Profile
    │   │   │   ├── notifications/
    │   │   │   ├── admin/     AdminUsers, AdminPosts, AdminLogs
    │   │   │   └── Landing.jsx
    │   │   ├── store/         authStore, notificationStore (Zustand)
    │   │   ├── services/      api.js (axios), authService, postService, meetingService, notificationService
    │   │   ├── hooks/         useAuth
    │   │   ├── router/        ProtectedRoute, AdminRoute, PublicOnlyRoute
    │   │   ├── constants/     domains, cities, stages, status config
    │   │   └── lib/utils.js   shadcn cn()
    │   ├── tailwind.config.js
    │   ├── vite.config.js
    │   └── package.json
    └── backend/
        ├── app/
        │   ├── models/        base, user, post, meeting_request, activity_log, notification
        │   ├── schemas/       auth, post, meeting, notification, admin, user, common
        │   ├── routers/       auth (full), posts, meetings, users, notifications, admin (stubs→Phase 2)
        │   ├── services/      audit_service, email_service, notification_service (+ stubs)
        │   ├── middleware/    auth.py — get_current_user, require_role, require_admin
        │   ├── utils/         security.py (JWT+bcrypt), validators.py (.edu regex)
        │   ├── scheduler/     jobs.py — nightly post expiry
        │   ├── config.py      pydantic-settings
        │   ├── database.py    async engine + get_db
        │   └── main.py        FastAPI app factory, CORS, rate limiter, lifespan
        ├── alembic/
        └── requirements.txt
```

---

## 10. Development Phases (SENG 384)

### Phase 1 — Frontend + SRS *(current)*
- [x] Project structure and base setup
- [x] Tailwind + shadcn/ui + dark mode
- [x] Zustand stores (auth, notifications)
- [x] Axios service layer with interceptors
- [x] Route guards (Protected, Admin, PublicOnly)
- [x] Landing page
- [x] Login / Register / Verify Email pages
- [x] Dashboard with mock data and filters
- [ ] Post Detail page
- [ ] Create Post form
- [ ] My Posts page
- [ ] Meetings page
- [ ] Profile page
- [ ] Notifications page
- [ ] Admin pages (Users, Posts, Logs)
- [ ] SRS_V1 submission

### Phase 2 — Full Stack + SDD
- [ ] PostgreSQL up + Alembic initial migration
- [ ] Auth router fully wired (register, login, verify, refresh)
- [ ] Posts router — full CRUD + lifecycle
- [ ] Meetings router — full workflow
- [ ] Frontend mock data → real API
- [ ] Core flow tested end-to-end: Post → Meeting Request → Accept → Partner Found
- [ ] SDD_V1 submission

### Phase 3 — Final
- [ ] Admin panel (users, posts, logs + CSV export)
- [ ] GDPR: account delete + data export
- [ ] Notifications (in-app + email via Resend)
- [ ] APScheduler post expiry in production
- [ ] DB seed data (sample doctors + engineer posts)
- [ ] User Guide with screenshots
- [ ] Demo video (max 5 min)
- [ ] SRS_V2 + SDD_V2 + Final Report

---

## 11. Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/healthai
SECRET_KEY=<long-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

### Frontend (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=true
```
