---
name: frontend-feature-development
description: >-
  Use this skill when building or refactoring frontend features, UI components, or pages in apps/web.
  Covers React 19, Tailwind CSS v4 design tokens, TanStack Query v5 server state, Zod form validation,
  and reusable composite templates (DataTableTemplate, SearchInput, direct-to-S3 uploaders).
---

# Frontend Feature Development Skill (`apps/web`)

This skill defines conventions and reusable patterns for the **Coursity Single Page Application** (`apps/web`), built with **React 19, Vite, Tailwind CSS v4, and TanStack Query v5**.

---

## 🏛️ Feature-Driven Directory Structure

Code is modularized by business feature inside [`apps/web/src/features/<feature-name>/`](file:///d:/second-project/coursity-rebuild/apps/web/src/features):

```
apps/web/src/features/<feature-name>/
├── api/                         # API service calls & TanStack Query hooks/keys
│   ├── <feature>.api.ts         # Axios/Fetch endpoints
│   └── use-<feature>-queries.ts # useQuery & useMutation hooks
│
├── components/                  # Domain-specific UI widgets
│   └── <FeatureCard>.tsx
│
├── pages/                       # Full page views mounted in router.tsx
│   └── <FeaturePage>.tsx
│
├── types/                       # TypeScript interfaces & DTOs
│   └── <feature>.types.ts
│
└── schemas/                     # Zod client validation schemas
    └── <feature>.schema.ts
```

---

## 💎 Core Composite Templates & UI Patterns

### 1. High-Performance Debounced Search (`<SearchInput />`)
Never wire live search input directly to API calls without debouncing. Always use the built-in `<SearchInput />` component:

```tsx
import { SearchInput } from "@/components/common/SearchInput";

export function CourseSearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <SearchInput
      placeholder="Search by title, instructor, or topic..."
      onDebounce={onSearch}
      debounceMs={400}
      shortcut="⌘K"
    />
  );
}
```

### 2. Universal Data Tables (`<DataTableTemplate />`)
Powers all data grids with built-in search, faceted filter dropdowns, status tab filters, metrics cards, pagination, and slide-over drawers:

```tsx
import { DataTableTemplate, ColumnDef } from "@/components/common/DataTableTemplate";

const columns: ColumnDef<TeacherItem>[] = [
  { header: "Instructor", accessorKey: "name" },
  { header: "Expertise", accessorKey: "expertise" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (item) => <Badge variant={item.status}>{item.status}</Badge>,
  },
];

<DataTableTemplate
  title="Instructors Management"
  description="Review teacher applications and manage vetting status"
  data={teachers}
  columns={columns}
  isLoading={isLoading}
  searchQuery={search}
  onSearchChange={setSearch}
  pagination={{
    currentPage: page,
    pageSize: 10,
    totalItems: total,
    onPageChange: setPage,
  }}
/>
```

### 3. Direct-to-S3 File Uploaders
Eliminates backend memory overhead by requesting a presigned URL and uploading directly from the browser:

* **Avatar / Image Upload**:
  ```tsx
  import { ImageUploadInput } from "@/components/common/ImageUploadInput";

  <ImageUploadInput
    value={avatarUrl}
    onChange={(url) => setAvatarUrl(url)}
    folder="avatars"
  />
  ```

* **Resume / Document Upload**:
  ```tsx
  import { ResumeUploadInput } from "@/components/common/ResumeUploadInput";

  <ResumeUploadInput
    value={resumeUrl}
    onChange={(url) => setResumeUrl(url)}
    maxSizeMB={10}
    allowedExtensions={[".pdf", ".docx"]}
  />
  ```

* **Multi-Format S3 Direct Upload Hook (`useUploadFile`)**:
  ```tsx
  import { useUploadFile } from "@/features/dashboard/hooks/useUpload";

  const { uploadFile, isPending: isUploading, progress } = useUploadFile();

  const fileUrl = await uploadFile({
    file,
    options: { folder: "homework" }, // "homework" | "notes" | "avatars" | "resumes"
  });
  ```

### 4. Interactive Drawers & Modal Templates
Always utilize the unified `<ModalTemplate />` (exported from `@/components/common/ModalTemplate`) and `<ConfirmationModal />`:
* Use `maxWidth="lg"` or `maxWidth="xl"` for complex forms with drag-and-drop file uploaders.
* Use slide-over drawers (e.g., `<LectureNotesDrawer />`, `<LectureHomeworkDrawer />`) for non-intrusive sub-resource browsing from lecture and classroom tables.

---

## ⚡ TanStack Query v5 Conventions

### 1. Query Key Factories
Define clear, scoped query key structures to prevent stale cache bugs:

```typescript
// apps/web/src/features/homework/api/homework.keys.ts
export const homeworkKeys = {
  all: ["homework"] as const,
  byLecture: (lectureId: string) => [...homeworkKeys.all, "lecture", lectureId] as const,
  byCourse: (courseId: string) => [...homeworkKeys.all, "course", courseId] as const,
  detail: (id: string) => [...homeworkKeys.all, "detail", id] as const,
  submissions: (homeworkId: string) => [...homeworkKeys.all, "submissions", homeworkId] as const,
};
```

### 2. Mutations with Cache Invalidation
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { homeworkKeys } from "./homework.keys";
import { homeworkApi } from "./homework.api";
import { toast } from "@/lib/toast";

export function useSubmitHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ homeworkId, payload }: { homeworkId: string; payload: SubmitHomeworkPayload }) =>
      homeworkApi.submitHomework(homeworkId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(data.homeworkId) });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.submissions(data.homeworkId) });
      toast.success("Homework submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit homework");
    },
  });
}
```

---

## 🎨 Design System & Styling Guidelines

* **Brand Primary**: Vibrant Crimson `#F42A18` (`bg-[#F42A18]`, `text-[#F42A18]`, `border-[#F42A18]`)
* **Dark Mode**: High-contrast slate styling (`bg-slate-900`, `bg-slate-950`, `border-slate-800`, `text-slate-100`)
* **Status Badges**:
  * Emerald (`bg-emerald-500/10 text-emerald-400 border-emerald-500/30`): `VERIFIED`, `Completed`, `Published`.
  * Amber (`bg-amber-500/10 text-amber-400 border-amber-500/30`): `PENDING`, `Submitted`, `Scheduled`.
  * Rose (`bg-rose-500/10 text-rose-400 border-rose-500/30`): `REDO`, `Late`, `Rejected`.
  * Slate (`bg-slate-800 text-slate-400 border-slate-700`): `NOT_DONE`, `Draft`.
* **Glassmorphism & Accents**: `backdrop-blur-md bg-white/80 dark:bg-slate-900/80`
* **Icons**: Use `lucide-react` with consistent sizing (`w-3.5 h-3.5`, `w-4 h-4`, `w-5 h-5`).
