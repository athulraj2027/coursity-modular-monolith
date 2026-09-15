# 🌐 Coursity Web Frontend (`apps/web`)

The modern, responsive Single Page Application (SPA) for **Coursity** — built with **React 19, Vite, TypeScript, Tailwind CSS, and TanStack Query**.

---

## 🏛️ Architecture & Directory Structure

The frontend application follows a **Feature-Driven Architecture**, where code is grouped by business domain rather than technical type:

```
src/
├── components/               # Shared Reusable UI Components
│   ├── common/               # High-level Composite Templates
│   │   ├── DataTableTemplate.tsx    # Universal Paginated Table with filters
│   │   ├── SearchInput.tsx          # Self-contained Debounced Search Bar
│   │   ├── ModalTemplate.tsx        # Base modal layout with backdrop
│   │   ├── UserDetailsDrawer.tsx    # Slide-over inspector for candidate review
│   │   ├── VerifyTeacherModal.tsx   # Admin review & grading modal
│   │   ├── ImageUploadInput.tsx     # Direct-to-S3 avatar uploader
│   │   ├── ResumeUploadInput.tsx    # S3 PDF resume uploader with preview
│   │   └── ThemeToggle.tsx          # Light/Dark mode switcher
│   ├── layout/               # Shell layouts (Navbar, Footer, Sidebar, AdminLayout)
│   └── ui/                   # Primitive design system widgets (Button, Input, Badge, Card)
│
├── features/                 # Modular Feature Domains
│   ├── auth/                 # Login, Register, Google OAuth Callback, Password Reset
│   ├── profile/              # Student Profile, Teacher Profile, Verification Submission
│   ├── dashboard/            # Admin Management (Students, Instructors, Analytics)
│   ├── plans/                # Dynamic Pricing Catalog, Plan Details & Subscription Flow
│   ├── teachers/             # Public Teacher directory & Teacher landing pages
│   └── home/                 # Landing page & Course showcase
│
├── hooks/                    # Reusable Custom React Hooks
│   ├── use-debounce.ts       # Debounce utility hook
│   └── use-mobile.tsx        # Screen breakpoint detector
│
├── context/                  # Global Context Providers (AuthContext, ThemeContext)
├── lib/                      # Shared helper utilities, Axios/Fetch client, Toast
└── router.tsx                # Application Routing Manifest with Protected Routes
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
| **React Router** | `7` | Declarative routing & auth-guarded routes |
| **Lucide React** | Latest | Modern icon set |
| **Zod** | `4` | Client-side form validation schemas |

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
Powers all admin data grids with search, faceted dropdown filters, status tabs, pagination, metrics cards, and slide-over drawers:

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

### 3. Direct-to-S3 File Uploaders
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

# Debug / DevTools
VITE_ENABLE_DEVTOOLS=false
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
