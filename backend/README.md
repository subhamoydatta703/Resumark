# Backend

Express 5 API for the Resume Analyzer app. It handles Clerk-authenticated uploads, queues resume analysis jobs, stores resume data in PostgreSQL through Prisma, and processes PDFs and Gemini analysis through a BullMQ worker.

## What It Does

- Accepts authenticated PDF uploads.
- Persists resume metadata and file paths in PostgreSQL.
- Enqueues analysis jobs for background processing.
- Extracts PDF text and sends it to Google Gemini for structured analysis.
- Caches completed analysis results in Redis.

---

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express 5
- **Auth**: Clerk Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue**: BullMQ
- **Cache**: Redis
- **File Uploads**: Multer
- **AI**: Google Gemini SDK

---

## Folder Structure

```
backend/
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- public/
|   `-- data/
|       `-- uploads/
|           `-- .gitkeep
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- config/
|   |   |-- db.ts
|   |   |-- redis.bullmq.ts
|   |   `-- redis.caching.ts
|   |-- controllers/
|   |   |-- analyzeResumeController.ts
|   |   |-- getResumeResultController.ts
|   |   `-- uploadResumeController.ts
|   |-- middleware/
|   |   |-- authMiddleware.ts
|   |   `-- multerMiddleware.ts
|   |-- queues/
|   |   `-- resume.queue.ts
|   |-- routes/
|   |   |-- multerRoutes.ts
|   |   `-- resumeAnalysisRoutes.ts
|   |-- services/
|   |   |-- geminiService.ts
|   |   |-- getResumeService.ts
|   |   |-- resumeAnalysisService.ts
|   |   |-- uploadResumeService.ts
|   |   `-- workerService.ts
|   `-- utils/
|       `-- pdfParser.ts
|-- package.json
`-- tsconfig.json
```

---

## Important Flow

1. The client sends a Clerk-authenticated request to the API.
2. `clerkMiddleware()` populates request auth state.
3. `authMiddleware` reads `getAuth(req)` and attaches the user ID for downstream handlers.
4. Upload requests save the PDF to `public/data/uploads/` and create a database record.
5. Analysis requests enqueue a BullMQ job.
6. The worker extracts text, calls Gemini, stores the result, and updates status.
7. Result requests return cached or database-backed analysis data.

---

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:5173,http://localhost:3000"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
PORT=5000
```

---

## Scripts

```bash
bun install
bun run dev
bun run start
bun run db:push
bun run db:migrate
bun run db:studio
```

- `bun run dev` starts the API server with watch mode.
- `bun run start` runs the API server without watch mode.
- `bun run src/services/workerService.ts` starts the worker in a second terminal.

---

## API Routes

### `GET /health`
- Checks API and database connectivity.

### `POST /api/resume/upload`
- Auth required.
- Accepts `multipart/form-data` with a `resume` file field.
- Stores the uploaded PDF and creates a resume record.

### `POST /api/analyze/:id`
- Auth required.
- Verifies the signed-in user owns the resume.
- Enqueues a resume analysis job.

### `GET /api/analyze/:id/analyze`
- Auth required.
- Verifies ownership and returns the latest analysis state.
- Reads Redis cache first, then falls back to PostgreSQL.

---

## Notes

- Uploaded files are stored under `backend/public/data/uploads/`.
- The uploads directory is kept in git with `.gitkeep`, while actual PDFs are ignored.
- If auth fails with `Unauthorized: Missing authentication credentials`, check the Clerk environment variables and whether the frontend is sending a valid session token.
