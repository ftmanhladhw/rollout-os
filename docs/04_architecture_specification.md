# Architecture Specification — Rollout OS

**Version:** 1.0
Domain Model · Operational Models · Experience Architecture · Technical Foundation

The operational workspace for delivering enterprise rollouts — from initiation through transition into business as usual.

> "An operational layer that sits above execution — connecting people, work, knowledge, decisions, and leadership into a single operational workspace."

---

## Contents

Five parts, from philosophy to technical foundation.

- **Part I — Foundations:** Product Philosophy · Design Principles
- **Part II — Domain Model:** Core Entities · Phase · RAID & Governance · Knowledge · People · Entity Relationships
- **Part III — Operational Models:** Lifecycle · Roll-up · Health · Readiness · Phase
- **Part IV — Experience Architecture:** Experience Profiles · Permission Model
- **Part V — Technical Foundation:** Universal Metadata · Domain Rules · Future Extensions

---

## Part I — Foundations

_What Rollout OS is, what it is not, and the principles every design decision must satisfy._

### Product Philosophy

Rollout OS is **not** a project management platform. It is **not** a document repository. It is **not** an engineering tool.

It is the **operational workspace** used to successfully deliver enterprise rollouts from initiation through transition into business as usual. Everything in the product should contribute toward that objective.

### Design Principles

Every design decision must satisfy the following five principles.

**01 — One Source of Operational Truth**
Rollout OS becomes the operational workspace for the rollout. Information may originate elsewhere, but _operational understanding exists here_.

**02 — Context before Activity**
Tasks without context have little meaning. Every piece of work should connect back through the context chain:

`Business Goal → Programme → Workstream → Milestone → Task`

**03 — Rollouts are Temporary**
Every rollout has a beginning and an end. The product should encourage **clean transitions** instead of permanent dependency.

**04 — Simplicity over Configuration**
Opinionated workflows are preferred over unlimited customization.

**05 — Leadership Needs Understanding**
Executives should understand a rollout within _minutes_ — not after reading hundreds of tasks.

---

## Part II — Domain Model

_The entities and relationships that make up a rollout. The domain model is customer-independent and never changes based on who logs in._

### Structural Backbone

| Entity           | Definition                                                                             | Examples                                              |
| ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Organization** | The customer or organization responsible for the rollout. One org owns many rollouts.  | Amazon · Government · Enterprise · NGO                |
| **Rollout**      | The primary operational workspace. Every operational object belongs to one rollout.    | —                                                     |
| **Programme**    | A major business objective.                                                            | Food Security · Infrastructure · Training · Migration |
| **Workstream**   | Groups operational work.                                                               | Engineering · QA · DevOps · Product · Data Migration  |
| **Milestone**    | A major checkpoint.                                                                    | Requirements Approved · Go Live · Training Complete   |
| **Task**         | The smallest executable unit. Belongs to Rollout → Programme → Workstream → Milestone. | —                                                     |

### Phase — A Cross-Cutting Dimension

Phases are **not hierarchical**. Every operational entity _may reference_ one phase, enabling lifecycle views that cut across the structural hierarchy.

The eight default phases:

`Discovery → Planning → Build → Testing → UAT → Go Live → Hypercare → Closure`

### RAID & Governance

| Entity          | Definition                                                                    |
| --------------- | ----------------------------------------------------------------------------- |
| **Issue**       | An existing problem.                                                          |
| **Risk**        | A potential future problem. Every risk has an owner.                          |
| **Dependency**  | A relationship between operational entities.                                  |
| **Decision**    | A permanent record of an approved decision. References the entity it affects. |
| **Action Item** | Meeting-generated work. May become Tasks.                                     |

### Knowledge, Communication & People

| Entity          | Definition                                                         |
| --------------- | ------------------------------------------------------------------ |
| **Meeting**     | Captures participants, summary, recording, decisions, and actions. |
| **Document**    | Metadata + external reference — referenced, never duplicated.      |
| **Deliverable** | A physical output.                                                 |
| **Update**      | A communication.                                                   |
| **Note**        | Lightweight context.                                               |
| **Stakeholder** | Any individual participating in the rollout.                       |
| **Team**        | A logical group.                                                   |
| **Partner**     | An external organization.                                          |
| **User**        | An authentication identity.                                        |

### Document Types

PRD · Architecture · Design · Meeting Notes · KT · Recording · Presentation · Spreadsheet · Release Notes · Contract · Other

### Entity Relationships

The Rollout entity map, grouped by category:

- **Structure:** Organization → Rollout → Programme → Workstream → Milestone
- **Execution:** Task · Deliverable · Decision · Dependency
- **Knowledge:** Meeting · Document · Update (attach at workstream level)
- **Risk / Issue:** Issue · Risk
- **Cross-cutting:** Phase (references the Rollout dimension)
- **People:** Stakeholder · Team · Partner (associated with the Rollout)

---

## Part III — Operational Models

_How work moves, aggregates, and is measured across the rollout._

### Lifecycle Model

Every operational entity moves through a consistent lifecycle:

`Draft → Planned → In Progress → Blocked → Completed → Archived`

### Roll-up Model

**Progress flows upward.** Completion at the task level aggregates all the way to the rollout:

`Task → Milestone → Workstream → Programme → Rollout`

### Health Model

> **Health ≠ Progress.** A rollout can be 84% complete and still be Amber.

Progress measures _how much is done_. Health measures _whether it is on track_. The two are reported independently.

### Readiness Model

Readiness is assessed across independent dimensions that combine into an overall score:

Engineering · Documentation · Data · Security · Training · Partner · Go Live → **Overall Readiness**

### Phase Model

Phase exists independently of the hierarchy and enables cross-cutting views such as: all Hypercare Tasks · Build Documents · Testing Meetings · Go Live Risks · Planning Deliverables.

---

## Part IV — Experience Architecture

_The domain model never changes based on who logs in. Only the experience changes._

> **Governing principle: One domain. Many experiences.**

### Experience Profiles

An Experience Profile controls the landing page, navigation, widgets, visible & editable modules, default filters, AI behavior, reports, notifications, and permissions. **It does not create separate data models.**

One model · five experiences:

| Profile                         | Focus                                                                                                          | Default Landing            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Executive**                   | Rollout Health · Programme Status · Readiness · Risks · Decisions · Executive Briefs                           | Executive Dashboard        |
| **Programme / Product Manager** | Programmes · Workstreams · Milestones · Risks · Dependencies · Meetings · Decisions · Reports                  | Rollout Overview           |
| **Engineering**                 | Assigned Tasks · Issues · Technical Risks · Deliverables · Build Progress                                      | My Work                    |
| **Consultant / PMO**            | Full operational visibility — RAID · Meetings · Decisions · Readiness · AI Insights · Reports · Administration | Operational Command Center |
| **Client / Stakeholder**        | Rollout Progress · Timeline · Deliverables · Upcoming Milestones · Executive Updates                           | —                          |

**Client / Stakeholder — hidden:** Internal discussions · Internal decisions · Technical implementation details · Internal risks (where appropriate).

### Permission Model

| Layer                   | Responsibility                                            |
| ----------------------- | --------------------------------------------------------- |
| **Permissions**         | Define what a user _can do_.                              |
| **Experience Profiles** | Define _how the product behaves_.                         |
| **RBAC**                | An implementation detail underneath the experience layer. |

---

## Part V — Technical Foundation

_The metadata, rules, and forward-looking extensions that hold the model together._

### Universal Metadata

Every entity includes the following fields:

ID · Name · Description · Status · Owner · Priority · Visibility · Tags · Phase · Created By · Created Date · Updated By · Updated Date

### Domain Rules

1. Every entity belongs to one Rollout.
2. Every Workstream belongs to one Programme.
3. Every Milestone belongs to one Workstream.
4. Every Task contributes to one Milestone.
5. Phase is a reporting dimension, not a hierarchy.
6. Every Risk has an owner.
7. Every Decision references the entity it affects.
8. Meetings should generate Decisions, Action Items, or Updates.
9. Documents are referenced rather than duplicated.
10. The model must remain customer-independent.

### Future Domain Extensions

| Portfolio Management                                    | Business Performance                                                                    | Enterprise Operations                                                                             | Intelligence                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Portfolio · Multiple Rollouts · Cross-Rollout Analytics | Objectives · Key Results (OKRs) · Success Metrics · KPI Tracking · Benefits Realization | Budget Management · Resource Planning · Change Requests · Vendor Performance · Audit & Compliance | Predictive Analytics · AI Forecasting · Templates & Playbooks · Lessons Learned |

> **Closing principle.** Rollout OS does not compete with project management tools. It defines a **new operational layer** that sits above execution — connecting people, work, knowledge, decisions, and leadership into a single operational workspace for enterprise rollouts.
