'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export type SearchResultItem = {
  id: string;
  type: 'TASK' | 'TRANSACTION' | 'PRODUCT' | 'CONTACT' | 'USER';
  title: string;
  subtitle?: string;
  href: string;
};

export async function globalSearchAction(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return { success: true, data: [] };
    }

    const searchQuery = query.trim();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return { success: false as const, error: "Unauthorized" };
    }

    // Parallel fetch from multiple tables
    const [tasksRes, transactionsRes, productsRes, contactsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, title, status')
        .ilike('title', `%${searchQuery}%`)
        .limit(5),
      
      supabase
        .from('transactions')
        .select('id, concept, amount, type')
        .ilike('concept', `%${searchQuery}%`)
        .limit(5),
        
      supabase
        .from('products_or_services')
        .select('id, name, type')
        .ilike('name', `%${searchQuery}%`)
        .limit(5),
        
      supabase
        .from('contacts')
        .select('id, name, contact_type')
        .ilike('name', `%${searchQuery}%`)
        .limit(5),
    ]);

    const results: SearchResultItem[] = [];

    if (tasksRes.data) {
      tasksRes.data.forEach(t => results.push({
        id: t.id,
        type: 'TASK',
        title: t.title,
        subtitle: t.status,
        href: `/tasks` // Right now we might not have a specific view page for a task, so just link to tasks
      }));
    }

    if (transactionsRes.data) {
      transactionsRes.data.forEach(t => results.push({
        id: t.id,
        type: 'TRANSACTION',
        title: t.concept,
        subtitle: `${t.type === 'INCOME' ? '+' : '-'}${t.amount}`,
        href: `/transactions`
      }));
    }

    if (productsRes.data) {
      productsRes.data.forEach(t => results.push({
        id: t.id,
        type: 'PRODUCT',
        title: t.name,
        subtitle: t.type,
        href: `/inventory`
      }));
    }

    if (contactsRes.data) {
      contactsRes.data.forEach(t => results.push({
        id: t.id,
        type: 'CONTACT',
        title: t.name,
        subtitle: t.contact_type,
        href: `/contacts`
      }));
    }

    return { success: true as const, data: results };

  } catch (err: any) {
    console.error('Global search error:', err);
    return { success: false as const, error: err.message };
  }
}
