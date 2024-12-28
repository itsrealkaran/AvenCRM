/*
  Warnings:

  - The `notes` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB;
