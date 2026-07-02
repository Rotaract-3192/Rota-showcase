# L1 Architecture — System Overview
### Rotaract District 3192 Web Portal
**Version:** 1.0 | **Stack:** Node.js | **Hosting:** DigitalOcean | **Target Go-live:** June 2026

---

## What This Document Covers

L1 is the **30,000-foot view**. It answers: *What are the major parts of this system and how do they relate?*
Use this for stakeholder presentations, onboarding new team members, and handover documentation.

---

## System Purpose

A unified web portal for Rotaract District 3192 that serves:
- **Clubs** — landing pages, member management, event hosting, MOM recording
- **Members** — event registration, learning, points tracking, mentorship
- **District team** — reporting, announcements, recognition, workflow automation
- **Public** — club discovery, crowdfunding, merchandise, job board

---

## The 4-Service Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS                                    │
│         Members · Club Execs · District Team · Public           │
└──────────────────────┬──────────────────────────────────────────┘
                       │  Browser (PWA-ready, mobile-first)
                       │
              ┌────────▼────────┐
              │  Path Router    │  DigitalOcean App Platform
              │  (built-in)     │  /club/* /events/* /api/* /bot/*
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┬─────────────────┐
        │              │              │                  │
┌───────▼──────┐ ┌─────▼──────┐ ┌───▼────────┐ ┌──────▼──────┐
│  Service 1   │ │ Service 2  │ │ Service 3  │ │  Service 4  │
│   Websites   │ │    Core    │ │   Events   │ │  WhatsApp   │
│  (Static)    │ │ (Backend)  │ │  (Scaled)  │ │    Bot      │
└───────┬──────┘ └─────┬──────┘ └───┬────────┘ └──────┬──────┘
        │              │            │                   │
        └──────────────┴────────────┴───────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      DATA LAYER       │
                    │  PostgreSQL · Spaces  │
                    │  Coldline Storage     │
                    └───────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    INTEGRATIONS       │
                    │  Razorpay · ZeptoMail │
                    │  Google · Meta API    │
                    │  Speech-to-Text       │
                    └───────────────────────┘
```

---

## Service Summary

| # | Service | Purpose | Always On | Scales |
|---|---------|---------|-----------|--------|
| 1 | **Websites** | District site, club landing pages, resources, brand centre | Yes | No — static |
| 2 | **Core** | Auth, profiles, feeds, LMS, leaderboard, MOM, reports | Yes | Minimal |
| 3 | **Events** | Registration, payments, QR check-in, attendance, crowdfunding | Yes (small) | Yes — HPA during events |
| 4 | **WhatsApp** | Bot (inbound queries) + broadcasts (outbound automation) | Yes | No — lightweight |

---

## Key Design Principles

| Principle | Decision |
|-----------|----------|
| **Simplicity first** | No Kubernetes, no API Gateway, no Redis cache — until traffic demands it |
| **Cost-aware** | DigitalOcean App Platform, free tiers, DO Spaces over S3 |
| **Nonprofit-ready** | Apply for DO nonprofit credits + Google for Nonprofits |
| **Team-maintainable** | Node.js across all services — one language, one team |
| **Volunteer-friendly handover** | Everything documented, infra-as-simple-config, no black boxes |
| **Mobile-first** | PWA — no native app needed at this scale |

---

## Non-Functional Requirements (from discovery)

| Requirement | Target |
|-------------|--------|
| Daily active users | 200–300 |
| Peak concurrent (events) | 500–1,000 |
| Simultaneous requests (peak) | 200–300 |
| Response time (normal) | 1–3 seconds |
| Max tolerated delay | 5 seconds |
| Acceptable downtime | Once/month (3rd week, planned) |
| Data loss tolerance | Critical — daily backups |
| Storage growth | ~20–25 GB/year |
| File size caps | Images: 5 MB · Documents: 20 MB |
| Offline support | Low-connectivity PWA caching |

---

## Hosting & Cost Strategy

```
DigitalOcean App Platform
├── Service 1 (Websites)    → Static site — FREE tier or ~$3/mo
├── Service 2 (Core)        → Basic dyno — ~$12/mo
├── Service 3 (Events)      → Scale-to-zero — ~$0 idle, spikes billed
├── Service 4 (WhatsApp)    → Basic dyno — ~$5/mo
├── PostgreSQL (Managed DB) → Basic plan — ~$15/mo
└── Spaces (Object Storage) → 250GB — ~$5/mo

Estimated base: ~$35–40/month
Apply for: DO nonprofit credits (up to $500/yr)
           Google for Nonprofits (free Workspace + Maps credits)
```

---

## Integrations at a Glance

| Category | Tool | Purpose |
|----------|------|---------|
| Payments | Razorpay | Event fees, memberships, crowdfunding |
| Email | ZeptoMail (Zoho) | Transactional emails, OTPs, notifications |
| WhatsApp | Meta Business API (direct) | Bot + broadcast — free at this scale |
| Calendar | Google Calendar API | Event sync, iCal export |
| Maps | Google Maps API | Club locations, event venues |
| Analytics | Google Analytics 4 | User behaviour, page views |
| Speech-to-Text | Google Speech API / Whisper | MOM audio transcription |
| QR | Open-source (qrcode npm) | Event check-in — no paid vendor needed |

---

*Next: See L2 for service-level design. See L3 for data and integration detail.*
