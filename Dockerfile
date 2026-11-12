# ─── Option A: Single-stage (fast local deploy) ──────────────────────────────
# Use this when you've already run `npm run build` locally.
# Only pulls nginx:alpine (~25MB) — much faster on slow connections.
# Run: docker build -t graphguard-ai . && docker run -p 3000:80 graphguard-ai
#
# ─── Option B: Full multi-stage (for CI/CD pipelines) ────────────────────────
# Uncomment the builder stage below for environments with fast internet.
# It pulls node:24-alpine (~57MB) + nginx:alpine and builds everything inside Docker.
# ----------------------------------------------------------------------------

# ------ UNCOMMENT FOR FULL CI/CD MULTI-STAGE BUILD ------
# FROM node:24-alpine AS builder
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci --prefer-offline
# COPY . .
# ARG GEMINI_API_KEY=""
# ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY
# RUN npm run build
# ---------------------------------------------------------

# ─── Serve Stage: nginx only (~25MB pull) ─────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-built static assets (run `npm run build` locally first)
COPY dist/ /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fs http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
