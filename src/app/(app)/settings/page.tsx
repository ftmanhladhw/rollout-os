import type { Metadata } from 'next';
import { PagePlaceholder } from '@/components/shell/page-placeholder';

export const metadata: Metadata = { title: 'Settings' };

/**
 * Administration entry (users · teams · permissions · templates · settings).
 * Deliberately outside the primary nav — reached from the user menu only
 * (docs/07, Chapter 3). Role-gating via `assertCan()` comes with Release 1.
 */
export default function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      question="How is the workspace configured?"
      description="Users, teams, permissions, templates, and workspace settings — visible only to authorized roles once Release 1 wires organizations and memberships."
    />
  );
}
