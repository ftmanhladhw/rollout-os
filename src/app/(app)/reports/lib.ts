import type { RiskLevel } from '@prisma/client';

/**
 * Report aggregation helpers — pure functions so the "reports are generated,
 * never maintained" rule (docs/05) stays unit-testable without a database.
 * Progress/readiness roll-ups live in @/lib/rollout-metrics (shared with the
 * Command Center vitals).
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

/** Start of the reporting window: `days` before `now`. */
export function windowStart(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 86_400_000);
}
