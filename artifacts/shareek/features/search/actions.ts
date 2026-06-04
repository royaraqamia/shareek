'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getApprovedUser } from '../auth/actions';

export type SearchResultItem = {
  id: string;
  type: 'TASK' | 'TRANSACTION' | 'PRODUCT' | 'CONTACT';
  title: string;
  subtitle?: string;
  href: string;
};

export async function globalSearchAction(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return { success: true as const, data: [] };
    }

    const user = await getApprovedUser();
    if (!user.success) return { success: false as const, error: "Unauthorized" };

    const searchQuery = query.trim();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [tasksRes, transactionsRes, productsRes, contactsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('id, title, status')
        .eq('organization_id', user.organizationId)
        .ilike('title', `%${searchQuery}%`)
        .limit(5),

      supabase
        .from('transactions')
        .select('id, reference_number, total_amount, type')
        .eq('organization_id', user.organizationId)
        .ilike('reference_number', `%${searchQuery}%`)
        .limit(5),

      supabase
        .from('products_or_services')
        .select('id, name, is_service')
        .eq('organization_id', user.organizationId)
        .ilike('name', `%${searchQuery}%`)
        .limit(5),

      supabase
        .from('contacts')
        .select('id, name, type')
        .eq('organization_id', user.organizationId)
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
        href: `/tasks`,
      }));
    }

    if (transactionsRes.data) {
      transactionsRes.data.forEach(t => results.push({
        id: t.id,
        type: 'TRANSACTION',
        title: t.reference_number,
        subtitle: `${t.type === 'SALE' ? 'مبيعات' : 'مشتريات'} — ${Number(t.total_amount ?? 0).toLocaleString('ar-SA')}`,
        href: `/transactions/${t.id}`,
      }));
    }

    if (productsRes.data) {
      productsRes.data.forEach(t => results.push({
        id: t.id,
        type: 'PRODUCT',
        title: t.name,
        subtitle: t.is_service ? 'خدمة' : 'منتج',
        href: `/inventory`,
      }));
    }

    if (contactsRes.data) {
      contactsRes.data.forEach(t => results.push({
        id: t.id,
        type: 'CONTACT',
        title: t.name,
        subtitle: t.type === 'CLIENT' ? 'عميل' : 'مورد',
        href: `/contacts`,
      }));
    }

    return { success: true as const, data: results };
  } catch (err: any) {
    console.error('Global search error:', err);
    return { success: false as const, error: err.message };
  }
}
