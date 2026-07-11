import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { VitalSigns } from '@/components/command-center/vital-signs';
import {
  Blockers,
  MyWork,
  RecentActivity,
  TodaysPriorities,
  UpcomingMilestones,
} from '@/components/command-center/sections';
import { getRolloutContext } from '@/lib/rollout';

export const metadata: Metadata = { title: 'Command Center' };

/**
 * The Command Center — Mission Control, not a dashboard (docs/07 ch.1).
 * Fully live: every tile and section is a projection of the operational
 * dataset, owned by the module it links to. Priority order per docs/07:
 * vitals → what needs attention → what's coming → my slice → what changed.
 */
export default async function CommandCenterPage() {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground text-sm">{context.rollout.name}</p>
      </header>

      <VitalSigns context={context} />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <TodaysPriorities context={context} />
          <Blockers context={context} />
          <UpcomingMilestones context={context} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <MyWork context={context} />
          <RecentActivity context={context} />
        </div>
      </div>
    </div>
  );
}
