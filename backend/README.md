# Resumark Backend

The Resumark backend contains two Bun processes built from the same TypeScript codebase: an Express 5 API server and a BullMQ worker. The API authenticates requests, accepts PDF uploads, coordinates S3 and PostgreSQL writes, and enqueues analysis work. The worker performs PDF extraction, Gemini analysis, schema validation, persistence, and cache invalidation.

## Technology

The service runs on Bun 1.x with Express 5. Prisma 7 and the PostgreSQL adapter provide database access. BullMQ uses Redis as its broker, while a separate Redis client handles result caching and rate limiting. Clerk secures API requests, Svix verifies Clerk webhooks, Multer validates in-memory PDF uploads, the AWS SDK manages S3 objects, `pdf-parse` extracts text, Google GenAI calls Gemini, and Zod validates structured output.

## Directory Structure

```text
backend/
|-- prisma/
|   |-- migrations/                 # Versioned PostgreSQL migrations
|   |-- generated/                  # Generated Prisma client (git-ignored)
|   `-- schema.prisma               # User, Resume, and ResumeStatus definitions
|-- src/
|   |-- config/                     # PostgreSQL, Redis, and AWS clients
|   |-- controllers/                # Express request and response handlers
|   |-- middleware/                 # Clerk auth, upload validation, rate limiting
|   |-- queues/                     # BullMQ queue declaration
|   |-- routes/                     # Resume, analysis, and webhook routers
|   |-- services/                   # Storage, analysis, cache, webhook, and worker logic
|   |-- utils/                      # PDF parsing and Zod schemas
|   |-- app.ts                      # Express application configuration
|   `-- server.ts                   # API process entrypoint
|-- .env.example
|-- Dockerfile
|-- package.json
|-- prisma.config.ts
`-- tsconfig.json
```

## Environment Variables

Copy `.env.example` to `.env` and provide values for the target environment. Secret values must be injected at runtime and must not be committed or included in container images.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `production` | Runtime environment mode. |
| `PORT` | Yes | `5000` | Port used by the Express API. |
| `FRONTEND_URL` | Yes | `https://app.example.com` | Comma-separated CORS allowlist. |
| `DATABASE_URL` | Yes | `postgresql://user:password@db.example.com:5432/resumark?sslmode=require` | PostgreSQL connection used by the API. |
| `WORKER_DATABASE_URL` | Yes | `postgresql://user:password@db.example.com:5432/resumark?sslmode=require` | PostgreSQL connection used by the worker. It may point to the same database with separate pool settings. |
| `REDIS_HOST` | Yes | `redis` | Redis hostname for BullMQ, caching, and rate limiting. Overridden to `redis` inside the Compose network. |
| `REDIS_PORT` | Yes | `6379` | Redis TCP port. Overridden to `6379` inside the Compose network. |
| `AWS_REGION` | Yes | `ap-south-1` | Region containing the resume bucket. |
| `AWS_ACCESS_KEY_ID` | Yes | `your_aws_access_key_id_here` | AWS access key for S3 operations. Prefer workload identity in managed environments when available. |
| `AWS_SECRET_ACCESS_KEY` | Yes | `your_aws_secret_access_key_here` | AWS secret key for S3 operations. |
| `AWS_S3_BUCKET_NAME` | Yes | `your_s3_bucket_name_here` | S3 bucket used for uploaded PDFs. |
| `CLERK_PUBLISHABLE_KEY` | Yes | `your_clerk_publishable_key_here` | Clerk application publishable key. |
| `CLERK_SECRET_KEY` | Yes | `your_clerk_secret_key_here` | Clerk server credential used to validate sessions and fetch users. |
| `CLERK_WEBHOOK_SECRET` | Yes | `your_clerk_webhook_secret_here` | Svix signing secret for Clerk lifecycle webhooks. |
| `GEMINI_API_KEY` | Yes | `your_gemini_api_key_here` | Google Gemini API credential used by the worker. |

## Commands

Run commands from `backend/`.

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies from `bun.lock`. |
| `bun run dev` | Start the API with Bun watch mode. |
| `bun run start` | Start the API without watch mode. |
| `bun run db:push` | Push the Prisma schema to the configured database without creating a migration. Use during initial development. |
| `bun run db:migrate` | Create and apply a named development migration. |
| `bun run db:studio` | Open Prisma Studio for the configured database. |
| `bun run src/services/workerService.ts` | Start the BullMQ worker in development. |
| `bun build src/server.ts --target=bun --packages=external --outfile=dist/server.js` | Build the production API entrypoint. |
| `bun build src/services/workerService.ts --target=bun --packages=external --outfile=dist/worker.js` | Build the production worker entrypoint. |

`package.json` defines `start`, `dev`, `db:migrate`, `db:push`, and `db:studio`. There are no named `build` or `worker` scripts; the Dockerfile runs the explicit Bun build commands and Compose starts `dist/worker.js` directly.

## Prisma Schema

`User` uses the Clerk user identifier as its primary key, stores a unique email address, and owns zero or more resumes.

`Resume` stores the generated identifier, stored filename, original filename, S3 key, owner relation, timestamps, processing status, and optional JSON analysis result. `ResumeStatus` supports `PENDING`, `PROCESSING`, `COMPLETED`, and `FAILED`.

There is no separate `Analysis` model. The validated Gemini response is persisted directly in `Resume.analysisResult`. This avoids a separate join and keeps the result co-located with the record that tracks its processing lifecycle.

## API Routes

Protected routes require `Authorization: Bearer <Clerk session token>`.

### Health Check

`GET /health` is public. It executes a simple PostgreSQL query and reports API and database health.

Successful response:

```json
{
  "status": "ok",
  "timestamp": "2026-06-22T00:00:00.000Z",
  "uptime": 120.5,
  "database": "connected"
}
```

### Upload Resume

`POST /api/resume/upload` requires authentication and is rate limited. Send `multipart/form-data` with one PDF in the `resume` field. The maximum file size is 5 MB; both the MIME type and filename extension must identify a PDF.

Successful response:

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "fileData": {
    "id": "resume_id",
    "fileName": "stored_file_name",
    "originalName": "resume.pdf",
    "s3Key": "resumes/timestamp-resume.pdf",
    "status": "PENDING",
    "analysisResult": null,
    "userId": "clerk_user_id",
    "createdAt": "2026-06-22T00:00:00.000Z",
    "updatedAt": "2026-06-22T00:00:00.000Z"
  }
}
```

If the same user uploads a file with the same original name, the previous S3 object is deleted and the existing record is reset to `PENDING` with no analysis result.

### Start Analysis

`POST /api/analyze/:id` requires authentication and is rate limited. It has no request body. The API verifies that the resume exists and belongs to the authenticated user, then enqueues a job using the resume ID as both payload and BullMQ job ID, which prevents duplicate active jobs for one resume.

Accepted response:

```json
{
  "message": "Analysis started"
}
```

The route returns `404` when the resume does not exist, `403` when ownership does not match, and `202` when the job is accepted.

### Get Analysis Status or Result

`GET /api/analyze/:id` requires authentication. It reads the user-scoped Redis cache first and falls back to PostgreSQL.

Successful response:

```json
{
  "success": true,
  "message": "Resume analysis result retrieved successfully",
  "resumeRes": {
    "status": "COMPLETED",
    "analysisResult": {
      "candidateInfo": {},
      "summary": "Analysis summary",
      "skills": [],
      "strengths": [],
      "improvements": [],
      "overallScore": 80,
      "atsScore": 82,
      "formattingScore": 78,
      "suggestedRoles": []
    }
  }
}
```

While processing, `analysisResult` may be `null` and `status` is `PENDING` or `PROCESSING`. Completed and failed responses are cached for 300 seconds.

### Clerk Webhook

`POST /api/webhooks/clerk` is public at the HTTP layer but requires valid `svix-id`, `svix-timestamp`, and `svix-signature` headers. It accepts Clerk `user.created`, `user.updated`, and `user.deleted` events and synchronizes the `User` model.

Successful response:

```json
{
  "success": true
}
```

Invalid signatures or payloads return `400` with `{ "success": false, "message": "Invalid webhook" }`.

## Queue Architecture

The API creates a BullMQ queue named `resume-analysis` using the Redis connection in `src/config/redis.bullmq.ts`. The analysis controller adds a job named `resume-analysis` with `{ "fileID": "..." }` and uses the same identifier as `jobId`, preventing duplicate active jobs for one resume.

The worker is a separate long-running process connected to the same queue and Redis instance. API replicas can enqueue work without performing PDF parsing or waiting for Gemini, and worker replicas can consume jobs independently.

## Worker Pipeline

1. Read the resume identifier from the BullMQ job.
2. Load the resume through the worker's Prisma client and return an existing completed result when present.
3. Set the database status to `PROCESSING`.
4. Download the PDF buffer from AWS S3.
5. Extract text with the PDF parser.
6. Send the text to Gemini with a structured JSON-only prompt.
7. Remove optional Markdown code fences and parse the JSON response.
8. Validate the parsed object with the analysis Zod schema.
9. Save the object in `Resume.analysisResult` and set the status to `COMPLETED`.
10. Delete the user-scoped Redis result key so the next read observes fresh data.

If any step fails, the worker sets the record to `FAILED`, clears the same cache key, logs the error, and rethrows it so BullMQ records the failed job.

## Error Handling

Controllers use `try/catch` boundaries and return JSON with a boolean `success` flag where applicable. Authentication failures return `401`; ownership checks return `403`; missing analysis targets return `404`; rate-limit violations return `429`; malformed or unsigned webhooks return `400`; and unexpected controller failures return `500`.

Service functions throw errors for missing records, authorization failures, invalid analysis output, and external-service failures. The worker owns status transitions for background failures. Redis cache entries are invalidated after both successful and failed worker runs to prevent stale terminal state.

## Containers

Build the backend image from the repository root because the Dockerfile uses the root build context and root `.dockerignore`:

```bash
docker build -f backend/Dockerfile -t resumark-backend:local .
```

The production stage runs as the non-root `bun` user, installs production dependencies only, copies the pre-generated Prisma client from the builder stage, and contains bundled API and worker entrypoints. Start the API with the default command or override it for the worker:

```bash
docker run --env-file backend/.env -p 5000:5000 resumark-backend:local
docker run --env-file backend/.env resumark-backend:local bun run dist/worker.js
```
