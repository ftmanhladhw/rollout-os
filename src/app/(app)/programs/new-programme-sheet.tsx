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
import { createProgramme } from './actions';
import { createProgrammeSchema, type CreateProgrammeValues } from './schemas';

/**
 * Quick-create drawer (docs/07: drawers for quick edits, full pages for
 * complex work — two fields is quick). Success redirects to the new
 * programme's detail page.
 */
export function NewProgrammeSheet({
  label = 'New programme',
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateProgrammeValues>({
    resolver: zodResolver(createProgrammeSchema),
    defaultValues: { name: '', description: '' },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createProgramme(values);
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
          <SheetTitle>New programme</SheetTitle>
          <SheetDescription>
            A major delivery objective. Workstreams, milestones, and progress hang off it.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex flex-col gap-4 px-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="programme-name">Name</Label>
            <Input
              id="programme-name"
              type="text"
              autoFocus
              placeholder="e.g. Partner Enablement"
              {...form.register('name')}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="programme-description">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="programme-description"
              rows={4}
              placeholder="What outcome does this programme deliver?"
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
            {isPending ? 'Creating…' : 'Create programme'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
