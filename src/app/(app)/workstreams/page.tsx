import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Workstreams' };

export default function WorkstreamsPage() {
  return (
    <PagePlaceholder
      title="Workstreams"
      question="Who is doing the work?"
      description="Each workstream's overview, tasks, milestones, issues, risks, documents, and meetings. Workstream CRUD is part of Release 1 (PRD §18)."
    />
  );
}
