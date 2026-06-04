import { z } from 'zod';

export const TransactionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  version: z.number().int().nonnegative().optional(),
});

export const CreateTransactionSchema = z.object({
  contactId: z.string().uuid(),
  type: z.enum(['SALE', 'PURCHASE']),
  referenceNumber: z.string().min(1, "Reference number is required"),
  taxRate: z.number().min(0).max(1).default(0.15),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID']).default('UNPAID'),
  idempotencyKey: z.string().uuid(),
  items: z.array(TransactionItemSchema).min(1, "Must contain at least one item"),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
