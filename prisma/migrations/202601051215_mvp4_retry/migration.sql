-- Safe reapply for MVP 4.0 changes (idempotent-ish for existing DB)

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'orgrole') THEN
    CREATE TYPE "OrgRole" AS ENUM ('ORG_ADMIN', 'FACILITATOR');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'memberstatus') THEN
    CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE lower(typname) = 'answerstatus') THEN
    CREATE TYPE "AnswerStatus" AS ENUM ('ANSWERED', 'UNKNOWN', 'DECLINED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OrgMember" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");
CREATE INDEX IF NOT EXISTS "OrgMember_orgId_idx" ON "OrgMember"("orgId");
CREATE UNIQUE INDEX IF NOT EXISTS "OrgMember_orgId_userId_key" ON "OrgMember"("orgId", "userId");

-- Ensure default org exists
INSERT INTO "Organization" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT 'default-org', 'Default Organization', 'default-org', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Organization");

-- Group orgId
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
UPDATE "Group" SET "orgId" = COALESCE("orgId", 'default-org');
ALTER TABLE "Group" ALTER COLUMN "orgId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Group_orgId_idx" ON "Group"("orgId");

-- Activity scheduling
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "openAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "closeAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
CREATE INDEX IF NOT EXISTS "Activity_openAt_idx" ON "Activity"("openAt");
CREATE INDEX IF NOT EXISTS "Activity_closeAt_idx" ON "Activity"("closeAt");

-- Question follow-up
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "followUp" JSONB;

-- Answer status/meta and nullable value
ALTER TABLE "Answer" ALTER COLUMN "value" DROP NOT NULL;
ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "status" "AnswerStatus" NOT NULL DEFAULT 'ANSWERED';
ALTER TABLE "Answer" ADD COLUMN IF NOT EXISTS "meta" JSONB;

-- FKs (guarded)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Organization_createdById_fkey') THEN
    ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrgMember_orgId_fkey') THEN
    ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrgMember_userId_fkey') THEN
    ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Group_orgId_fkey') THEN
    ALTER TABLE "Group" ADD CONSTRAINT "Group_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
