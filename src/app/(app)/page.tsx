import type { Metadata } from 'next';
import { VitalSigns } from '@/components/command-center/vital-signs';
import {
  Blockers,
  MyWork,
  RecentActivity,
  TodaysPriorities,
  UpcomingMilestones,
} from '@/components/command-center/sections';
import { db } from '@/lib/db';
import { getOnboardingState } from '@/lib/onboarding';

export const metadata: Metadata = { title: 'Command Center' };

/**
 * The Command Center — Mission Control, not a dashboard (docs/07 ch.1).
 * Layout and information architecture are real; section content is
 * placeholder until each owning module lands (see placeholder-data.ts).
 * Priority order per docs/07: vitals → what needs attention → what's coming
 * → my slice → what changed.
 */
export default async function CommandCenterPage() {
  const state = await getOnboardingState();
  const rollout = await db.rollout.findFirst({
    where: { organizationId: state?.organization?.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground text-sm">{rollout?.name}</p>
        <p className="text-muted-foreground/70 ml-auto text-xs">
          Sample data — wiring lands with each module
        </p>
      </header>

      <VitalSigns />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <TodaysPriorities />
          <Blockers />
          <UpcomingMilestones />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <MyWork />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
