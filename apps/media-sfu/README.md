# 🎥 Coursity Media SFU Node Daemon (`apps/media-sfu`)

High-performance real-time Selective Forwarding Unit (SFU) service built with **Mediasoup v3**, **Node.js 22**, **TypeScript**, and **Clean Architecture**.

---

## 🏛️ Architecture & Responsibilities

`apps/media-sfu` serves as the **Stateful Media Plane**:
- **Multi-Core Worker Pool**: Spawns 1 Mediasoup C++ worker per CPU core and balances incoming rooms using least-loaded router distribution.
- **WebRTC Transport Lifecycle**: Creates ICE/DTLS transports and handles producer/consumer RTP pipelines for video, audio, and screen sharing.
- **Heartbeat & Load Reporting**: Publishes node metrics (CPU, memory, active rooms, consumer count) to Redis every 5 seconds for the stateless signaling allocator (`media-signaling`).
- **Zero-Trust Security**: Authenticates client connections via HMAC/JWT join tickets minted by `media-signaling`.

---

## 📡 WebSocket API Protocol

All WebSocket client-server messages are dispatched through `ws://localhost:5000/ws`.

### 1. `session:join` (Client -> Server)
```json
{
  "id": "req-1",
  "type": "session:join",
  "data": {
    "joinToken": "<signed-jwt-token>",
    "rtpCapabilities": { ... }
  }
}
```

### 2. `transport:create` (Client -> Server)
```json
{
  "id": "req-2",
  "type": "transport:create",
  "data": {
    "direction": "send"
  }
}
```

### 3. `transport:connect` (Client -> Server)
```json
{
  "id": "req-3",
  "type": "transport:connect",
  "data": {
    "transportId": "tp-xyz",
    "dtlsParameters": { ... }
  }
}
```

### 4. `media:produce` (Client -> Server)
```json
{
  "id": "req-4",
  "type": "media:produce",
  "data": {
    "transportId": "tp-xyz",
    "kind": "video",
    "rtpParameters": { ... }
  }
}
```

### 5. `media:consume` (Client -> Server)
```json
{
  "id": "req-5",
  "type": "media:consume",
  "data": {
    "transportId": "tp-recv",
    "producerId": "prod-abc",
    "rtpCapabilities": { ... }
  }
}
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start in development mode with hot reload
npm run dev

# Build production TypeScript
npm run build
npm start
```

### Health & Monitoring Endpoints
- `GET http://localhost:5000/health` - Liveness & Readiness probe
- `GET http://localhost:5000/admin/stats` - Current node metrics
- `GET http://localhost:5000/admin/rooms` - Active room inspect
