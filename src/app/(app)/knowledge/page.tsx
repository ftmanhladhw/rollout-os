import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Knowledge' };

export default function KnowledgePage() {
  return (
    <PagePlaceholder
      title="Knowledge"
      question="What do we know?"
      description="Documents, meetings, notes, and updates — referenced, never duplicated. Arrives after the Release 1 structure exists."
    />
  );
}
