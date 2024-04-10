/*
  Warnings:

  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Token";

-- CreateTable
CREATE TABLE "BankToken" (
    "id" UUID NOT NULL,
    "token" TEXT,
    "bankName" "BankName" NOT NULL,
    "bankId" TEXT NOT NULL,

    CONSTRAINT "BankToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankToken_bankName_key" ON "BankToken"("bankName");

-- CreateIndex
CREATE UNIQUE INDEX "BankToken_bankId_key" ON "BankToken"("bankId");
