import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CalendarClock, Flag } from 'lucide-react';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { goLiveCountdown } from '@/lib/rollout-metrics';
import { groupByPhase, type TimelineItem } from './lib';

export const metadata: Metadata = { title: 'Timeline' };

/**
 * Timeline — answers "When is it happening?" (docs/07: think Linear —
 * simple, fast). A pure projection: the rollout's phases in order, each
 * listing its dated work (milestones and meetings), plus the Go Live
 * marker. Nothing here owns data — assign phases and dates in Operations
 * and Knowledge and this page reflects them. Deliverables join the
 * projection when their module lands.
 */
export default async function TimelinePage() {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  const seesInternal = can(context.ctx, 'internal:view');
  const visibilityFilter = seesInternal ? {} : { visibility: 'client' as const };

  const [rollout, phases, milestones, meetings] = await Promise.all([
    db.rollout.findFirst({
      where: { id: context.rollout.id },
      select: { goLiveDate: true },
    }),
    db.phase.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
    db.milestone.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibilityFilter },
      select: {
        id: true,
        name: true,
        status: true,
        dueDate: true,
        phaseId: true,
        workstream: { select: { name: true } },
      },
    }),
    db.meeting.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibilityFilter },
      select: { id: true, name: true, status: true, meetingDate: true, phaseId: true },
    }),
  ]);

  const items: TimelineItem[] = [
    ...milestones.map((m): TimelineItem => ({
      id: m.id,
      kind: 'milestone',
      name: m.name,
      status: m.status,
      date: m.dueDate,
      phaseId: m.phaseId,
      context: m.workstream.name,
    })),
    ...meetings.map((m): TimelineItem => ({
      id: m.id,
      kind: 'meeting',
      name: m.name,
      status: m.status,
      date: m.meetingDate,
      phaseId: m.phaseId,
      context: null,
    })),
  ];
  const groups = groupByPhase(phases, items);
  const scheduled = items.filter((item) => item.date !== null).length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">When is it happening?</p>
        </div>
        <div className="bg-card ml-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2">
          <Flag aria-hidden className="text-muted-foreground size-4" />
          <div>
            <p className="text-xs font-medium">
              Go live ·{' '}
              {rollout?.goLiveDate
                ? rollout.goLiveDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'not set'}
            </p>
            <p className="text-muted-foreground text-xs">
              {goLiveCountdown(rollout?.goLiveDate ?? null, new Date())}
            </p>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="text-sm font-medium">Nothing on the timeline yet</p>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-sm text-balance">
            The timeline is a projection of the work you plan elsewhere — create milestones in
            Operations and meetings in Knowledge, give them dates and phases, and they appear here
            in order.
          </p>
        </div>
      ) : (
        <>
          {scheduled < items.length && (
            <p className="text-muted-foreground/70 text-xs">
              {items.length - scheduled} of {items.length} items have no date yet — they sort last
              inside their phase.
            </p>
          )}
          <ol className="flex flex-col gap-6">
            {groups.map((group) => (
              <li key={group.phase?.id ?? 'unphased'}>
                <h2 className="text-sm font-semibold tracking-tight">
                  {group.phase?.name ?? 'No phase assigned'}
                </h2>
                {group.items.length === 0 ? (
                  <p className="text-muted-foreground/70 mt-2 border-l pl-4 text-xs">
                    Nothing planned in this phase.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 border-l">
                    {group.items.map((item) => (
                      <li
                        key={`${item.kind}-${item.id}`}
                        className="hover:bg-accent/40 -ml-px flex items-center gap-3 border-l border-transparent py-1.5 pr-2 pl-4 transition-colors"
                      >
                        <CalendarClock
                          aria-hidden
                          className={`size-4 shrink-0 ${item.kind === 'meeting' ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.kind === 'milestone' ? 'Milestone' : 'Meeting'}
                            {item.context ? ` · ${item.context}` : ''}
                          </p>
                        </div>
                        <LifecycleStatusBadge status={item.status} />
                        <span className="text-muted-foreground w-16 shrink-0 text-right text-xs tabular-nums">
                          {item.date
                            ? item.date.toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
