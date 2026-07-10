import type { LifecycleStatus, Priority } from '@prisma/client';

/**
 * Display labels for stored enum values. This is the seed of the terminology
 * layer (product pillar): stored values never change, labels are what users
 * see and will eventually be relabelable per organization. Until then, one
 * canonical label set lives here — never render a raw enum value.
 */

export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
  draft: 'Draft',
  planned: 'Planned',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
  archived: 'Archived',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

/**
 * Statuses a user may set directly. `archived` is deliberately absent —
 * archival is the soft-delete action (docs/09), not a status edit.
 */
export const EDITABLE_LIFECYCLE_STATUSES = [
  'draft',
  'planned',
  'in_progress',
  'blocked',
  'completed',
] as const satisfies readonly LifecycleStatus[];
