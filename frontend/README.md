# Frontend

React + Vite frontend for the Resume Analyzer app. It provides the Clerk sign-in flow, a responsive upload experience, live pending analysis states, and the final dashboard for viewing scores and parsed resume details.

## What It Does

- Shows an unauthenticated landing page with sign-in.
- Handles Clerk sign-in and user session state.
- Uploads PDF resumes to the backend with authenticated requests.
- Shows upload progress, pending scan steps, and analysis results.
- Supports light and dark themes with a shared shell layout.

---

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Auth UI**: Clerk React
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## Folder Structure

```
frontend/
|-- public/
|   |-- favicon.svg
|   `-- icons.svg
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- AnalysisDashboard.tsx
|   |   |-- PageShell.tsx
|   |   |-- PendingScanner.tsx
|   |   `-- ResumeUploader.tsx
|   |-- pages/
|   |   `-- UploadPage.tsx
|   |-- services/
|   |   `-- api.ts
|   |-- types/
|   |   `-- index.ts
|   |-- App.tsx
|   |-- index.css
|   `-- main.tsx
|-- package.json
|-- tailwind.config.js
|-- vite.config.ts
`-- tsconfig.json
```

---

## Main UI Flow

1. Users land on the Clerk-aware marketing page when signed out.
2. After signing in, the app switches to the upload workspace.
3. The uploader validates the selected file and posts it to the backend.
4. The pending scanner shows analysis progress while the worker processes the resume.
5. The dashboard renders the final analysis, scores, strengths, improvements, and experience details.

---

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:5000"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

- `VITE_API_URL` points the frontend to the backend API.
- `VITE_CLERK_PUBLISHABLE_KEY` is required for Clerk authentication.

---

## Scripts

```bash
bun install
bun run dev
bun run build
bun run lint
bun run preview
```

- `bun run dev` starts the local Vite dev server.
- `bun run build` creates the production build.
- `bun run lint` checks the frontend source with ESLint.
- `bun run preview` previews the production build locally.

---

## Component Overview

- `App.tsx`: Top-level auth routing and theme state.
- `PageShell.tsx`: Shared responsive shell for the app layout.
- `UploadPage.tsx`: Main authenticated workspace and state routing.
- `ResumeUploader.tsx`: Drag-and-drop upload card with validation and progress.
- `PendingScanner.tsx`: Animated processing state while analysis runs.
- `AnalysisDashboard.tsx`: Final analysis view with scores, tabs, and resume details.
- `services/api.ts`: Axios client, auth token injection, upload/analyze polling, and parsing helpers.

---

## Notes

- Requests rely on the Clerk session token from `useAuth().getToken()`.
- If the backend returns `Unauthorized: Missing authentication credentials`, make sure the user is signed in and `VITE_CLERK_PUBLISHABLE_KEY` matches the Clerk app used by the backend.
- The UI is designed to be responsive on mobile and desktop without requiring any special setup.
