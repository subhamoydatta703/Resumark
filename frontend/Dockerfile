# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: builder
# Install all dependencies and compile the React application into dist/.
# VITE_* environment variables are public build-time configuration and are
# read from the frontend-env secret so they never appear in image layers or
# the rendered Compose configuration.
# ---------------------------------------------------------------------------
FROM oven/bun:1.3-slim AS builder

WORKDIR /app

# Copy lockfiles first to maximise layer-cache reuse on source-only changes.
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

# Copy configuration and source files needed for the Vite build.
COPY frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json ./
COPY frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js frontend/eslint.config.js ./
COPY frontend/index.html ./
COPY frontend/public ./public
COPY frontend/src ./src

# Source the secret environment file and run the production build.
# The secret is mounted read-only at /run/secrets/frontend-env by BuildKit
# and is not persisted in any image layer.
RUN --mount=type=secret,id=frontend-env,required=true \
    set -a; \
    . /run/secrets/frontend-env; \
    set +a; \
    bun run build

# ---------------------------------------------------------------------------
# Stage 2: production
# Copy only the compiled dist/ output into an unprivileged Nginx Alpine image.
# No node_modules, source files, or build tooling reach this stage.
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

# Temporarily escalate to root to write configuration into /etc/nginx/.
USER root

# Copy the Vite production build and the SPA-routing Nginx configuration.
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# nginx-unprivileged requires the server to listen on an unprivileged port.
# Replace listen 80 with listen 8080 in case the supplied nginx.conf uses 80.
RUN sed -i 's/listen 80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Drop back to the unprivileged nginx user (UID 101).
USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
