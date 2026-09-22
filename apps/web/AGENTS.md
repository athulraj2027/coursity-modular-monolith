# 🌐 Frontend Service Rules (`apps/web`)

Guidelines and constraints for working within the **Coursity Single Page Application**.

---

## 🎨 Frontend Architecture & Style Invariants

1. **Feature Grouping**:
   - Place domain features inside `src/features/<feature-name>/` with subfolders `api/`, `components/`, `pages/`, `types/`, `schemas/`.
2. **Component Templates**:
   - **Data Grids**: Always use `<DataTableTemplate />` for paginated tables with filters and metric summaries.
   - **Search Input**: Always use `<SearchInput />` with debouncing for live searches to prevent server hammering.
   - **File Uploads**: Always use direct-to-S3 components (`<ImageUploadInput />`, `<ResumeUploadInput />`).
3. **Server State Management**:
   - Use TanStack Query v5 with centralized query key factories.
   - Invalidate matching query keys on mutation success.
4. **Styling & Tokens**:
   - Use Tailwind CSS v4 design tokens.
   - Brand Primary: Crimson `#F42A18` (`bg-primary`, `text-primary`).
   - Dark mode support is mandatory using high-contrast slate classes (`dark:bg-slate-900`, `dark:border-slate-800`).
5. **Form Validation**:
   - Use Zod client-side validation schemas in `schemas/`.

---

## 📚 Related Skill
* Activate the [frontend-feature-development](file:///d:/second-project/coursity-rebuild/.agents/skills/frontend-feature-development/SKILL.md) skill for detailed component examples and state management patterns.
