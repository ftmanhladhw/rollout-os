import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Timeline' };

export default function TimelinePage() {
  return (
    <PagePlaceholder
      title="Timeline"
      question="When is it happening?"
      description="The rollout in chronological order, organized by phase — Discovery through Hypercare and Closure. Arrives once rollouts carry phases and milestones."
    />
  );
}
