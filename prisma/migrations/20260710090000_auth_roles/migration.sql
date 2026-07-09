-- Auth & authorization model (design record: docs/14_auth_authorization.md).
--
-- Replaces the placeholder org_role enum (admin | member) with the full
-- 7-role member_role enum, remapping existing rows in place, and adds the
-- platform-scope super-admin flag to profiles.

-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('org_admin', 'consultant', 'product_manager', 'programme_manager', 'engineering', 'client', 'executive');

-- Swap organization_members.role to the new enum.
-- Remap: admin → org_admin; member → consultant (the operator persona default).
ALTER TABLE "organization_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "organization_members"
  ALTER COLUMN "role" TYPE "member_role"
  USING (CASE "role"::text WHEN 'admin' THEN 'org_admin' ELSE 'consultant' END)::"member_role";
ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'consultant';

-- DropEnum
DROP TYPE "org_role";

-- Platform operators. Settable only via SQL/service role, never the app UI.
ALTER TABLE "profiles" ADD COLUMN "is_super_admin" BOOLEAN NOT NULL DEFAULT false;
