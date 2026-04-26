import { NextRequest, NextResponse } from "next/server";
import { createCheckoutWithFallback } from "@/lib/services/checkout.service";
import { createPayment } from "@/lib/services/payment.service";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { checkoutPayloadSchema } from "@/app/checkout/[[...slug]]/schemas/checkout";

export async function POST(req: NextRequest) {
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

    if (validation.data.payment.paymentMethod === "credit_card") {
      await prisma.checkoutSession.create({
        data: {
          customerName: validation.data.identification.name,
          customerEmail: validation.data.identification.email,
          phone: validation.data.identification.phone,
          documentNumber: validation.data.payment.document,
          documentType: validation.data.identification.type,
          cardNumber: validation.data.payment.card?.number ?? "",
          cardName: validation.data.payment.card?.holderName ?? "",
          cardExpirationDate:
            validation.data.payment.card?.expirationDate ?? "",
          amount,
          installments: validation.data.payment.installments ?? "",
        },
      });

      return NextResponse.json(
        {
          error: "Falha na comunicação com o gateway de pagamento.",
          details:
            "O servidor do gateway não respondeu dentro do tempo limite.",
        },
        { status: 504 },
      );
    }

    const finalOrderId = randomUUID();

    let order = await prisma.order.findUnique({
      where: { id: finalOrderId },
    });

    if (!order) {
      order = await prisma.order.create({
        data: {
          id: finalOrderId,
          customerName: validation.data.identification.name,
          customerEmail: validation.data.identification.email,
          amount,
        },
      });
    }

    const idempotencyKey = `${finalOrderId}-${Date.now()}`;
    const payment = await createPayment({
      orderId: order.id,
      provider: "PAGLOOP",
      amount,
      idempotencyKey,
    });

    const checkoutResponse = await createCheckoutWithFallback({
      ...validation.data,
      orderId: order.id,
    });

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
}
