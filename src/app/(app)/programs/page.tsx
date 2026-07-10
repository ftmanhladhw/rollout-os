import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { PRIORITY_LABELS } from '@/config/terminology';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { NewProgrammeSheet } from './new-programme-sheet';

export const metadata: Metadata = { title: 'Programs' };

/**
 * Programme list — answers "What are we delivering?" (docs/07). Rows are
 * scoped to the current rollout; users without internal:view (client role)
 * see client-visible programmes only. Archived (soft-deleted) rows never
 * appear.
 */
export default async function ProgramsPage() {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  const canManage = can(context.ctx, 'structure:manage');
  const seesInternal = can(context.ctx, 'internal:view');

  const programmes = await db.programme.findMany({
    where: {
      rolloutId: context.rollout.id,
      deletedAt: null,
      ...(seesInternal ? {} : { visibility: 'client' as const }),
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      status: true,
      priority: true,
      updatedAt: true,
      _count: { select: { workstreams: { where: { deletedAt: null } } } },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Programs</h1>
          <p className="text-muted-foreground mt-1 text-sm">What are we delivering?</p>
        </div>
        {canManage && <NewProgrammeSheet className="ml-auto" />}
      </header>

      {programmes.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="text-sm font-medium">No programmes yet</p>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-sm text-balance">
            Programmes are the major delivery objectives of {context.rollout.name} — each one groups
            the workstreams doing the work.
          </p>
          {canManage && (
            <div className="mt-5">
              <NewProgrammeSheet label="Create your first programme" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs">
                <th className="h-9 px-4 font-medium">Name</th>
                <th className="h-9 px-4 font-medium">Status</th>
                <th className="hidden h-9 px-4 font-medium sm:table-cell">Priority</th>
                <th className="hidden h-9 px-4 font-medium sm:table-cell">Workstreams</th>
                <th className="hidden h-9 px-4 text-right font-medium md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programmes.map((programme) => (
                <tr key={programme.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/programs/${programme.id}`}
                      className="font-medium hover:underline"
                    >
                      {programme.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <LifecycleStatusBadge status={programme.status} />
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 sm:table-cell">
                    {PRIORITY_LABELS[programme.priority]}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 tabular-nums sm:table-cell">
                    {programme._count.workstreams}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 text-right md:table-cell">
                    {programme.updatedAt.toLocaleDateString('en-GB', {
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
