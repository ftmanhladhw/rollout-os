# Information Architecture — Rollout OS

**MVP · Version 1.2 (Final)** — Consolidated Final
Navigation · Modules · Cross-Cutting Views · Experience Profiles · MVP Discipline

How users navigate and interact with Rollout OS — organized around the lifecycle of an enterprise rollout, not its database.

> "Manual before automation. Structure before intelligence. An IA intentionally constrained for the first release — with clean extension points for everything that comes later."

---

## Contents

Five parts, from design philosophy to the final MVP information architecture.

- **Part I — Foundations:** What This Version Consolidates · Purpose · Design Philosophy · Navigation Philosophy
- **Part II — Navigation & Modules:** Global Navigation · Workspace Navigation · Module Architecture
- **Part III — Views & Experiences:** Cross-Cutting Views · Experience Profiles
- **Part IV — System Surfaces:** Search · Notifications · Dashboards · Mobile
- **Part V — MVP Discipline:** MVP Principles · MVP Boundaries · Implementation Philosophy · Information Principles · Future IA · Final Architecture

---

## Part I — Foundations

_What the MVP consolidates, and the philosophy that organizes every screen._

### What This Version Consolidates

The MVP folds in the following decisions from the working sessions. Nothing here is major on its own — together they align the IA tightly with the MVP philosophy.

| Type        | Change                                                                                                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RENAMED** | The Execution module becomes **Operations** — it holds more than execution (Tasks, Issues, Risks, Decisions, Dependencies, Action Items) and reinforces the "operating system for rollouts" positioning. |
| **CHANGED** | **Health** moves from an auto-calculated engine to a **manual field** — Green / Amber / Red.                                                                                                             |
| **CHANGED** | **Readiness** moves from AI/rule calculation to a **manual assessment** — Not Started / In Progress / Ready.                                                                                             |
| **REMOVED** | AI Placement / AI Capability Map · Operational Intelligence Layer · Automatic Health Engine · Automatic Readiness Engine — all deferred to Phase 2/3.                                                    |
| **ADDED**   | Product principle "Manual before Automation" and the philosophy Capture → Visualize → Automate → Predict.                                                                                                |

### 01 — Purpose

The Information Architecture defines how users navigate and interact with Rollout OS. It organizes information around the **natural lifecycle of an enterprise rollout** rather than around technical entities — and should feel intuitive to consultants, product managers, programme managers, implementation teams, and leadership.

### 02 — Design Philosophy

Every screen should help users answer one of four questions:

`Understand (What is happening?) → Plan (What needs to happen?) → Execute (What work is needed?) → Communicate (What should others know?)`

### 03 — Navigation Philosophy

Navigation follows the rollout lifecycle, not the database.

| Users think in…                                           | Not in…                    |
| --------------------------------------------------------- | -------------------------- |
| Rollouts · Programmes · Workstreams · Phases · Milestones | Tables · Records · Objects |

---

## Part II — Navigation & Modules

_From the organization down into a single rollout's operational workspace, and everything inside it._

### 04 — Global Navigation

Entry path: `Organization → Rollouts → Operational Workspace`

Selecting a rollout opens its **operational workspace**. From that point, everything revolves around the selected rollout.

### 05 — Rollout Workspace Navigation

Eight modules make up the workspace. **Operations** (renamed from _Execution_) is the operational center.

`Overview · Programs · Workstreams · Operations · Knowledge · Timeline · Reports · Admin`

### 06 — Module Architecture

**Overview — the Operations Center**
The default landing page for most users. Displays: Rollout Status · Progress · Health (manual: Green / Amber / Red) · Readiness (manual: Not Started / In Progress / Ready) · Upcoming Milestones · Recent Activity · Open Risks · Pending Decisions.

**Programs**
Program list · Programme overview · Programme progress · Related workstreams · Programme milestones.

**Workstreams**
Each workstream contains: Overview · Milestones · Tasks · Risks · Documents · Meetings · Timeline. _Examples:_ Product · Engineering · QA · DevOps · Training.

**Operations** _(renamed from Execution)_
The operational center of the rollout — daily operational management. Contains: Tasks · Milestones · Issues · Risks · Dependencies · Decisions · Action Items.

**Knowledge**
Central knowledge hub. Contains: Documents · Meetings · Notes · Updates. **Documents are referenced, never duplicated.**

**Timeline**
Rollout activities in chronological order: Phases · Milestones · Deliverables · Meetings · Go Live · Hypercare.

**Reports**
Generates: Executive Status Report · Weekly Report · Risk Report · Readiness Report. **Reports are generated from operational data, not maintained manually.**

**Administration**
Users · Teams · Permissions · Templates · Settings. Visible only to authorized users.

---

## Part III — Views & Experiences

_The same operational data, seen through many lenses — and shaped by who is looking._

### 07 — Cross-Cutting Views

Views are **filters over the same operational data**. They never duplicate it. One dataset · six lenses:

| View                | Shows                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Phase View**      | Everything grouped by phase — Discovery, Planning, Build, Testing, UAT, Go Live, Hypercare.               |
| **Workstream View** | Everything belonging to one workstream.                                                                   |
| **Person View**     | Everything assigned to a stakeholder — My Tasks, My Meetings, My Risks, My Action Items.                  |
| **Timeline View**   | Everything ordered chronologically.                                                                       |
| **Readiness View**  | Everything grouped by readiness dimension — Engineering, Documentation, Data, Training, Partner, Go Live. |
| **Risk View**       | All operational risks across the rollout.                                                                 |

### 08 — Experience Profiles

All users interact with the same rollout. **Permissions and role change the experience, not the data.**

| Profile                         | Focus                                                                          | Landing Page |
| ------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| **Executive**                   | Health · Progress · Readiness · Risks · Decisions                              | Overview     |
| **Product / Programme Manager** | Full rollout management · Programmes · Workstreams · Milestones · Reports      | Overview     |
| **Engineering**                 | Tasks · Issues · Deliverables · Dependencies                                   | Operations   |
| **Consultant / PMO**            | Full operational visibility                                                    | Overview     |
| **Client / Stakeholder**        | Timeline · Deliverables · Programme Status · Reports (internal details hidden) | —            |

---

## Part IV — System Surfaces

_The connective surfaces that span every module — finding, alerting, assembling, and consuming._

### 09 — Search

Global search across: Programmes · Workstreams · Tasks · Meetings · Documents · Risks · Stakeholders · Decisions · Updates.

### 10 — Notifications

Categories: Task Assignment · Overdue Work · Risk Updates · Meeting Reminders · Milestone Due · Go Live Alerts.

### 11 — Dashboard Architecture

Dashboards are assembled from reusable widgets: Rollout Health · Progress · Readiness · Upcoming Milestones · Risks · Decisions · Activity Feed · My Tasks.

### 12 — Mobile Strategy

Mobile focuses on **operational consumption**. Desktop remains primary for administration and planning.

| Supported on mobile                                                                        | Primary on desktop                        |
| ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| View dashboards · Update tasks · Read reports · Respond to notifications · Review meetings | Administration · Planning · Configuration |

---

## Part V — MVP Discipline

_The constraints that keep the first release focused — manual before automation, structure before intelligence._

### 13 — MVP Principles

- **Manual before Automation** — Every workflow must function perfectly without AI. Automation only replaces workflows that have already been validated.
- **Configuration before Intelligence** — Users define the rollout; the product understands it later.
- **Structure before Visualization** — Reliable operational data is worth more than sophisticated dashboards. Visualization always builds on structured information.
- **Opinionated Defaults** — The product provides recommended rollout structures rather than unlimited configuration.

### 14 — MVP Boundaries

The following are intentionally excluded from the MVP:

Operational Intelligence · AI Summaries · Automatic Readiness · Automatic Health · Portfolio Management · Cross-Rollout Analytics · Predictive Reporting · OKRs & KPIs.

> **On Health & Readiness.** Both ship as **manual fields** in the MVP. This is faster to build, lets the team observe how users actually assess health, and produces the real data needed to automate Health, Readiness, and the Operational Intelligence layer later. _Manual first, automation second._

### 15 — Implementation Philosophy

Capture reliable data first, then layer intelligence on top of it — never the reverse.

`Capture → Visualize → Automate → Predict`

- **MVP scope:** Capture · Visualize
- **Phase 2:** Automate
- **Phase 3:** Predict

### 16 — Information Principles

1. Navigation follows the rollout lifecycle.
2. One rollout, one operational workspace.
3. Every page answers a single operational question.
4. Reports are generated, not maintained.
5. Views never duplicate data — the same data powers every view.
6. Permissions change the experience, not the underlying data model.
7. Manual workflows are preferred until validated.
8. Every screen should reduce coordination effort.

### 17 — Future Information Architecture

**Phase 2**

- Meeting Summaries
- Executive Report Generator
- Readiness Suggestions
- Risk Summaries

**Phase 3**

- Operational Intelligence
- Health Engine · Readiness Engine
- Dependency Intelligence · AI Assistant
- Portfolio Dashboard · Cross-Rollout Analytics

### Final Information Architecture (MVP) — The Buildable Tree

```
Organization
└── Rollout
    ├── Overview
    ├── Programs
    │   └── Workstreams
    ├── Operations
    │   ├── Tasks · Milestones · Issues · Risks
    │   └── Dependencies · Decisions · Action Items
    ├── Knowledge
    │   └── Documents · Meetings · Notes · Updates
    ├── Timeline
    ├── Reports
    └── Administration
```

> **Closing note.** This is the IA to hand to a design team or to Claude Code. It is focused, coherent, and intentionally constrained for an MVP — with clear extension points for future capabilities and **no over-engineering in the first release**.
