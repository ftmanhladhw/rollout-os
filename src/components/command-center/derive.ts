import type { LifecycleStatus, ReadinessStatus } from '@prisma/client';
import { daysUntil } from '@/lib/rollout-metrics';

/**
 * Pure derivations for the Command Center — the copy and status-semantics
 * rules live here so they are unit-testable (docs/07 ch.6: color carries
 * meaning, and never without a text label).
 */

export type Status = 'good' | 'warning' | 'critical';

export const READINESS_STATUS_DOT: Record<ReadinessStatus, Status | null> = {
  ready: 'good',
  in_progress: 'warning',
  not_started: null,
};

/** Compact due-date copy for work lists; overdue is called out explicitly. */
export function dueLabel(dueDate: Date | null, today: Date): string {
  if (!dueDate) return '—';
  const days = daysUntil(dueDate, today);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Milestone signal for the Upcoming list: blocked → critical, due within a
 * week (or overdue) → warning, otherwise on track. Completed milestones
 * never reach this list.
 */
export function milestoneSignal(
  status: LifecycleStatus,
  dueDate: Date | null,
  today: Date,
): { status: Status; label: string } {
  if (status === 'blocked') return { status: 'critical', label: 'Blocked' };
  if (dueDate) {
    const days = daysUntil(dueDate, today);
    if (days < 0) return { status: 'critical', label: 'Overdue' };
    if (days <= 7) return { status: 'warning', label: 'Due soon' };
  }
  return { status: 'good', label: 'On track' };
}

/** A priority item is urgent when overdue/imminent or explicitly critical. */
export function isUrgent(
  priority: 'low' | 'medium' | 'high' | 'critical',
  dueDate: Date | null,
  today: Date,
): boolean {
  if (priority === 'critical') return true;
  return dueDate !== null && daysUntil(dueDate, today) <= 0;
}
