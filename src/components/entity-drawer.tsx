'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

export type FieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
};

type ActionResult = { error: string } | { success: string } | void;

const selectClassName =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

/**
 * One drawer for every module's entity forms (docs/07: drawers for quick
 * edits). Field lists are config; validation authority is the server action
 * (Zod), whose first error renders inline. Server actions arrive as props —
 * they serialize across the RSC boundary.
 */
export function EntityDrawer({
  title,
  description,
  fields,
  defaults = {},
  action,
  archiveAction,
  submitLabel,
  trigger,
}: {
  title: string;
  description?: string;
  fields: FieldSpec[];
  defaults?: Record<string, string>;
  action: (input: unknown) => Promise<ActionResult>;
  archiveAction?: (input: unknown) => Promise<ActionResult>;
  submitLabel: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setServerError(undefined);
    const input: Record<string, string> = { ...defaults };
    for (const field of fields) {
      input[field.name] = String(formData.get(field.name) ?? '');
    }
    startTransition(async () => {
      const result = await action(input);
      if (result && 'error' in result) {
        setServerError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  function archive() {
    startTransition(async () => {
      const result = await archiveAction?.({ id: defaults.id });
      if (result && 'error' in result) {
        setServerError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setServerError(undefined);
          setConfirmingArchive(false);
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <form action={submit} className="flex flex-col gap-4 px-4 pb-6">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <Label htmlFor={`field-${field.name}`}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={`field-${field.name}`}
                  name={field.name}
                  rows={3}
                  placeholder={field.placeholder}
                  defaultValue={defaults[field.name] ?? ''}
                />
              ) : field.type === 'select' ? (
                <select
                  id={`field-${field.name}`}
                  name={field.name}
                  className={selectClassName}
                  defaultValue={defaults[field.name] ?? field.options?.[0]?.value}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`field-${field.name}`}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  defaultValue={defaults[field.name] ?? ''}
                />
              )}
            </div>
          ))}
          {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Working…' : submitLabel}
            </Button>
            {archiveAction &&
              (confirmingArchive ? (
                <span className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={archive}
                  >
                    Confirm archive
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setConfirmingArchive(false)}
                  >
                    Cancel
                  </Button>
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => setConfirmingArchive(true)}
                >
                  Archive
                </Button>
              ))}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
