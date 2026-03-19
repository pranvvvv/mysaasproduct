# primegymsoftware

[![CI-CD](https://github.com/pranvvvv/mysaasproduct/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/pranvvvv/mysaasproduct/actions/workflows/ci-cd.yml)

Repository: `https://github.com/pranvvvv/mysaasproduct`

## CI/CD Overview

This project uses GitHub Actions (`.github/workflows/ci-cd.yml`) with 3 jobs:

1. `ci` on push/PR:
- Installs dependencies with `npm ci`
- Validates database schema with `npm run check:schema`
- Typechecks with `npm run typecheck`
- Builds the app with `npm run build`

2. `deploy-staging` on `develop` pushes:
- Runs only if Vercel secrets are configured
- Deploys a Vercel preview build

3. `deploy-production` on `main` pushes:
- Runs only if Vercel secrets are configured
- Deploys a Vercel production build

## Required GitHub Secrets

Set these in `Settings -> Secrets and variables -> Actions`:

1. `VERCEL_TOKEN`
2. `VERCEL_ORG_ID`
3. `VERCEL_PROJECT_ID`
4. `NEXT_PUBLIC_SUPABASE_URL`
5. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Validation Commands

Run these before pushing:

```bash
npm run check:schema
npm run typecheck
npm run build
```

## Google Login / Signup Setup

To enable Google authentication and store user data in Supabase:

1. In Supabase Dashboard, go to `Authentication -> Providers -> Google` and enable Google.
2. In Google Cloud Console, create OAuth credentials and add this redirect URI:
	- `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase Dashboard, set your app site URL and redirect URLs:
	- Site URL: `http://localhost:3000` (local) and your production URL
	- Redirect URL: `http://localhost:3000/auth/callback`
4. Ensure env vars are present in `.env.local` and deployment envs:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Run the SQL in `lib/supabase/schema.sql` so triggers/RPCs exist:
	- `handle_new_user` creates a profile row on first auth
	- `complete_gym_onboarding` creates gym data for gym-owner signup

After setup, Google login/signup from `app/login/page.tsx` will authenticate users and persist profile/onboarding data in Supabase.

## Notes About Schema Validation

The schema validator (`scripts/validate-schema.js`) performs fast CI-safe checks:

1. Ensures `lib/supabase/schema.sql` exists and is not empty
2. Verifies `uuid-ossp` extension is present
3. Verifies tables are declared
4. Verifies each declared table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

This guard helps catch accidental schema drift and missing RLS before deploy.
