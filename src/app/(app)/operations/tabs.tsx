import Link from 'next/link';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { Button } from '@/components/ui/button';
import { PRIORITY_LABELS } from '@/config/terminology';
import { db } from '@/lib/db';
import type { RolloutContext } from '@/lib/rollout';
import { can } from '@/lib/authz';
import {
  archiveDecision,
  archiveIssue,
  archiveMilestone,
  archiveRisk,
  archiveTask,
  createDecision,
  createIssue,
  createMilestone,
  createRisk,
  createTask,
  updateDecision,
  updateIssue,
  updateMilestone,
  updateRisk,
  updateTask,
} from './actions';
import { EntityDrawer, type FieldSpec } from '@/components/entity-drawer';
import {
  descriptionField,
  dueDateField,
  nameField,
  priorityField,
  statusField,
  toDateInput,
} from '@/components/entity-fields';
import { RISK_LEVEL_OPTIONS } from './field-configs';

/**
 * The five live Operations tabs (PRD §18 Release 2 set). Every tab has the
 * same anatomy: create drawer (when the caller holds the tab's action),
 * uniform table, row-click edit drawer. All queries are rollout-scoped,
 * soft-delete filtered, and client-visibility filtered.
 */

function visibility(context: RolloutContext) {
  return can(context.ctx, 'internal:view') ? {} : { visibility: 'client' as const };
}

function shortDate(value: Date | null): string {
  return value ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
}

function EmptyTab({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed px-6 py-10 text-center">
      <p className="text-muted-foreground mx-auto max-w-md text-sm text-balance">{children}</p>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left text-xs">
            {head.map((th, i) => (
              <th
                key={th}
                className={`h-9 px-4 font-medium ${i > 1 ? 'hidden md:table-cell' : ''}`}
              >
                {th}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

const rowTrigger = (label: string) => (
  <button
    type="button"
    className="text-left font-medium underline-offset-4 hover:underline"
    title="Edit"
  >
    {label}
  </button>
);

const newButton = (label: string) => <Button size="sm">{label}</Button>;

// --- Milestones ---

export async function MilestonesTab({ context }: { context: RolloutContext }) {
  const canManage = can(context.ctx, 'structure:manage');
  const [milestones, workstreams, phases] = await Promise.all([
    db.milestone.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        phaseId: true,
        workstream: { select: { name: true } },
      },
    }),
    db.workstream.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    }),
    db.phase.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  // The timeline groups milestones by phase — assignment happens here.
  const phaseField: FieldSpec = {
    name: 'phaseId',
    label: 'Phase',
    type: 'select',
    options: [
      { value: '', label: 'No phase' },
      ...phases.map((p) => ({ value: p.id, label: p.name })),
    ],
  };

  const createFields: FieldSpec[] = [
    {
      name: 'workstreamId',
      label: 'Workstream',
      type: 'select',
      options: workstreams.map((w) => ({ value: w.id, label: w.name })),
    },
    nameField,
    descriptionField,
    dueDateField,
    phaseField,
  ];
  const editFields = [
    nameField,
    statusField,
    priorityField,
    dueDateField,
    phaseField,
    descriptionField,
  ];

  if (workstreams.length === 0) {
    return (
      <EmptyTab>
        Milestones belong to workstreams (Domain Rule 3), and there are none yet —{' '}
        <Link href="/workstreams" className="font-medium underline-offset-4 hover:underline">
          create a workstream first
        </Link>
        .
      </EmptyTab>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      {canManage && (
        <div className="flex justify-end">
          <EntityDrawer
            title="New milestone"
            description="A major checkpoint inside a workstream."
            fields={createFields}
            action={createMilestone}
            submitLabel="Create milestone"
            trigger={newButton('New milestone')}
          />
        </div>
      )}
      {milestones.length === 0 ? (
        <EmptyTab>No milestones yet — plan the first checkpoint of a workstream.</EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Workstream', 'Priority', 'Due']}>
          {milestones.map((m) => (
            <tr key={m.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit milestone"
                    fields={editFields}
                    defaults={{
                      id: m.id,
                      name: m.name,
                      description: m.description ?? '',
                      status: m.status,
                      priority: m.priority,
                      dueDate: toDateInput(m.dueDate),
                      phaseId: m.phaseId ?? '',
                    }}
                    action={updateMilestone}
                    archiveAction={archiveMilestone}
                    submitLabel="Save changes"
                    trigger={rowTrigger(m.name)}
                  />
                ) : (
                  m.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={m.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {m.workstream.name}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {PRIORITY_LABELS[m.priority]}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(m.dueDate)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Tasks ---

export async function TasksTab({ context }: { context: RolloutContext }) {
  const canExecute = can(context.ctx, 'operations:execute');
  const [tasks, milestones] = await Promise.all([
    db.task.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        milestone: { select: { name: true } },
      },
    }),
    db.milestone.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const createFields: FieldSpec[] = [
    {
      name: 'milestoneId',
      label: 'Milestone',
      type: 'select',
      options: milestones.map((m) => ({ value: m.id, label: m.name })),
    },
    nameField,
    descriptionField,
    dueDateField,
  ];
  const editFields = [nameField, statusField, priorityField, dueDateField, descriptionField];

  if (milestones.length === 0) {
    return (
      <EmptyTab>
        Tasks contribute to milestones (Domain Rule 4), and there are none yet — create a milestone
        in the Milestones tab first.
      </EmptyTab>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      {canExecute && (
        <div className="flex justify-end">
          <EntityDrawer
            title="New task"
            description="The smallest executable unit, contributing to one milestone."
            fields={createFields}
            action={createTask}
            submitLabel="Create task"
            trigger={newButton('New task')}
          />
        </div>
      )}
      {tasks.length === 0 ? (
        <EmptyTab>No tasks yet — break the nearest milestone into executable work.</EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Milestone', 'Priority', 'Due']}>
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canExecute ? (
                  <EntityDrawer
                    title="Edit task"
                    fields={editFields}
                    defaults={{
                      id: t.id,
                      name: t.name,
                      description: t.description ?? '',
                      status: t.status,
                      priority: t.priority,
                      dueDate: toDateInput(t.dueDate),
                    }}
                    action={updateTask}
                    archiveAction={archiveTask}
                    submitLabel="Save changes"
                    trigger={rowTrigger(t.name)}
                  />
                ) : (
                  t.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={t.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {t.milestone.name}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {PRIORITY_LABELS[t.priority]}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(t.dueDate)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Risks ---

export async function RisksTab({ context }: { context: RolloutContext }) {
  const canManage = can(context.ctx, 'operations:manage');
  const risks = await db.risk.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      probability: true,
      impact: true,
      mitigation: true,
      owner: { select: { name: true } },
    },
  });

  const riskFields: FieldSpec[] = [
    nameField,
    descriptionField,
    { name: 'probability', label: 'Probability', type: 'select', options: RISK_LEVEL_OPTIONS },
    { name: 'impact', label: 'Impact', type: 'select', options: RISK_LEVEL_OPTIONS },
    { name: 'mitigation', label: 'Mitigation', type: 'textarea' },
  ];

  return (
    <section className="flex flex-col gap-3">
      {canManage && (
        <div className="flex justify-end">
          <EntityDrawer
            title="New risk"
            description="A potential future problem. You own the risks you raise (Domain Rule 6)."
            fields={riskFields}
            action={createRisk}
            submitLabel="Create risk"
            trigger={newButton('New risk')}
          />
        </div>
      )}
      {risks.length === 0 ? (
        <EmptyTab>
          No risks recorded — when something could go wrong later, capture it here.
        </EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Probability', 'Impact', 'Owner']}>
          {risks.map((r) => (
            <tr key={r.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit risk"
                    fields={[nameField, statusField, priorityField, ...riskFields.slice(1)]}
                    defaults={{
                      id: r.id,
                      name: r.name,
                      description: r.description ?? '',
                      status: r.status,
                      priority: r.priority,
                      probability: r.probability,
                      impact: r.impact,
                      mitigation: r.mitigation ?? '',
                    }}
                    action={updateRisk}
                    archiveAction={archiveRisk}
                    submitLabel="Save changes"
                    trigger={rowTrigger(r.name)}
                  />
                ) : (
                  r.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={r.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 capitalize md:table-cell">
                {r.probability}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 capitalize md:table-cell">
                {r.impact}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {r.owner.name}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Issues ---

export async function IssuesTab({ context }: { context: RolloutContext }) {
  const canExecute = can(context.ctx, 'operations:execute');
  const issues = await db.issue.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      resolution: true,
      resolvedAt: true,
    },
  });

  return (
    <section className="flex flex-col gap-3">
      {canExecute && (
        <div className="flex justify-end">
          <EntityDrawer
            title="New issue"
            description="An existing problem that needs resolving."
            fields={[nameField, descriptionField]}
            action={createIssue}
            submitLabel="Create issue"
            trigger={newButton('New issue')}
          />
        </div>
      )}
      {issues.length === 0 ? (
        <EmptyTab>No issues — when a problem is already happening, log it here.</EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Priority', 'Resolved']}>
          {issues.map((i) => (
            <tr key={i.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canExecute ? (
                  <EntityDrawer
                    title="Edit issue"
                    fields={[
                      nameField,
                      statusField,
                      priorityField,
                      descriptionField,
                      { name: 'resolution', label: 'Resolution', type: 'textarea' },
                    ]}
                    defaults={{
                      id: i.id,
                      name: i.name,
                      description: i.description ?? '',
                      status: i.status,
                      priority: i.priority,
                      resolution: i.resolution ?? '',
                    }}
                    action={updateIssue}
                    archiveAction={archiveIssue}
                    submitLabel="Save changes"
                    trigger={rowTrigger(i.name)}
                  />
                ) : (
                  i.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={i.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {PRIORITY_LABELS[i.priority]}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(i.resolvedAt)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Decisions ---

export async function DecisionsTab({ context }: { context: RolloutContext }) {
  const canManage = can(context.ctx, 'operations:manage');
  const decisions = await db.decision.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: [{ decisionDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      reason: true,
      decisionDate: true,
    },
  });

  const decisionFields: FieldSpec[] = [
    nameField,
    descriptionField,
    { name: 'reason', label: 'Reason', type: 'textarea' },
    { name: 'decisionDate', label: 'Decision date', type: 'date' },
  ];

  return (
    <section className="flex flex-col gap-3">
      {canManage && (
        <div className="flex justify-end">
          <EntityDrawer
            title="Record a decision"
            description="A permanent record. This slice records decisions against the rollout itself."
            fields={decisionFields}
            action={createDecision}
            submitLabel="Record decision"
            trigger={newButton('Record decision')}
          />
        </div>
      )}
      {decisions.length === 0 ? (
        <EmptyTab>
          No decisions recorded — capture approvals and scope calls so they outlive the meeting they
          were made in.
        </EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Priority', 'Decided']}>
          {decisions.map((d) => (
            <tr key={d.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit decision"
                    fields={[nameField, statusField, priorityField, ...decisionFields.slice(1)]}
                    defaults={{
                      id: d.id,
                      name: d.name,
                      description: d.description ?? '',
                      status: d.status,
                      priority: d.priority,
                      reason: d.reason ?? '',
                      decisionDate: toDateInput(d.decisionDate),
                    }}
                    action={updateDecision}
                    archiveAction={archiveDecision}
                    submitLabel="Save changes"
                    trigger={rowTrigger(d.name)}
                  />
                ) : (
                  d.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={d.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {PRIORITY_LABELS[d.priority]}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(d.decisionDate)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}
