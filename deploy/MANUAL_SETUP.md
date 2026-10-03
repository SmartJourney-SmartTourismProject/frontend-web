# Frontend: manual production setup (Vercel)

This repo's part of the SmartJourney production deployment. The **full step-by-step guide** (AWS, EC2 server, Keycloak, data load, backups, decommission) lives in the backend repo:
**[`backend/deploy/MANUAL_SETUP.md`](https://github.com/SmartJourney-SmartTourismProject/backend/blob/main/deploy/MANUAL_SETUP.md)**. This page covers everything specific to the Next.js app on Vercel.

## How it's deployed

| | |
|---|---|
| Where | **Vercel Hobby** (free), production URL `https://<project>.vercel.app` |
| Server functions region | **Mumbai (`bom1`)**, next to Keycloak and the API on the EC2 server |
| Talks to | `https://api.<IP_DASHED>.sslip.io` (NestJS) from the **browser**, and `https://auth.<IP_DASHED>.sslip.io` (Keycloak) from the browser and from next-auth on Vercel |
| Production deploys | **Only through this repo's GitHub Actions pipeline** (pushes to `new-main`, the default branch), after lint and tests pass |
| Preview deploys | Vercel builds one per pull request automatically. They **can't sign in**, because Keycloak only allows the production URL. That's deliberate: no `*.vercel.app` wildcard. |

## Pipeline (`.github/workflows/ci.yml`)

On every **push to `new-main`** (this repo's default branch):
1. `test`: `npm run lint` and `npm test` (also runs on pull requests).
2. `deploy`: `vercel pull --environment=production` → `vercel build --prod` → `vercel deploy --prebuilt --prod`.

`vercel.json` turns off Vercel's own automatic production deploys from `new-main`, so an untested commit never reaches production. Until the three `VERCEL_*` secrets exist the deploy job skips with a notice, so **don't push before adding them** unless you're fine with the live site not updating. It also pins functions to `bom1`.

## Manual steps for this repo

### 1. Create the Vercel project (do this first, since the backend needs the URL)
1. <https://vercel.com> → sign in with GitHub → **Add New → Project → Import** `frontend-web`. If it isn't listed, use **Adjust GitHub App Permissions** to give Vercel access to the repo.
2. **Project Name.** Yours is created already; the production URL is **`https://aismartjourney.vercel.app`**. This exact URL goes into the server `.env` as `FRONTEND_URL`.
3. Framework: **Next.js** (auto). Root directory: repo root. Build settings: defaults.

### 2. Project settings
**Project → Settings:**

1. **Git → Production Branch:** `new-main` (already the case).
2. **Functions → Function Region:** **Mumbai, India (bom1)**. `vercel.json` also sets this; make sure the dashboard agrees.
3. **Environment Variables:** add these with the **Production** environment ticked:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.<IP_DASHED>.sslip.io` |
| `NEXTAUTH_URL` | `https://aismartjourney.vercel.app` (exactly the production URL, no trailing slash) |
| `NEXTAUTH_SECRET` | A new random value: `openssl rand -base64 32` |
| `KEYCLOAK_ISSUER` | `https://auth.<IP_DASHED>.sslip.io/realms/smartjourney` |
| `NEXT_PUBLIC_KEYCLOAK_ISSUER` | Same as `KEYCLOAK_ISSUER` |
| `KEYCLOAK_CLIENT_ID` | `smartjourney-web` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `smartjourney-web` |
| `KEYCLOAK_CLIENT_SECRET` | **The same value** as `KEYCLOAK_WEB_CLIENT_SECRET` in the server's `/opt/smartjourney/.env` |

`NEXT_PUBLIC_*` values are **baked in at build time**. After changing one, redeploy: re-run the latest `new-main` workflow (Actions → Run workflow), or push a commit.

### 3. Values the CD pipeline needs (GitHub secrets)
1. Vercel → avatar → **Account Settings → Tokens → Create Token** (scope: the team or account that owns the project; set an expiry after your evaluation date).
2. Locally, in this repo: `npx vercel link`, choose the project, then open `.vercel/repo.json` (older CLI versions wrote `.vercel/project.json`) and copy `orgId` (starts with `team_`) and the project `id` (starts with `prj_`). `.vercel/` is gitignored; never commit it.
3. GitHub **org → Settings → Secrets and variables → Actions**: add these, with access to `frontend-web`:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | The token from step 1 |
| `VERCEL_ORG_ID` | `orgId` |
| `VERCEL_PROJECT_ID` | `projectId` |

### 4. Things that must match on the other side
A login loop or CORS error is almost always one of these not matching:

| This frontend value | Must match |
|---|---|
| Production URL (`NEXTAUTH_URL`) | Server `.env` `FRONTEND_URL` (NestJS CORS and Keycloak redirect URIs/web origins) |
| `KEYCLOAK_CLIENT_SECRET` | Server `.env` `KEYCLOAK_WEB_CLIENT_SECRET` |
| `KEYCLOAK_ISSUER` | Server `.env` `KEYCLOAK_ISSUER` (same `https://auth…/realms/smartjourney`) |
| `NEXT_PUBLIC_API_URL` | The API hostname Caddy serves (`api.<IP_DASHED>.sslip.io`) |

If you rename the Vercel project or add a custom domain later, update `FRONTEND_URL` on the server, restart `backend` and `keycloak`, and in the Keycloak admin console add the new URL to **Clients → smartjourney-web → Valid redirect URIs / Web origins**.

## Day-to-day

| Task | How |
|---|---|
| Deploy a change | Merge to `new-main`. CI lints, tests and deploys. |
| Roll back | Vercel → **Deployments** → pick an earlier production deployment → **⋯ → Promote to Production** (instant, no rebuild) |
| See server-side logs | Vercel → **Logs** (next-auth/token-refresh errors appear here) |
| Check what's live | Vercel → **Deployments**: the one labelled *Production* shows its commit SHA |

## Troubleshooting

- **Sign-in bounces back to the login page or shows "Configuration" error:** check `NEXTAUTH_URL` (exact production URL), `NEXTAUTH_SECRET` (set), `KEYCLOAK_CLIENT_SECRET` (matches the server), and that the URL is in Keycloak's Valid redirect URIs.
- **The app loads but every API call fails (CORS / network error):** `NEXT_PUBLIC_API_URL` is wrong or was changed without a rebuild, or the server's `FRONTEND_URL` doesn't match the production URL.
- **Deploy job fails with "No existing credentials":** `VERCEL_TOKEN` has expired or lacks access to the project. Create a new token and update the secret.
- **Old favicon or logo still showing:** browser cache. Hard refresh with Ctrl+Shift+R.
