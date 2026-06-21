# Use the official Bun image as the base
FROM oven/bun:1.3 AS base
WORKDIR /usr/src/app

# Install system dependencies (openssl and ca-certificates are required by Prisma Client)
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration and package files
COPY package.json bun.lock ./

# Install dependencies (including devDependencies required for Prisma client generation)
RUN bun install --frozen-lockfile

# Copy Prisma configuration and database schema first for optimized layer caching
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./

# Generate the Prisma client
RUN bunx prisma generate

# Copy application source code
COPY src ./src

# Expose the default Express server port
EXPOSE 5000


# Default command starts the Express API server
# This image can be reused for the BullMQ worker by overriding the command to: bun run src/services/workerService.ts
CMD ["bun", "run", "src/server.ts"]
