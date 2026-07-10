'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LifecycleStatus, Priority } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  EDITABLE_LIFECYCLE_STATUSES,
  LIFECYCLE_STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/config/terminology';
import { archiveWorkstream, updateWorkstream } from '../actions';
import { updateWorkstreamSchema, type UpdateWorkstreamValues } from '../schemas';

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

const selectClassName =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

/** Edit form for workstream basics incl. manual progress + archive. */
export function WorkstreamEditor({
  workstream,
}: {
  workstream: {
    id: string;
    name: string;
    description: string;
    status: LifecycleStatus;
    priority: Priority;
    progress: number;
  };
}) {
  const [serverError, setServerError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateWorkstreamValues>({
    resolver: zodResolver(updateWorkstreamSchema),
    defaultValues: {
      id: workstream.id,
      name: workstream.name,
      description: workstream.description,
      status: workstream.status as UpdateWorkstreamValues['status'],
      priority: workstream.priority,
      progress: workstream.progress,
    },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    setSaved(false);
    startTransition(async () => {
      const result = await updateWorkstream(values);
      if (result && 'error' in result) setServerError(result.error);
      if (result && 'success' in result) setSaved(true);
    });
  });

  return (
    <form
      onSubmit={submit}
      className="bg-card flex flex-col gap-4 rounded-lg border p-4"
      noValidate
    >
      <input type="hidden" {...form.register('id')} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input id="edit-name" type="text" {...form.register('name')} />
        {form.formState.errors.name?.message ? (
          <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-status">Status</Label>
          <select id="edit-status" className={selectClassName} {...form.register('status')}>
            {EDITABLE_LIFECYCLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LIFECYCLE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-priority">Priority</Label>
          <select id="edit-priority" className={selectClassName} {...form.register('priority')}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-progress">Progress (%)</Label>
          <Input
            id="edit-progress"
            type="number"
            min={0}
            max={100}
            step={1}
            {...form.register('progress')}
          />
          {form.formState.errors.progress?.message ? (
            <p className="text-destructive text-sm">{form.formState.errors.progress.message}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea id="edit-description" rows={4} {...form.register('description')} />
        {form.formState.errors.description?.message ? (
          <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>
        ) : null}
      </div>
      {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        {saved && !isPending ? <p className="text-muted-foreground text-sm">Saved.</p> : null}
        <ArchiveButton id={workstream.id} />
      </div>
    </form>
  );
}

/** Two-step confirm; archive is soft delete, reversible in the database. */
function ArchiveButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive ml-auto"
        onClick={() => setConfirming(true)}
      >
        Archive
      </Button>
    );
  }

  return (
    <span className="ml-auto flex items-center gap-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await archiveWorkstream({ id });
          })
        }
      >
        {isPending ? 'Archiving…' : 'Confirm archive'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </span>
  );
}
