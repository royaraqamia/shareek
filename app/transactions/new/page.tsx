import { getContacts } from "@/features/contacts/actions";
import { getProducts } from "@/features/inventory/actions";
import { NewTransactionClient } from "./NewTransactionClient";

export default async function NewTransactionPage() {
  const [contactsRes, productsRes] = await Promise.all([
    getContacts(),
    getProducts(),
  ]);

  const contacts = contactsRes.success ? (contactsRes as any).data : [];
  const products = productsRes.success ? (productsRes as any).data : [];

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl md:px-8">
      <NewTransactionClient contacts={contacts} products={products} />
    </main>
  );
}
