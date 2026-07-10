import {
  BookOpen,
  CalendarRange,
  FileText,
  FolderKanban,
  Layers,
  LayoutDashboard,
  ListChecks,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/**
 * Shell navigation config. The primary nav is exactly the seven lifecycle
 * destinations from the IA (docs/05) and UX spec (docs/07) — nothing else may
 * be added here. Administration is deliberately excluded: it is reached from
 * the user menu, never the primary nav (docs/07, Chapter 3).
 */
export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** The one operational question this destination answers (docs/07, Principle 4). */
  question: string;
};

export const primaryNav: NavItem[] = [
  { title: 'Command Center', href: '/', icon: LayoutDashboard, question: 'What is happening?' },
  { title: 'Programs', href: '/programs', icon: FolderKanban, question: 'What are we delivering?' },
  { title: 'Workstreams', href: '/workstreams', icon: Layers, question: 'Who is doing the work?' },
  { title: 'Operations', href: '/operations', icon: ListChecks, question: 'What needs attention?' },
  { title: 'Knowledge', href: '/knowledge', icon: BookOpen, question: 'What do we know?' },
  { title: 'Timeline', href: '/timeline', icon: CalendarRange, question: 'When is it happening?' },
  { title: 'Reports', href: '/reports', icon: FileText, question: 'What should we communicate?' },
];

/** Destinations outside the primary nav (reached from the user menu). */
export const secondaryNav: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    question: 'How is the workspace configured?',
  },
];

/** href → title lookup across all shell destinations (used by breadcrumbs). */
export const navTitles = new Map(
  [...primaryNav, ...secondaryNav].map((item) => [item.href, item.title]),
);
