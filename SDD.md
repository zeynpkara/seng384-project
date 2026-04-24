# Software Design Document (SDD)
## HEALTH AI Co-Creation & Innovation Platform
**Course:** SENG 384 — Software Project III  
**Version:** 1.0  
**Date:** 30/04/2026

---

## Revision History

| Date | Version | Change Description | Author |
|---|---|---|---|
| 30/04/2026 | 1.0 | Initial version | Group |

---

## Table of Contents

1. Introduction  
2. Architectural Design  
3. Component Design  
4. Database Design  
5. API Design  
6. UI Design  
7. Security Design  
8. State Diagrams  
9. SRS–SDD Traceability Matrix  

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) describes the architectural and detailed design decisions for the HEALTH AI Co-Creation & Innovation Platform. It translates the functional and non-functional requirements defined in the SRS into concrete design artifacts: layered architecture, component structure, database schema, API contracts, UI layout, and security mechanisms. This document serves as the primary reference for implementation.

### 1.2 Scope

The design covers all system components: React-based frontend, FastAPI backend, PostgreSQL database, email notification service integration (Resend), and the scheduled job for post expiry. The design does not cover external meeting platforms (Zoom, Teams) or any clinical data handling, consistent with the SRS scope.

### 1.3 Reference Documents

- SRS: HEALTH AI Co-Creation & Innovation Platform, v1.0, 30/04/2026
- SENG 384 Project Brief

### 1.4 Definitions and Abbreviations

| Term | Definition |
|---|---|
| API | Application Programming Interface |
| REST | Representational State Transfer |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapper |
| RBAC | Role-Based Access Control |
| MVC | Model-View-Controller |
| JSONB | Binary JSON — PostgreSQL native JSON storage |
| UUID | Universally Unique Identifier |
| DTO | Data Transfer Object — request/response schema |
| CORS | Cross-Origin Resource Sharing |
| SPA | Single Page Application |
| Alembic | Database migration tool for SQLAlchemy |
| APScheduler | Python background scheduler library |
| shadcn/ui | React component library built on Radix UI + Tailwind CSS |
| Zustand | Lightweight React state management library |

---

## 2. Architectural Design

### 2.1 Architectural Overview

The system uses a **three-tier Client-Server architecture** with a clear separation between the presentation layer (React SPA), the business logic layer (FastAPI), and the data layer (PostgreSQL). Communication between tiers is via RESTful HTTP/HTTPS. Authentication is stateless, using JWT tokens carried in the `Authorization: Bearer` header.

```
┌─────────────────────────────────────────────┐
│              CLIENT (Browser)               │
│         React SPA — Vite + Tailwind         │
│              Zustand (State)                │
└────────────────────┬────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────┐
│           BACKEND (FastAPI / Python)        │
│  Auth │ Posts │ Meetings │ Admin │ Notif.  │
│         JWT Middleware │ RBAC Guards        │
│         APScheduler (post expiry job)       │
└──────────┬──────────────────────┬───────────┘
           │ SQLAlchemy ORM       │ HTTP
┌──────────▼──────────┐  ┌───────▼───────────┐
│   PostgreSQL DB     │  │   Resend (Email)  │
│ (Railway managed)   │  │   REST API        │
└─────────────────────┘  └───────────────────┘
```

### 2.2 Layers

| Layer | Responsibility | Technology |
|---|---|---|
| **Presentation** | UI rendering, routing, form handling, state management, dark/light mode | React 18, Vite, Tailwind CSS, shadcn/ui, Zustand, Axios, React Router v6 |
| **Business Logic** | Request validation, authentication, authorization, workflow enforcement, scheduling | FastAPI (Python 3.11), Pydantic (DTOs), python-jose (JWT), slowapi (rate limiting), APScheduler |
| **Data Access** | ORM queries, migrations, relationship management | SQLAlchemy 2.0, Alembic |
| **Database** | Persistent data storage | PostgreSQL 15 (Railway managed) |
| **External Services** | Email delivery (verification + notifications) | Resend API |

### 2.3 Deployment Diagram

```
┌─────────────────────┐     ┌──────────────────────────┐
│      Vercel         │     │         Railway           │
│  ┌───────────────┐  │     │  ┌────────────────────┐  │
│  │ React SPA     │  │     │  │  FastAPI Service   │  │
│  │ (Static Build)│◄─┼─────┼─►│  (Python container)│  │
│  └───────────────┘  │     │  └──────────┬─────────┘  │
│                     │     │             │             │
└─────────────────────┘     │  ┌──────────▼─────────┐  │
                            │  │  PostgreSQL DB     │  │
         ┌──────────────────┼─►│  (Railway managed) │  │
         │                  │  └────────────────────┘  │
         │                  └──────────────────────────┘
┌────────┴─────────┐
│   Resend.com     │
│  (Email Service) │
└──────────────────┘
```

**Environments:**
- **Frontend:** Vercel (auto-deploy from `main` branch, `/frontend` directory)
- **Backend:** Railway (Docker container, `/backend` directory)
- **Database:** Railway PostgreSQL (managed, auto-backups)
- **Email:** Resend (external SaaS, REST API)

---

## 3. Component Design

### 3.1 Component List

| Component | Responsibility | Technology / Notes |
|---|---|---|
| **AuthModule** | Registration, login, logout, email verification, token refresh, resend verification | FastAPI router, python-jose, bcrypt, Resend |
| **PostModule** | Post CRUD, lifecycle state management, validation, owner-only guards | FastAPI router, SQLAlchemy, Pydantic DTOs |
| **MatchingModule** | Post listing, search (title/description), filtering (domain, city, status, expertise), pagination | FastAPI router, PostgreSQL full-text search (ilike) |
| **MeetingModule** | Meeting request creation, NDA flow, time slot proposal, accept/decline/complete/cancel, notifications | FastAPI router, SQLAlchemy, Notification trigger |
| **AdminModule** | User management (list, suspend, delete), post management (list, remove), protected by admin RBAC | FastAPI router, Admin-only dependency |
| **AuditModule** | Writing and querying activity logs, CSV export endpoint | FastAPI router, SQLAlchemy, Python csv writer |
| **NotificationModule** | Creating notification records on events, listing notifications, marking read | FastAPI router, SQLAlchemy |
| **SchedulerModule** | APScheduler job running nightly at 02:00 UTC: marks posts as `expired` where `expires_at < now()` and `status = active` | APScheduler (AsyncIOScheduler), SQLAlchemy |
| **SecurityMiddleware** | JWT decode + validation on every protected request, RBAC role enforcement, rate limiting on auth routes | FastAPI Depends(), slowapi |

### 3.2 Component Interaction Diagram

```
Browser
  │
  ├── GET /api/posts ──────────────────► MatchingModule
  │                                           │
  ├── POST /api/auth/login ──────────► AuthModule ──► PostgreSQL
  │                                           │
  ├── POST /api/posts ──────────────► PostModule ──────► PostgreSQL
  │                                      │                   │
  ├── POST /api/meetings ──────────► MeetingModule ──────────┤
  │                                      │                   │
  │                                      └──► NotificationModule
  │                                                │
  │                                           PostgreSQL + Resend
  │
  ├── GET /api/admin/* ────────────► AdminModule (Admin RBAC guard)
  │                                      │
  │                               AuditModule ──► PostgreSQL
  │
  └── [Background] APScheduler ──► SchedulerModule ──► PostgreSQL
```

All requests pass through **SecurityMiddleware** before reaching any module:
```
Request → SecurityMiddleware (JWT decode → role check) → Module Handler → Response
```

---

## 4. Database Design

### 4.1 ER Diagram

```
┌──────────────────────────────┐
│            users             │
├──────────────────────────────┤
│ id (UUID, PK)                │
│ email (UNIQUE)               │
│ password_hash                │
│ role (ENUM)                  │
│ full_name                    │
│ institution                  │
│ city                         │
│ expertise                    │
│ email_verified (BOOL)        │
│ is_active (BOOL)             │
│ created_at                   │
└──────┬───────────────────────┘
       │ 1
       │
       ├──────────────────────────────────────────────┐
       │ N                                            │ N
┌──────▼───────────────────────┐      ┌──────────────▼───────────────┐
│            posts             │      │       meeting_requests        │
├──────────────────────────────┤      ├──────────────────────────────┤
│ id (UUID, PK)                │      │ id (UUID, PK)                │
│ user_id (FK → users)         │      │ post_id (FK → posts)         │
│ title                        │ 1──N │ requester_id (FK → users)    │
│ domain                       │      │ status (ENUM)                │
│ expertise_req                │      │ proposed_times (JSONB)       │
│ project_stage                │      │ accepted_time (TIMESTAMP)    │
│ confidentiality (ENUM)       │      │ nda_accepted (BOOL)          │
│ city                         │      │ message (TEXT)               │
│ description (TEXT)           │      │ created_at                   │
│ status (ENUM)                │      └──────────────────────────────┘
│ expires_at (TIMESTAMP)       │
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘

┌──────────────────────────────┐      ┌──────────────────────────────┐
│        activity_logs         │      │        notifications          │
├──────────────────────────────┤      ├──────────────────────────────┤
│ id (UUID, PK)                │      │ id (UUID, PK)                │
│ user_id (FK → users)         │      │ user_id (FK → users)         │
│ action_type (VARCHAR)        │      │ type (VARCHAR)               │
│ metadata (JSONB)             │      │ message (TEXT)               │
│ created_at                   │      │ is_read (BOOL)               │
└──────────────────────────────┘      │ created_at                   │
                                      └──────────────────────────────┘
```

### 4.2 Table Definitions

#### 4.2.1 `users`

| Field | Data Type | Required | Constraint | Description |
|---|---|---|---|---|
| id | UUID | Yes | PK, default gen_random_uuid() | Unique user identifier |
| email | VARCHAR(255) | Yes | UNIQUE, NOT NULL | Institutional email (.edu / .edu.tr) |
| password_hash | VARCHAR(255) | Yes | NOT NULL | bcrypt hash of password |
| role | ENUM('engineer','healthcare_professional','admin') | Yes | NOT NULL | User role |
| full_name | VARCHAR(150) | Yes | NOT NULL | User's full name |
| institution | VARCHAR(200) | No | — | University or hospital name |
| city | VARCHAR(100) | No | — | User's city for location-based matching |
| expertise | VARCHAR(200) | No | — | User's expertise or medical specialty |
| email_verified | BOOLEAN | Yes | DEFAULT false | Whether email is verified |
| is_active | BOOLEAN | Yes | DEFAULT true | False = account suspended |
| created_at | TIMESTAMP | Yes | DEFAULT now() | Account creation time |

#### 4.2.2 `posts`

| Field | Data Type | Required | Constraint | Description |
|---|---|---|---|---|
| id | UUID | Yes | PK, default gen_random_uuid() | Unique post identifier |
| user_id | UUID | Yes | FK → users(id), ON DELETE CASCADE | Post owner |
| title | VARCHAR(200) | Yes | NOT NULL | Post title |
| domain | VARCHAR(100) | Yes | NOT NULL | Medical/engineering domain |
| expertise_req | VARCHAR(200) | Yes | NOT NULL | Required expertise being sought |
| project_stage | ENUM('idea','prototype','research','clinical_trial') | Yes | NOT NULL | Current project phase |
| confidentiality | ENUM('public','nda') | Yes | NOT NULL, DEFAULT 'public' | Whether NDA is required |
| city | VARCHAR(100) | Yes | NOT NULL | Location for city-based matching |
| description | TEXT | Yes | NOT NULL | Detailed collaboration description |
| status | ENUM('draft','active','meeting_scheduled','partner_found','expired') | Yes | NOT NULL, DEFAULT 'draft' | Post lifecycle state |
| expires_at | TIMESTAMP | No | DEFAULT now() + 30 days | Auto-expiry timestamp |
| created_at | TIMESTAMP | Yes | DEFAULT now() | Post creation time |
| updated_at | TIMESTAMP | Yes | DEFAULT now() | Last modification time |

#### 4.2.3 `meeting_requests`

| Field | Data Type | Required | Constraint | Description |
|---|---|---|---|---|
| id | UUID | Yes | PK, default gen_random_uuid() | Unique request identifier |
| post_id | UUID | Yes | FK → posts(id), ON DELETE CASCADE | Related post |
| requester_id | UUID | Yes | FK → users(id), ON DELETE CASCADE | User who sent the request |
| status | ENUM('pending','accepted','declined','scheduled','completed','cancelled') | Yes | NOT NULL, DEFAULT 'pending' | Request lifecycle state |
| proposed_times | JSONB | Yes | NOT NULL | Array of proposed time slots: `[{"slot": "2026-05-01T14:00:00Z"}, ...]` |
| accepted_time | TIMESTAMP | No | — | The confirmed meeting time (set on acceptance) |
| nda_accepted | BOOLEAN | Yes | NOT NULL, DEFAULT false | Whether requester accepted NDA |
| message | TEXT | No | MAX 500 chars | Optional introductory message |
| created_at | TIMESTAMP | Yes | DEFAULT now() | Request submission time |

#### 4.2.4 `activity_logs`

| Field | Data Type | Required | Constraint | Description |
|---|---|---|---|---|
| id | UUID | Yes | PK, default gen_random_uuid() | Log entry identifier |
| user_id | UUID | Yes | FK → users(id), ON DELETE SET NULL | User who performed the action |
| action_type | VARCHAR(100) | Yes | NOT NULL | Action identifier (see action types below) |
| metadata | JSONB | No | — | Contextual data (post_id, ip_address, etc.) |
| created_at | TIMESTAMP | Yes | DEFAULT now() | Event timestamp |

**Defined `action_type` values:**
`login`, `logout`, `register`, `email_verified`, `post_create`, `post_publish`, `post_edit`, `post_delete`, `post_expired`, `post_partner_found`, `meeting_request_sent`, `meeting_accepted`, `meeting_declined`, `meeting_cancelled`, `meeting_completed`, `admin_user_suspend`, `admin_user_delete`, `admin_post_remove`, `account_deleted`, `data_exported`

#### 4.2.5 `notifications`

| Field | Data Type | Required | Constraint | Description |
|---|---|---|---|---|
| id | UUID | Yes | PK, default gen_random_uuid() | Notification identifier |
| user_id | UUID | Yes | FK → users(id), ON DELETE CASCADE | Recipient user |
| type | VARCHAR(100) | Yes | NOT NULL | Notification category (e.g., `meeting_request_received`) |
| message | TEXT | Yes | NOT NULL | Human-readable notification text |
| is_read | BOOLEAN | Yes | NOT NULL, DEFAULT false | Read state |
| created_at | TIMESTAMP | Yes | DEFAULT now() | Creation time |

---

## 5. API Design

All endpoints are RESTful. Authorization uses `Authorization: Bearer <access_token>` header. All request/response bodies are JSON. All protected endpoints return `401 Unauthorized` if the token is missing or invalid, and `403 Forbidden` if the role is insufficient.

### 5.1 Authentication (Auth)

| Method | Endpoint | Description | Auth | SRS Ref. |
|---|---|---|---|---|
| POST | `/api/auth/register` | Register with .edu email, password, role, full_name | Public | FR-01, FR-03 |
| POST | `/api/auth/login` | Login; returns access_token + refresh_token | Public | FR-06 |
| POST | `/api/auth/logout` | Invalidate refresh token (client drops access token) | Authenticated | — |
| POST | `/api/auth/verify-email` | Verify email using token from verification link (`?token=...`) | Public | FR-02, FR-04 |
| POST | `/api/auth/resend-verification` | Resend verification email to current user's email | Public (email param) | FR-05 |
| POST | `/api/auth/refresh` | Issue new access token using valid refresh token | Public (refresh token in body) | FR-07 |

**Register request body:**
```json
{
  "email": "user@university.edu.tr",
  "password": "SecurePass123!",
  "role": "engineer",
  "full_name": "Ali Yılmaz"
}
```

**Login response body:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### 5.2 Post Management (Posts)

| Method | Endpoint | Description | Auth | SRS Ref. |
|---|---|---|---|---|
| GET | `/api/posts` | List posts (query params: domain, city, status, expertise, q, page, limit) | Authenticated | FR-20–FR-25 |
| POST | `/api/posts` | Create a new post | Authenticated | FR-10, FR-11 |
| GET | `/api/posts/:id` | Get full post detail | Authenticated | — |
| PUT | `/api/posts/:id` | Update post fields (owner only, draft/active only) | Owner | FR-12 |
| PATCH | `/api/posts/:id/status` | Change post status (publish draft, mark partner_found) | Owner | FR-11, FR-15 |
| DELETE | `/api/posts/:id` | Delete own post | Owner | FR-13 |
| GET | `/api/posts/mine` | List authenticated user's own posts | Authenticated | — |

**POST /api/posts request body:**
```json
{
  "title": "AI-Assisted ECG Analysis",
  "domain": "Cardiology",
  "expertise_req": "Machine Learning Engineer",
  "project_stage": "prototype",
  "confidentiality": "nda",
  "city": "Ankara",
  "description": "We are looking for an ML engineer...",
  "status": "draft"
}
```

**GET /api/posts query parameters:**
```
?domain=Cardiology&city=Ankara&status=active&expertise=Machine+Learning&q=ECG&page=1&limit=10
```

### 5.3 Meeting Requests (Meetings)

| Method | Endpoint | Description | Auth | SRS Ref. |
|---|---|---|---|---|
| POST | `/api/meetings` | Submit a meeting request to a post | Authenticated | FR-30–FR-33 |
| GET | `/api/meetings` | List meeting requests (query: `?as=requester` or `?post_id=...`) | Authenticated | — |
| GET | `/api/meetings/:id` | Get meeting request detail | Authenticated (participant) | — |
| PATCH | `/api/meetings/:id/accept` | Accept request + select time slot (post owner only) | Owner | FR-35, FR-36 |
| PATCH | `/api/meetings/:id/decline` | Decline request (post owner only) | Owner | FR-35 |
| PATCH | `/api/meetings/:id/complete` | Mark meeting as completed (post owner only) | Owner | FR-37 |
| PATCH | `/api/meetings/:id/cancel` | Cancel a scheduled meeting (either participant) | Participant | FR-38 |

**POST /api/meetings request body:**
```json
{
  "post_id": "uuid-of-post",
  "nda_accepted": true,
  "proposed_times": [
    {"slot": "2026-05-10T10:00:00Z"},
    {"slot": "2026-05-11T14:00:00Z"},
    {"slot": "2026-05-12T09:00:00Z"}
  ],
  "message": "I have 3 years of experience in ECG signal processing."
}
```

**PATCH /api/meetings/:id/accept request body:**
```json
{
  "accepted_time": "2026-05-10T10:00:00Z"
}
```

### 5.4 Profile & GDPR

| Method | Endpoint | Description | Auth | SRS Ref. |
|---|---|---|---|---|
| GET | `/api/users/me` | Get own profile | Authenticated | — |
| PUT | `/api/users/me` | Update own profile (full_name, institution, city, expertise) | Authenticated | FR-62 |
| DELETE | `/api/users/me` | Hard delete own account and all data | Authenticated | FR-60 |
| GET | `/api/users/me/export` | Download personal data as JSON | Authenticated | FR-61 |

### 5.5 Notifications

| Method | Endpoint | Description | Auth | SRS Ref. |
|---|---|---|---|---|
| GET | `/api/notifications` | List own notifications (newest first) | Authenticated | FR-34, FR-36 |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read | Authenticated | — |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read | Authenticated | — |

### 5.6 Admin

| Method | Endpoint | Description | Auth | SRS Ref. |
|---|---|---|---|---|
| GET | `/api/admin/users` | List all users (filter: role, is_active, date) | Admin | FR-40 |
| GET | `/api/admin/users/:id` | Get full user profile | Admin | FR-40 |
| PATCH | `/api/admin/users/:id/suspend` | Suspend or reactivate user account | Admin | FR-41 |
| DELETE | `/api/admin/users/:id` | Permanently delete user account | Admin | FR-42 |
| GET | `/api/admin/posts` | List all posts (filter: status, domain, date) | Admin | FR-43 |
| DELETE | `/api/admin/posts/:id` | Remove any post | Admin | FR-44 |
| GET | `/api/admin/logs` | View activity logs (filter: user_id, action_type, date range) | Admin | FR-45 |
| GET | `/api/admin/logs/export` | Download filtered logs as CSV | Admin | FR-46 |

---

## 6. UI Design

### 6.1 Screen List and Navigation

| Screen | Route | Description | Access |
|---|---|---|---|
| Landing Page | `/` | Platform overview, hero section, Login/Register CTAs | Public |
| Register | `/register` | Two-step: email+password+role form → success message | Public |
| Login | `/login` | Email + password form, "Forgot password?" link | Public |
| Email Verification | `/verify-email` | Pending verification notice + resend option | Public |
| Dashboard | `/dashboard` | Post feed with search bar, domain/city/expertise filters | Authenticated |
| Create Post | `/posts/new` | Multi-field form with draft/publish toggle | Authenticated |
| Post Detail | `/posts/:id` | Full post info, meeting request button/NDA flow | Authenticated |
| My Posts | `/my-posts` | Owner's posts with status management controls | Authenticated |
| Meetings | `/meetings` | Tabs: Sent requests / Received requests | Authenticated |
| Profile | `/profile` | Profile edit form, data export button, delete account | Authenticated |
| Notifications | `/notifications` | Notification list, read/unread toggle | Authenticated |
| Admin — Users | `/admin/users` | User table with suspend/delete actions | Admin |
| Admin — Posts | `/admin/posts` | Post table with remove action | Admin |
| Admin — Logs | `/admin/logs` | Log viewer with filters + CSV export | Admin |

**Navigation Flow:**
```
Landing ──► Register ──► Email Verification ──► Dashboard
Landing ──► Login ─────────────────────────────► Dashboard
                                                     │
Dashboard ──► Post Detail ──► Meeting Request Form
         ──► Create Post
         ──► My Posts ──► Post status controls
         ──► Meetings ──► Accept/Decline controls
         ──► Profile
         ──► Notifications
         ──► Admin Panel (admin role only)
```

### 6.2 Wireframes / Mockups

**Key screens to be produced (Figma or Balsamiq):**

1. **Registration Page** — Email input with .edu validation hint, password field, role selector (Engineer / Healthcare Professional radio), submit button.

2. **Dashboard** — Top navigation bar (logo, notifications bell, profile avatar, dark mode toggle), search bar, filter row (Domain dropdown, City dropdown, Expertise text, Status chips), post card grid (title, domain badge, city, project stage, confidentiality badge, "View Details" button).

3. **Post Detail Page** — Post full description, owner info, status badge, "Request Meeting" CTA button (or "NDA Required" warning if applicable), existing meeting request status if already submitted.

4. **Meeting Request Form** — Time slot date-time pickers (up to 3 slots), NDA acceptance checkbox (conditional), optional message textarea, submit button.

5. **Admin Logs Panel** — Filterable table (date range picker, user search, action type dropdown), log entries table (timestamp, user, action, metadata), "Export CSV" button.

---

## 7. Security Design

| Security Requirement | Design Decision | SRS Ref. |
|---|---|---|
| **Authentication** | JWT-based stateless auth. `access_token` expires in 15 minutes; `refresh_token` expires in 7 days. Tokens signed with HS256 using a secret stored in environment variables (never in code). | NFR-06 |
| **Password Storage** | Passwords hashed with bcrypt at cost factor 12 before storage. Plain-text passwords are never logged or stored. | NFR-03 |
| **Authorization (RBAC)** | Every protected FastAPI route uses a `Depends(get_current_user)` dependency. Role-specific routes additionally use `Depends(require_role("admin"))` or `Depends(require_owner(post_id))`. Enforcement is at the middleware layer, not in business logic. | NFR-07, FR-08 |
| **Transport Security** | All communication over HTTPS. TLS termination handled by Vercel (frontend) and Railway (backend). HTTP is redirected to HTTPS. | NFR-04 |
| **Rate Limiting** | `slowapi` library limits `/api/auth/register`, `/api/auth/login`, and `/api/auth/resend-verification` to **5 requests per minute per IP**. Exceeding returns `429 Too Many Requests`. | NFR-05 |
| **CORS** | FastAPI CORS middleware configured to allow only the Vercel frontend origin. `allow_origins=["https://healthai.vercel.app"]`. All other origins are rejected. | — |
| **Input Validation** | All request bodies validated via Pydantic schemas. Email domain checked against `.edu` / `.edu.tr` suffix regex on registration. Description and message fields have max-length constraints. | FR-01 |
| **GDPR Compliance** | Account deletion triggers hard delete of user row (CASCADE deletes posts, meeting_requests, notifications). ActivityLog entries are anonymized (`user_id` set to NULL). Data export endpoint returns JSON bundle of all user-owned records. | NFR-09, FR-60, FR-61 |
| **Session Management** | Refresh tokens are stored client-side in `httpOnly` cookies (not localStorage) to prevent XSS access. Access tokens are stored in memory (Zustand store) and lost on page refresh. | NFR-06 |
| **No Patient Data** | Schema contains no fields for clinical data, patient identifiers, or medical records. This is enforced by design — no such fields exist in any table. | NFR-08 |
| **Admin Role Protection** | The `role` field in the registration endpoint only accepts `engineer` or `healthcare_professional`. Any attempt to pass `admin` returns `422 Unprocessable Entity`. Admin accounts are seeded directly in the database. | FR-08 |

---

## 8. State Diagrams

### 8.1 Post Lifecycle

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │ User clicks "Publish"
                         ▼
                    ┌─────────┐
              ┌────►│ ACTIVE  │◄────────────────┐
              │     └────┬────┘                 │
              │          │                      │
              │     ┌────┴────────────┐         │
              │     │                │         │
              │     │ Meeting request │ 30 days │
              │     │ accepted by     │ no new  │
              │     │ post owner      │ requests│
              │     ▼                ▼         │
              │  ┌──────────────┐ ┌─────────┐  │
              │  │   MEETING    │ │ EXPIRED │  │
              │  │  SCHEDULED   │ └─────────┘  │
              │  └──────┬───────┘              │
              │         │                      │
              │  ┌──────┴──────┐               │
              │  │Owner marks  │ Meeting        │
              │  │Partner Found│ cancelled →    │
              │  ▼             │ return active  │
              │  ┌─────────────┐ ──────────────┘
              │  │PARTNER FOUND│
              │  └─────────────┘
              │
              └── (owner edits draft back — stays draft until published)
```

**Transition Triggers:**

| Transition | Trigger |
|---|---|
| `draft → active` | Post owner clicks "Publish" (`PATCH /api/posts/:id/status`) |
| `active → meeting_scheduled` | Post owner accepts a meeting request (`PATCH /api/meetings/:id/accept`) |
| `meeting_scheduled → active` | Either party cancels the scheduled meeting (`PATCH /api/meetings/:id/cancel`) |
| `active → expired` | APScheduler nightly job finds `expires_at < now()` and `status = active` |
| `meeting_scheduled → partner_found` | Post owner marks "Partner Found" (`PATCH /api/posts/:id/status`) |
| `active → partner_found` | Post owner marks "Partner Found" without a scheduled meeting |

### 8.2 Meeting Request Lifecycle

```
            ┌─────────┐
            │ PENDING │
            └────┬────┘
                 │
        ┌────────┴────────┐
        │                 │
   Post owner        Post owner
   accepts             declines
        │                 │
        ▼                 ▼
  ┌───────────┐      ┌──────────┐
  │ SCHEDULED │      │ DECLINED │
  └─────┬─────┘      └──────────┘
        │
   ┌────┴────────────┐
   │                 │
Either party     Post owner
cancels           confirms
   │              completed
   ▼                 │
┌──────────┐         ▼
│CANCELLED │    ┌───────────┐
└──────────┘    │ COMPLETED │
                └───────────┘
```

**Transition Triggers:**

| Transition | Trigger |
|---|---|
| `pending → scheduled` | Post owner accepts and selects a time (`PATCH /api/meetings/:id/accept`) |
| `pending → declined` | Post owner declines (`PATCH /api/meetings/:id/decline`) |
| `scheduled → cancelled` | Either participant cancels (`PATCH /api/meetings/:id/cancel`) |
| `scheduled → completed` | Post owner marks as completed (`PATCH /api/meetings/:id/complete`) |

---

## 9. SRS–SDD Traceability Matrix

| SRS Ref. | Requirement Summary | SDD Component | SDD Section |
|---|---|---|---|
| FR-01 | .edu / .edu.tr email restriction | AuthModule (Pydantic email validator) | §3.1, §5.1, §7 |
| FR-02 | Email verification mechanism | AuthModule + Resend | §3.1, §5.1 |
| FR-03 | Role selection (engineer / healthcare only) | AuthModule (registration schema) | §3.1, §5.1, §7 |
| FR-04 | Email verified before access | SecurityMiddleware (JWT dependency) | §3.1, §7 |
| FR-05 | Resend verification email | AuthModule | §5.1 |
| FR-06 | JWT access + refresh tokens | AuthModule, SecurityMiddleware | §5.1, §7 |
| FR-07 | Token refresh endpoint | AuthModule | §5.1 |
| FR-08 | Admin not self-assignable | AuthModule (schema enum), DB seed | §3.1, §4.2.1, §7 |
| FR-10 | Create post with all fields | PostModule | §3.1, §5.2 |
| FR-11 | Draft or publish on creation | PostModule | §3.1, §5.2 |
| FR-12 | Edit post in draft/active | PostModule (owner guard) | §3.1, §5.2 |
| FR-13 | Owner deletes own post | PostModule (owner guard) | §5.2 |
| FR-14 | 30-day auto expiry | SchedulerModule | §3.1, §8.1 |
| FR-15 | Mark Partner Found | PostModule | §5.2, §8.1 |
| FR-16 | Post → Meeting Scheduled on acceptance | MeetingModule + PostModule | §5.3, §8.1, §8.2 |
| FR-17 | Post status displayed visually | Frontend Post Card component | §6.1, §6.2 |
| FR-20 | Paginated post feed | MatchingModule | §3.1, §5.2 |
| FR-21–FR-25 | Filters and search | MatchingModule | §3.1, §5.2 |
| FR-30 | Send meeting request | MeetingModule | §3.1, §5.3 |
| FR-31 | NDA acceptance flow | MeetingModule (nda_accepted validation) | §4.2.3, §5.3 |
| FR-32 | Propose up to 3 time slots | MeetingModule (proposed_times JSONB) | §4.2.3, §5.3 |
| FR-33 | Optional message | MeetingModule | §5.3 |
| FR-34 | Notification to post owner | NotificationModule | §3.1, §5.5 |
| FR-35 | Accept / decline request | MeetingModule (owner guard) | §5.3, §8.2 |
| FR-36 | Confirmation notification to both | NotificationModule | §5.5, §8.2 |
| FR-37 | Mark meeting completed | MeetingModule | §5.3, §8.2 |
| FR-38 | Cancel scheduled meeting | MeetingModule | §5.3, §8.2 |
| FR-40–FR-46 | Admin user/post/log management | AdminModule, AuditModule | §3.1, §5.6 |
| FR-50–FR-54 | Activity logging | AuditModule | §3.1, §4.2.4, §5.6 |
| FR-60 | GDPR account deletion | AuthModule / ProfileModule | §5.4, §7 |
| FR-61 | Data export as JSON | ProfileModule | §5.4 |
| FR-62 | Update profile | ProfileModule | §5.4 |
| FR-63 | Suspended user message | SecurityMiddleware (is_active check) | §7 |
| NFR-01 | Search < 1.5s | MatchingModule (indexed DB queries) | §4.2, §5.2 |
| NFR-02 | Page load < 3s | Frontend (Vite build, lazy loading) | §2.2 |
| NFR-03 | bcrypt password hashing | AuthModule | §7 |
| NFR-04 | HTTPS / TLS | Vercel + Railway (infra-level) | §2.3 |
| NFR-05 | Rate limiting | SecurityMiddleware (slowapi) | §3.1, §7 |
| NFR-06 | JWT expiry | AuthModule | §5.1, §7 |
| NFR-07 | RBAC at API layer | SecurityMiddleware | §3.1, §7 |
| NFR-08 | No patient data in schema | Database schema design | §4.2 |
| NFR-09 | GDPR / KVKK compliance | AuthModule, ProfileModule | §5.4, §7 |
| NFR-10 | WCAG 2.1 AA | Frontend (shadcn/ui accessible components) | §6 |
| NFR-11 | Dark / light mode | Frontend (Tailwind + shadcn/ui theme) | §6 |
| NFR-12 | Responsive desktop layout | Frontend (Tailwind responsive classes) | §6 |
