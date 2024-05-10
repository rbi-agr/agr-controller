-- CreateTable
CREATE TABLE "Templates" (
    "id" SERIAL NOT NULL,
    "narration" TEXT NOT NULL,
    "accountType" TEXT,
    "amount" INTEGER,
    "language" TEXT NOT NULL,
    "template" TEXT[],

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("id")
);
