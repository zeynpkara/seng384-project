# Software Requirements Specification (SRS)
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
2. Overall Description  
3. Functional Requirements  
4. Non-Functional Requirements  
5. Use Cases  
6. Data Model  
7. Interface Requirements  
8. Requirements Traceability Matrix  
9. Appendices  

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document defines the functional and non-functional requirements for the **HEALTH AI Co-Creation & Innovation Platform**. The platform aims to connect healthcare professionals (doctors, researchers) with engineers (AI specialists, software developers) to enable structured collaboration on health technology projects. This document serves as the primary reference for design, development, and testing activities throughout the project lifecycle.

### 1.2 Scope

The HEALTH AI platform enables structured partner discovery and meeting scheduling between healthcare professionals and engineers. Users can create collaboration posts, search and filter posts by domain, city, and expertise, and coordinate meetings through a defined request-and-confirmation workflow.

The platform does **not** provide:
- Financial transactions or contract management
- Medical advice or clinical decision support
- Storage or processing of patient data or medical records
- Meeting hosting (meetings are conducted on external platforms such as Zoom or Microsoft Teams)

### 1.3 Definitions and Abbreviations

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| SDD | Software Design Document |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| UC | Use Case |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token — stateless authentication mechanism |
| NDA | Non-Disclosure Agreement — confidentiality agreement |
| GDPR | General Data Protection Regulation (EU) |
| KVKK | Kişisel Verilerin Korunması Kanunu (Turkish data protection law) |
| ORM | Object-Relational Mapper |
| WCAG | Web Content Accessibility Guidelines |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| UUID | Universally Unique Identifier |
| ENUM | Enumeration — a field restricted to a defined set of values |
| JSONB | Binary JSON — PostgreSQL native JSON storage type |

### 1.4 Intended Audience

- **Development Team:** Primary audience for implementation guidance
- **Course Instructor / Teaching Assistants:** For evaluation of requirement completeness and correctness
- **Project Group Members:** For shared understanding of system scope and behavior

---

## 2. Overall Description

### 2.1 Product Perspective

Currently, healthcare professionals with medical expertise, data, or project ideas and engineers with AI or software capabilities have no structured way to discover and connect with each other for collaborative health technology projects. Existing general-purpose platforms (LinkedIn, academic mailing lists) lack the domain-specific filtering, structured workflows, and privacy controls needed for this context.

HEALTH AI addresses this gap by providing a purpose-built platform that structures the discovery, matching, and initial coordination process between these two groups. The system operates as a standalone web application with a React frontend, FastAPI backend, and PostgreSQL database.

### 2.2 User Roles

| Role | Description | Key Permissions |
|---|---|---|
| **Engineer** | AI specialists, software developers, or researchers seeking healthcare domain expertise or collaborators | Create posts, edit own posts, browse all active posts, send meeting requests, manage own profile |
| **Healthcare Professional** | Doctors, clinicians, biomedical researchers seeking engineering talent to realize a project idea | Browse all active posts, send meeting requests, create posts, manage own profile |
| **Admin** | System administrator responsible for platform integrity | View/suspend/delete all users, view/remove all posts, view/export activity logs |

> **Note:** Both Engineer and Healthcare Professional roles share similar system permissions with minor differences in post intent. The Admin role is not selectable during registration; it is assigned directly in the database by an existing administrator.

### 2.3 Assumptions and Dependencies

- All users possess a valid institutional `.edu` or `.edu.tr` email address.
- Users have access to a modern web browser (Chrome, Firefox, Edge, Safari — latest versions).
- An external email delivery service (Resend) is available for sending verification and notification emails.
- Meetings between matched users take place on external platforms (Zoom, Teams); the platform only coordinates scheduling.
- No patient or clinical data will ever be uploaded or stored on the platform.
- The system will be deployed on cloud infrastructure (Vercel for frontend, Railway for backend and database).

### 2.4 Constraints

- Only institutional `.edu` or `.edu.tr` email addresses are accepted for registration.
- No file uploads are permitted (no documents, images, attachments).
- No patient data, clinical records, or personally identifiable health information may be stored.
- Meetings are conducted externally; the platform does not integrate with video conferencing APIs.
- The Admin role cannot be self-selected during registration.
- The system must comply with GDPR and KVKK regulations, including the right to deletion and data export.

---

## 3. Functional Requirements

### 3.1 User Registration & Access Control

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-01 | The system shall only allow registration with institutional `.edu` or `.edu.tr` email addresses. | High | Brief 4.1 |
| FR-02 | The system shall send a verification email upon registration containing a unique confirmation link. | High | Brief 4.1 |
| FR-03 | The user shall select one of two roles during registration: **Engineer** or **Healthcare Professional**. The Admin role shall not be available during self-registration. | High | Brief 4.1 |
| FR-04 | The system shall require email verification before granting access to any authenticated route. Unverified users shall see only a verification-pending page. | High | Brief 4.1 |
| FR-05 | The system shall allow users to request a resend of the verification email from the login page. | Medium | Brief 4.1 |
| FR-06 | The system shall issue a JWT access token (15-minute expiry) and a JWT refresh token (7-day expiry) upon successful login. | High | Brief 4.1 |
| FR-07 | The system shall provide a token refresh endpoint that issues a new access token given a valid refresh token. | High | Brief 4.1 |
| FR-08 | The Admin role shall only be assignable directly in the database or by an existing Admin; it shall not be exposed in any registration or profile-editing UI. | High | Brief 4.1 |

### 3.2 Post Management

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-10 | The system shall allow authenticated users to create a collaboration post containing: Title, Domain, Required Expertise, Project Stage, Confidentiality Level, City, and Description. | High | Brief 4.2 |
| FR-11 | The system shall allow the post creator to save the post as **Draft** (not visible to others) or publish it immediately as **Active**. | High | Brief 4.2 |
| FR-12 | The system shall allow the post owner to edit all fields of a post while it is in **Draft** or **Active** status. | High | Brief 4.2 |
| FR-13 | The system shall allow the post owner to delete their own post at any time regardless of status. | Medium | Brief 4.2 |
| FR-14 | The system shall automatically transition a post from **Active** to **Expired** status after 30 days of inactivity (no new meeting requests received). | Medium | Brief 4.2 |
| FR-15 | The system shall allow the post owner to manually mark a post as **Partner Found**, which closes the post and prevents new meeting requests. | High | Brief 4.2 |
| FR-16 | The system shall transition a post to **Meeting Scheduled** status when at least one meeting request for that post is accepted and a time is confirmed. | High | Brief 4.2 |
| FR-17 | The system shall display the post's current status visually (badge/label) on both the list view and detail view. | Medium | Brief 4.2 |

**Post Lifecycle States:** `draft → active → meeting_scheduled → partner_found` or `active → expired`

### 3.3 Search & Matching

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-20 | The system shall display a paginated list of all **Active** posts to authenticated users on the dashboard. | High | Brief 4.3 |
| FR-21 | The system shall allow filtering posts by **Domain** (e.g., Cardiology, Radiology, Biomedical). | High | Brief 4.3 |
| FR-22 | The system shall allow filtering posts by **City** for location-based partner discovery. | High | Brief 4.3 |
| FR-23 | The system shall allow filtering posts by **Status** (Active, Draft — own posts only, Expired, etc.). | Medium | Brief 4.3 |
| FR-24 | The system shall allow filtering posts by **Required Expertise** (e.g., Machine Learning Engineer). | High | Brief 4.3 |
| FR-25 | The system shall support keyword search across post **Title** and **Description** fields. | Medium | Brief 4.3 |

### 3.4 Meeting Request Workflow

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-30 | The system shall allow an authenticated user to send a meeting request to any **Active** post they do not own. | High | Brief 4.4 |
| FR-31 | If a post has **Confidentiality = NDA**, the requesting user must explicitly accept the NDA terms (checkbox confirmation) before submitting the meeting request. | High | Brief 4.4 |
| FR-32 | The meeting request form shall allow the requester to propose up to 3 available time slots (date + time). | High | Brief 4.4 |
| FR-33 | The requester may optionally include a short message (max 500 characters) introducing themselves and their interest. | Low | Brief 4.4 |
| FR-34 | The post owner shall receive a notification when a new meeting request is submitted. | High | Brief 4.4 |
| FR-35 | The post owner shall be able to **Accept** (selecting one of the proposed time slots) or **Decline** a meeting request. | High | Brief 4.4 |
| FR-36 | Upon acceptance, both parties shall receive a notification confirming the scheduled meeting time. The post status shall transition to **Meeting Scheduled**. | High | Brief 4.4 |
| FR-37 | The post owner shall be able to mark a meeting as **Completed** after it has taken place. | Medium | Brief 4.4 |
| FR-38 | Either party shall be able to **Cancel** a scheduled meeting, returning the post to **Active** status. | Medium | Brief 4.4 |

### 3.5 Administrative Dashboard

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-40 | The Admin shall be able to view a paginated list of all registered users, filterable by role, status (active/suspended), and registration date. | High | Brief 4.5 |
| FR-41 | The Admin shall be able to suspend a user account, preventing that user from logging in. | High | Brief 4.5 |
| FR-42 | The Admin shall be able to permanently delete a user account and all associated data. | High | Brief 4.5 |
| FR-43 | The Admin shall be able to view a paginated list of all posts, filterable by status, domain, and date. | High | Brief 4.5 |
| FR-44 | The Admin shall be able to remove any post deemed inappropriate, regardless of ownership. | High | Brief 4.5 |
| FR-45 | The Admin shall be able to view the activity log with filters for date range, user, and action type. | High | Brief 4.5 |
| FR-46 | The Admin shall be able to export the filtered activity log as a CSV file. | Medium | Brief 4.5 |

### 3.6 Activity Logging & Audit Trail

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-50 | The system shall log every successful user login with timestamp and user ID. | High | Brief 4.6 |
| FR-51 | The system shall log every post creation event with timestamp, user ID, and post ID. | High | Brief 4.6 |
| FR-52 | The system shall log every meeting request submission with timestamp, requester ID, and post ID. | High | Brief 4.6 |
| FR-53 | The system shall log all Admin actions (user suspension, post removal, account deletion) with timestamp and Admin ID. | High | Brief 4.6 |
| FR-54 | The system shall log post status transitions (e.g., draft→active, active→expired) with timestamp. | Medium | Brief 4.6 |

### 3.7 GDPR / Privacy & Profile Management

| ID | Requirement Description | Priority | Source |
|---|---|---|---|
| FR-60 | The system shall allow a user to permanently delete their own account from Profile Settings. All personal data (profile fields, posts, meeting requests) shall be hard-deleted or anonymized. | High | Brief 4.6 |
| FR-61 | The system shall allow a user to export all their personal data (profile info, posts, meeting history) as a downloadable JSON file. | Medium | Brief 4.6 |
| FR-62 | The system shall allow a user to update their profile information (full name, institution, city, expertise/specialty). | Medium | — |
| FR-63 | Suspended users shall receive an informative message upon login attempt rather than a generic authentication error. | Low | — |

---

## 4. Non-Functional Requirements

| ID | Requirement | Metric / Target | Category |
|---|---|---|---|
| NFR-01 | Search and filter results shall be returned within a specified time. | < 1.5 seconds (95th percentile) | Performance |
| NFR-02 | All page loads shall complete within a specified time under normal load. | < 3 seconds | Performance |
| NFR-03 | User passwords shall be stored using a strong one-way hashing algorithm. | bcrypt (cost factor ≥ 12) | Security |
| NFR-04 | All client-server communication shall be encrypted in transit. | HTTPS / TLS 1.2+ | Security |
| NFR-05 | Authentication endpoints shall implement rate limiting to prevent brute-force attacks. | Max 5 requests/minute per IP on `/api/auth/*` | Security |
| NFR-06 | JWT access tokens shall have a short expiry to limit exposure from token theft. | 15-minute access token, 7-day refresh token | Security |
| NFR-07 | The system shall implement Role-Based Access Control enforced at the API layer. | All protected routes verify role via middleware before processing | Security |
| NFR-08 | No patient data, clinical records, or personally identifiable health information shall be stored. | Zero patient data fields in schema; enforced by design | Privacy |
| NFR-09 | The system shall comply with GDPR and KVKK: users can delete their account and export their data. | Account deletion and data export features available to all authenticated users | GDPR/Privacy |
| NFR-10 | The platform UI shall be accessible to users with disabilities. | WCAG 2.1 Level AA compliance | Accessibility |
| NFR-11 | The UI shall support both light mode and dark mode. | System preference respected by default; manual toggle available | Usability |
| NFR-12 | The platform shall be usable on common desktop screen sizes. | Minimum 1280×720 resolution; responsive layout | Usability |

---

## 5. Use Cases

### UC-01: Engineer Creates a Post

| Field | Detail |
|---|---|
| **Name** | UC-01: Engineer Creates a Collaboration Post |
| **Actor(s)** | Engineer (authenticated, email verified) |
| **Precondition** | User is logged in and email is verified. |
| **Main Flow** | 1. User navigates to Dashboard and clicks "New Post". 2. System displays the post creation form. 3. User fills in: Title, Domain, Required Expertise, Project Stage, Confidentiality Level, City, Description. 4. User selects "Publish" to make the post Active, or "Save Draft" to keep it private. 5. System validates all required fields. 6. System saves the post, logs a `post_create` activity event, and redirects the user to the post detail page. |
| **Postcondition** | Post is saved with status `active` (or `draft`) and is visible in the post feed if published. |
| **Alternative Flow** | 3a. A required field is left blank → System highlights the missing field and displays an error message. Post is not submitted. |

---

### UC-02: Healthcare Professional Sends a Meeting Request

| Field | Detail |
|---|---|
| **Name** | UC-02: Healthcare Professional Sends Meeting Request |
| **Actor(s)** | Healthcare Professional (authenticated, email verified) |
| **Precondition** | User is logged in. The target post is in `active` status and not owned by the user. |
| **Main Flow** | 1. User browses the Dashboard and opens a post detail page. 2. User clicks "Request Meeting". 3. If the post has `confidentiality = nda`, system displays NDA terms and requires checkbox confirmation before proceeding. 4. User proposes up to 3 available time slots and optionally adds a message. 5. User submits the request. 6. System saves the meeting request with status `pending`, logs the event, and sends a notification to the post owner. |
| **Postcondition** | Meeting request is created with status `pending`. Post owner is notified. |
| **Alternative Flow** | 3a. User declines NDA terms → System prevents submission and shows a message that NDA acceptance is required. |
| **Alternative Flow** | 5a. User has already sent a request to this post → System displays an error: "You have already submitted a request for this post." |

---

### UC-03: Post Owner Accepts a Meeting Request

| Field | Detail |
|---|---|
| **Name** | UC-03: Post Owner Accepts Meeting Request and Schedules Meeting |
| **Actor(s)** | Engineer or Healthcare Professional (post owner) |
| **Precondition** | Post owner is logged in. At least one meeting request for their post is in `pending` status. |
| **Main Flow** | 1. Post owner navigates to "My Posts" or receives a notification. 2. User opens the meeting requests list for their post. 3. User reviews the pending request and proposed time slots. 4. User selects one time slot and clicks "Accept". 5. System updates the meeting request status to `scheduled`, transitions the post status to `meeting_scheduled`, and sends confirmation notifications to both parties. |
| **Postcondition** | Meeting request is `scheduled`. Both parties are notified of the confirmed time. Post status is `meeting_scheduled`. |
| **Alternative Flow** | 4a. User clicks "Decline" → Meeting request status set to `declined`. Post remains `active`. Requester is notified. |

---

### UC-04: Admin Removes Inappropriate Post

| Field | Detail |
|---|---|
| **Name** | UC-04: Admin Removes an Inappropriate Post |
| **Actor(s)** | Admin |
| **Precondition** | Admin is logged in. |
| **Main Flow** | 1. Admin navigates to Admin Panel → Posts. 2. Admin searches or filters to find the post. 3. Admin opens the post detail. 4. Admin clicks "Remove Post". 5. System asks for confirmation. 6. Admin confirms. 7. System deletes the post, logs the `admin_post_remove` event with admin ID and post ID, and displays a success message. |
| **Postcondition** | Post is permanently deleted. Activity log records the removal action. |
| **Alternative Flow** | 6a. Admin cancels → No action taken. |

---

### UC-05: User Deletes Account (GDPR)

| Field | Detail |
|---|---|
| **Name** | UC-05: User Permanently Deletes Their Account |
| **Actor(s)** | Engineer or Healthcare Professional |
| **Precondition** | User is logged in. |
| **Main Flow** | 1. User navigates to Profile Settings. 2. User clicks "Delete Account". 3. System displays a warning: "This action is permanent and cannot be undone. All your data will be deleted." 4. User confirms by entering their password. 5. System verifies the password. 6. System deletes or anonymizes all user data (profile, posts, meeting requests) and invalidates all active tokens. 7. User is redirected to the landing page with a confirmation message. |
| **Postcondition** | User account and all associated data are permanently removed. |
| **Alternative Flow** | 5a. Password is incorrect → System shows an error. Account is not deleted. |

---

### UC-06: User Registers and Verifies Email

| Field | Detail |
|---|---|
| **Name** | UC-06: New User Registers and Verifies Institutional Email |
| **Actor(s)** | New user (unauthenticated) |
| **Precondition** | User has a valid `.edu` or `.edu.tr` email address. |
| **Main Flow** | 1. User navigates to the registration page. 2. User enters: full name, institutional email, password, and selects a role (Engineer or Healthcare Professional). 3. User submits the form. 4. System validates the email domain. 5. System creates the account with `email_verified = false` and sends a verification email containing a unique token link. 6. User opens the email and clicks the verification link. 7. System sets `email_verified = true` and redirects the user to the Dashboard. |
| **Postcondition** | User account is created and verified. User can access all authenticated routes. |
| **Alternative Flow** | 4a. Email domain is not `.edu` or `.edu.tr` → System displays: "Only institutional .edu email addresses are accepted." |
| **Alternative Flow** | 6a. Verification link has expired → User can request a new verification email from the login page. |

---

## 6. Data Model

### Entities and Relationships

| Entity | Key Fields | Relationships |
|---|---|---|
| **User** | id, email, password_hash, role, full_name, institution, city, expertise, email_verified, is_active, created_at | Has many Posts, has many MeetingRequests (as requester), has many ActivityLogs, has many Notifications |
| **Post** | id, user_id, title, domain, expertise_req, project_stage, confidentiality, city, description, status, expires_at, created_at, updated_at | Belongs to User (owner), has many MeetingRequests |
| **MeetingRequest** | id, post_id, requester_id, status, proposed_times (JSONB), accepted_time, nda_accepted, message, created_at | Belongs to Post, belongs to User (requester) |
| **ActivityLog** | id, user_id, action_type, metadata (JSONB), created_at | Belongs to User |
| **Notification** | id, user_id, type, message, is_read, created_at | Belongs to User |

### Key Relationships
- A **User** can own many **Posts** (one-to-many)
- A **Post** can receive many **MeetingRequests** (one-to-many)
- A **User** can send many **MeetingRequests** (one-to-many)
- A **User** generates many **ActivityLog** entries (one-to-many)
- A **User** receives many **Notifications** (one-to-many)

---

## 7. Interface Requirements

### 7.1 User Interface (UI)

The platform shall provide a web-based UI with the following primary screens:

| Screen | Description | Access |
|---|---|---|
| Landing Page (`/`) | Platform overview, login and register CTAs | Public |
| Register (`/register`) | Role selection, email, password input form | Public |
| Login (`/login`) | Email and password login | Public |
| Email Verification (`/verify-email`) | Verification pending message, resend option | Public |
| Dashboard (`/dashboard`) | Post feed with search and filter controls | Authenticated |
| Create Post (`/posts/new`) | Post creation form | Authenticated |
| Post Detail (`/posts/:id`) | Full post info, meeting request button | Authenticated |
| My Posts (`/my-posts`) | Owner's own posts with lifecycle controls | Authenticated |
| Meetings (`/meetings`) | Sent and received meeting requests | Authenticated |
| Profile (`/profile`) | Profile editing, GDPR data export/delete | Authenticated |
| Notifications (`/notifications`) | Notification list with read/unread state | Authenticated |
| Admin — Users (`/admin/users`) | Full user management | Admin |
| Admin — Posts (`/admin/posts`) | Full post management | Admin |
| Admin — Logs (`/admin/logs`) | Activity log viewer with CSV export | Admin |

UI shall support dark mode and light mode, with the system preference respected by default. The design shall use Tailwind CSS and shadcn/ui components for a premium, accessible appearance.

### 7.2 External System Interfaces

| System | Purpose | Integration Method |
|---|---|---|
| **Resend** (email service) | Sending verification emails and meeting notifications | REST API (HTTP calls from FastAPI backend) |
| **External Meeting Platforms** (Zoom, Teams) | Conducting the actual meetings | No integration — platform only communicates the agreed time; users coordinate externally |

---

## 8. Requirements Traceability Matrix

| Req. ID | Requirement Summary | Source (Brief) | Related Use Case |
|---|---|---|---|
| FR-01 | .edu / .edu.tr email restriction | Brief 4.1 | UC-06 |
| FR-02 | Email verification mechanism | Brief 4.1 | UC-06 |
| FR-03 | Role selection during registration (Engineer / Healthcare) | Brief 4.1 | UC-06 |
| FR-04 | Email verification required before access | Brief 4.1 | UC-06 |
| FR-05 | Resend verification email | Brief 4.1 | UC-06 |
| FR-06 | JWT access + refresh token issuance | Brief 4.1 | UC-01, UC-02 |
| FR-07 | Token refresh endpoint | Brief 4.1 | — |
| FR-08 | Admin role not self-assignable | Brief 4.1 | UC-04 |
| FR-10 | Post creation with all required fields | Brief 4.2 | UC-01 |
| FR-11 | Draft or publish on creation | Brief 4.2 | UC-01 |
| FR-12 | Edit post in Draft or Active status | Brief 4.2 | UC-01 |
| FR-13 | Post owner can delete own post | Brief 4.2 | — |
| FR-14 | Automatic 30-day expiry | Brief 4.2 | — |
| FR-15 | Mark post as Partner Found | Brief 4.2 | UC-03 |
| FR-16 | Post transitions to Meeting Scheduled on acceptance | Brief 4.2 | UC-03 |
| FR-17 | Post status displayed visually | Brief 4.2 | UC-01, UC-03 |
| FR-20 | Paginated post feed on dashboard | Brief 4.3 | UC-02 |
| FR-21 | Filter by Domain | Brief 4.3 | UC-02 |
| FR-22 | Filter by City | Brief 4.3 | UC-02 |
| FR-23 | Filter by Status | Brief 4.3 | UC-02 |
| FR-24 | Filter by Required Expertise | Brief 4.3 | UC-02 |
| FR-25 | Keyword search in title/description | Brief 4.3 | UC-02 |
| FR-30 | Send meeting request | Brief 4.4 | UC-02 |
| FR-31 | NDA acceptance for confidential posts | Brief 4.4 | UC-02 |
| FR-32 | Propose up to 3 time slots | Brief 4.4 | UC-02 |
| FR-33 | Optional message in meeting request | Brief 4.4 | UC-02 |
| FR-34 | Notification to post owner on new request | Brief 4.4 | UC-02 |
| FR-35 | Post owner accepts or declines request | Brief 4.4 | UC-03 |
| FR-36 | Confirmation notification to both parties | Brief 4.4 | UC-03 |
| FR-37 | Mark meeting as completed | Brief 4.4 | UC-03 |
| FR-38 | Cancel a scheduled meeting | Brief 4.4 | — |
| FR-40 | Admin views all users with filters | Brief 4.5 | UC-04 |
| FR-41 | Admin suspends user account | Brief 4.5 | — |
| FR-42 | Admin deletes user account | Brief 4.5 | — |
| FR-43 | Admin views all posts with filters | Brief 4.5 | UC-04 |
| FR-44 | Admin removes inappropriate post | Brief 4.5 | UC-04 |
| FR-45 | Admin views activity logs | Brief 4.5 | UC-04 |
| FR-46 | Admin exports logs as CSV | Brief 4.5 | — |
| FR-50 | Log user login events | Brief 4.6 | — |
| FR-51 | Log post creation events | Brief 4.6 | — |
| FR-52 | Log meeting request events | Brief 4.6 | — |
| FR-53 | Log Admin actions | Brief 4.6 | UC-04 |
| FR-54 | Log post status transitions | Brief 4.6 | — |
| FR-60 | User can delete own account (GDPR hard delete) | Brief 4.6 | UC-05 |
| FR-61 | User can export personal data as JSON | Brief 4.6 | — |
| FR-62 | User can update profile information | — | — |
| FR-63 | Suspended user sees informative login message | — | — |
| NFR-01 | Search response < 1.5 seconds | Brief 5 | — |
| NFR-02 | Page load < 3 seconds | Brief 5 | — |
| NFR-03 | Passwords hashed with bcrypt (cost ≥ 12) | Brief 5 | — |
| NFR-04 | HTTPS / TLS 1.2+ enforced | Brief 5 | — |
| NFR-05 | Rate limiting on auth endpoints | Brief 5 | — |
| NFR-06 | JWT token expiry (15min / 7 days) | Brief 5 | — |
| NFR-07 | RBAC enforced at API layer | Brief 5 | UC-04 |
| NFR-08 | No patient data stored | Brief 5 | — |
| NFR-09 | GDPR / KVKK compliance | Brief 5 | UC-05 |
| NFR-10 | WCAG 2.1 Level AA accessibility | Brief 5 | — |
| NFR-11 | Dark mode / light mode support | Brief 5 | — |
| NFR-12 | Responsive for desktop (min 1280×720) | Brief 5 | — |

---

## 9. Appendices

- **Appendix A:** Use Case Diagram *(to be added as diagram image)*
- **Appendix B:** Wireframe / Mockup Images *(to be added — key screens: Registration, Dashboard, Post Detail, Meeting Request)*
- **Appendix C:** ER Diagram *(to be added as diagram image)*
