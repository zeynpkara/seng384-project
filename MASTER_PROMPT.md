# HEALTH AI — Claude Code Master Başlangıç Promptu

---

Aşağıdaki promptu Claude Code'da proje klasörünü açtıktan sonra,
CLAUDE.md dosyasını klasöre koyduktan sonra kullan.
Her bölüm ayrı bir session'da da kullanılabilir.

---

## SPRINT 0 PROMPTU — Altyapı Kurulumu
(Claude Code'a yapıştır, bir kez çalıştır)

```
CLAUDE.md dosyasını oku ve tam olarak anla.

Bu proje HEALTH AI matchmaking platformunun backend + frontend entegrasyonudur.
Mevcut frontend bir React/TypeScript/Vite projesidir. Backend sıfırdan yazılacak.

Şimdi Sprint 0'ı tamamla — sadece altyapı, henüz hiç iş mantığı yok:

## Adım 1: Klasör Yapısını Oluştur

Mevcut dosyaları `frontend/` altına taşı:
- `src/` → `frontend/src/`
- `index.html` → `frontend/index.html`
- `package.json`, `vite.config.ts`, `tsconfig.json` → `frontend/`

Yeni `backend/` klasörü oluştur:
```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── app.ts
└── package.json
```

## Adım 2: Backend package.json

backend/package.json içeriği:
- express, @types/express
- typescript, ts-node, tsx, @types/node
- @prisma/client, prisma
- jsonwebtoken, @types/jsonwebtoken
- bcrypt, @types/bcrypt
- zod
- nodemailer, @types/nodemailer
- helmet, cors, express-rate-limit
- dotenv
- Dev script: "dev": "tsx watch src/app.ts"
- Build script: "build": "tsc"

## Adım 3: Prisma Schema

CLAUDE.md'deki tam schema'yı `backend/prisma/schema.prisma` dosyasına yaz.
postgresql provider kullan.

## Adım 4: backend/src/app.ts İskeleti

Şunları içermeli:
- Express app setup
- Helmet, CORS, JSON parser middleware
- Rate limiter sadece /api/auth/* için
- /api/health endpoint (GET → { status: "ok", timestamp })
- Routes placeholder (henüz boş, import hazır)
- PORT 8000'den dinle

## Adım 5: Frontend API Client

`frontend/src/api/client.ts` dosyası oluştur:
- VITE_API_URL base URL'ini kullanır
- `apiCall(endpoint, options)` helper fonksiyonu
- JWT token'ı localStorage'dan alır ve her istekte Authorization header'a ekler
- 401 gelirse localStorage temizler ve login'e yönlendirir
- Tüm API fonksiyonlarını buradan export et (henüz stub):
  - auth: register, login, logout, verifyEmail
  - posts: getPosts, getPost, createPost, updatePost, publishPost, closePost, deletePost, getMyPosts
  - meetings: expressInterest, proposeSlots, confirmSlot, rejectMeeting, getMyMeetings
  - admin: getUsers, suspendUser, deleteUser, getPosts, deletePost, getLogs, exportLogs
  - profile: getProfile, updateProfile, exportData, deleteAccount

## Adım 6: .env.example

Kök dizine CLAUDE.md'deki tüm .env değişkenlerini içeren `.env.example` yaz.
Gerçek `.env` dosyası oluşturma, sadece example.

## Adım 7: Root package.json Scripts

Kök package.json'a ekle:
- "frontend:dev": "cd frontend && npm run dev"
- "backend:dev": "cd backend && npm run dev"
- "dev": "concurrently \"npm run frontend:dev\" \"npm run backend:dev\""

Bitince bana şunu söyle:
- Klasör yapısı hazır mı
- Prisma schema kaç model içeriyor
- frontend/src/api/client.ts kaç fonksiyon export ediyor
- app.ts /api/health endpoint çalışıyor mu (test et)
```

---

## SPRINT 1 PROMPTU — Auth (Kayıt & Login)
(Sprint 0 bittikten sonra kullan)

```
CLAUDE.md dosyasını oku.

Sprint 1: Kullanıcı kayıt ve giriş sistemi. Demo Senaryo 1'i kapatacak.

## Backend

### Middleware: backend/src/middleware/eduEmail.ts
- CLAUDE.md'deki regex ile email kontrolü
- Geçersizse 400 dön: { error: "Only .edu or .edu.tr institutional emails are allowed" }

### Middleware: backend/src/middleware/auth.ts
- Authorization: Bearer <token> header'ı doğrular
- Geçersizse 401
- Geçerliyse req.user'a { id, email, role } ekler

### Middleware: backend/src/middleware/roleGuard.ts
- roleGuard('ADMIN') şeklinde kullanılır
- Role uyuşmazsa 403

### Controller: backend/src/controllers/authController.ts

POST /api/auth/register:
  - Zod ile validate: email, password (min 8 karakter, en az 1 büyük harf, 1 rakam), role (HEALTHCARE|ENGINEER), name, institution
  - eduEmail middleware'i çalıştır
  - Email unique mi kontrol et
  - bcrypt.hash(password, 12)
  - verificationToken üret (crypto.randomBytes(32).toString('hex'))
  - User'ı DB'ye kaydet (isVerified: false)
  - Nodemailer ile verification email gönder (CLAUDE.md'deki SMTP config)
  - auditService.log({ action: 'USER_REGISTERED', userId, ipAddress })
  - 201 dön: { message: "Verification email sent. Check your inbox." }

GET /api/auth/verify/:token:
  - Token ile user bul
  - isVerified: true yap, verificationToken: null yap
  - auditService.log({ action: 'EMAIL_VERIFIED', userId })
  - 200 dön: { message: "Email verified. You can now login." }

POST /api/auth/login:
  - email + password al
  - User'ı bul, isVerified kontrolü, isSuspended kontrolü
  - bcrypt.compare
  - JWT sign: { id, email, role, name } — CLAUDE.md'deki expires
  - auditService.log({ action: 'USER_LOGIN', userId, ipAddress })
  - 200 dön: { token, user: { id, email, role, name, institution, ndaAcceptedAt } }

### Service: backend/src/services/auditService.ts
- log(data: { action, userId?, entity?, entityId?, ipAddress?, metadata? }) fonksiyonu
- ActivityLog tablosuna yazar
- Fire-and-forget (await olmadan, hata fırlatmaz)

### Service: backend/src/services/emailService.ts
- sendVerificationEmail(to, token) fonksiyonu
- Link: ${process.env.FRONTEND_URL}/verify?token=${token}
- HTML template: basit, HEALTH AI branded

## Frontend

### AuthContext.tsx — Gerçek JWT Auth ile Güncelle
- State: { user: {id, email, role, name, ndaAcceptedAt} | null, token: string | null }
- login(token, user) → localStorage'a token kaydet
- logout() → localStorage temizle, / 'e yönlendir
- useEffect: sayfa açılınca localStorage'dan token oku, valid mi kontrol et
- getAccentColor() aynı kalacak (role bazlı renk)

### Layout.tsx — Login Modal → Gerçek Form

Mevcut modal tasarımı (glass-panel, boyut, animasyon) AYNEN KORUNACAK.
Sadece içerik değişecek — iki sekme ekle:

Sekme 1 — Login:
- Email input
- Password input
- "Login" butonu → api.auth.login() çağır → başarılıysa handleLogin(token, user)
- Hata mesajı (email/şifre yanlış, hesap askıda, email doğrulanmamış)

Sekme 2 — Register:
- Name input
- Institution input
- Email input (.edu olmayan için anlık hata: "Only .edu or .edu.tr emails allowed")
- Password input
- Rol seçimi (mevcut 3 buton aynı kalacak, ADMIN seçeneği OLMAYACAK — sadece HEALTHCARE ve ENGINEER)
- "Register" butonu → api.auth.register() → başarılıysa success state göster
- Success state: "Check your inbox for verification email"

### Route Koruması — App.tsx
ProtectedRoute component ekle:
- Auth yoksa / 'e yönlendir
- Role uyuşmazsa /unauthorized sayfasına yönlendir

/admin route'u sadece ADMIN rolüne açık
/projects route'u ENGINEER'a açık
/dashboard route'u HEALTHCARE'e açık

### Landing.tsx — Admin Kartı Linki Kaldır
Admin kartındaki `<Link to="/admin">` → `<div>` yapılacak (tıklanabilir olmayacak).

Sprint 1 bitince bana şunu söyle:
- /api/auth/register endpoint'i test sonucu (curl veya manuel)
- /api/auth/login endpoint'i test sonucu
- /api/health endpoint'i çalışıyor mu
- Frontend'de login modal'ı açıp register sekme görünüyor mu
```

---

## SPRINT 2 PROMPTU — Post Yönetimi
(Sprint 1 bittikten sonra kullan)

```
CLAUDE.md dosyasını oku.

Sprint 2: Post CRUD + Lifecycle. Demo Senaryo 2'yi kapatacak.

## Backend

### Utils: backend/src/utils/postLifecycle.ts
CLAUDE.md'deki tam state machine tablosunu implement et.
canTransition(from: PostStatus, to: PostStatus, triggeredBy: 'OWNER'|'SYSTEM'|'ADMIN'): boolean
transition(postId, to, triggeredBy, userId): Promise<Post>
- İzin verilmeyen geçişte hata fırlat

### Post Controller — Tüm CRUD Endpoint'leri:

GET /api/posts — public (auth opsiyonel)
  - Query params: city, domain, status, expertise (hepsi opsiyonel)
  - Sadece ACTIVE ve MEETING_SCHEDULED postları döner (DRAFT, CLOSED, EXPIRED görünmez)
  - Filtreleme: Prisma where koşulları ile
  - Her post: { id, title, domain, description, requiredExpertise, projectStage, confidentiality, city, country, commitmentLevel, status, createdAt, owner: { name, institution } }

GET /api/posts/mine — auth gerekli
  - Sadece kendi postları, tüm statuslar

GET /api/posts/:id — auth gerekli
  - Tüm alanlar
  - Eğer confidentiality MEETING_ONLY ise description kırpılmış halde dön

POST /api/posts — auth gerekli, ADMIN hariç
  - Zod validate: title, domain, description, requiredExpertise, projectStage, confidentiality, city, country, commitmentLevel
  - expiresAt (opsiyonel), autoClose (opsiyonel, default false)
  - status: DRAFT olarak oluştur
  - auditService.log({ action: 'POST_CREATED' })

PATCH /api/posts/:id — auth gerekli, sadece sahibi
  - Sadece DRAFT veya ACTIVE postlar düzenlenebilir
  - auditService.log({ action: 'POST_EDITED' })

PATCH /api/posts/:id/publish — auth gerekli, sadece sahibi
  - postLifecycle.transition(id, 'ACTIVE', 'OWNER', userId)
  - auditService.log({ action: 'POST_PUBLISHED' })

PATCH /api/posts/:id/close — auth gerekli, sadece sahibi
  - postLifecycle.transition(id, 'CLOSED', 'OWNER', userId)
  - auditService.log({ action: 'POST_CLOSED' })

DELETE /api/posts/:id — auth gerekli, sadece sahibi, sadece DRAFT
  - auditService.log({ action: 'POST_DELETED' })

## Frontend

### Dashboard.tsx (Healthcare) ve TechnicalDashboard.tsx (Engineer)
Hardcoded kartları kaldır, API'den yükle:

1. useEffect ile GET /api/posts?limit=6 çağır
2. Loading state: glass-panel içinde skeleton loader (3 kart, pulse animasyonu)
3. Post kartları aynı tasarımla (border-t-2 border-t-tech-navy/50 veya clinical-green/50)
   - Gerçek title, domain, description (line-clamp-2), owner.name, createdAt
   - Status badge: ACTIVE → "Active", MEETING_SCHEDULED → "Partner Found Soon"

4. "My Active Posts" bölümü → GET /api/posts/mine ile doldur
5. "Create Post" butonu → Post creation modal aç (form aşağıda)

### Post Creation Modal
Mevcut glass-panel modal stiliyle:
- Tüm form alanları (CLAUDE.md Section 4 - Post model alanları)
- "Save as Draft" ve "Publish" iki ayrı buton
- Submit: POST /api/posts → başarılıysa modal kapat, listeyi refresh et

## Seed Data

seed.ts dosyasını yaz ve çalıştır:
CLAUDE.md Section 10'daki kullanıcıları ve postları oluştur.
Script çalıştırma: cd backend && npx tsx ../../seed.ts

Sprint 2 bitince bana söyle:
- GET /api/posts test sonucu (kaç kayıt döndü)
- POST /api/posts test sonucu (yeni post oluştu mu)
- Frontend'de post listesi görünüyor mu
- Seed data yüklendi mi
```

---

## SPRINT 3 PROMPTU — Arama & Filtreleme
(Kısa sprint, Sprint 2'nin hemen ardından)

```
CLAUDE.md dosyasını oku.

Sprint 3: Arama ve filtreleme. Demo Senaryo 3'ü kapatacak.

Backend GET /api/posts zaten query params alıyor.
Şimdi frontend filter bar'ı bağla:

### Frontend

Dashboard ve TechnicalDashboard'daki filter area'ya event listener ekle:
- Şehir dropdown (seçenekler: Ankara, İstanbul, İzmir, + mevcut postlardan unique şehirler)
- Domain dropdown (seçenekler: Cardiology, Radiology, Orthopedics, Neurology, AI/ML, Robotics, Computer Vision)
- Expertise text input (debounce: 300ms)
- "Clear Filters" butonu

Her filter değişiminde:
- URL query params güncelle (react-router searchParams)
- GET /api/posts?city=X&domain=Y&expertise=Z çağır
- Sonuçları re-render et
- Sonuç yok ise: "No posts match your criteria" empty state (glass-panel içinde)

Sprint 3 bitince bana söyle:
- Şehir filtresi çalışıyor mu
- Domain filtresi çalışıyor mu
- "Clear" butonu tüm filtreleri temizliyor mu
```

---

## SPRINT 4 PROMPTU — Meeting Workflow & NDA
(En kritik sprint)

```
CLAUDE.md dosyasını oku. NDA akışını özellikle dikkatli oku (Section 6).

Sprint 4: Meeting request akışı. Demo Senaryo 4'ü kapatacak.

## Backend

### Meeting Controller:

POST /api/meetings/express-interest/:postId — auth gerekli
  - Post var mı, ACTIVE mi kontrol et
  - Zaten interest gösterilmiş mi kontrol et (duplicate önle)
  - Body: { message?: string }
  - NDA daha önce kabul edilmemişse → 200 + { requiresNDA: true }
  - NDA kabul edilmişse → MeetingRequest oluştur (status: PENDING)
  - auditService.log({ action: 'INTEREST_EXPRESSED' })

POST /api/meetings/:id/accept-nda — auth gerekli
  - User.ndaAcceptedAt = new Date()
  - MeetingRequest status = PENDING olarak oluştur
  - auditService.log({ action: 'NDA_ACCEPTED' })

POST /api/meetings/:id/propose-slots — auth gerekli, sadece post sahibi
  - Body: { slots: [{date: "2025-05-01", time: "14:00"}] } (max 3 slot)
  - Zod validate
  - MeetingRequest.proposedSlots güncelle
  - status: SLOTS_PROPOSED
  - auditService.log({ action: 'SLOTS_PROPOSED' })

PATCH /api/meetings/:id/confirm-slot — auth gerekli, sadece requester
  - Body: { slot: {date, time} }
  - proposedSlots içinde mi kontrol et
  - MeetingRequest.confirmedSlot = slot, status: CONFIRMED
  - Post status → MEETING_SCHEDULED (postLifecycle.transition)
  - auditService.log({ action: 'MEETING_CONFIRMED' })

PATCH /api/meetings/:id/reject — auth gerekli (her iki taraf da reddedebilir)
  - status: REJECTED
  - auditService.log({ action: 'MEETING_REJECTED' })

GET /api/meetings/mine — auth gerekli
  - Kullanıcının gönderdiği + aldığı tüm meeting requests
  - Her biri: post title, requester/postOwner bilgisi, status, slots

## Frontend

### "Express Interest" Butonu Akışı

Post kartındaki veya detay sayfasındaki "Express Interest" / "Review Proposal" butonlarına:

1. Tıklayınca: GET /api/meetings/check/:postId → zaten gönderilmiş mi?
2. Gönderilmemişse: api.meetings.expressInterest(postId)
3. Response'da requiresNDA: true gelirse → NDA Modal aç
4. NDA Modal (glass-panel, mevcut modal stiliyle):
   - Başlık: "Non-Disclosure Agreement"
   - Metin: "By proceeding, you agree to maintain confidentiality regarding all information shared through this platform. This agreement is binding and permanent."
   - "I Accept & Proceed" butonu → api.meetings.acceptNDA(meetingId) → sonra interest tamamlanır
   - "Cancel" butonu → modal kapat
5. NDA kabul sonrası başarı mesajı: "Your interest has been submitted. The post owner will propose meeting times."

### Meeting Dashboard Bölümü (Her iki dashboard'da)
GET /api/meetings/mine ile doldur:
- PENDING: "Waiting for time slots"
- SLOTS_PROPOSED: Slot seçim UI'ı göster (radio buttons, her slot bir seçenek)
- CONFIRMED: "Meeting scheduled — {date} at {time}"

Sprint 4 bitince bana söyle:
- NDA modal açılıyor mu
- Meeting request DB'ye kaydediliyor mu
- Slot önerme çalışıyor mu
- Slot onaylamada post status MEETING_SCHEDULED oluyor mu
```

---

## SPRINT 5 PROMPTU — Admin Panel & GDPR
(Son sprint)

```
CLAUDE.md dosyasını oku.

Sprint 5: Admin panel + GDPR. Demo Senaryo 5 ve 6'yı kapatacak.

## Backend

### Admin Controller (tüm endpoint'ler roleGuard('ADMIN') ile korunur):

GET /api/admin/users?role=&status=
  - Tüm kullanıcılar, filtreli
  - Her biri: id, email, role, name, institution, isVerified, isSuspended, createdAt

PATCH /api/admin/users/:id/suspend
  - isSuspended: true
  - auditService.log({ action: 'USER_SUSPENDED', entityId: id })

DELETE /api/admin/users/:id
  - Sadece HEALTHCARE veya ENGINEER silebilir, ADMIN silemez
  - auditService.log({ action: 'USER_DELETED', entityId: id })

GET /api/admin/posts?status=
  - Tüm postlar (tüm statuslar)

DELETE /api/admin/posts/:id
  - Herhangi bir post silinebilir
  - auditService.log({ action: 'POST_MODERATED', entityId: id })

GET /api/admin/logs?from=&to=&action=&userId=
  - ActivityLog kayıtları, filtreli, en yeniden eskiye
  - Sayfalama: ?page=1&limit=50

GET /api/admin/logs/export
  - Response: Content-Type: text/csv
  - Dosya adı: health-ai-audit-{YYYY-MM-DD}.csv
  - Kolonlar: timestamp, action, userId, userEmail, entity, entityId, ipAddress

### Profile Controller:

GET /api/users/me → user profili

PATCH /api/users/me
  - name, institution güncellenebilir
  - email ve role değiştirilemez

GET /api/users/me/export
  - JSON: { user, posts, meetingRequests }
  - Response header: Content-Disposition: attachment; filename="healthai-data-export.json"

DELETE /api/users/me
  - Body: { password } → şifre onayı
  - bcrypt.compare
  - MeetingRequests: status → CANCELLED
  - Posts: DRAFT olanları sil, ACTIVE olanları anonim yap (owner → null veya "Deleted User")
  - User: email → deleted_{id}@deleted.healthai, passwordHash temizle, isSuspended: true
  - auditService.log({ action: 'ACCOUNT_DELETED' })

## Frontend

### SystemAdmin.tsx — Gerçek Data ile Doldur

Hardcoded 12,408 ve 8,192 sayılarını API'den al:
- GET /api/admin/users → toplam + rolüne göre breakdown
- GET /api/admin/posts?status=MEETING_SCHEDULED → active NDAs sayısı (yaklaşık)

Content Moderation Feed:
- GET /api/admin/posts (tüm postlar) ile doldur
- ✓ butonu → şimdilik kullanılmıyor (post zaten yayında)
- ✗ butonu → DELETE /api/admin/posts/:id → listeden kaldır

Entity Verification (User List):
- GET /api/admin/users ile doldur
- "Identify" butonu → kullanıcı detayını göster (modal)
- "Suspend" butonu ekle

Audit Trail:
- GET /api/admin/logs?limit=10 ile son 10 log
- "Export CSV" butonu → GET /api/admin/logs/export → browser download

### Profil Sayfası (Yeni: /profile route)

Yeni route ekle. Tasarım: glass-panel, mevcut stil.
- Profil bilgileri formu (name, institution)
- "Save" → PATCH /api/users/me
- "Export My Data" butonu → GET /api/users/me/export → JSON download
- "Delete Account" butonu → uyarı modal aç
  - Modal: "This action is permanent. Enter your password to confirm."
  - Password input
  - "Delete Permanently" → DELETE /api/users/me → logout

Sidebar'a "Profile" linki ekle (Settings ikonu, /profile path).

Sprint 5 bitince DEMO kontrol listesini çalıştır (CLAUDE.md Section 16).
Her maddeyi test et ve bana sonuçları söyle.
```

---

## KULLANIM NOTLARI

### Her Session Başında Claude Code'a Söyle:
```
CLAUDE.md dosyasını oku. Şu an Sprint [N] üzerinde çalışıyoruz.
[Varsa: Geçen session'da şu sorunu yaşadık: ...]
```

### Bir Şey Bozulursa:
```
CLAUDE.md dosyasını oku.
[Bozulan kısım] çalışmıyor. Hata: [hata mesajı]
Tasarıma dokunma. Sadece bu sorunu çöz.
```

### Tasarım Beklenmedik Şekilde Değişirse:
```
Dur. src/index.css dosyasındaki değişiklikleri geri al.
Glassmorphism sınıflarına dokunma: glass-panel, glass-panel-elevated, glass-interactive.
CSS değişkenlerine dokunma: --color-clinical-green, --color-tech-navy, --color-system-red.
```
