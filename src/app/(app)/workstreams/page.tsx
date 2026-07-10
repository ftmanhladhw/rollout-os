import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { NewWorkstreamSheet } from './new-workstream-sheet';

export const metadata: Metadata = { title: 'Workstreams' };

/**
 * Workstream list — answers "Who is doing the work?" (docs/07). Rollout-
 * scoped; client role sees client-visible rows only. Creating requires an
 * existing programme (Domain Rule 2), so the empty state routes there first.
 */
export default async function WorkstreamsPage() {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  const canManage = can(context.ctx, 'structure:manage');
  const seesInternal = can(context.ctx, 'internal:view');
  const visibilityFilter = seesInternal ? {} : { visibility: 'client' as const };

  const [workstreams, programmes] = await Promise.all([
    db.workstream.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibilityFilter },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
        progress: true,
        updatedAt: true,
        programme: { select: { name: true } },
      },
    }),
    db.programme.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null, ...visibilityFilter },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workstreams</h1>
          <p className="text-muted-foreground mt-1 text-sm">Who is doing the work?</p>
        </div>
        {canManage && programmes.length > 0 && (
          <NewWorkstreamSheet programmes={programmes} className="ml-auto" />
        )}
      </header>

      {workstreams.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="text-sm font-medium">No workstreams yet</p>
          {programmes.length === 0 ? (
            <>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-sm text-balance">
                Workstreams belong to programmes, and there are no programmes yet — create one
                first.
              </p>
              <div className="mt-5">
                <Link
                  href="/programs"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Go to Programs →
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-sm text-balance">
                Workstreams are the teams&apos; slices of {context.rollout.name} — Engineering,
                Training, Data, and the like — each attached to a programme.
              </p>
              {canManage && (
                <div className="mt-5">
                  <NewWorkstreamSheet
                    programmes={programmes}
                    label="Create your first workstream"
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-card overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs">
                <th className="h-9 px-4 font-medium">Name</th>
                <th className="hidden h-9 px-4 font-medium sm:table-cell">Programme</th>
                <th className="h-9 px-4 font-medium">Status</th>
                <th className="hidden h-9 px-4 font-medium md:table-cell">Progress</th>
                <th className="hidden h-9 px-4 text-right font-medium md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {workstreams.map((workstream) => (
                <tr key={workstream.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/workstreams/${workstream.id}`}
                      className="font-medium hover:underline"
                    >
                      {workstream.name}
                    </Link>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 sm:table-cell">
                    {workstream.programme.name}
                  </td>
                  <td className="px-4 py-2.5">
                    <LifecycleStatusBadge status={workstream.status} />
                  </td>
                  <td className="hidden px-4 py-2.5 md:table-cell">
                    <span className="flex items-center gap-2">
                      <span className="bg-primary/15 h-1 w-16 overflow-hidden rounded-full">
                        <span
                          className="bg-primary block h-full rounded-full"
                          style={{ width: `${workstream.progress}%` }}
                        />
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {workstream.progress}%
                      </span>
                    </span>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 text-right md:table-cell">
                    {workstream.updatedAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
