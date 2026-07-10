import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { PRIORITY_LABELS } from '@/config/terminology';
import { can } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { WorkstreamEditor } from './workstream-editor';

export const metadata: Metadata = { title: 'Workstream' };

/**
 * Workstream detail — universal detail template. Lookup scoped to the
 * caller's rollout and visibility; foreign/archived/invalid ids are 404s.
 */
export default async function WorkstreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  const canManage = can(context.ctx, 'structure:manage');
  const seesInternal = can(context.ctx, 'internal:view');

  const workstream = await db.workstream.findFirst({
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
      progress: true,
      updatedAt: true,
      programme: { select: { id: true, name: true } },
    },
  });
  if (!workstream) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{workstream.name}</h1>
          <LifecycleStatusBadge status={workstream.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          <Link
            href={`/programs/${workstream.programme.id}`}
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            {workstream.programme.name}
          </Link>{' '}
          · {PRIORITY_LABELS[workstream.priority]} priority · {workstream.progress}% complete ·
          Updated{' '}
          {workstream.updatedAt.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </header>

      {canManage ? (
        <WorkstreamEditor
          workstream={{
            id: workstream.id,
            name: workstream.name,
            description: workstream.description ?? '',
            status: workstream.status,
            priority: workstream.priority,
            progress: workstream.progress,
          }}
        />
      ) : (
        <section className="bg-card rounded-lg border p-4">
          <h2 className="text-sm font-medium">Description</h2>
          <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
            {workstream.description || 'No description yet.'}
          </p>
        </section>
      )}

      <section className="rounded-lg border border-dashed px-4 py-6 text-center">
        <p className="text-sm font-medium">Milestones · Tasks · Risks · Documents · Meetings</p>
        <p className="text-muted-foreground mt-1 text-sm">
          The workstream&apos;s operational content arrives with the Operations and Knowledge
          modules.
        </p>
      </section>
    </div>
  );
}
