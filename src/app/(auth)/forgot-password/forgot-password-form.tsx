'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendPasswordReset } from '../actions';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await sendPasswordReset(values);
      if (result && 'error' in result) setServerError(result.error);
      if (result && 'success' in result) setSuccessMessage(result.success);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>We will email you a link to choose a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email?.message ? (
              <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
          {successMessage ? (
            <p className="text-sm text-green-600 dark:text-green-500">{successMessage}</p>
          ) : null}
          <Button type="submit" disabled={isPending || Boolean(successMessage)}>
            {isPending ? 'Sending…' : 'Email me a reset link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          Remembered it?{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
