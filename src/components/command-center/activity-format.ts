import type { ActivityVerb, EntityType } from '@prisma/client';
import { ACTIVITY_VERB_LABELS, ENTITY_TYPE_LABELS } from '@/config/terminology';

/**
 * Pure formatting for the activity feed — kept out of the component so the
 * copy rules are unit-testable.
 */

/** `created task “Write checklist”` — actor renders separately, bolded. */
export function activityText(verb: ActivityVerb, entityType: EntityType, name: string): string {
  return `${ACTIVITY_VERB_LABELS[verb]} ${ENTITY_TYPE_LABELS[entityType]} “${name}”`;
}

/** Compact relative time; beyond a week it becomes a short date. */
export function timeAgo(date: Date, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
