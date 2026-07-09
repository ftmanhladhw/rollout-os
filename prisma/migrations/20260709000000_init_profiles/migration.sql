-- profiles: 1:1 companion to auth.users (auth infrastructure, not a domain model).
-- Rows are inserted by the on_auth_user_created trigger (supabase/setup.sql),
-- never directly by clients.

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- Cross-schema FK: a profile cannot outlive its auth user. Prisma's schema
-- cannot express this (auth schema is Supabase-managed), so it lives only here.
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_fkey"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Row Level Security: the reference pattern for all future tables.
-- Policies apply to the PostgREST roles (anon/authenticated); Prisma connects
-- as postgres, which bypasses RLS — server-side authorization stays explicit.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile. No INSERT/DELETE policies:
-- rows are created by the signup trigger and removed by the FK cascade.
CREATE POLICY "profiles_select_own" ON "profiles"
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = "id");

CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = "id")
  WITH CHECK ((SELECT auth.uid()) = "id");
