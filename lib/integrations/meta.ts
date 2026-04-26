export async function sendPurchaseEvent({
  email,
  value,
  orderId,
}: {
  email: string;
  value: number;
  orderId: string;
}) {
  await fetch(
    `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              em: [email],
            },
            custom_data: {
              currency: "BRL",
              value,
              order_id: orderId,
            },
          },
        ],
        access_token: process.env.META_ACCESS_TOKEN,
      }),
    },
  );
}
