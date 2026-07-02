# Architecture Roadmap & Master Index
### Rotaract District 3192 Web Portal

**Version:** 1.0  
**Last Updated:** 2026-07-01  
**Purpose:** To act as the master navigation guide, index, and implementation roadmap for the Rotaract District 3192 Digital Ecosystem architecture.  
**Audience:** All incoming developers, Tech Chairs, and Project Managers.  

---

## Table of Contents
1. [Reading Order & Document Relationships](#reading-order--document-relationships)
2. [Dependencies & Modularity](#dependencies--modularity)
3. [Implementation Checklist](#implementation-checklist)
4. [Suggested Sprint Plan](#suggested-sprint-plan)
5. [Architecture Timeline & Maturity Roadmap](#architecture-timeline--maturity-roadmap)
6. [Future Rotary Year Handover](#future-rotary-year-handover)
7. [Future Documents](#future-documents)

---

## Reading Order & Document Relationships

To understand this system thoroughly, new engineers must read the documentation in the exact order below. Jumping ahead will result in a lack of domain context.

### 📍 Level 1: High-Level Concepts (Start Here)
* **[L1_Architecture_Overview](L1_Architecture_Overview.md):** The 30,000-foot view. Read this to understand what the 4 main services are and how DigitalOcean routing works.
* **[L2_Service_Architecture](L2_Service_Architecture.md):** Service-level design. Explains the exact boundaries between the Static Websites, Core Backend, Events Engine, and WhatsApp Bot.

### 📍 Level 2: Data & Storage Foundations
* **[L3_Data_Storage_Integrations](L3_Data_Storage_Integrations.md):** The physical data layout, integrations (Razorpay, ZeptoMail), and overall infrastructure dependencies.
* **[L9_Storage_Architecture](L9_Storage_Architecture.md):** The Supabase Storage strategy, detailing buckets, optimizations, and disaster recovery.

### 📍 Level 3: Business Logic & Entities
* **[L4_Master_Entity_Catalogue](L4_Master_Entity_Catalogue.md):** Defines the 17 business modules and establishes the Ubiquitous Language for the domain.
* **[L5_Entity_Relationship_Architecture](L5_Entity_Relationship_Architecture.md):** Explains how entities interact, including transaction boundaries and aggregate roots.
* **[L6_Database_Dictionary](L6_Database_Dictionary.md):** The production blueprint for the PostgreSQL tables, indexes, and partitions.

### 📍 Level 4: Security & APIs (Implementation Layer)
* **[L7_RBAC_Permissions](L7_RBAC_Permissions.md):** The 11 roles and the exact permission matrix. Essential before writing any API endpoint.
* **[L8_API_Contracts](L8_API_Contracts.md):** The specific RESTful endpoints, payloads, and integration standards between the Next.js frontend and backend.

---

## Dependencies & Modularity

The ecosystem relies on a strictly decoupled architecture.
1. **Frontend to Backend:** The Next.js frontend strictly communicates via the documented REST API (L8) and Supabase Storage URLs (L9). It never talks to the database directly.
2. **Authentication to Backend:** Clerk acts as the Identity Provider. The Backend trusts Clerk JWTs. If Clerk goes down, authenticated endpoints fail gracefully, but the Public Showcase remains unaffected (Static/Edge cached).
3. **Payments to Database:** Razorpay webhooks are the sole source of truth for `PaymentTransactions`. The frontend does not write payment statuses.
4. **Database to Leaderboard:** The materialised view acts as a buffer. The heavy logic of calculating points does not block write operations on the `point_ledgers` table.

---

## Implementation Checklist

For the engineering team tasked with building this system from scratch, check off these items sequentially:

- [ ] **Phase 1: Infrastructure Setup**
  - [ ] Provision Supabase (PostgreSQL + Storage).
  - [ ] Set up DigitalOcean App Platform environments (Staging/Prod).
  - [ ] Configure Clerk Auth and sync webhooks.
- [ ] **Phase 2: Database Blueprinting**
  - [ ] Write SQL migrations for L6 tables (Users, Clubs, Districts).
  - [ ] Apply RLS Policies based on L7 RBAC rules.
  - [ ] Create Storage Buckets (Public, Private) based on L9.
- [ ] **Phase 3: Core API Services**
  - [ ] Build `/api/v1/auth/me` to map Clerk Identity to Member Profile.
  - [ ] Build `/api/v1/clubs` and `/api/v1/users` (CRUD).
- [ ] **Phase 4: Club Operations & Reporting**
  - [ ] Build MOMs, Installations, Orientations, and DOV endpoints.
  - [ ] Implement Point Ledger calculation triggers.
- [ ] **Phase 5: Events & Finance**
  - [ ] Build Event Management module.
  - [ ] Integrate Razorpay Checkout and process webhooks safely.
- [ ] **Phase 6: Automations**
  - [ ] Set up ZeptoMail templates for email alerts.
  - [ ] Build Cron jobs for Leaderboard materialisation.

---

## Suggested Sprint Plan

Based on standard 2-week Agile Sprints:

| Sprint | Focus Area | Deliverables |
|--------|------------|--------------|
| **Sprint 1** | Foundation | DB Schema deployed, Supabase/Clerk linked, Base CI/CD pipeline |
| **Sprint 2** | Identity | Roles working, District/Club CRUD complete, Public Showcase APIs |
| **Sprint 3** | Operations | MOMs, Orientations, DOVs, File Uploads working |
| **Sprint 4** | Events | Event creation, Ticketing flow, QR Code generation |
| **Sprint 5** | Finance | Razorpay integration, Receipt generation, Paid Events |
| **Sprint 6** | Gamification | Points engine, Leaderboard Materialised View, Reporting |
| **Sprint 7** | Polish | Edge Functions, Caching, End-to-End Testing |

---

## Architecture Timeline & Maturity Roadmap

### Horizon 1: Launch (Year 1)
* **Goal:** Stable Phase 1, 2, and 3 platforms.
* **Tech:** Traditional Node.js APIs, basic PostgreSQL queries, Supabase Storage.
* **Metrics:** 100% uptime during major District Events, zero lost payment webhooks.

### Horizon 2: Scale & Insights (Year 2)
* **Goal:** High performance and AI integration.
* **Tech:** Move Leaderboards to Edge Functions. Implement native Supabase Realtime via Websockets. Activate Whisper AI for automatic MOM transcription.
* **Metrics:** <100ms API response time globally.

### Horizon 3: Federation (Year 3+)
* **Goal:** Offer the platform as a SaaS to other Rotaract Districts.
* **Tech:** Multi-tenant architecture (fully enforced by `district_id` filtering in RLS). Sharded databases if exceeding 100,000+ total cross-district users.

---

## Future Rotary Year Handover

A critical risk in Rotaract systems is the annual handover on July 1st. To ensure zero knowledge loss:
1. **No Personal Emails:** All 3rd-party services (Supabase, DigitalOcean, Razorpay, Clerk) MUST be registered under `it@rotaract3192.org` or similar domain-bound alias.
2. **Documentation as Code:** This `docs` folder lives in the GitHub repository. It must be updated via Pull Request alongside any codebase changes.
3. **Environment Secrets:** Rotated annually. The outgoing Tech Chair must provide the incoming Tech Chair with the master `.env` vault access.

---

## Future Documents

As the system matures, the following documents should be added to this folder:
* `L10_Frontend_Component_Library.md` (Next.js & Tailwind standards)
* `L11_AI_Integration_Specs.md` (OpenAI/Whisper implementation)
* `L12_Disaster_Recovery_Runbook.md` (Step-by-step restoration guide in case of DB failure)

---
*End of Architecture Documentation. You are now ready to build.*
