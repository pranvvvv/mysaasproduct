# mygymsoftware

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

## Notes About Schema Validation

The schema validator (`scripts/validate-schema.js`) performs fast CI-safe checks:

1. Ensures `lib/supabase/schema.sql` exists and is not empty
2. Verifies `uuid-ossp` extension is present
3. Verifies tables are declared
4. Verifies each declared table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

This guard helps catch accidental schema drift and missing RLS before deploy.
