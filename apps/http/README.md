# 🚀 Coursity Core Backend (`apps/http`)

The core HTTP backend server for **Coursity** — built with **Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ, and AWS S3**. 

Designed following **Clean Architecture / Domain-Driven Design (DDD)** principles within a modular monolith structure.

---

## 🏛️ Architecture Overview

The backend is organized into decoupled domain modules inside `src/modules/`. Each module adheres to Clean Architecture layer separation:

```
src/
├── app/                      # Application Bootstrap & Configuration
│   ├── config/               # Zod-validated environment variables
│   ├── middlewares/          # Global middlewares (Auth, RateLimit, ErrorHandler, Idempotency)
│   ├── errors/               # Domain & Application error hierarchy
│   ├── routes.ts             # Central API routing manifest
│   └── server.ts             # HTTP server entry point & graceful shutdown
│
├── infrastructure/           # Global Infrastructure Services
│   ├── database/             # Prisma client & connection management
│   ├── redis/                # Redis client & key-value cache
│   └── queue/                # BullMQ shared queue connection
│
├── modules/                  # Modular Business Domains
│   ├── auth/                 # Authentication, JWT, Refresh Tokens & Google OAuth
│   ├── user/                 # User management, Admin moderation & User queries
│   ├── profile/              # Student & Teacher profiles, Verification & Resume review
│   ├── plan/                 # Dynamic pricing plans, Feature catalog & Quota enforcement
│   ├── storage/              # AWS S3 Cloud Storage & Local Fallback with Presigned URLs
│   └── email/                # Nodemailer transport & BullMQ background email worker
│
├── shared/                   # Shared utilities, interfaces & types
└── worker.ts                 # Standalone BullMQ background worker process
```

---

## 🧩 Clean Architecture Layers per Module

Each domain module (e.g. `modules/profile`, `modules/plan`) follows this 4-layer structure:

1. **`domain/`**: Pure enterprise business rules. Contains Entities, Interfaces, Enums, DTOs, and Domain Errors (zero external framework dependencies).
2. **`application/`**: Use Cases implementing specific business workflows (e.g., `SubmitTeacherVerification`, `SubscribePlan`, `RecordUsage`).
3. **`infrastructure/`**: Concrete implementations of domain interfaces (Prisma Repositories, Redis Caches, S3 Services, Mailers).
4. **`presentation/`**: HTTP Controllers, Express Routes, and Zod Request Validation Schemas.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Framework** | `Node.js 22` + `Express 5` | High-performance REST API |
| **Language** | `TypeScript 5+` | Strict type safety and contracts |
| **Database & ORM** | `PostgreSQL 16` + `Prisma 6` | Schema-driven migrations and type-safe queries |
| **Cache & Queues** | `Redis 7` + `BullMQ` | Asynchronous job queues & Idempotency store |
| **Cloud Storage** | `@aws-sdk/client-s3` | Presigned PUT/GET URLs for avatars & teacher resumes |
| **Authentication** | `JWT` + `bcryptjs` + `Google OAuth2` | Dual-token authentication (Access + Refresh) |
| **Validation** | `Zod 4` | Runtime schema validation for requests & configs |
| **Email Service** | `Nodemailer` + `BullMQ Worker` | Background queued transactional email delivery |

---

## ⚙️ Environment Configuration

Create an `.env` file in `apps/http/.env` (refer to `.env.example`):

```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database & Cache
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coursity?schema=public
REDIS_URL=redis://localhost:6379

# Authentication & Security
JWT_SECRET=your_super_secret_access_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# AWS S3 Cloud Storage
AWS_REGION=ap-south-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=coursity-bucket
AWS_CLOUDFRONT_URL=
USE_LOCAL_STORAGE=false

# SMTP / Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM="Coursity <noreply@coursity.com>"
ENABLE_IN_PROCESS_WORKER=true
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration & Prisma Client
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply Database Migrations
npm run prisma:migrate
```

### 3. Run in Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3000` with hot-reloading powered by `tsx watch`.

### 4. Run Standalone Background Worker
To run the background queue worker in a dedicated process (production pattern):
```bash
npm run worker
```

---

## 📡 Core API Modules & Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new student or instructor.
* `POST /api/auth/login` — Sign in with email & password (sets HTTP-only refresh cookie).
* `POST /api/auth/logout` — Revoke active session tokens.
* `POST /api/auth/refresh` — Issue a new access token using the refresh cookie.
* `GET /api/auth/me` — Fetch currently authenticated user payload.
* `GET /api/auth/google` & `/api/auth/google/callback` — Google OAuth2 authentication.
* `POST /api/auth/forgot-password` & `/api/auth/reset-password` — Password recovery flow.

### 👤 Profile & Verification (`/api/profile`)
* `GET /api/profile/me` — Retrieve the current user's profile and instructor details.
* `PUT /api/profile` — Update student or teacher profile (bio, phone, avatar, expertise, links).
* `POST /api/profile/teacher/submit-verification` — Submit teacher application for verification review.

### 📦 Storage & File Uploads (`/api/storage`)
* `POST /api/storage/presigned-url` — Generate presigned AWS S3 upload URL for direct-to-S3 uploads.
* `DELETE /api/storage/file` — Delete an uploaded file from S3.

### 💎 Plans & Feature Catalog (`/api/plans`)
* `GET /api/plans` — List active subscription plans with tiered feature allocations.
* `GET /api/plans/:slug` — Get plan details by slug.
* `POST /api/plans/subscribe` — Subscribe an instructor to a plan.
* `GET /api/plans/subscription/me` — Get instructor's current subscription & quota consumption.
* `POST /api/plans/usage/record` — Record metered usage against subscription quotas.

### 🛡️ Admin Management (`/api/admin`)
* `GET /api/admin/users` — Paginated list of users with search, role, and provider filters.
* `PATCH /api/admin/users/:id/block` — Toggle block/unblock status for accounts.
* `PATCH /api/admin/teachers/:id/verify` — Admin verification review (Approve, Request Redo, Revoke).

---

## 🧪 Testing

Run test suites using the native Node.js test runner via `tsx`:
```bash
npm test
```
