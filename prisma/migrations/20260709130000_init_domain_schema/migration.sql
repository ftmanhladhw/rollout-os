-- Domain schema for Rollout OS (design record: docs/09_database_design.md).
-- Base DDL generated with `prisma migrate diff`; RLS section hand-authored.

-- CreateEnum
CREATE TYPE "lifecycle_status" AS ENUM ('draft', 'planned', 'in_progress', 'blocked', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "health" AS ENUM ('green', 'amber', 'red');

-- CreateEnum
CREATE TYPE "readiness_status" AS ENUM ('not_started', 'in_progress', 'ready');

-- CreateEnum
CREATE TYPE "visibility" AS ENUM ('internal', 'client');

-- CreateEnum
CREATE TYPE "org_role" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "experience_profile" AS ENUM ('executive', 'programme_manager', 'engineering', 'consultant', 'client');

-- CreateEnum
CREATE TYPE "risk_level" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('prd', 'architecture', 'design', 'meeting_notes', 'kt', 'recording', 'presentation', 'spreadsheet', 'release_notes', 'contract', 'other');

-- CreateEnum
CREATE TYPE "update_type" AS ENUM ('daily', 'weekly', 'executive');

-- CreateEnum
CREATE TYPE "dependency_type" AS ENUM ('blocks', 'blocked_by', 'relates_to');

-- CreateEnum
CREATE TYPE "entity_type" AS ENUM ('rollout', 'programme', 'workstream', 'milestone', 'task', 'risk', 'issue', 'decision', 'dependency', 'action_item', 'deliverable', 'document', 'meeting', 'note', 'update', 'stakeholder', 'team', 'partner');

-- CreateEnum
CREATE TYPE "activity_verb" AS ENUM ('created', 'updated', 'deleted', 'status_changed', 'assigned');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('task_assigned', 'task_due', 'risk_updated', 'meeting_reminder', 'milestone_due', 'go_live_reminder');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "role" "org_role" NOT NULL DEFAULT 'member',
    "experience_profile" "experience_profile" NOT NULL DEFAULT 'consultant',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rollouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "health" "health" NOT NULL DEFAULT 'green',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "start_date" DATE,
    "go_live_date" DATE,
    "end_date" DATE,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rollouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_dimensions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "readiness_status" NOT NULL DEFAULT 'not_started',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "readiness_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workstreams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "programme_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "progress" SMALLINT NOT NULL DEFAULT 0,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "workstreams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "workstream_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "due_date" DATE,
    "completed_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "milestone_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assignee_id" UUID,
    "phase_id" UUID,
    "due_date" DATE,
    "completed_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID NOT NULL,
    "phase_id" UUID,
    "probability" "risk_level" NOT NULL DEFAULT 'medium',
    "impact" "risk_level" NOT NULL DEFAULT 'medium',
    "mitigation" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "resolution" TEXT,
    "resolved_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "approver_id" UUID,
    "decision_date" DATE,
    "reason" TEXT,
    "affects_entity_type" "entity_type" NOT NULL,
    "affects_entity_id" UUID NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependencies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "dependency_type" "dependency_type" NOT NULL DEFAULT 'blocks',
    "from_entity_type" "entity_type" NOT NULL,
    "from_entity_id" UUID NOT NULL,
    "to_entity_type" "entity_type" NOT NULL,
    "to_entity_id" UUID NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "meeting_id" UUID,
    "due_date" DATE,
    "converted_task_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "action_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "workstream_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "due_date" DATE,
    "delivered_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "workstream_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "url" TEXT NOT NULL,
    "document_type" "document_type" NOT NULL DEFAULT 'other',
    "version" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "workstream_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "meeting_date" TIMESTAMPTZ(6),
    "agenda" TEXT,
    "summary" TEXT,
    "recording_url" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meeting_id" UUID NOT NULL,
    "stakeholder_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "body" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "updates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "lifecycle_status" NOT NULL DEFAULT 'draft',
    "priority" "priority" NOT NULL DEFAULT 'medium',
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" UUID,
    "phase_id" UUID,
    "update_type" "update_type" NOT NULL DEFAULT 'weekly',
    "body" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role_title" TEXT,
    "description" TEXT,
    "visibility" "visibility" NOT NULL DEFAULT 'internal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profile_id" UUID,
    "partner_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "stakeholder_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "actor_id" UUID,
    "verb" "activity_verb" NOT NULL,
    "entity_type" "entity_type" NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "detail" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rollout_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "notification_type" "notification_type" NOT NULL,
    "entity_type" "entity_type" NOT NULL,
    "entity_id" UUID NOT NULL,
    "message" TEXT,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_tags_idx" ON "organizations" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "organization_members_profile_id_idx" ON "organization_members"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_profile_id_key" ON "organization_members"("organization_id", "profile_id");

-- CreateIndex
CREATE INDEX "rollouts_organization_id_idx" ON "rollouts"("organization_id");

-- CreateIndex
CREATE INDEX "rollouts_tags_idx" ON "rollouts" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "phases_rollout_id_idx" ON "phases"("rollout_id");

-- CreateIndex
CREATE INDEX "readiness_dimensions_rollout_id_idx" ON "readiness_dimensions"("rollout_id");

-- CreateIndex
CREATE INDEX "programmes_rollout_id_status_idx" ON "programmes"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "programmes_owner_id_idx" ON "programmes"("owner_id");

-- CreateIndex
CREATE INDEX "programmes_phase_id_idx" ON "programmes"("phase_id");

-- CreateIndex
CREATE INDEX "programmes_tags_idx" ON "programmes" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "workstreams_rollout_id_status_idx" ON "workstreams"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "workstreams_programme_id_idx" ON "workstreams"("programme_id");

-- CreateIndex
CREATE INDEX "workstreams_owner_id_idx" ON "workstreams"("owner_id");

-- CreateIndex
CREATE INDEX "workstreams_phase_id_idx" ON "workstreams"("phase_id");

-- CreateIndex
CREATE INDEX "workstreams_tags_idx" ON "workstreams" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "milestones_rollout_id_due_date_idx" ON "milestones"("rollout_id", "due_date");

-- CreateIndex
CREATE INDEX "milestones_workstream_id_idx" ON "milestones"("workstream_id");

-- CreateIndex
CREATE INDEX "milestones_owner_id_idx" ON "milestones"("owner_id");

-- CreateIndex
CREATE INDEX "milestones_phase_id_idx" ON "milestones"("phase_id");

-- CreateIndex
CREATE INDEX "milestones_tags_idx" ON "milestones" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "tasks_rollout_id_status_idx" ON "tasks"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_status_due_date_idx" ON "tasks"("assignee_id", "status", "due_date");

-- CreateIndex
CREATE INDEX "tasks_milestone_id_idx" ON "tasks"("milestone_id");

-- CreateIndex
CREATE INDEX "tasks_phase_id_idx" ON "tasks"("phase_id");

-- CreateIndex
CREATE INDEX "tasks_tags_idx" ON "tasks" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "risks_rollout_id_status_idx" ON "risks"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "risks_owner_id_idx" ON "risks"("owner_id");

-- CreateIndex
CREATE INDEX "risks_phase_id_idx" ON "risks"("phase_id");

-- CreateIndex
CREATE INDEX "risks_tags_idx" ON "risks" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "issues_rollout_id_status_idx" ON "issues"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "issues_owner_id_idx" ON "issues"("owner_id");

-- CreateIndex
CREATE INDEX "issues_phase_id_idx" ON "issues"("phase_id");

-- CreateIndex
CREATE INDEX "issues_tags_idx" ON "issues" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "decisions_rollout_id_status_idx" ON "decisions"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "decisions_affects_entity_type_affects_entity_id_idx" ON "decisions"("affects_entity_type", "affects_entity_id");

-- CreateIndex
CREATE INDEX "decisions_owner_id_idx" ON "decisions"("owner_id");

-- CreateIndex
CREATE INDEX "decisions_approver_id_idx" ON "decisions"("approver_id");

-- CreateIndex
CREATE INDEX "decisions_phase_id_idx" ON "decisions"("phase_id");

-- CreateIndex
CREATE INDEX "decisions_tags_idx" ON "decisions" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "dependencies_rollout_id_status_idx" ON "dependencies"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "dependencies_from_entity_type_from_entity_id_idx" ON "dependencies"("from_entity_type", "from_entity_id");

-- CreateIndex
CREATE INDEX "dependencies_to_entity_type_to_entity_id_idx" ON "dependencies"("to_entity_type", "to_entity_id");

-- CreateIndex
CREATE INDEX "dependencies_owner_id_idx" ON "dependencies"("owner_id");

-- CreateIndex
CREATE INDEX "dependencies_phase_id_idx" ON "dependencies"("phase_id");

-- CreateIndex
CREATE INDEX "dependencies_tags_idx" ON "dependencies" USING GIN ("tags");

-- CreateIndex
CREATE UNIQUE INDEX "action_items_converted_task_id_key" ON "action_items"("converted_task_id");

-- CreateIndex
CREATE INDEX "action_items_rollout_id_status_idx" ON "action_items"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "action_items_owner_id_idx" ON "action_items"("owner_id");

-- CreateIndex
CREATE INDEX "action_items_meeting_id_idx" ON "action_items"("meeting_id");

-- CreateIndex
CREATE INDEX "action_items_phase_id_idx" ON "action_items"("phase_id");

-- CreateIndex
CREATE INDEX "action_items_tags_idx" ON "action_items" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "deliverables_rollout_id_status_idx" ON "deliverables"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "deliverables_workstream_id_idx" ON "deliverables"("workstream_id");

-- CreateIndex
CREATE INDEX "deliverables_owner_id_idx" ON "deliverables"("owner_id");

-- CreateIndex
CREATE INDEX "deliverables_phase_id_idx" ON "deliverables"("phase_id");

-- CreateIndex
CREATE INDEX "deliverables_tags_idx" ON "deliverables" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "documents_rollout_id_status_idx" ON "documents"("rollout_id", "status");

-- CreateIndex
CREATE INDEX "documents_workstream_id_idx" ON "documents"("workstream_id");

-- CreateIndex
CREATE INDEX "documents_owner_id_idx" ON "documents"("owner_id");

-- CreateIndex
CREATE INDEX "documents_phase_id_idx" ON "documents"("phase_id");

-- CreateIndex
CREATE INDEX "documents_tags_idx" ON "documents" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "meetings_rollout_id_meeting_date_idx" ON "meetings"("rollout_id", "meeting_date");

-- CreateIndex
CREATE INDEX "meetings_workstream_id_idx" ON "meetings"("workstream_id");

-- CreateIndex
CREATE INDEX "meetings_owner_id_idx" ON "meetings"("owner_id");

-- CreateIndex
CREATE INDEX "meetings_phase_id_idx" ON "meetings"("phase_id");

-- CreateIndex
CREATE INDEX "meetings_tags_idx" ON "meetings" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "meeting_participants_stakeholder_id_idx" ON "meeting_participants"("stakeholder_id");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participants_meeting_id_stakeholder_id_key" ON "meeting_participants"("meeting_id", "stakeholder_id");

-- CreateIndex
CREATE INDEX "notes_rollout_id_idx" ON "notes"("rollout_id");

-- CreateIndex
CREATE INDEX "notes_owner_id_idx" ON "notes"("owner_id");

-- CreateIndex
CREATE INDEX "notes_phase_id_idx" ON "notes"("phase_id");

-- CreateIndex
CREATE INDEX "notes_tags_idx" ON "notes" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "updates_rollout_id_update_type_idx" ON "updates"("rollout_id", "update_type");

-- CreateIndex
CREATE INDEX "updates_owner_id_idx" ON "updates"("owner_id");

-- CreateIndex
CREATE INDEX "updates_phase_id_idx" ON "updates"("phase_id");

-- CreateIndex
CREATE INDEX "updates_tags_idx" ON "updates" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "stakeholders_rollout_id_idx" ON "stakeholders"("rollout_id");

-- CreateIndex
CREATE INDEX "stakeholders_profile_id_idx" ON "stakeholders"("profile_id");

-- CreateIndex
CREATE INDEX "stakeholders_partner_id_idx" ON "stakeholders"("partner_id");

-- CreateIndex
CREATE INDEX "stakeholders_tags_idx" ON "stakeholders" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "teams_rollout_id_idx" ON "teams"("rollout_id");

-- CreateIndex
CREATE INDEX "teams_tags_idx" ON "teams" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "team_members_stakeholder_id_idx" ON "team_members"("stakeholder_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_stakeholder_id_key" ON "team_members"("team_id", "stakeholder_id");

-- CreateIndex
CREATE INDEX "partners_rollout_id_idx" ON "partners"("rollout_id");

-- CreateIndex
CREATE INDEX "partners_tags_idx" ON "partners" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "activity_log_rollout_id_created_at_idx" ON "activity_log"("rollout_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_log_entity_type_entity_id_idx" ON "activity_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_read_at_idx" ON "notifications"("recipient_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_rollout_id_idx" ON "notifications"("rollout_id");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rollouts" ADD CONSTRAINT "rollouts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rollouts" ADD CONSTRAINT "rollouts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phases" ADD CONSTRAINT "phases_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_dimensions" ADD CONSTRAINT "readiness_dimensions_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workstreams" ADD CONSTRAINT "workstreams_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workstreams" ADD CONSTRAINT "workstreams_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workstreams" ADD CONSTRAINT "workstreams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workstreams" ADD CONSTRAINT "workstreams_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_workstream_id_fkey" FOREIGN KEY ("workstream_id") REFERENCES "workstreams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_converted_task_id_fkey" FOREIGN KEY ("converted_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_workstream_id_fkey" FOREIGN KEY ("workstream_id") REFERENCES "workstreams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_workstream_id_fkey" FOREIGN KEY ("workstream_id") REFERENCES "workstreams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_workstream_id_fkey" FOREIGN KEY ("workstream_id") REFERENCES "workstreams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_stakeholder_id_fkey" FOREIGN KEY ("stakeholder_id") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_stakeholder_id_fkey" FOREIGN KEY ("stakeholder_id") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_rollout_id_fkey" FOREIGN KEY ("rollout_id") REFERENCES "rollouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Tenant isolation only: SELECT policies for organization members. There are
-- deliberately NO insert/update/delete policies — all mutations go through
-- the app layer (server actions → Prisma as postgres, which bypasses RLS).
-- See docs/09_database_design.md, "RLS strategy".
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Membership check used by every policy. SECURITY DEFINER so it can read
-- organization_members regardless of that table's own RLS.
CREATE OR REPLACE FUNCTION private.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = org_id
      AND m.profile_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION private.is_org_member(uuid) FROM public;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid) TO authenticated;

-- Tenancy tables -------------------------------------------------------------

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organizations_select_member" ON "organizations"
  FOR SELECT TO authenticated
  USING ("deleted_at" IS NULL AND private.is_org_member("id"));

ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organization_members_select_member" ON "organization_members"
  FOR SELECT TO authenticated
  USING (private.is_org_member("organization_id"));

ALTER TABLE "rollouts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rollouts_select_org_member" ON "rollouts"
  FOR SELECT TO authenticated
  USING ("deleted_at" IS NULL AND private.is_org_member("organization_id"));

-- Rollout-scoped tables (soft-deleted) ---------------------------------------
-- One policy shape, repeated: row is visible to members of the organization
-- that owns its (live) rollout.

ALTER TABLE "phases" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phases_select_org_member" ON "phases"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "readiness_dimensions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "readiness_dimensions_select_org_member" ON "readiness_dimensions"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "programmes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programmes_select_org_member" ON "programmes"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "workstreams" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workstreams_select_org_member" ON "workstreams"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "milestones" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_select_org_member" ON "milestones"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select_org_member" ON "tasks"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "risks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risks_select_org_member" ON "risks"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "issues" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues_select_org_member" ON "issues"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "decisions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decisions_select_org_member" ON "decisions"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "dependencies" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dependencies_select_org_member" ON "dependencies"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "action_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "action_items_select_org_member" ON "action_items"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "deliverables" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliverables_select_org_member" ON "deliverables"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select_org_member" ON "documents"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "meetings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meetings_select_org_member" ON "meetings"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_select_org_member" ON "notes"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "updates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates_select_org_member" ON "updates"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "stakeholders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stakeholders_select_org_member" ON "stakeholders"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_select_org_member" ON "teams"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "partners" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_select_org_member" ON "partners"
  FOR SELECT TO authenticated
  USING (
    "deleted_at" IS NULL
    AND EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

-- Join tables (no rollout_id; visibility via parent) --------------------------

ALTER TABLE "meeting_participants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meeting_participants_select_org_member" ON "meeting_participants"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      JOIN public.rollouts r ON r.id = m.rollout_id
      WHERE m.id = "meeting_id" AND m.deleted_at IS NULL AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_select_org_member" ON "team_members"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.teams t
      JOIN public.rollouts r ON r.id = t.rollout_id
      WHERE t.id = "team_id" AND t.deleted_at IS NULL AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

-- System surfaces -------------------------------------------------------------

ALTER TABLE "activity_log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_log_select_org_member" ON "activity_log"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rollouts r
      WHERE r.id = "rollout_id" AND r.deleted_at IS NULL
        AND private.is_org_member(r.organization_id)
    )
  );

-- Notifications are personal: recipient-only, regardless of org membership.
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_recipient" ON "notifications"
  FOR SELECT TO authenticated
  USING ("recipient_id" = (SELECT auth.uid()));
