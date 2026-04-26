import { prisma } from "@/lib/prisma";

export async function createPayment({
  orderId,
  provider,
  amount,
  idempotencyKey,
}: {
  orderId: string;
  provider: "PAGLOOP";
  amount: number;
  idempotencyKey: string;
}) {
  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey },
  });

  if (existing) return existing;

  return prisma.payment.create({
    data: {
      orderId,
      provider,
      amount,
      idempotencyKey,
    },
  });
}
