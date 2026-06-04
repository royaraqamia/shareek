import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional().or(z.literal('')),
  salePrice: z.number().nonnegative(),
  purchasePrice: z.number().nonnegative().optional(),
  currentStock: z.number().int().nonnegative().optional().default(0),
  isService: z.boolean().optional().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
