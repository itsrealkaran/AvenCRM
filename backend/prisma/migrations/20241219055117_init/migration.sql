/*
  Warnings:

  - You are about to drop the column `superAdminId` on the `AdminAccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `superAdminId` on the `AdminLoginLog` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `foundedYear` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `maxDeals` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxLeads` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `additionalInfo` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Agent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CalendarEventParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailCampaignRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SuperAdmin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToTeam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `AdminAccessToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AdminLoginLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setterId` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planEnd` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipients` to the `EmailCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buildingFeatures` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exteriorFeatures` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heatingNcooling` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interiorFeatures` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lotFeatures` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `measurements` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parking` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertySummary` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sqft` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bathrooms` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdById` on table `SupportTicket` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'SUBSCRIPTION', 'COMMISSION');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('GMAIL', 'OUTLOOK');

-- CreateEnum
CREATE TYPE "EmailAccountStatus" AS ENUM ('ACTIVE', 'NEEDS_REAUTH', 'DISABLED');

-- DropForeignKey
ALTER TABLE "AdminAccessToken" DROP CONSTRAINT "AdminAccessToken_superAdminId_fkey";

-- DropForeignKey
ALTER TABLE "AdminLoginLog" DROP CONSTRAINT "AdminLoginLog_superAdminId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_teamId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "CalendarEventParticipant" DROP CONSTRAINT "CalendarEventParticipant_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_agentId_fkey";

-- DropForeignKey
ALTER TABLE "EmailCampaign" DROP CONSTRAINT "EmailCampaign_createdById_fkey";

-- DropForeignKey
ALTER TABLE "EmailCampaignRecipient" DROP CONSTRAINT "EmailCampaignRecipient_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "EmailCampaignRecipient" DROP CONSTRAINT "EmailCampaignRecipient_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_agentId_fkey";

-- DropForeignKey
ALTER TABLE "PageBuilder" DROP CONSTRAINT "PageBuilder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_createdById_fkey";

-- DropForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_teamLeaderId_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToTeam" DROP CONSTRAINT "_AdminToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToTeam" DROP CONSTRAINT "_AdminToTeam_B_fkey";

-- DropForeignKey
ALTER TABLE "_AllowedAdmins" DROP CONSTRAINT "_AllowedAdmins_A_fkey";

-- DropForeignKey
ALTER TABLE "_AllowedAdmins" DROP CONSTRAINT "_AllowedAdmins_B_fkey";

-- AlterTable
ALTER TABLE "AdminAccessToken" DROP COLUMN "superAdminId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AdminLoginLog" DROP COLUMN "superAdminId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "companyId",
DROP COLUMN "endTime",
DROP COLUMN "location",
DROP COLUMN "organizerId",
DROP COLUMN "startTime",
DROP COLUMN "type",
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "setterId" TEXT NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "foundedYear",
DROP COLUMN "taxId",
ADD COLUMN     "planEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "planStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmailCampaign" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "failedSends" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recipients" JSONB NOT NULL,
ADD COLUMN     "successfulSends" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "totalRecipients" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "maxDeals",
DROP COLUMN "maxLeads",
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "additionalInfo",
DROP COLUMN "area",
DROP COLUMN "createdById",
DROP COLUMN "propertyType",
ADD COLUMN     "buildingFeatures" JSONB NOT NULL,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "exteriorFeatures" JSONB NOT NULL,
ADD COLUMN     "heatingNcooling" JSONB NOT NULL,
ADD COLUMN     "interiorFeatures" JSONB NOT NULL,
ADD COLUMN     "lotFeatures" JSONB NOT NULL,
ADD COLUMN     "measurements" JSONB NOT NULL,
ADD COLUMN     "parking" JSONB NOT NULL,
ADD COLUMN     "propertySummary" JSONB NOT NULL,
ADD COLUMN     "rooms" JSONB[],
ADD COLUMN     "sqft" INTEGER NOT NULL,
DROP COLUMN "bathrooms",
ADD COLUMN     "bathrooms" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SupportTicket" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "teamLeaderId" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Agent";

-- DropTable
DROP TABLE "CalendarEventParticipant";

-- DropTable
DROP TABLE "EmailCampaignRecipient";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "SuperAdmin";

-- DropTable
DROP TABLE "_AdminToTeam";

-- DropEnum
DROP TYPE "PaymentType";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "Gender",
    "dob" TIMESTAMP(3),
    "role" "UserRole" NOT NULL,
    "designation" TEXT,
    "lastLogin" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TransactionType" NOT NULL,
    "agentId" TEXT NOT NULL,
    "planType" "PlanTier",
    "isVerfied" BOOLEAN NOT NULL DEFAULT false,
    "invoiceNumber" TEXT,
    "taxRate" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION,
    "transactionMethod" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "provider" "EmailProvider" NOT NULL,
    "status" "EmailAccountStatus" NOT NULL,
    "lastError" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "emailAccountId" TEXT NOT NULL,
    "campaignId" TEXT,
    "recipients" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "companyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "Email_campaignId_idx" ON "Email"("campaignId");

-- CreateIndex
CREATE INDEX "Email_emailAccountId_idx" ON "Email"("emailAccountId");

-- CreateIndex
CREATE INDEX "Email_status_idx" ON "Email"("status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAccount" ADD CONSTRAINT "EmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccessToken" ADD CONSTRAINT "AdminAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLoginLog" ADD CONSTRAINT "AdminLoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBuilder" ADD CONSTRAINT "PageBuilder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedAdmins" ADD CONSTRAINT "_AllowedAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "PageBuilder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedAdmins" ADD CONSTRAINT "_AllowedAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
