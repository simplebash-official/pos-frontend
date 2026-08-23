# Multi-stage Docker build for POS Frontend SPA

# Stage 1: Build static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and config files
COPY . .

# Build arguments for Vite environment variables with defaults
ARG VITE_API_BASE_URL=/api
ARG VITE_APP_NAME="Jana2U POS"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Compile TypeScript and build production bundle
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:1.27-alpine AS runner

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 8081

# Health check to verify web server availability
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8081/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
