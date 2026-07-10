import type { ReadinessStatus, RiskLevel } from '@prisma/client';

/**
 * Report aggregation helpers — pure functions so the "reports are generated,
 * never maintained" rule (docs/05) stays unit-testable without a database.
 */

const RISK_LEVEL_SCORE: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

/** Probability × impact on a 1–3 scale each → 1–9; higher = worse. */
export function riskSeverity(probability: RiskLevel, impact: RiskLevel): number {
  return RISK_LEVEL_SCORE[probability] * RISK_LEVEL_SCORE[impact];
}

/** Sort risks worst-first; ties keep their input order (stable sort). */
export function rankRisks<T extends { probability: RiskLevel; impact: RiskLevel }>(
  risks: T[],
): T[] {
  return [...risks].sort(
    (a, b) => riskSeverity(b.probability, b.impact) - riskSeverity(a.probability, a.impact),
  );
}

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

/** Start of the reporting window: `days` before `now`. */
export function windowStart(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 86_400_000);
}
