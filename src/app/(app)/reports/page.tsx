import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireCan } from '@/lib/authz';
import { getRolloutContext } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { ExecutiveReport, ReadinessReport, RiskReport, WeeklyReport } from './tabs';

export const metadata: Metadata = { title: 'Reports' };

const TABS = [
  { key: 'executive', label: 'Executive' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'risk', label: 'Risk' },
  { key: 'readiness', label: 'Readiness' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Reports — answers "What should we communicate?" (docs/07: four reports,
 * not a hundred). Generated from operational data at request time, never
 * maintained by hand. Viewing requires reports:generate (docs/14) — the
 * first module page behind requireCan; engineering and client roles land
 * on /unauthorized.
 */
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ report?: string }>;
}) {
  const { report: rawTab } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'executive';

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  requireCan(context.ctx, 'reports:generate');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">What should we communicate?</p>
      </header>

      <nav aria-label="Report types" className="flex items-center gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/reports?report=${t.key}`}
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
      </nav>

      {tab === 'executive' && <ExecutiveReport context={context} />}
      {tab === 'weekly' && <WeeklyReport context={context} />}
      {tab === 'risk' && <RiskReport context={context} />}
      {tab === 'readiness' && <ReadinessReport context={context} />}
    </div>
  );
}
