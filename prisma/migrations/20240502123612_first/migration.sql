-- CreateEnum
CREATE TYPE "BankName" AS ENUM ('INDIAN_BANK');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('TRANSACTIONS', 'COMPLAINT_REGISTRATION');

-- CreateTable
CREATE TABLE "Token" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "languageDetected" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessions" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "useCase" TEXT,
    "ticketRaised" BOOLEAN NOT NULL DEFAULT false,
    "ticketId" TEXT,
    "ticketRaisedTime" TIMESTAMP(3),
    "state" INTEGER NOT NULL DEFAULT 0,
    "languageByAdya" TEXT,
    "retriesLeft" INTEGER,
    "ratings" INTEGER,
    "experienceRating" INTEGER,
    "bankAccountNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "complaintCategoryId" INTEGER,
    "complaintCategory" TEXT,
    "complaintCategoryType" TEXT,
    "complaintCategorySubType" TEXT,
    "initialQuery" TEXT NOT NULL,
    "selectedTransactionId" TEXT,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "languageDetected" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageTranslation" TEXT NOT NULL,
    "audioFile" TEXT,
    "promptType" TEXT NOT NULL,
    "options" TEXT[],
    "timeStamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionDetails" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "transactionId" TEXT,
    "amount" TEXT,
    "transactionType" TEXT NOT NULL,
    "transactionTimeBank" TIMESTAMP(3) NOT NULL,
    "transactionNarration" TEXT NOT NULL,
    "isEducated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TransactionDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankInteractions" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "bankName" "BankName" NOT NULL,
    "interactionType" "InteractionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "BankInteractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankNarrations" (
    "id" UUID NOT NULL,
    "narration" TEXT NOT NULL,
    "natureOfCharge" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "BankNarrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_phoneNumber_key" ON "Users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_sessionId_key" ON "Sessions"("sessionId");

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionDetails" ADD CONSTRAINT "TransactionDetails_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankInteractions" ADD CONSTRAINT "BankInteractions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE;
