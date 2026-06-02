'use client';

import { useState } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Users, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContact } from '@/features/contacts/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ContactsClient({ initialContacts }: { initialContacts: any[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

  // Create Contact Form States
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

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

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('يرجى إدخال الاسم');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createContact({
        type,
        name,
        phone: phone || undefined,
        email: email || undefined,
      }) as any;

      if (response.success && response.data) {
        toast.success('تم تسجيل جهة الاتصال بنجاح!');
        setContacts(prev => [response.data, ...prev]);
        setIsOpen(false);
        // Clear fields
        setName('');
        setPhone('');
        setEmail('');
        setType('CLIENT');
        router.refresh();
      } else {
        toast.error(response.message || 'حدث خطأ أثناء رصد جهة الاتصال الجديدة');
      }
    } catch (err: any) {
      toast.error('فشلت العملية، يرجى التحقق من المدخلات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{t.title[language]}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle[language]}</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="w-4 h-4 text-white" />
              {t.addContact[language]}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة جهة اتصال جديدة</DialogTitle>
              <DialogDescription className="text-right">
                تسجيل عميل أو مورد جديد في النظام لإصدار الفواتير له.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateContact} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-right block">نوع جهة الاتصال</Label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                  <Button
                    type="button"
                    variant={type === 'CLIENT' ? 'default' : 'ghost'}
                    className={`font-semibold cursor-pointer text-xs py-1.5 ${type === 'CLIENT' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}
                    onClick={() => setType('CLIENT')}
                  >
                    عميل (مشتري)
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'SUPPLIER' ? 'default' : 'ghost'}
                    className={`font-semibold cursor-pointer text-xs py-1.5 ${type === 'SUPPLIER' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
                    onClick={() => setType('SUPPLIER')}
                  >
                    مورد (بائع ومزود)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-right block">اسم الجهة / العميل / المورد <span className="text-red-500">*</span></Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شركة الحلول المتقدمة المحدودة"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-right block">رقم الهاتف / الجوال</Label>
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9665xxxxxxxx+"
                  className="text-right font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-right block">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="text-right font-mono"
                />
              </div>

              <DialogFooter className="flex sm:justify-start pt-4 gap-2">
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer px-6">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      جاري الحفظ...
                    </>
                  ) : 'حفظ وإضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                <TableHead className="text-right">{t.headers.name[language]}</TableHead>
                <TableHead className="text-right">{t.headers.type[language]}</TableHead>
                <TableHead className="text-right">{t.headers.phone[language]}</TableHead>
                <TableHead className="text-right">{t.headers.email[language]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-semibold text-slate-900 text-right">{contact.name}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      contact.type === 'CLIENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {t.types[contact.type as 'CLIENT' | 'SUPPLIER'][language]}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-right font-mono">{contact.phone || '-'}</TableCell>
                  <TableCell className="text-slate-500 text-right font-mono">{contact.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
