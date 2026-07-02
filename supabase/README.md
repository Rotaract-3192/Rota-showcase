# Rotaract District 3192 — Backend Workspace
### Supabase & Architecture Workspace

## Project Overview
This repository contains the backend configuration, migrations, Edge Functions, and database policies for the Rotaract District 3192 Digital Ecosystem. Built around **Supabase (PostgreSQL)**, it serves as the foundation for the Public Showcase, Club Operations Portal, and District Administration tools.

## Folder Structure (Separation of Concerns)
```
supabase/
├── docs/       # Backend-specific architecture and design decisions
├── migrations/ # SQL schema mutations (table creation, indexing)
├── seed/       # Reference data and test datasets
├── policies/   # Row Level Security (RLS) SQL policies
├── storage/    # Supabase Bucket definitions and access rules
├── functions/  # Edge Functions (Webhooks, AI, Leaderboard)
├── types/      # Auto-generated TypeScript definitions
├── scripts/    # Developer utilities (deploy, backup, restore)
└── config/     # Environment, auth, and deployment configurations
```

## Backend Architecture
The backend heavily utilizes the Supabase stack:
* **Database:** PostgreSQL (Handles relational logic, JSONB, and PostGIS if needed).
* **Security:** Row-Level Security (RLS) policies enforce the RBAC matrix strictly at the DB layer.
* **Storage:** S3-compatible buckets with image optimization.
* **Compute:** Deno-based Edge Functions for async workloads and secure webhooks.

## Development Workflow
1. **Local DB:** Start the local Supabase container via `supabase start`.
2. **Migrations:** Create changes using `supabase migration new feature_name`.
3. **Type Sync:** Run the `scripts/generate-types` workflow to keep the frontend in sync with the DB.

## Migration & Seed Workflow
* **Migrations** are immutable. Once applied, they are never edited. New migrations handle alterations.
* **Seeds** are executed in dependency order. They are designed for local testing and should never overwrite production data.

## RLS Workflow
All tables are locked by default (`ENABLE ROW LEVEL SECURITY`). Access is granted explicitly via SQL policies located in the `policies/` directory, mapped against JWT claims from Clerk.

## Storage Workflow
Buckets are predefined in the `storage/` directory. Uploads must happen directly from the client to Supabase Storage (bypassing Node.js) to preserve bandwidth, utilizing signed URLs for private assets.

## Git Workflow
* Backend migrations must be committed to source control and undergo PR review.
* Secrets (e.g., `.env`) are ignored. Use `.env.example` for templates.

## Deployment Notes
Migrations are applied to staging/production via the Supabase CLI (`supabase db push`) running inside a GitHub Actions pipeline.

## Future Roadmap
- Setup local Docker environments.
- Integrate Clerk webhook synchronization.
- Implement the AI Audio Transcription Edge Function.
- Finalize RLS logic for the District Hierarchy.
