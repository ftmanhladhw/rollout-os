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
import { signUpWithPassword } from '../actions';
import { signupSchema, type SignupValues } from '../schemas';

export function SignupForm() {
  const [serverError, setServerError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await signUpWithPassword(values);
      if (result && 'error' in result) setServerError(result.error);
      if (result && 'success' in result) setSuccessMessage(result.success);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>You will receive an email to confirm your address.</CardDescription>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
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
          {successMessage ? (
            <p className="text-sm text-green-600 dark:text-green-500">{successMessage}</p>
          ) : null}
          <Button type="submit" disabled={isPending || Boolean(successMessage)}>
            {isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
