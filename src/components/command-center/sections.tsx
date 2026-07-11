import { CircleAlert, CircleCheckBig, ListChecks, OctagonAlert } from 'lucide-react';
import { db } from '@/lib/db';
import { SectionCard, SectionList, SectionRow } from './section-card';
import { StatusDot } from './vital-signs';
import { activityText, timeAgo } from './activity-format';
import { blockers, myWork, todaysPriorities, upcomingMilestones } from './placeholder-data';

/**
 * The Command Center body sections. Same anatomy everywhere (SectionCard);
 * every section links into the module that owns its data. Recent Activity
 * reads the live activity log; the other sections are still placeholder —
 * see placeholder-data.ts.
 */

export function TodaysPriorities() {
  return (
    <SectionCard
      title="Today's priorities"
      count={todaysPriorities.length}
      href="/operations"
      hrefLabel="Operations"
    >
      <SectionList>
        {todaysPriorities.map((item) => (
          <SectionRow key={item.title}>
            {item.critical ? (
              <CircleAlert className="text-status-critical size-4 shrink-0" aria-label="Critical" />
            ) : (
              <ListChecks className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
            <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
              {item.context}
            </span>
            <span className="text-muted-foreground w-16 shrink-0 text-right text-xs">
              {item.due}
            </span>
          </SectionRow>
        ))}
      </SectionList>
    </SectionCard>
  );
}

export function Blockers() {
  return (
    <SectionCard title="Blockers" count={blockers.length} href="/operations" hrefLabel="Operations">
      <SectionList>
        {blockers.map((item) => (
          <SectionRow key={item.title}>
            <OctagonAlert className="text-status-critical size-4 shrink-0" aria-label="Blocker" />
            <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
            <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
              {item.owner}
            </span>
            <span className="text-status-critical shrink-0 text-xs">{item.age}</span>
          </SectionRow>
        ))}
      </SectionList>
    </SectionCard>
  );
}

export function UpcomingMilestones() {
  return (
    <SectionCard
      title="Upcoming milestones"
      count={upcomingMilestones.length}
      href="/timeline"
      hrefLabel="Timeline"
    >
      <SectionList>
        {upcomingMilestones.map((item) => (
          <SectionRow key={item.name}>
            <span className="text-muted-foreground w-12 shrink-0 text-xs tabular-nums">
              {item.date}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
            <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
              {item.phase}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <StatusDot status={item.status} />
              <span className="text-muted-foreground w-14 text-xs">{item.statusLabel}</span>
            </span>
          </SectionRow>
        ))}
      </SectionList>
    </SectionCard>
  );
}

export function MyWork() {
  return (
    <SectionCard title="My work" count={myWork.length} href="/operations" hrefLabel="Operations">
      <SectionList>
        {myWork.map((item) => (
          <SectionRow key={item.title}>
            <CircleCheckBig className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{item.title}</span>
              <span className="text-muted-foreground block text-xs">{item.kind}</span>
            </span>
            <span className="text-muted-foreground shrink-0 text-xs">{item.due}</span>
          </SectionRow>
        ))}
      </SectionList>
    </SectionCard>
  );
}

export async function RecentActivity({ rolloutId }: { rolloutId: string }) {
  const entries = await db.activityLog.findMany({
    where: { rolloutId },
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
        <p className="text-muted-foreground px-4 py-6 text-sm">
          Nothing yet — every create, edit, and archive lands here as the team works.
        </p>
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
