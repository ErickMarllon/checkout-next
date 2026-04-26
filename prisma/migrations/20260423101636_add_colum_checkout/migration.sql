-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardName" TEXT NOT NULL,
    "cardExpirationDate" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "installments" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);
