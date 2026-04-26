import { z } from "zod";
// import { isValidCPF, isValidCNPJ } from "cnpj-cpf-validator";

export const checkoutCustomerSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.email("E-mail é obrigatório"),
  phone: z.string().min(14, "Telefone inválido"),
  type: z.enum(["cpf", "cnpj"]),
});

export type CheckoutCustomerFormData = z.infer<typeof checkoutCustomerSchema>;
