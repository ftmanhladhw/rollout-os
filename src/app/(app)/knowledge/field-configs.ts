import { DOCUMENT_TYPE_LABELS, UPDATE_TYPE_LABELS } from '@/config/terminology';

/** Knowledge-specific select options; shared specs live in @/components/entity-fields. */

export const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const UPDATE_TYPE_OPTIONS = Object.entries(UPDATE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
