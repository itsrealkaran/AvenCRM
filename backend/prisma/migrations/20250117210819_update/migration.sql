/*
  Warnings:

  - The `propertyType` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notes` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `socialProfiles` on the `Lead` table. All the data in the column will be lost.
  - The `propertyType` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notes` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('COMMERCIAL', 'RESIDENTIAL', 'LAND');

-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" "PropertyType" NOT NULL DEFAULT 'COMMERCIAL',
DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "socialProfiles",
DROP COLUMN "propertyType",
ADD COLUMN     "propertyType" "PropertyType" NOT NULL DEFAULT 'COMMERCIAL',
DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB[] DEFAULT ARRAY[]::JSONB[];
