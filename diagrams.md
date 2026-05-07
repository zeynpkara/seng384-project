# HEALTH AI — Diyagram Dokümantasyonu

Bu dosya SDD (Software Design Document) için gereken 6 temel diyagramın tam içeriğini,
akış mantığını ve PlantUML kaynak kodlarını içermektedir.

---

## Diyagram 1 — Deployment Diagram (Bölüm 2.3)

### Açıklama

Sistemin fiziksel/çevresel dağılımını gösterir. HEALTH AI üç katmandan oluşur:

| Katman | Teknoloji | Port / Protokol |
|---|---|---|
| Frontend (Client) | React + Vite (Vercel/Netlify) | HTTPS :443 |
| Backend API | Node.js + Express (Docker / Heroku) | HTTP :8000 |
| Database | PostgreSQL (Supabase / AWS RDS) | TCP :5432 |
| Email Service | Mailtrap SMTP (Demo) | TCP :2525 |

**Bağlantı akışı:**
1. Kullanıcının tarayıcısı → Frontend statik dosyaları HTTPS üzerinden alır.
2. Frontend → Backend REST API çağrıları yapar (`VITE_API_URL=http://localhost:8000`). CORS sadece frontend origin'ine izin verir.
3. Backend → PostgreSQL veritabanına `DATABASE_URL` environment variable üzerinden bağlanır. Tüm sorgular Prisma ORM ile yapılır; SQL injection olmaz.
4. Backend → Kayıt akışında Mailtrap SMTP'ye e-posta gönderir (`sendVerificationEmail`).
5. Backend Helmet.js ile HTTP başlıklarını güvence altına alır; rate limiting `/api/auth/*` endpoint'lerine uygulanır (10 req/15 dk).

### PlantUML Kodu

```plantuml
@startuml Deployment_Diagram
!theme plain
skinparam backgroundColor #0E0E0E
skinparam defaultFontColor #E6E0E9
skinparam node {
  BackgroundColor #1A1A2E
  BorderColor #CFBCFF
  FontColor #E6E0E9
}
skinparam database {
  BackgroundColor #1A2E1A
  BorderColor #10B981
}
skinparam cloud {
  BackgroundColor #2E1A1A
  BorderColor #DC2626
}

node "User Browser\n(Chrome / Firefox)" as Browser

node "Frontend Host\n(Vercel / Netlify)" as FrontendHost {
  artifact "React + Vite SPA\n(TypeScript)" as FE
}

node "Backend Host\n(Docker Container\nHeroku / AWS EC2)" as BackendHost {
  artifact "Express.js API\n(Node.js + TypeScript)" as BE
  artifact "Prisma ORM\nClient" as Prisma
  artifact "Helmet.js\n+ Rate Limiter" as Security
}

database "PostgreSQL\n(Supabase / AWS RDS)\nPort: 5432" as DB

cloud "Mailtrap SMTP\n(Demo Email Service)\nPort: 2525" as Mailtrap

Browser --> FrontendHost : HTTPS :443\n(GET static assets)
Browser --> BackendHost : HTTPS REST API\nOrigin: frontend URL only\n(CORS restricted)
FE --> BE : fetch() / axios\nHTTP :8000\nBearer JWT
BE --> Security : Every request
Security --> Prisma : Validated requests
Prisma --> DB : TCP :5432\nDATABASE_URL env
BE --> Mailtrap : SMTP :2525\n(Registration email\nverification)

note right of BackendHost
  Environment variables:
  DATABASE_URL
  JWT_SECRET (min 32 chars)
  SMTP_HOST / SMTP_USER / SMTP_PASS
  FRONTEND_URL (CORS origin)
end note

note right of FrontendHost
  Environment variables:
  VITE_API_URL=http://backend:8000
end note
@enduml
```

---

## Diyagram 2 — Component / Interaction Diagram (Bölüm 3.2)

### Açıklama

Backend içindeki modüllerin (route → middleware → controller → service → DB) birbirleriyle
nasıl etkileştiğini gösterir.

**Modüller ve sorumlulukları:**

| Modül | Dosyalar | Görev |
|---|---|---|
| AuthModule | `routes/auth.ts` + `controllers/authController.ts` | Kayıt, login, email doğrulama, logout |
| PostModule | `routes/posts.ts` + `controllers/postsController.ts` | İlan CRUD, publish, close, delete |
| MeetingModule | `routes/meetings.ts` + `controllers/meetingsController.ts` | İlgi, NDA, slot önerme/onaylama, red |
| AdminModule | `routes/admin.ts` + `controllers/adminController.ts` | Kullanıcı/post yönetimi, log görüntüleme + CSV export |
| UsersModule | `routes/users.ts` + `controllers/usersController.ts` | Profil görüntüleme/güncelleme, GDPR (export/delete) |

**Middleware katmanı:**

| Middleware | Dosya | Ne zaman devreye girer |
|---|---|---|
| `authenticate` | `middleware/auth.ts` | Korumalı tüm endpoint'lerde — Bearer JWT doğrular |
| `roleGuard(...roles)` | `middleware/roleGuard.ts` | Rol kısıtlı endpoint'lerde (ör. Admin-only) |
| `eduEmailCheck` | `middleware/eduEmail.ts` | `POST /api/auth/register` — `.edu` veya `.edu.tr` zorunlu |

**Servisler:**

| Servis | Dosya | Kim kullanır |
|---|---|---|
| `auditService.log()` | `services/auditService.ts` | AuthModule, PostModule, MeetingModule, AdminModule, UsersModule — her işlem sonunda çağrılır |
| `sendVerificationEmail()` | `services/emailService.ts` | Sadece AuthModule (register akışı) |

**Yardımcı:**

| Util | Dosya | Kim kullanır |
|---|---|---|
| `transition(postId, to, triggeredBy)` + `canTransition()` | `utils/postLifecycle.ts` | PostModule (publish, close), MeetingModule (slot confirm → MEETING_SCHEDULED) |

**Kritik etkileşimler:**
- `MeetingModule.confirmSlot()` → `postLifecycle.transition(postId, 'MEETING_SCHEDULED', 'SYSTEM')` çağırır — Post durumunu otomatik günceller.
- `AdminModule` tüm veriye erişebilir ama `roleGuard('ADMIN')` ile korunur.
- `auditService.log()` fire-and-forget'tir: başarısız olsa bile API response crash olmaz.

### PlantUML Kodu

```plantuml
@startuml Component_Diagram
!theme plain
skinparam backgroundColor #0E0E0E
skinparam defaultFontColor #E6E0E9

skinparam component {
  BackgroundColor #1A1A2E
  BorderColor #2563EB
  FontColor #E6E0E9
}

skinparam package {
  BackgroundColor #0E0E1A
  BorderColor #CFBCFF
}

package "Middleware Layer" {
  [authenticate\n(JWT verify)] as Auth
  [roleGuard\n(RBAC)] as RoleGuard
  [eduEmailCheck\n(.edu validation)] as EduCheck
}

package "Route Modules" {
  [AuthModule\nPOST /api/auth/*] as AuthMod
  [PostModule\nGET|POST|PATCH|DELETE /api/posts/*] as PostMod
  [MeetingModule\nGET|POST|PATCH /api/meetings/*] as MeetMod
  [AdminModule\nGET|PATCH|DELETE /api/admin/*] as AdminMod
  [UsersModule\nGET|PATCH|DELETE /api/users/me] as UsersMod
}

package "Services" {
  [auditService\n.log(action, userId, entity)] as AuditSvc
  [emailService\nsendVerificationEmail()] as EmailSvc
}

package "Utilities" {
  [postLifecycle\ntransition() / canTransition()] as Lifecycle
}

database "PostgreSQL\n(via Prisma ORM)" as DB

' Middleware wiring
AuthMod --> EduCheck : register only
PostMod --> Auth : all protected routes
MeetMod --> Auth : all routes
AdminMod --> Auth : all routes
AdminMod --> RoleGuard : roleGuard('ADMIN')
UsersMod --> Auth : all routes

' Service usage
AuthMod --> AuditSvc : USER_REGISTERED\nEMAIL_VERIFIED\nUSER_LOGIN\nUSER_LOGOUT
AuthMod --> EmailSvc : sendVerificationEmail()

PostMod --> AuditSvc : POST_CREATED\nPOST_PUBLISHED\nPOST_EDITED\nPOST_CLOSED\nPOST_DELETED
PostMod --> Lifecycle : publish() → DRAFT→ACTIVE\nclose() → MEETING_SCHEDULED→CLOSED

MeetMod --> AuditSvc : INTEREST_EXPRESSED\nNDA_ACCEPTED\nSLOTS_PROPOSED\nMEETING_CONFIRMED\nMEETING_REJECTED
MeetMod --> Lifecycle : confirmSlot() → ACTIVE→MEETING_SCHEDULED\n(triggered by SYSTEM)

AdminMod --> AuditSvc : USER_SUSPENDED\nUSER_DELETED\nPOST_MODERATED

UsersMod --> AuditSvc : DATA_EXPORTED\nACCOUNT_DELETED

' DB access
AuthMod --> DB
PostMod --> DB
MeetMod --> DB
AdminMod --> DB
UsersMod --> DB
AuditSvc --> DB : ActivityLog.create()\n(fire-and-forget)
@enduml
```

---

## Diyagram 3 — ER Diagram (Bölüm 4.1)

### Açıklama

`backend/prisma/schema.prisma` dosyasından türetilen tam veri modeli.

**Tablolar ve alanlar:**

**User**
- `id` UUID PK
- `email` STRING UNIQUE — sadece `.edu` / `.edu.tr`
- `passwordHash` STRING — bcrypt rounds:12
- `role` ENUM(HEALTHCARE, ENGINEER, ADMIN)
- `name` STRING
- `institution` STRING
- `isVerified` BOOLEAN default false
- `verificationToken` STRING nullable — email doğrulama token'ı
- `isSuspended` BOOLEAN default false
- `ndaAcceptedAt` DATETIME nullable — bir kez set edilir, kalıcıdır
- `createdAt` DATETIME

**Post**
- `id` UUID PK
- `title` STRING
- `domain` STRING — tıbbi/mühendislik alanı
- `description` STRING — MEETING_ONLY ise 120 karakter kısaltılır
- `requiredExpertise` STRING
- `projectStage` ENUM(IDEA, CONCEPT_VALIDATION, PROTOTYPE, PILOT_TESTING, PRE_DEPLOYMENT)
- `confidentiality` ENUM(PUBLIC, MEETING_ONLY)
- `city` STRING
- `country` STRING
- `commitmentLevel` STRING
- `status` ENUM(DRAFT, ACTIVE, MEETING_SCHEDULED, CLOSED, EXPIRED) default DRAFT
- `expiresAt` DATETIME nullable
- `autoClose` BOOLEAN default false
- `ownerId` UUID FK→User
- `createdAt` DATETIME
- `updatedAt` DATETIME

**MeetingRequest**
- `id` UUID PK
- `postId` UUID FK→Post
- `requesterId` UUID FK→User (relation: "Requester")
- `postOwnerId` UUID FK→User (relation: "PostOwner")
- `status` ENUM(NDA_PENDING, PENDING, SLOTS_PROPOSED, CONFIRMED, REJECTED, CANCELLED) default PENDING
- `message` STRING nullable — ilk mesaj
- `ndaAccepted` BOOLEAN default false
- `ndaAcceptedAt` DATETIME nullable
- `proposedSlots` JSON nullable — `[{date: "YYYY-MM-DD", time: "HH:MM"}]` array, max 3
- `confirmedSlot` JSON nullable — `{date, time}`
- `createdAt` DATETIME
- `updatedAt` DATETIME

**ActivityLog**
- `id` UUID PK
- `userId` UUID FK→User nullable (sistem aksiyonları için null olabilir)
- `action` STRING — ör: "USER_LOGIN", "NDA_ACCEPTED"
- `entity` STRING nullable — ör: "Post", "MeetingRequest"
- `entityId` STRING nullable
- `ipAddress` STRING nullable
- `metadata` JSON nullable
- `createdAt` DATETIME

**İlişkiler:**
- `User` 1 ←→ N `Post` (ownerId) — bir kullanıcı birden fazla ilan açabilir
- `User` 1 ←→ N `MeetingRequest` (requesterId) — bir kullanıcı birden fazla ilgi ifade edebilir
- `User` 1 ←→ N `MeetingRequest` (postOwnerId) — bir kullanıcı birden fazla isteği alabilir
- `Post` 1 ←→ N `MeetingRequest` (postId) — bir ilana birden fazla talep gelebilir
- `User` 0..1 ←→ N `ActivityLog` (userId) — nullable: sistem aksiyonları user'sız loglanabilir

### PlantUML Kodu

```plantuml
@startuml ER_Diagram
!theme plain
skinparam backgroundColor #0E0E0E
skinparam defaultFontColor #E6E0E9
skinparam entity {
  BackgroundColor #1A1A2E
  BorderColor #CFBCFF
  FontColor #E6E0E9
}

entity "User" as User {
  * id : UUID <<PK>>
  --
  * email : STRING <<UNIQUE>>
  * passwordHash : STRING
  * role : ENUM(HEALTHCARE|ENGINEER|ADMIN)
  * name : STRING
  * institution : STRING
  * isVerified : BOOLEAN = false
  verificationToken : STRING <<nullable>>
  * isSuspended : BOOLEAN = false
  ndaAcceptedAt : DATETIME <<nullable>>
  * createdAt : DATETIME
}

entity "Post" as Post {
  * id : UUID <<PK>>
  --
  * title : STRING
  * domain : STRING
  * description : STRING
  * requiredExpertise : STRING
  * projectStage : ENUM(IDEA|CONCEPT_VALIDATION|\nPROTOTYPE|PILOT_TESTING|\nPRE_DEPLOYMENT)
  * confidentiality : ENUM(PUBLIC|MEETING_ONLY)
  * city : STRING
  * country : STRING
  * commitmentLevel : STRING
  * status : ENUM(DRAFT|ACTIVE|\nMEETING_SCHEDULED|CLOSED|EXPIRED)
  expiresAt : DATETIME <<nullable>>
  * autoClose : BOOLEAN = false
  * ownerId : UUID <<FK>>
  * createdAt : DATETIME
  * updatedAt : DATETIME
}

entity "MeetingRequest" as Meeting {
  * id : UUID <<PK>>
  --
  * postId : UUID <<FK>>
  * requesterId : UUID <<FK>>
  * postOwnerId : UUID <<FK>>
  * status : ENUM(NDA_PENDING|PENDING|\nSLOTS_PROPOSED|CONFIRMED|\nREJECTED|CANCELLED)
  message : STRING <<nullable>>
  * ndaAccepted : BOOLEAN = false
  ndaAcceptedAt : DATETIME <<nullable>>
  proposedSlots : JSON <<nullable>>
  confirmedSlot : JSON <<nullable>>
  * createdAt : DATETIME
  * updatedAt : DATETIME
}

entity "ActivityLog" as Log {
  * id : UUID <<PK>>
  --
  userId : UUID <<FK, nullable>>
  * action : STRING
  entity : STRING <<nullable>>
  entityId : STRING <<nullable>>
  ipAddress : STRING <<nullable>>
  metadata : JSON <<nullable>>
  * createdAt : DATETIME
}

User ||--o{ Post : "owns\n(ownerId)"
User ||--o{ Meeting : "sends interest\n(requesterId)"
User ||--o{ Meeting : "receives interest\n(postOwnerId)"
Post ||--o{ Meeting : "has requests\n(postId)"
User |o--o{ Log : "logged actions\n(userId, nullable)"
@enduml
```

---

## Diyagram 4 — Navigation Flow Diagram (Bölüm 6.1)

### Açıklama

`frontend/src/App.tsx` route yapısı ve `Layout.tsx` navigation mantığından türetilmiştir.

**Route korumaları (`ProtectedRoute` component'i):**
- `user === null` → `/` (Landing) sayfasına yönlendir
- `user.role !== requiredRole` → `/unauthorized` (403 ekranı) göster

**Rol bazlı yönlendirmeler (login sonrası):**
- `HEALTHCARE` → `/dashboard`
- `ENGINEER` → `/projects`
- `ADMIN` → `/admin`

**Sidebar menü (rol bazlı):**
- ADMIN: Security Audit, Announcements, Meetings, NDA Tracking, Profile
- HEALTHCARE/ENGINEER: Create Post, My Posts, Announcements, Meetings, NDA Tracking, Profile

**Ekranlar ve erişim:**

| Yol | Ekran | Erişim |
|---|---|---|
| `/` | Landing | Herkese açık |
| `/unauthorized` | 403 ekranı | Herkese açık |
| `/dashboard` | Healthcare Dashboard (post listesi + meetings) | Sadece HEALTHCARE |
| `/projects` | Technical Dashboard (post listesi + meetings) | Sadece ENGINEER |
| `/admin` | System Admin Paneli | Sadece ADMIN |
| `/profile` | Profil sayfası | Tüm auth kullanıcılar |
| `/announcements` | Duyurular (Dashboard render eder) | Tüm auth kullanıcılar |
| `/meetings` | Toplantılar (Dashboard render eder) | Tüm auth kullanıcılar |
| `/nda` | NDA Takibi (TechnicalDashboard render eder) | Tüm auth kullanıcılar |
| `/collaborators` | Coming soon (Dashboard) | Tüm auth kullanıcılar |
| `/network` | Coming soon (TechnicalDashboard) | Tüm auth kullanıcılar |

**NDA Modal tetikleme akışı:**
Post listesinde "Express Interest" tıklandığında:
1. Backend `POST /api/meetings/express-interest/:postId` çağrılır
2. Yanıtta `requiresNDA: true` gelirse → `NdaModal` açılır
3. Kullanıcı "I Accept & Proceed" → `POST /api/meetings/:id/accept-nda`
4. Backend `users.ndaAcceptedAt` set eder + `MeetingRequest.status = PENDING`
5. Gelecekteki "Express Interest" tıklamalarında NDA modal tekrar çıkmaz

### PlantUML Kodu

```plantuml
@startuml Navigation_Flow
!theme plain
skinparam backgroundColor #0E0E0E
skinparam defaultFontColor #E6E0E9
skinparam activity {
  BackgroundColor #1A1A2E
  BorderColor #CFBCFF
  FontColor #E6E0E9
  DiamondBackgroundColor #2E1A2E
  DiamondBorderColor #CFBCFF
}

start

:User visits app;

if (Is authenticated?) then (No)
  :Landing Page (/)\nHero + How-it-works\n+ role cards;
  
  fork
    :Click "Login";
    :Auth Modal — Login tab\n(email + password form\nor mock role buttons);
    :POST /api/auth/login;
    if (Login success?) then (yes)
      :Store JWT + user\nin localStorage;
    else (no)
      :Show error message;
      stop
    end if
  fork again
    :Click "Register";
    :Auth Modal — Register tab\n(name, institution,\nemail, password, role);
    if (.edu or .edu.tr email?) then (yes)
      :POST /api/auth/register;
      :"Check your inbox" success state;
      :User clicks email verification link;
      :GET /api/auth/verify/:token;
      :Account activated → back to login;
    else (no)
      :Show validation error;
      stop
    end if
  end fork

else (Yes)
end if

if (User role?) then (HEALTHCARE)
  :Dashboard (/dashboard)\nPost list + Meeting requests;
else if (User role?) then (ENGINEER)
  :Technical Dashboard (/projects)\nPost list + Meeting requests;
else (ADMIN)
  :System Admin (/admin)\nUsers, Posts, Logs;
  stop
end if

:Browse post list\n(GET /api/posts?filters);

fork
  :Click "Create Post"\n(sidebar menu);
  :PostCreateModal opens;
  :Fill form: title, domain,\ndescription, stage, city...;
  :POST /api/posts → DRAFT created;
  :PATCH /api/posts/:id/publish → ACTIVE;
fork again
  :Click post card;
  :View post detail\n(GET /api/posts/:id);
  
  if (Own post?) then (yes)
    :See Edit / Close buttons;
    :PATCH /api/posts/:id (edit);
    :or PATCH /api/posts/:id/close;
  else (no)
    :Click "Express Interest";
    :POST /api/meetings/express-interest/:postId;
    
    if (NDA already accepted?) then (yes)
      :MeetingRequest created\nstatus: PENDING;
    else (no)
      :NDA Modal appears;
      if (User clicks "I Accept & Proceed"?) then (yes)
        :POST /api/meetings/:id/accept-nda;
        :users.ndaAcceptedAt set (permanent);
        :MeetingRequest status → PENDING;
      else (no)
        :NDA Modal closed\nNo meeting created;
        stop
      end if
    end if
    
    :Post owner logs in\nSees PENDING request;
    :POST /api/meetings/:id/propose-slots\n(up to 3 time slots);
    :Requester sees SLOTS_PROPOSED;
    :PATCH /api/meetings/:id/confirm-slot\n(choose one slot);
    :Meeting status → CONFIRMED\nPost status → MEETING_SCHEDULED;
  end if
end fork

fork
  :Sidebar → Meetings (/meetings)\nSee all meeting requests;
fork again
  :Sidebar → Profile (/profile)\nUpdate info / GDPR export / Delete account;
fork again
  :Sidebar → NDA Tracking (/nda)\nNDA status overview;
end fork

stop
@enduml
```

---

## Diyagram 5 — Post Lifecycle State Diagram (Bölüm 8.1)

### Açıklama

`backend/src/utils/postLifecycle.ts` dosyasındaki `ALLOWED` geçiş tablosundan türetilmiştir.

**Durumlar ve terminalleri:**

| Durum | Terminal mi? | Anlamı |
|---|---|---|
| DRAFT | Hayır | İlan oluşturuldu, henüz yayında değil |
| ACTIVE | Hayır | İlan yayında, ilgi ifade edilebilir |
| MEETING_SCHEDULED | Hayır | En az bir toplantı onaylandı |
| CLOSED | **Evet** | Partner bulundu veya admin kapattı — geri dönüş yok |
| EXPIRED | **Evet** | `expiresAt` tarihi geçti, sistem otomatik kapattı — geri dönüş yok |

**Geçiş tablosu (`postLifecycle.ts` ALLOWED sabiti):**

| Başlangıç | Hedef | Tetikleyici | Kim | Endpoint / Mekanizma |
|---|---|---|---|---|
| — | DRAFT | Post oluşturuldu | İlan sahibi | `POST /api/posts` |
| DRAFT | ACTIVE | "Publish" tıklandı | OWNER (İlan sahibi) | `PATCH /api/posts/:id/publish` |
| ACTIVE | MEETING_SCHEDULED | Toplantı onaylandı | SYSTEM (otomatik) | `PATCH /api/meetings/:id/confirm-slot` içinden |
| ACTIVE | EXPIRED | `expiresAt` geçti | SYSTEM (cron/zamanlanmış) | Scheduled check |
| ACTIVE | CLOSED | Admin kapattı | ADMIN | `PATCH /api/posts/:id/close` |
| MEETING_SCHEDULED | CLOSED | "Partner Found" tıklandı | OWNER veya ADMIN | `PATCH /api/posts/:id/close` |

**Kural:** CLOSED ve EXPIRED'dan hiçbir duruma geçiş yoktur.

### PlantUML Kodu

```plantuml
@startuml Post_Lifecycle
!theme plain
skinparam backgroundColor #0E0E0E
skinparam defaultFontColor #E6E0E9
skinparam state {
  BackgroundColor #1A1A2E
  BorderColor #2563EB
  FontColor #E6E0E9
  EndColor #DC2626
}

[*] --> DRAFT : POST /api/posts\nİlan sahibi oluşturdu

DRAFT --> ACTIVE : PATCH /api/posts/:id/publish\n[OWNER: "Publish" butonuna basıldı]

ACTIVE --> MEETING_SCHEDULED : SYSTEM otomatik\n[MeetingModule.confirmSlot() tetikledi\ntransition(postId, 'MEETING_SCHEDULED', 'SYSTEM')]

ACTIVE --> EXPIRED : SYSTEM otomatik\n[expiresAt tarihi geçti\n(cron / zamanlanmış kontrol)]

ACTIVE --> CLOSED : PATCH /api/posts/:id/close\n[ADMIN kapattı]

MEETING_SCHEDULED --> CLOSED : PATCH /api/posts/:id/close\n[OWNER: "Partner Found" işaretledi\nveya ADMIN kapattı]

CLOSED --> [*] : Terminal durum\n(geri dönüş yok)
EXPIRED --> [*] : Terminal durum\n(geri dönüş yok)

note right of DRAFT
  Sadece ilan sahibi görebilir.
  Düzenlenebilir, henüz listeye çıkmaz.
end note

note right of ACTIVE
  Herkes listede görebilir (auth gerekli detay).
  "Express Interest" butonu aktif.
end note

note right of MEETING_SCHEDULED
  İlgi ifade edilebilir (birden fazla meeting olabilir).
  Sahibi "Partner Found" ile kapatabilir.
end note

note bottom of CLOSED
  ActivityLog: POST_CLOSED
  Sahibi anonimleştirilebilir (GDPR hesap silme).
end note
@enduml
```

---

## Diyagram 6 — Meeting Request Lifecycle State Diagram (Bölüm 8.2)

### Açıklama

`backend/src/controllers/meetingsController.ts` dosyasındaki iş mantığından türetilmiştir.

**Durumlar:**

| Durum | Anlamı |
|---|---|
| NDA_PENDING | Kullanıcı henüz NDA kabul etmedi — `ndaAcceptedAt` null |
| PENDING | NDA kabul edildi, post sahibi saat önerisi bekliyor |
| SLOTS_PROPOSED | Post sahibi 1-3 saat önerdi, karşı taraf seçim bekliyor |
| CONFIRMED | Saat onaylandı, toplantı kesinleşti — terminal |
| REJECTED | İki taraftan biri reddetti — terminal |
| CANCELLED | Şemada mevcut, şu an backend'de aktif endpoint yok — ileride kullanım için ayrılmış — terminal |

**Geçiş tablosu:**

| Başlangıç | Hedef | Tetikleyici | Kim | Endpoint |
|---|---|---|---|---|
| — | NDA_PENDING | Express Interest, NDA henüz kabul edilmedi | Requester | `POST /api/meetings/express-interest/:postId` |
| — | PENDING | Express Interest, NDA daha önce kabul edildi | Requester | `POST /api/meetings/express-interest/:postId` |
| NDA_PENDING | PENDING | "I Accept & Proceed" tıklandı | Requester | `POST /api/meetings/:id/accept-nda` |
| NDA_PENDING | REJECTED | Reddet tıklandı | Her iki taraf | `PATCH /api/meetings/:id/reject` |
| PENDING | SLOTS_PROPOSED | Post sahibi saat önerdi (1-3 slot) | Post Owner | `POST /api/meetings/:id/propose-slots` |
| PENDING | REJECTED | Reddet tıklandı | Her iki taraf | `PATCH /api/meetings/:id/reject` |
| SLOTS_PROPOSED | CONFIRMED | Requester bir slotu seçti | Requester | `PATCH /api/meetings/:id/confirm-slot` |
| SLOTS_PROPOSED | REJECTED | Reddet tıklandı | Her iki taraf | `PATCH /api/meetings/:id/reject` |

**Önemli yan etkiler:**
- `NDA_PENDING → PENDING` geçişi: `users.ndaAcceptedAt` kalıcı olarak set edilir.
  Bir sonraki "Express Interest"te NDA modal tekrar çıkmaz.
- `SLOTS_PROPOSED → CONFIRMED` geçişi: `postLifecycle.transition(postId, 'MEETING_SCHEDULED', 'SYSTEM')` otomatik çağrılır.
  Eğer post zaten MEETING_SCHEDULED'daysa hata fırlatmaz (catch ile yutulur).
- `reject` endpoint'i terminal durumlardan (CONFIRMED, REJECTED, CANCELLED) çağrılamaz.

### PlantUML Kodu

```plantuml
@startuml Meeting_Lifecycle
!theme plain
skinparam backgroundColor #0E0E0E
skinparam defaultFontColor #E6E0E9
skinparam state {
  BackgroundColor #1A1A2E
  BorderColor #10B981
  FontColor #E6E0E9
  EndColor #DC2626
}

[*] --> NDA_PENDING : POST /api/meetings/express-interest/:postId\n[Requester'ın ndaAcceptedAt == null]

[*] --> PENDING : POST /api/meetings/express-interest/:postId\n[Requester'ın ndaAcceptedAt != null\nNDA daha önce kabul edilmişti]

NDA_PENDING --> PENDING : POST /api/meetings/:id/accept-nda\n[Requester "I Accept & Proceed" tıkladı]\n⚡ users.ndaAcceptedAt kalıcı set edilir

NDA_PENDING --> REJECTED : PATCH /api/meetings/:id/reject\n[Her iki taraf reddedebilir]

PENDING --> SLOTS_PROPOSED : POST /api/meetings/:id/propose-slots\n[Post Owner saat önerdi\n(1-3 slot: {date, time})]

PENDING --> REJECTED : PATCH /api/meetings/:id/reject\n[Her iki taraf reddedebilir]

SLOTS_PROPOSED --> CONFIRMED : PATCH /api/meetings/:id/confirm-slot\n[Requester önerilen slotlardan birini seçti]\n⚡ Post otomatik → MEETING_SCHEDULED

SLOTS_PROPOSED --> REJECTED : PATCH /api/meetings/:id/reject\n[Her iki taraf reddedebilir]

CONFIRMED --> [*] : Terminal\n(ActivityLog: MEETING_CONFIRMED)
REJECTED --> [*] : Terminal\n(ActivityLog: MEETING_REJECTED)
CANCELLED --> [*] : Terminal\n(Şemada mevcut, henüz aktif endpoint yok)

note right of NDA_PENDING
  requiresNDA: true yanıtı gelince
  frontend NdaModal component'ini açar.
  Modal içinde NDA metni gösterilir.
end note

note right of SLOTS_PROPOSED
  proposedSlots JSON alanında saklanır:
  [{date: "YYYY-MM-DD", time: "HH:MM"}, ...]
  Max 3 slot önerilebilir.
  Requester sadece önerilen slotlardan seçebilir.
end note

note right of CONFIRMED
  confirmedSlot JSON alanına yazılır.
  Post durumu MEETING_SCHEDULED olur.
  ActivityLog'a MEETING_CONFIRMED yazılır.
end note
@enduml
```

---

## PlantUML Nasıl Render Edilir?

1. **Online:** [plantuml.com/plantuml/uml](https://www.plantuml.com/plantuml/uml) adresine kod yapıştır
2. **VS Code:** "PlantUML" extension (jebbs.plantuml) — Ctrl+Shift+P → "PlantUML: Preview Current Diagram"
3. **IntelliJ / WebStorm:** PlantUML Integration plugin — editor'de preview
4. **CLI:** `java -jar plantuml.jar diagrams.puml` komutuyla PNG/SVG üret

Her diyagram ayrı `.puml` dosyasına alınıp CI'da otomatik render edilebilir.

---

*Oluşturulma tarihi: 2026-04-29*
*Kaynak: HEALTH AI proje kodu — frontend/src/, backend/src/, backend/prisma/schema.prisma*
