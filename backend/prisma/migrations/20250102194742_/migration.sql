/*
  Warnings:

  - You are about to drop the column `recipients` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `recipients` on the `EmailCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `EmailCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `isVerfied` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_companyId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "recipients";

-- AlterTable
ALTER TABLE "EmailCampaign" DROP COLUMN "recipients",
DROP COLUMN "templateId";

-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "category" TEXT,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "variables" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "companyId" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isVerfied",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EmailRecipient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tags" TEXT[],
    "notes" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailCampaignToEmailRecipient" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailCampaignToEmailRecipient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EmailToEmailRecipient" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmailToEmailRecipient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "EmailRecipient_userId_idx" ON "EmailRecipient"("userId");

-- CreateIndex
CREATE INDEX "EmailRecipient_companyId_idx" ON "EmailRecipient"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailRecipient_email_companyId_key" ON "EmailRecipient"("email", "companyId");

-- CreateIndex
CREATE INDEX "_EmailCampaignToEmailRecipient_B_index" ON "_EmailCampaignToEmailRecipient"("B");

-- CreateIndex
CREATE INDEX "_EmailToEmailRecipient_B_index" ON "_EmailToEmailRecipient"("B");

-- CreateIndex
CREATE INDEX "EmailCampaign_companyId_idx" ON "EmailCampaign"("companyId");

-- CreateIndex
CREATE INDEX "EmailCampaign_createdById_idx" ON "EmailCampaign"("createdById");

-- CreateIndex
CREATE INDEX "EmailTemplate_companyId_idx" ON "EmailTemplate"("companyId");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailCampaignToEmailRecipient" ADD CONSTRAINT "_EmailCampaignToEmailRecipient_A_fkey" FOREIGN KEY ("A") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailCampaignToEmailRecipient" ADD CONSTRAINT "_EmailCampaignToEmailRecipient_B_fkey" FOREIGN KEY ("B") REFERENCES "EmailRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToEmailRecipient" ADD CONSTRAINT "_EmailToEmailRecipient_A_fkey" FOREIGN KEY ("A") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailToEmailRecipient" ADD CONSTRAINT "_EmailToEmailRecipient_B_fkey" FOREIGN KEY ("B") REFERENCES "EmailRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
