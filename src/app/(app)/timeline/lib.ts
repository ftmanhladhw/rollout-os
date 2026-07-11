import type { LifecycleStatus } from '@prisma/client';

/**
 * Timeline projection helpers — pure functions over the operational dataset
 * (docs/05: views never duplicate data). The page groups dated work by the
 * rollout's configurable phases; these helpers keep that logic testable.
 * The go-live countdown lives in @/lib/rollout-metrics (shared with the
 * Command Center vitals).
 */

export type TimelineItem = {
  id: string;
  kind: 'milestone' | 'meeting';
  name: string;
  status: LifecycleStatus;
  /** dueDate for milestones, meetingDate for meetings; null = unscheduled. */
  date: Date | null;
  phaseId: string | null;
  /** Secondary line: workstream name for milestones, null for meetings. */
  context: string | null;
};

export type PhaseGroup = {
  /** Null for the trailing "no phase" group. */
  phase: { id: string; name: string } | null;
  items: TimelineItem[];
};

/**
 * Group items under the rollout's phases (already in sortOrder), earliest
 * date first inside each group, undated items last. Phases with no items are
 * kept — an empty phase is information ("nothing planned for UAT yet"), not
 * noise. Items without a phase collect in a trailing null group, included
 * only when non-empty.
 */
export function groupByPhase(
  phases: { id: string; name: string }[],
  items: TimelineItem[],
): PhaseGroup[] {
  const byDate = (a: TimelineItem, b: TimelineItem) => {
    if (a.date === null) return b.date === null ? 0 : 1;
    if (b.date === null) return -1;
    return a.date.getTime() - b.date.getTime();
  };

  const groups: PhaseGroup[] = phases.map((phase) => ({
    phase,
    items: items.filter((item) => item.phaseId === phase.id).sort(byDate),
  }));

  const known = new Set(phases.map((phase) => phase.id));
  const unphased = items
    .filter((item) => item.phaseId === null || !known.has(item.phaseId))
    .sort(byDate);
  if (unphased.length > 0) groups.push({ phase: null, items: unphased });

  return groups;
}
