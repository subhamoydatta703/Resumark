# Resume Analyzer

A high-performance, artificial intelligence-powered system designed to process, parse, and analyze professional resumes. The application is divided into a robust, cache-efficient backend API and a responsive React frontend web application.

### Key Features
- **Asynchronous Task Queue**: Utilizes BullMQ backed by Redis to handle PDF parsing and heavy AI operations asynchronously in a separate background worker process.
- **AI-Driven Evaluation**: Leverages the Google Gemini API to extract candidate information, categorize technical competencies, highlight professional strengths, recommend constructive improvements, score ATS compatibility, and suggest relevant job roles.
- **Multi-Tier Caching**: Utilizes an in-memory Redis cache for high-speed retrieval of completed analysis results and implements a duplicate-check workflow utilizing original file names to bypass redundant database inserts and computationally expensive AI API calls.
- **Modern User Experience**: Provides a clean, dark-themed drag-and-drop upload interface, a real-time parser progress tracking monitor with polling fallback, and interactive analytics dashboards.

---

### System Architecture

```mermaid
graph TD
    %% Frontend Components
    subgraph Frontend ["React Frontend"]
        UI["Upload UI / Dashboard"]
        API_Client["Axios API Client"]
        UI -->|"Upload Action"| API_Client
    end

    %% Backend Components
    subgraph Backend ["Express Backend Server & Worker"]
        Multer["Multer Middleware"]
        Router["Express Router"]
        Upload_Ctrl["uploadResumeController"]
        Analyze_Ctrl["analyzeResumeController"]
        Get_Ctrl["getResumeResultController"]
        PDF_Parser["PDF Parser Utils"]
        Gemini["Gemini AI Service"]
        Worker["BullMQ Worker (workerService.ts)"]
        
        Multer -->|"Saves PDF to public/data/uploads"| Upload_Ctrl
        Router -->|"POST /api/resume/upload"| Multer
        Router -->|"POST /api/analyze/:id"| Analyze_Ctrl
        Router -->|"GET /api/analyze/:id/analyze"| Get_Ctrl
    end

    %% Database & External Services
    subgraph Database_Layer ["Data Layer (Postgres & Redis)"]
        Prisma["Prisma Client"]
        DB[("PostgreSQL Database")]
        RedisQueue[("Redis: BullMQ Queue")]
        RedisCache[("Redis: Cache Client")]
        Prisma -->|"Queries/Updates"| DB
    end

    subgraph External ["External Services"]
        GoogleGemini["Google Gemini API"]
    end

    %% Connections
    API_Client -->|"POST /api/resume/upload"| Router
    API_Client -->|"POST /api/analyze/:id"| Router
    API_Client -->|"GET /api/analyze/:id/analyze"| Router

    Upload_Ctrl -->|"1. Check Duplicate originalName, 2. Create PENDING Resume"| Prisma
    
    %% Analysis flow (BullMQ Queue)
    Analyze_Ctrl -->|"1. Pushes job to queue"| RedisQueue
    Analyze_Ctrl -->|"2. Returns 202 (Analysis started)"| API_Client
    
    %% Worker processing flow
    RedisQueue -->|"3. Pulls job"| Worker
    Worker -->|"4. Sets status to PROCESSING"| Prisma
    Worker -->|"5. Extracts text"| PDF_Parser
    Worker -->|"6. Calls Gemini"| Gemini
    Gemini -->|"7. Generates structured JSON"| GoogleGemini
    Worker -->|"8. Saves results & sets COMPLETED"| Prisma
    Worker -->|"9. Invalidates cache key"| RedisCache

    %% Get analysis result caching flow
    Get_Ctrl -->|"1. Check Cache"| RedisCache
    RedisCache -->|"Cache Hit - Return Data"| Get_Ctrl
    RedisCache -->|"Cache Miss - Fetch Resume"| Prisma
    Prisma -->|"Save to Cache 300s (Only COMPLETED/FAILED)"| RedisCache
```

---

## Repository Structure

```
resume_analyzer/
├── backend/          # Express API server powered by Bun and TypeScript
│   ├── prisma/       # Prisma ORM schema, migrations, and database configurations
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── public/       # Static public files
│   │   └── data/
│   │       └── uploads/ # Uploaded resumes (Git-ignored)
│   ├── src/          # Application source code
│   │   ├── config/       # Configuration files (DB connection, Redis clients setup)
│   │   │   ├── db.ts
│   │   │   ├── redis.bullmq.ts  # Redis connection configuration for BullMQ
│   │   │   └── redis.caching.ts # Redis client and connection setup for Caching
│   │   ├── controllers/  # Request handlers
│   │   │   ├── analyzeResumeController.ts
│   │   │   ├── getResumeResultController.ts
│   │   │   └── uploadResumeController.ts
│   │   ├── middleware/   # Custom Express middlewares (Multer setup)
│   │   │   └── multerMiddleware.ts
│   │   ├── queues/       # BullMQ queue configurations
│   │   │   └── resume.queue.ts
│   │   ├── routes/       # API route definitions
│   │   │   ├── multerRoutes.ts
│   │   │   └── resumeAnalysisRoutes.ts
│   │   ├── services/     # Business logic, database operations, and background worker
│   │   │   ├── geminiService.ts
│   │   │   ├── getResumeService.ts
│   │   │   ├── resumeAnalysisService.ts
│   │   │   ├── uploadResumeService.ts
│   │   │   └── workerService.ts # Background job handler (BullMQ Worker)
│   │   ├── utils/        # Utility helpers (PDF parser setup)
│   │   │   └── pdfParser.ts
│   │   ├── app.ts        # Express application configuration and routing
│   │   └── server.ts     # Server entry point, database, and caching connection setup
│   ├── package.json  # Bun dependencies, Prisma scripts, and project configurations
│   └── tsconfig.json # TypeScript configuration
└── frontend/         # React + TypeScript + Vite web application
    ├── src/
    │   ├── assets/      # Graphical assets and static resources
    │   ├── components/  # Reusable UI components
    │   │   ├── AnalysisDashboard.tsx  # Scoring and structured analysis views
    │   │   ├── PendingScanner.tsx     # Progress indicator showing parser stages
    │   │   └── ResumeUploader.tsx     # Drag and drop upload area with progress bar
    │   ├── pages/       # Page layout components
    │   │   └── UploadPage.tsx         # Main entry point for theme handling and upload flows
    │   ├── services/    # API integration services
    │   │   └── api.ts                 # Axios HTTP client, API mappings, and polling flow
    │   ├── types/       # TypeScript type definitions
    │   │   └── index.ts               # Shared types, state models, and API responses
    │   ├── App.css      # CSS baseline styles
    │   ├── App.tsx      # Main application view mount
    │   ├── index.css    # Tailwind CSS layout utility directives
    │   └── main.tsx     # Web entry point and React root mounting
    ├── package.json     # Node scripts and React dependencies
    └── tailwind.config.js # Tailwind CSS configuration
```

---

## Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Express with TypeScript
- **Database ORM**: Prisma (configured for PostgreSQL with `@prisma/adapter-pg` connection pooling)
- **Task Queue**: BullMQ
- **File Upload**: Multer
- **In-Memory Cache & Message Broker**: Redis (caching resume lookup results and powering BullMQ queues)
- **AI Integration**: Google GenAI SDK (`@google/genai`)

### Frontend
- **Framework**: React + Vite with TypeScript
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- **Bun** (v1.x or higher) installed locally.
- **PostgreSQL** database instance.
- **Redis** server running locally (default port 6379).

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
   Create a `.env` file in the `backend` directory and add your database connection string and server port:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=5000
   ```

4. **Run database migrations**:
   Apply the Prisma schema to your PostgreSQL database:
   ```bash
   bun run db:push
   ```

5. **Start the application**:
   - Running the development API server (auto-reloading):
     ```bash
     bun run dev
     ```
   - **Start the background worker** (in a separate terminal window):
     ```bash
     bun run src/services/workerService.ts
     ```
   - Production execution (API server):
     ```bash
     bun run start
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

3. **Configure environment variables (optional)**:
   Create a `.env` file in the `frontend` directory to target a custom API endpoint (defaults to `http://localhost:5000`):
   ```env
   VITE_API_URL="http://localhost:5000"
   ```

4. **Start the application**:
   - Start the local development server:
     ```bash
     bun run dev
     ```
   - Build for production:
     ```bash
     bun run build
     ```

---

## API Endpoints

### 1. Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Inspects system health parameters, specifically verifying the Express server status and database connectivity. It returns a status message indicating overall system health and database adapter connection details.

### 2. Upload Resume
- **URL**: `/api/resume/upload`
- **Method**: `POST`
- **Content Type**: `multipart/form-data`
- **Payload**: Includes a PDF document attached via the `resume` form parameter.
- **Workflow**:
  - The server checks if a resume with the same original filename already exists in the database.
  - If a match is found, the server fetches and returns the existing database record directly.
  - If the resume is new, it generates a unique database ID, saves the PDF file under a randomized identifier, initializes its status as pending, and returns the newly registered resume record.

### 3. Queue Resume Analysis
- **URL**: `/api/analyze/:id`
- **Method**: `POST`
- **Parameters**: Requires the unique `id` of the resume in the URL path.
- **Workflow**:
  - Pushes an asynchronous parsing and evaluation task onto the `"resume-analysis"` BullMQ queue.
  - Returns a `202 (Analysis started)` status response immediately to prevent timeout on heavy loads.
  - The background worker pulls the job, extracts PDF text, analyzes it with the Gemini AI service, stores the result in Postgres, and invalidates any existing cache keys.

### 4. Get Resume Analysis Result
- **URL**: `/api/analyze/:id/analyze`
- **Method**: `GET`
- **Parameters**: Requires the unique `id` of the resume in the URL path.
- **Workflow**:
  - Checks if the resume is cached in Redis:
    - On a **Cache Hit**, it parses the cached data and returns it immediately.
    - On a **Cache Miss**, it queries PostgreSQL for the resume status and `analysisResult`.
  - If the database status is `COMPLETED` or `FAILED`, it caches the result in Redis for 300 seconds to accelerate subsequent lookups.
  - If the status is `PENDING` or `PROCESSING`, it returns the status directly without caching to ensure the client gets fresh updates during polling.
