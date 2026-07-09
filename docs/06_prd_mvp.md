# Product Requirements Document — Rollout OS

**MVP · Version 1.0 — Ready for Development**
Overview · Users & Principles · Scope & Modules · Behavior & Rules · Quality & Delivery

An operational workspace for enterprise rollouts — covering the period between project initiation and transition into Business as Usual.

> "The MVP is complete when a consultant can run an entire rollout inside the product — without external spreadsheets or PowerPoint for operational coordination."

---

## Contents

Twenty requirement sections, grouped into five parts.

- **Part I — Product Overview:** 1 Executive Summary · 2 Problem · 3 Goals · 4 Non-Goals
- **Part II — Users & Principles:** 5 Target Users · 6 Product Principles
- **Part III — Scope & Modules:** 7 MVP Modules · 8 Functional Requirements
- **Part IV — Behavior, Rules & Data:** 9 Experience Profiles · 10 Functional Rules · 11 Health · 12 Readiness · 13 Search · 14 Notifications · 15 Security
- **Part V — Quality & Delivery:** 16 Performance · 17 Success Metrics · 18 Release Plan · 19 Future Scope · 20 Acceptance Criteria

---

## Part I — Product Overview

_What Rollout OS is, the problem it solves, and the boundaries of the first release._

### 01 — Executive Summary

Rollout OS is an operational workspace designed specifically for enterprise rollouts. Unlike project management platforms, it focuses on the period between **project initiation** and **transition into BAU** — centralizing execution, knowledge, coordination, reporting, and leadership visibility into one structured workspace. The MVP validates this operational model using a real enterprise rollout while remaining customer-independent.

### 02 — Problem Statement

Enterprise rollouts are fragmented across many systems. Teams use different tools for tasks, documents, meetings, risks, communication, and reporting.

From fragmentation to one workspace: `Tasks · Documents · Meetings · Risks · Communication · Reporting → merge → Rollout OS (one operational workspace)`

The consequences: the rollout owner becomes the only person who understands the whole picture, leadership depends on manual updates, and context is lost when people leave. Rollout OS solves this by becoming _the_ operational workspace for the rollout.

### 03 — Goals

The MVP should enable users to:

- Create & manage one rollout
- Organize by Programme & Workstream
- Track Milestones & Tasks
- Record Risks, Issues & Decisions
- Maintain rollout knowledge
- Generate operational reports
- Provide leadership visibility
- Support clean BAU transition

### 04 — Non-Goals

Explicitly out of scope for the MVP:

AI · Portfolio Management · Predictive Analytics · Automatic Health Calculation · Automatic Readiness · Budget Management · Resource Planning · Scrum Management · Time Tracking · Sprint Velocity · Gantt Engine · OKRs · KPIs.

---

## Part II — Users & Principles

_Who the product serves, and the beliefs that shape every decision._

### 05 — Target Users

**Primary**

- Product Manager
- Programme Manager
- Delivery Manager
- Consultant
- PMO

**Secondary**

- Executive Sponsor
- Client Stakeholder
- Engineering Lead

### 06 — Product Principles

1. Manual before Automation
2. One Operational Workspace
3. Context before Tasks
4. Reports are Generated
5. Experience changes, not Data
6. Opinionated Defaults
7. Simplicity over Configuration

---

## Part III — Scope & Modules

_The eight modules of the MVP and the specification each one must carry._

### 07 — MVP Modules

**Overview — Operational Command Center**
Rollout Summary · Progress · Health (manual) · Readiness (manual) · Milestones · Activity Feed.

**Programs**
Create Programme · Edit Programme · Archive Programme · Programme Dashboard.

**Workstreams**
Create Workstream · Assign Owner · Link Milestones · Track Progress.

**Operations**

| Entity           | Capabilities                                     |
| ---------------- | ------------------------------------------------ |
| **Tasks**        | CRUD · Assignment · Status · Priority · Due Date |
| **Milestones**   | CRUD · Status · Dates · Dependencies             |
| **Risks**        | CRUD · Owner · Probability · Impact · Mitigation |
| **Issues**       | CRUD · Priority · Status · Resolution            |
| **Decisions**    | CRUD · Approver · Decision Date · Reason         |
| **Action Items** | CRUD · Convert to Task                           |

**Knowledge**

| Entity        | Capabilities                                        |
| ------------- | --------------------------------------------------- |
| **Documents** | Reference Link · Type · Tags · Version              |
| **Meetings**  | Agenda · Notes · Participants · Actions · Decisions |
| **Notes**     | Simple Markdown                                     |
| **Updates**   | Weekly · Executive · Daily                          |

**Timeline**
Milestone Calendar · Phase Timeline · Go Live Marker · Hypercare.

**Reports**
Executive Report · Weekly Report · Risk Report · Readiness Report.

**Administration**
Users · Teams · Permissions · Templates · Settings.

### 08 — Functional Requirements

Every module specification must contain the following eight sections:

Purpose · Actors · Permissions · Fields · Relationships · Validation Rules · Business Rules · Acceptance Criteria.

---

## Part IV — Behavior, Rules & Data

_How the product behaves per role, the rules that hold data together, and the system-wide surfaces._

### 09 — Experience Profiles

Five profiles. Each defines a Landing Page, Navigation, Permissions, Visible Modules, and Default Reports:

Executive · Programme Manager · Engineering · Consultant · Client.

### 10 — Functional Rules

1. Everything belongs to one Rollout.
2. Every Workstream belongs to one Programme.
3. Every Milestone belongs to one Workstream.
4. Every Task belongs to one Milestone.
5. Every Risk has an Owner.
6. Every Meeting should create a Decision, an Action Item, or an Update.

### 11 — Health (Manual)

`Green · Amber · Red`

### 12 — Readiness (Manual)

`Not Started · In Progress · Ready`

### 13 — Search

Global search supports: Tasks · Meetings · Documents · Risks · Stakeholders · Programs · Workstreams · Updates.

### 14 — Notifications

Task Assigned · Task Due · Risk Updated · Meeting Reminder · Milestone Due · Go Live Reminder.

### 15 — Security

Role-based permissions. **Experience Profiles determine the interface; permissions determine the actions.**

---

## Part V — Quality & Delivery

_Performance targets, success measures, the phased release plan, and the bar for "done"._

### 16 — Performance

| Interaction | Target      |
| ----------- | ----------- |
| Dashboard   | < 2 seconds |
| Search      | < 1 second  |
| Task Update | Immediate   |

### 17 — Success Metrics

Rollouts Created · Active Users · Tasks Managed · Meetings Recorded · Risks Logged · Reports Generated · Manual Status Meetings Reduced.

### 18 — Release Plan

Four-release roadmap:

- **Release 1 — Foundation:** Organization · Rollout · Programs · Workstreams
- **Release 2 — Operations:** Tasks · Milestones · Risks · Issues · Decisions
- **Release 3 — Knowledge:** Documents · Meetings · Notes · Updates
- **Release 4 — Reports & Access:** Reports · Timeline · Permissions · Experience Profiles

### 19 — Future Scope

Deferred beyond the MVP:

Portfolio · AI · Operational Intelligence · Readiness Engine · Health Engine · Cross-Rollout Analytics · Budget · OKRs · KPIs · Predictive Analytics.

### 20 — Acceptance Criteria

The MVP is complete when a consultant can run an entire rollout inside the product.

**The consultant journey — create to archive:**

`Create Organization → Create Rollout → Define Programmes → Create Workstreams → Plan Milestones → Assign Tasks → Record Risks → Capture Decisions → Maintain Documentation → Generate Reports → Track Progress → Share Exec Status → Complete Rollout → Archive Rollout`

…without relying on external spreadsheets or PowerPoint for operational coordination.

> **Definition of Done.** The MVP is complete when a consultant can create an organization and rollout, plan and execute the work, capture risks, decisions, and knowledge, generate reports, share executive status, and cleanly **complete and archive the rollout** — entirely inside Rollout OS.
