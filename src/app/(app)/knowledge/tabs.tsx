import { ExternalLink } from 'lucide-react';
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
import { DOCUMENT_TYPE_LABELS, UPDATE_TYPE_LABELS } from '@/config/terminology';
import { db } from '@/lib/db';
import type { RolloutContext } from '@/lib/rollout';
import { can } from '@/lib/authz';
import {
  archiveDocument,
  archiveMeeting,
  archiveNote,
  archiveUpdate,
  createDocument,
  createMeeting,
  createNote,
  createUpdate,
  updateDocument,
  updateMeeting,
  updateNote,
  updateUpdate,
} from './actions';
import { DOCUMENT_TYPE_OPTIONS, UPDATE_TYPE_OPTIONS } from './field-configs';

/**
 * The four Knowledge tabs (PRD §18 Release 3 set). Same anatomy as the
 * Operations tabs: create drawer (when the caller holds the tab's action),
 * uniform table, row-click edit drawer. All queries are rollout-scoped,
 * soft-delete filtered, and client-visibility filtered. Documents are
 * referenced, never duplicated (Domain Rule 9) — the Link column opens the
 * external source.
 */

function visibility(context: RolloutContext) {
  return can(context.ctx, 'internal:view') ? {} : { visibility: 'client' as const };
}

function shortDate(value: Date | null): string {
  return value ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
}

function EmptyTab({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed px-6 py-10 text-center">
      <p className="text-muted-foreground mx-auto max-w-md text-sm text-balance">{children}</p>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left text-xs">
            {head.map((th, i) => (
              <th
                key={th}
                className={`h-9 px-4 font-medium ${i > 1 ? 'hidden md:table-cell' : ''}`}
              >
                {th}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
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

const newButton = (label: string) => <Button size="sm">{label}</Button>;

/** External source link — safe to render because schemas only accept http(s). */
function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
    >
      {label}
      <ExternalLink aria-hidden className="size-3.5" />
    </a>
  );
}

// --- Documents ---

export async function DocumentsTab({ context }: { context: RolloutContext }) {
  const canContribute = can(context.ctx, 'knowledge:contribute');
  const canManage = can(context.ctx, 'knowledge:manage');
  const documents = await db.document.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      url: true,
      documentType: true,
      version: true,
    },
  });

  const documentFields: FieldSpec[] = [
    nameField,
    { name: 'url', label: 'Link', type: 'text', required: true, placeholder: 'https://…' },
    { name: 'documentType', label: 'Type', type: 'select', options: DOCUMENT_TYPE_OPTIONS },
    { name: 'version', label: 'Version', type: 'text', placeholder: 'v1.0' },
    descriptionField,
  ];

  return (
    <section className="flex flex-col gap-3">
      {canContribute && (
        <div className="flex justify-end">
          <EntityDrawer
            title="Reference a document"
            description="Documents are referenced, never duplicated — link to where the source lives."
            fields={documentFields}
            action={createDocument}
            submitLabel="Add document"
            trigger={newButton('Add document')}
          />
        </div>
      )}
      {documents.length === 0 ? (
        <EmptyTab>
          No documents referenced — link the PRDs, designs, and recordings the rollout relies on.
        </EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Type', 'Version', 'Link']}>
          {documents.map((d) => (
            <tr key={d.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit document"
                    fields={[nameField, statusField, priorityField, ...documentFields.slice(1)]}
                    defaults={{
                      id: d.id,
                      name: d.name,
                      description: d.description ?? '',
                      status: d.status,
                      priority: d.priority,
                      url: d.url,
                      documentType: d.documentType,
                      version: d.version ?? '',
                    }}
                    action={updateDocument}
                    archiveAction={archiveDocument}
                    submitLabel="Save changes"
                    trigger={rowTrigger(d.name)}
                  />
                ) : (
                  d.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={d.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {DOCUMENT_TYPE_LABELS[d.documentType]}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {d.version ?? '—'}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                <SourceLink href={d.url} label="Open" />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Meetings ---

export async function MeetingsTab({ context }: { context: RolloutContext }) {
  const canManage = can(context.ctx, 'knowledge:manage');
  const meetings = await db.meeting.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: [{ meetingDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      priority: true,
      meetingDate: true,
      agenda: true,
      summary: true,
      recordingUrl: true,
    },
  });

  const meetingFields: FieldSpec[] = [
    nameField,
    { name: 'meetingDate', label: 'Date', type: 'date' },
    { name: 'agenda', label: 'Agenda', type: 'textarea' },
    { name: 'summary', label: 'Notes', type: 'textarea' },
    { name: 'recordingUrl', label: 'Recording link', type: 'text', placeholder: 'https://…' },
    descriptionField,
  ];

  return (
    <section className="flex flex-col gap-3">
      {canManage && (
        <div className="flex justify-end">
          <EntityDrawer
            title="Record a meeting"
            description="Agenda, notes, and the recording link — so decisions outlive the call."
            fields={meetingFields}
            action={createMeeting}
            submitLabel="Record meeting"
            trigger={newButton('Record meeting')}
          />
        </div>
      )}
      {meetings.length === 0 ? (
        <EmptyTab>
          No meetings recorded — capture the agenda and outcomes of the next sync here.
        </EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Date', 'Recording']}>
          {meetings.map((m) => (
            <tr key={m.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit meeting"
                    fields={[nameField, statusField, priorityField, ...meetingFields.slice(1)]}
                    defaults={{
                      id: m.id,
                      name: m.name,
                      description: m.description ?? '',
                      status: m.status,
                      priority: m.priority,
                      meetingDate: toDateInput(m.meetingDate),
                      agenda: m.agenda ?? '',
                      summary: m.summary ?? '',
                      recordingUrl: m.recordingUrl ?? '',
                    }}
                    action={updateMeeting}
                    archiveAction={archiveMeeting}
                    submitLabel="Save changes"
                    trigger={rowTrigger(m.name)}
                  />
                ) : (
                  m.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={m.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(m.meetingDate)}
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {m.recordingUrl ? <SourceLink href={m.recordingUrl} label="Watch" /> : '—'}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Notes ---

export async function NotesTab({ context }: { context: RolloutContext }) {
  const canContribute = can(context.ctx, 'knowledge:contribute');
  const canManage = can(context.ctx, 'knowledge:manage');
  const notes = await db.note.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      priority: true,
      body: true,
      updatedAt: true,
    },
  });

  const noteFields: FieldSpec[] = [nameField, { name: 'body', label: 'Body', type: 'textarea' }];

  return (
    <section className="flex flex-col gap-3">
      {canContribute && (
        <div className="flex justify-end">
          <EntityDrawer
            title="New note"
            description="Lightweight context in simple markdown."
            fields={noteFields}
            action={createNote}
            submitLabel="Add note"
            trigger={newButton('New note')}
          />
        </div>
      )}
      {notes.length === 0 ? (
        <EmptyTab>No notes yet — capture context that has no other home.</EmptyTab>
      ) : (
        <Table head={['Name', 'Status', 'Updated']}>
          {notes.map((n) => (
            <tr key={n.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit note"
                    fields={[nameField, statusField, priorityField, ...noteFields.slice(1)]}
                    defaults={{
                      id: n.id,
                      name: n.name,
                      status: n.status,
                      priority: n.priority,
                      body: n.body ?? '',
                    }}
                    action={updateNote}
                    archiveAction={archiveNote}
                    submitLabel="Save changes"
                    trigger={rowTrigger(n.name)}
                  />
                ) : (
                  n.name
                )}
              </td>
              <td className="px-4 py-2.5">
                <LifecycleStatusBadge status={n.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(n.updatedAt)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

// --- Updates ---

export async function UpdatesTab({ context }: { context: RolloutContext }) {
  const canManage = can(context.ctx, 'knowledge:manage');
  const updates = await db.update.findMany({
    where: { rolloutId: context.rollout.id, deletedAt: null, ...visibility(context) },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      priority: true,
      updateType: true,
      body: true,
      createdAt: true,
    },
  });

  const updateFields: FieldSpec[] = [
    nameField,
    { name: 'updateType', label: 'Type', type: 'select', options: UPDATE_TYPE_OPTIONS },
    { name: 'body', label: 'Body', type: 'textarea' },
  ];

  return (
    <section className="flex flex-col gap-3">
      {canManage && (
        <div className="flex justify-end">
          <EntityDrawer
            title="Publish an update"
            description="A daily, weekly, or executive communication about the rollout."
            fields={updateFields}
            action={createUpdate}
            submitLabel="Publish update"
            trigger={newButton('New update')}
          />
        </div>
      )}
      {updates.length === 0 ? (
        <EmptyTab>
          No updates published — write the weekly status here instead of a slide deck.
        </EmptyTab>
      ) : (
        <Table head={['Name', 'Type', 'Status', 'Published']}>
          {updates.map((u) => (
            <tr key={u.id} className="hover:bg-accent/40 transition-colors">
              <td className="px-4 py-2.5">
                {canManage ? (
                  <EntityDrawer
                    title="Edit update"
                    fields={[nameField, statusField, priorityField, ...updateFields.slice(1)]}
                    defaults={{
                      id: u.id,
                      name: u.name,
                      status: u.status,
                      priority: u.priority,
                      updateType: u.updateType,
                      body: u.body ?? '',
                    }}
                    action={updateUpdate}
                    archiveAction={archiveUpdate}
                    submitLabel="Save changes"
                    trigger={rowTrigger(u.name)}
                  />
                ) : (
                  u.name
                )}
              </td>
              <td className="px-4 py-2.5">{UPDATE_TYPE_LABELS[u.updateType]}</td>
              <td className="hidden px-4 py-2.5 md:table-cell">
                <LifecycleStatusBadge status={u.status} />
              </td>
              <td className="text-muted-foreground hidden px-4 py-2.5 md:table-cell">
                {shortDate(u.createdAt)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}
