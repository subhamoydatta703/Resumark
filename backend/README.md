# Resume Analyzer - Backend

The backend of the **Resume Analyzer** application is built on **Bun** and **Express 5** using TypeScript. It exposes an API for Clerk-authenticated file uploads, queues heavy parsing and evaluation jobs using **BullMQ**, and stores processing results in **PostgreSQL** through the **Prisma ORM**. A background worker extracts PDF data and interfaces with the **Google Gemini API** to generate structured, JSON-validated resume insights.

---

## What It Does

- **Secure API Endpoints**: Restricts routes to requests authorized by **Clerk Express** JSON Web Tokens (JWT).
- **Asynchronous User Sync**: Processes user creation, update, and deletion lifecycle events sent via secure Clerk webhooks validated with **Svix** signatures.
- **Queue Pipeline**: Offloads intensive PDF text extraction and AI parsing to a background worker using **BullMQ** and **Redis**.
- **Gemini Structured Output**: Translates raw text parsed from PDFs into a validated JSON schema containing formatting scores, ATS recommendations, technical match details, and profile data.
- **Fast Lookup Cache**: Caches successfully completed resume analyses inside a **Redis Cache** for near-instant retrieval.

---

## Tech Stack

- **Runtime**: Bun 1.x
- **Framework**: Express 5
- **Authentication**: `@clerk/express` & `svix` (webhook verification)
- **Database ORM**: Prisma Client (using `@prisma/adapter-pg` driver)
- **Primary Database**: PostgreSQL
- **Task Queue**: BullMQ
- **Caching & Queue Store**: Redis (powered by `ioredis` and `redis` client libraries)
- **File Upload Engine**: Multer (configured with mime-type validations)
- **Parsing Libraries**: `pdf-parse`
- **AI SDK**: `@google/genai` (Gemini API)
- **Validation**: Zod (for validation of webhook payloads and JSON schemas)

---

## Directory Structure

```
backend/
├── prisma/
│   ├── migrations/            # SQL migration history files
│   └── schema.prisma          # Database schema models (User, Resume, status enums)
├── public/
│   └── data/
│       └── uploads/           # Destination for uploaded PDF files (ignored)
│           └── .gitkeep       # Keeps directory in git
├── src/
│   ├── app.ts                 # Express app initialization & middleware registration
│   ├── server.ts              # Server startup and listening socket
│   ├── config/
│   │   ├── db.ts              # PostgreSQL database client with Prisma adapter
│   │   ├── redis.bullmq.ts    # Redis client configuration for BullMQ
│   │   ├── redis.caching.ts   # Redis client configuration for result caching
│   │   └── workerDB.ts        # Database client dedicated to the worker thread
│   ├── controllers/
│   │   ├── analyzeResumeController.ts # Queue triggering handler
│   │   ├── getResumeResultController.ts # Results querying handler
│   │   └── uploadResumeController.ts  # File write orchestrator
│   ├── middleware/
│   │   ├── authMiddleware.ts    # Extract Clerk auth state and assign req.auth
│   │   └── multerMiddleware.ts  # Multer setup defining limits and folders
│   ├── queues/
│   │   └── resume.queue.ts      # BullMQ queue instantiator
│   ├── routes/
│   │   ├── multerRoutes.ts      # Router for uploads
│   │   ├── resumeAnalysisRoutes.ts # Router for queue trigger & fetch
│   │   └── webhookRoutes.ts     # Router for Clerk webhooks
│   ├── services/
│   │   ├── clerkWebhookVerficationSerivce.ts # Signature checking via Svix
│   │   ├── geminiService.ts             # Gemini SDK calls for structured JSON reviews
│   │   ├── getResumeService.ts          # Cache-first database retriever
│   │   ├── handleClerkWebhookEvent.ts   # Event-based User model operations (upsert/delete)
│   │   ├── resumeAnalysisService.ts     # PDF parsing and Gemini controller pipeline
│   │   ├── uploadResumeService.ts       # Database Resume record generation
│   │   └── workerService.ts             # BullMQ worker thread implementation
│   └── utils/
│       ├── pdfParser.ts                 # Extracts text lines from PDF buffers
│       └── validation.ts                # Validation helper functions
├── Dockerfile                 # Multi-stage Bun base container configuration
├── package.json               # Package declarations and commands
└── tsconfig.json              # TypeScript engine configurations
```

---

## Environment Configuration

Configure your environment by creating a `.env` file in the `backend/` directory:

```env
# Database Connections
DATABASE_URL="postgresql://username:password@localhost:5432/db_name?sslmode=disable"
WORKER_DATABASE_URL="postgresql://username:password@localhost:5432/db_name?sslmode=disable"

# Redis Server Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379

# Google Gemini Credentials
GEMINI_API_KEY="AIzaSy..."

# Allowed CORS Origins (comma-separated list)
FRONTEND_URL="http://localhost:5173,http://localhost:3000"

# Clerk Application Keys
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Webhook Secret (from Clerk Dashboard -> Webhooks -> Select webhook -> Copy Secret)
CLERK_WEBHOOK_SECRET="whsec_..."

# App Configuration
PORT=5000
NODE_ENV=development
```

---

## Scripts & Database Commands

Install dependencies and start services locally with the following scripts:

```bash
# Install packages
bun install

# Apply migrations and verify the DB schema structure is up-to-date
bun run db:push

# Generate a new migration schema (when changes occur in schema.prisma)
bun run db:migrate

# Start the Prisma Studio GUI client on http://localhost:5555
bun run db:studio

# Run the Express API server with live watch reload
bun run dev

# Run the background Queue Worker service in another terminal shell
bun run src/services/workerService.ts

# Start the Express API in production mode (no reload tracking)
bun run start
```

---

## API Endpoints

### 1. Health and Connection Diagnostics
- **Route**: `GET /health`
- **Auth**: None
- **Details**: Validates database and runtime connectivity.

### 2. Resume File Upload
- **Route**: `POST /api/resume/upload`
- **Auth**: Authorized (Bearer Token required)
- **Payload**: `multipart/form-data` with `resume` file field (PDF format only, max 5MB).
- **Details**: Validates, writes files to `public/data/uploads/`, and creates a database row marked `PENDING`.

### 3. Initiate Resume Analysis
- **Route**: `POST /api/analyze/:id`
- **Auth**: Authorized (Bearer Token required)
- **Details**: Verifies user ownership and enqueues a job in BullMQ. Returns `202 Accepted` to immediately free the client.

### 4. Fetch Analysis Result
- **Route**: `GET /api/analyze/:id`
- **Auth**: Authorized (Bearer Token required)
- **Details**: Checks ownership, queries Redis cache for hits, falls back to PostgreSQL, and returns the result details.

### 5. Clerk User Webhook Sync
- **Route**: `POST /api/webhooks/clerk`
- **Auth**: Svix signatures validated using `CLERK_WEBHOOK_SECRET`
- **Details**: Listens for `user.created`, `user.updated`, and `user.deleted` events. Upserts/Deletes database users.

---

## Docker Deployment

The backend application is fully containerized. A single Dockerfile handles both the API server and worker services.

### Running with Docker

1. **API Server Container**:
   ```bash
   docker build -t resume-analyzer-backend ./backend
   docker run -d -p 5000:5000 --env-file ./backend/.env --name resume-api resume-analyzer-backend
   ```

2. **Queue Worker Container**:
   You can run the same image as a worker container by overriding the default command:
   ```bash
   docker run -d --env-file ./backend/.env --name resume-worker resume-analyzer-backend bun run src/services/workerService.ts
   ```
