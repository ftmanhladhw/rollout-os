import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Shared anatomy for every Command Center section: title, count, and a
 * "View all" link into the module that owns the data — sections are
 * projections of module data, never destinations themselves (docs/07).
 */
export function SectionCard({
  title,
  count,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  count?: number;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="bg-card min-w-0 rounded-lg border">
      <header className="flex h-11 items-center gap-2 border-b px-4">
        <h2 className="text-sm font-medium">{title}</h2>
        {count !== undefined && (
          <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
        )}
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground ml-auto inline-flex items-center gap-1 text-xs transition-colors"
        >
          {hrefLabel}
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </header>
      {children}
    </section>
  );
}

/** Uniform row container: consistent height, hover, truncation behavior. */
export function SectionRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="hover:bg-accent/40 flex min-w-0 items-center gap-3 px-4 py-2.5 transition-colors">
      {children}
    </li>
  );
}

export function SectionList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y">{children}</ul>;
}
