/*
  Warnings:

  - You are about to drop the column `companyId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_companyId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "banner" TEXT;
