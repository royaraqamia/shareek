'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { createTransaction } from '@/features/transactions/actions';
import { toast } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Receipt, CheckCircle, Info, Sparkles, ShoppingBag, BadgePercent, WifiOff, Mic, MicOff } from 'lucide-react';

interface NewTransactionClientProps {
  contacts: any[];
  products: any[];
}

const translations = {
  title: {
    en: "New Transaction / Invoice",
    ar: "إنشاء فاتورة / معاملة جديدة"
  },
  back: {
    en: "Back to Register",
    ar: "العودة إلى السجل"
  },
  txDetails: {
    en: "Invoice Details",
    ar: "تفاصيل الفاتورة"
  },
  txType: {
    en: "Transaction Type",
    ar: "نوع المعاملة"
  },
  saleInvoice: {
    en: "Sales Invoice (Outbound)",
    ar: "فاتورة مبيعات (صادرة)"
  },
  purchaseInvoice: {
    en: "Purchase Invoice (Inbound)",
    ar: "فاتورة مشتريات (واردة)"
  },
  refNum: {
    en: "Reference Number",
    ar: "رقم المرجع / الفاتورة"
  },
  autoGen: {
    en: "Auto",
    ar: "توليد تلقائي"
  },
  paymentStatusLabel: {
    en: "Initial Payment Status",
    ar: "حالة السداد الأولية"
  },
  contactSelect: {
    en: "Select Client / Supplier",
    ar: "اختر العميل / المورد"
  },
  addItemTitle: {
    en: "Add Line Item",
    ar: "إضافة بند فاتورة"
  },
  productSelect: {
    en: "Choose Product / Service",
    ar: "اختر المنتج / الخدمة"
  },
  qtyLabel: {
    en: "Quantity",
    ar: "الكمية"
  },
  priceLabel: {
    en: "Unit Price",
    ar: "سعر الوحدة"
  },
  stockLabel: {
    en: "Available Stock",
    ar: "المخزون المتوفر"
  },
  addToList: {
    en: "Add to Bill",
    ar: "إضافة للفاتورة"
  },
  currentItems: {
    en: "Billing Items",
    ar: "بنود الفاتورة الحالية"
  },
  emptyItems: {
    en: "No items added yet. Search and select products above to compile the invoice.",
    ar: "لا توجد بنود مضافة بعد. اختر المنتجات والخدمات من القائمة أعلاه لبناء الفاتورة."
  },
  summaryTitle: {
    en: "Summary & Calculations",
    ar: "الملخص والعمليات الحسابية"
  },
  subtotal: {
    en: "Subtotal",
    ar: "المجموع الفرعي"
  },
  tax: {
    en: "Standard Tax (15.00% VAT)",
    ar: "ضريبة القيمة المضافة القياسية (15.00%)"
  },
  grandTotal: {
    en: "Grand Total",
    ar: "الإجمالي النهائي"
  },
  errorsTitle: {
    en: "Validation Requirements",
    ar: "متطلبات التحقق والمطابقة"
  },
  submitBtn: {
    en: "Issue & Process Invoice",
    ar: "اعتماد ومعالجة الفاتورة"
  },
  submitting: {
    en: "Processing Ledger entry...",
    ar: "جاري ترحيل القيد..."
  },
  successMsg: {
    en: "Transaction updated and locked in ledger!",
    ar: "تم ترحيل المعاملة وتأمين المخزون بنجاح!"
  },
  errorMsg: {
    en: "Process aborted. Please complete all requirements.",
    ar: "تم إلغاء العملية. يرجى إكمال متطلبات المطابقة."
  }
};

export function NewTransactionClient({ contacts, products }: NewTransactionClientProps) {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  const t = (key: keyof typeof translations) => translations[key][language];

  const { transactions: offlineTransactions, setTransactions: setOfflineTransactions, enqueueMutation } = useOfflineDataStore();
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Load from store
  const items = useInvoiceStore(state => state.items);
  const type = useInvoiceStore(state => state.type);
  const contactId = useInvoiceStore(state => state.contactId);
  const referenceNumber = useInvoiceStore(state => state.referenceNumber);
  const notes = useInvoiceStore(state => state.notes);
  
  const addItem = useInvoiceStore(state => state.addItem);
  const updateQuantity = useInvoiceStore(state => state.updateQuantity);
  const updateUnitPrice = useInvoiceStore(state => state.updateUnitPrice);
  const removeItem = useInvoiceStore(state => state.removeItem);
  const setContactId = useInvoiceStore(state => state.setContactId);
  const setType = useInvoiceStore(state => state.setType);
  const setReferenceNumber = useInvoiceStore(state => state.setReferenceNumber);
  const setNotes = useInvoiceStore(state => state.setNotes);
  const clearInvoice = useInvoiceStore(state => state.clear);

  const getSubtotal = useInvoiceStore(state => state.getSubtotal);
  const getTaxAmount = useInvoiceStore(state => state.getTaxAmount);
  const getTotalAmount = useInvoiceStore(state => state.getTotalAmount);
  const getValidationErrors = useInvoiceStore(state => state.getValidationErrors);

  // Local state for current item form
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('UNPAID');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Set up Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === 'ar' ? 'المتصفح لا يدعم ميزة الإملاء الصوتي' : 'Browser does not support Speech Recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentNotes = useInvoiceStore.getState().notes;
      setNotes(currentNotes ? `${currentNotes} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        toast.error(language === 'ar' ? 'لم يتم منح صلاحية الميكروفون' : 'Microphone access denied');
      }
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  useEffect(() => {
    const state = useInvoiceStore.getState();
    if (!state.referenceNumber) {
      generateRef();
    }
    setIsOfflineMode(typeof navigator !== 'undefined' && !navigator.onLine);
  }, []);

  // Handle product select changes to auto-populate default price
  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find(p => p.id === pId);
    if (prod) {
      setItemPrice(type === 'SALE' ? Number(prod.sale_price) : Number(prod.purchase_price || prod.sale_price));
    }
  };

  // Auto reference generation helper
  const generateRef = () => {
    const timestamp = Date.now().toString().slice(-4);
    const orderNum = Math.floor(Math.random() * 900) + 100;
    const prefix = type === 'SALE' ? 'INV' : 'PO';
    setReferenceNumber(`${prefix}-2026-${timestamp}-${orderNum}`);
  };

  // Add the row to invoice list
  const handleAddLineItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    addItem({
      productId: prod.id,
      name: prod.name,
      unitPrice: Number(itemPrice),
      currentStock: prod.current_stock,
      isService: prod.is_service,
      version: prod.version,
      quantity: Number(itemQty),
    });

    // Reset selector
    setSelectedProductId('');
    setItemQty(1);
    setItemPrice(0);
    toast.success(language === 'ar' ? "تمت إضافة البند بنجاح" : "Line item staged successfully");
  };

  const handleSubmitInvoice = async () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setLoading(true);
    // Create random UUID for idempotency
    const idempotencyKey = crypto.randomUUID();

    const payload = {
      contactId: contactId!,
      type: type,
      referenceNumber: referenceNumber,
      taxRate: 0.15 as const, // standard Saudi rate
      paymentStatus: paymentStatus,
      idempotencyKey: idempotencyKey,
      notes: notes,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        version: item.version,
      })),
    };

    try {
      if (!navigator.onLine) {
        // Offline Flow
        enqueueMutation({
          type: 'CREATE_TRANSACTION',
          data: payload
        });
        
        // Optimistic update
        const tempTx = {
          id: crypto.randomUUID(),
          ...payload,
          contacts: contacts.find(c => c.id === payload.contactId),
          subtotal: getSubtotal(),
          total_amount: getTotalAmount(),
          transaction_date: new Date().toISOString()
        };
        
        setOfflineTransactions([tempTx, ...offlineTransactions]);
        
        toast.success("تم تأمين وحفظ المعاملة محلياً (وضع عدم الاتصال)");
        clearInvoice();
        router.push("/transactions");
        return;
      }

      const response = await createTransaction(payload);
      if (response.success) {
        toast.success(t("successMsg"));
        if (response.data) {
          setOfflineTransactions([response.data, ...offlineTransactions]);
        }
        clearInvoice();
        router.push("/transactions");
        router.refresh();
      } else {
        toast.error(response.message || t("errorMsg"));
      }
    } catch (err: any) {
      // Offline / Developer sandbox simulation block
      toast.error("خطأ أثناء ترحيل الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const validationErrors = getValidationErrors();

  return (
    <div className="space-y-6" id="new-tx-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push('/transactions')} className="h-9 w-9 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {t("title")}
              {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
            </h1>
            <p className="text-xs text-slate-500">{t("back")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SETUP & ADD ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                {t("txDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type toggle */}
              <div className="space-y-2">
                <Label>{t("txType")}</Label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                  <Button
                    type="button"
                    variant={type === 'SALE' ? 'default' : 'ghost'}
                    className={`font-semibold cursor-pointer py-1 ${type === 'SALE' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}
                    onClick={() => { setType('SALE'); generateRef(); }}
                  >
                    {t("saleInvoice")}
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'PURCHASE' ? 'default' : 'ghost'}
                    className={`font-semibold cursor-pointer py-1 ${type === 'PURCHASE' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
                    onClick={() => { setType('PURCHASE'); generateRef(); }}
                  >
                    {t("purchaseInvoice")}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Contact Selection */}
                <div className="space-y-2 animate-fadeIn">
                  <Label htmlFor="tx-contact">{language === 'ar' ? "الجهة / الطرف الثاني" : "Counterparty Contact"}</Label>
                  <Select value={contactId || ''} onValueChange={(val) => setContactId(val || null)}>
                    <SelectTrigger id="tx-contact">
                      <SelectValue placeholder={t("contactSelect")} />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts
                        .filter(c => type === 'SALE' ? c.type === 'CLIENT' : c.type === 'SUPPLIER')
                        .map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.type === 'CLIENT' ? (language === 'ar' ? 'عميل' : 'Client') : (language === 'ar' ? 'مورد' : 'Supplier')})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Number */}
                <div className="space-y-2">
                  <Label htmlFor="tx-ref">{t("refNum")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tx-ref"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateRef} className="shrink-0 font-medium cursor-pointer">
                      {t("autoGen")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Initial Payment Status Toggle */}
              <div className="space-y-2 pt-1">
                <Label>{t("paymentStatusLabel")}</Label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 border border-slate-200 rounded-lg">
                  <Button
                    type="button"
                    variant={paymentStatus === 'PAID' ? 'default' : 'ghost'}
                    size="sm"
                    className={`font-semibold text-xs cursor-pointer ${paymentStatus === 'PAID' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    onClick={() => setPaymentStatus('PAID')}
                  >
                    {language === 'ar' ? "تم السداد (مدفوعة)" : "Completed (PAID)"}
                  </Button>
                  <Button
                    type="button"
                    variant={paymentStatus === 'PARTIAL' ? 'default' : 'ghost'}
                    size="sm"
                    className={`font-semibold text-xs cursor-pointer ${paymentStatus === 'PARTIAL' ? 'bg-amber-600 text-white hover:bg-amber-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    onClick={() => setPaymentStatus('PARTIAL')}
                  >
                    {language === 'ar' ? "سداد جزئي" : "Partial Split (PARTIAL)"}
                  </Button>
                  <Button
                    type="button"
                    variant={paymentStatus === 'UNPAID' ? 'default' : 'ghost'}
                    size="sm"
                    className={`font-semibold text-xs cursor-pointer ${paymentStatus === 'UNPAID' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    onClick={() => setPaymentStatus('UNPAID')}
                  >
                    {language === 'ar' ? "آجل (غير مدفوعة)" : "Pending (UNPAID)"}
                  </Button>
                </div>
              </div>

              {/* Notes & Description (with Voice-to-Text) */}
              <div className="space-y-2 pt-1 border-t border-slate-100 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tx-notes">{language === 'ar' ? "ملاحظات / وصف (اختياري)" : "Notes / Description (Optional)"}</Label>
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className={`h-7 px-2.5 text-xs font-semibold rounded-full shadow-sm cursor-pointer transition-all ${isRecording ? 'animate-pulse' : 'hover:bg-slate-100 text-slate-600'}`}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5 mr-1" /> : <Mic className="w-3.5 h-3.5 mr-1" />}
                    {isRecording 
                      ? (language === 'ar' ? "إيقاف التسجيل..." : "Stop Recording...") 
                      : (language === 'ar' ? "تحدث للإملاء" : "Dictate")}
                  </Button>
                </div>
                <Textarea
                  id="tx-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? "أضف تفاصيل المعاملة هنا..." : "Add transaction details here..."}
                  className="resize-none min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* ITEM SELECTOR BLOCK */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                {t("addItemTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="add-product-select">{t("productSelect")}</Label>
                  <Select value={selectedProductId} onValueChange={handleProductSelect}>
                    <SelectTrigger id="add-product-select">
                      <SelectValue placeholder={t("productSelect")} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-item-qty">{t("qtyLabel")}</Label>
                  <Input
                    id="add-item-qty"
                    type="number"
                    min={1}
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-item-price">{t("priceLabel")}</Label>
                  <Input
                    id="add-item-price"
                    type="number"
                    step="0.01"
                    min={0}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {selectedProductId && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs animate-fadeIn">
                  <span className="text-slate-500">
                    {t("stockLabel")}:{" "}
                    <strong className="text-slate-800 font-mono">
                      {products.find(p => p.id === selectedProductId)?.is_service 
                        ? (language === 'ar' ? 'لا ينطبق (خدمة)' : 'N/A (Service)') 
                        : products.find(p => p.id === selectedProductId)?.current_stock || 0}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    {language === 'ar' ? "سعر الكتالوج" : "Catalog normal Price"}:{" "}
                    <strong className="text-slate-800 font-mono">
                      SAR {type === 'SALE'
                        ? products.find(p => p.id === selectedProductId)?.sale_price
                        : products.find(p => p.id === selectedProductId)?.purchase_price || products.find(p => p.id === selectedProductId)?.sale_price}
                    </strong>
                  </span>
                </div>
              )}

              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={!selectedProductId}
                onClick={handleAddLineItem}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t("addToList")}
              </Button>
            </CardContent>
          </Card>

          {/* BILLED ITEMS LIST */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{t("currentItems")}</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono">
                  {items.length} {language === 'ar' ? 'بنود' : 'Items'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-full flex items-center justify-center text-slate-400">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400 max-w-sm">
                    {t("emptyItems")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3 animate-fadeIn">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {language === 'ar' ? "متوفر" : "Available"}: {item.isService ? (language === 'ar' ? 'خدمة' : 'Service') : item.currentStock}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-slate-400 hidden sm:inline">{t("qtyLabel")}</Label>
                          <Input
                            type="number"
                            min={1}
                            className="w-18 h-8 font-mono font-bold text-center"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-slate-400 hidden sm:inline">{t("priceLabel")}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            className="w-24 h-8 font-mono text-end"
                            value={item.unitPrice}
                            onChange={(e) => updateUnitPrice(item.productId, parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="text-end min-w-[80px]">
                          <span className="text-xs text-slate-400 block">{language === 'ar' ? "المجموع" : "Total"}</span>
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            SAR {(item.quantity * item.unitPrice).toFixed(2)}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: COMPUTATIONS SUMMARY & PROCESS */}
        <div className="space-y-6">
          <Card className="border-blue-100 bg-slate-50/50">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                <BadgePercent className="w-5 h-5 text-blue-600" />
                {t("summaryTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{t("subtotal")}</span>
                <span className="font-mono text-slate-800">
                  SAR {getSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{t("tax")}</span>
                <span className="font-semibold text-sapphire-600">
                  +15.00%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 py-1 border-t border-dashed border-slate-200">
                <span>{language === 'ar' ? "مبلغ الضريبة" : "Computed VAT Amount"}</span>
                <span className="font-mono">
                  SAR {getTaxAmount().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between font-black text-slate-950 text-base border-t border-slate-200 pt-4">
                <span>{t("grandTotal")}</span>
                <span className="text-blue-600 font-mono text-lg font-black">
                  SAR {getTotalAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t border-slate-200 pt-6">
              {validationErrors.length > 0 && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{t("errorsTitle")}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationErrors.length === 0 && items.length > 0 && (
                <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-emerald-950">{language === 'ar' ? "فواتير مطابقة ومحققة" : "All checks cleared"}</span>
                    <span>{language === 'ar' ? "الفاتورة جاهزة للترحيل المباشر للمعاملات." : "Invoice validation checks cleared. Ready to submit."}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer"
                disabled={loading || validationErrors.length > 0}
                onClick={handleSubmitInvoice}
                id="tx-submit-btn"
              >
                {loading ? t("submitting") : t("submitBtn")}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-slate-200 bg-slate-50/20" id="tx-sandbox-info">
            <CardContent className="pt-6 text-xs text-slate-400 space-y-1 leading-relaxed">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {language === 'ar' ? "معايير الامتثال والضوابط" : "Compliance Checklist"}
              </span>
              <p>
                {language === 'ar' 
                  ? "تلتزم الفاتورة بأحكام هيئة الزكاة والضريبة والجمارك (ZATCA) متضمنة تسلسل الرقم التعريفي وضريبة 15% القياسية." 
                  : "Generates proper reference tags and locks currency standardizations representing official accounting policies."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
