import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getRolloutContext } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { DocumentsTab, MeetingsTab, NotesTab, UpdatesTab } from './tabs';

export const metadata: Metadata = { title: 'Knowledge' };

const TABS = [
  { key: 'documents', label: 'Documents' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'notes', label: 'Notes' },
  { key: 'updates', label: 'Updates' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Knowledge — the central knowledge hub, one screen with tabs (docs/05):
 * Documents · Meetings · Notes · Updates, the PRD §18 Release 3 set.
 * Documents are referenced, never duplicated. Meeting participants and
 * meeting-generated action items follow in a later slice (they need the
 * Administration module's stakeholder management).
 */
export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'documents';

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Knowledge</h1>
        <p className="text-muted-foreground mt-1 text-sm">What do we know?</p>
      </header>

      <nav
        aria-label="Knowledge sections"
        className="flex items-center gap-1 overflow-x-auto border-b"
      >
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/knowledge?tab=${t.key}`}
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
          Meeting participants &amp; actions — later slice
        </span>
      </nav>

      {tab === 'documents' && <DocumentsTab context={context} />}
      {tab === 'meetings' && <MeetingsTab context={context} />}
      {tab === 'notes' && <NotesTab context={context} />}
      {tab === 'updates' && <UpdatesTab context={context} />}
    </div>
  );
}
