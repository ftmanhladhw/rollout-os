'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BrowserFrame,
  CommandCenterPreview,
  OperationsPreview,
  WorkstreamPreview,
} from './app-preview';

const SCREENS = [
  {
    id: 'command-center',
    n: '01',
    title: 'Command Center',
    url: 'rollout-os.app',
    prompt: 'Every morning begins with one question.',
    line: '“Where does my attention matter today?” The answer is the home screen, not a report someone assembled.',
    Preview: CommandCenterPreview,
  },
  {
    id: 'workstream',
    n: '02',
    title: 'Workstream',
    url: 'rollout-os.app/workstreams',
    prompt: 'Every workstream opens on its brief.',
    line: 'Objective, owners, and current state come before the task list — you orient before you execute.',
    Preview: WorkstreamPreview,
  },
  {
    id: 'operations',
    n: '03',
    title: 'Operations',
    url: 'rollout-os.app/operations',
    prompt: 'One register for everything in motion.',
    line: 'Tasks, risks, issues, and decisions live together — not scattered across four tools that never reconcile.',
    Preview: OperationsPreview,
  },
] as const;

export function ProductDemo() {
  const [open, setOpen] = useState<string | null>(null);
  const active = SCREENS.find((s) => s.id === open);

  return (
    <section id="product" className="border-t px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
          The product
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          One workspace, three altitudes.
        </h2>

        <div className="mt-16 flex flex-col gap-20 md:gap-28">
          {SCREENS.map((screen) => (
            <div key={screen.id} className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <span className="text-muted-foreground/60 text-sm font-medium tabular-nums">
                  {screen.n}
                </span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{screen.title}</h3>
                <p className="text-foreground mt-4 text-base font-medium">{screen.prompt}</p>
                <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                  {screen.line}
                </p>
              </div>

              <div className="lg:col-span-8">
                <button
                  type="button"
                  onClick={() => setOpen(screen.id)}
                  className="focus-visible:ring-ring group focus-visible:ring-offset-background block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
                  aria-label={`Enlarge ${screen.title} preview`}
                >
                  <BrowserFrame
                    url={screen.url}
                    className="transition-shadow group-hover:shadow-2xl"
                  >
                    <screen.Preview />
                  </BrowserFrame>
                  <span className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 className="size-3" aria-hidden />
                    Click to enlarge
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog.Root open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              'fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 md:p-10',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            )}
          >
            {active && (
              <div className="w-full max-w-6xl">
                <div className="mb-3 flex items-center justify-between">
                  <Dialog.Title className="text-sm font-medium text-white">
                    {active.title}
                  </Dialog.Title>
                  <Dialog.Close
                    className="grid size-8 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Enlarged preview of the {active.title} screen.
                </Dialog.Description>
                <BrowserFrame url={active.url}>
                  <active.Preview />
                </BrowserFrame>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
