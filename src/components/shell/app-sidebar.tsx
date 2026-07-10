import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { SidebarNav } from './sidebar-nav';

/** Desktop sidebar. Hidden below `md`; the header's menu button takes over there. */
export function AppSidebar() {
  return (
    <aside className="bg-sidebar sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r md:flex">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-5 shrink-0 place-items-center rounded text-[11px] font-bold"
          >
            R
          </span>
          {siteConfig.name}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav />
      </div>
    </aside>
  );
}
