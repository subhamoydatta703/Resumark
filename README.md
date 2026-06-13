# Resume Analyzer

An application to upload, parse, and analyze resumes. The project is split into a robust backend API and a modern, responsive frontend web application.

---

## Repository Structure

```
resume_analyzer/
├── backend/          # Express API server powered by Bun & TypeScript
│   ├── prisma/       # Prisma ORM schema and database migrations
│   ├── src/          # Application source code
│   │   ├── config/       # Configurations (DB, database adapters, etc.)
│   │   ├── controllers/  # Request handlers (resume upload handlers)
│   │   ├── middleware/   # Custom Express middlewares (Multer setup)
│   │   ├── routes/       # API route definitions (upload routes)
│   │   ├── services/     # Business logic & database interaction services
│   │   ├── app.ts        # Express application setup and routing
│   │   └── server.ts     # Server entry point
│   ├── package.json  # Bun dependencies, Prisma scripts, and setup configurations
│   └── tsconfig.json # TypeScript configuration
└── frontend/         # React + TypeScript + Vite web application
    ├── src/
    │   ├── components/  # Reusable UI elements (ResumeUploader drag & drop)
    │   ├── pages/       # Page components (UploadPage layout & states)
    │   ├── services/    # Axios API client integrations (Axios configuration)
    │   ├── types/       # TypeScript definition files
    │   ├── App.tsx      # Main application router/view mount
    │   └── main.tsx     # Application mounting point
    ├── package.json     # Node script configuration
    └── tailwind.config.js # Tailwind CSS configuration
```

---

## Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh/)
- **Backend Framework**: [Express](https://expressjs.com/) with TypeScript
- **Database ORM**: [Prisma](https://www.prisma.io/) (configured for PostgreSQL with `@prisma/adapter-pg` pool)
- **File Upload**: [Multer](https://github.com/expressjs/multer)

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/) with TypeScript
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### Prerequisites

- **Bun** (v1.x or higher) installed on your local machine.
- **PostgreSQL** database instance.

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
   PORT=5000
   ```

4. **Run database migrations**:
   Apply the Prisma schema to your PostgreSQL database:
   ```bash
   bun run db:push
   ```

5. **Start the application**:
   - Running the development server (auto-reloading):
     ```bash
     bun run dev
     ```
   - Production execution:
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

### 1. Health Status
- **URL**: `GET /health`
- **Response**: Returns health parameters and database adapter connection status.

### 2. Upload Resume
- **URL**: `POST /api/resume/upload`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: File field `resume` (accepts `.pdf` only)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Resume uploaded successfully",
    "fileData": {
      "resume": {
        "id": "cuid-string",
        "fileName": "uploaded-filename",
        "status": "PENDING",
        "createdAt": "2026-06-13T14:49:19.000Z",
        "updatedAt": "2026-06-13T14:49:19.000Z"
      }
    }
  }
  ```
