# Resumark

A high-performance, asynchronous resume analysis and evaluation platform. The project is built with **Bun**, **Express 5**, **Prisma (PostgreSQL)**, **Redis (BullMQ & Caching)**, **AWS S3 Cloud Storage**, **Clerk Authentication**, and **React 19 + Vite**.

Users upload PDF resumes, which are parsed and enqueued for asynchronous processing. A background worker evaluates the resumes against a structured JSON schema using the **Google Gemini API**, providing overall scoring, ATS evaluation, suggested roles, strengths, areas of improvement, and contact details in a premium, responsive dark-themed dashboard.

---

## Key Features

- **Clerk Authentication & Sync**: Seamless authentication flow on the frontend. The backend synchronizes user profile events (upsert/delete) asynchronously via **Clerk Webhooks** validated with secure **Svix** signatures.
- **Asynchronous Analysis Pipeline**: Resume uploads are fast and responsive; actual processing runs in a background thread managed via a **BullMQ** task queue and a Redis broker.
- **Cloud-Native Storage**: Leverages **AWS S3** to store resume PDFs securely and durably, removing the need for stateful volumes on the API or worker containers.
- **AI-Driven Evaluation**: Powered by the **Google Gemini API** (`@google/genai` SDK) to parse raw text and return structured JSON reports mapping score analytics and qualitative recommendations.
- **Redis Rate Limiting**: Protects backend endpoints (such as resume uploads and AI analysis triggers) from abuse using a Redis-backed rate limiter, resolving by Clerk `userId` (or client IP address as a fallback).
- **Cache-First Results**: Completed analyses are cached inside **Redis** for fast fetching.
- **Responsive Workspace Dashboard**: High-fidelity dashboard designed using **Tailwind CSS v3** featuring theme toggling (Light/Dark), upload progress bars, and tabbed score cards.
- **Universal Containerization**: Fully dockerized environment with multi-stage builds and a unified `docker-compose.yml` config.

---

## System Architecture

The following diagram illustrates how the system's frontend, API layer, background task worker, state layers, and external auth/AI services interact:

```mermaid
flowchart TB
    subgraph Frontend["React Frontend (Client Space)"]
        App["React App (Clerk Shell)"]
        UploadUI["Resume Uploader & Live Scanner"]
        DashboardUI["Analysis Dashboard"]
        ClientAPI["Axios API Client"]

        App --> UploadUI
        UploadUI --> DashboardUI
        UploadUI --> ClientAPI
    end

    subgraph APIServer["Express API Gateway"]
        API_GW["Express API Server"]
        AuthMid["Clerk Authentication Middleware"]
        UploadCtrl["Upload Resume Controller"]
        AnalyzeCtrl["Analyze Resume Controller"]
        ResultCtrl["Result Retriever Controller"]
        WebhookCtrl["Clerk Webhook Handler"]

        API_GW --> AuthMid
        AuthMid --> UploadCtrl
        AuthMid --> AnalyzeCtrl
        AuthMid --> ResultCtrl
        API_GW --> WebhookCtrl
    end

    subgraph QueueBroker["Task Queue (BullMQ Broker)"]
        RedisQueue[("Redis Broker: BullMQ Tasks")]
    end

    subgraph QueueWorker["Background Worker Service"]
        Worker["BullMQ Task Worker"]
        Parser["PDF Parse Engine (Buffer)"]
        GeminiService["Gemini API Service"]
        
        Worker --> Parser
        Worker --> GeminiService
    end

    subgraph CloudStorage["Cloud Storage (Object Store)"]
        S3Bucket[("AWS S3 Bucket: PDF Resumes")]
    end

    subgraph Database["Database & Caching (State Store)"]
        Postgres[("PostgreSQL Database (Prisma ORM)")]
        RedisCache[("Redis cache (Key-Value Store)")]
    end

    subgraph External["Third-Party Cloud Services"]
        ClerkAuth["Clerk Authentication Server"]
        GeminiAPI["Google Gemini AI Platform"]
    end

    %% Connections
    ClientAPI -->|"HTTP Requests + JWT"| API_GW
    ClerkAuth -->|"User Sync Webhooks"| WebhookCtrl
    
    %% Storage & DB connections
    UploadCtrl -->|"Upload PDF Buffer"| S3Bucket
    UploadCtrl -->|"Create PENDING record"| Postgres
    
    %% Queue interactions
    AnalyzeCtrl -->|"Enqueue Job (fileID)"| RedisQueue
    RedisQueue -->|"Poll & process jobs"| Worker
    
    %% Worker interactions
    Worker -->|"Fetch PDF Buffer"| S3Bucket
    GeminiService -->|"Analyze parsed text"| GeminiAPI
    Worker -->|"Save parsed JSON & COMPLETE status"| Postgres
    Worker -->|"Invalidate user cache"| RedisCache
    
    %% Result queries
    ResultCtrl -->|"1. Read cache"| RedisCache
    ResultCtrl -->|"2. Read database fallback"| Postgres
```

---

## Repository Structure

```
resume_analyzer/
├── backend/               # Bun + Express API Server & Worker
│   ├── prisma/            # DB Schema and Migrations
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

    # AWS S3 Configuration
    AWS_REGION="ap-south-1"
    AWS_ACCESS_KEY_ID="your_aws_access_key"
    AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
    AWS_S3_BUCKET_NAME="your_s3_bucket_name"
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
   docker compose up --build -d
   ```
4. Access the applications:
   - **Frontend UI Client**: [http://localhost:3000](http://localhost:3000)
   - **API Server Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

> [!NOTE]
> In this configuration, both the backend server and worker container use AWS S3 for storage. Make sure to supply the AWS credentials inside your `./backend/.env` file.

---

## API Documentation Summary

| Route | Method | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Public | Diagnoses connection health for the API and Database. |
| `/api/resume/upload` | `POST` | Bearer Token | Accepts PDF file uploads via form data. Rate-limited via Redis. Stores record as `PENDING`. |
| `/api/analyze/:id` | `POST` | Bearer Token | Queues the resume ID for async processing. Rate-limited via Redis. Returns `202 Accepted`. |
| `/api/analyze/:id` | `GET` | Bearer Token | Retrieves processing status or the finished JSON analysis payload. |
| `/api/webhooks/clerk` | `POST` | Svix Signature | Handles Clerk user lifecycle updates to create or delete sync users. |

---

## Notes & Exclusions

- **PDF Storage on AWS S3**: Uploaded files are uploaded directly to AWS S3 without writing staging files to local disk.
- **Re-upload Cleanup**: If a user uploads a duplicate resume (same name and owner), the API deletes the previous version of the file from the AWS S3 bucket using `deleteFile()` to free space, updates the DB record with the new S3 key, resets the parsing state (`status: "PENDING"`), and resets the analysis field (`analysisResult: Prisma.DbNull`) to prevent displaying stale results.
- **Cache Invalidation**: Analysis results are cached in Redis. When database updates occur or fresh analyses are completed, the corresponding entries are overwritten.
