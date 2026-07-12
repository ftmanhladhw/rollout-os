import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  CircleAlert,
  FileText,
  FolderKanban,
  Layers,
  LayoutDashboard,
  ListChecks,
  OctagonAlert,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Faithful, presentational recreations of the real Rollout OS screens, rebuilt
 * from the shipped component anatomy (vital-signs tiles, SectionCard, status
 * dots, lifecycle badges, the seven-item shell nav). No live data and no server
 * calls — sample content is deliberately domain-neutral (never a real partner,
 * programme, or date). These render as actual application UI, not screenshots,
 * so they stay responsive and theme-aware inside the pitch.
 */

type PreviewKey = 'command-center' | 'workstream' | 'operations';

const NAV: { label: string; icon: LucideIcon; key: PreviewKey | null }[] = [
  { label: 'Command Center', icon: LayoutDashboard, key: 'command-center' },
  { label: 'Programs', icon: FolderKanban, key: null },
  { label: 'Workstreams', icon: Layers, key: 'workstream' },
  { label: 'Operations', icon: ListChecks, key: 'operations' },
  { label: 'Knowledge', icon: BookOpen, key: null },
  { label: 'Timeline', icon: CalendarRange, key: null },
  { label: 'Reports', icon: FileText, key: null },
];

const DOT: Record<'good' | 'warning' | 'critical', string> = {
  good: 'bg-status-good',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
};

function Dot({ status, className }: { status: keyof typeof DOT; className?: string }) {
  return (
    <span aria-hidden className={cn('size-2 shrink-0 rounded-full', DOT[status], className)} />
  );
}

function Badge({ label, dot }: { label: string; dot: string }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap">
      <span aria-hidden className={cn('size-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}

/** macOS-style browser frame — the polished window the prompt asks for. */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-card overflow-hidden rounded-xl border shadow-xl shadow-black/5 dark:shadow-black/40',
        className,
      )}
    >
      <div className="bg-muted/50 flex h-9 items-center gap-2 border-b px-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="bg-background text-muted-foreground mx-auto flex h-5 max-w-[60%] items-center gap-1.5 rounded-md border px-2 text-[11px]">
          <span className="bg-status-good size-1.5 rounded-full" aria-hidden />
          <span className="truncate">{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * The authenticated shell: sidebar + page area, one nav item active. Two
 * container contexts so the same preview adapts to its own width (hero,
 * demo, and lightbox render it at very different sizes) rather than the
 * viewport: `frame` gates the sidebar, `pane` gates the content grids.
 */
function Shell({ active, children }: { active: PreviewKey; children: React.ReactNode }) {
  return (
    <div className="@container/frame flex min-h-[22rem]">
      <aside className="bg-sidebar hidden w-44 shrink-0 flex-col border-r @sm/frame:flex">
        <div className="flex h-11 items-center gap-2 px-3 text-[13px] font-semibold tracking-tight">
          <span
            aria-hidden
            className="bg-primary text-primary-foreground grid size-5 place-items-center rounded text-[11px] font-bold"
          >
            R
          </span>
          Rollout OS
        </div>
        <nav className="flex flex-col gap-0.5 px-2 py-2">
          {NAV.map((item) => (
            <span
              key={item.label}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]',
                item.key === active
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </span>
          ))}
        </nav>
      </aside>
      <div className="bg-background @container/pane min-w-0 flex-1 p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Tile({
  label,
  value,
  note,
  dot,
  children,
}: {
  label: string;
  value: string;
  note: string;
  dot?: keyof typeof DOT;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-card flex min-w-0 flex-col rounded-lg border p-3">
      <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">{label}</p>
      <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
        {dot && <Dot status={dot} className="size-2.5" />}
        {value}
      </span>
      {children}
      <p className="text-muted-foreground mt-1.5 truncate text-[11px]">{note}</p>
    </div>
  );
}

function SectionCard({
  title,
  count,
  href,
  children,
}: {
  title: string;
  count?: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card min-w-0 rounded-lg border">
      <header className="flex h-10 items-center gap-2 border-b px-3">
        <h3 className="text-[13px] font-medium">{title}</h3>
        {count !== undefined && (
          <span className="text-muted-foreground text-[11px] tabular-nums">{count}</span>
        )}
        <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-[11px]">
          {href}
          <ArrowRight className="size-3" aria-hidden />
        </span>
      </header>
      <ul className="divide-y">{children}</ul>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <li className="flex min-w-0 items-center gap-2.5 px-3 py-2 text-[13px]">{children}</li>;
}

export function CommandCenterPreview() {
  return (
    <Shell active="command-center">
      <div className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline gap-x-2.5">
          <h2 className="text-base font-semibold tracking-tight">Command Center</h2>
          <p className="text-muted-foreground text-xs">Platform Migration</p>
        </header>

        <div className="grid grid-cols-2 gap-2.5 @lg/pane:grid-cols-4">
          <Tile label="Rollout health" value="On track" note="Manual assessment" dot="good" />
          <Tile label="Progress" value="68%" note="Mean of 6 workstreams">
            <div className="bg-primary/15 mt-1.5 h-1 w-full overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: '68%' }} />
            </div>
          </Tile>
          <Tile label="Readiness" value="Nearly ready" note="4 of 5 dimensions ready">
            <div className="mt-1.5 flex gap-1">
              <Dot status="good" />
              <Dot status="good" />
              <Dot status="good" />
              <Dot status="good" />
              <Dot status="warning" />
            </div>
          </Tile>
          <Tile label="Go live" value="14 Mar" note="in 38 days" />
        </div>

        <div className="grid gap-3 @2xl/pane:grid-cols-3">
          <div className="flex flex-col gap-3 @2xl/pane:col-span-2">
            <SectionCard title="Today's priorities" count={4} href="Operations">
              {[
                ['Finalize data mapping', 'Migration', 'Today', true],
                ['Approve training curriculum', 'Enablement', 'Tomorrow', false],
                ['Confirm cutover window', 'Go Live', '2 days', false],
                ['Sign off UAT plan', 'Pilot', '3 days', false],
              ].map(([name, ms, due, urgent]) => (
                <Row key={name as string}>
                  {urgent ? (
                    <CircleAlert className="text-status-critical size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <ListChecks className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                  <span className="text-muted-foreground hidden shrink-0 text-[11px] @sm/pane:inline">
                    {ms}
                  </span>
                  <span
                    className={cn(
                      'w-14 shrink-0 text-right text-[11px]',
                      urgent ? 'text-status-critical' : 'text-muted-foreground',
                    )}
                  >
                    {due}
                  </span>
                </Row>
              ))}
            </SectionCard>

            <SectionCard title="Blockers" count={1} href="Operations">
              <Row>
                <OctagonAlert className="text-status-critical size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">Sandbox access pending vendor</span>
                <span className="text-muted-foreground hidden shrink-0 text-[11px] @sm/pane:inline">
                  Integrations
                </span>
                <span className="text-status-critical shrink-0 text-[11px]">2d</span>
              </Row>
            </SectionCard>
          </div>

          <SectionCard title="Recent activity" href="Operations">
            {[
              ['A', 'Amir', 'completed a task', '1h'],
              ['J', 'Jo', 'raised a risk', '3h'],
              ['P', 'Priya', 'recorded a decision', '5h'],
              ['M', 'Marco', 'updated a milestone', '1d'],
            ].map(([initial, who, what, when]) => (
              <Row key={who as string}>
                <span
                  aria-hidden
                  className="bg-muted text-muted-foreground grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-medium"
                >
                  {initial}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{who}</span>{' '}
                  <span className="text-muted-foreground">{what}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px]">{when}</span>
              </Row>
            ))}
          </SectionCard>
        </div>
      </div>
    </Shell>
  );
}

export function WorkstreamPreview() {
  return (
    <Shell active="workstream">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-semibold tracking-tight">Data Migration</h2>
            <Badge label="In progress" dot="bg-foreground/70" />
          </div>
          <div className="flex max-w-xs items-center gap-2">
            <div className="bg-primary/15 h-1 flex-1 overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: '72%' }} />
            </div>
            <span className="text-muted-foreground text-[11px] tabular-nums">72%</span>
          </div>
        </header>

        {/* Context before execution: the brief comes first. */}
        <section className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground mb-3 text-[11px] font-medium tracking-wide uppercase">
            Brief
          </p>
          <p className="text-[13px] leading-relaxed">
            Move all customer and transaction records from the legacy platform to the new system
            with zero data loss, validated against source before cutover.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] @lg/pane:grid-cols-4">
            {[
              ['Owner', 'Priya N.'],
              ['Tenants', 'East · West'],
              ['Phase', 'Migration'],
              ['State', 'Validation'],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-muted-foreground text-[11px]">{k}</dt>
                <dd className="truncate font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <SectionCard title="Milestones" count={3} href="Operations">
          {[
            ['Mapping signed off', 'completed', 'bg-status-good', 'Completed'],
            ['Dry-run migration', 'in progress', 'bg-foreground/70', 'In progress'],
            ['Production cutover', 'planned', 'bg-muted-foreground/40', 'Planned'],
          ].map(([name, , dot, label]) => (
            <Row key={name as string}>
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <Badge label={label as string} dot={dot as string} />
            </Row>
          ))}
        </SectionCard>
      </div>
    </Shell>
  );
}

export function OperationsPreview() {
  const tabs = ['Milestones', 'Tasks', 'Risks', 'Issues', 'Decisions'];
  const rows: [string, string, string, string, string][] = [
    ['Finalize data mapping', 'In progress', 'bg-foreground/70', 'High', 'Today'],
    ['Build reconciliation report', 'Blocked', 'bg-status-critical', 'High', '—'],
    ['Draft training curriculum', 'In progress', 'bg-foreground/70', 'Medium', 'Tomorrow'],
    ['Configure SSO', 'Completed', 'bg-status-good', 'Medium', '10 Feb'],
    ['Prepare cutover runbook', 'Planned', 'bg-muted-foreground/40', 'Low', '3 days'],
  ];
  return (
    <Shell active="operations">
      <div className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline gap-x-2.5">
          <h2 className="text-base font-semibold tracking-tight">Operations</h2>
          <p className="text-muted-foreground text-xs">Actions, risks, issues & decisions</p>
        </header>

        <div className="flex gap-1 border-b text-[13px]">
          {tabs.map((t, i) => (
            <span
              key={t}
              className={cn(
                '-mb-px border-b-2 px-3 py-1.5',
                i === 1
                  ? 'border-primary text-foreground font-medium'
                  : 'text-muted-foreground border-transparent',
              )}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="bg-card overflow-hidden rounded-lg border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-[11px]">
                <th className="h-8 px-3 font-medium">Name</th>
                <th className="h-8 px-3 font-medium">Status</th>
                <th className="hidden h-8 px-3 font-medium @md/pane:table-cell">Priority</th>
                <th className="hidden h-8 px-3 font-medium @md/pane:table-cell">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(([name, label, dot, priority, due]) => (
                <tr key={name}>
                  <td className="px-3 py-2 font-medium">{name}</td>
                  <td className="px-3 py-2">
                    <Badge label={label} dot={dot} />
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-2 @md/pane:table-cell">
                    {priority}
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-2 @md/pane:table-cell">
                    {due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
