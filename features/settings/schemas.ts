import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  taxNumber: z.string().min(1, "Tax number is required").nullable().or(z.literal('')),
  currency: z.string().min(1).default('SAR'),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
