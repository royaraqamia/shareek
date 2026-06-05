'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DangerConfirmDialog } from '@/components/DangerConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { 
  Plus, Users, Loader2, WifiOff, Search, FileSpreadsheet, 
  Download, UploadCloud, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Check,
  Trash2, SlidersHorizontal
} from 'lucide-react';
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
import { createContact, bulkCreateContacts, bulkDeleteContactsAction, bulkUpdateContactsTypeAction } from '@/features/contacts/actions';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

// Helper function to robustly parse CSV including quotes and line endings
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip next LF
      }
      row.push(currentValue.trim());
      if (row.length > 0 && row.some(cell => cell !== "")) {
        result.push(row);
      }
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  if (currentValue || row.length > 0) {
    row.push(currentValue.trim());
    if (row.some(cell => cell !== "")) {
      result.push(row);
    }
  }

  return result;
}

export function ContactsClient({ initialContacts }: { initialContacts: any[] }) {
  const { contacts: offlineContacts, setContacts: setOfflineContacts, enqueueMutation } = useOfflineDataStore();
  const [contacts, setContacts] = useState(initialContacts);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CLIENT' | 'SUPPLIER'>('ALL');
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const res = await bulkDeleteContactsAction(selectedIds);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم الحذف بنجاح!' : 'Deleted successfully!');
        const updated = contacts.filter(c => !selectedIds.includes(c.id));
        setContacts(updated);
        setOfflineContacts(updated);
        setSelectedIds([]);
        setIsDeleteConfirmOpen(false);
      } else {
        toast.error(res.message || 'فشلت عملية الحذف');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkUpdateType = async (newType: 'CLIENT' | 'SUPPLIER') => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const res = await bulkUpdateContactsTypeAction(selectedIds, newType);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم التحديث بنجاح!' : 'Updated successfully!');
        const updated = contacts.map(c => selectedIds.includes(c.id) ? { ...c, type: newType } : c);
        setContacts(updated);
        setOfflineContacts(updated);
        setSelectedIds([]);
      } else {
        toast.error(res.message || 'فشلت عملية التحديث');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Sync server data to offline store on mount if online
  // Sync server data to offline store on mount if online
  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      if (isMounted) setIsOfflineMode(false);
      setOfflineContacts(initialContacts);
      if (isMounted) setContacts(initialContacts);
    } else {
      if (isMounted) setIsOfflineMode(true);
      const currentOfflineContacts = useOfflineDataStore.getState().contacts;
      if (isMounted) setContacts(currentOfflineContacts);
    }
    return () => { isMounted = false; };
  }, [initialContacts, setOfflineContacts]);

  // Create Contact Form States
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('draft-contact');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.type) setType(data.type);
        if (data.name) setName(data.name);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('draft-contact', JSON.stringify({ type, name, phone, email }));
  }, [type, name, phone, email]);

  // CSV Bulk Import Dialog & Wizard States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guided mapping fields mapping target field to CSV Column Name
  const [mapping, setMapping] = useState({
    name: '',
    type: '',
    phone: '',
    email: ''
  });
  const [defaultType, setDefaultType] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
  const [parsedContacts, setParsedContacts] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

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

  // Automatically guess mappings from headers
  const guessMapping = (headers: string[]) => {
    const newMapping = { name: '', type: '', phone: '', email: '' };
    headers.forEach((header) => {
      const h = header.toLowerCase().trim();
      
      if (h.includes('الاسم') || h.includes('اسم') || h.includes('name') || h.includes('full name') || h.includes('title')) {
        newMapping.name = header;
      }
      if (h.includes('النوع') || h.includes('نوع') || h.includes('type') || h.includes('classification') || h.includes('category')) {
        newMapping.type = header;
      }
      if (h.includes('هاتف') || h.includes('جوال') || h.includes('تلفون') || h.includes('phone') || h.includes('mobile') || h.includes('tel')) {
        newMapping.phone = header;
      }
      if (h.includes('بريد') || h.includes('ايميل') || h.includes('email') || h.includes('mail')) {
        newMapping.email = header;
      }
    });
    setMapping(newMapping);
  };

  // CSV template generation and download
  const downloadTemplate = () => {
    const csvContent = "\ufeffالاسم,النوع,الهاتف,البريد الإلكتروني\nشركة شريك للتجارة,عميل,966500000000,info@shareek.com\nمؤسسة الفهد للتوريد,مورد,966511111111,supplies@alfahed.com";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shareek_contacts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error(language === 'ar' ? 'نوع الملف غير مدعوم، يرجى رفع ملف بصيغة CSV' : 'Unsupported file type, please upload a CSV file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error(language === 'ar' ? 'الملف فارغ أو يحتوي على صف الرؤوس فقط.' : 'File is empty or contains only header row.');
        return;
      }

      const headers = rows[0].map(h => h.replace(/^\ufeff/, '').trim());
      setCsvRows(rows);
      setCsvHeaders(headers);
      guessMapping(headers);
      setImportStep(2);
      toast.success(language === 'ar' ? 'تم قراءة ملف الـ CSV بنجاح!' : 'CSV file read successfully!');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleProcessMapping = () => {
    if (!mapping.name) {
      toast.error(language === 'ar' ? 'يرجى مطابقة حقل الاسم على الأقل.' : 'Please map the Name field.');
      return;
    }

    const nameIdx = csvHeaders.indexOf(mapping.name);
    const typeIdx = mapping.type ? csvHeaders.indexOf(mapping.type) : -1;
    const phoneIdx = mapping.phone ? csvHeaders.indexOf(mapping.phone) : -1;
    const emailIdx = mapping.email ? csvHeaders.indexOf(mapping.email) : -1;

    const items: any[] = [];

    for (let r = 1; r < csvRows.length; r++) {
      const row = csvRows[r];
      if (row.length <= nameIdx) continue;

      const rawName = row[nameIdx] || '';
      if (!rawName.trim()) continue;

      const rawType = typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : '';
      let resolvedType: 'CLIENT' | 'SUPPLIER' = defaultType;

      const normType = rawType.trim().toLowerCase();
      if (
        normType.includes('مورد') || 
        normType.includes('supp') || 
        normType.includes('vendor') || 
        normType.includes('بائع') || 
        normType.includes('مزود')
      ) {
        resolvedType = 'SUPPLIER';
      } else if (
        normType.includes('عميل') || 
        normType.includes('client') || 
        normType.includes('cust') || 
        normType.includes('زبون') || 
        normType.includes('مشتري')
      ) {
        resolvedType = 'CLIENT';
      }

      const rawPhone = phoneIdx !== -1 ? row[phoneIdx] : '';
      const rawEmail = emailIdx !== -1 ? row[emailIdx] : '';

      items.push({
        name: rawName.trim(),
        type: resolvedType,
        phone: rawPhone ? rawPhone.trim() : undefined,
        email: rawEmail ? rawEmail.trim() : undefined
      });
    }

    if (items.length === 0) {
      toast.error(language === 'ar' ? 'لم يتم العثور على أي معلومات صالحة للاستيراد.' : 'No valid contacts found after mapping.');
      return;
    }

    setParsedContacts(items);
    setImportStep(3);
  };

  const handleCommitImport = async () => {
    setIsImporting(true);
    try {
      if (!navigator.onLine) {
        // Queue local mutations sequentially for offline imports
        for (const contact of parsedContacts) {
          enqueueMutation({
            type: 'CREATE_CONTACT',
            data: contact
          });
        }
        const tempImported = parsedContacts.map(c => ({
          id: crypto.randomUUID(),
          ...c,
          created_at: new Date().toISOString()
        }));
        const newContacts = [...tempImported, ...contacts];
        setOfflineContacts(newContacts);
        setContacts(newContacts);
        setIsImportOpen(false);
        setImportStep(1);
        toast.success(language === 'ar' 
          ? `تم رصد وعولمة ${parsedContacts.length} من جهات الاتصال محلياً!` 
          : `Queued ${parsedContacts.length} contacts locally (offline mode)!`
        );
        return;
      }

      // Online Flow
      const response = await bulkCreateContacts(parsedContacts);
      if (response.success && response.data) {
        toast.success(language === 'ar' 
          ? `تم استيراد ${response.data.length} من جهات الاتصال بنجاح!` 
          : `Successfully imported ${response.data.length} contacts!`
        );
        const newContacts = [...response.data, ...contacts];
        setContacts(newContacts);
        setOfflineContacts(newContacts);
        setIsImportOpen(false);
        setImportStep(1);
        setCsvRows([]);
        setCsvHeaders([]);
        setParsedContacts([]);
        router.refresh();
      } else {
        toast.error(response.message || 'حدث خطأ أثناء حفظ جهات الاتصال المستوردة');
      }
    } catch (err: any) {
      toast.error('فشلت عملية الاستيراد، يرجى المحاولة لاحقاً بمراجعة البيانات.');
    } finally {
      setIsImporting(false);
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
        localStorage.removeItem('draft-contact');
        setIsOpen(false);
        setName(''); setPhone(''); setEmail(''); setType('CLIENT');
        return;
      }

      const response = await createContact(contactData) as any;

      if (response.success && response.data) {
        toast.success('تم تسجيل جهة الاتصال بنجاح!');
        localStorage.removeItem('draft-contact');
        const newContacts = [response.data, ...contacts];
        setContacts(newContacts);
        setOfflineContacts(newContacts);
        setIsOpen(false);
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
    <div className="space-y-8 container max-w-[90rem] mx-auto px-4 md:px-8 py-8" dir="rtl">
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
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* CSV Bulk Import Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2 cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-slate-700 font-bold rounded-xl transition-all h-12 px-6 w-full sm:w-auto shadow-sm">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                {language === 'ar' ? 'استيراد جماعي (CSV)' : 'Bulk Import (CSV)'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl font-arabic">
              <DialogHeader className="text-right">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {language === 'ar' ? 'استيراد جماعي لجهات الاتصال' : 'Bulk Import Contacts'}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                      {language === 'ar' ? 'قم برفع ملف CSV لمطابقة جهات الاتصال بنظام شريك تلقائياً.' : 'Upload a CSV file to map contacts with Shareek system easily.'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Progress Stepper indicators */}
              <div className="flex items-center justify-between py-4 border-b border-slate-100 mb-4 text-xs font-bold text-slate-400">
                <div className={`flex items-center gap-1.5 ${importStep >= 1 ? 'text-emerald-600' : ''}`}>
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full border ${importStep >= 1 ? 'bg-emerald-55 border-emerald-580 font-black text-[10px] text-emerald-600' : 'border-slate-200'}`}>1</span>
                  {language === 'ar' ? 'رفع ملف CSV' : 'Upload CSV'}
                </div>
                <div className="h-0.5 flex-1 bg-slate-100 mx-3" />
                <div className={`flex items-center gap-1.5 ${importStep >= 2 ? 'text-emerald-600' : ''}`}>
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full border ${importStep >= 2 ? 'bg-emerald-55 border-emerald-580 font-black text-[10px] text-emerald-600' : 'border-slate-200'}`}>2</span>
                  {language === 'ar' ? 'مطابقة وتعيين الحقول' : 'Field Mapping'}
                </div>
                <div className="h-0.5 flex-1 bg-slate-100 mx-3" />
                <div className={`flex items-center gap-1.5 ${importStep >= 3 ? 'text-emerald-600' : ''}`}>
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full border ${importStep >= 3 ? 'bg-emerald-55 border-emerald-580 font-black text-[10px] text-emerald-600' : 'border-slate-200'}`}>3</span>
                  {language === 'ar' ? 'معاينة وتأكيد الحفظ' : 'Preview & Save'}
                </div>
              </div>

              {/* Step 1: Upload File */}
              {importStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-slate-800">{language === 'ar' ? 'قالب الاستيراد الجاهز' : 'Ready-to-use template'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{language === 'ar' ? 'قم بتحميل قالب ملف الـ CSV المجهز لضمان مطابقة سليمة للحقول.' : 'Download formatted template for exact matches.'}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={downloadTemplate}
                      className="cursor-pointer gap-2 h-10 px-4 rounded-xl font-bold border-slate-200 text-slate-700 bg-white shadow-sm"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      {language === 'ar' ? 'تحميل كملف نموذج' : 'Download Sample Template'}
                    </Button>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                      dragActive 
                        ? "border-emerald-500 bg-emerald-50/20 scale-[0.99] shadow-inner" 
                        : "border-slate-200 bg-slate-50/20 hover:border-slate-350 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files) handleFile(e.target.files[0]);
                      }}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4 transition-transform hover:scale-110">
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 leading-normal">
                      {language === 'ar' ? 'اسحب وأفلت الملف هنا أو انقر للتصفح' : 'Drag & Drop CSV file here, or click to browse'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">
                      {language === 'ar' ? 'يرجى رفع ملفات بصيغة .csv فقط (تشفير UTF-8)' : 'Please upload files only in .csv format (UTF-8)'}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Field Mapping */}
              {importStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-amber-50 border border-amber-200/50 text-amber-800 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed text-right flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{language === 'ar' ? 'مطابقة الحقول من داخل ملفك الـ CSV' : 'Map fields from your CSV file'}</p>
                      <p className="text-amber-700/95 mt-1">
                        {language === 'ar' 
                          ? 'لقد قمنا بتخمين الحقول تلقائياً. تأكد من مطابقة اسم عمود الملف الخاص بك مع الحقول المطلوبة للنظام.' 
                          : 'We guessed bindings automatically. Ensure columns in your file match the systems required fields.'}
                      </p>
                    </div>
                  </div>

                  {/* Mapping Fields Forms */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name mapping */}
                      <div className="space-y-2 text-right">
                        <Label className="text-right block font-bold text-slate-705">
                          {language === 'ar' ? 'حقل الاسم' : 'Name Field'} <span className="text-red-500 font-black">*</span>
                        </Label>
                        <select
                          value={mapping.name}
                          onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                          className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none transition-all font-semibold"
                        >
                          <option value="">-- {language === 'ar' ? 'اختر العمود المناسب' : 'Select Column'} --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>

                      {/* Default Fallback Classification Type */}
                      <div className="space-y-2 text-right">
                        <Label className="text-right block font-bold text-slate-705">
                          {language === 'ar' ? 'نوع التصنيف الافتراضي' : 'Default classification type'}
                        </Label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl h-11 items-center">
                          <button
                            type="button"
                            className={`h-9 rounded-lg font-bold text-xs cursor-pointer ${defaultType === 'CLIENT' ? 'bg-primary text-white shadow-sm' : 'text-slate-600'}`}
                            onClick={() => setDefaultType('CLIENT')}
                          >
                            {language === 'ar' ? 'عملاء' : 'Clients'}
                          </button>
                          <button
                            type="button"
                            className={`h-9 rounded-lg font-bold text-xs cursor-pointer ${defaultType === 'SUPPLIER' ? 'bg-primary text-white shadow-sm' : 'text-slate-600'}`}
                            onClick={() => setDefaultType('SUPPLIER')}
                          >
                            {language === 'ar' ? 'موردين' : 'Suppliers'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Classification Type field mapping */}
                      <div className="space-y-2 text-right">
                        <Label className="text-right block font-bold text-slate-705">
                          {language === 'ar' ? 'حقل نوع التصنيف (اختياري)' : 'Classification Type Field (Optional)'}
                        </Label>
                        <select
                          value={mapping.type}
                          onChange={(e) => setMapping({ ...mapping, type: e.target.value })}
                          className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none transition-all font-semibold"
                        >
                          <option value="">-- {language === 'ar' ? 'تجاهل / غير موجود بملفي' : 'Ignore / Not in file'} --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-400 font-medium">({language === 'ar' ? 'لو غير موجود سيتم اعتماد النوع الافتراضي' : 'If ignored, default type will apply'})</p>
                      </div>

                      {/* Phone mapping */}
                      <div className="space-y-2 text-right">
                        <Label className="text-right block font-bold text-slate-705">
                          {language === 'ar' ? 'حقل رقم الهاتف (اختياري)' : 'Phone Number Field (Optional)'}
                        </Label>
                        <select
                          value={mapping.phone}
                          onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                          className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none transition-all font-semibold"
                        >
                          <option value="">-- {language === 'ar' ? 'تجاهل / غير موجود بملفي' : 'Ignore / Not in file'} --</option>
                          {csvHeaders.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Email mapping */}
                    <div className="space-y-2 text-right">
                      <Label className="text-right block font-bold text-slate-705">
                        {language === 'ar' ? 'حقل البريد الإلكتروني (اختياري)' : 'Email Field (Optional)'}
                      </Label>
                      <select
                        value={mapping.email}
                        onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                        className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm focus:bg-white focus:outline-none transition-all font-semibold"
                      >
                        <option value="">-- {language === 'ar' ? 'تجاهل / غير موجود بملفي' : 'Ignore / Not in file'} --</option>
                        {csvHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setImportStep(1)}
                      className="cursor-pointer gap-1.5 h-10 px-4 rounded-xl font-bold font-arabic"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {language === 'ar' ? 'الرجوع ومسح الملف' : 'Back & clear file'}
                    </Button>

                    <Button 
                      type="button" 
                      onClick={handleProcessMapping}
                      disabled={!mapping.name}
                      className="cursor-pointer gap-1.5 h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 shadow-md"
                    >
                      {language === 'ar' ? 'متابعة المعاينة والتحقق' : 'Proceed to Preview'}
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Preview and Commit */}
              {importStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-emerald-50/50 border border-emerald-100/70 p-4 rounded-2xl flex items-center justify-between text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-650 flex items-center justify-center font-black text-lg">
                        {parsedContacts.length}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{language === 'ar' ? 'جاهز للاستيراد الجماعي' : 'Ready to bulk import'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === 'ar' 
                            ? 'تمت مراجعة وصياغة جهات الاتصال بنجاح لتطابق قاعدة البيانات.' 
                            : 'Successfully parsed and validated contacts to sync with database.'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full">{language === 'ar' ? 'مستند سليم' : 'Valid Document'}</span>
                  </div>

                  {/* Preview list */}
                  <div className="border border-border/60 rounded-2xl overflow-hidden max-h-56 overflow-y-auto bg-secondary/30">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader className="bg-secondary sticky top-0 border-b border-border shadow-sm z-10">
                          <TableRow>
                            <TableHead className="text-right font-bold text-xs text-muted-foreground h-10 px-4">{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                            <TableHead className="text-right font-bold text-xs text-muted-foreground px-4">{language === 'ar' ? 'النوع ومجموعة التصنيف' : 'Type'}</TableHead>
                            <TableHead className="text-right font-bold text-xs text-muted-foreground px-4">{language === 'ar' ? 'الجوال' : 'Phone'}</TableHead>
                            <TableHead className="text-right font-bold text-xs text-muted-foreground px-4">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedContacts.slice(0, 10).map((c, idx) => (
                            <TableRow key={idx} className="border-b border-border/60 h-12 hover:bg-secondary/50">
                              <TableCell className="font-bold text-foreground text-right px-4 text-xs">{c.name}</TableCell>
                              <TableCell className="text-right px-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  c.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                  {c.type === 'CLIENT' ? (language === 'ar' ? 'عميل' : 'Client') : (language === 'ar' ? 'مورد' : 'Supplier')}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-right font-mono px-4 text-xs">{c.phone || '-'}</TableCell>
                              <TableCell className="text-muted-foreground text-right font-mono px-4 text-xs">{c.email || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile cards view */}
                    <div className="block md:hidden p-3 space-y-2">
                      {parsedContacts.slice(0, 10).map((c, idx) => (
                        <div key={idx} className="bg-card border border-border/60 p-3 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground text-sm">{c.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              c.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                            }`}>
                              {c.type === 'CLIENT' ? (language === 'ar' ? 'عميل' : 'Client') : (language === 'ar' ? 'مورد' : 'Supplier')}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground font-mono">
                            <span>{c.phone || '-'}</span>
                            <span>{c.email || '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {parsedContacts.length > 10 && (
                      <div className="py-2 px-4 text-center text-[11px] text-muted-foreground font-bold border-t border-border bg-card">
                        {language === 'ar' 
                          ? `و ${parsedContacts.length - 10} جهات اتصال أخرى لم تظهر في المعاينة...` 
                          : `and ${parsedContacts.length - 10} more contacts not shown in preview...`}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setImportStep(2)}
                      className="cursor-pointer gap-1.5 h-10 px-4 rounded-xl font-bold font-arabic"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {language === 'ar' ? 'الرجوع للمطابقة' : 'Back to Mapping'}
                    </Button>

                    <Button 
                      type="button" 
                      onClick={handleCommitImport}
                      disabled={isImporting}
                      className="cursor-pointer gap-1.5 h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all text-sm"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1 text-white" />
                          {language === 'ar' ? 'جاري الاستيراد والتسجيل...' : 'Importing...'}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-white stroke-[2.5]" />
                          {language === 'ar' ? 'تأكيد واستيراد الكل الآن' : 'Confirm & Import All'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Contact Button */}
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

      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {language === 'ar' ? `تم تحديد ${selectedIds.length} عنصر:` : `Selected ${selectedIds.length} items:`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            {/* Update type to Client */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdateType('CLIENT')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {language === 'ar' ? 'تعيين كعميل' : 'Set as Client'}
            </Button>

            {/* Update type to Supplier */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdateType('SUPPLIER')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {language === 'ar' ? 'تعيين كمورد' : 'Set as Supplier'}
            </Button>

            {/* Delete button */}
            <Button 
              size="sm" 
              variant="destructive" 
              disabled={isBulkDeleting}
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="gap-1.5 h-9 rounded-lg font-bold text-xs hover:bg-rose-600/90 cursor-pointer"
            >
              {isBulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      )}

      <DangerConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.length}
        isLoading={isBulkDeleting}
        language={language}
      />

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl flex-1 overflow-hidden shadow-sm">
        {contacts.length === 0 ? (
          <EmptyState 
            icon={Users}
            title={t.emptyTitle[language]}
            description={t.emptyDesc[language]}
            buttonText={t.addContact[language]}
            buttonIcon={Plus}
            onAction={() => setIsOpen(true)}
          />
        ) : filteredContacts.length === 0 ? (
          <EmptyState 
            icon={Search}
            title={language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
            description={language === 'ar' ? 'جرب البحث بكلمات أخرى أو إعادة تهيئة عوامل التصفية.' : 'Try searching with other keywords or reset your filters.'}
            buttonText={language === 'ar' ? 'إعادة ضبط عوامل التصفية' : 'Reset Filters'}
            onAction={() => { setSearchQuery(''); setFilterType('ALL'); }}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="border-b border-border">
                    <TableHead className="w-[50px] px-4 text-center font-bold text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={filteredContacts.length > 0 && selectedIds.length === filteredContacts.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredContacts.map(c => c.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-input"
                      />
                    </TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground h-12 px-6">{t.headers.name[language]}</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground px-6">{t.headers.type[language]}</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground px-6">{t.headers.phone[language]}</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground px-6">{t.headers.email[language]}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-b border-border hover:bg-secondary/30 transition-colors group h-16">
                      <TableCell className="w-[50px] px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, contact.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== contact.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-input"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-right px-6 text-[15px]">{contact.name}</TableCell>
                      <TableCell className="text-right px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold border ${
                          contact.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/20' : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ml-1.5 ${contact.type === 'CLIENT' ? 'bg-emerald-500' : 'bg-primary'}`} />
                          {t.types[contact.type as 'CLIENT' | 'SUPPLIER'][language]}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium text-right font-mono px-6 text-[15px]">{contact.phone || '-'}</TableCell>
                      <TableCell className="text-muted-foreground font-medium text-right font-mono px-6 text-[15px]">{contact.email || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="block md:hidden space-y-3 p-4">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, contact.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== contact.id));
                        }}
                        className="w-4 h-4 rounded border-input mt-1"
                      />
                      <div>
                        <div className="font-bold text-foreground text-[15px]">{contact.name}</div>
                        <div className="text-sm text-muted-foreground font-mono mt-0.5">{contact.phone || '-'}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      contact.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {t.types[contact.type as 'CLIENT' | 'SUPPLIER'][language]}
                    </span>
                  </div>
                  {contact.email && (
                     <div className="flex justify-start text-xs text-muted-foreground border-t border-border pt-3 mt-1 font-mono">
                       {contact.email}
                     </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
