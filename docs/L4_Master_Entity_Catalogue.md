# L4 Architecture — Master Entity Catalogue
### Rotaract District 3192 Web Portal
**Version:** 1.0 | **Layer:** Business Domain Entity Catalogue

---

## What This Document Covers

This document defines the **Business Domain Entities** for the entire Rotaract District 3192 ecosystem.
It answers: *What are the core business concepts, and how are they translated into system constructs?*

This is **not** a raw database schema (see L3 for the physical schema). Instead, this is an **Entity Catalogue** designed to bridge business requirements and system implementation. It distinguishes between entities that become PostgreSQL tables, logic in Node.js Services, external APIs, or objects in DigitalOcean Spaces.

Use this document to ensure strict naming conventions, bounded contexts, and domain-driven design alignment for the Phase 3 District Administration Platform and the wider ecosystem.

---

## Design Principles

1. **Ubiquitous Language:** The terms defined here must be used consistently across code, APIs, and UI. A `Member` is never a `User` in business logic; a `Club` is never a `Chapter`.
2. **Clear Boundaries:** Entities belong to specific modules. Cross-module references use IDs, reducing tight coupling.
3. **Scalability:** Designed for 100+ Clubs, 20,000+ Users, and multi-year data retention without degradation.

---

## Business Capability Map (The 17 Modules)

The ecosystem is divided into **17 Bounded Contexts (Modules)**.

### 1. District Governance Module
- **Purpose:** Manage the overarching district entity, its leadership, and core configurations.
- **Entities:** `District` (Table), `DistrictLeader` (Role Mapping), `RotaryYear` (Config Table).
- **Implementation:** Governed by Core Backend (Service 2). Read-heavy.

### 2. Club Management Module
- **Purpose:** Manage the lifecycle, branding, and status of the 100+ clubs.
- **Entities:** `Club` (Table), `ClubBranding` (Storage Bucket for logos/banners), `ClubCharter` (Table).
- **Implementation:** Exposed via `/api/clubs`. Static club pages generated via Service 1.

### 3. Member Profiles Module
- **Purpose:** The central identity record for all 20,000+ Rotaractors.
- **Entities:** `MemberProfile` (Table), `MemberRole` (Table), `AuthIdentity` (JWT Token/Service).
- **Implementation:** Profile pictures in DO Spaces. RBAC logic handled via JWT in Service 2.

### 4. Events & Ticketing Module
- **Purpose:** Creation, discovery, and registration for District and Club events.
- **Entities:** `Event` (Table), `Registration` (Table), `TicketTier` (Table), `EventBanner` (DO Spaces).
- **Implementation:** Handled by the scalable Events Service (Service 3). High concurrency expected during major district events.

### 5. Attendance & Check-in Module
- **Purpose:** Offline-capable attendance tracking.
- **Entities:** `AttendanceRecord` (Table), `QRCode` (Client-side generation), `ScannerSession` (PWA Cache).
- **Implementation:** QR verification hits Service 3. Must operate under low connectivity.

### 6. Payments & Dues Module
- **Purpose:** Financial transactions for event tickets, club dues, and memberships.
- **Entities:** `PaymentTransaction` (Table), `RazorpayOrder` (External API), `Receipt` (DO Spaces PDF).
- **Implementation:** Synchronous Razorpay webhook integration via Service 3.

### 7. Gamification & Leaderboard Module
- **Purpose:** Drive engagement through points, rankings, and the Hall of Fame.
- **Entities:** `PointLedger` (Table - Append Only), `LeaderboardRanking` (Materialised View), `Badge` (Config/Storage).
- **Implementation:** Points calculated asynchronously. Leaderboard relies on PostgreSQL materialised views for fast reads.

### 8. MOMs & AI Transcription Module
- **Purpose:** Automated recording and action-item extraction for Minutes of Meeting.
- **Entities:** `MeetingMinutes` (Table), `AudioRecording` (DO Spaces), `ActionItem` (Table), `Transcript` (Google Speech API).
- **Implementation:** Audio offloaded to Spaces; Service 2 calls Google Speech API and stores results.

### 9. Learning & Development (LMS) Module
- **Purpose:** Provide RI certifications and training to members.
- **Entities:** `Course` (Table), `Lesson` (Table), `VideoAsset` (External Embed/Spaces), `Certificate` (DO Spaces PDF).
- **Implementation:** Progress tracking via Service 2; Certificates generated on completion.

### 10. Social Feed & Showcases Module
- **Purpose:** Internal social network for sharing project impact and news.
- **Entities:** `FeedPost` (Table), `FeedMedia` (DO Spaces), `Reaction` (Table).
- **Implementation:** Media heavy. Service 2 handles pagination and content filtering.

### 11. Mentorship & Booking Module
- **Purpose:** Connect senior Rotarians/Alumni with Rotaractors.
- **Entities:** `MentorProfile` (Table), `BookingSlot` (Table), `CalendarEvent` (Google Calendar API).
- **Implementation:** Syncs directly with Google Calendar via Service 2.

### 12. Jobs & Internships Module
- **Purpose:** Career opportunities for members.
- **Entities:** `JobListing` (Table), `Application` (Table), `Resume` (DO Spaces).
- **Implementation:** Time-to-Live (TTL) configured to auto-expire listings.

### 13. Resources & Newsletters Module
- **Purpose:** Document distribution and club publications.
- **Entities:** `ResourceDocument` (Table), `Newsletter` (Table), `FileAsset` (DO Spaces).
- **Implementation:** Presigned URLs used for access control on sensitive district resources.

### 14. Campaigns & Crowdfunding Module
- **Purpose:** Raise funds for community service projects.
- **Entities:** `Campaign` (Table), `Donation` (Table), `CampaignProgress` (Derived State).
- **Implementation:** Integrated with Razorpay via Service 3. Requires strict approval workflows.

### 15. Merchandise & Store Module
- **Purpose:** Sale of district/club merchandise.
- **Entities:** `Product` (Table), `Order` (Table), `Inventory` (Table).
- **Implementation:** Lightweight e-commerce flow. Payment collection maps to the Payments module.

### 16. Reporting & Analytics Module
- **Purpose:** Data exports, compliance reporting, and usage analytics.
- **Entities:** `MonthlyReport` (Table/Spaces), `ExportJob` (Background Task), `AnalyticsEvent` (GA4 API).
- **Implementation:** Service 2 generates CSVs asynchronously and stores them in DO Spaces to prevent blocking the event loop.

### 17. Automations & Bots Module
- **Purpose:** Proactive communication and automated workflows.
- **Entities:** `CronJob` (Node-Cron), `BroadcastMessage` (WhatsApp/Meta API), `EmailTemplate` (ZeptoMail API).
- **Implementation:** Service 4 (WhatsApp) handles inbound bot logic; Service 2 triggers scheduled outbound broadcasts.

---

## Entity Relationship Overview

* **A `District`** has many **`Clubs`**.
* **A `Club`** has many **`Members`**, **`Events`**, **`MOMs`**, and **`Campaigns`**.
* **A `Member`** belongs to one **`Club`**, registers for many **`Events`**, earns **`Points`**, and completes **`Courses`**.
* **An `Event`** triggers many **`Registrations`**, requires **`Payments`**, and logs **`Attendance`**.
* **A `Registration`** generates one **`QRCode`** and may trigger one **`PaymentTransaction`**.

---

## Storage & Implementation Matrix

| Entity Type | Primary Storage | Fallback / Archive | Access Pattern |
|-------------|-----------------|--------------------|----------------|
| **Structured Business Data** (Users, Clubs, Events) | PostgreSQL | Coldline DB Dump (3 yrs) | Real-time APIs |
| **Voluminous Logs** (Points, Attendance) | PostgreSQL | PostgreSQL Partitioning | Aggregation / Materialised Views |
| **Media Assets** (Images, Videos, Logos) | DO Spaces | Local Cache (PWA) | CDN / Public URLs |
| **Sensitive Documents** (MOMs, Receipts) | DO Spaces | GCS Coldline | Presigned URLs (1hr TTL) |
| **Derived Analytics** (Leaderboards) | PostgreSQL Materialised | Redis (if scaled) | Read-only endpoints |

---

*This document marks the completion of the foundational architecture planning (L1-L4). The technical blueprints are now ready for feature-by-feature implementation.*
