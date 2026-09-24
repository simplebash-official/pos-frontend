# Multi-stage Docker build for POS Frontend SPA

# Stage 1: Build static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 --no-audit --no-fund

# Copy source and config files
COPY . .

# Build arguments for Vite environment variables with defaults
ARG VITE_API_BASE_URL=/api
ARG VITE_APP_NAME="SimpleBash POS"
# "true" builds the multi-tenant cloud client (shop-code login); must match
# the backend's TENANT_MODE=multi.
ARG VITE_MULTI_TENANT=""
# Where the multi-tenant login sends people without a shop (the SimpleBash app).
# Empty uses the default in src/config/env.ts (https://app.simplebash.com).
ARG VITE_ACCOUNTS_URL=""
# Commit the build was cut from — surfaced in dist/version.json and the
# Settings → Updates panel. Empty for a local build.
ARG VITE_GIT_SHA=""
# Application version string — overridable in CI/Docker build (defaults to package.json)
ARG VITE_APP_VERSION=""

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_MULTI_TENANT=$VITE_MULTI_TENANT
ENV VITE_ACCOUNTS_URL=$VITE_ACCOUNTS_URL
ENV VITE_GIT_SHA=$VITE_GIT_SHA
ENV VITE_APP_VERSION=$VITE_APP_VERSION

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
EXPOSE 80

# Health check to verify web server availability
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
