import { PaymentGateway } from "./types";
import { pagloopFetch, pagloopGet } from "@/lib/pagloop";
import { PagloopCheckoutRequest } from "@/types/pagloop";

export const pagloopGateway: PaymentGateway = {
  async createCheckout(input) {
    const checkoutData: PagloopCheckoutRequest = {
      amount: input.amount,
      currency: "BRL",
      paymentMethod: input.payment.paymentMethod,
      pix: {
        expiresInDays: 1,
      },
      items: input.items,
      shipping: {
        fee: input.shipping.fee,
        address: {
          street: input.shipping.address.street,
          streetNumber: input.shipping.address.streetNumber,
          city: input.shipping.address.city,
          state: input.shipping.address.state,
          zipCode: input.shipping.address.zipCode,
          neighborhood: input.shipping.address.neighborhood,
          country: input.shipping.address.country,
          ...(input.shipping.address.complement && {
            complement: input.shipping.address.complement,
          }),
        },
      },
      customer: {
        name: input.identification.name,
        email: input.identification.email,
        phone: input.identification.phone,
        document: {
          number: input.payment.document,
          type: input.identification.type,
        },
      },

      metadata: JSON.stringify({
        orderId: input.orderId,
      }),

      postbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/pagloop/webhook`,
      returnUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
    };

    const data = await pagloopFetch({
      method: "POST",
      body: JSON.stringify(checkoutData),
    });
    console.log("🚀 ~ data:", data);

    if (!data.id) {
      throw new Error("Invalid Pagloop checkout response");
    }

    return data;
  },

  async findCheckout(input) {
    const data = await pagloopGet(input);

    if (!data.id) {
      throw new Error("Invalid Pagloop checkout response");
    }

    return data;
  },
};
