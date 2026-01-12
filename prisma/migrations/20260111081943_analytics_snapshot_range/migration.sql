-- AlterTable
ALTER TABLE "AnalyticsSnapshot" ADD COLUMN     "from" TIMESTAMP(3),
ADD COLUMN     "to" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "updatedAt" DROP DEFAULT;
