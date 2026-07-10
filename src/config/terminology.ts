import type {
  DocumentType,
  Health,
  LifecycleStatus,
  Priority,
  ReadinessStatus,
  RiskLevel,
  UpdateType,
} from '@prisma/client';

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

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  prd: 'PRD',
  architecture: 'Architecture',
  design: 'Design',
  meeting_notes: 'Meeting notes',
  kt: 'Knowledge transfer',
  recording: 'Recording',
  presentation: 'Presentation',
  spreadsheet: 'Spreadsheet',
  release_notes: 'Release notes',
  contract: 'Contract',
  other: 'Other',
};

export const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  executive: 'Executive',
};

export const HEALTH_LABELS: Record<Health, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
};

export const READINESS_STATUS_LABELS: Record<ReadinessStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
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
