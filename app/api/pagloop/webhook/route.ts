import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * Valida a assinatura do webhook do Pagloop
 * @param payload - Corpo bruto do webhook
 * @param signature - Assinatura do header 'x-pagloop-signature'
 * @returns boolean
 */
function isValidWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAGLOOP_WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      "⚠️ PAGLOOP_WEBHOOK_SECRET not configured - webhook validation disabled",
    );
    return true;
  }

  const hash = createHmac("sha256", secret).update(payload).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    // Obter payload bruto para validação de assinatura
    const rawBody = await req.text();
    const signature = req.headers.get("x-pagloop-signature") || "";

    // Validar assinatura
    if (!isValidWebhookSignature(rawBody, signature)) {
      console.warn("🔐 Webhook signature validation failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    // Buscar o pagamento pela referência do provider (checkoutId)
    const payment = await prisma.payment.findFirst({
      where: { providerRef: data.checkoutId },
      include: { order: true },
    });

    if (!payment) {
      console.warn(`Payment not found for checkout: ${data.checkoutId}`);
      return NextResponse.json({ ok: true }); // Retornar 200 anyway
    }

    // Idempotência: se já está pago, ignora
    if (payment.status === "PAID" && event === "checkout.paid") {
      return NextResponse.json({ ok: true });
    }

    // Processar eventos
    if (event === "checkout.paid" && data.status === "paid") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: "PAID",
          },
        }),
      ]);

      console.log(`✅ Payment confirmed: ${payment.id}`);
    }

    if (event === "payment.failed" && data.status === "failed") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          errorMessage: data.error || "Payment failed",
        },
      });

      console.log(`❌ Payment failed: ${payment.id}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    // Sempre retornar 200 para que Pagloop não reenvie
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
