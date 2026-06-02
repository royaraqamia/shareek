import { z } from 'zod';

export const CreateTransactionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  version: z.number().int().nonnegative().optional(),
});

export const CreateTransactionSchema = z.object({
  contactId: z.string().uuid(),
  type: z.enum(['SALE', 'PURCHASE']),
  referenceNumber: z.string().min(1).max(100),
  taxRate: z.literal(0.15), // Static 15% VAT MVP limit
  idempotencyKey: z.string().uuid(),
  items: z.array(CreateTransactionItemSchema).nonempty(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
