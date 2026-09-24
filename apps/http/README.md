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
│   ├── user/                 # User moderation, Admin management & User queries
│   ├── profile/              # Student & Teacher profiles, Verification vetting & Resume review
│   ├── wallet/               # Double-entry ledger, Top-ups, Payments & Teacher Payouts
│   ├── bank-detail/          # Instructor & Student Bank accounts and UPI IDs
│   ├── course/               # Courses, Modules, Lessons, Curriculum & Publishing
│   ├── category/             # Educational taxonomies, Categories & Subcategories
│   ├── plan/                 # Dynamic pricing plans, Feature catalog & Tiers
│   ├── subscription/         # Teacher subscriptions, Usage meters & Quota validation
│   ├── offer/                # Platform promotions, Discounts & Coupon codes
│   ├── wishlist/             # Student course bookmarking & saved wishlists
│   ├── interview/            # AI Interview sessions, Turns, Rubric reports & Audio links
│   └── ai-config/            # LLM/STT/TTS AI providers, Model configs & API keys
│
├── shared/                   # Shared utilities, interfaces & types
└── worker.ts                 # Standalone BullMQ background worker process
```

---

## 🧩 Clean Architecture Layers per Module

Each domain module (e.g. `modules/wallet`, `modules/profile`, `modules/course`) follows this 4-layer structure:

1. **`domain/`**: Pure enterprise business rules. Contains Entities, Interfaces, Enums, DTOs, and Domain Errors (zero external framework dependencies).
2. **`application/`**: Use Cases implementing specific business workflows (e.g., `CreateTopUpOrder`, `AdminProcessPayout`, `SubmitTeacherVerification`).
3. **`infrastructure/`**: Concrete implementations of domain interfaces (Prisma Repositories, Redis Caches, S3 Services, Mailers).
4. **`presentation/`**: HTTP Controllers, Express Routes, and Zod Request Validation Schemas.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Framework** | `Node.js 22` + `Express 5` | High-performance REST API |
| **Language** | `TypeScript 5+` | Strict type safety and contracts |
| **Database & ORM** | `PostgreSQL 16` + `Prisma 6` | Multi-file schema migrations (`prisma/schema/*.prisma`) |
| **Cache & Queues** | `Redis 7` + `BullMQ` | Asynchronous job queues & Idempotency store |
| **Cloud Storage** | `@aws-sdk/client-s3` | Presigned PUT/GET URLs for avatars, resumes & course media |
| **Authentication** | `JWT` + `bcryptjs` + `Google OAuth2` | Dual-token authentication (Access + Refresh) |
| **Payments** | `Razorpay` | Top-up orders, Plan checkouts, and Webhook signatures |
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
INTERNAL_SERVICE_SECRET=coursity_internal_microservice_shared_secret_2026

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

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
# Generate Type-Safe Prisma Client across multi-file schema
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

### 💰 Wallet & Financial Ledger (`/api/wallet`)
* `GET /api/wallet/my` — Retrieve authenticated user's wallet balance and lifetime stats.
* `GET /api/wallet/transactions` — Paginated transaction ledger with filters (type, direction, status).
* `POST /api/wallet/topup/create-order` — Create Razorpay order to top up wallet balance.
* `POST /api/wallet/topup/verify` — Verify Razorpay payment and credit wallet balance.
* `POST /api/wallet/payouts/request` — Request teacher earnings withdrawal to bank/UPI.
* `GET /api/wallet/payouts/my` — Get current instructor's past withdrawal requests.
* `GET /api/wallet/admin/wallets` — Admin list all platform user wallets and stats.
* `GET /api/wallet/admin/payouts` — Admin list all withdrawal requests across teachers.
* `PATCH /api/wallet/admin/payouts/:id` — Admin approve, reject, or mark payout completed.
* `POST /api/wallet/admin/adjustment` — Admin manual debit/credit adjustment.

### 🏦 Bank Details (`/api/bank-details`)
* `GET /api/bank-details/my` — List user's bank accounts and UPI IDs.
* `POST /api/bank-details` — Add a new bank account or UPI ID.
* `PATCH /api/bank-details/:id/primary` — Set an account as the primary payout destination.
* `DELETE /api/bank-details/:id` — Delete a bank account / UPI ID.
* `GET /api/bank-details/admin/all` — Admin list all submitted bank details.
* `PATCH /api/bank-details/admin/:id/verify` — Admin verify/reject bank account.

### 📚 Courses & Curriculum (`/api/courses`)
* `GET /api/courses` — Public course catalog with faceted search, category & pricing filters.
* `GET /api/courses/:slug` — Course landing page with modules and lessons outline.
* `POST /api/courses` — Teacher create a new course draft.
* `PUT /api/courses/:id` — Teacher update course details and pricing.
* `POST /api/courses/:id/modules` — Manage course modules, lessons, and video attachments.

### 🎙️ AI Interview Session Sync (`/api/interviews`)
* `POST /api/interviews/sessions` — Initialize AI technical interview session for teacher/student.
* `GET /api/interviews/sessions/:id` — Fetch session details, turn history, and evaluation scores.
* `POST /internal/interviews/:id/turn` — Internal microservice sync for conversation turns.
* `POST /internal/interviews/:id/complete` — Internal microservice sync for final evaluation report.

### 👤 Profile & Verification (`/api/profile`)
* `GET /api/profile/me` — Retrieve current user's profile and instructor details.
* `PUT /api/profile` — Update profile (bio, phone, avatar, expertise, portfolio links).
* `POST /api/profile/teacher/submit-verification` — Submit teacher application for verification review.

### 📦 Storage & File Uploads (`/api/storage`)
* `POST /api/storage/presigned-url` — Generate presigned AWS S3 upload URL for direct-to-S3 uploads.
* `DELETE /api/storage/file` — Delete an uploaded file from S3.

### 💎 Plans & Feature Catalog (`/api/plans`)
* `GET /api/plans` — List active subscription plans with tiered feature allocations.
* `POST /api/plans/subscribe` — Subscribe an instructor to a plan via Razorpay.
* `GET /api/plans/subscription/me` — Get instructor's current subscription & quota consumption.

---

## 🧪 Testing

Run test suites using the native Node.js test runner via `tsx`:
```bash
npm test
```

