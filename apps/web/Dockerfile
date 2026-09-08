# ==========================================
# Stage 1: Build Frontend Assets
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build Arguments for Vite environment variables
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_APP_NAME=Coursity
ARG VITE_APP_URL=http://localhost:5173
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_ENABLE_DEVTOOLS=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_ENABLE_DEVTOOLS=$VITE_ENABLE_DEVTOOLS

# Build production bundle
RUN npm run build

# ==========================================
# Stage 2: Serve via Nginx
# ==========================================
FROM nginx:1.27-alpine AS runner

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
