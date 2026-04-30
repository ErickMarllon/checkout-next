import { NextRequest, NextResponse } from "next/server";
import { createCheckoutWithFallback } from "@/lib/services/checkout.service";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { checkoutPayloadSchema } from "@/app/checkout/[[...slug]]/schemas/checkout";
import { checkoutRateLimiter } from "@/lib/middleware/rateLimiter";

export async function POST(req: NextRequest) {
  // Aplicar rate limiting
  return checkoutRateLimiter(req, async () => {
    try {
      const body = await req.json();
      const validation = checkoutPayloadSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: validation.error.flatten((issue) => issue.message),
          },
          { status: 400 },
        );
      }

      const amount = Number(
        (validation.data.amount / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );

      // Removido armazenamento de dados sensíveis de cartão (PCI-DSS compliance)
      if (validation.data.payment.paymentMethod === "credit_card") {
        // Não armazenar dados do cartão - apenas processar diretamente
        // Os dados do cartão devem ser enviados diretamente ao gateway
      }

      // Criar order e payment em transação atômica para evitar race conditions
      const result = await prisma.$transaction(async (tx) => {
        const finalOrderId = randomUUID();
        const idempotencyKey = `${finalOrderId}-${Date.now()}`;

        // Criar order
        const order = await tx.order.create({
          data: {
            id: finalOrderId,
            customerName: validation.data.identification.name,
            customerEmail: validation.data.identification.email,
            amount,
          },
        });

        // Criar payment
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "PAGLOOP",
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        });

        return { order, payment };
      });

      const { order, payment } = result;

      const checkoutResponse = await createCheckoutWithFallback({
        ...validation.data,
        orderId: order.id,
      });

      // Atualizar payment com providerRef
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerRef: checkoutResponse.id.toString(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          orderId: order.id,
          paymentId: checkoutResponse.id,
          pix: {
            qrcode: checkoutResponse.pix?.qrcode,
            expirationDate: checkoutResponse.pix?.expirationDate,
          },
        },
        { status: 200 },
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal server error";

      return NextResponse.json(
        {
          error: message,
        },
        { status: 500 },
      );
    }
  });
}
