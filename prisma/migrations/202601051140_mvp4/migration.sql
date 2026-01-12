-- MVP 4.0 incremental migration (from init + mvp3)
-- Adds organizations/roles, scheduling fields, follow-ups, answer status/meta.

-- Enums
CREATE TYPE "OrgRole" AS ENUM ('ORG_ADMIN', 'FACILITATOR');
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE');
CREATE TYPE "AnswerStatus" AS ENUM ('ANSWERED', 'UNKNOWN', 'DECLINED');

-- Tables
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

CREATE TABLE "OrgMember" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrgMember_orgId_idx" ON "OrgMember"("orgId");
CREATE UNIQUE INDEX "OrgMember_orgId_userId_key" ON "OrgMember"("orgId", "userId");

-- Columns: Group gets orgId
ALTER TABLE "Group" ADD COLUMN "orgId" TEXT;

-- Backfill: create default org if missing and attach existing groups
INSERT INTO "Organization" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT 'default-org', 'Default Organization', 'default-org', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Organization");

UPDATE "Group" SET "orgId" = 'default-org' WHERE "orgId" IS NULL;

ALTER TABLE "Group" ALTER COLUMN "orgId" SET NOT NULL;
CREATE INDEX "Group_orgId_idx" ON "Group"("orgId");

-- Columns: Activity scheduling
ALTER TABLE "Activity" ADD COLUMN "openAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN "closeAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN "timezone" TEXT;
CREATE INDEX "Activity_openAt_idx" ON "Activity"("openAt");
CREATE INDEX "Activity_closeAt_idx" ON "Activity"("closeAt");

-- Columns: Question followUp
ALTER TABLE "Question" ADD COLUMN "followUp" JSONB;

-- Columns: Answer status/meta
ALTER TABLE "Answer" ADD COLUMN "status" "AnswerStatus" NOT NULL DEFAULT 'ANSWERED';
ALTER TABLE "Answer" ADD COLUMN "meta" JSONB;

-- Foreign keys
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Group" ADD CONSTRAINT "Group_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
