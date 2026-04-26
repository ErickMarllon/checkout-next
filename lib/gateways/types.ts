import { CheckoutItemWithoutImageFormData } from "@/app/checkout/[[...slug]]/schemas/checkout";
import { PagloopCheckoutResponse } from "@/types/pagloop";

export type PaymentInput = CheckoutItemWithoutImageFormData & {
  orderId: string;
};

export interface PaymentGateway {
  createCheckout(input: PaymentInput): Promise<PagloopCheckoutResponse>;
  findCheckout(input: string): Promise<PagloopCheckoutResponse>;
}
