import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Operations' };

export default function OperationsPage() {
  return (
    <PagePlaceholder
      title="Operations"
      question="What needs attention?"
      description="The daily workspace — tasks, milestones, risks, issues, dependencies, decisions, and action items in one tabbed screen. Arrives after the Release 1 structure (rollouts, programmes, workstreams) exists."
    />
  );
}
