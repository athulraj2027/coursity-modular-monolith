# 📡 Coursity Media Signaling Service (`media-signaling`)

Stateless WebRTC Signaling, Room Placement, and SFU Node Allocation Gateway for the **Coursity Modular Monolith**.

---

## 🏛️ Architecture & Role

`media-signaling` serves as the stateless control plane in Coursity's two-tier live media architecture:

```
                            ┌──────────────────────────────────┐
    Clients (WS / REST) ───▶│   media-signaling (Stateless)    │
                            │   HPA on CPU / Active Conns      │
                            └────────────────┬─────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
   ┌───────────────────┐                                           ┌───────────────────┐
   │   Redis Cluster   │                                           │     apps/http     │
   │  - room registry  │◀──────────────────────────────────────────│   (Core Domain)   │
   │  - node stats/info│                                           └───────────────────┘
   │  - pub/sub bus    │
   └─────────┬─────────┘
             │ Node stats & heartbeat polling
  ┌──────────┴──────────┬──────────────────────┐
  ▼                     ▼                      ▼
┌──────────────┐ ┌──────────────┐      ┌──────────────┐
│ media-sfu #1 │ │ media-sfu #2 │ ...  │ media-sfu #N │
└──────────────┘ └──────────────┘      └──────────────┘
```

### Key Responsibilities
1. **Room-to-Node Allocation**: Resolves or dynamically assigns rooms to the least-loaded live `media-sfu` instance using weighted scoring (`CPU`, `Memory`, `Active Rooms`, `Active Consumers`).
2. **Authentication & Ticket Issuance**: Verifies user tokens and generates short-lived HMAC-signed `joinToken`s with role-based permissions (`TEACHER`, `STUDENT`, `ADMIN`, `GUEST`).
3. **Dual Transport Support**: Exposes both REST endpoints (`/api/v1/signaling/...`) and WebSocket JSON-RPC signaling (`/ws`).
4. **Cluster Observability**: Aggregates node health and load metrics across the SFU fleet.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP/WS Listening Port | `5001` |
| `REDIS_URL` | Redis cluster connection URI | `redis://localhost:6379` |
| `JWT_SECRET` | Shared JWT secret with Core API & SFU nodes | `coursity-super-secret-jwt-key...` |
| `JOIN_TOKEN_EXPIRES_IN_SECONDS`| Validity duration of media join ticket | `300` (5 min) |
| `ROOM_TTL_SECONDS` | Inactive room TTL in Redis registry | `14400` (4 hours) |
| `HEARTBEAT_TIMEOUT_MS` | Max stale heartbeat before node is evicted | `15000` (15s) |
| `CORE_BACKEND_URL` | Core REST API backend URL | `http://localhost:3000` |

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build & Production Run
```bash
npm run build
npm start
```

---

## 📡 API Reference

### REST Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health and Redis status check |
| `GET` | `/health/live` | Kubernetes Liveness probe |
| `GET` | `/health/ready` | Kubernetes Readiness probe |
| `POST` | `/api/v1/signaling/join` | Authorize join & get allocated SFU node + joinToken |
| `POST` | `/api/v1/signaling/allocate` | Explicitly allocate room to least-loaded SFU node |
| `GET` | `/api/v1/signaling/rooms/:roomId` | Query room allocation details |
| `DELETE` | `/api/v1/signaling/rooms/:roomId` | Release room allocation |
| `GET` | `/api/v1/nodes` | Cluster overview and all active SFU nodes |
| `GET` | `/api/v1/nodes/:nodeId` | Single SFU node metrics |

### WebSocket Protocol (`/ws`)

Clients can send JSON requests:
```json
{
  "id": "req-1",
  "type": "session:join",
  "data": {
    "classSessionId": "room-101",
    "token": "<user-jwt-token>",
    "role": "STUDENT"
  }
}
```

Response:
```json
{
  "id": "req-1",
  "type": "response",
  "ok": true,
  "data": {
    "classSessionId": "room-101",
    "nodeId": "media-node-1",
    "wsUrl": "ws://sfu-1.coursity.internal:5000/ws",
    "httpUrl": "http://sfu-1.coursity.internal:5000",
    "joinToken": "<signed-join-ticket-jwt>",
    "role": "STUDENT",
    "expiresIn": 300
  }
}
```
