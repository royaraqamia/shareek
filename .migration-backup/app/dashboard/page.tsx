import { getProducts } from '@/features/inventory/actions';
import { getTransactions } from '@/features/transactions/actions';
import { getContacts } from '@/features/contacts/actions';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const [productsRes, transactionsRes, contactsRes] = await Promise.all([
    getProducts(),
    getTransactions(),
    getContacts()
  ]);

  const pData = productsRes.success ? (productsRes as any).data : [];
  const tData = transactionsRes.success ? (transactionsRes as any).data : [];
  const cData = contactsRes.success ? (contactsRes as any).data : [];

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
      <DashboardClient 
        initialProducts={pData}
        initialTransactions={tData}
        initialContacts={cData}
      />
    </div>
  );
}
