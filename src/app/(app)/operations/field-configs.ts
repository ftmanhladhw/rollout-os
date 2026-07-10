import {
  EDITABLE_LIFECYCLE_STATUSES,
  LIFECYCLE_STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/config/terminology';
import type { FieldSpec } from './entity-drawer';

/** Shared select options for the Operations drawers. */

export const STATUS_OPTIONS = EDITABLE_LIFECYCLE_STATUSES.map((value) => ({
  value,
  label: LIFECYCLE_STATUS_LABELS[value],
}));

export const PRIORITY_OPTIONS = (['low', 'medium', 'high', 'critical'] as const).map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

export const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const nameField: FieldSpec = {
  name: 'name',
  label: 'Name',
  type: 'text',
  required: true,
};

export const descriptionField: FieldSpec = {
  name: 'description',
  label: 'Description',
  type: 'textarea',
};

export const statusField: FieldSpec = {
  name: 'status',
  label: 'Status',
  type: 'select',
  options: STATUS_OPTIONS,
};

export const priorityField: FieldSpec = {
  name: 'priority',
  label: 'Priority',
  type: 'select',
  options: PRIORITY_OPTIONS,
};

export const dueDateField: FieldSpec = { name: 'dueDate', label: 'Due date', type: 'date' };

/** YYYY-MM-DD for date inputs; empty string when unset. */
export function toDateInput(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : '';
}
