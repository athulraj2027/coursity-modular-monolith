# Coursity - Dockerized Monorepo

Welcome to the **Coursity** project! This repository is fully containerized using Docker and Docker Compose for fast, consistent local development and production deployments.

---

## 🏗️ Architecture Overview

The multi-container setup consists of 4 core services:

| Service | Image / Base | Internal Port | Host Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | `nginx:1.27-alpine` | `80` | `5173` | React 19 + Vite frontend SPA with client-side routing & caching. |
| **`backend`** | `node:22-alpine` | `3000` | `3000` | Express REST API server with Prisma ORM & auto-migration. |
| **`postgres`** | `postgres:16-alpine` | `5432` | `5432` | Relational database with persistent volume. |
| **`redis`** | `redis:7-alpine` | `6379` | `6379` | In-memory key-value cache and idempotency store. |

---

## 🚀 Quick Start (Production Mode)

### 1. Configure Environment Variables
Copy the sample environment file to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

### 2. Build and Start All Containers
```bash
docker compose up --build -d
```

### 3. Access the Application
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
- **Backend Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

---

## 🛠️ Development Mode (Hot-Reloading)

To run the stack with live file synchronization and automatic code reload:

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Any modifications to `./apps/http/src` will automatically trigger TypeScript reloads via `tsx watch`.
- Any modifications to `./apps/web/src` will immediately reflect via Vite's Hot Module Replacement (HMR).

---

## 📦 Useful Docker Commands

### Check Container Status & Health
```bash
docker compose ps
```

### View Live Logs
```bash
# Follow logs for all services
docker compose logs -f

# Follow logs for backend only
docker compose logs -f backend

# Follow logs for frontend only
docker compose logs -f frontend
```

### Run Prisma Migrations / Database Commands Manually
```bash
# Generate Prisma Client
docker compose exec backend npx prisma generate

# Push database schema updates
docker compose exec backend npx prisma db push

# Open Prisma Studio (Database GUI)
docker compose exec backend npx prisma studio
```

### Restart a Specific Service
```bash
docker compose restart backend
```

### Stop and Remove Containers
```bash
# Stop containers (preserves database data)
docker compose down

# Stop containers and wipe database volumes
docker compose down -v
```

---

## 📁 Directory Structure

```
coursity-rebuild/
├── apps/
│   ├── http/                 # Express backend application
│   │   ├── Dockerfile        # Multi-stage production build
│   │   ├── Dockerfile.dev    # Development build
│   │   ├── docker-entrypoint.sh # Database sync & launch script
│   │   ├── .dockerignore
│   │   ├── prisma/           # Prisma schema & configs
│   │   └── src/              # Express source code
│   └── web/                  # Vite + React frontend
│       ├── Dockerfile        # Multi-stage production build (Nginx)
│       ├── Dockerfile.dev    # Development build (Vite HMR)
│       ├── nginx.conf        # Nginx SPA & caching config
│       ├── .dockerignore
│       └── src/              # React source code
├── docker-compose.yml        # Production Docker Compose definition
├── docker-compose.dev.yml    # Development Docker Compose definition
├── .dockerignore             # Root Docker ignore
├── .env.example              # Sample environment variables
└── README.md
```
