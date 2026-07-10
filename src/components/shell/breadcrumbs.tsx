'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { navTitles } from '@/config/nav';

type Crumb = { href: string; label: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fallback for path segments the nav config doesn't know (detail pages). */
function humanize(segment: string) {
  if (UUID_PATTERN.test(segment)) return 'Details';
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function crumbsFor(pathname: string): Crumb[] {
  if (pathname === '/') {
    return [{ href: '/', label: navTitles.get('/') ?? 'Home' }];
  }

  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    return { href, label: navTitles.get(href) ?? humanize(decodeURIComponent(segment)) };
  });
}

/**
 * Location trail derived purely from the URL — top-level destinations resolve
 * to their nav titles; deeper segments (entity detail pages, later) fall back
 * to humanized slugs until pages provide their own labels.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.href}>
              {index > 0 && (
                <ChevronRight
                  className="text-muted-foreground/60 size-3.5 shrink-0"
                  aria-hidden="true"
                />
              )}
              <li className="min-w-0">
                {last ? (
                  <span aria-current="page" className="text-foreground block truncate font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground block truncate transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
