'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createFirstRollout } from '../actions';
import { createRolloutSchema, type CreateRolloutValues } from '../schemas';

export function RolloutForm({ organizationName }: { organizationName: string }) {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateRolloutValues>({
    resolver: zodResolver(createRolloutSchema),
    defaultValues: { name: '', goLiveDate: '' },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createFirstRollout(values);
      if (result && 'error' in result) setServerError(result.error);
    });
  });

  return (
    <Card>
      <CardHeader>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Step 2 of 2
        </p>
        <CardTitle>Create your first rollout</CardTitle>
        <CardDescription>
          The rollout is the operational workspace for {organizationName} — it starts with the
          standard phases and readiness dimensions, all editable later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Rollout name</Label>
            <Input
              id="name"
              type="text"
              autoFocus
              placeholder="e.g. EU Partner Rollout 2026"
              {...form.register('name')}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="goLiveDate">
              Target go-live <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="goLiveDate" type="date" {...form.register('goLiveDate')} />
            {form.formState.errors.goLiveDate?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.goLiveDate.message}</p>
            ) : null}
          </div>
          {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create rollout'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
