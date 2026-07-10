'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { createWorkstream } from './actions';
import { createWorkstreamSchema, type CreateWorkstreamValues } from './schemas';

const selectClassName =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

/**
 * Quick-create drawer. Reused on /workstreams (programme picker shown) and
 * on a programme detail page (defaultProgrammeId preselects the parent).
 */
export function NewWorkstreamSheet({
  programmes,
  defaultProgrammeId,
  label = 'New workstream',
  className,
}: {
  programmes: { id: string; name: string }[];
  defaultProgrammeId?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateWorkstreamValues>({
    resolver: zodResolver(createWorkstreamSchema),
    defaultValues: {
      programmeId: defaultProgrammeId ?? programmes[0]?.id ?? '',
      name: '',
      description: '',
    },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createWorkstream(values);
      if (result && 'error' in result) setServerError(result.error);
    });
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset();
          setServerError(undefined);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button size="sm" className={className}>
          <Plus />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New workstream</SheetTitle>
          <SheetDescription>
            A team&apos;s slice of the work. Every workstream belongs to one programme.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex flex-col gap-4 px-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="workstream-programme">Programme</Label>
            <select
              id="workstream-programme"
              className={selectClassName}
              {...form.register('programmeId')}
            >
              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.name}
                </option>
              ))}
            </select>
            {form.formState.errors.programmeId?.message ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.programmeId.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="workstream-name">Name</Label>
            <Input
              id="workstream-name"
              type="text"
              autoFocus
              placeholder="e.g. Engineering"
              {...form.register('name')}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="workstream-description">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="workstream-description"
              rows={4}
              placeholder="Who does this work, and what does done look like?"
              {...form.register('description')}
            />
            {form.formState.errors.description?.message ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>
          {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create workstream'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
