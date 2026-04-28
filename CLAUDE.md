# HEALTH AI — Claude Code Master Reference

## 1. Projenin Özü (Değişmez Kural)

HEALTH AI, sağlık profesyonelleri ile mühendisleri güvenli bir zeminde buluşturan **akademik bir matchmaking platformudur**.

**Bu platform değildir:**
- Dosya/doküman paylaşım sistemi
- Hasta verisi veya tıbbi kayıt deposu
- Proje yönetim aracı
- Sözleşme yönetim sistemi

**Veritabanında kesinlikle saklanmayacak:**
- Hasta verileri, tıbbi kayıtlar, görüntüler
- IP dökümanları, teknik şartnameler, araştırma raporları
- Klinik trial sonuçları veya herhangi bir tıbbi doküman

---

## 2. Mevcut Frontend Yapısı — DOKUNMA KURALLARI

Proje **React + TypeScript + Vite + Tailwind v4** ile yazılmış, AI Studio (Gemini) tarafından üretilmiş bir tasarım şablonudur.

### KESİNLİKLE DOKUNULMAYACAK dosyalar ve klasörler:
```
src/index.css          ← Tüm Glassmorphism ve tema değişkenleri burada
src/components/ClinicalMatrix.tsx  ← Arka plan animasyonu
```

### KESİNLİKLE DOKUNULMAYACAK CSS sınıfları:
```
.glass-panel
.glass-panel-elevated
.glass-interactive
```

### KESİNLİKLE DOKUNULMAYACAK Tailwind tema renkleri:
```
--color-clinical-green: #10B981   ← Healthcare Professional rengi
--color-tech-navy: #2563EB        ← Engineer rengi
--color-system-red: #DC2626       ← Admin rengi
--color-primary: #cfbcff          ← Genel vurgu rengi
```

### Değiştirilebilir / genişletilebilir dosyalar:
```
src/App.tsx                    ← Route yapısı genişletilebilir
src/context/AuthContext.tsx    ← Gerçek JWT auth ile değiştirilecek
src/views/*.tsx                ← Hardcoded veriler API çağrılarıyla değiştirilecek
src/components/Layout.tsx      ← Login modal gerçek forma dönüşecek
```

---

## 3. Teknoloji Stack'i

### Frontend (Mevcut — değişmiyor)
- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- React Router DOM v7
- Motion (Framer Motion v12)
- Lucide React (ikonlar)

### Backend (Sıfırdan yazılacak)
- **Runtime:** Node.js + Express.js
- **Dil:** TypeScript (frontend ile tutarlılık)
- **ORM:** Prisma
- **Veritabanı:** PostgreSQL
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Email:** Nodemailer + Mailtrap (demo ortamı)
- **Validation:** Zod

### Klasör Yapısı (Hedef)
```
health-ai/
├── frontend/          ← Mevcut src/ buraya taşınır
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts      ← Tüm fetch çağrıları tek yerden
│   │   ├── context/
│   │   │   └── AuthContext.tsx ← JWT'li gerçek auth
│   │   └── views/             ← Mevcut view'lar (API bağlantısı eklenir)
│   └── ...
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      ← DB şeması
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts        ← JWT doğrulama
│   │   │   ├── eduEmail.ts    ← .edu/.edu.tr kontrolü
│   │   │   └── roleGuard.ts   ← RBAC
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── meetings.ts
│   │   │   └── admin.ts
│   │   ├── controllers/       ← İş mantığı buraya
│   │   ├── services/
│   │   │   ├── emailService.ts
│   │   │   ├── auditService.ts ← Her işlem log'a yazılır
│   │   │   └── ndaService.ts
│   │   └── utils/
│   │       └── postLifecycle.ts ← State machine
│   └── app.ts
├── seed.ts                    ← Demo seed data
└── CLAUDE.md                  ← Bu dosya
```

---

## 4. Veritabanı Şeması (Prisma)

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique  // Sadece .edu veya .edu.tr
  passwordHash      String
  role              Role
  name              String
  institution       String
  isVerified        Boolean   @default(false)
  verificationToken String?
  isSuspended       Boolean   @default(false)
  ndaAcceptedAt     DateTime?           // NDA kabul zamanı
  createdAt         DateTime  @default(now())
  posts             Post[]
  meetingRequestsSent     MeetingRequest[] @relation("Requester")
  meetingRequestsReceived MeetingRequest[] @relation("PostOwner")
  activityLogs      ActivityLog[]
}

enum Role {
  HEALTHCARE
  ENGINEER
  ADMIN
}

model Post {
  id                String      @id @default(uuid())
  title             String
  domain            String      // Tıbbi/mühendislik alanı
  description       String
  requiredExpertise String      // Aranan uzmanlık
  projectStage      ProjectStage
  confidentiality   Confidentiality
  city              String
  country           String
  commitmentLevel   String
  status            PostStatus  @default(DRAFT)
  expiresAt         DateTime?
  autoClose         Boolean     @default(false)
  ownerId           String
  owner             User        @relation(fields: [ownerId], references: [id])
  meetingRequests   MeetingRequest[]
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum PostStatus {
  DRAFT
  ACTIVE
  MEETING_SCHEDULED
  CLOSED        // Partner Found
  EXPIRED
}

enum ProjectStage {
  IDEA
  CONCEPT_VALIDATION
  PROTOTYPE
  PILOT_TESTING
  PRE_DEPLOYMENT
}

enum Confidentiality {
  PUBLIC
  MEETING_ONLY   // Detaylar sadece toplantıda paylaşılır
}

model MeetingRequest {
  id             String         @id @default(uuid())
  postId         String
  post           Post           @relation(fields: [postId], references: [id])
  requesterId    String
  requester      User           @relation("Requester", fields: [requesterId], references: [id])
  postOwnerId    String
  postOwner      User           @relation("PostOwner", fields: [postOwnerId], references: [id])
  status         MeetingStatus  @default(PENDING)
  message        String?        // İlk mesaj
  ndaAccepted    Boolean        @default(false)
  ndaAcceptedAt  DateTime?
  proposedSlots  Json?          // [{date, time}] array
  confirmedSlot  Json?          // {date, time}
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

enum MeetingStatus {
  PENDING           // İlgi ifade edildi
  NDA_PENDING       // NDA bekleniyor
  SLOTS_PROPOSED    // Saat önerildi
  CONFIRMED         // Toplantı onaylandı
  REJECTED
  CANCELLED
}

model ActivityLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String   // LOGIN, CREATE_POST, ACCEPT_NDA, vb.
  entity    String?  // Post, MeetingRequest, User
  entityId  String?
  ipAddress String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

---

## 5. Post Lifecycle State Machine

Bu kuralları `backend/src/utils/postLifecycle.ts` dosyası yönetir.

| Mevcut Durum | Geçiş | Tetikleyici | Kim |
|---|---|---|---|
| — | DRAFT | Post oluşturuldu | İlan sahibi |
| DRAFT | ACTIVE | "Yayınla" tıklandı | İlan sahibi |
| ACTIVE | MEETING_SCHEDULED | Meeting request CONFIRMED oldu | Sistem (otomatik) |
| ACTIVE | EXPIRED | expiresAt tarihi geçti | Sistem (cron/scheduled check) |
| MEETING_SCHEDULED | CLOSED | "Partner Found" işaretlendi | İlan sahibi |
| ACTIVE veya MEETING_SCHEDULED | CLOSED | Admin kapattı | Admin |

**Geri dönüş yok:** CLOSED ve EXPIRED durumundan hiçbir duruma geçilemez.

---

## 6. NDA Akışı — KRİTİK KURAL

```
İlan listesi görüntüleme        → Serbest, auth gerekmez
İlan detayı görüntüleme        → Auth gerekir, NDA GEREKMEZs
"Express Interest" butonu       → NDA modal tetiklenir
NDA modal'da "Kabul Et"        → users.ndaAcceptedAt güncellenir
                                → MeetingRequest oluşturulur (status: PENDING)
İlan sahibine bildirim          → ActivityLog kaydı
İlan sahibi saat önerir         → status: SLOTS_PROPOSED
Karşı taraf saat seçer          → status: CONFIRMED
                                → Post status: MEETING_SCHEDULED
```

**NDA bir kez kabul edilince kullanıcı için kalıcıdır.** Sonraki "Express Interest"lerde modal tekrar çıkmaz.

---

## 7. Email Validation Kuralı

```typescript
// Middleware: eduEmail.ts
const EDU_REGEX = /\.(edu|edu\.tr)$/i;

// Geçerli örnekler:
// user@university.edu       ✓
// user@metu.edu.tr          ✓
// user@hospital.edu.tr      ✓

// Geçersiz örnekler:
// user@gmail.com            ✗
// user@hospital.gov.tr      ✗
// user@company.com          ✗
```

---

## 8. Dinamik Tema Kuralı

Login sonrası AuthContext role bilgisini JWT'den okur ve UI sınıfları güncellenir:

| Rol | Renk Değişkeni | CSS Sınıfı Prefix |
|---|---|---|
| HEALTHCARE | `--color-clinical-green` (#10B981) | `clinical-green` |
| ENGINEER | `--color-tech-navy` (#2563EB) | `tech-navy` |
| ADMIN | `--color-system-red` (#DC2626) | `system-red` |

Bu mantık zaten `AuthContext.tsx`'teki `getAccentColor()` fonksiyonunda var. Değiştirme, sadece mock `login(role)` çağrısını gerçek JWT decode ile değiştir.

---

## 9. Activity Log Zorunluluğu

**Her API endpoint'i işlem sonunda `auditService.log()` çağırmalıdır.**

```typescript
// Loglanması gereken action'lar:
USER_REGISTERED, EMAIL_VERIFIED, USER_LOGIN, USER_LOGOUT
POST_CREATED, POST_PUBLISHED, POST_EDITED, POST_DELETED, POST_EXPIRED, POST_CLOSED
INTEREST_EXPRESSED, NDA_ACCEPTED, SLOTS_PROPOSED, MEETING_CONFIRMED, MEETING_REJECTED
USER_SUSPENDED, USER_DELETED, POST_MODERATED
DATA_EXPORTED, ACCOUNT_DELETED  // GDPR
```

Admin CSV export bu tablodan gelir. Hiçbir zaman silinmez.

---

## 10. Demo İçin Seed Data Gereksinimleri

`seed.ts` dosyası şu kayıtları oluşturmalı:

**Kullanıcılar (pre-verified):**
- 1 Admin: admin@metu.edu.tr
- 2 Healthcare: doctor1@hacettepe.edu.tr, doctor2@istanbul.edu.tr
- 2 Engineer: eng1@metu.edu.tr, eng2@boun.edu.tr
- Tüm şifreler: `Demo1234!`

**Postlar (çeşitli statuslarda):**
- 2 ACTIVE post (1 Healthcare, 1 Engineer)
- 1 DRAFT post
- 1 MEETING_SCHEDULED post
- 1 CLOSED post

**Meeting Requests:**
- 1 CONFIRMED meeting (status gösterimi için)
- 1 PENDING meeting (NDA flow demo için)

---

## 11. GDPR Gereksinimleri

```
DELETE /api/users/me         → Hesabı siler (soft delete: isSuspended=true, email anonim)
GET    /api/users/me/export  → JSON olarak kişisel veri export
```

Silme sırası: MeetingRequests → Posts (DRAFT olanlar) → User anonimleştir.
ACTIVE post'lar silinmez, owner anonim yapılır.

---

## 12. Tasarımda Tespit Edilen ve Düzeltilecek Sorunlar

### Login Modal → Gerçek Auth Form'a Dönüşecek
**Şu an:** Modal'da sadece "rol seç" butonu var, email/şifre yok.
**Olması gereken:** İki sekme — Login (email + şifre) ve Register (email + şifre + rol seçimi).
**Tasarım korunacak:** Modal'ın glass-panel görünümü, boyutu ve animasyonu aynı kalacak. Sadece içerik değişecek.

### Register Akışı Eklenecek (Tasarımda Hiç Yok)
- Email + şifre + rol seçimi formu
- .edu validasyon hatası mesajı (aynı modal içinde)
- "Verification email sent" success state

### Admin'e Doğrudan Erişim Kaldırılacak
**Şu an:** Landing sayfasında Admin kartına tıklayınca direkt `/admin` açılıyor.
**Olması gereken:** Login gerekli, sadece ADMIN rolü `/admin` görebilir.

### Sidebar'daki "NEW REQUEST" Butonu Anlamlandırılacak
**Şu an:** Hiçbir şey yapmıyor.
**Olması gereken:** "Create Post" modal'ını veya sayfasını açacak.

### "Collaborators" ve "Network" Sayfaları
**Şu an:** Her ikisi de `/dashboard` ve `/projects`'e yönlendiriyor.
**Olması gereken:** Demo kapsamında bu sayfalar "Coming Soon" placeholder ile doldurulabilir.

### Profil Avatar
**Şu an:** Hardcoded Google URL'si var.
**Olması gereken:** Kullanıcının baş harflerinden oluşan initials avatar (CSS ile).

---

## 13. API Endpoint Listesi

### Auth
```
POST   /api/auth/register          → Kayıt (.edu validation)
POST   /api/auth/login             → JWT dön
GET    /api/auth/verify/:token     → Email doğrulama
POST   /api/auth/logout            → Token invalidate (blacklist)
```

### Posts
```
GET    /api/posts                  → Liste (filtre: city, domain, status, expertise)
GET    /api/posts/:id              → Detay (auth gerekli)
POST   /api/posts                  → Oluştur (Engineer veya Healthcare)
PATCH  /api/posts/:id              → Düzenle (sadece sahibi)
PATCH  /api/posts/:id/publish      → DRAFT → ACTIVE
PATCH  /api/posts/:id/close        → MEETING_SCHEDULED → CLOSED (Partner Found)
DELETE /api/posts/:id              → Sil (sadece DRAFT, sadece sahibi)
GET    /api/posts/mine             → Kendi postları
```

### Meetings
```
POST   /api/meetings/express-interest/:postId  → NDA kabul + interest
POST   /api/meetings/:id/propose-slots         → Saat öner
PATCH  /api/meetings/:id/confirm-slot          → Saat onayla
PATCH  /api/meetings/:id/reject                → Reddet
GET    /api/meetings/mine                      → Kendi meeting'leri
```

### Admin
```
GET    /api/admin/users            → Kullanıcı listesi (filtre: role, status)
PATCH  /api/admin/users/:id/suspend → Askıya al
DELETE /api/admin/users/:id        → Sil
GET    /api/admin/posts            → Tüm postlar
DELETE /api/admin/posts/:id        → Moderasyon: kaldır
GET    /api/admin/logs             → Activity logs (filtre: date, action, userId)
GET    /api/admin/logs/export      → CSV export
```

### Profile / GDPR
```
GET    /api/users/me               → Profil bilgisi
PATCH  /api/users/me               → Profil güncelle
GET    /api/users/me/export        → GDPR veri export (JSON)
DELETE /api/users/me               → Hesap sil (GDPR)
```

---

## 14. Güvenlik Kuralları

- JWT secret `.env`'den gelir, kaynak kodda asla yok
- bcrypt rounds: 12
- Rate limiting: `/api/auth/*` endpoint'lerine 10 req/15min
- CORS: Sadece frontend origin'i
- Helmet.js middleware aktif
- SQL injection: Prisma ORM kullanımı ile önlenir
- Admin endpoint'leri roleGuard middleware ile korunur

---

## 15. .env Değişkenleri

```env
# Backend
DATABASE_URL="postgresql://user:pass@localhost:5432/healthai"
JWT_SECRET="en-az-32-karakter-rastgele-string"
JWT_EXPIRES_IN="7d"
PORT=8000

# Email (Demo: Mailtrap)
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="mailtrap-user"
SMTP_PASS="mailtrap-pass"
FROM_EMAIL="noreply@healthai.edu"

# Frontend
VITE_API_URL="http://localhost:8000"
```

---

## 16. Demo Senaryoları İçin Kontrol Listesi

Her sprint'in bitiminde bu senaryolar manuel test edilmeli:

- [ ] S1: .edu olmayan email ile kayıt → hata mesajı
- [ ] S1: .edu ile kayıt → verification email (Mailtrap'te görünür)
- [ ] S1: Login → role'e göre doğru dashboard + doğru renk tema
- [ ] S2: Post oluştur → DRAFT → ACTIVE → Edit → kaydet
- [ ] S2: Post listesinde seed data görünüyor
- [ ] S3: Şehir + domain filtresi → sonuçlar değişiyor → temizle → hepsi
- [ ] S4: "Express Interest" → NDA modal → kabul → saat öner → diğer hesaptan onayla → MEETING_SCHEDULED
- [ ] S5: Admin login → kullanıcı listesi → post moderasyon → log filtrele → CSV export
- [ ] S6: Profil düzenle → Account deletion sayfası (silme göster, yapma) → veri export

---

*Bu dosya her Claude Code session'ında ilk okunacak referans kaynaktır.*
*Dosyayı güncellemeden önce: `git add CLAUDE.md && git commit -m "update: claude.md"`*
