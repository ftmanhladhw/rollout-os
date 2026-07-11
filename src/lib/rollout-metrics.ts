import type { ReadinessStatus } from '@prisma/client';

/**
 * Rollout vital-sign helpers shared by the Command Center, Reports, and
 * Timeline — pure functions over the single operational dataset (docs/05:
 * views never duplicate data; one metric definition everywhere).
 */

export type ReadinessSummary = {
  ready: number;
  inProgress: number;
  notStarted: number;
  /** All ready → ready · anything started → in_progress · else not_started. */
  overall: ReadinessStatus;
};

export function readinessSummary(dimensions: { status: ReadinessStatus }[]): ReadinessSummary {
  const ready = dimensions.filter((d) => d.status === 'ready').length;
  const inProgress = dimensions.filter((d) => d.status === 'in_progress').length;
  const notStarted = dimensions.length - ready - inProgress;
  const overall: ReadinessStatus =
    dimensions.length > 0 && ready === dimensions.length
      ? 'ready'
      : ready + inProgress > 0
        ? 'in_progress'
        : 'not_started';
  return { ready, inProgress, notStarted, overall };
}

/** Rounded mean of manual workstream progress; 0 when there are none. */
export function averageProgress(workstreams: { progress: number }[]): number {
  if (workstreams.length === 0) return 0;
  const total = workstreams.reduce((sum, w) => sum + w.progress, 0);
  return Math.round(total / workstreams.length);
}

/** Whole days from `today` to `date` (UTC midnights); negative = past. */
export function daysUntil(date: Date, today: Date): number {
  const utc = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((utc(date) - utc(today)) / 86_400_000);
}

/** Human countdown for the Go Live marker. */
export function goLiveCountdown(goLiveDate: Date | null, today: Date): string {
  if (!goLiveDate) return 'No go-live date set';
  const days = daysUntil(goLiveDate, today);
  if (days > 1) return `In ${days} days`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  if (days === -1) return 'Yesterday';
  return `${-days} days ago`;
}
