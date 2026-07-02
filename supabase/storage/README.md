# Supabase Storage Architecture

## Purpose
This folder documents the configuration, naming conventions, and security rules for all Supabase Storage buckets used across the Rotaract District 3192 ecosystem.

## Suggested Buckets
Detailed placeholder markdown files exist for each bucket in this directory:
- `club-logos` (Public)
- `profile-images` (Public)
- `activity-images` (Public)
- `meeting-images` (Private)
- `orientation-images` (Private)
- `installation-images` (Public)
- `dov-images` (Private)
- `documents` (Private - MOM PDFs, Receipts)
- `reports` (Private - Admin CSVs)
- `hero-assets` (Public - Showcase Banners)
- `club-websites` (Public - Static Assets)

## Naming Conventions
Files uploaded to buckets MUST NOT retain user-provided names.
- Format: `{entity_id}/{uuid_v4}.{ext}`
- Example: `clubs/uuid1234/logo_uuid5678.png`
This prevents path traversal vulnerabilities and accidental overwrites.

## Security & Access
- **Public Buckets:** RLS policies allow `SELECT` for all users (`auth.role() = 'anon' OR auth.role() = 'authenticated'`).
- **Private Buckets:** RLS policies strictly enforce that users can only `SELECT` files they have a business right to access (e.g., checking `club_id` before serving an audio file).
- **Uploads:** Direct client uploads are permitted ONLY for authenticated users, and file types/sizes must be restricted at the bucket level (e.g., max 5MB, `image/jpeg`, `image/webp`).
