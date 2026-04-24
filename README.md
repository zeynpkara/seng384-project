# HEALTH AI — Co-Creation & Innovation Platform
### SENG 384 — Software Project III

Sağlık profesyonelleri ile mühendisleri sağlık teknolojisi projelerinde eşleştiren yapılandırılmış bir işbirliği platformu.

---

## Dosyalar

| Dosya | İçerik |
|---|---|
| [`PLAN.md`](./PLAN.md) | Master proje planı — kapsam, teknik kararlar, API, DB şeması, fazlar |
| [`SRS.md`](./SRS.md) | Software Requirements Specification |
| [`SDD.md`](./SDD.md) | Software Design Document |
| [`healthai/`](./healthai/) | Proje kaynak kodu (frontend + backend) |
| [`healthai/README.md`](./healthai/README.md) | Kurulum ve geliştirme kılavuzu |

---

## Hızlı Başlangıç

```bash
# Frontend
cd healthai/frontend
npm install && npm run dev

# Backend
cd healthai/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Stack

**Frontend:** React 18 · Vite · Tailwind CSS · shadcn/ui · Zustand  
**Backend:** FastAPI · SQLAlchemy 2.0 async · PostgreSQL 15 · JWT  
**Deploy:** Vercel (FE) · Railway (BE + DB)
