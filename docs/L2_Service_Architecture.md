# L2 Architecture — Service Design
### Rotaract District 3192 Web Portal
**Version:** 1.0 | **Layer:** Service-level detail

---

## What This Document Covers

L2 answers: *What does each service do internally, what does it expose, and how do services talk to each other?*
Use this for technical planning, sprint scoping, and developer onboarding.

---

## Path-Based Routing (DigitalOcean App Platform)

All four services sit behind a single domain. DO App Platform routes by URL path — no separate API Gateway needed.

```
https://rotaract3192.org/
│
├── /*                    → Service 1 (Websites)   — district pages, club pages
├── /clubs/{slug}/*       → Service 1 (Websites)   — auto-generated club landing pages
├── /api/*                → Service 2 (Core)        — all backend API calls
├── /events/*             → Service 3 (Events)      — event portal
├── /webhook/whatsapp     → Service 4 (WhatsApp)    — Meta webhook endpoint
│
└── Slug source: club slugs stored in PostgreSQL
                clubs table → slug column → resolved at build/request time
```

---

## Service 1 — Websites (Static)

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE 1: WEBSITES                     │
│              DigitalOcean App Platform — Static             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pages served:                                              │
│  ┌─────────────────────┐   ┌──────────────────────────┐    │
│  │   District Site     │   │   Club Landing Pages     │    │
│  │                     │   │                          │    │
│  │ • Home              │   │  /clubs/{slug}           │    │
│  │ • About District    │   │  • Club profile          │    │
│  │ • Rota News         │   │  • Events list           │    │
│  │ • Hall of Fame      │   │  • Members (public)      │    │
│  │ • Newsletter        │   │  • Social links          │    │
│  │ • Resources         │   │  • Contact               │    │
│  │ • Brand Centre      │   │                          │    │
│  │ • Club Directory    │   │  Slug auto-created on    │    │
│  │ • Jobs & Internships│   │  club onboarding         │    │
│  └─────────────────────┘   └──────────────────────────┘    │
│                                                             │
│  Reads from:  Core API (at build time or client-side fetch) │
│  Auth:        None for public pages                         │
│  Build:       Node.js SSG or plain HTML + fetch             │
│  Hosting:     DO Static Site — FREE                         │
└─────────────────────────────────────────────────────────────┘
```

**Club page auto-creation flow:**
```
District Admin creates new club in portal
        │
        ▼
Core API → inserts row in clubs table
        │   slug = "rotaract-coimbatore-north"
        │   status = active
        ▼
Static build triggers (DO webhook or manual deploy)
        │
        ▼
Club page live at /clubs/rotaract-coimbatore-north
```

---

## Service 2 — Core Backend

```
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE 2: CORE                         │
│            DigitalOcean App Platform — Node.js              │
│                   Always on — Basic dyno                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Framework:   Express.js (or Fastify)                       │
│  Auth:        JWT tokens + refresh tokens                   │
│  DB client:   pg (node-postgres) with connection pooling    │
│                                                             │
│  API Modules:                                               │
│                                                             │
│  /api/auth/*          Login · Logout · OTP · Roles          │
│  /api/clubs/*         CRUD · Slug gen · Branding            │
│  /api/members/*       Profiles · Points · Membership        │
│  /api/feeds/*         District feed · Posts · Reels         │
│  /api/lms/*           Courses · Videos · Certs              │
│  /api/mom/*           Create · Transcribe · Archive         │
│  /api/leaderboard/*   Points · Rankings · HoF               │
│  /api/reports/*       Monthly reports · Analytics           │
│  /api/mentorship/*    Slots · Booking · Matching            │
│  /api/jobs/*          Listings · Applications               │
│  /api/admin/*         District team tools · Approvals       │
│  /api/scheduler/*     Trigger automation jobs               │
│                                                             │
│  Scheduled Jobs (node-cron):                                │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Runs inside Core service (5–6 schedulers)        │     │
│  │                                                    │     │
│  │  Daily   — Birthday detection → WhatsApp trigger  │     │
│  │  Weekly  — District feed digest → ZeptoMail       │     │
│  │  Monthly — Report generation → store in Spaces    │     │
│  │  Dynamic — Dues reminders (N days before due)     │     │
│  │  Dynamic — Event reminders (sent via WhatsApp)    │     │
│  │  Trigger — Charter/anniversary shoutouts          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Connects to:                                               │
│  • PostgreSQL (primary reads/writes)                        │
│  • DO Spaces (file uploads — presigned URLs)                │
│  • ZeptoMail (email dispatch)                               │
│  • Google Calendar API (event sync)                         │
│  • Google Speech API / Whisper (MOM transcription)          │
│  • Google Analytics (server-side events)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Service 3 — Events (Scalable)

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE 3: EVENTS                        │
│        DigitalOcean App Platform — Node.js                  │
│        Scale-to-zero idle · HPA during events               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Framework:  Express.js                                     │
│  Scaling:    DO App Platform instance count rules           │
│              Min: 0 (idle)  Max: 5 (peak)                   │
│              Trigger: CPU > 70% or request queue > 50       │
│                                                             │
│  Modules:                                                   │
│                                                             │
│  Registration                                               │
│  ├── Event browse & search                                  │
│  ├── Ticket tiers (Free / Paid / Early bird)                │
│  ├── Registration form + validation                         │
│  └── Confirmation email via ZeptoMail                       │
│                                                             │
│  Payments                                                   │
│  ├── Razorpay order creation                                │
│  ├── Payment verification (webhook)                         │
│  ├── Receipt generation (PDF → Spaces)                      │
│  └── Refund handling                                        │
│                                                             │
│  QR Check-in                                                │
│  ├── QR code generation (qrcode npm — free)                 │
│  ├── Offline-capable scanner (PWA cached)                   │
│  └── Attendance write-back to Core API                      │
│                                                             │
│  Crowdfunding                                               │
│  ├── Campaign creation + approval flow                      │
│  ├── Donation via Razorpay                                  │
│  └── Progress tracking                                      │
│                                                             │
│  Connects to:                                               │
│  • PostgreSQL (events schema)                               │
│  • Core API (auth verification, member lookup)              │
│  • Razorpay (payments)                                      │
│  • ZeptoMail (confirmations)                                │
│  • DO Spaces (receipt PDFs, event assets)                   │
│  • Google Maps API (venue display)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Service 4 — WhatsApp (Bot + Broadcasts)

```
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE 4: WHATSAPP                       │
│          DigitalOcean App Platform — Node.js                │
│                  Always on — Tiny dyno                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Provider:   Meta Business API (direct — free at scale)     │
│  Fallback:   Exotel or Twilio (if Meta setup is delayed)    │
│  Library:    whatsapp-cloud-api (npm)                       │
│                                                             │
│  Inbound — Bot (members message first):                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Webhook receives message from Meta                  │   │
│  │         │                                            │   │
│  │         ▼                                            │   │
│  │  Intent parser (keyword match or GPT mini)           │   │
│  │         │                                            │   │
│  │  ┌──────┴──────────────────────────────────────┐    │   │
│  │  │ "events"   → fetch from Core API → reply    │    │   │
│  │  │ "points"   → fetch from Core API → reply    │    │   │
│  │  │ "register" → send event link → deep link    │    │   │
│  │  │ "birthday" → personalised message           │    │   │
│  │  │ "help"     → command menu                   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Outbound — Broadcasts (system pushes to members):          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Triggered by: Core scheduler or Admin action        │   │
│  │                                                      │   │
│  │  • Birthday wishes (daily cron)                      │   │
│  │  • Dues reminders (N days before)                    │   │
│  │  • Event reminders (24hr / 1hr before)               │   │
│  │  • Weekly district digest (Monday 9am)               │   │
│  │  • Charter anniversary shoutouts                     │   │
│  │  • Club announcements (admin-triggered)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Note on Custom GPT alternative:                            │
│  A ChatGPT Custom GPT can handle inbound Q&A (bot).         │
│  It CANNOT send proactive/outbound messages.                │
│  Recommendation: Use Custom GPT for bot if team prefers,    │
│  keep this service ONLY for outbound broadcasts.            │
│  Saves ~1/2 the code in this service.                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Inter-Service Communication

```
Service 1 (Websites)  ──── fetch() ──────────► Core API (/api/*)
Service 3 (Events)    ──── HTTP ─────────────► Core API (/api/auth, /api/members)
Service 4 (WhatsApp)  ──── HTTP ─────────────► Core API (/api/members, /api/events)
Service 4 (WhatsApp)  ◄─── HTTP (trigger) ───  Core scheduler (cron jobs)

All services         ──── direct connection ► PostgreSQL
All services         ──── presigned URLs ────► DO Spaces
```

**No message queue needed at this scale.** Node-cron inside Core service handles all scheduling. Add BullMQ only if jobs start failing or queue up.

---

## Role-Based Access Control (RBAC)

| Role | Service 1 | Service 2 (Core) | Service 3 (Events) | Service 4 (Bot) |
|------|-----------|------------------|--------------------|-----------------|
| Public | Read club/district pages | — | Browse events | — |
| Member | Read | Profile, points, LMS, feeds | Register, QR | Query bot |
| Club Secretary | Read + club edit | MOM, attendance, treasury | Manage club events | Broadcasts to club |
| Club President | All Secretary + | Full club admin | Full club events | All club actions |
| District Team | All | All APIs | All events | All broadcasts |
| District Admin | All | Super admin | All | All |

JWT issued by Core service. All services validate the JWT locally — no round-trip to Core on every request.

---

*Next: See L3 for database schema, storage design, and integration detail.*
