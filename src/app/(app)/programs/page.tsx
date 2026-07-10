import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Programs' };

export default function ProgramsPage() {
  return (
    <PagePlaceholder
      title="Programs"
      question="What are we delivering?"
      description="Every programme in the rollout with its own health, workstreams, and milestones. Programme CRUD is part of Release 1 (PRD §18)."
    />
  );
}
