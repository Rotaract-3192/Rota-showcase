# Generated Database Types

## Purpose
This folder stores the TypeScript type definitions generated directly from the PostgreSQL schema using the Supabase CLI. These types enforce end-to-end type safety between the database and the frontend/backend code.

## Contents
- **Database Types:** Represents the raw JSON structure of the Supabase `Database` interface.
- **Enums:** Strongly typed literal unions derived from PostgreSQL enums (e.g., `ClubStatus`, `EventStatus`).
- **Interfaces:** Helper types for inserting, updating, and selecting rows (e.g., `TablesInsert<'users'>`).
- **Generated Models:** `database.types.ts` is the primary output file from the CLI generator.

## Type Generation Workflow
Do NOT manually edit `database.types.ts`. 
When the schema changes via a migration, run the CLI command to regenerate the types:
```bash
supabase gen types typescript --local > supabase/types/database.types.ts
```
