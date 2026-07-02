# L8 Architecture — API Contracts
### Rotaract District 3192 Web Portal

**Version:** 1.0  
**Last Updated:** 2026-07-01  
**Purpose:** To define the standard API contracts for communication between the Next.js frontend (or mobile clients) and the backend services.  
**Scope:** Covers endpoints for Authentication, Clubs, Users, Activities, Meetings, Orientations, Installations, District Official Visits, Leaderboards, Publications, Notifications, Analytics, and Administration.  
**Audience:** Frontend Developers, Backend Engineers, API Consumers.  

---

## Table of Contents
1. [API Design Principles](#api-design-principles)
2. [Global Standards](#global-standards)
3. [Module Contracts](#module-contracts)
   - [Authentication](#1-authentication)
   - [Users](#2-users)
   - [Clubs](#3-clubs)
   - [Activities (Events/Projects)](#4-activities)
   - [Club Operations (Meetings, Orientations, Installations, DOV)](#5-club-operations)
   - [Leaderboards](#6-leaderboards)
   - [Publications](#7-publications)
   - [Notifications & Webhooks](#8-notifications--webhooks)
   - [Administration & Analytics](#9-administration--analytics)
4. [Future Considerations](#future-considerations)

---

## API Design Principles

1. **RESTful Architecture:** URLs represent resources (nouns, pluralized). HTTP Methods represent actions.
2. **Stateless:** Every request must contain all necessary authentication (JWT via Authorization header).
3. **Idempotency:** `PUT` and `DELETE` requests must be idempotent.
4. **JSON Only:** All payloads and responses are `application/json`.
5. **Versioning:** The API is versioned in the URL path (e.g., `/api/v1/`).

---

## Global Standards

### Standard Response Envelope
All successful responses are wrapped in a standard `data` envelope.
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided data is invalid.",
    "details": [
      { "field": "email", "message": "Must be a valid email address." }
    ]
  }
}
```

### Common Status Codes
* **200 OK:** Successful read/update.
* **201 Created:** Successful creation.
* **204 No Content:** Successful deletion (no body returned).
* **400 Bad Request:** Validation failure.
* **401 Unauthorized:** Missing or invalid JWT.
* **403 Forbidden:** Valid JWT, but insufficient role permissions (RBAC failure).
* **404 Not Found:** Resource ID does not exist.
* **429 Too Many Requests:** Rate limit exceeded.
* **500 Internal Server Error:** Unhandled backend crash.

### Query Parameters (Standardized)
* **Pagination:** `?page=1&limit=20` (Max limit: 100)
* **Sorting:** `?sort=-created_at,name` (Minus sign denotes descending)
* **Filtering:** `?status=PUBLISHED&club_id=uuid`
* **Search:** `?q=search_term` (Triggers Full-Text Search in PostgreSQL)

---

## Module Contracts

*(Note: Detailed schemas are abbreviated for readability. All parameters assume UUIDs where IDs are referenced.)*

### 1. Authentication
*Future Clerk Integration means these endpoints handle metadata sync rather than password hashing.*

**`POST /api/v1/auth/sync`**
* **Purpose:** Synchronize Clerk user creation webhook to Supabase DB.
* **Authentication:** Service Role (Backend-to-Backend).
* **Request:** Clerk User Webhook Payload.
* **Response (200):** `{ "success": true }`

**`GET /api/v1/auth/me`**
* **Purpose:** Fetch the current user's profile and RBAC permissions.
* **Authentication:** Any valid JWT.
* **Response (200):** `{ "id": "uuid", "role": "President", "club_id": "uuid" }`

---

### 2. Users
**`GET /api/v1/users`**
* **Authentication:** District Team+ (or Club Sec/Pres for `?club_id=own_club`).
* **Query Params:** `page`, `limit`, `sort`, `club_id`, `role`, `q`.
* **Response (200):** Array of User objects + Pagination meta.

**`PATCH /api/v1/users/:id`**
* **Authentication:** User [Self] or District Admin.
* **Request:** `{ "phone": "+91...", "blood_group": "O+" }`
* **Validation:** Cannot update own `role` or `club_id`.
* **Response (200):** Updated User object.

---

### 3. Clubs
**`GET /api/v1/clubs`**
* **Authentication:** None (Public access for Showcase).
* **Query Params:** `status=ACTIVE`, `sort=name`.
* **Response (200):** Array of Club objects.

**`POST /api/v1/clubs`**
* **Authentication:** District Admin only.
* **Request:** `{ "name": "Rotaract Club of XYZ", "charter_date": "YYYY-MM-DD" }`
* **Response (201):** Created Club object.

---

### 4. Activities (Events & Projects)
**`POST /api/v1/activities`**
* **Authentication:** President, Secretary, BoD.
* **Request:** `{ "title": "Beach Cleanup", "start_time": "ISO8601", "type": "COMMUNITY_SERVICE" }`
* **Validation:** `start_time` must be in the future for published events.
* **Response (201):** Created Activity object.

**`GET /api/v1/activities/:id/registrations`**
* **Authentication:** Event Owner (Club) or District Team.
* **Query Params:** `status`, `page`, `limit`.
* **Response (200):** Array of Registration records.

---

### 5. Club Operations

This specific module handles Rotaract reporting entities required by District 3192.

**`POST /api/v1/operations/meetings`**
* **Authentication:** Secretary, President.
* **Request:** `{ "club_id": "uuid", "date": "ISO8601", "minutes_text": "...", "attendees_count": 45 }`
* **Response (201):** Meeting Minutes record.

**`POST /api/v1/operations/installations`**
* **Authentication:** Secretary, President.
* **Request:** `{ "club_id": "uuid", "date": "ISO8601", "venue": "...", "incoming_president_id": "uuid" }`
* **Response (201):** Installation record.

**`POST /api/v1/operations/orientations`**
* **Authentication:** Secretary, President.
* **Request:** `{ "club_id": "uuid", "speaker_name": "...", "new_members_inducted": 15 }`
* **Response (201):** Orientation record.

**`POST /api/v1/operations/dov`** (District Official Visits)
* **Authentication:** District Team only.
* **Request:** `{ "club_id": "uuid", "visiting_official_id": "uuid", "date": "ISO8601", "evaluation_score": 85, "remarks": "..." }`
* **Response (201):** DOV record.

---

### 6. Leaderboards
**`GET /api/v1/leaderboards/clubs`**
* **Authentication:** None (Public Showcase).
* **Query Params:** `year=2026`, `limit=10`.
* **Response (200):** Sorted array of Clubs with calculated total points.
* **Cache Strategy:** Returns `Cache-Control: max-age=300` (5 minutes) as this relies on a materialised view.

---

### 7. Publications
**`GET /api/v1/publications`**
* **Authentication:** None (Public).
* **Query Params:** `type=NEWSLETTER|BULLETIN`, `club_id`.
* **Response (200):** Array of Publication metadata objects (includes PDF presigned URLs).

**`POST /api/v1/publications`**
* **Authentication:** Publication Team, Secretary, President.
* **Request:** FormData (File upload) + `{ "title": "July Bulletin", "type": "NEWSLETTER" }`
* **Response (201):** `{ "url": "https://spaces...", "id": "uuid" }`

---

### 8. Notifications & Webhooks

**`POST /api/v1/webhooks/razorpay`**
* **Authentication:** Razorpay Signature Verification header (`x-razorpay-signature`).
* **Request:** Razorpay Event Payload (`payment.captured`).
* **Response (200):** Synchronous success acknowledgment. Async processing handles DB writes.

**`POST /api/v1/notifications/broadcast`**
* **Authentication:** District Admin, District Team.
* **Request:** `{ "target_audience": "ALL_PRESIDENTS", "message": "Please submit your monthly reports.", "channel": ["WHATSAPP", "EMAIL"] }`
* **Response (202 Accepted):** `{ "job_id": "uuid" }` (Processed asynchronously).

---

### 9. Administration & Analytics

**`GET /api/v1/analytics/district-summary`**
* **Authentication:** Reporting Team, District Admin.
* **Query Params:** `start_date`, `end_date`.
* **Response (200):** `{ "total_clubs": 110, "total_members": 20450, "total_projects": 450, "total_funds_raised": 500000 }`

**`POST /api/v1/admin/export/:resource`**
* **Authentication:** Reporting Team, District Admin.
* **Path Variable:** `:resource` = `users`, `activities`, `payments`.
* **Request:** `{ "filters": { ... } }`
* **Response (202 Accepted):** Job queued. Returns `{ "status_url": "/api/v1/admin/export/jobs/:id" }`. 
* **Note:** Bulk exports are generated via background workers and saved to DO Spaces/Supabase Storage. The user receives an email with the download link when complete.

---

## Future Considerations

### Edge Functions
* To reduce latency for global reads on the **Leaderboard** and **Public Showcase**, `GET /api/v1/clubs` and `GET /api/v1/leaderboards` can be migrated to **Supabase Edge Functions**.
* **Benefit:** Edge Functions cache the response at CDN nodes worldwide, reducing load on the primary PostgreSQL database in DigitalOcean.

### Real-time Subscriptions
* Leveraging Supabase's native real-time capabilities via websockets for the **Leaderboards** and **Notifications**. Instead of clients polling `GET /api/v1/notifications`, they subscribe to the `notifications` table changes.

---
*This document defines the strict API contracts for frontend-backend communication. Proceed to L9 for the Storage Architecture outlining bucket hierarchies and CDNs.*
