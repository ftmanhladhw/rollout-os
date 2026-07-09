'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '../actions';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';

export function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '' },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await resetPassword(values);
      if (result && 'error' in result) setServerError(result.error);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>You will stay signed in after saving it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
            />
            {form.formState.errors.password?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
