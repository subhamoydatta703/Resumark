# Resumark Frontend

The Resumark frontend is a React 19 single-page application built with TypeScript and Vite. It integrates Clerk authentication, uploads PDF resumes to the backend, polls asynchronous analysis state, and renders the resulting scores and recommendations.

## Technology

The client uses React 19, Vite 8, TypeScript, Tailwind CSS v3, PostCSS, Clerk React, Axios, and Lucide React. Production assets are compiled by Bun and served by an unprivileged Nginx Alpine image.

## Directory Structure

```text
frontend/src/
|-- assets/                         # Imported images and starter assets
|-- components/
|   |-- AnalysisDashboard.tsx       # Score, skill, experience, and insight tabs
|   |-- PageShell.tsx               # Shared header, footer, and theme controls
|   |-- PendingScanner.tsx          # Animated pending and processing display
|   `-- ResumeUploader.tsx          # Standalone uploader implementation
|-- pages/
|   |-- LandingPage.tsx             # Signed-out product and sign-in page
|   `-- UploadPage.tsx              # Signed-in upload, polling, and result workflow
|-- services/
|   `-- api.ts                      # Axios client, Clerk token injection, API adapters
|-- types/
|   `-- index.ts                    # Upload, resume, and analysis TypeScript types
|-- App.tsx                         # Authenticated view selection and theme state
|-- App.css                         # App-level stylesheet placeholder
|-- index.css                       # Tailwind layers, tokens, fonts, and animations
`-- main.tsx                        # ClerkProvider and React root entrypoint
```

`UploadPage.tsx` contains the uploader used by the signed-in application. `components/ResumeUploader.tsx` is a separate implementation and is not mounted by `App.tsx`.

## Environment Variables

Create `frontend/.env` for local development. These variables are embedded into browser assets by Vite at build time and are therefore public. They must not contain server secrets.

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL for the Express API. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public Clerk key passed to `ClerkProvider`. |

In Docker Compose the same `frontend/.env` file is mounted as a BuildKit secret during `docker compose build`. The Dockerfile reads it with `--mount=type=secret,id=frontend-env` so the values never appear in image layers.

## Scripts

Run commands from `frontend/`.

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies from `bun.lock`. |
| `bun run dev` | Start the Vite development server. |
| `bun run build` | Type-check the project and create production assets in `dist/`. |
| `bun run preview` | Serve the production build with Vite for local inspection. |
| `bun run lint` | Run ESLint across the frontend. |

## Application Flow

`main.tsx` validates the Clerk publishable key and mounts the application inside `ClerkProvider`. `App.tsx` renders `LandingPage` for signed-out visitors and `UploadPage` for authenticated users. The authenticated branch registers Clerk's `getToken` function with the API module so each protected request receives a bearer token.

The upload workflow validates a PDF locally, sends it as multipart form data, requests analysis for the returned resume identifier, and polls the result endpoint every two seconds. Polling stops after completion, failure, or 30 attempts. The UI transitions between idle, uploading, pending, completed, and failed states.

## Pages

### LandingPage

`LandingPage` is the signed-out entry point. It presents the application purpose, describes the analysis workflow, provides Clerk sign-in access, and uses `PageShell` for shared navigation and theme controls.

### UploadPage

`UploadPage` owns the authenticated workflow. It manages the selected file, upload progress, API errors, resume identifier, analysis polling, retry and reset behavior, and the transition from uploader to `PendingScanner` and `AnalysisDashboard`.

## Component Architecture

| Component | Responsibility |
| --- | --- |
| `PageShell` | Shared page frame, brand header, footer, account controls, and theme toggle. |
| `PendingScanner` | Displays terminal-style progress while the BullMQ job is pending or processing. |
| `AnalysisDashboard` | Renders overview, skills, experience, and insight tabs from the normalized analysis result. |
| `ResumeUploader` | Provides a reusable file-selection and upload card, though the active page currently uses its own local uploader. |

The API adapter in `services/api.ts` centralizes the Axios base URL, credential behavior, Clerk authorization header, upload request, analysis trigger, result lookup, and conversion from backend JSON into frontend types.

## Design System

The interface uses Plus Jakarta Sans for application text and JetBrains Mono for code-like labels and scanner output. Both fonts are loaded in `index.css` from Google Fonts.

The visual system is implemented with CSS custom properties and semantic utility classes:

| Token | Light | Dark |
| --- | --- | --- |
| `--bg-body` | `#fcfcfb` | `#0f0f0e` |
| `--bg-card` | `#ffffff` | `#171716` |
| `--bg-panel` | `#f5f5f4` | `#1e1e1d` |
| `--border-main` | `#e7e7e4` | `#292524` |
| `--border-subtle` | `#d0d0cc` | `#3a3533` |
| `--text-primary` | `#1c1917` | `#f5f5f4` |
| `--text-secondary` | `#57534e` | `#a8a29e` |
| `--text-muted` | `#87827e` | `#78716c` |
| `--accent-color` | `#b91c1c` | `#ef4444` |

The page background includes a subtle grid pattern, and reusable fade and scale animations support view transitions.

## Theme Behavior

At startup, `App.tsx` reads the `theme` value from `localStorage`. If no valid saved value exists, it uses `window.matchMedia('(prefers-color-scheme: dark)')` to select the initial theme. Theme changes toggle the `dark` class on the document root and persist the selected value to `localStorage`.

The application does not currently subscribe to later operating-system theme changes. Once a user toggles the theme, the stored selection remains authoritative.

## Build and Deployment

Create a local production build with:

```bash
bun run build
bun run preview
```

The Docker build uses the repository root as its context so the shared `.dockerignore` applies. The frontend Dockerfile reads `VITE_*` variables from a BuildKit secret rather than build arguments, which prevents them from appearing in image layers or `docker history` output. Build the image as follows:

```bash
docker build \
  -f frontend/Dockerfile \
  --secret id=frontend-env,src=frontend/.env \
  -t resumark-frontend:local \
  .
```

Run the image with:

```bash
docker run --rm -p 3000:8080 resumark-frontend:local
```

The builder stage installs dependencies and runs the Vite production build. The final image copies only `dist/` and the Nginx server configuration. It runs as an unprivileged user and listens on container port `8080`.

`nginx.conf` serves files from `/usr/share/nginx/html` and falls back to `index.html` for unknown paths, allowing client-side routes to load directly. The Dockerfile adjusts the configured listen port to `8080` so Nginx does not require root privileges.
