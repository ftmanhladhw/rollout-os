import { cn } from '@/lib/utils';
import { vitals, type Status } from './placeholder-data';

const STATUS_DOT: Record<Status, string> = {
  good: 'bg-status-good',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
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
 * Four stat tiles — label, value, one line of context. Not a dashboard: each
 * tile is a single manual field (or simple roll-up) from the rollout itself.
 */
export function VitalSigns() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Rollout health">
        <div className="flex items-center gap-2">
          <StatusDot status={vitals.health.status} className="size-2.5" />
          <span className="text-2xl font-semibold tracking-tight">{vitals.health.value}</span>
        </div>
        <TileNote>{vitals.health.note}</TileNote>
      </Tile>

      <Tile label="Progress">
        <span className="text-2xl font-semibold tracking-tight">{vitals.progress.percent}%</span>
        <div
          role="meter"
          aria-valuenow={vitals.progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
          className="bg-primary/15 mt-2 h-1 w-full overflow-hidden rounded-full"
        >
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${vitals.progress.percent}%` }}
          />
        </div>
        <TileNote>{vitals.progress.note}</TileNote>
      </Tile>

      <Tile label="Readiness">
        <span className="text-2xl font-semibold tracking-tight">{vitals.readiness.value}</span>
        <div className="mt-2 flex items-center gap-1.5">
          {vitals.readiness.dimensions.map((d) => (
            <StatusDot key={d.name} status={d.status} />
          ))}
        </div>
        <TileNote>{vitals.readiness.note}</TileNote>
      </Tile>

      <Tile label="Go live">
        <span className="text-2xl font-semibold tracking-tight">{vitals.goLive.value}</span>
        <TileNote>{vitals.goLive.note}</TileNote>
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
