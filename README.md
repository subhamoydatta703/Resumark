# Resume Analyzer

A high-performance, asynchronous resume analysis and evaluation platform. The project is built with **Bun**, **Express 5**, **Prisma (PostgreSQL)**, **Redis (BullMQ & Caching)**, **Clerk Authentication**, and **React 19 + Vite**.

Users upload PDF resumes, which are parsed and enqueued for asynchronous processing. A background worker evaluates the resumes against a structured JSON schema using the **Google Gemini API**, providing overall scoring, ATS evaluation, suggested roles, strengths, areas of improvement, and contact details in a premium, responsive dark-themed dashboard.

---

## Key Features

- **Clerk Authentication & Sync**: Seamless authentication flow on the frontend. The backend synchronizes user profile events (upsert/delete) asynchronously via **Clerk Webhooks** validated with secure **Svix** signatures.
- **Asynchronous Analysis Pipeline**: Resume uploads are fast and responsive; actual processing runs in a background thread managed via a **BullMQ** task queue and a Redis broker.
- **AI-Driven Evaluation**: Powered by the **Google Gemini API** (`@google/genai` SDK) to parse raw text and return structured JSON reports mapping score analytics and qualitative recommendations.
- **Cache-First Results**: Completed analyses are cached inside **Redis** for fast fetching.
- **Responsive Workspace Dashboard**: High-fidelity dashboard designed using **Tailwind CSS v3** featuring theme toggling (Light/Dark), upload progress bars, and tabbed score cards.
- **Universal Containerization**: Fully dockerized environment with multi-stage builds and a unified `docker-compose.yml` config.

---

## System Architecture

The following diagram illustrates how the system's frontend, API layer, task worker, caches, databases, and external auth/AI services interact:

```mermaid
graph TD
    subgraph Frontend["React Frontend (Nginx Container)"]
        App["App / Clerk Auth Shell"]
        UploadPage["UploadPage (State Orchestrator)"]
        Uploader["ResumeUploader (Drag & Drop)"]
        Scanner["PendingScanner (Polling Status)"]
        Dashboard["AnalysisDashboard (Tabbed Insights)"]
        Api["Axios API Client"]

        App --> UploadPage
        UploadPage --> Uploader
        UploadPage --> Scanner
        UploadPage --> Dashboard
        UploadPage --> Api
    end

    subgraph Backend["Express API & Worker Services (Bun Containers)"]
        GlobalAuth["Global clerkMiddleware()"]
        Auth["authMiddleware (Extract User ID)"]
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
        WebhookVerifySvc["clerkWebhookVerificationService"]
        WebhookHandleSvc["handleClerkWebhookEvent"]
        
        Worker["workerService (BullMQ Worker)"]
        Parser["pdfParser.ts"]
        Gemini["geminiService.ts"]
    end

    subgraph Data["Data Storage Layer"]
        Prisma["Prisma Client"]
        Postgres[("PostgreSQL Database")]
        RedisQueue[("Redis: BullMQ Queue Broker")]
        RedisCache[("Redis: Result Cache")]
    end

    subgraph External["External APIs"]
        Clerk["Clerk Auth Service"]
        GeminiAPI["Google Gemini API"]
    end

    %% Flows
    Api -->|"Bearer JWT Token"| GlobalAuth
    GlobalAuth --> Auth
    Auth --> UploadRoute
    Auth --> AnalyzeRoute
    Auth --> ResultRoute
    Clerk -->|"User Event Webhooks (Svix Signed)"| WebhookRoute
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
├── backend/               # Bun + Express API Server & Worker
│   ├── prisma/            # DB Schema and Migrations
│   ├── public/uploads/    # Storage for uploaded PDFs (local testing)
│   ├── src/               # Backend Source files (config, controllers, services)
│   ├── Dockerfile         # Backend runtime container config
│   └── package.json       # Backend script definitions
├── frontend/              # React + Vite Client Application
│   ├── public/            # Assets and HTML templates
│   ├── src/               # React Codebase (components, pages, styles)
│   ├── Dockerfile         # Multi-stage production client build (Bun + Nginx)
│   ├── nginx.conf         # Nginx router configs for client
│   └── package.json       # Frontend scripts
├── docker-compose.yml     # Multi-service orchestration configuration
├── .gitignore             # Global git ignores
└── README.md              # Project documentation
```

---

## Getting Started

### Option A: Local Development Setup

To run the application locally outside of Docker, you will need **Bun 1.x**, a running **PostgreSQL** instance, and a **Redis** instance.

#### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install local dependencies:
   ```bash
   bun install
   ```
3. Configure environment variables. Create a `backend/.env` file:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/resume_db?sslmode=disable"
   WORKER_DATABASE_URL="postgresql://user:pass@localhost:5432/resume_db?sslmode=disable"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   GEMINI_API_KEY="your_google_gemini_api_key"
   FRONTEND_URL="http://localhost:5173,http://localhost:3000"
   CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_WEBHOOK_SECRET="whsec_..."
   PORT=5000
   ```
4. Generate the database client and apply the schema:
   ```bash
   bun run db:push
   ```
5. Start the backend API:
   ```bash
   bun run dev
   ```
6. In a new terminal tab, start the background worker:
   ```bash
   bun run src/services/workerService.ts
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create a `frontend/.env` file:
   ```env
   VITE_API_URL="http://localhost:5000"
   VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
   ```
4. Start the frontend client dev server:
   ```bash
   bun run dev
   ```

---

### Option B: Docker Compose Setup (Single Command)

You can run the entire ecosystem (Redis, PostgreSQL/External, API Server, Task Worker, and Frontend Client) using Docker Compose.

1. Ensure your backend environment variables are defined in `./backend/.env`. If you want to use the local Redis server container run by compose, make sure `REDIS_HOST` is set to `redis` and `REDIS_PORT` is set to `6379` inside `./backend/.env`.
2. Configure frontend variables in `./frontend/.env` (or let compose fall back to defaults).
3. Start all services:
   ```bash
   docker-compose up --build -d
   ```
4. Access the applications:
   - **Frontend UI Client**: [http://localhost:3000](http://localhost:3000)
   - **API Server Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

---

## API Documentation Summary

| Route | Method | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Public | Diagnoses connection health for the API and Database. |
| `/api/resume/upload` | `POST` | Bearer Token | Accepts PDF file uploads via form data. Stores record as `PENDING`. |
| `/api/analyze/:id` | `POST` | Bearer Token | Queues the resume ID for async processing. Returns `202 Accepted`. |
| `/api/analyze/:id` | `GET` | Bearer Token | Retrieves processing status or the finished JSON analysis payload. |
| `/api/webhooks/clerk` | `POST` | Svix Signature | Handles Clerk user lifecycle updates to create or delete sync users. |

---

## Notes & Exclusions

- **PDF Storage**: Uploaded files are saved to `backend/public/data/uploads/`. In local development environments, files are ignored from Git commits. The folder structure is preserved using an empty [backend/public/data/uploads/.gitkeep](backend/public/data/uploads/.gitkeep) file.
- **Cache Invalidation**: Analysis results are cached in Redis. When database updates occur or fresh analyses are completed, the corresponding entries are overwritten.
