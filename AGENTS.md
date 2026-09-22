# 🎓 Coursity Workspace Agent Guidelines

Welcome to the **Coursity** monorepo workspace. This document serves as the top-level guidance for AI agents and pair programmers working across this repository.

---

## 🏛️ Monorepo Architecture

Coursity is organized as a containerized **Modular Monolith**:

| Directory | Service | Stack |
| :--- | :--- | :--- |
| [`apps/web`](file:///d:/second-project/coursity-rebuild/apps/web) | Frontend SPA | React 19, Vite 6, Tailwind CSS v4, TanStack Query v5, React Router v7 |
| [`apps/http`](file:///d:/second-project/coursity-rebuild/apps/http) | Core REST API | Node.js 22, Express 5, TypeScript, Clean Architecture / DDD, Prisma 6 |
| [`apps/ai-interview`](file:///d:/second-project/coursity-rebuild/apps/ai-interview) | AI Real-Time Microservice | WebSockets, LangChain/LangGraph, Google GenAI, S3 |
| [`apps/media-sfu`](file:///d:/second-project/coursity-rebuild/apps/media-sfu) | Live SFU Video | Mediasoup, WebRTC *(Roadmap)* |

---

## 🧭 Active Workspace Skills

When working on specific domains, refer to and activate the corresponding workspace skill in [`.agents/skills/`](file:///d:/second-project/coursity-rebuild/.agents/skills):

* [**backend-clean-architecture**](file:///d:/second-project/coursity-rebuild/.agents/skills/backend-clean-architecture/SKILL.md) — Developing and refactoring backend domain modules, Clean Architecture layers, use cases, and repositories.
* [**frontend-feature-development**](file:///d:/second-project/coursity-rebuild/.agents/skills/frontend-feature-development/SKILL.md) — Building React 19 UI components, TanStack Query hooks, forms, and composite templates.
* [**prisma-database-workflow**](file:///d:/second-project/coursity-rebuild/.agents/skills/prisma-database-workflow/SKILL.md) — Multi-file Prisma schemas, database migrations, relations, and seeding scripts.
* [**ai-interview-realtime**](file:///d:/second-project/coursity-rebuild/.agents/skills/ai-interview-realtime/SKILL.md) — Real-time WebSocket audio streaming, VAD, and LangGraph conversation state machines.
* [**docker-environment-devops**](file:///d:/second-project/coursity-rebuild/.agents/skills/docker-environment-devops/SKILL.md) — Multi-container Docker Compose workflows, hot-reload, and containerized operations.
* [**teacher-verification-plans**](file:///d:/second-project/coursity-rebuild/.agents/skills/teacher-verification-plans/SKILL.md) — Instructor vetting state machine, plan tiers, and metered quota enforcement.

---

## ⚡ Cross-Cutting Invariants

1. **Path Aliases**: Always use `@/...` path aliases defined in each subproject's `tsconfig.json`.
2. **Never leak Prisma or HTTP into Domain layers**: Domain entities and interfaces must have zero framework dependencies.
3. **Always use standard response formatting**: Return `ApiResponse.success(res, data)` or `ApiResponse.created(res, data)`.
4. **Direct-to-S3 File Uploads**: Upload large files (avatars, resumes, videos) directly from the client to AWS S3 using presigned URLs.
5. **Debounce Interactive Queries**: Always use `<SearchInput />` with debouncing when querying search APIs.
