import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitch',
  description:
    'Rollout OS — the operating system for enterprise rollouts. A founder pitch: why it exists, why now, and where it goes.',
};

/**
 * The pitch is a public, full-bleed page that lives outside the authenticated
 * `(app)` shell — it inherits only the root layout (fonts, theme, providers).
 */
export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-background text-foreground min-h-svh">{children}</div>;
}
