# Stage 1: Build Mediasoup C++ worker and TypeScript
FROM node:22-bullseye-slim AS builder

WORKDIR /app

# Install native build tools for Mediasoup
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:22-bullseye-slim AS runner

WORKDIR /app

# Runtime dependencies (iproute2/procps for metrics)
RUN apt-get update && apt-get install -y \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 5000
# WebRTC UDP/TCP Ports
EXPOSE 20000-20100/udp
EXPOSE 20000-20100/tcp

CMD ["node", "dist/app/server.js"]
