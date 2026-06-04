'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Users, Loader2, WifiOff, Search } from 'lucide-react';
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
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export function ContactsClient({ initialContacts }: { initialContacts: any[] }) {
  const { contacts: offlineContacts, setContacts: setOfflineContacts, enqueueMutation } = useOfflineDataStore();
  const [contacts, setContacts] = useState(initialContacts);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CLIENT' | 'SUPPLIER'>('ALL');
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

  // Sync server data to offline store on mount if online
  useEffect(() => {
    if (navigator.onLine) {
      setIsOfflineMode(false);
      setOfflineContacts(initialContacts);
      setContacts(initialContacts);
    } else {
      setIsOfflineMode(true);
      setContacts(offlineContacts);
    }
  }, [initialContacts, navigator.onLine, setOfflineContacts]);

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

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (contact.phone && contact.phone.includes(searchQuery)) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'CLIENT') return matchesSearch && contact.type === 'CLIENT';
    if (filterType === 'SUPPLIER') return matchesSearch && contact.type === 'SUPPLIER';
    return matchesSearch;
  });

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('يرجى إدخال الاسم');
      return;
    }

    setIsSubmitting(true);
    try {
      const contactData = { type, name, phone: phone || undefined, email: email || undefined };
      
      if (!navigator.onLine) {
        // Offline Flow
        enqueueMutation({
          type: 'CREATE_CONTACT',
          data: contactData
        });
        
        const tempContact = {
          id: crypto.randomUUID(),
          ...contactData,
          created_at: new Date().toISOString()
        };
        
        const newContacts = [tempContact, ...contacts];
        setOfflineContacts(newContacts);
        setContacts(newContacts);
        
        toast.success("تم تسجيل جهة الاتصال محلياً (وضع عدم الاتصال)");
        setIsOpen(false);
        setName(''); setPhone(''); setEmail(''); setType('CLIENT');
        return;
      }

      // Online Flow
      const response = await createContact(contactData) as any;

      if (response.success && response.data) {
        toast.success('تم تسجيل جهة الاتصال بنجاح!');
        const newContacts = [response.data, ...contacts];
        setContacts(newContacts);
        setOfflineContacts(newContacts);
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
    <div className="space-y-8 container max-w-[90rem] mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/10">
              <Users className="w-7 h-7" />
            </div>
            {t.title[language]}
            {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            {t.subtitle[language]}
            {isOfflineMode && <span className="text-amber-500 font-bold mr-2 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 text-xs">(وضع عدم الاتصال)</span>}
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 cursor-pointer bg-primary shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 text-white font-bold rounded-xl transition-all h-12 px-6 w-full sm:w-auto">
              <Plus className="w-5 h-5 text-white" />
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

      {/* Elegant Search & Filter Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث باسم العميل، الهاتف، أو البريد الإلكتروني...' : 'Search by name, phone, or email...'}
            className="pr-10 pl-4 h-11 text-right bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-end">
          <Button
            variant={filterType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterType('ALL')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'الكل' : 'All'} ({contacts.length})
          </Button>
          <Button
            variant={filterType === 'CLIENT' ? 'default' : 'outline'}
            onClick={() => setFilterType('CLIENT')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'العملاء' : 'Clients'} ({contacts.filter(c => c.type === 'CLIENT').length})
          </Button>
          <Button
            variant={filterType === 'SUPPLIER' ? 'default' : 'outline'}
            onClick={() => setFilterType('SUPPLIER')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'الموردين' : 'Suppliers'} ({contacts.filter(c => c.type === 'SUPPLIER').length})
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl flex-1 overflow-hidden shadow-sm">
        {contacts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-400">
              <Users className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t.emptyTitle[language]}</h3>
              <p className="text-base text-slate-500 font-medium max-w-sm">{t.emptyDesc[language]}</p>
            </div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-400">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-800">
                {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
              </h3>
              <p className="text-base text-slate-500 font-medium max-w-sm">
                {language === 'ar' ? 'جرب البحث بكلمات أخرى أو إعادة تهيئة عوامل التصفية.' : 'Try searching with other keywords or reset your filters.'}
              </p>
            </div>
            <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-4" onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}>
              {language === 'ar' ? 'إعادة ضبط عوامل التصفية' : 'Reset Filters'}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-200">
                <TableHead className="text-right font-bold text-slate-600 h-12 px-6">{t.headers.name[language]}</TableHead>
                <TableHead className="text-right font-bold text-slate-600 px-6">{t.headers.type[language]}</TableHead>
                <TableHead className="text-right font-bold text-slate-600 px-6">{t.headers.phone[language]}</TableHead>
                <TableHead className="text-right font-bold text-slate-600 px-6">{t.headers.email[language]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group h-16">
                  <TableCell className="font-bold text-slate-900 text-right px-6 text-[15px]">{contact.name}</TableCell>
                  <TableCell className="text-right px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold border ${
                      contact.type === 'CLIENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-blue-50 text-blue-700 border-blue-200/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ml-1.5 ${contact.type === 'CLIENT' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      {t.types[contact.type as 'CLIENT' | 'SUPPLIER'][language]}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium text-right font-mono px-6 text-[15px]">{contact.phone || '-'}</TableCell>
                  <TableCell className="text-slate-600 font-medium text-right font-mono px-6 text-[15px]">{contact.email || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
