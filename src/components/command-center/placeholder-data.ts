/**
 * PLACEHOLDER DATA — information-architecture scaffolding only.
 *
 * The Command Center layout is real; this content is not. Each block below
 * will be replaced by a query over the operational dataset as the owning
 * module lands (priorities/blockers/my-work → Operations, milestones →
 * Timeline, activity → the activity log). Shapes are chosen to match the
 * schema so the swap is mechanical, and all names/items are fictional and
 * domain-agnostic (design-partner hard rule).
 */

export type Status = 'good' | 'warning' | 'critical';

export const vitals = {
  health: {
    value: 'Amber' as const,
    status: 'warning' as Status,
    note: '2 blockers need attention',
  },
  progress: { percent: 62, note: '34 of 55 tasks done' },
  readiness: {
    value: 'In progress',
    note: '2 of 7 dimensions ready',
    // Mirrors the seeded readiness dimensions, in sort order.
    dimensions: [
      { name: 'Engineering', status: 'good' },
      { name: 'Documentation', status: 'warning' },
      { name: 'Data', status: 'warning' },
      { name: 'Security', status: 'good' },
      { name: 'Training', status: 'warning' },
      { name: 'Partner', status: null },
      { name: 'Go Live', status: null },
    ] as { name: string; status: Status | null }[],
  },
  goLive: { value: '30 Nov', note: '20 weeks away' },
};

export const todaysPriorities = [
  { title: 'Confirm UAT sign-off owner for Wave 2', context: 'QA', due: 'Today', critical: true },
  {
    title: 'Review tenant mapping for data migration',
    context: 'Data',
    due: 'Today',
    critical: true,
  },
  {
    title: 'Publish training schedule to partner teams',
    context: 'Training',
    due: 'Tomorrow',
    critical: false,
  },
  {
    title: 'Close out Discovery notes for Wave 3 tenants',
    context: 'PMO',
    due: 'This week',
    critical: false,
  },
];

export const blockers = [
  {
    title: 'Data migration blocked on tenant mapping approval',
    owner: 'Priya N.',
    age: 'Blocked 3 days',
  },
  {
    title: 'Sandbox environment credentials pending from partner IT',
    owner: 'Jonas K.',
    age: 'Blocked 1 day',
  },
];

export const upcomingMilestones = [
  {
    name: 'UAT complete — Wave 1',
    phase: 'UAT',
    date: '18 Jul',
    status: 'warning' as Status,
    statusLabel: 'At risk',
  },
  {
    name: 'Training delivered — all tenants',
    phase: 'Build',
    date: '01 Aug',
    status: 'good' as Status,
    statusLabel: 'On track',
  },
  {
    name: 'Go/no-go review',
    phase: 'Go Live',
    date: '15 Aug',
    status: 'good' as Status,
    statusLabel: 'On track',
  },
  {
    name: 'Wave 2 tenants live',
    phase: 'Go Live',
    date: '30 Nov',
    status: 'good' as Status,
    statusLabel: 'On track',
  },
];

export const myWork = [
  { title: 'Draft go/no-go checklist', kind: 'Task', due: 'Today' },
  { title: 'Review “Partner readiness” risk', kind: 'Risk', due: 'Thu' },
  { title: 'Assign owner to onboarding runbook', kind: 'Action item', due: 'Fri' },
  { title: 'Prepare weekly status inputs', kind: 'Task', due: 'Fri' },
];

export const recentActivity = [
  { actor: 'Priya N.', text: 'moved “Training content” to In progress', when: '2h ago' },
  { actor: 'Jonas K.', text: 'raised blocker “Sandbox credentials pending”', when: '4h ago' },
  { actor: 'Mei L.', text: 'marked Security readiness as Ready', when: 'Yesterday' },
  { actor: 'Tomás R.', text: 'added decision “Wave 2 scope frozen”', when: 'Yesterday' },
  { actor: 'Priya N.', text: 'completed “Tenant data audit — Wave 1”', when: '2 days ago' },
];
