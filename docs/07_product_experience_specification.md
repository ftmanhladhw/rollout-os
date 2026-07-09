# Product Experience (UX) Specification — Rollout OS

**Version:** 1.0
**Status:** UX Specification — Foundational
**Companion documents:** [04 Architecture Specification](./04_architecture_specification.md) · [05 Information Architecture](./05_information_architecture.md) · [06 PRD (MVP)](./06_prd_mvp.md) · [08 Design System](./08_design_system.md)

---

## A note on where we start

This is a UX specification, but it does **not** begin by designing screens.

Most products fail here. They start with wireframes, generate screen after screen, and end up as a collection of pages that never add up to a coherent whole. We start one level up — with the **operating model** and the **mental model** the product must install in a user's head.

The products that win — Linear, Notion, Figma, GitHub — succeed because each has _one incredibly strong mental model_. A user learns it once and everything else follows. Rollout OS needs the same. This document defines that model first, then derives navigation, screens, interactions, and visual language from it.

Screens are the _last_ thing in this spec, not the first. Pixel-level tokens (grid, spacing, type, components) are deliberately deferred to [08 Design System](./08_design_system.md) — see [The next artifact](#the-next-artifact).

---

## Chapter 1 — The UX Philosophy: One Rollout. One Home.

When someone logs in, they should never ask **"Where do I go?"**

They land in exactly one place:

`Organization → Rollout → Command Center`

Selecting a rollout opens its **Command Center**. From that moment, everything revolves around the selected rollout.

**The Command Center is not a dashboard. It is Mission Control.** It is the operational cockpit a consultant opens every morning to understand the whole rollout in one glance. Every other screen in the product is simply _another perspective of the same rollout_ — never a separate destination with its own data.

> **Decision — adopt "Command Center" as the landing name.** The landing page is named **Command Center**, not "Overview." This is the single most important naming decision in the product: when a consultant starts their day they don't think "I'll open the Overview" — they think "I'll open Mission Control." This aligns with the [Architecture Specification](./04_architecture_specification.md), which already names the Consultant / PMO default landing the _Operational Command Center_. ("Overview" remains acceptable as the internal module identifier.)

---

## Chapter 2 — UX Principles

### Principle 1 — The Rollout is the product

Not Tasks. Not Documents. Not Meetings. **Everything begins from the rollout.**

`Amazon CSR → Everything`

Every entity in the product exists _inside_ a rollout and is understood _through_ it. There is no global task list, no orphaned document library, no meeting archive that stands on its own. This is the direct UX expression of the domain rule _"every entity belongs to one Rollout."_

### Principle 2 — Progressive Disclosure

The interface reveals information gradually, shaped by who is looking.

- Executives shouldn't see Tasks.
- Engineers shouldn't see Executive Reports.
- Consultants shouldn't lose context.

This is delivered through the five **Experience Profiles** (see [Chapter 10](#chapter-10--experience-profiles-mapped-to-ux)). The data model never changes based on who logs in — **only the experience changes**. Permissions decide what a user _can do_; the Experience Profile decides _what they see first and how much_.

### Principle 3 — Never Open an Empty Screen

Every page must immediately answer: **"What should I do next?"**

An empty screen is a dead end. A well-designed empty state is an invitation.

| ❌ Don't             | ✅ Do                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Tasks** — No tasks | **Tasks** — You haven't created any tasks yet. → _Create your first task_ · _Import from CSV_ · _Create from template_ |

Empty states are a first-class part of the design, not an afterthought (see [Chapter 7](#chapter-7--states)).

### Principle 4 — Every screen answers one question

Each primary screen has exactly one job. If a screen tries to answer two questions, it becomes a dashboard — and dashboards are where clarity goes to die.

| Screen         | The one question it answers |
| -------------- | --------------------------- |
| Command Center | What is happening?          |
| Programs       | What are we delivering?     |
| Workstreams    | Who is doing the work?      |
| Operations     | What needs attention?       |
| Knowledge      | What do we know?            |
| Timeline       | When is it happening?       |
| Reports        | What should we communicate? |

### Interaction principles

These apply to _every_ screen, without exception:

1. **Three clicks maximum** to reach anything.
2. **Every entity has a Detail Page** with the same layout everywhere.
3. **Never use modal windows for complex work** — open full pages.
4. **Use drawers only for quick edits.**
5. **Everything editable inline.**
6. **Autosave everything** — no Save buttons.
7. **Universal Command Palette** (`⌘K`) — search, navigate, create, assign, open.

---

## Chapter 3 — Navigation

Navigation is kept **extremely small**. Seven lifecycle destinations, and nothing else:

`Command Center · Programs · Workstreams · Operations · Knowledge · Timeline · Reports`

Nothing else lives in the primary navigation. This matches the [Information Architecture](./05_information_architecture.md) rule _"navigation follows the rollout lifecycle, not the database."_

> **Decision — Administration is not in the primary navigation.** Admin (Users · Teams · Permissions · Templates · Settings) exists but is a separate, authorized-access area reached from an account/settings entry — never a lifecycle destination. This follows the IA, where Administration is "visible only to authorized users." Keeping it out of the main nav protects the "seven destinations, nothing else" clarity for the people running the rollout day to day.

---

## Chapter 4 — Screen Specifications

Each screen below is a _perspective of the rollout_. None owns its own data; all read from the single operational dataset.

### Command Center — Mission Control

The daily landing page. Goal: **understand the entire rollout in one page, no scrolling if at all possible.**

**Header strip (the vital signs):**

| Health | Progress | Readiness   | Go Live |
| ------ | -------- | ----------- | ------- |
| Amber  | 67%      | In Progress | 28 Aug  |

Health and Readiness are **manual** fields in the MVP (Green / Amber / Red; Not Started / In Progress / Ready), per the PRD.

**Body sections (in priority order):**

- **Programs** — each with its own health (e.g. Food Security, Enterprise).
- **Upcoming Milestones**
- **Open Risks**
- **Recent Decisions**
- **Recent Activity**

**The morning-cockpit view.** When a consultant opens Rollout OS each morning, the Command Center should surface:

- Rollout Health
- What changed yesterday _(manual activity feed in MVP; AI-generated "what changed since the last cycle" is a **Phase-2** enhancement per the IA roadmap)_
- Today's milestones
- Blockers requiring attention
- Decisions awaiting approval
- Upcoming meetings
- Go-live countdown

That is not a dashboard. That is the operational cockpit of the rollout.

### Program screen

Answers _"What are we delivering?"_ Structure:

`Program → Overview → Workstreams → Milestones → Timeline → Reports`

### Workstream screen

Answers _"Who is doing the work?"_ A workstream (e.g. Engineering) contains:

`Overview → Tasks → Milestones → Issues → Risks → Documents → Meetings`

### Operations screen

The **daily workspace** — answers _"What needs attention?"_ A single screen with tabs:

`Tasks · Milestones · Risks · Issues · Dependencies · Decisions · Action Items`

### Knowledge screen

Answers _"What do we know?"_ Contains only:

`Documents · Meetings · Notes · Updates`

Nothing else. Documents are **referenced, never duplicated**.

### Timeline screen

Answers _"When is it happening?"_ Think Linear: simple, fast. Organized by the rollout phases:

`Discovery · Planning · Build · Testing · UAT · Go Live · Hypercare · Closure`

_(The user-facing timeline emphasizes Discovery → Hypercare; **Closure** is included to complete the lifecycle, matching the Architecture Specification's eight default phases and the "temporary by design → archive" principle.)_

### Reports screen

Answers _"What should we communicate?"_ Not 100 report types — just four:

`Executive · Weekly · Risk · Readiness`

Reports are **generated from operational data, never maintained by hand**.

### Detail pages (universal template)

Every entity — Task, Risk, Decision, Milestone, Meeting, Document — opens the same-shaped detail page. Example for a Task:

`Title · Status · Owner · Priority · Related Milestone · Comments · History`

**Same layout everywhere.** A user who learns one detail page has learned them all.

---

## Chapter 5 — The Interaction System

### Tables

Every table behaves **identically**, everywhere, with no exceptions. All tables support:

`Search · Filter · Sort · Group · Bulk Edit · Export · Column Picker`

### Forms

Every form has the same structure:

`Header · Body · Relationships · History`

### Editing model

- **Inline editing** is the default.
- **Autosave** always — there are no Save buttons.
- **Drawers** are for quick edits only.
- **Full pages** for any complex work; **never modals** for it.

### Command palette (`⌘K`)

One universal palette across the whole product to **search everything, navigate, create, assign, and open**. Keyboard-first, in the spirit of Linear and Slack. It is the fastest path to the "three clicks maximum" guarantee — often zero clicks.

---

## Chapter 6 — Visual Language

Color carries **meaning, never decoration.** Reserve it strictly:

| Color     | Meaning         |
| --------- | --------------- |
| **Green** | Healthy         |
| **Amber** | Needs attention |
| **Red**   | Critical        |
| **Blue**  | Information     |
| **Grey**  | Archived        |

Nothing else. This semantic palette maps directly onto the manual Health field (Green / Amber / Red) and the archived lifecycle state.

> The complete visual system — grid, spacing, typography, component specs, iconography, badges — is defined in [08 Design System](./08_design_system.md). This chapter fixes the _semantics_; the Design System fixes the _tokens_.

---

## Chapter 7 — States

Every screen must design its non-happy states as deliberately as its happy path.

**Empty states** — never say _"No data."_ Always:

1. Explain **why** it's empty.
2. Explain **what it means**.
3. Offer **what to do next** (with concrete actions — create, import, use a template).

**Loading states** — show structure (skeletons), not spinners, so the shape of the page is predictable before data arrives.

**Error states** — say what happened, why, and the single next action to recover. Never a dead end.

---

## Chapter 8 — Mobile

Mobile is for **consumption, not administration.**

People check, on the go:

`Status · Tasks · Reports · Notifications`

They do **not** configure rollouts, plan programmes, or administer users on mobile. Desktop remains primary for administration, planning, and configuration (per the IA mobile strategy).

---

## Chapter 9 — Design Language & Inspiration

Rollout OS should feel like it belongs to this family:

| Source     | What we borrow                        |
| ---------- | ------------------------------------- |
| **Linear** | Speed and keyboard-first interactions |
| **Notion** | Information density and hierarchy     |
| **GitHub** | Detail pages and activity history     |
| **Figma**  | Clean navigation                      |
| **Slack**  | The command palette                   |

**Explicitly not Jira** — configuration-heavy, slow, and organized around the database rather than the work.

---

## Chapter 10 — Experience Profiles mapped to UX

Progressive disclosure (Principle 2) is delivered through five profiles. Same rollout, same data — different first screen and different visible depth.

| Profile                         | Lands on       | Sees / focuses on                                                                       | Hidden / de-emphasized                                            |
| ------------------------------- | -------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Executive**                   | Command Center | Health · Progress · Readiness · Risks · Decisions · Executive briefs                    | Individual tasks, technical detail                                |
| **Product / Programme Manager** | Command Center | Full rollout management — Programmes · Workstreams · Milestones · Reports               | —                                                                 |
| **Engineering**                 | Operations     | Assigned Tasks · Issues · Technical Risks · Deliverables · Dependencies                 | Executive reports                                                 |
| **Consultant / PMO**            | Command Center | Full operational visibility — RAID · Meetings · Decisions · Readiness · Reports · Admin | —                                                                 |
| **Client / Stakeholder**        | Timeline       | Progress · Timeline · Deliverables · Upcoming milestones · Executive updates            | Internal discussions, decisions, technical detail, internal risks |

---

## The most important recommendation

Introduce one concept almost no enterprise tool has: **the landing page is Mission Control, not a dashboard.** Naming it **Command Center** — and building it as an operational cockpit rather than a widget grid — is what makes Rollout OS feel like an operating system for the rollout rather than another tracker. This decision is adopted throughout this spec (see [Chapter 1](#chapter-1--the-ux-philosophy-one-rollout-one-home) and the Command Center screen).

## The next artifact

The next document should **not** be wireframes. It should be [08 Design System](./08_design_system.md), defining:

`Grid · Spacing · Typography · Components · Tables · Cards · Navigation · Forms · Status badges · Icons · Empty states · Loading states · Error states`

Then every screen is built _from_ that system — so the product feels cohesive from day one instead of becoming a collection of individually generated pages. It is a small investment that pays off across the entire lifetime of the product.
