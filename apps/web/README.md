# 🌐 Coursity Web Frontend (`apps/web`)

The modern, responsive Single Page Application (SPA) for **Coursity** — built with **React 19, Vite, TypeScript, Tailwind CSS v4, and TanStack Query v5**.

---

## 🏛️ Architecture & Directory Structure

The frontend application follows a **Feature-Driven Architecture**, where code is grouped by business domain rather than technical type:

```
src/
├── components/               # Shared Reusable UI Components
│   ├── common/               # High-level Composite Templates
│   │   ├── DataTableTemplate.tsx    # Universal Paginated Table with filters & metrics
│   │   ├── SearchInput.tsx          # Self-contained Debounced Search Bar
│   │   ├── ModalTemplate.tsx        # Base modal layout with backdrop
│   │   ├── UserDetailsDrawer.tsx    # Slide-over inspector for candidate & user review
│   │   ├── ImageUploadInput.tsx     # Direct-to-S3 avatar uploader
│   │   ├── ResumeUploadInput.tsx    # S3 PDF resume uploader with preview
│   │   └── ThemeToggle.tsx          # Light/Dark mode switcher
│   ├── layout/               # Shell layouts (Navbar, Footer, AppSidebar, DashboardLayout)
│   └── ui/                   # Primitive design system widgets (Button, Input, Badge, Card)
│
├── features/                 # Modular Feature Domains
│   ├── auth/                 # Login, Register, Google OAuth Callback, Password Reset
│   ├── profile/              # Student Profile, Teacher Profile, Verification Submission
│   ├── dashboard/            # Admin Management (Students, Instructors, Categorized Sidebar)
│   ├── wallet/               # User Wallets, Top-Ups, Ledger, Teacher Payouts & Admin Balances
│   ├── bank-details/         # User & Teacher Bank accounts and UPI IDs management
│   ├── course/               # Course catalog, Teacher studio, Curriculum builder & Reviews
│   ├── categories/           # Category & taxonomy management
│   ├── plans/                # Dynamic Pricing Catalog, Plan Details & Subscription Flow
│   ├── offers/               # Promo codes, Discounts & Redemption rules
│   ├── interview/            # Real-time Voice AI Interview room, Audio streamer & Reports
│   ├── ai-config/            # Admin AI models, LLM/STT/TTS API key manager
│   ├── wishlist/             # Student saved course wishlist
│   ├── teachers/             # Public Teacher directory & Teacher landing pages
│   └── home/                 # Landing page & Course showcase
│
├── hooks/                    # Reusable Custom React Hooks
│   ├── use-debounce.ts       # Debounce utility hook
│   ├── use-mobile.tsx        # Screen breakpoint detector
│   └── useConfirmDialog.tsx  # Accessible confirmation modal hook
│
├── context/                  # Global Context Providers (AuthContext, ThemeContext)
├── lib/                      # Shared helper utilities, API client, Toast
└── router.tsx                # Application Routing Manifest with Role Guards
```

---

## 🛠️ Technology Stack

| Library | Version | Role |
| :--- | :--- | :--- |
| **React** | `19` | Modern UI library with Concurrent Features |
| **Vite** | `6` | Ultra-fast build tool and development server with HMR |
| **TypeScript** | `5+` | End-to-end type safety |
| **Tailwind CSS** | `4` | Utility-first responsive styling & CSS variables |
| **TanStack Query** | `5` | Server-state caching, optimistic updates & refetching |
| **React Router** | `7` | Declarative routing & role-guarded routes |
| **Lucide React** | Latest | Modern icon set |
| **Zod** | `4` | Client-side form validation schemas |

---

## 🗂️ Categorized Navigation Architecture

The sidebar navigation ([`AppSidebar.tsx`](file:///d:/second-project/coursity-rebuild/apps/web/src/components/layout/AppSidebar.tsx)) is organized into domain-specific navigation categories defined in [`sidebar.constants.ts`](file:///d:/second-project/coursity-rebuild/apps/web/src/features/dashboard/constants/sidebar.constants.ts):

* **Student Hub**: *Learning Hub* (Dashboard, Explore, Wishlist) ➔ *Finance & Billing* (My Wallet, Bank Accounts) ➔ *Account & Security* (Profile, Password, Settings).
* **Teacher Studio**: *Studio & Content* (Dashboard, Courses, Community) ➔ *Finance & Monetization* (Wallet & Payouts, Bank & Settlement, Plans) ➔ *Account & Security* (Profile, Password, Settings).
* **Admin Console**: *Overview* ➔ *User Management* ➔ *Courses & Academics* ➔ *Finance & Treasury* (Wallets, Payouts, Banks, Plans, Subscriptions, Offers) ➔ *AI & Intelligence* ➔ *Account & System*.

---

## 💎 Core Reusable Component Templates

### 1. Universal Debounced `<SearchInput />`
Eliminates typing lag and prevents server hammering by handling fast 60fps typing locally while debouncing API callbacks:

```tsx
import { SearchInput } from "@/components/common"

<SearchInput
  placeholder="Search courses, instructors, or topics..."
  onDebounce={(query) => setApiSearchQuery(query)}
  isLoading={isFetching}
  shortcut="⌘K"
/>
```

### 2. Comprehensive `<DataTableTemplate />`
Powers all data grids with search, faceted dropdown filters, status tabs, pagination, metrics cards, and slide-over drawers:

```tsx
<DataTableTemplate
  title="Instructors Management"
  metrics={metricCards}
  searchQuery={search}
  onSearchChange={setSearch}
  columns={columns}
  data={instructors}
  pagination={{ currentPage, pageSize, totalItems, onPageChange }}
/>
```

### 3. Financial Ledger & Wallet Sync
* `<WalletBalanceCard />`: Real-time available vs locked balance, earning statistics, and quick top-up/withdrawal action triggers.
* `<WalletTransactionTable />`: Filterable chronological transaction ledger with credit/debit badge indicators.
* `<TeacherPayoutsTable />`: Dedicated withdrawal tracking table with status badges (`PENDING`, `PROCESSING`, `COMPLETED`, `REJECTED`) and UTR reference details.

### 4. Direct-to-S3 File Uploaders
* `<ImageUploadInput />`: Handles avatar image selection, preview, and uploads directly to AWS S3 using presigned PUT URLs.
* `<ResumeUploadInput />`: Validates PDF/DOCX resumes (up to 10MB) and handles direct S3 upload with status indicators.

---

## ⚙️ Environment Configuration

Create an `.env` file in `apps/web/.env` (refer to `.env.example`):

```env
# Backend API Base URL
VITE_API_URL=http://localhost:3000/api

# Application Metadata
VITE_APP_NAME=Coursity
VITE_APP_URL=http://localhost:5173

# Google OAuth Client ID (Matching backend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Razorpay Key ID
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# AI Interview WebSocket URL
VITE_INTERVIEW_WS_URL=ws://localhost:4000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173` with instant Vite Hot Module Replacement (HMR).

### 3. Production Build & Preview
```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎨 Design System & Theming

The application supports seamless **Light and Dark Mode** using CSS design tokens defined in `src/index.css`:
* **Brand Primary**: Vibrant crimson `#F42A18`
* **Neutrals**: Sleek slate and dark mode slate palette (`neutral-900`, `neutral-950`)
* **Typography**: Clean, modern system font stack with subtle micro-animations and glassmorphism.

