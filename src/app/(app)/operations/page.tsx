import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getRolloutContext } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { DecisionsTab, IssuesTab, MilestonesTab, RisksTab, TasksTab } from './tabs';

export const metadata: Metadata = { title: 'Operations' };

const TABS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'risks', label: 'Risks' },
  { key: 'issues', label: 'Issues' },
  { key: 'decisions', label: 'Decisions' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Operations — the daily workspace, one screen with tabs (docs/07). This
 * slice ships the PRD §18 Release 2 set: Tasks · Milestones · Risks ·
 * Issues · Decisions. Dependencies and Action Items follow in a later
 * slice (not in the release plan's set).
 */
export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'tasks';

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Operations</h1>
        <p className="text-muted-foreground mt-1 text-sm">What needs attention?</p>
      </header>

      <nav
        aria-label="Operations sections"
        className="flex items-center gap-1 overflow-x-auto border-b"
      >
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/operations?tab=${t.key}`}
            aria-current={tab === t.key ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors',
              tab === t.key
                ? 'border-foreground text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {t.label}
          </Link>
        ))}
        <span className="text-muted-foreground/60 ml-auto hidden px-3 text-xs whitespace-nowrap lg:inline">
          Dependencies &amp; Action Items — later slice
        </span>
      </nav>

      {tab === 'tasks' && <TasksTab context={context} />}
      {tab === 'milestones' && <MilestonesTab context={context} />}
      {tab === 'risks' && <RisksTab context={context} />}
      {tab === 'issues' && <IssuesTab context={context} />}
      {tab === 'decisions' && <DecisionsTab context={context} />}
    </div>
  );
}
