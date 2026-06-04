import { getContacts } from '@/features/contacts/actions';
import { ContactsClient } from './ContactsClient';

export default async function ContactsPage() {
  const result = await getContacts();
  const contacts = result.success ? (result as any).data : [];

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
      <ContactsClient initialContacts={contacts} />
    </div>
  );
}
