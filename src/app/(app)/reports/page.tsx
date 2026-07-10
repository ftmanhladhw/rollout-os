import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Reports' };

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="Reports"
      question="What should we communicate?"
      description="Four reports — Executive, Weekly, Risk, Readiness — generated from operational data, never maintained by hand. Arrives once there is operational data to generate from."
    />
  );
}
