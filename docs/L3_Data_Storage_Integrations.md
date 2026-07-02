# L3 Architecture — Data, Storage & Integrations
### Rotaract District 3192 Web Portal
**Version:** 1.0 | **Layer:** Data and integration detail

---

## What This Document Covers

L3 answers: *How is data structured, stored, and secured? How does each integration connect?*
Use this for database design, DevOps setup, and integration implementation.

---

## Database — PostgreSQL (DigitalOcean Managed)

**Plan:** DO Managed PostgreSQL Basic — ~$15/mo
**Why managed:** Automated backups, failover, no manual DBA work. Right call for a volunteer team.

### Schema Design — Core Tables

```
┌──────────────────────────────────────────────────────────────────┐
│                        CORE SCHEMA                               │
├──────────────┬───────────────────────────────────────────────────┤
│ Table        │ Key Columns                                        │
├──────────────┼───────────────────────────────────────────────────┤
│ districts    │ id, name, number (3192), logo_url, created_at     │
│ clubs        │ id, district_id, name, slug, status,              │
│              │ logo_url, cover_url, theme_color,                  │
│              │ founded_date, charter_date, created_at            │
│ users        │ id, club_id, role, name, email, phone,            │
│              │ dob, whatsapp_number, profile_pic_url,            │
│              │ membership_status, joined_at, created_at          │
│ user_roles   │ id, user_id, role (enum), scope (club/district)   │
├──────────────┼───────────────────────────────────────────────────┤
│ events       │ id, club_id, title, slug, type, description,      │
│              │ venue, maps_url, start_at, end_at,                │
│              │ capacity, status, banner_url, created_by          │
│ registrations│ id, event_id, user_id, ticket_tier,              │
│              │ payment_status, qr_code, checked_in_at            │
│ attendance   │ id, event_id, user_id, checked_in_at,            │
│              │ checked_in_by, method (qr/manual)                 │
│ payments     │ id, registration_id, amount, currency,           │
│              │ razorpay_order_id, razorpay_payment_id,           │
│              │ status, receipt_url, created_at                   │
├──────────────┼───────────────────────────────────────────────────┤
│ points       │ id, user_id, club_id, event_id, action,          │
│              │ points_awarded, awarded_by, created_at            │
│ leaderboard  │ Materialised view over points table               │
│              │ Refreshed: after each event closes                │
├──────────────┼───────────────────────────────────────────────────┤
│ moms         │ id, club_id, meeting_date, title,                 │
│              │ transcript_text, audio_url, created_by,           │
│              │ created_at                                         │
│ mom_items    │ id, mom_id, type (decision/action/note),          │
│              │ content, assigned_to, due_date                    │
├──────────────┼───────────────────────────────────────────────────┤
│ courses      │ id, title, description, category,                 │
│              │ thumbnail_url, is_ri_cert, created_at             │
│ lessons      │ id, course_id, title, video_url, order_index      │
│ completions  │ id, user_id, lesson_id, course_id,               │
│              │ completed_at, certificate_url                     │
├──────────────┼───────────────────────────────────────────────────┤
│ feeds        │ id, club_id, posted_by, content_type,            │
│              │ caption, media_url, status, created_at            │
│ mentorships  │ id, mentor_id, mentee_id, slot_start,            │
│              │ slot_end, meet_link, status, notes                │
│ jobs         │ id, posted_by_user_id, title, company,           │
│              │ type (job/internship), description,               │
│              │ apply_url, expires_at                             │
├──────────────┼───────────────────────────────────────────────────┤
│ newsletters  │ id, club_id, title, file_url, published_at       │
│ campaigns    │ id, club_id, title, goal_amount, raised_amount,  │
│ (crowdfund)  │ description, status, created_at                  │
│ donations    │ id, campaign_id, user_id, amount,                │
│              │ razorpay_payment_id, created_at                   │
│ merchandise  │ id, name, type (rotaract/business),              │
│              │ price, image_url, external_url, owner_user_id     │
└──────────────┴───────────────────────────────────────────────────┘
```

### Data Retention Policy

| Data Category | Retention | Action after period |
|---------------|-----------|---------------------|
| Club data | Permanent | Never deleted |
| Member profiles | Permanent | Anonymised if user requests (DPDP) |
| District data | Permanent | Never deleted |
| Event records | Permanent | Archived to coldline after 2 years |
| Payment records | 7 years | Legal/tax compliance |
| MOM transcripts | 3 years | Archived to coldline |
| Attendance logs | 2 years | Archived to coldline |
| Feed posts | 1 year | Soft-deleted, purged after 1yr |
| Job listings | Auto-expire | Deleted at expires_at |

### Read vs Write Split

```
80% READ — served directly from PostgreSQL
  • Club pages data (club info, events list, member count)
  • Leaderboard (materialised view — fast reads)
  • LMS course catalogue
  • Resource listings, newsletters

20% WRITE — standard inserts/updates
  • Event registration
  • Attendance check-in
  • Points awarding
  • MOM creation
  • Feed posts
```

No caching layer needed at current scale. Add Redis only if query times exceed 2 seconds under load.

### Backup Strategy

```
DO Managed PostgreSQL automated backups:
  • Daily automated backup — retained 7 days (included in plan)
  • Weekly manual export to DO Spaces coldline — retained 1 year
  • Monthly dump to Google Drive (nonprofit — free) — retained permanently

Backup test: Restore drill every quarter. Document the steps in runbook.
```

---

## Storage — DigitalOcean Spaces

**Plan:** DO Spaces — 250 GB / $5 per month
**S3-compatible** — standard AWS S3 SDK works with DO Spaces. No vendor lock-in.

```
DO Spaces Bucket Structure
│
├── /uploads/
│   ├── /profiles/          Profile pictures       (5 MB cap)
│   ├── /clubs/             Logos, banners         (5 MB cap)
│   ├── /events/            Banners, gallery        (5 MB cap)
│   └── /feeds/             Feed images, posters   (5 MB cap)
│
├── /documents/
│   ├── /moms/              MOM audio recordings   (20 MB cap)
│   ├── /resources/         Shared docs, PDFs      (20 MB cap)
│   ├── /newsletters/       Club newsletters       (20 MB cap)
│   ├── /receipts/          Payment receipts       (auto-generated)
│   └── /certificates/      LMS certificates       (auto-generated)
│
├── /lms/
│   └── /videos/            Course videos          (embed YouTube/Vimeo preferred)
│                           Host here only if no external platform
│
└── /reports/               Monthly generated reports  (auto)

Coldline bucket (separate):
└── /archive/               Events >2yr · MOM >3yr · Payments >7yr
    Note: DO Spaces does not have native coldline tier.
    Use Google Cloud Storage Coldline (free tier via nonprofits)
    or move to a separate low-cost DO Spaces region bucket.
```

**File access pattern:**
- All uploads go via presigned URLs generated by Core API — services never expose bucket directly
- Public files (club logos, event banners): public ACL
- Private files (receipts, MOMs, certificates): presigned URL with 1-hour expiry

**Expected storage growth:** ~20–25 GB/year — well within 250 GB plan.

---

## Integrations Detail

### 1. Razorpay — Payments

```
Flow:
  User clicks "Pay" on event/crowdfund
        │
        ▼
  Events service → Razorpay: createOrder(amount, currency)
        │
        ▼
  Razorpay checkout opens in browser
        │
        ▼
  User pays → Razorpay sends webhook to /api/payments/webhook
        │
        ▼
  Events service verifies signature → marks payment success
        │
        ▼
  Receipt PDF generated → stored in Spaces → emailed via ZeptoMail

Keys needed:  RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
Webhook:      RAZORPAY_WEBHOOK_SECRET (for signature verification)
```

### 2. ZeptoMail (Zoho) — Transactional Email

```
Used for:
  • OTP / magic link login
  • Event registration confirmation + receipt
  • Dues reminder emails
  • Weekly digest emails
  • Certificate delivery
  • New club welcome email

Integration: ZeptoMail REST API (Node.js fetch)
Template engine: Handlebars (server-side rendered HTML emails)
From address: noreply@rotaract3192.org (verify domain in ZeptoMail)

Key: ZEPTO_MAIL_TOKEN
Volume estimate: ~500–1000 emails/month — well within free tier
```

### 3. Meta Business API — WhatsApp

```
Setup:
  1. Register on Meta for Developers
  2. Create WhatsApp Business App
  3. Verify phone number for District 3192
  4. Set webhook URL: https://rotaract3192.org/webhook/whatsapp

Inbound flow:
  Meta → POST /webhook/whatsapp → Service 4
  Service 4 parses message → calls Core API → replies via Meta API

Outbound flow:
  Core scheduler → POST to Service 4 /internal/broadcast
  Service 4 → Meta API → delivers to member WhatsApp

Templates:
  All outbound messages need Meta-approved templates
  (birthday, dues reminder, event reminder, announcement)
  Submit templates during onboarding — approval takes 1–3 days

Fallback: Exotel or Twilio (same webhook pattern, different SDK)
Cost: Meta API — free up to 1000 conversations/month
      Beyond: ~₹0.45–0.78 per conversation

Keys: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN
```

### 4. Google Calendar API

```
Used for:
  • Pushing district/club events to Google Calendar
  • iCal export links for members
  • Mentorship slot creation in organiser's calendar

Auth: Service Account (for district calendar)
      OAuth2 (for member personal calendar — optional)

Key: GOOGLE_SERVICE_ACCOUNT_KEY (JSON)
Scope: https://www.googleapis.com/auth/calendar
```

### 5. Google Maps API

```
Used for:
  • Event venue display (embedded map on event page)
  • Club location on club directory
  • Mentorship meeting location (if in-person)

Integration: Maps JavaScript API (frontend embed)
             Geocoding API (backend — convert address to lat/lng)

Quota:       $200 free credit/month — sufficient for this scale
             Apply Google for Nonprofits for additional credits

Key: GOOGLE_MAPS_API_KEY (restrict to your domain)
```

### 6. Speech-to-Text — MOM Recorder

```
Flow:
  Club Secretary records meeting audio in portal
        │
        ▼
  Audio file uploaded to DO Spaces (/moms/)
        │
        ▼
  Core API sends audio to STT service
        │
  ┌─────┴──────────────────────────────────┐
  │ Option A: Google Speech-to-Text API    │
  │   • Best accuracy for Indian English   │
  │   • 60 min free/month                  │
  │   • ~₹1.2/min beyond free tier         │
  │                                        │
  │ Option B: OpenAI Whisper (self-hosted) │
  │   • Free — run on DO droplet           │
  │   • Good accuracy, slower              │
  │   • One-time setup cost                │
  └────────────────────────────────────────┘
        │
        ▼
  Transcript saved to moms table
  MOM items extracted (AI optional step)
  Searchable text stored in mom_items

Recommendation: Start with Google Speech API (free tier covers ~10 meetings/month).
                Switch to self-hosted Whisper if costs grow.
```

### 7. Google Analytics 4

```
Integration: GA4 Measurement Protocol (server-side) + gtag.js (client-side)
Tracking:    Page views, event registrations, LMS completions,
             user journey, club page performance

Client-side: Add gtag.js to Service 1 and Events service frontend
Server-side: Core API sends conversion events (registration, payment)

Key: GA4_MEASUREMENT_ID, GA4_API_SECRET
Cost: Free
```

---

## Environment Variables — Master Reference

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:25060/rotaract?sslmode=require

# Storage
DO_SPACES_KEY=
DO_SPACES_SECRET=
DO_SPACES_ENDPOINT=https://blr1.digitaloceanspaces.com
DO_SPACES_BUCKET=rotaract3192

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ZeptoMail
ZEPTO_MAIL_TOKEN=
ZEPTO_MAIL_FROM=noreply@rotaract3192.org

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# WhatsApp / Meta
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=

# Google
GOOGLE_MAPS_API_KEY=
GOOGLE_SERVICE_ACCOUNT_KEY=
GOOGLE_SPEECH_API_KEY=
GA4_MEASUREMENT_ID=
GA4_API_SECRET=

# App
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://rotaract3192.org
```

**Secret management:** Store all in DigitalOcean App Platform environment variables (encrypted at rest). Never commit to GitHub. Use `.env.example` with blank values in repository.

---

## Security Checklist

```
Authentication
  [x] JWT with short expiry (15 min) + refresh tokens (7 days)
  [x] OTP login via ZeptoMail (no passwords to leak)
  [x] Role validated on every API request (middleware)
  [x] Club data isolated by club_id on all queries

Data
  [x] All DB connections over SSL (DO enforced)
  [x] PII fields (phone, dob) — consider field-level encryption
  [x] Presigned URLs for private files (1-hour expiry)
  [x] File type + size validation on all uploads
  [x] DPDP Act compliance — consent on signup, delete-on-request

Infrastructure
  [x] DO Managed DB — no direct public access
  [x] Spaces — private bucket, presigned URL only for sensitive files
  [x] HTTPS enforced (DO App Platform default)
  [x] Webhook signatures verified (Razorpay, Meta)
  [x] Rate limiting on /api/auth/* (native DO App Platform or express-rate-limit)

Audit
  [x] Admin action log table (who changed what, when)
  [x] Payment audit trail (Razorpay dashboard + local records)
  [x] Monthly DB export for compliance
```

---

## Deployment Environments

```
dev     → Local (docker-compose: postgres + node services)
staging → DO App Platform (smaller dyno, same config)
prod    → DO App Platform (production dynos)

Branch strategy:
  main        → production deploy (auto)
  staging     → staging deploy (auto)
  feature/*   → local only, PR to staging

Planned downtime: 3rd week of each month
  → DO App Platform: trigger new deploy during window
  → < 30 second restart for Node.js services
```

---

## Estimated Monthly Cost

| Item | Cost |
|------|------|
| Service 1 (Static) | Free |
| Service 2 (Core) | ~$12/mo |
| Service 3 (Events) | ~$3/mo avg (scale-to-zero) |
| Service 4 (WhatsApp) | ~$5/mo |
| PostgreSQL Managed | ~$15/mo |
| DO Spaces (250 GB) | ~$5/mo |
| Domain (annual ÷ 12) | ~$1/mo |
| **Total** | **~$41/mo** |
| After DO nonprofit credits ($500/yr) | **~$0–$10/mo** |

*Apply at: https://www.digitalocean.com/resources/articles/nonprofits-cloud-adoption*
*Apply at: https://www.google.com/nonprofits/ (Maps, Calendar, Workspace, Speech free credits)*

---

*This is a living document. Update after each architecture review or major feature addition.*
*Owner: District Tech Chair — handover required at Rotary year-end.*
