/**
 * The engineering decision log — single source of truth for the /decisions
 * page. Each record is an ADR (Architecture Decision Record): the reasoning
 * behind a load-bearing product choice, not a feature description. Grounded in
 * the product docs (referenced per entry); the markdown mirror lives in
 * docs/13_decision_log.md. Keep this domain-agnostic — no partner names/dates.
 */

export type Decision = {
  /** Stable ADR id, also the anchor slug (e.g. "ADR-001" → #adr-001). */
  id: string;
  title: string;
  /** ADR status. Everything here is in effect today, hence "Accepted". */
  status: 'Accepted';
  /** Docs this decision is grounded in, shown as provenance. */
  sources: string[];
  /** What forced a decision. */
  problem: string;
  /** The options genuinely on the table. */
  alternatives: string[];
  /** What was chosen. */
  decision: string;
  /** What we knowingly gave up. */
  tradeOffs: string;
  /** Why this option won over the alternatives. */
  rationale: string;
  /** What this commits or unlocks downstream. */
  implications: string;
};

export const decisions: Decision[] = [
  {
    id: 'ADR-001',
    title: 'Rollout OS is not a project-management tool',
    status: 'Accepted',
    sources: ['docs/02 Product Thesis', 'docs/05 Information Architecture', 'docs/06 PRD §04'],
    problem:
      'A rollout fragments across many systems — tasks, documents, risks, decisions, reporting. Each system does its own job well, but none explains the rollout as a whole, so the delivery lead becomes the only person who holds the full picture. Positioning as "another task tracker" would drop the product into a crowded category and, worse, invite an architecture organized around the database (records and boards) rather than around the work.',
    alternatives: [
      'Build on top of / extend an existing PM tool (Jira, Asana) as a rollout template.',
      'Ship a generic project-management platform with rollout-flavoured presets.',
      'Position as portfolio / PPM software and manage rollouts as a project type.',
    ],
    decision:
      'Define a distinct category — Enterprise Rollout Operations — an operational workspace scoped to the window between project initiation and transition into business-as-usual. Explicitly not Jira: not a configurable board, not a generic task manager. Generic project management, document management, and communication are declared non-goals.',
    tradeOffs:
      'We give up the instant familiarity of "it works like the tracker you already know," and we take on the cost of building category understanding. Scope is deliberately narrow — one rollout, temporary by design — so buyers looking for a general-purpose PM suite are not the audience.',
    rationale:
      'The unmet need is not another task list; it is the operational layer that explains the rollout as a whole and survives the people who ran it. Navigation follows the rollout lifecycle, not the database — the direct expression of "every entity belongs to one rollout." Optimizing for tasks would rebuild a solved problem and miss the actual gap.',
    implications:
      'Everything belongs to exactly one rollout; there is no global task list or orphaned document library. The primary navigation is the seven lifecycle destinations, not an arrangeable board. The growth path is portfolio (many rollouts) and operational intelligence — never "more PM features."',
  },
  {
    id: 'ADR-002',
    title: 'The Command Center is the primary experience',
    status: 'Accepted',
    sources: ['docs/07 UX Spec Ch.1 & Ch.4', 'docs/05 IA §06'],
    problem:
      'When someone logs in, they should never have to ask "where do I go?" Status is scattered and leadership depends on hand-assembled updates. A conventional widget-grid dashboard answers a dozen questions shallowly and answers none of them as "what is happening on this rollout right now?"',
    alternatives: [
      'A traditional configurable dashboard — a grid of rearrangeable widgets.',
      'A home menu / module launcher that lists the destinations and lets the user pick.',
      'Open to the last-visited screen, with no opinion about a home.',
    ],
    decision:
      'The landing page is the Command Center: an opinionated operational cockpit ("Mission Control"), not a dashboard. It is named Command Center, not "Overview" — the naming is deliberate. Every other screen is framed as another perspective of the same rollout, not a separate destination with its own data.',
    tradeOffs:
      'One opinionated landing means less end-user customization of the home page. The single page carries a hard design constraint — it must stay comprehensible in one glance, ideally without scrolling. And the name diverges from the "Overview/Home" label users expect from other tools.',
    rationale:
      'One rollout, one home: a strong single mental model (the thing Linear, Notion, and GitHub each get right) is what makes the product feel like an operating system rather than a collection of pages. A consultant opening their day thinks "I\'ll open Mission Control," not "I\'ll open the Overview." Continuous visibility replaces manual reporting.',
    implications:
      'Every other screen derives from the Command Center and reads from the single operational dataset — it owns no data of its own. Experience Profiles change which screen a given role lands on (engineering → Operations, client → Timeline) without changing the underlying model.',
  },
  {
    id: 'ADR-003',
    title: 'Health and Readiness are manual in the MVP',
    status: 'Accepted',
    sources: ['docs/05 IA §14', 'docs/06 PRD §11–12', 'docs/07 UX Spec Ch.4'],
    problem:
      'Health and Readiness are the headline vital signs of a rollout. But automatically calculating them requires a validated model of what "healthy" and "ready" actually mean for a given delivery — a model that does not exist yet, and cannot exist before there is reliable operational data to learn it from.',
    alternatives: [
      'Ship an automatic Health engine — weighted rules over tasks, risks, and milestones.',
      'Ship an AI/rule-based Readiness engine that infers readiness from activity.',
      'Omit Health and Readiness entirely until they can be automated.',
    ],
    decision:
      'Ship Health (Green / Amber / Red) and Readiness (Not Started / In Progress / Ready, per readiness dimension) as manual fields, set by the delivery side and read by leadership.',
    tradeOffs:
      'Manual assessments can go stale or carry individual bias, and there is no automatic early-warning signal. Accuracy depends on the discipline of whoever maintains them.',
    rationale:
      'Manual is faster to build, and — more importantly — it lets the team observe how experienced practitioners actually judge health and readiness, producing exactly the labelled data needed to automate later. This is the "manual before automation" principle in practice: Capture → Visualize → Automate → Predict.',
    implications:
      'The manual field is a clean extension point: it becomes the training signal and the output slot for a Health Engine and Readiness Engine in a later phase. Nothing in the schema has to change for automation to land — the human assessment simply becomes an assisted or generated one.',
  },
  {
    id: 'ADR-004',
    title: 'AI is intentionally excluded from the first release',
    status: 'Accepted',
    sources: ['docs/05 IA §13', 'docs/06 PRD §04 & §19', 'docs/03 Vision (AI is a later phase)'],
    problem:
      'The long-term vision positions AI as an operational partner — summarizing meetings, drafting executive updates, detecting emerging risks, recommending next actions. But AI layered over thin or unreliable operational data produces confident, unverifiable output, and there is no validated workflow yet for it to automate.',
    alternatives: [
      'Ship AI summaries and readiness suggestions as headline MVP features.',
      'Add a thin LLM chatbot over the rollout data.',
      'Partial AI — automate one narrow surface (e.g. meeting summaries) only.',
    ],
    decision:
      'No AI in the MVP. Every workflow must function perfectly without AI first. AI is an explicit non-goal for the first release.',
    tradeOffs:
      'We give up the near-term "AI-powered" positioning and the immediate automation of reporting and summarization; users do more of that work by hand in the first release.',
    rationale:
      'Automation should only replace workflows that have already been validated manually — structure before intelligence. The MVP scope is deliberately Capture and Visualize; Automate is Phase 2 and Predict is Phase 3. Building AI on unproven workflows and sparse data would ship something impressive to demo and untrustworthy to use.',
    implications:
      'AI arrives as a layer on top of captured data, not a rewrite. The manual Health/Readiness fields, the activity log, and the structured operational records become its inputs. The category stance — "the future is not more dashboards, and not AI hype" — is preserved by not shipping AI prematurely.',
  },
  {
    id: 'ADR-005',
    title: 'Experience Profiles are separate from RBAC',
    status: 'Accepted',
    sources: [
      'docs/14 Auth & Authorization',
      'docs/06 PRD §06 & §15',
      'docs/07 UX Spec Ch.2 & Ch.10',
    ],
    problem:
      'Different roles need different views — executives should not wade through tasks, engineers should not see executive reports, clients should not see internal risks. But "what you see" and "what you are allowed to do" are different questions. Conflating them turns a UI preference into a security boundary, so a cosmetic change can silently widen access.',
    alternatives: [
      'A single role that governs both permissions and the interface.',
      'Permission-derived UI — hide anything the user cannot act on, and nothing else.',
      'Fully custom, per-user dashboards with no shared model.',
    ],
    decision:
      'Three separated layers. Layer 1: RLS in the database for tenant isolation only (never role-aware). Layer 2: Roles → permissions — what you can do, checked server-side on every action and query. Layer 3: Experience Profile — how the UI behaves (landing page, navigation, visible modules), never a security boundary. A profile is initialized from the role but is independently changeable, and is never consulted in a permission check.',
    tradeOffs:
      'There are two axes to configure and reason about instead of one, and the same role can legitimately present two different interfaces — more concepts to hold and to explain.',
    rationale:
      'Permissions define what a user can do; Experience Profiles define how the product behaves; RBAC is an implementation detail underneath the experience layer. Because the profile is never read during authorization, adjusting what someone sees can never change what they can do — the failure mode of permission-derived UIs is designed out. "Experience changes, not data."',
    implications:
      'An executive can be given the fuller consultant view without gaining any write permission, and vice versa. Profiles can evolve — new landing pages, filters, default widgets — without touching the permission matrix, which stays a static, code-reviewed constant rather than runtime configuration.',
  },
  {
    id: 'ADR-006',
    title: 'Reports are generated from operational data, never hand-maintained',
    status: 'Accepted',
    sources: ['docs/07 UX Spec Ch.4', 'docs/05 IA §16 (rule 4)', 'docs/06 PRD §06'],
    problem:
      'Status reporting is where delivery leads lose the most time and where the truth drifts furthest. A hand-maintained deck or spreadsheet is out of date the moment it is built, and it quietly diverges from the real operational state it is supposed to describe.',
    alternatives: [
      'A report builder with editable, free-form report documents.',
      'Export operational data to slides/spreadsheets and let people finish them by hand.',
      'Point-in-time snapshot reports that are saved and then maintained separately.',
    ],
    decision:
      'The reports (Executive, Weekly, Risk, Readiness) are pure projections generated from the operational data at request time, never maintained by hand — and there are exactly four, not a hundred report types.',
    tradeOffs:
      'There is no bespoke narrative editing inside a report, the report is only ever as good as the discipline of the underlying data, and the set is fixed rather than open-ended.',
    rationale:
      'Status lives in exactly one place; dashboards and reports are projections of it. Generating reports from the single source of truth keeps them trustworthy by construction and directly attacks the manual-reporting overhead the product exists to remove. Structure before visualization: reliable data is worth more than a polished but hand-curated artefact.',
    implications:
      'Reports stay correct automatically as the operational data changes. Adding a report means adding an aggregation over the same dataset, not opening a new authoring surface. A future executive-report generator layers onto the same projection model rather than replacing it.',
  },
  {
    id: 'ADR-007',
    title: 'Context comes before Tasks in the navigation',
    status: 'Accepted',
    sources: [
      'docs/06 PRD §06 (principle 3)',
      'docs/05 IA §02',
      'docs/07 UX Spec Ch.3',
      'src/config/nav.ts',
    ],
    problem:
      'New team members take weeks to understand a rollout, and dropping someone straight into a task list makes them act before they understand the shape of the work. Given a small, fixed set of destinations, the open question is what order they sit in.',
    alternatives: [
      'Task-first navigation — Operations/tasks at the top, as most PM tools do.',
      'A flat or alphabetical ordering with no narrative.',
      'A database-shaped navigation organized by tables and record types.',
    ],
    decision:
      'Navigation follows the rollout lifecycle, not the database: Command Center → Programs → Workstreams → Operations → Knowledge → Timeline → Reports. Understanding (what is happening, what we are delivering, who does the work) precedes doing (Operations) precedes communicating (Reports). Seven destinations, nothing else — Administration is deliberately kept out and reached from the account menu.',
    tradeOffs:
      'Engineers, who live in the task list, find Operations at position four rather than first — mitigated by their Experience Profile landing them directly on Operations. The ordering is opinionated and fixed, not user-rearrangeable.',
    rationale:
      'Context before activity: every screen answers one question, and the sequence walks the natural rollout lifecycle — Understand → Plan → Execute → Communicate. Leading with context is what lets a newcomer become productive quickly instead of acting blind. The seven-destination discipline keeps the product feeling like an operating system rather than a settings tree.',
    implications:
      'The ordering is a load-bearing product rule — the primary nav config forbids additions, so new surfaces cannot be bolted on ad hoc. Experience Profiles adjust the landing destination for a role, never the sequence itself; anything outside the seven (like Administration) lives off the primary nav by design.',
  },
];
