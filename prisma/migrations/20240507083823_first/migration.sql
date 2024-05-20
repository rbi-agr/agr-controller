-- AlterEnum
ALTER TYPE "InteractionType" ADD VALUE 'LOAN_ACCOUNT_BALANCE';

-- AlterTable
ALTER TABLE "Sessions" ADD COLUMN     "finalSentiment" TEXT,
ADD COLUMN     "finalSentimentScore" DECIMAL(65,30),
ADD COLUMN     "intialSentiment" TEXT,
ADD COLUMN     "intialSentimentScore" DECIMAL(65,30);
