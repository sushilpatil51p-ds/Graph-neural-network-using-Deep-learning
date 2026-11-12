# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer cache optimisation)
COPY package.json package-lock.json ./

# Install ALL deps (including devDeps needed for build)
RUN npm ci --prefer-offline

# Copy source
COPY . .

# Inject build-time env (VITE_ prefix exposes vars to the browser bundle)
ARG GEMINI_API_KEY=""
ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY

# Production build → /app/dist
RUN npm run build

# ─── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
