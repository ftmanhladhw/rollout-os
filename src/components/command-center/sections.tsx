import { CircleAlert, CircleCheckBig, ListChecks, OctagonAlert } from 'lucide-react';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import type { RolloutContext } from '@/lib/rollout';
import { SectionCard, SectionList, SectionRow } from './section-card';
import { StatusDot } from './vital-signs';
import { activityText, timeAgo } from './activity-format';
import { dueLabel, isUrgent, milestoneSignal } from './derive';

/**
 * The Command Center body sections — all live now. Same anatomy everywhere
 * (SectionCard); every section is a projection linking into the module that
 * owns its data (docs/07). Queries are rollout-scoped, soft-delete filtered,
 * and client-visibility filtered.
 */

function visibility(context: RolloutContext) {
  return can(context.ctx, 'internal:view') ? {} : { visibility: 'client' as const };
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground px-4 py-6 text-sm">{children}</p>;
}

export async function TodaysPriorities({ context }: { context: RolloutContext }) {
  const tasks = await db.task.findMany({
    where: {
      rolloutId: context.rollout.id,
      deletedAt: null,
      ...visibility(context),
      status: { notIn: ['completed', 'archived'] },
      dueDate: { not: null },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    take: 5,
    select: {
      id: true,
      name: true,
      priority: true,
      dueDate: true,
      milestone: { select: { name: true } },
    },
  });
  const today = new Date();

  return (
    <SectionCard
      title="Today's priorities"
      count={tasks.length}
      href="/operations"
      hrefLabel="Operations"
    >
      {tasks.length === 0 ? (
        <EmptySection>
          Nothing dated is open — give tasks due dates in Operations and the nearest ones surface
          here.
        </EmptySection>
      ) : (
        <SectionList>
          {tasks.map((task) => {
            const urgent = isUrgent(task.priority, task.dueDate, today);
            return (
              <SectionRow key={task.id}>
                {urgent ? (
                  <CircleAlert
                    className="text-status-critical size-4 shrink-0"
                    aria-label="Urgent"
                  />
                ) : (
                  <ListChecks
                    className="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-sm">{task.name}</span>
                <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                  {task.milestone.name}
                </span>
                <span
                  className={`w-16 shrink-0 text-right text-xs ${urgent ? 'text-status-critical' : 'text-muted-foreground'}`}
                >
                  {dueLabel(task.dueDate, today)}
                </span>
              </SectionRow>
            );
          })}
        </SectionList>
      )}
    </SectionCard>
  );
}

export async function Blockers({ context }: { context: RolloutContext }) {
  const base = {
    rolloutId: context.rollout.id,
    deletedAt: null,
    ...visibility(context),
    status: 'blocked' as const,
  };
  const [tasks, milestones, issues] = await Promise.all([
    db.task.findMany({
      where: base,
      select: { id: true, name: true, updatedAt: true, assignee: { select: { name: true } } },
    }),
    db.milestone.findMany({
      where: base,
      select: { id: true, name: true, updatedAt: true, workstream: { select: { name: true } } },
    }),
    db.issue.findMany({
      where: base,
      select: { id: true, name: true, updatedAt: true, owner: { select: { name: true } } },
    }),
  ]);

  const now = new Date();
  const blockers = [
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      name: t.name,
      context: t.assignee?.name ?? 'Task',
      since: t.updatedAt,
    })),
    ...milestones.map((m) => ({
      id: `milestone-${m.id}`,
      name: m.name,
      context: m.workstream.name,
      since: m.updatedAt,
    })),
    ...issues.map((i) => ({
      id: `issue-${i.id}`,
      name: i.name,
      context: i.owner?.name ?? 'Issue',
      since: i.updatedAt,
    })),
  ]
    .sort((a, b) => b.since.getTime() - a.since.getTime())
    .slice(0, 5);

  return (
    <SectionCard title="Blockers" count={blockers.length} href="/operations" hrefLabel="Operations">
      {blockers.length === 0 ? (
        <EmptySection>
          Nothing is blocked — items whose status is set to Blocked appear here until unstuck.
        </EmptySection>
      ) : (
        <SectionList>
          {blockers.map((item) => (
            <SectionRow key={item.id}>
              <OctagonAlert className="text-status-critical size-4 shrink-0" aria-label="Blocker" />
              <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                {item.context}
              </span>
              <span className="text-status-critical shrink-0 text-xs">
                {timeAgo(item.since, now)}
              </span>
            </SectionRow>
          ))}
        </SectionList>
      )}
    </SectionCard>
  );
}

export async function UpcomingMilestones({ context }: { context: RolloutContext }) {
  const milestones = await db.milestone.findMany({
    where: {
      rolloutId: context.rollout.id,
      deletedAt: null,
      ...visibility(context),
      status: { notIn: ['completed', 'archived'] },
      dueDate: { not: null },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
      dueDate: true,
      phase: { select: { name: true } },
    },
  });
  const today = new Date();

  return (
    <SectionCard
      title="Upcoming milestones"
      count={milestones.length}
      href="/timeline"
      hrefLabel="Timeline"
    >
      {milestones.length === 0 ? (
        <EmptySection>
          No dated milestones ahead — plan checkpoints in Operations and they line up here.
        </EmptySection>
      ) : (
        <SectionList>
          {milestones.map((milestone) => {
            const signal = milestoneSignal(milestone.status, milestone.dueDate, today);
            return (
              <SectionRow key={milestone.id}>
                <span className="text-muted-foreground w-12 shrink-0 text-xs tabular-nums">
                  {milestone.dueDate?.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{milestone.name}</span>
                <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                  {milestone.phase?.name ?? '—'}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <StatusDot status={signal.status} />
                  <span className="text-muted-foreground w-14 text-xs">{signal.label}</span>
                </span>
              </SectionRow>
            );
          })}
        </SectionList>
      )}
    </SectionCard>
  );
}

export async function MyWork({ context }: { context: RolloutContext }) {
  const self = context.ctx
    ? await db.stakeholder.findFirst({
        where: { rolloutId: context.rollout.id, profileId: context.ctx.userId, deletedAt: null },
        select: { id: true },
      })
    : null;

  const open = { notIn: ['completed', 'archived'] as ('completed' | 'archived')[] };
  const [tasks, risks] = self
    ? await Promise.all([
        db.task.findMany({
          where: {
            rolloutId: context.rollout.id,
            deletedAt: null,
            assigneeId: self.id,
            status: open,
          },
          orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
          take: 5,
          select: { id: true, name: true, dueDate: true },
        }),
        db.risk.findMany({
          where: {
            rolloutId: context.rollout.id,
            deletedAt: null,
            ownerId: self.id,
            status: open,
          },
          orderBy: { createdAt: 'asc' },
          take: 5,
          select: { id: true, name: true },
        }),
      ])
    : [[], []];

  const today = new Date();
  const items = [
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      name: t.name,
      kind: 'Task',
      due: dueLabel(t.dueDate, today),
    })),
    ...risks.map((r) => ({ id: `risk-${r.id}`, name: r.name, kind: 'Risk', due: '—' })),
  ].slice(0, 5);

  return (
    <SectionCard title="My work" count={items.length} href="/operations" hrefLabel="Operations">
      {items.length === 0 ? (
        <EmptySection>
          Nothing is yours yet — tasks assigned to you and risks you own gather here.
        </EmptySection>
      ) : (
        <SectionList>
          {items.map((item) => (
            <SectionRow key={item.id}>
              <CircleCheckBig
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{item.name}</span>
                <span className="text-muted-foreground block text-xs">{item.kind}</span>
              </span>
              <span className="text-muted-foreground shrink-0 text-xs">{item.due}</span>
            </SectionRow>
          ))}
        </SectionList>
      )}
    </SectionCard>
  );
}

export async function RecentActivity({ context }: { context: RolloutContext }) {
  const entries = await db.activityLog.findMany({
    where: { rolloutId: context.rollout.id },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      verb: true,
      entityType: true,
      entityName: true,
      createdAt: true,
      actor: { select: { displayName: true, email: true } },
    },
  });
  const now = new Date();

  return (
    <SectionCard title="Recent activity" href="/operations" hrefLabel="Operations">
      {entries.length === 0 ? (
        <EmptySection>
          Nothing yet — every create, edit, and archive lands here as the team works.
        </EmptySection>
      ) : (
        <SectionList>
          {entries.map((entry) => {
            const actor = entry.actor?.displayName || entry.actor?.email || 'Someone';
            return (
              <SectionRow key={entry.id}>
                <span
                  aria-hidden="true"
                  className="bg-muted text-muted-foreground grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-medium"
                >
                  {actor.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{actor}</span>{' '}
                  <span className="text-muted-foreground">
                    {activityText(entry.verb, entry.entityType, entry.entityName)}
                  </span>
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {timeAgo(entry.createdAt, now)}
                </span>
              </SectionRow>
            );
          })}
        </SectionList>
      )}
    </SectionCard>
  );
}
