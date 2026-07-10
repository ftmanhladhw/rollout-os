import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';
import { db } from '@/lib/db';
import { getOnboardingState } from '@/lib/onboarding';

export const metadata: Metadata = { title: 'Command Center' };

/**
 * The landing destination — Mission Control, not a dashboard (docs/07,
 * Chapter 1). The (app) layout guarantees an organization and rollout exist.
 * Still a placeholder body: the vital signs (Health · Progress · Readiness ·
 * Go Live) and cockpit sections arrive with the next Release 1 slices.
 */
export default async function CommandCenterPage() {
  const state = await getOnboardingState();
  const rollout = await db.rollout.findFirst({
    where: { organizationId: state?.organization?.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { name: true },
  });

  return (
    <PagePlaceholder
      title="Command Center"
      question="What is happening?"
      description={`${rollout?.name ?? 'Your rollout'} is set up with the standard phases and readiness dimensions. Vital signs (Health, Progress, Readiness, Go Live), milestones, risks, and decisions appear here as the rollout takes shape.`}
    />
  );
}
