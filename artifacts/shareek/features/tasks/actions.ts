'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CreateTaskInput, UpdateTaskInput, Task } from './schemas';

export async function fetchTasksAction() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch tasks error:', error);
      return { success: false as const, error: error.message };
    }

    return { success: true as const, data: data as Task[] };
  } catch (err: any) {
    console.error('Fetch tasks exception:', err);
    return { success: false as const, error: err.message };
  }
}

export async function createTaskAction(input: CreateTaskInput) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    // Getting the user's organization_id requires fetching their profile.
    const { data: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();

    if (profileError) {
       console.error("Profile fetch error", profileError);
    }
    // Alternatively, getting organization_id using the RPC or it being set correctly using RLS 
    // but the tasks table `organization_id` requires explicit population if not defaulting usingtrigger. 
    // Wait, the transaction table uses `get_user_org_id()` but generally it's better to provide it or rely on DB default if we created a trigger.
    // Let's explicitly fetch it.
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile || !profile.organization_id) {
       return { success: false as const, error: "User has no organization associated" };
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        organization_id: profile.organization_id,
        created_by: userData.user.id,
        title: input.title,
        description: input.description,
        status: input.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Create task error:', error);
      return { success: false as const, error: error.message };
    }

    return { success: true as const, data: data as Task };
  } catch (err: any) {
    console.error('Create task exception:', err);
    return { success: false as const, error: err.message };
  }
}

export async function updateTaskAction(input: UpdateTaskInput) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: input.title,
        description: input.description,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      console.error('Update task error:', error);
      return { success: false as const, error: error.message };
    }

    return { success: true as const, data: data as Task };
  } catch (err: any) {
    console.error('Update task exception:', err);
    return { success: false as const, error: err.message };
  }
}

export async function bulkDeleteTasksAction(ids: string[]) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Bulk delete tasks error:', error);
      return { success: false as const, error: error.message };
    }

    return { success: true as const };
  } catch (err: any) {
    console.error('Bulk delete tasks exception:', err);
    return { success: false as const, error: err.message };
  }
}

export async function bulkUpdateTasksStatusAction(ids: string[], status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (error) {
      console.error('Bulk update tasks status error:', error);
      return { success: false as const, error: error.message };
    }

    return { success: true as const };
  } catch (err: any) {
    console.error('Bulk update tasks status exception:', err);
    return { success: false as const, error: err.message };
  }
}
