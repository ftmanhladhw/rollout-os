import type { Health, ReadinessStatus } from '@prisma/client';
import { LifecycleStatusBadge } from '@/components/lifecycle-status-badge';
import { Button } from '@/components/ui/button';
import { EntityDrawer, type FieldSpec } from '@/components/entity-drawer';
import {
  descriptionField,
  nameField,
  priorityField,
  statusField,
  toDateInput,
} from '@/components/entity-fields';
import {
  EXPERIENCE_PROFILE_LABELS,
  HEALTH_LABELS,
  MEMBER_ROLE_LABELS,
  PRIORITY_LABELS,
  READINESS_STATUS_LABELS,
} from '@/config/terminology';
import { db } from '@/lib/db';
import type { RolloutContext } from '@/lib/rollout';
import { removeMember, updateMember, updateReadiness, updateRollout } from './actions';
import { ASSIGNABLE_ROLES, EXPERIENCE_PROFILES } from './schemas';

/**
 * The two live Administration tabs (MVP slice of PRD §7 Administration):
 * Members (roles, experience profiles, removal — org:manage) and Rollout
 * (the manual vitals: health, status, go-live, readiness — rollout:manage).
 * Teams, templates, and invites are later slices. The page gates each tab
 * before rendering it, so these components assume permission.
 */

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((value) => ({
  value,
  label: MEMBER_ROLE_LABELS[value],
}));

const PROFILE_OPTIONS = EXPERIENCE_PROFILES.map((value) => ({
  value,
  label: EXPERIENCE_PROFILE_LABELS[value],
}));

const HEALTH_DOT: Record<Health, string> = {
  green: 'bg-status-good',
  amber: 'bg-status-warning',
  red: 'bg-status-critical',
};

const READINESS_DOT: Record<ReadinessStatus, string> = {
  ready: 'bg-status-good',
  in_progress: 'bg-status-warning',
  not_started: 'bg-muted-foreground/25',
};

function Dot({ className }: { className: string }) {
  return <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />;
}

const rowTrigger = (label: string) => (
  <button
    type="button"
    className="text-left font-medium underline-offset-4 hover:underline"
    title="Edit"
  >
    {label}
  </button>
);

// --- Members ---

export async function MembersTab({ context }: { context: RolloutContext }) {
  const members = await db.organizationMember.findMany({
    where: { organizationId: context.organization.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      experienceProfile: true,
      createdAt: true,
      profile: { select: { id: true, email: true, displayName: true } },
    },
  });

  const memberFields: FieldSpec[] = [
    { name: 'role', label: 'Role (permissions)', type: 'select', options: ROLE_OPTIONS },
    {
      name: 'experienceProfile',
      label: 'Experience profile (UI only)',
      type: 'select',
      options: PROFILE_OPTIONS,
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs">
        Roles define what a member can do (docs/14); experience profiles only shape the UI. Invites
        are a later slice — members join by signing up today.
      </p>
      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs">
              <th className="h-9 px-4 font-medium">Member</th>
              <th className="h-9 px-4 font-medium">Role</th>
              <th className="hidden h-9 px-4 font-medium md:table-cell">Experience profile</th>
              <th className="hidden h-9 px-4 font-medium md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => {
              const label = member.profile.displayName || member.profile.email;
              const isSelf = member.profile.id === context.ctx?.userId;
              return (
                <tr key={member.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-2.5">
                    <EntityDrawer
                      title="Edit member"
                      description={
                        isSelf
                          ? 'This is you. You cannot demote or remove the last admin.'
                          : `${label} — change what they can do, or remove their access.`
                      }
                      fields={memberFields}
                      defaults={{
                        id: member.id,
                        role: member.role,
                        experienceProfile: member.experienceProfile,
                      }}
                      action={updateMember}
                      archiveAction={removeMember}
                      archiveLabel="Remove"
                      submitLabel="Save changes"
                      trigger={rowTrigger(label)}
                    />
                    {isSelf ? <span className="text-muted-foreground text-xs"> (you)</span> : null}
                  </td>
                  <td className="px-4 py-2.5">{MEMBER_ROLE_LABELS[member.role]}</td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                    {EXPERIENCE_PROFILE_LABELS[member.experienceProfile]}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                    {member.createdAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// --- Rollout settings ---

export async function RolloutTab({ context }: { context: RolloutContext }) {
  const [rollout, dimensions] = await Promise.all([
    db.rollout.findFirst({
      where: { id: context.rollout.id },
      select: {
        name: true,
        description: true,
        status: true,
        health: true,
        priority: true,
        goLiveDate: true,
      },
    }),
    db.readinessDimension.findMany({
      where: { rolloutId: context.rollout.id, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, status: true },
    }),
  ]);
  if (!rollout) return null;

  const rolloutFields: FieldSpec[] = [
    nameField,
    statusField,
    {
      name: 'health',
      label: 'Health (manual)',
      type: 'select',
      options: (['green', 'amber', 'red'] as const).map((value) => ({
        value,
        label: HEALTH_LABELS[value],
      })),
    },
    priorityField,
    { name: 'goLiveDate', label: 'Go-live date', type: 'date' },
    descriptionField,
  ];

  const readinessField: FieldSpec[] = [
    {
      name: 'status',
      label: 'Status (manual)',
      type: 'select',
      options: (['not_started', 'in_progress', 'ready'] as const).map((value) => ({
        value,
        label: READINESS_STATUS_LABELS[value],
      })),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="bg-card rounded-lg border">
        <header className="flex h-11 items-center gap-2 border-b px-4">
          <h2 className="text-sm font-medium">Rollout</h2>
          <span className="ml-auto">
            <EntityDrawer
              title="Edit rollout"
              description="The manual vital signs live here: health, status, and the go-live date."
              fields={rolloutFields}
              defaults={{
                name: rollout.name,
                description: rollout.description ?? '',
                status: rollout.status,
                health: rollout.health,
                priority: rollout.priority,
                goLiveDate: toDateInput(rollout.goLiveDate),
              }}
              action={updateRollout}
              submitLabel="Save changes"
              trigger={<Button size="sm">Edit rollout</Button>}
            />
          </span>
        </header>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 text-sm lg:grid-cols-4">
          <div>
            <dt className="text-muted-foreground text-xs">Name</dt>
            <dd className="mt-0.5 font-medium">{rollout.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Status</dt>
            <dd className="mt-0.5">
              <LifecycleStatusBadge status={rollout.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Health (manual)</dt>
            <dd className="mt-0.5 flex items-center gap-2 font-medium">
              <Dot className={HEALTH_DOT[rollout.health]} />
              {HEALTH_LABELS[rollout.health]}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Priority</dt>
            <dd className="mt-0.5 font-medium">{PRIORITY_LABELS[rollout.priority]}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Go live</dt>
            <dd className="mt-0.5 font-medium">
              {rollout.goLiveDate
                ? rollout.goLiveDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not set'}
            </dd>
          </div>
          <div className="col-span-2 lg:col-span-3">
            <dt className="text-muted-foreground text-xs">Description</dt>
            <dd className="text-muted-foreground mt-0.5 truncate">{rollout.description || '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-card rounded-lg border">
        <header className="flex h-11 items-center border-b px-4">
          <h2 className="text-sm font-medium">Readiness dimensions (manual assessment)</h2>
        </header>
        <ul className="divide-y">
          {dimensions.map((dimension) => (
            <li
              key={dimension.id}
              className="hover:bg-accent/40 flex items-center gap-3 px-4 py-2.5 transition-colors"
            >
              <Dot className={READINESS_DOT[dimension.status]} />
              <span className="min-w-0 flex-1 truncate text-sm">
                <EntityDrawer
                  title={`Readiness — ${dimension.name}`}
                  description="A manual assessment (docs/05): set it deliberately, review it in governance."
                  fields={readinessField}
                  defaults={{ id: dimension.id, status: dimension.status }}
                  action={updateReadiness}
                  submitLabel="Save"
                  trigger={rowTrigger(dimension.name)}
                />
              </span>
              <span className="text-muted-foreground text-xs">
                {READINESS_STATUS_LABELS[dimension.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
