---
name: docker-environment-devops
description: >-
  Use this skill when starting, configuring, debugging, or maintaining Docker multi-container environments
  for Coursity, including PostgreSQL, Redis, backend, frontend, worker services, and production builds.
---

# Docker Environment & DevOps Skill

This skill provides step-by-step procedures for managing the **Coursity containerized multi-service stack**.

---

## 🐳 Container Architecture & Service Map

```
Monorepo Root
├── docker-compose.dev.yml       # Development stack with live hot-reloading
├── docker-compose.yml           # Production multi-stage build stack
├── apps/http/Dockerfile         # Core API & Worker container
└── apps/web/Dockerfile          # Static Nginx + SPA container
```

### Port Map & Service Topology
| Service | Container Name | Host Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `coursity-web` | `5173` | HTTP | Vite Dev Server / Nginx Production |
| **Backend API** | `coursity-backend` | `3000` | HTTP | Express 5 Core REST API |
| **AI Interview** | `coursity-ai` | `4000` | WS / HTTP | AI Voice & Evaluation Server |
| **PostgreSQL** | `coursity-postgres` | `5432` | TCP | Relational Database Engine |
| **Redis** | `coursity-redis` | `6379` | TCP | Caching, Rate-limits & BullMQ Queue |

---

## 🚀 Common DevOps Workflows

### 1. Launching Full Development Environment (Hot-Reloading)
```bash
docker compose -f docker-compose.dev.yml up --build
```
* Backend code changes in `apps/http/src/` hot-reload instantly via `tsx watch`.
* Frontend code changes in `apps/web/src/` reflect immediately via Vite HMR.

### 2. Running Migrations & Seeding Inside Running Container
```bash
# Execute Prisma migration inside backend container
docker compose -f docker-compose.dev.yml exec backend npm run prisma:migrate

# Seed plans and categories
docker compose -f docker-compose.dev.yml exec backend npx tsx prisma/seed-plans.ts
```

### 3. Inspecting Logs
```bash
# Follow logs for all services
docker compose -f docker-compose.dev.yml logs -f

# Follow logs for backend only
docker compose -f docker-compose.dev.yml logs -f backend
```

### 4. Stopping & Resetting
```bash
# Stop containers (preserves DB volumes)
docker compose -f docker-compose.dev.yml down

# Stop containers AND reset database volumes (Clean wipe)
docker compose -f docker-compose.dev.yml down -v
```
