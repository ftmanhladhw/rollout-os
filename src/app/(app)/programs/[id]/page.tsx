import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { PRIORITY_LABELS } from '@/config/terminology';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { ProgrammeEditor } from './programme-editor';

export const metadata: Metadata = { title: 'Programme' };

/**
 * Programme detail — the first instance of the universal detail template
 * (docs/07: same layout everywhere). Lookup is scoped to the caller's
 * rollout and visibility, so a foreign or archived id is a 404, never a
 * leak. Related workstreams render as a count until that module lands.
 */
export default async function ProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  const canManage = can(context.ctx, 'structure:manage');
  const seesInternal = can(context.ctx, 'internal:view');

  const programme = await db.programme.findFirst({
    where: {
      id,
      rolloutId: context.rollout.id,
      deletedAt: null,
      ...(seesInternal ? {} : { visibility: 'client' as const }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      updatedAt: true,
      _count: { select: { workstreams: { where: { deletedAt: null } } } },
    },
  });
  if (!programme) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{programme.name}</h1>
          <LifecycleStatusBadge status={programme.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          {PRIORITY_LABELS[programme.priority]} priority · {programme._count.workstreams}{' '}
          {programme._count.workstreams === 1 ? 'workstream' : 'workstreams'} · Updated{' '}
          {programme.updatedAt.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </header>

      {canManage ? (
        <ProgrammeEditor
          programme={{
            id: programme.id,
            name: programme.name,
            description: programme.description ?? '',
            status: programme.status,
            priority: programme.priority,
          }}
        />
      ) : (
        <section className="bg-card rounded-lg border p-4">
          <h2 className="text-sm font-medium">Description</h2>
          <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
            {programme.description || 'No description yet.'}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-dashed px-4 py-6 text-center">
        <p className="text-sm font-medium">Workstreams</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {programme._count.workstreams === 0
            ? 'None yet — the Workstreams module is next; workstreams created there attach to this programme.'
            : `${programme._count.workstreams} attached — the Workstreams module lands next.`}
        </p>
      </section>
    </div>
  );
}
