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
import { sendMagicLink, signInWithPassword } from '../actions';
import { loginSchema, magicLinkSchema, type LoginValues, type MagicLinkValues } from '../schemas';

type Mode = 'password' | 'magic-link';

export function LoginForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>('password');
  const [serverError, setServerError] = useState<string | undefined>(initialError);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const passwordForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const magicLinkForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  });

  function switchMode(next: Mode) {
    setMode(next);
    setServerError(undefined);
    setSuccessMessage(undefined);
  }

  const submitPassword = passwordForm.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await signInWithPassword(values);
      if (result && 'error' in result) setServerError(result.error);
    });
  });

  const submitMagicLink = magicLinkForm.handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await sendMagicLink(values);
      if (result && 'error' in result) setServerError(result.error);
      if (result && 'success' in result) setSuccessMessage(result.success);
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          {mode === 'password'
            ? 'Sign in with your email and password.'
            : 'We will email you a one-time sign-in link.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === 'password' ? (
          <form onSubmit={submitPassword} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...passwordForm.register('email')}
              />
              <FieldError message={passwordForm.formState.errors.email?.message} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register('password')}
              />
              <FieldError message={passwordForm.formState.errors.password?.message} />
            </div>
            <FormMessages error={serverError} success={successMessage} />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form onSubmit={submitMagicLink} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="magic-email">Email</Label>
              <Input
                id="magic-email"
                type="email"
                autoComplete="email"
                {...magicLinkForm.register('email')}
              />
              <FieldError message={magicLinkForm.formState.errors.email?.message} />
            </div>
            <FormMessages error={serverError} success={successMessage} />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending…' : 'Email me a link'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => switchMode(mode === 'password' ? 'magic-link' : 'password')}
        >
          {mode === 'password' ? 'Use a magic link instead' : 'Use a password instead'}
        </Button>
        <p className="text-muted-foreground text-sm">
          No account?{' '}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

function FormMessages({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {success ? <p className="text-sm text-green-600 dark:text-green-500">{success}</p> : null}
    </>
  );
}
