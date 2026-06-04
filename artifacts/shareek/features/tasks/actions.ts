'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CreateTaskInput, UpdateTaskInput, Task } from './schemas';
import { getApprovedUser } from '../auth/actions';

export async function fetchTasksAction() {
  const user = await getApprovedUser();
  if (!user.success) return { success: false as const, code: user.code, message: user.message };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false as const, code: "DATABASE_ERROR", message: error.message };
    }

    return { success: true as const, data: data as Task[] };
  } catch (err: any) {
    return { success: false as const, code: "EXCEPTION", message: err.message };
  }
}

export async function createTaskAction(input: CreateTaskInput) {
  const user = await getApprovedUser();
  if (!user.success) return { success: false as const, code: user.code, message: user.message };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        organization_id: user.organizationId,
        created_by: user.user.id,
        title: input.title,
        description: input.description,
        status: input.status,
      })
      .select()
      .single();

    if (error) {
      return { success: false as const, code: "DATABASE_ERROR", message: error.message };
    }

    revalidatePath('/tasks');
    return { success: true as const, data: data as Task };
  } catch (err: any) {
    return { success: false as const, code: "EXCEPTION", message: err.message };
  }
}

export async function updateTaskAction(input: UpdateTaskInput) {
  const user = await getApprovedUser();
  if (!user.success) return { success: false as const, code: user.code, message: user.message };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: input.title,
        description: input.description,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('organization_id', user.organizationId)
      .select()
      .single();

    if (error) {
      return { success: false as const, code: "DATABASE_ERROR", message: error.message };
    }

    revalidatePath('/tasks');
    return { success: true as const, data: data as Task };
  } catch (err: any) {
    return { success: false as const, code: "EXCEPTION", message: err.message };
  }
}

export async function bulkDeleteTasksAction(ids: string[]) {
  const user = await getApprovedUser();
  if (!user.success) return { success: false as const, code: user.code, message: user.message };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids)
      .eq('organization_id', user.organizationId);

    if (error) {
      return { success: false as const, code: "DATABASE_ERROR", message: error.message };
    }

    revalidatePath('/tasks');
    return { success: true as const };
  } catch (err: any) {
    return { success: false as const, code: "EXCEPTION", message: err.message };
  }
}

export async function bulkUpdateTasksStatusAction(ids: string[], status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
  const user = await getApprovedUser();
  if (!user.success) return { success: false as const, code: user.code, message: user.message };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .eq('organization_id', user.organizationId);

    if (error) {
      return { success: false as const, code: "DATABASE_ERROR", message: error.message };
    }

    revalidatePath('/tasks');
    return { success: true as const };
  } catch (err: any) {
    return { success: false as const, code: "EXCEPTION", message: err.message };
  }
}
