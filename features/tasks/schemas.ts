import { z } from "zod";

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  created_by: z.string().uuid(),
  title: z.string().min(1, "العنوان مطلوب").max(255),
  description: z.string().nullable().optional(),
  status: TaskStatusEnum,
  created_at: z.string(),
  updated_at: z.string(),
});

export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").max(255),
  description: z.string().optional().nullable(),
  status: TaskStatusEnum.default('TODO'),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
