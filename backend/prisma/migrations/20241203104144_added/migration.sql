/*
  Warnings:

  - Added the required column `gender` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHERS');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "gender" "Gender" NOT NULL;
