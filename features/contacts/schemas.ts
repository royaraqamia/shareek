import { z } from 'zod';

export const CreateContactSchema = z.object({
  type: z.enum(['CLIENT', 'SUPPLIER']),
  name: z.string().min(2).max(255),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
