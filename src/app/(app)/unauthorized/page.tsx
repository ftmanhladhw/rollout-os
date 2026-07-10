import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'No access' };

/**
 * 403 surface for authenticated users whose role can't view a resource —
 * `requireCan()` page guards land here. Signed-out visitors never reach this
 * page (middleware redirects them to /login first). Error-state rules apply
 * (docs/07, Chapter 7): what happened, why, and one action to recover.
 */
export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center pt-16 text-center">
      <div className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-full">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight">You don&apos;t have access</h1>
      <p className="text-muted-foreground mt-2 text-sm text-balance">
        Your role in this organization doesn&apos;t include permission to view this page. If you
        think it should, ask an organization admin to adjust your role.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-6">
        <Link href="/">Back to Command Center</Link>
      </Button>
    </div>
  );
}
