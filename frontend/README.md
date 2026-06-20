# Resume Analyzer - Frontend

The frontend of the **Resume Analyzer** application is built with **React 19**, **TypeScript**, and **Vite**. It provides a sleek, responsive workspace for uploading PDF resumes, monitoring the analysis pipeline status, and viewing AI-driven insights on a premium dark-themed dashboard.

---

## Key Features

- **User Authentication**: Secured with **Clerk React** for user login, sign-up, and session state.
- **Dynamic File Uploader**: Features an interactive drag-and-drop file uploader with immediate size validation, file-type constraints, and upload progress tracking.
- **Live Scanner Animation**: Displays real-time status steps (`Uploading`, `Processing`, `Completed`, `Failed`) using a poll-based mechanism that queries the backend queue.
- **Rich Dashboard Insights**: Displays structured assessment categories (e.g., overall score, ATS score, suggested roles, strengths, improvements) in a high-fidelity tabbed interface.
- **Responsive Layout**: Designed from the ground up using **Tailwind CSS v3** to ensure fluid scalability from mobile layouts to ultra-wide desktop monitors.
- **Dual-Theme Support**: Includes toggle capability for Light and Dark themes, persists choices via `localStorage`, and updates the root system class list.

---

## Tech Stack

- **Framework**: React 19 (Functional Components & Hooks)
- **Bundler / Dev Server**: Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 & PostCSS
- **Authentication**: `@clerk/clerk-react`
- **HTTP Client**: Axios (configured with automated headers & base paths)
- **Icons**: Lucide React

---

## Project Structure

```
frontend/
├── public/
│   ├── favicon.svg          # Application favicon
│   └── icons.svg            # Custom SVG sprite / assets
├── src/
│   ├── assets/              # Static styling assets & images
│   ├── components/
│   │   ├── AnalysisDashboard.tsx  # Dynamic dashboard with tabs for scores & analysis
│   │   ├── PageShell.tsx          # Shared navigation and layout shell
│   │   ├── PendingScanner.tsx     # Custom animated processing states
│   │   └── ResumeUploader.tsx     # File selector card with progress states
│   ├── pages/
│   │   └── UploadPage.tsx         # Main container orchestrating app views
│   ├── services/
│   │   └── api.ts                 # Axios API configurations and background polling logic
│   ├── types/
│   │   └── index.ts               # Global TypeScript typings for schema and API payloads
│   ├── App.tsx                    # Root routing component and theme provider
│   ├── index.css                  # Core design tokens and custom CSS overrides
│   └── main.tsx                   # Render entrypoint
├── Dockerfile                 # Multi-stage production Docker build (Bun -> Nginx)
├── nginx.conf                 # Nginx custom configuration for Single Page App routing
├── package.json               # Package dependencies & scripts
├── tailwind.config.js         # Tailwind styling configs
├── vite.config.ts             # Vite server & bundler configuration
└── tsconfig.json              # TypeScript compilation rules
```

---

## Environment Configuration

To run the frontend app, create a `.env` file in the `frontend/` directory with the following variables:

```env
# URL of the backend Express API server
VITE_API_URL="http://localhost:5000"

# Publishable key from your Clerk dashboard
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

---

## Available Scripts

Use the following commands inside the `frontend/` directory to manage local development:

```bash
# Install package dependencies
bun install

# Start the Vite local development server (typically on http://localhost:5173)
bun run dev

# Compile TypeScript and build production assets into the `dist/` directory
bun run build

# Run ESLint checking on files
bun run lint

# Preview the built production assets locally
bun run preview
```

---

## Production & Docker Deployment

The frontend uses a multi-stage Docker build to build the code and serve it efficiently via Nginx.

### Building & Running Standalone with Docker

Because Vite packages environment variables at build-time, you must pass them as `--build-arg` options during the build process:

```bash
# Build the Docker image
docker build \
  --build-arg VITE_API_URL="http://localhost:5000" \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY="pk_test_..." \
  -t resume-analyzer-frontend .

# Run the container (exposing Nginx on port 3000)
docker run -d -p 3000:80 --name resume-frontend resume-analyzer-frontend
```

---

## Developer Guidelines

- **Authorization Tokens**: All api calls made via `services/api.ts` must obtain a Clerk JWT token. This is handled dynamically via `registerGetToken(getToken)` inside `App.tsx`.
- **Responsive Sizing**: Keep Tailwind grids and layouts flexible. Use classes like `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to avoid breaking layouts.
- **Routing**: This frontend is a single-page application. The included `nginx.conf` ensures that deep links fallback to `index.html` correctly.
