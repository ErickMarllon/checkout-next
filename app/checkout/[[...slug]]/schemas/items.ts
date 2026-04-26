import { z } from "zod";

const BaseItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string(),
  tangible: z.boolean(),
  discount: z.number().min(0).optional(),
});

export const ItemSchema = BaseItemSchema.extend({
  gift: BaseItemSchema.optional(),
});

export const ItemWithoutImageSchema = ItemSchema.omit({
  image: true,
  discount: true,
  gift: true,
});

export type ProductFormData = z.input<typeof ItemSchema>;
