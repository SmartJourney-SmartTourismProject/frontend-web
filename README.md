# SmartJourney Web (Next.js frontend)

The web app for **SmartJourney**, an AI trip planner for Sri Lanka. Live at **https://aismartjourney.vercel.app**.

It talks **only** to the NestJS API (`backend`, port 3001 locally), never to the AI backend directly. Sign-in goes through Keycloak via next-auth.

## Screens (`src/app/`)

| Route | Screen |
|---|---|
| `/` | Landing page |
| `/login`, `/signup`, `/reset-password` | Keycloak-backed sign-in, registration, password reset |
| `/home` | Chat planner with the itinerary card and the route map |
| `/saved-itineraries`, `/saved-itineraries/[id]` | Saved trips (upcoming/past) and trip detail |
| `/budget-tracker` | Budget stats, expenses, spend by category |
| `/explore`, `/explore/[section]` | Attractions, hotels and restaurants, events |
| `/admin` | Admin panel (Keycloak realm role `admin` only; enforced in `src/middleware.ts` and again by the API) |

Shared UI lives in `src/components/` (`shell/` = sidebar, chat, map; `admin/`, `budget/`, `explore/`, `landing/`, `settings/`). API calls are in `src/lib/api.ts`, and auth in `src/lib/auth.ts`.

## Run locally

The API, the AI backend and Keycloak must be running first. See the **Local Setup Guide** (`Documentation/User Manual/3_Local_Setup_Guide.pdf`).

```powershell
copy .env.example .env.local   # fill NEXTAUTH_SECRET and KEYCLOAK_CLIENT_SECRET
npm install
npm run dev                    # http://localhost:3000
```

`KEYCLOAK_CLIENT_SECRET` must equal `KEYCLOAK_WEB_CLIENT_SECRET` in `backend/.env`.

## Build and test

```powershell
npm run build       # production build (.next/)
npm run lint
npm test            # unit tests (vitest): 18 tests, 2026-10-03
npm run test:e2e    # Playwright journeys against the running local stack (reads .env.local)
npm run test:a11y   # Playwright + axe accessibility checks
```

## Deployment

Vercel project `aismartjourney`, deployed by the GitHub Actions workflow (`.github/workflows/ci.yml`) on pushes to **`new-main`**, after lint and tests pass. Settings: [`deploy/MANUAL_SETUP.md`](deploy/MANUAL_SETUP.md) and `vercel.json`.
