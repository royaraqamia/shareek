'use client';

import { useState } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Users, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function ContactsClient({ initialContacts }: { initialContacts: any[] }) {
  const [contacts] = useState(initialContacts);
  const language = useAppStore(state => state.language) as Language;

  const t = {
    title: { ar: 'جهات الاتصال', en: 'Contacts' },
    subtitle: { ar: 'عرض وتحديث جهات الاتصال الخاصة بالعملاء والموردين.', en: 'View and update contacts for customers and suppliers.' },
    addContact: { ar: 'إضافة جهة اتصال', en: 'Add Contact' },
    emptyTitle: { ar: 'لا توجد جهات اتصال', en: 'No contacts found' },
    emptyDesc: { ar: 'قم بإضافة عميل أو مورد للبدء.', en: 'Add a client or supplier to get started.' },
    headers: {
      name: { ar: 'الاسم', en: 'Name' },
      type: { ar: 'النوع', en: 'Type' },
      phone: { ar: 'الهاتف', en: 'Phone' },
      email: { ar: 'البريد الإلكتروني', en: 'Email' }
    },
    types: {
      CLIENT: { ar: 'عميل', en: 'Client' },
      SUPPLIER: { ar: 'مورد', en: 'Supplier' }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{t.title[language]}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle[language]}</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t.addContact[language]}
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        {contacts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800">{t.emptyTitle[language]}</h3>
              <p className="text-sm text-slate-400">{t.emptyDesc[language]}</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.headers.name[language]}</TableHead>
                <TableHead>{t.headers.type[language]}</TableHead>
                <TableHead>{t.headers.phone[language]}</TableHead>
                <TableHead>{t.headers.email[language]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-semibold text-slate-900">{contact.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      contact.type === 'CLIENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {t.types[contact.type as 'CLIENT' | 'SUPPLIER'][language]}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{contact.phone || '-'}</TableCell>
                  <TableCell className="text-slate-500">{contact.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
