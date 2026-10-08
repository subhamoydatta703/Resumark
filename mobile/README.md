# Resumark Mobile

Resumark Mobile is the Expo/React Native client for the Resumark resume-audit API. It is the supported native mobile app; the website is maintained separately in ../frontend.

## What it does

- Uses Clerk native authentication and secure token storage.
- Lets a signed-in user select one PDF resume, up to 5 MB.
- Uploads the file to the authenticated backend and starts an asynchronous audit.
- Polls the audit endpoint every three seconds until it completes, fails, or times out after 30 checks.
- Shows an animated audit console while processing.
- Shows a mobile scorecard with overview, skills, experience, insights, education, suggested roles, and parsed contact details.
- Stores the manual light/dark choice in Expo Secure Store; without a saved choice it follows the device scheme.

## Requirements

- Bun
- Android Studio, Android SDK, Java 21, and an emulator or device
- A running Resumark backend, Redis, database, storage service, and audit worker
- A Clerk Native API configuration for Android

## Configure

Copy .env.example to .env, then provide the public build-time values below.

    EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

EXPO_PUBLIC_API_URL targets:

| Target | Value |
| --- | --- |
| Android emulator | http://10.0.2.2:5000 |
| Physical device | Reachable LAN API address |
| Release build | Deployed HTTPS API URL |

EXPO_PUBLIC values are embedded in the application. Do not put server secrets in .env. The Android app permits cleartext traffic for local development only; use HTTPS in release builds.

## Run

From the mobile directory:

    bun install
    bun run android:dev

android:dev runs Expo Android with the Java and Android SDK paths in scripts/run-android-dev.cjs. Update that helper if those locations differ on your machine.

| Command | Purpose |
| --- | --- |
| bun run start | Start Expo development tooling. |
| bun run android | Build and install Android using the current environment. |
| bun run android:dev | Android development build with configured SDK paths. |
| bun run ios | Build and run iOS on macOS. |
| bun run web | Start the Expo web target. |
| bun run typecheck | Run TypeScript checks. |
| bun run lint | Run Expo linting. |

The current AuthView implementation uses Clerk native UI, so Expo Go is not sufficient; use a native development build.

## Clerk setup

1. Enable Clerk Native API support.
2. Register Android package com.resumark.app.
3. Register the development build's debug SHA-256 fingerprint.

The app sends the Clerk bearer token to the existing backend. Do not add Clerk secret keys to mobile/.env.

## Project layout

    src/app/_layout.tsx              Clerk and theme providers
    src/app/index.tsx                Welcome, auth modal, signed-in switch
    src/components/resumark-theme.tsx Stored preference and semantic colors
    src/components/resume-app.tsx    Upload, polling, processing, results
    src/components/audit-ui.tsx      Shared labels, cards, and buttons
    src/lib/api.ts                   Authenticated API calls and result normalization

The API adapter accepts atsCompatibility and legacy atsScore, and normalizes skills, experience, education, insights, and contact data before rendering.

## Verify before release

1. Run bun run typecheck and bun run lint.
2. Verify sign in, sign out, and session restoration.
3. Test a valid PDF, invalid type, oversized file, timeout, backend failure, and retry.
4. Check processing and completed results in light and dark mode.
5. Set a deployed HTTPS API URL, final assets, version metadata, signing, and EAS Build or Android Studio release configuration.

The package ID is com.resumark.app. Change it before the first Play Store release if it is not an identifier you own.
