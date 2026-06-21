# Step 1: Build stage
FROM oven/bun:1.3-slim AS builder
WORKDIR /app

# Copy dependency configuration
COPY package.json bun.lock ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy configuration files required for Vite build and TypeScript compilation
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts tailwind.config.js postcss.config.js eslint.config.js ./
COPY index.html ./

# Copy source and public assets
COPY public ./public
COPY src ./src

# Declare build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Set them as environment variables during build time so Vite bakes them in
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build the frontend assets
RUN bun run build

# Step 2: Production stage (Nginx)
FROM nginx:alpine AS runner

# Copy built assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
