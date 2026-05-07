# HEALTH AI

Academic matchmaking platform that connects healthcare professionals and engineers without storing patient records or research documents.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind v4
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL + Prisma
- Auth: JWT + bcrypt

## Quick Start

Prerequisites:

- Node.js 20+
- npm
- Docker Desktop

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Create env files

Copy the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Then update `backend/.env` with your real Brevo SMTP credentials if you want real verification emails.

### 3. Start PostgreSQL

```bash
npm run db:up
```

This starts a local PostgreSQL container on `localhost:5432` with:

- database: `healthai`
- username: `postgres`
- password: `postgres`

### 4. Push schema and seed demo data

```bash
npm run db:push
npm run db:seed
```

### 5. Start the app

```bash
npm run dev
```

Apps:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## One-command Setup

After Docker is running and env files exist, you can use:

```bash
npm run setup
```

## Demo Accounts

All demo passwords are:

```text
Demo1234!
```

Accounts:

- `admin@metu.edu.tr`
- `doctor1@hacettepe.edu.tr`
- `doctor2@istanbul.edu.tr`
- `eng1@metu.edu.tr`
- `eng2@boun.edu.tr`

## Email Verification

- Only `.edu` and `.edu.tr` emails can register.
- Users must verify their email before logging in.
- For real delivery, configure Brevo credentials in `backend/.env`.

## Common Commands

```bash
npm run dev
npm run db:up
npm run db:down
npm run db:push
npm run db:seed
```

## Notes For Moving To Another Machine

To run this project on a Mac after cloning from GitHub:

1. Install Node.js and Docker Desktop.
2. Clone the repo.
3. Copy `backend/.env.example` to `backend/.env`.
4. Copy `frontend/.env.example` to `frontend/.env`.
5. Run `npm run install:all`.
6. Run `npm run db:up`.
7. Run `npm run db:push`.
8. Run `npm run db:seed`.
9. Run `npm run dev`.

No local PostgreSQL installation is required if Docker Desktop is available.
