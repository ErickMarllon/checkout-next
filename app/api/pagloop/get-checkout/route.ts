import { NextRequest, NextResponse } from "next/server";
import { findCheckoutWithFallback } from "@/lib/services/checkout.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      return NextResponse.json(
        { error: "order_id is required" },
        { status: 400 },
      );
    }
    const checkoutResponse = await findCheckoutWithFallback(orderId);

    return NextResponse.json(
      {
        success: true,
        orderId: checkoutResponse.id,
        status: checkoutResponse.status,
        amount: checkoutResponse.amount,
        pix: {
          qrcode: checkoutResponse.pix?.qrcode,
          expirationDate: checkoutResponse.pix?.expirationDate,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Checkout creation error:", err);

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
