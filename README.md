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
