'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { assertCan, getAuthzContext, DEFAULT_EXPERIENCE_PROFILE } from '@/lib/authz';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getOnboardingState } from '@/lib/onboarding';
import { DEFAULT_PHASES, DEFAULT_READINESS_DIMENSIONS } from '@/config/rollout-defaults';
import { createOrganizationSchema, createRolloutSchema } from './schemas';

export type ActionResult = { error: string } | void;

/**
 * Step 1 — create the organization. This is the one mutation with no
 * permission check by design: the matrix (docs/14) is org-scoped and no
 * organization exists yet — any authenticated user may found one and becomes
 * its org_admin atomically. Idempotent: a user who already belongs to an
 * organization is moved along instead of creating a second one (multi-org
 * is out of MVP scope).
 */
export async function createOrganization(input: unknown): Promise<ActionResult> {
  const parsed = createOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid organization name.' };
  }

  const state = await getOnboardingState();
  if (!state) redirect('/login');
  if (state.organization) {
    redirect(state.hasRollout ? '/' : '/onboarding/rollout');
  }

  const { name } = parsed.data;

  // The signup trigger creates profiles; upsert covers users that predate it
  // (e.g. admin-created accounts) so the FK below can't fail.
  const supabaseEmail = await currentUserEmail();
  await db.profile.upsert({
    where: { id: state.userId },
    update: {},
    create: { id: state.userId, email: supabaseEmail },
  });

  // Nested create = atomic: no organization without its founding org_admin.
  const base = slugify(name);
  for (let attempt = 0; ; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    try {
      await db.organization.create({
        data: {
          name,
          slug,
          createdBy: state.userId,
          members: {
            create: {
              profileId: state.userId,
              role: 'org_admin',
              experienceProfile: DEFAULT_EXPERIENCE_PROFILE.org_admin,
              createdBy: state.userId,
            },
          },
        },
      });
      break;
    } catch (error) {
      // Unique-slug collision: retry with a suffix, then give up loudly.
      if (isUniqueViolation(error) && attempt < 3) continue;
      throw error;
    }
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding/rollout');
}

/**
 * Step 2 — create the first rollout and seed its configuration rows: the
 * eight doc-04 phases and seven readiness dimensions (docs/09 §7 — rows, not
 * schema). Requires rollout:create in the organization. Idempotent: if a
 * rollout already exists the user is sent to the Command Center.
 */
export async function createFirstRollout(input: unknown): Promise<ActionResult> {
  const parsed = createRolloutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid rollout name.' };
  }

  const state = await getOnboardingState();
  if (!state) redirect('/login');
  if (!state.organization) redirect('/onboarding');
  if (state.hasRollout) redirect('/');

  const ctx = await getAuthzContext(state.organization.id);
  assertCan(ctx, 'rollout:create');

  const { name, goLiveDate } = parsed.data;
  await db.rollout.create({
    data: {
      organizationId: state.organization.id,
      name,
      goLiveDate: goLiveDate ? new Date(`${goLiveDate}T00:00:00Z`) : null,
      createdBy: state.userId,
      phases: {
        createMany: {
          data: DEFAULT_PHASES.map((phase, index) => ({
            name: phase,
            sortOrder: index,
            createdBy: state.userId,
          })),
        },
      },
      readinessDimensions: {
        createMany: {
          data: DEFAULT_READINESS_DIMENSIONS.map((dimension, index) => ({
            name: dimension,
            sortOrder: index,
            createdBy: state.userId,
          })),
        },
      },
    },
  });

  revalidatePath('/', 'layout');
  redirect('/');
}

async function currentUserEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // getOnboardingState already proved a session exists.
  return user?.email ?? '';
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'org';
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
