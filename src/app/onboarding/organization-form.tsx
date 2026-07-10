'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOrganization } from './actions';
import { createOrganizationSchema, type CreateOrganizationValues } from './schemas';

export function OrganizationForm() {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: '' },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await createOrganization(values);
      if (result && 'error' in result) setServerError(result.error);
    });
  });

  return (
    <Card>
      <CardHeader>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Step 1 of 2
        </p>
        <CardTitle>Create your organization</CardTitle>
        <CardDescription>
          The organization owns your rollouts and its members. You&apos;ll be its admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Organization name</Label>
            <Input
              id="name"
              type="text"
              autoFocus
              placeholder="e.g. Acme Delivery"
              {...form.register('name')}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create organization'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
