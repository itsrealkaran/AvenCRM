/*
  Warnings:

  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `foundedYear` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `secondPartyName` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `maxDeals` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxLeads` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the `CalendarEventParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToTeam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `setterId` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planEnd` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planType` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEventParticipant" DROP CONSTRAINT "CalendarEventParticipant_eventId_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToTeam" DROP CONSTRAINT "_AdminToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToTeam" DROP CONSTRAINT "_AdminToTeam_B_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "role",
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "companyId",
DROP COLUMN "organizerId",
ADD COLUMN     "setterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "foundedYear",
DROP COLUMN "taxId",
ADD COLUMN     "planEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "planStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "description",
DROP COLUMN "secondPartyName",
ADD COLUMN     "planType" "PlanTier" NOT NULL;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "maxDeals",
DROP COLUMN "maxLeads",
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "CalendarEventParticipant";

-- DropTable
DROP TABLE "_AdminToTeam";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "superAdminId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "planTier" "PlanTier" NOT NULL,
    "subscriptionPeriod" TIMESTAMP(3) NOT NULL,
    "subscriptionEndDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
