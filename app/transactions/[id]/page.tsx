import { getTransactionById } from "@/features/transactions/actions";
import { getOrganization } from "@/features/settings/actions";
import { TransactionDetailClient } from "./TransactionDetailClient";
import { notFound } from "next/navigation";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [txRes, orgRes] = await Promise.all([
    getTransactionById(id),
    getOrganization(),
  ]);

  const transaction = txRes.success ? (txRes as any).data : null;
  const organization = orgRes.success ? (orgRes as any).data : null;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl md:px-8">
      <TransactionDetailClient transaction={transaction} organization={organization} />
    </main>
  );
}
