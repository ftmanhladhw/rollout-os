import type { Health, ReadinessStatus } from '@prisma/client';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import {
  HEALTH_LABELS,
  LIFECYCLE_STATUS_LABELS,
  READINESS_STATUS_LABELS,
  RISK_LEVEL_LABELS,
} from '@/config/terminology';
import { db } from '@/lib/db';
import type { RolloutContext } from '@/lib/rollout';
import { can } from '@/lib/authz';
import { averageProgress, readinessSummary } from '@/lib/rollout-metrics';
import { rankRisks, riskSeverity, windowStart } from './lib';

/**
 * The four MVP reports (docs/07: Executive · Weekly · Risk · Readiness —
 * "not 100 report types"). Every report is generated from operational data
 * at request time, never maintained by hand (docs/05 rule 4). All queries
 * are rollout-scoped and soft-delete filtered; visibility filtering follows
 * the standard pattern even though every reports-capable role currently
 * holds internal:view.
 */

function visibility(context: RolloutContext) {
  return can(context.ctx, 'internal:view') ? {} : { visibility: 'client' as const };
}

function longDate(value: Date | null): string {
  return value
    ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
}

const HEALTH_DOT: Record<Health, string> = {
  green: 'bg-status-good',
  amber: 'bg-status-warning',
  red: 'bg-status-critical',
};

const READINESS_DOT: Record<ReadinessStatus, string> = {
  ready: 'bg-status-good',
  in_progress: 'bg-status-warning',
  not_started: 'bg-muted-foreground/25',
};

/** Color never carries meaning alone — always paired with a text label. */
function Dot({ className }: { className: string }) {
  return <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />;
}

function Report({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="flex flex-col gap-4">
      <p className="text-muted-foreground/70 text-xs">
        {title} · Generated{' '}
        {new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}{' '}
        from live operational data
      </p>
      {children}
    </article>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-lg border">
      <h2 className="border-b px-4 py-2.5 text-sm font-medium">{heading}</h2>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-card flex min-w-0 flex-col rounded-lg border p-4">
      <p className="text-muted-foreground mb-1.5 text-xs font-medium">{label}</p>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      {sub ? <p className="text-muted-foreground mt-1 truncate text-xs">{sub}</p> : null}
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}

// --- Executive Report ---

export async function ExecutiveReport({ context }: { context: RolloutContext }) {
  const where = { rolloutId: context.rollout.id, deletedAt: null } as const;
  const [rollout, workstreams, dimensions, milestones, risks, decisions, openIssues] =
    await Promise.all([
      db.rollout.findFirst({
        where: { id: context.rollout.id },
        select: { health: true, goLiveDate: true, status: true },
      }),
      db.workstream.findMany({
        where: { ...where, ...visibility(context) },
        select: { progress: true },
      }),
      db.readinessDimension.findMany({ where, select: { status: true } }),
      db.milestone.findMany({
        where: { ...where, ...visibility(context) },
        select: { status: true },
      }),
      db.risk.findMany({
        where: { ...where, ...visibility(context), status: { not: 'completed' } },
        select: { id: true, name: true, probability: true, impact: true, status: true },
      }),
      db.decision.findMany({
        where: { ...where, ...visibility(context) },
        orderBy: [{ decisionDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        take: 5,
        select: { id: true, name: true, status: true, decisionDate: true },
      }),
      db.issue.count({
        where: { ...where, ...visibility(context), status: { not: 'completed' } },
      }),
    ]);

  const progress = averageProgress(workstreams);
  const readiness = readinessSummary(dimensions);
  const milestonesDone = milestones.filter((m) => m.status === 'completed').length;
  const topRisks = rankRisks(risks).slice(0, 5);

  return (
    <Report title="Executive report">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Health"
          value={
            <span className="flex items-center gap-2">
              {rollout ? <Dot className={HEALTH_DOT[rollout.health]} /> : null}
              {rollout ? HEALTH_LABELS[rollout.health] : '—'}
            </span>
          }
          sub="Manual assessment"
        />
        <Stat
          label="Progress"
          value={`${progress}%`}
          sub={`Mean of ${workstreams.length} workstream${workstreams.length === 1 ? '' : 's'}`}
        />
        <Stat
          label="Readiness"
          value={READINESS_STATUS_LABELS[readiness.overall]}
          sub={`${readiness.ready} of ${dimensions.length} dimensions ready`}
        />
        <Stat
          label="Go live"
          value={longDate(rollout?.goLiveDate ?? null)}
          sub={rollout?.status ? `Rollout ${LIFECYCLE_STATUS_LABELS[rollout.status]}` : undefined}
        />
      </div>

      <Section heading={`Delivery (${milestonesDone} of ${milestones.length} milestones done)`}>
        {milestones.length === 0 ? (
          <EmptyLine>No milestones planned yet.</EmptyLine>
        ) : (
          <p className="text-sm">
            {milestonesDone} completed · {milestones.filter((m) => m.status === 'blocked').length}{' '}
            blocked · {openIssues} open issue{openIssues === 1 ? '' : 's'}
          </p>
        )}
      </Section>

      <Section heading="Top risks">
        {topRisks.length === 0 ? (
          <EmptyLine>No open risks.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {topRisks.map((risk) => (
              <li key={risk.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{risk.name}</span>
                <span className="text-muted-foreground text-xs">
                  {RISK_LEVEL_LABELS[risk.probability]} × {RISK_LEVEL_LABELS[risk.impact]}
                </span>
                <LifecycleStatusBadge status={risk.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section heading="Recent decisions">
        {decisions.length === 0 ? (
          <EmptyLine>No decisions recorded yet.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {decisions.map((decision) => (
              <li key={decision.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{decision.name}</span>
                <span className="text-muted-foreground text-xs">
                  {longDate(decision.decisionDate)}
                </span>
                <LifecycleStatusBadge status={decision.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Report>
  );
}

// --- Weekly Report ---

export async function WeeklyReport({ context }: { context: RolloutContext }) {
  const now = new Date();
  const since = windowStart(now, 7);
  const horizon = new Date(now.getTime() + 14 * 86_400_000);
  const where = { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) };

  const [completedTasks, newRisks, newIssues, newDecisions, blockedItems, upcomingMilestones] =
    await Promise.all([
      db.task.findMany({
        where: { ...where, completedAt: { gte: since } },
        orderBy: { completedAt: 'desc' },
        select: { id: true, name: true, milestone: { select: { name: true } } },
      }),
      db.risk.findMany({
        where: { ...where, createdAt: { gte: since } },
        select: { id: true, name: true, status: true },
      }),
      db.issue.findMany({
        where: { ...where, createdAt: { gte: since } },
        select: { id: true, name: true, status: true },
      }),
      db.decision.findMany({
        where: { ...where, createdAt: { gte: since } },
        select: { id: true, name: true, status: true },
      }),
      db.task.findMany({
        where: { ...where, status: 'blocked' },
        select: { id: true, name: true, milestone: { select: { name: true } } },
      }),
      db.milestone.findMany({
        where: {
          ...where,
          status: { not: 'completed' },
          dueDate: { gte: now, lte: horizon },
        },
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          name: true,
          dueDate: true,
          workstream: { select: { name: true } },
        },
      }),
    ]);

  const logged = [
    { label: 'risk', items: newRisks },
    { label: 'issue', items: newIssues },
    { label: 'decision', items: newDecisions },
  ];

  return (
    <Report title={`Weekly report (since ${longDate(since)})`}>
      <Section heading={`Completed this week (${completedTasks.length})`}>
        {completedTasks.length === 0 ? (
          <EmptyLine>No tasks completed in the window.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {completedTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{task.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {task.milestone.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        heading={`Newly logged (${newRisks.length + newIssues.length + newDecisions.length})`}
      >
        {logged.every((group) => group.items.length === 0) ? (
          <EmptyLine>No new risks, issues, or decisions this week.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {logged.flatMap((group) =>
              group.items.map((item) => (
                <li
                  key={`${group.label}-${item.id}`}
                  className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span className="text-muted-foreground w-16 shrink-0 text-xs capitalize">
                    {group.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                  <LifecycleStatusBadge status={item.status} />
                </li>
              )),
            )}
          </ul>
        )}
      </Section>

      <Section heading={`Blocked right now (${blockedItems.length})`}>
        {blockedItems.length === 0 ? (
          <EmptyLine>Nothing is blocked.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {blockedItems.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{task.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {task.milestone.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section heading={`Due in the next 14 days (${upcomingMilestones.length})`}>
        {upcomingMilestones.length === 0 ? (
          <EmptyLine>No milestones due in the next two weeks.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {upcomingMilestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {milestone.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {milestone.workstream.name}
                </span>
                <span className="text-muted-foreground w-16 shrink-0 text-right text-xs tabular-nums">
                  {milestone.dueDate?.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Report>
  );
}

// --- Risk Report ---

export async function RiskReport({ context }: { context: RolloutContext }) {
  const risks = await db.risk.findMany({
    where: {
      rolloutId: context.rollout.id,
      deletedAt: null,
      ...visibility(context),
      status: { not: 'completed' },
    },
    select: {
      id: true,
      name: true,
      status: true,
      probability: true,
      impact: true,
      mitigation: true,
      owner: { select: { name: true } },
    },
  });
  const ranked = rankRisks(risks);
  const severe = ranked.filter((r) => riskSeverity(r.probability, r.impact) >= 6).length;

  return (
    <Report title="Risk report">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open risks" value={ranked.length} />
        <Stat label="High severity" value={severe} sub="Probability × impact ≥ 6 of 9" />
      </div>
      <Section heading="All open risks, worst first">
        {ranked.length === 0 ? (
          <EmptyLine>No open risks — record potential problems in Operations → Risks.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {ranked.map((risk) => (
              <li key={risk.id} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{risk.name}</span>
                  <span className="text-muted-foreground text-xs">
                    P {RISK_LEVEL_LABELS[risk.probability]} · I {RISK_LEVEL_LABELS[risk.impact]}
                  </span>
                  <LifecycleStatusBadge status={risk.status} />
                </div>
                <p className="text-muted-foreground text-xs">
                  Owner: {risk.owner.name}
                  {risk.mitigation ? ` · Mitigation: ${risk.mitigation}` : ' · No mitigation yet'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Report>
  );
}

// --- Readiness Report ---

export async function ReadinessReport({ context }: { context: RolloutContext }) {
  const dimensions = await db.readinessDimension.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, status: true },
  });
  const summary = readinessSummary(dimensions);

  return (
    <Report title="Readiness report">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Overall"
          value={READINESS_STATUS_LABELS[summary.overall]}
          sub="Ready only when every dimension is"
        />
        <Stat label="Ready" value={`${summary.ready} / ${dimensions.length}`} />
        <Stat label="In progress" value={summary.inProgress} />
        <Stat label="Not started" value={summary.notStarted} />
      </div>
      <Section heading="Dimensions (manual assessment)">
        {dimensions.length === 0 ? (
          <EmptyLine>No readiness dimensions configured for this rollout.</EmptyLine>
        ) : (
          <ul className="divide-y">
            {dimensions.map((dimension) => (
              <li key={dimension.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <Dot className={READINESS_DOT[dimension.status]} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {dimension.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {READINESS_STATUS_LABELS[dimension.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Report>
  );
}
