import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { can } from '@/lib/authz';
import { getRolloutContext } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { MembersTab, RolloutTab } from './tabs';

export const metadata: Metadata = { title: 'Settings' };

/**
 * Administration — deliberately outside the primary nav, reached from the
 * user menu (docs/07 ch.3: "visible only to authorized users"). MVP slice
 * of PRD §7 Administration: Members (org:manage) and Rollout settings
 * (rollout:manage) — teams, templates, and invites are later slices. Each
 * tab is gated by its own action; holders of neither land on /unauthorized
 * like any other denied view (docs/14).
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');

  const canMembers = can(context.ctx, 'org:manage');
  const canRollout = can(context.ctx, 'rollout:manage');
  if (!canMembers && !canRollout) redirect('/unauthorized');

  const tabs = [
    ...(canMembers ? [{ key: 'members', label: 'Members' }] : []),
    ...(canRollout ? [{ key: 'rollout', label: 'Rollout' }] : []),
  ] as const;

  const { tab: rawTab } = await searchParams;
  const fallback = tabs[0]?.key ?? 'rollout';
  const tab = tabs.some((t) => t.key === rawTab) ? rawTab : fallback;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">How is the workspace configured?</p>
      </header>

      <nav
        aria-label="Settings sections"
        className="flex items-center gap-1 overflow-x-auto border-b"
      >
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/settings?tab=${t.key}`}
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
          Teams, templates &amp; invites — later slice
        </span>
      </nav>

      {tab === 'members' && canMembers && <MembersTab context={context} />}
      {tab === 'rollout' && canRollout && <RolloutTab context={context} />}
    </div>
  );
}
