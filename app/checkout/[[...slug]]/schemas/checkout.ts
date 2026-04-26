import { z } from "zod";
import { checkoutCustomerSchema } from "./customer";
import { checkoutShippingSchema } from "./shipping";
import { ItemSchema, ItemWithoutImageSchema } from "./items";
import { checkoutPaymentSchema } from "./payment";

export const checkoutSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo"),
  identification: checkoutCustomerSchema,
  shipping: z.object({
    fee: z.number().positive("O valor do frete deve ser positivo"),
    address: checkoutShippingSchema,
  }),
  payment: checkoutPaymentSchema,
  items: z.array(ItemSchema).min(1, "Adicione pelo menos um item"),
});

export const checkoutPayloadSchema = z.object({
  amount: z.number().positive("O valor deve ser positivo"),
  identification: checkoutCustomerSchema,
  shipping: z.object({
    fee: z.number().positive("O valor do frete deve ser positivo"),
    address: checkoutShippingSchema,
  }),
  payment: checkoutPaymentSchema,
  items: z.array(ItemWithoutImageSchema).min(1, "Adicione pelo menos um item"),
});

export type CheckoutFormData = z.input<typeof checkoutSchema>;
export type CheckoutItemWithoutImageFormData = z.infer<
  typeof checkoutPayloadSchema
>;
