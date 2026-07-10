import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Command Center' };

/**
 * The landing destination — Mission Control, not a dashboard (docs/07,
 * Chapter 1). Placeholder until Release 1 gives it real vital signs
 * (Health · Progress · Readiness · Go Live) and body sections.
 */
export default function CommandCenterPage() {
  return (
    <PagePlaceholder
      title="Command Center"
      question="What is happening?"
      description="The morning cockpit for the selected rollout — vital signs (Health, Progress, Readiness, Go Live), programs, upcoming milestones, open risks, and recent decisions. It fills in once Release 1 lands rollouts and programmes."
    />
  );
}
