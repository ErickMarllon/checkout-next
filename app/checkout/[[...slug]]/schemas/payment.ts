import { z } from "zod";

export const cardSchema = z
  .object({
    hash: z.string().optional(),

    number: z
      .string()
      .min(13, "Número do cartão inválido")
      .max(19, "Número do cartão inválido")
      .optional(),

    holderName: z.string().min(3, "Nome do portador inválido").optional(),

    expirationMonth: z.number("Mês inválido").min(1).max(12).optional(),

    expirationYear: z
      .number("Ano inválido")
      .min(new Date().getFullYear())
      .max(new Date().getFullYear() + 20)
      .optional(),

    expirationDate: z
      .string()
      .refine((value) => {
        const [monthStr] = value.split("/");
        const month = Number(monthStr);

        return month >= 1 && month <= 12;
      }, "Mês inválido")
      .refine((value) => {
        const [monthStr, yearStr] = value.split("/");

        const month = Number(monthStr);
        const year = 2000 + Number(yearStr);

        // último dia do mês
        const expiration = new Date(year, month, 0);
        const now = new Date();

        return expiration > now;
      }, "Cartão expirado"),

    cvv: z.string().min(3, "CVV inválido").max(4, "CVV inválido").optional(),

    sessionId: z.string().min(1, "SessionId obrigatório"),
  })
  .superRefine((data, ctx) => {
    const hasHash = !!data.hash;

    const hasFullCardData =
      data.number &&
      data.holderName &&
      data.expirationMonth &&
      data.expirationYear &&
      data.cvv;

    // Regra principal
    if (!hasHash && !hasFullCardData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o hash do cartão ou todos os dados do cartão",
        path: ["hash"],
      });
    }

    // Se não tem hash, valida tudo obrigatório
    if (!hasHash) {
      if (!data.number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número do cartão obrigatório",
          path: ["number"],
        });
      }

      if (!data.holderName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome do portador obrigatório",
          path: ["holderName"],
        });
      }

      if (!data.expirationMonth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mês obrigatório",
          path: ["expirationMonth"],
        });
      }

      if (!data.expirationYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano obrigatório",
          path: ["expirationYear"],
        });
      }

      if (!data.cvv) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVV obrigatório",
          path: ["cvv"],
        });
      }
    }
  });

export const checkoutPaymentSchema = z
  .object({
    document: z.string(),

    paymentMethod: z.enum(["pix", "credit_card", "boleto"], {
      message: "Forma de pagamento inválida",
    }),
    installments: z.string().optional(),
    card: cardSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "credit_card") {
      if (!data.card) {
        ctx.addIssue({
          code: "custom",
          message: "Dados do cartão obrigatórios",
          path: ["card"],
        });
      }

      // installments obrigatório
      if (!data.installments) {
        ctx.addIssue({
          code: "custom",
          message: "Parcelamento obrigatório",
          path: ["installments"],
        });
      }

      if (data.card) {
        const result = cardSchema.safeParse(data.card);

        if (!result.success) {
          result.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["card", ...(issue.path ?? [])],
            });
          });
        }
      }
    }
  });
