import type { Health } from '@prisma/client';
import { HEALTH_LABELS, READINESS_STATUS_LABELS } from '@/config/terminology';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import { averageProgress, goLiveCountdown, readinessSummary } from '@/lib/rollout-metrics';
import type { RolloutContext } from '@/lib/rollout';
import { cn } from '@/lib/utils';
import { READINESS_STATUS_DOT, type Status } from './derive';

const STATUS_DOT: Record<Status, string> = {
  good: 'bg-status-good',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
};

const HEALTH_STATUS: Record<Health, Status> = {
  green: 'good',
  amber: 'warning',
  red: 'critical',
};

/** Color never carries meaning alone — every dot sits beside a text label. */
export function StatusDot({ status, className }: { status: Status | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-2 shrink-0 rounded-full',
        status ? STATUS_DOT[status] : 'bg-muted-foreground/25',
        className,
      )}
    />
  );
}

/**
 * The vital-signs strip (docs/07): Health · Progress · Readiness · Go Live.
 * Live data: each tile is a manual field (or simple roll-up) from the
 * rollout itself — health and readiness are set in Settings, progress is
 * the mean of manual workstream progress (same definition as Reports).
 */
export async function VitalSigns({ context }: { context: RolloutContext }) {
  const seesInternal = can(context.ctx, 'internal:view');
  const [rollout, workstreams, dimensions] = await Promise.all([
    db.rollout.findFirst({
      where: { id: context.rollout.id },
      select: { health: true, goLiveDate: true },
    }),
    db.workstream.findMany({
      where: {
        rolloutId: context.rollout.id,
        deletedAt: null,
        ...(seesInternal ? {} : { visibility: 'client' as const }),
      },
      select: { progress: true },
    }),
    db.readinessDimension.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      select: { name: true, status: true },
    }),
  ]);
  if (!rollout) return null;

  const progress = averageProgress(workstreams);
  const readiness = readinessSummary(dimensions);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Rollout health">
        <div className="flex items-center gap-2">
          <StatusDot status={HEALTH_STATUS[rollout.health]} className="size-2.5" />
          <span className="text-2xl font-semibold tracking-tight">
            {HEALTH_LABELS[rollout.health]}
          </span>
        </div>
        <TileNote>Manual assessment — set in Settings</TileNote>
      </Tile>

      <Tile label="Progress">
        <span className="text-2xl font-semibold tracking-tight">{progress}%</span>
        <div
          role="meter"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
          className="bg-primary/15 mt-2 h-1 w-full overflow-hidden rounded-full"
        >
          <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <TileNote>
          Mean of {workstreams.length} workstream{workstreams.length === 1 ? '' : 's'}
        </TileNote>
      </Tile>

      <Tile label="Readiness">
        <span className="text-2xl font-semibold tracking-tight">
          {READINESS_STATUS_LABELS[readiness.overall]}
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          {dimensions.map((d) => (
            <StatusDot key={d.name} status={READINESS_STATUS_DOT[d.status]} />
          ))}
        </div>
        <TileNote>
          {readiness.ready} of {dimensions.length} dimensions ready
        </TileNote>
      </Tile>

      <Tile label="Go live">
        <span className="text-2xl font-semibold tracking-tight">
          {rollout.goLiveDate
            ? rollout.goLiveDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : 'Not set'}
        </span>
        <TileNote>{goLiveCountdown(rollout.goLiveDate, new Date())}</TileNote>
      </Tile>
    </div>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card flex min-w-0 flex-col rounded-lg border p-4">
      <p className="text-muted-foreground mb-2 text-xs font-medium">{label}</p>
      {children}
    </div>
  );
}

function TileNote({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mt-2 truncate text-xs">{children}</p>;
}
