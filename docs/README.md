# Rotaract District 3192 — Web Portal Architecture

**Status:** Draft v1.0 | **Year:** 2025–2026 | **Tech Focus Theme**

---

## Document Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [L1 — System Overview](./L1_Architecture_Overview.md) | Big picture: what the system is and why | Stakeholders, DG, new team members |
| [L2 — Service Design](./L2_Service_Architecture.md) | What each service does and how they connect | Developers, tech leads |
| [L3 — Data, Storage & Integrations](./L3_Data_Storage_Integrations.md) | Database schema, storage, all integration flows | Backend developers, DevOps |

---

## Quick Reference

```
Stack:     Node.js (Express) · PostgreSQL · DigitalOcean App Platform
Storage:   DO Spaces (hot) · Google Cloud Coldline (archive)
Services:  4 (Websites · Core · Events · WhatsApp)
Routing:   Path-based (DO App Platform built-in)
Auth:      JWT + OTP via ZeptoMail
Go-live:   June 2026
```

---

## Key Links

- DigitalOcean Nonprofit Programme: https://www.digitalocean.com/resources/articles/nonprofits-cloud-adoption
- Google for Nonprofits: https://www.google.com/nonprofits/
- AWS Nonprofit (if needed): https://aws.amazon.com/government-education/nonprofits/

---

## Architecture Owners

| Role | Responsibility |
|------|---------------|
| District Tech Chair | Architecture decisions, documentation |
| Lead Developer | Implementation, service ownership |
| Handover required | Every Rotary year-end — see L3 for checklist |

---

*Service Above Self — built to last, built to hand over.*
