/*
  Warnings:

  - The `propertyType` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notes` column on the `Deal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `socialProfiles` on the `Lead` table. All the data in the column will be lost.
  - The `propertyType` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notes` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bathrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `buildingFeatures` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `exteriorFeatures` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `heatingNcooling` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `interiorFeatures` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `lotFeatures` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `measurements` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `parking` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `propertySummary` on the `Property` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Added the required column `listingPrice` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('COMMERCIAL', 'RESIDENTIAL', 'LAND');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'PENDING', 'SOLD', 'INACTIVE');

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

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "bathrooms",
DROP COLUMN "buildingFeatures",
DROP COLUMN "exteriorFeatures",
DROP COLUMN "heatingNcooling",
DROP COLUMN "interiorFeatures",
DROP COLUMN "lotFeatures",
DROP COLUMN "measurements",
DROP COLUMN "parking",
DROP COLUMN "propertySummary",
ADD COLUMN     "amenities" JSONB,
ADD COLUMN     "annualTax" DECIMAL(10,2),
ADD COLUMN     "buildingType" TEXT,
ADD COLUMN     "listingPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "location" JSONB,
ADD COLUMN     "propertyType" "PropertyType" NOT NULL DEFAULT 'COMMERCIAL',
ADD COLUMN     "specifications" JSONB,
ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "yearBuilt" INTEGER,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- CreateIndex
CREATE INDEX "Property_creatorId_idx" ON "Property"("creatorId");
