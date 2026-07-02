# Relationship Diagram
### Rotaract District 3192 Web Portal

This document visualizes the database relationships across the newly expanded modules for Sprint 2.2.

## Global Entity-Relationship Diagram

```mermaid
erDiagram
    %% Organization Module
    districts ||--o{ clubs : "has"
    
    %% Identity Module
    clubs ||--o{ member_profiles : "contains"
    member_profiles ||--o{ member_roles : "assigned"
    
    %% Activities Module
    clubs ||--o{ activities : "hosts"
    activities ||--o{ registrations : "receives"
    member_profiles ||--o{ registrations : "submits"
    
    %% Operations (Phase 2 Reporting)
    clubs ||--o{ meetings : "conducts"
    clubs ||--o{ orientations : "holds"
    clubs ||--o{ installations : "hosts"
    clubs ||--o{ dovs : "evaluated via"
    
    member_profiles ||--o{ dovs : "evaluates (Official)"
    member_profiles ||--o{ installations : "incoming pres"

    %% Leaderboard & System
    clubs ||--o{ point_ledgers : "earns"
    member_profiles ||--o{ point_ledgers : "awarded to"
    
    %% Website & Showcase
    clubs ||--o| club_website_configs : "customizes"
    activities ||--o| showcase_features : "promoted on"
```

## Module Dependencies Graph

```mermaid
flowchart TD
    Org[Organization] --> Ident[Identity]
    Org --> Web[Website Builder]
    
    Ident --> Ops[Club Operations: Meetings, DOVs, Orientations]
    Org --> Ops
    
    Org --> Act[Activities]
    Ident --> Act
    
    Act --> Show[Public Showcase]
    
    Ops --> AI[AI Module (Transcripts)]
    Ops --> Lead[Leaderboards]
    Act --> Lead
    
    Sys[System] --> Notif[Notifications]
    Sys --> Analytics[Analytics]
    Sys --> Admin[Administration / Audit]
```

## Bounded Context Boundaries

* **Operations Bounded Context:** Encompasses `meetings`, `orientations`, `installations`, and `dovs`. All of these strictly depend on a `club_id`.
* **Identity Bounded Context:** `member_profiles` relies directly on a Supabase Auth `user_id`. Everything revolves around this profile.
* **Analytics & System Bounded Context:** `analytics_events` and `audit_logs` are isolated ledgers that reference other entities globally but are never directly mutated by standard business logic (append-only).
