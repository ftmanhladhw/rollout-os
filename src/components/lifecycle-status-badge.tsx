import type { LifecycleStatus } from '@prisma/client';
import { LIFECYCLE_STATUS_LABELS } from '@/config/terminology';
import { cn } from '@/lib/utils';

/**
 * Lifecycle status chip, shared by every module list/detail. Color follows
 * docs/07 ch.6 semantics — blocked is critical, completed is good, everything
 * else stays neutral — and never appears without the text label.
 */
const STATUS_DOT_CLASS: Record<LifecycleStatus, string> = {
  draft: 'bg-muted-foreground/40',
  planned: 'bg-muted-foreground/40',
  in_progress: 'bg-foreground/70',
  blocked: 'bg-status-critical',
  completed: 'bg-status-good',
  archived: 'bg-muted-foreground/40',
};

export function LifecycleStatusBadge({ status }: { status: LifecycleStatus }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap">
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', STATUS_DOT_CLASS[status])} />
      {LIFECYCLE_STATUS_LABELS[status]}
    </span>
  );
}
