# parksplash

## Vercel Projects

Deploy this monorepo as two separate Vercel projects:

- `parksplash`
  - Root Directory: `apps/web`
  - Framework: Vite
- `parksplash-api`
  - Root Directory: `apps/cms`
  - Framework: Next.js

Both apps use `pnpm` workspaces from the repo root. App-local `vercel.json` files define the correct install and build commands for each project.

## Local Development

Treat this as one monorepo with two separate app environments:

- Frontend app: `apps/web`
- API/CMS app: `apps/cms`
- Shared package: `packages/shared`

Use app-local env files as the source of truth:

- Frontend env: `apps/web/.env.local`
- API env: `apps/cms/.env.local`

Do not use the repo-root `.env.local` for app configuration. Root is only workspace orchestration.

Use the checked-in examples when setting up or rotating local config:

- `apps/web/.env.example`
- `apps/cms/.env.example`

Open the repo with `parksplash.code-workspace` if you want the split folders surfaced cleanly in VS Code.

Recommended local commands:

- `pnpm dev`
  - Runs frontend and API together from the workspace root.
- `pnpm dev:web`
  - Runs only the frontend.
- `pnpm dev:cms`
  - Runs only the API/CMS.
- `pnpm run verify`
  - Runs the normal typecheck and build verification pass.

## Required Environment

Frontend project:

- `VITE_CMS_URL`
  - Example: `https://parksplash-api.your-domain.com`

API project:

- `DATABASE_URI`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
  - Example: `https://parksplash-api.your-domain.com`
- `NEXT_PUBLIC_WEB_URL`
  - Example: `https://parksplash.your-domain.com`

Optional API project env:

- `CORS_ALLOWED_ORIGINS`
  - Comma-separated extra origins for previews or alternate frontends.
  - Wildcard host patterns are supported, for example `https://*.embetterus-projects.vercel.app`.
- `NEXT_PUBLIC_ASSET_BASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_LOVE_OFFERING_5_PRICE_ID`
- `STRIPE_LOVE_OFFERING_10_PRICE_ID`
- `STRIPE_LOVE_OFFERING_25_PRICE_ID`
- `STRIPE_LOVE_OFFERING_50_PRICE_ID`
- `STRIPE_LOVE_OFFERING_CUSTOM_PRICE_ID`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
