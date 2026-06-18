# Resume Analyzer

A resume analyzing and review platform built with Bun, Express, Prisma, Redis, BullMQ, Clerk, React, Vite, and Tailwind CSS. The app uploads PDF resumes, parses them asynchronously, and returns structured AI analysis with scores, extracted details, and improvement suggestions.

### Key Features
- **Clerk-based authentication & Webhooks**: Frontend sign-in uses Clerk, and backend user profiles are synchronized asynchronously via secure webhook events validated with Svix signatures.
- **Asynchronous analysis pipeline**: Resume analysis runs through a BullMQ queue and background worker so uploads stay responsive.
- **AI-driven evaluation**: Google Gemini powers resume parsing, scoring, skill extraction, ATS-style feedback, and suggested roles.
- **Responsive frontend**: The UI uses a shared shell, mobile-friendly cards, and state-based screens for upload, pending, success, and error flows.
- **Persistent resume history**: PostgreSQL stores uploaded resumes and analysis results, while Redis helps with queueing and cached lookups.

---

### System Architecture

```mermaid
graph TD
    subgraph Frontend["React Frontend"]
        App["App / Clerk auth shell"]
        UploadPage["UploadPage"]
        Uploader["ResumeUploader"]
        Scanner["PendingScanner"]
        Dashboard["AnalysisDashboard"]
        Api["Axios API client"]

        App --> UploadPage
        UploadPage --> Uploader
        UploadPage --> Scanner
        UploadPage --> Dashboard
        UploadPage --> Api
    end

    subgraph Backend["Bun + Express API"]
        GlobalAuth["Global clerkMiddleware()"]
        Auth["authMiddleware using getAuth(req)"]
        UploadRoute["POST /api/resume/upload"]
        AnalyzeRoute["POST /api/analyze/:id"]
        ResultRoute["GET /api/analyze/:id"]
        WebhookRoute["POST /api/webhooks/clerk"]
        UploadCtrl["uploadResumeController"]
        AnalyzeCtrl["analyzeResumeController"]
        ResultCtrl["getResumeResultController"]
        WebhookCtrl["webhookRoutes"]
        UploadSvc["uploadResumeService"]
        AnalyzeSvc["resumeAnalysisService"]
        GetSvc["getResumeService"]
        WebhookVerifySvc["clerkWebhookVerficationSerivce"]
        WebhookHandleSvc["handleClerkWebhookEvent"]
        Worker["workerService"]
        Parser["pdfParser.ts"]
        Gemini["geminiService.ts"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma Client"]
        Postgres[("PostgreSQL")]
        RedisQueue[("Redis BullMQ Queue")]
        RedisCache[("Redis Cache")]
    end

    subgraph External["External Service"]
        Clerk["Clerk"]
        GeminiAPI["Google Gemini API"]
    end

    Api -->|"Bearer token / credentials"| GlobalAuth
    GlobalAuth --> Auth
    Auth --> UploadRoute
    Auth --> AnalyzeRoute
    Auth --> ResultRoute
    Clerk -->|"User events (svix signed)"| WebhookRoute
    WebhookRoute --> WebhookCtrl
    WebhookCtrl --> WebhookVerifySvc
    WebhookCtrl --> WebhookHandleSvc
    WebhookHandleSvc --> Prisma

    UploadRoute --> UploadCtrl
    AnalyzeRoute --> AnalyzeCtrl
    ResultRoute --> ResultCtrl

    UploadCtrl --> UploadSvc
    AnalyzeCtrl --> RedisQueue
    ResultCtrl --> GetSvc

    UploadSvc --> Prisma
    GetSvc --> RedisCache
    GetSvc --> Prisma
    AnalyzeSvc --> Prisma
    Worker --> RedisQueue
    Worker --> AnalyzeSvc
    AnalyzeSvc --> Parser
    AnalyzeSvc --> Gemini
    Gemini --> GeminiAPI
    Prisma --> Postgres
    Clerk --> GlobalAuth
```

---

## Repository Structure

```
resume_analyzer/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   `-- schema.prisma
|   |-- public/
|   |   `-- data/
|   |       `-- uploads/
|   |           `-- .gitkeep
|   |-- src/
|   |   |-- app.ts
|   |   |-- server.ts
|   |   |-- config/
|   |   |   |-- db.ts
|   |   |   |-- redis.bullmq.ts
|   |   |   |-- redis.caching.ts
|   |   |   `-- workerDB.ts
|   |   |-- controllers/
|   |   |   |-- analyzeResumeController.ts
|   |   |   |-- getResumeResultController.ts
|   |   |   `-- uploadResumeController.ts
|   |   |-- middleware/
|   |   |   |-- authMiddleware.ts
|   |   |   `-- multerMiddleware.ts
|   |   |-- queues/
|   |   |   `-- resume.queue.ts
|   |   |   |-- routes/
|   |   |   |-- multerRoutes.ts
|   |   |   |-- resumeAnalysisRoutes.ts
|   |   |   `-- webhookRoutes.ts
|   |   |-- services/
|   |   |   |-- clerkWebhookVerficationSerivce.ts
|   |   |   |-- geminiService.ts
|   |   |   |-- getResumeService.ts
|   |   |   |-- handleClerkWebhookEvent.ts
|   |   |   |-- resumeAnalysisService.ts
|   |   |   |-- uploadResumeService.ts
|   |   |   `-- workerService.ts
|   |   `-- utils/
|   |       |-- pdfParser.ts
|   |       `-- validation.ts
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- public/
|   |   |-- favicon.svg
|   |   `-- icons.svg
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |   |-- AnalysisDashboard.tsx
|   |   |   |-- PageShell.tsx
|   |   |   |-- PendingScanner.tsx
|   |   |   `-- ResumeUploader.tsx
|   |   |-- pages/
|   |   |   `-- UploadPage.tsx
|   |   |-- services/
|   |   |   `-- api.ts
|   |   |-- types/
|   |   |   `-- index.ts
|   |   |-- App.tsx
|   |   |-- index.css
|   |   `-- main.tsx
|   |-- package.json
|   `-- vite.config.ts
|-- docker-compose.yml
|-- .gitignore
`-- README.md
```

---

## Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Express 5 with TypeScript
- **Authentication**: Clerk Express middleware and `getAuth(req)`
- **Database ORM**: Prisma with PostgreSQL
- **Task Queue**: BullMQ
- **Cache**: Redis
- **File Upload**: Multer
- **AI Integration**: Google Gemini
- **Webhooks Verification**: Svix (Clerk event signature verification)

### Frontend
- **Framework**: React 19 + Vite
- **Authentication UI**: Clerk React
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- **Bun** 1.x or newer
- **PostgreSQL** database
- **Redis** server
- **Clerk** application keys
- **Google Gemini API key**

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Configure environment variables**:
   Create `backend/.env` and set the required values:
   ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    WORKER_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    GEMINI_API_KEY="your-gemini-api-key"
    FRONTEND_URL="http://localhost:5173,http://localhost:3000"
    CLERK_PUBLISHABLE_KEY="pk_test_..."
    CLERK_SECRET_KEY="sk_test_..."
    PORT=5000
   ```

4. **Apply Prisma schema changes**:
   ```bash
   bun run db:push
   ```

5. **Start the backend API**:
   ```bash
   bun run dev
   ```

6. **Start the background worker in a second terminal**:
   ```bash
   bun run src/services/workerService.ts
   ```

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Configure environment variables**:
   Create `frontend/.env` if you want to override defaults:
   ```env
   VITE_API_URL="http://localhost:5000"
   VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
   ```

4. **Start the frontend**:
   ```bash
   bun run dev
   ```

5. **Build for production**:
   ```bash
   bun run build
   ```

---

## API Endpoints

### 1. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Verifies the API and database connectivity.

### 2. Upload Resume
- **URL**: `/api/resume/upload`
- **Method**: `POST`
- **Content Type**: `multipart/form-data`
- **Auth**: Required
- **Payload**: Attach a PDF under the `resume` field.
- **Workflow**:
  - Clerk auth is resolved by the backend middleware.
  - The file is validated and written to `backend/public/data/uploads/`.
  - A `Resume` row is created or reused depending on the service logic.

### 3. Queue Resume Analysis
- **URL**: `/api/analyze/:id`
- **Method**: `POST`
- **Auth**: Required
- **Parameters**: Resume ID in the path.
- **Workflow**:
  - Verifies the authenticated user owns the resume.
  - Adds an analysis job to the BullMQ queue.
  - Returns `202 Accepted` while the worker processes the file.

### 4. Get Resume Analysis Result
- **URL**: `/api/analyze/:id`
- **Method**: `GET`
- **Auth**: Required
- **Parameters**: Resume ID in the path.
- **Workflow**:
  - Verifies ownership.
  - Reads from Redis cache first.
  - Falls back to PostgreSQL if the cache misses.
  - Returns the latest analysis state and structured result payload.

### 5. Clerk Webhooks
- **URL**: `/api/webhooks/clerk`
- **Method**: `POST`
- **Auth**: Signature verification via `svix-id`, `svix-timestamp`, and `svix-signature` headers.
- **Workflow**:
  - Validates the incoming webhook signature using the configured `CLERK_WEBHOOK_SECRET`.
  - Performs upsert operations (`user.created`, `user.updated`) or deletes records (`user.deleted`) in the database.

---

## Notes

- Uploaded files are stored under `backend/public/data/uploads/`.
- The uploads directory is intentionally kept in git with [backend/public/data/uploads/.gitkeep](backend/public/data/uploads/.gitkeep) so the folder exists after clone.
- Generated uploads are ignored by `.gitignore`.
- The frontend uses Clerk auth, so requests should only succeed after sign-in and token retrieval.
