# 🧬 HEALTH AI - Academic Matchmaking Platform

[cite_start]**HEALTH AI**, akademik dürüstlüğü ve profesyonel iş birliğini temel alan bir platformdur[cite: 2, 268]. [cite_start]**Sağlık Profesyonelleri** (doktorlar, klinisyenler) ve **Mühendisler** (geliştiriciler, veri bilimciler) arasındaki boşluğu doldurmak için tasarlanmıştır [cite: 249-250]. [cite_start]Platform, rastlantısal ağ kurma ihtiyacını ortadan kaldırarak yapılandırılmış bir inovasyon köprüsü sunar [cite: 264-274].

## 🚀 Temel Özellikler

* [cite_start]**Rol Tabanlı Erişim Kontrolü (RBAC):** Sağlık Profesyonelleri, Mühendisler ve Sistem Yöneticileri için özel dashboardlar mevcuttur[cite: 50, 535].
* [cite_start]**Renk Kodlu Temalar:** Her rol için özel temalar (Yeşil/Lacivert/Kırmızı) tanımlanmıştır [cite: 342-343].
* [cite_start]**Sıkı Doğrulama:** Kayıtlar kesinlikle `.edu` ve `.edu.tr` kurumsal e-postaları ile sınırlandırılmıştır [cite: 54, 57, 339-340].
* [cite_start]**Akademik Bütünlük:** Sadece kurumsal e-posta sahipleri sisteme erişebilir[cite: 476, 544].
* [cite_start]**Proje Yaşam Döngüsü Yönetimi:** Proje ilanları için `DRAFT` → `ACTIVE` → `MEETING_SCHEDULED` → `CLOSED` durumlarını içeren tam bir durum makinesi bulunur [cite: 70-72, 371-376, 548].
* [cite_start]**Güvenli Eşleştirme:** İlanlara ilgi beyanından önce zorunlu Gizlilik Sözleşmesi (NDA) kabulü gerekir [cite: 86-87].
* [cite_start]**Toplantı Akışı:** NDA kabulü sonrası zaman dilimi önerisi ve onay iş akışı başlar [cite: 391-397, 472].
* [cite_start]**Yönetici Paneli:** Sistem yöneticileri ilanları modere edebilir ve kullanıcıları askıya alabilir [cite: 36, 101-111].
* [cite_start]**Moderasyon:** Uygunsuz ilanlar admin tarafından kaldırılabilir [cite: 400-411].
* [cite_start]**Aktivite Logları:** Değiştirilemez aktivite logları CSV olarak dışa aktarılabilir [cite: 434-437].
* [cite_start]**GDPR Uyumluluğu:** Kullanıcılar verilerini JSON formatında dışa aktarabilir [cite: 99-100, 443].
* [cite_start]**Hesap Silme:** Kullanıcılar hesaplarını kalıcı olarak silme hakkına sahiptir [cite: 96-98, 440-442].

## 🛠️ Teknoloji Yığını

**Frontend:**
* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite 6
* **Styling:** Tailwind CSS v4 + Framer Motion (Glassmorphism UI)
* **Routing:** React Router v7

**Backend:**
* **Runtime:** Node.js + Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Security:** JWT Authentication & bcrypt
* **Validation:** Zod (Data Validation)

## 💻 Kurulum ve Yerel Yapılandırma

### Önkoşullar
* Node.js (v18+)
* Yerel olarak yüklü PostgreSQL

### 1. Depoyu Klonlayın
```bash
git clone [https://github.com/zeynpkara/seng384-project.git](https://github.com/zeynpkara/seng384-project.git)
cd seng384-project
```

### 2. Ortam Değişkenlerini Ayarlayın
`backend/` klasörü içinde bir `.env` dosyası oluşturun:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthai"
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=8000
FRONTEND_URL="http://localhost:3000"
```

### 3. Veritabanı Hazırlığı
Backend klasörüne gidin, veritabanını kurun ve demo verileriyle doldurun:

```bash
cd backend
npm install
npx prisma generate
npm run db:migrate
npm run db:seed
```

### 4. Uygulamayı Çalıştırma
İki ayrı terminal penceresi açın:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

*(Not: Yerel olarak yapılandırılmışsa taşınabilir PostgreSQL veritabanı örneğini hızlıca başlatmak için kök dizinde bir `start-db.bat` dosyası bulunmaktadır).*

## 🧪 Demo Hesaplar
Platformu önceden yüklenmiş demo hesaplarını kullanarak test edebilirsiniz. Tüm hesapların şifresi: `Demo1234!`

**Sağlık Profesyonelleri:**
* doctor1@hacettepe.edu.tr
* doctor2@istanbul.edu.tr

**Mühendisler:**
* eng1@metu.edu.tr
* eng2@boun.edu.tr

**Sistem Yöneticisi (Admin):**
* admin@metu.edu.tr

---
*Bu proje SENG 384 – Bahar 2026 kapsamında geliştirilmiştir.*
