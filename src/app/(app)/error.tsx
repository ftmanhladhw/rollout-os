'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary for the app shell. Unexpected server errors (including a
 * ForbiddenError thrown by assertCan in a mutation) land here instead of a
 * dead end. Next.js strips server error messages in production — only the
 * digest reaches the client — so the copy stays generic by design.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server logs carry the real error; the digest links this render to it.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center pt-16 text-center">
      <div className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-full">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground mt-2 text-sm text-balance">
        The request couldn&apos;t be completed. It may be temporary — trying again is safe.
        {error.digest ? ` Reference: ${error.digest}` : ''}
      </p>
      <Button variant="outline" size="sm" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
