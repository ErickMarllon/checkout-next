import { z } from "zod";

export const checkoutShippingSchema = z.object({
  zipCode: z
    .string()
    .trim()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),

  street: z.string().trim().min(1, "Rua inválida"),
  streetNumber: z.string().trim().min(1, "Número inválido"),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(1, "Bairro inválido"),
  city: z.string().trim().min(1, "Cidade inválida"),
  state: z.string().trim().min(2, "Estado inválido"), // normalmente UF
  country: z.string().trim().min(1, "País inválido"),
});

export type CheckoutShippingFormData = z.infer<typeof checkoutShippingSchema>;
