# Decision Log

**Status:** Living record

The engineering decision log for Rollout OS — the reasoning behind the load-bearing product choices, recorded as ADRs (Architecture Decision Records). Each entry captures a _decision_, not a feature: the problem that forced it, the options considered, what was chosen, what we gave up, and what it commits us to.

> **The in-app `/decisions` page is the living view.** Its content is the single source of truth (`src/app/(app)/decisions/decisions.ts`); this file mirrors it in markdown. Keep the two consistent — if one changes, change both. Reachable in the app from the account menu → **Decision log**.

Domain-agnostic by rule: no partner names, programmes, or dates are baked into the product — those are config and seed data.

---

## ADR-001 — Rollout OS is not a project-management tool

**Status:** Accepted · _Grounded in docs/02, docs/05, docs/06 §04_

- **Problem** — A rollout fragments across many systems (tasks, docs, risks, decisions, reporting). Each does its own job, but none explains the rollout as a whole, so the delivery lead becomes the only holder of the full picture. Positioning as "another task tracker" drops the product into a crowded category and invites a database-shaped architecture rather than a work-shaped one.
- **Alternatives considered** — Build on / extend an existing PM tool as a rollout template; ship a generic PM platform with rollout presets; position as portfolio/PPM software.
- **Decision** — Define a distinct category, **Enterprise Rollout Operations**: an operational workspace scoped to the window between project initiation and business-as-usual. Explicitly not Jira; generic PM, document management, and communication are declared non-goals.
- **Trade-offs** — We give up the instant familiarity of "it works like the tracker you know," and take on the cost of building category understanding. Scope is deliberately narrow — one rollout, temporary by design.
- **Why this was chosen** — The unmet need is the operational layer that explains the rollout as a whole and outlives the people who ran it, not another task list. Navigation follows the rollout lifecycle, not the database.
- **Future implications** — Everything belongs to exactly one rollout; no global task list. The primary nav is the seven lifecycle destinations, not an arrangeable board. Growth is portfolio and operational intelligence, never "more PM features."

## ADR-002 — The Command Center is the primary experience

**Status:** Accepted · _Grounded in docs/07 Ch.1 & Ch.4, docs/05 §06_

- **Problem** — On login, users should never ask "where do I go?" Status is scattered and leadership depends on hand-assembled updates. A widget-grid dashboard answers a dozen questions shallowly and none of them as "what is happening on this rollout right now?"
- **Alternatives considered** — A configurable widget dashboard; a home menu / module launcher; opening to the last-visited screen.
- **Decision** — The landing page is the **Command Center**: an opinionated operational cockpit ("Mission Control"), not a dashboard — named Command Center, not "Overview." Every other screen is a perspective of the same rollout, not a separate destination with its own data.
- **Trade-offs** — Less end-user customization of the home page; the single page must stay comprehensible in one glance; the name diverges from the "Overview/Home" convention.
- **Why this was chosen** — One rollout, one home. A single strong mental model is what makes the product feel like an operating system. A consultant thinks "I'll open Mission Control," not "the Overview." Continuous visibility replaces manual reporting.
- **Future implications** — Every other screen derives from the Command Center and reads the single operational dataset; it owns no data of its own. Experience Profiles change which screen a role lands on without changing the model.

## ADR-003 — Health and Readiness are manual in the MVP

**Status:** Accepted · _Grounded in docs/05 §14, docs/06 §11–12, docs/07 Ch.4_

- **Problem** — Health and Readiness are the headline vital signs, but auto-calculating them needs a validated model of what "healthy" and "ready" mean — which cannot exist before there is reliable operational data to learn it from.
- **Alternatives considered** — An automatic Health engine (weighted rules over tasks/risks/milestones); an AI/rule-based Readiness engine; omitting both fields until automated.
- **Decision** — Ship Health (Green / Amber / Red) and Readiness (Not Started / In Progress / Ready, per dimension) as **manual fields**, set by the delivery side and read by leadership.
- **Trade-offs** — Manual assessments can go stale or carry bias; no automatic early-warning; accuracy depends on discipline.
- **Why this was chosen** — Manual is faster to build and lets the team observe how practitioners actually judge health/readiness, producing the labelled data needed to automate later. Manual before automation: Capture → Visualize → Automate → Predict.
- **Future implications** — The manual field is a clean extension point — it becomes the training signal and output slot for Health/Readiness engines in a later phase, with no schema change.

## ADR-004 — AI is intentionally excluded from the first release

**Status:** Accepted · _Grounded in docs/05 §13, docs/06 §04 & §19, docs/03_

- **Problem** — The vision positions AI as an operational partner (summaries, risk detection, next actions). But AI over thin or unreliable data produces confident, unverifiable output, and there is no validated workflow yet for it to automate.
- **Alternatives considered** — Ship AI summaries/readiness suggestions as headline features; a thin LLM chatbot over the data; automate one narrow surface (e.g. meeting summaries) only.
- **Decision** — **No AI in the MVP.** Every workflow must function perfectly without AI first; AI is an explicit non-goal for the first release.
- **Trade-offs** — We give up the near-term "AI-powered" positioning and immediate automation of reporting/summarization; users do more by hand now.
- **Why this was chosen** — Automation should only replace workflows already validated manually — structure before intelligence. MVP scope is Capture + Visualize; Automate is Phase 2, Predict is Phase 3. AI on unproven workflows demos well and can't be trusted in use.
- **Future implications** — AI arrives as a layer on captured data, not a rewrite. Manual Health/Readiness, the activity log, and structured records become its inputs.

## ADR-005 — Experience Profiles are separate from RBAC

**Status:** Accepted · _Grounded in docs/14, docs/06 §06 & §15, docs/07 Ch.2 & Ch.10_

- **Problem** — Different roles need different views (execs shouldn't wade through tasks; engineers shouldn't see exec reports; clients shouldn't see internal risks). But "what you see" and "what you may do" are different questions — conflating them turns a UI preference into a security boundary.
- **Alternatives considered** — A single role governing both permissions and UI; permission-derived UI (hide anything you can't act on); fully custom per-user dashboards.
- **Decision** — **Three separated layers.** Layer 1: RLS for tenant isolation only (never role-aware). Layer 2: Roles → permissions — _what you can do_, checked server-side on every action/query. Layer 3: Experience Profile — _how the UI behaves_, never a security boundary; initialized from the role but independently changeable, and never consulted in a permission check.
- **Trade-offs** — Two axes to configure and reason about instead of one; the same role can present two different interfaces.
- **Why this was chosen** — Permissions define what a user can do; profiles define how the product behaves; RBAC is an implementation detail beneath the experience layer. Because the profile is never read during authorization, changing what someone sees can never change what they can do. Experience changes, not data.
- **Future implications** — An executive can be given the fuller consultant view without gaining write access, and vice versa. Profiles evolve without touching the permission matrix, which stays a static, code-reviewed constant.

## ADR-006 — Reports are generated from operational data, never hand-maintained

**Status:** Accepted · _Grounded in docs/07 Ch.4, docs/05 §16 (rule 4), docs/06 §06_

- **Problem** — Status reporting is where delivery leads lose the most time and where truth drifts furthest. A hand-maintained deck is out of date the moment it's built and quietly diverges from the real operational state.
- **Alternatives considered** — A report builder with editable documents; export to slides/spreadsheets finished by hand; point-in-time snapshots maintained separately.
- **Decision** — The four reports (Executive, Weekly, Risk, Readiness) are **pure projections generated from operational data at request time**, never maintained by hand — and there are exactly four, not a hundred report types.
- **Trade-offs** — No bespoke narrative editing inside a report; report fidelity is only as good as the underlying data discipline; the set is fixed.
- **Why this was chosen** — Status lives in exactly one place; reports are projections of it. Generating from the single source of truth keeps reports trustworthy by construction and attacks the manual-reporting overhead directly. Structure before visualization.
- **Future implications** — Reports stay correct automatically as data changes. Adding a report is adding an aggregation, not opening an authoring surface. A future executive-report generator layers on the same projection model.

## ADR-007 — Context comes before Tasks in the navigation

**Status:** Accepted · _Grounded in docs/06 §06 (principle 3), docs/05 §02, docs/07 Ch.3, `src/config/nav.ts`_

- **Problem** — New team members take weeks to understand a rollout; dropping someone straight into a task list makes them act before they understand the work. Given a fixed set of destinations, the open question is their order.
- **Alternatives considered** — Task-first nav (Operations at the top, as most PM tools do); a flat/alphabetical ordering; a database-shaped nav organized by tables.
- **Decision** — Navigation follows the rollout lifecycle, not the database: **Command Center → Programs → Workstreams → Operations → Knowledge → Timeline → Reports.** Understanding precedes doing (Operations) precedes communicating (Reports). Seven destinations, nothing else; Administration is kept off the primary nav, reached from the account menu.
- **Trade-offs** — Engineers find Operations at position four, not first (mitigated by their profile landing them on Operations). The ordering is opinionated and fixed, not user-rearrangeable.
- **Why this was chosen** — Context before activity: every screen answers one question, and the sequence walks the natural lifecycle — Understand → Plan → Execute → Communicate. Leading with context lets a newcomer become productive quickly instead of acting blind.
- **Future implications** — The ordering is a load-bearing product rule — the primary nav config forbids additions, so surfaces can't be bolted on ad hoc. Profiles adjust the landing destination, never the sequence; anything outside the seven lives off the primary nav by design.
