-- CreateEnum
CREATE TYPE "LeadRole" AS ENUM ('SALE', 'BUY', 'RENT');

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "role" "LeadRole" NOT NULL DEFAULT 'SALE';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "role" "LeadRole" NOT NULL DEFAULT 'SALE';
