# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: builder
# Install all dependencies (including devDependencies), generate the Prisma
# client, and compile the TypeScript source into two Bun bundles.
# ---------------------------------------------------------------------------
FROM oven/bun:1.3-slim AS builder

WORKDIR /app

# Copy lockfiles first to maximise layer-cache reuse on source-only changes.
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile

# Generate the Prisma client before compiling source so the types are available.
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts backend/tsconfig.json ./
RUN bunx prisma generate

# Compile the API and worker entrypoints into dist/.
COPY backend/src ./src
RUN bun build src/server.ts \
        --target=bun \
        --packages=external \
        --outfile=dist/server.js \
    && bun build src/services/workerService.ts \
        --target=bun \
        --packages=external \
        --outfile=dist/worker.js

# ---------------------------------------------------------------------------
# Stage 2: production
# Install only production dependencies, copy the compiled bundles and the
# already-generated Prisma client from the builder, and drop to a non-root
# user.  No source files, devDependencies, or build tooling reach this stage.
# ---------------------------------------------------------------------------
FROM oven/bun:1.3-slim AS production

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies from the lockfile.
COPY --chown=bun:bun backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy the generated Prisma client from the builder.
# schema.prisma declares `output = "./generated"` (relative to prisma/),
# so prisma generate writes the client to /app/prisma/generated — not to
# node_modules/.prisma.  The Prisma runtime also needs the schema file
# alongside the generated output to locate the query-engine binary.
COPY --from=builder --chown=bun:bun /app/prisma ./prisma

# Copy the compiled application bundles.
COPY --from=builder --chown=bun:bun /app/dist ./dist

# Drop to the non-root bun user provided by the base image.
USER bun

EXPOSE 5000

CMD ["bun", "run", "dist/server.js"]
