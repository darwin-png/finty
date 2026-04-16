-- AlterEnum
ALTER TYPE "finty"."Role" ADD VALUE 'SUPERADMIN';

-- DropForeignKey
ALTER TABLE "finty"."User" DROP CONSTRAINT "User_organizationId_fkey";

-- AlterTable
ALTER TABLE "finty"."User" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "finty"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "finty"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
