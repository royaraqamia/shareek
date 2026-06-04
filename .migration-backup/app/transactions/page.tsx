import { getTransactions } from '@/features/transactions/actions';
import { getContacts } from '@/features/contacts/actions';
import { getProducts } from '@/features/inventory/actions';
import { TransactionsClient } from './TransactionsClient';

export default async function TransactionsPage() {
  const [transactionsRes, contactsRes, productsRes] = await Promise.all([
    getTransactions(),
    getContacts(),
    getProducts()
  ]);

  const transactions = transactionsRes.success ? (transactionsRes as any).data : [];
  const contacts = contactsRes.success ? (contactsRes as any).data : [];
  const products = productsRes.success ? (productsRes as any).data : [];

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
      <TransactionsClient 
        initialTransactions={transactions} 
        contacts={contacts}
        products={products}
      />
    </div>
  );
}
