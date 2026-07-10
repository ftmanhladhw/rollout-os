import { CircleAlert, CircleCheckBig, ListChecks, OctagonAlert } from 'lucide-react';
import { SectionCard, SectionList, SectionRow } from './section-card';
import { StatusDot } from './vital-signs';
import {
  blockers,
  myWork,
  recentActivity,
  todaysPriorities,
  upcomingMilestones,
} from './placeholder-data';

/**
 * The Command Center body sections. Same anatomy everywhere (SectionCard);
 * every section links into the module that owns its data. Content is
 * placeholder — see placeholder-data.ts.
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

export function RecentActivity() {
  return (
    <SectionCard title="Recent activity" href="/knowledge" hrefLabel="Knowledge">
      <SectionList>
        {recentActivity.map((item) => (
          <SectionRow key={`${item.actor}-${item.text}`}>
            <span
              aria-hidden="true"
              className="bg-muted text-muted-foreground grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-medium"
            >
              {item.actor.charAt(0)}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="font-medium">{item.actor}</span>{' '}
              <span className="text-muted-foreground">{item.text}</span>
            </span>
            <span className="text-muted-foreground shrink-0 text-xs">{item.when}</span>
          </SectionRow>
        ))}
      </SectionList>
    </SectionCard>
  );
}
