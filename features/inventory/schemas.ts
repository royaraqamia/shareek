import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(255),
  sku: z.string().min(1).max(100).optional(),
  salePrice: z.number().nonnegative(),
  purchasePrice: z.number().nonnegative(),
  currentStock: z.number().int().nonnegative().default(0),
  isService: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
