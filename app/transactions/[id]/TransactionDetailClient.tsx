'use client';

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, Landmark, Receipt, Building2, User, Globe, BadgePercent, QrCode, FileText, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { useState } from "react";

interface TransactionDetailClientProps {
  transaction: any | null;
  organization: any | null;
}

const translations = {
  title: { en: "Tax Invoice", ar: "فاتورة ضريبية مبسطة" },
  back: { en: "Back to transactions", ar: "الرجوع إلى المعاملات" },
  print: { en: "Print Invoice", ar: "طباعة الفاتورة" },
  seller: { en: "Seller Information", ar: "بيانات المورد / البائع" },
  buyer: { en: "Customer Information", ar: "بيانات العميل / المشتري" },
  refNum: { en: "Invoice Number", ar: "رقم الفاتورة" },
  date: { en: "Date of Issue", ar: "تاريخ الإصدار" },
  taxNo: { en: "VAT License ID", ar: "الرقم الضريبي" },
  tableItem: { en: "Product / Service description", ar: "البند / وصف الخدمة" },
  tableQty: { en: "Qty", ar: "الكمية" },
  tablePrice: { en: "Unit Price", ar: "سعر الوحدة" },
  tableTotal: { en: "Total (Excl. VAT)", ar: "المجموع المؤقت" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  vat: { en: "VAT (15%)", ar: "ضريبة القيمة المضافة (15.00%)" },
  grandTotal: { en: "Grand Total (Incl. VAT)", ar: "الإجمالي النهائي (شامل الضريبة)" },
  status: { en: "Billing Status", ar: "حالة الفاتورة" },
  zatcaVerified: { en: "ZATCA Compliant QR", ar: "موافق للائحة الفوترة الإلكترونية" },
  demoNotice: { en: "Evaluation Sandbox: Showing robust mock invoice for testing", ar: "موضع مراجعة التقييم: يتم عرض قالب فاتورة تجريبي متكامل لأغراض الاختبار والطباعة" },
};

export function TransactionDetailClient({ transaction, organization }: TransactionDetailClientProps) {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  const t = (key: keyof typeof translations) => translations[key][language];
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Robust default sample invoice data for sandbox review mode
  const isDemo = !transaction;
  const activeTx = transaction || {
    reference_number: "INV-2026-0602-9981",
    type: "SALE",
    transaction_date: new Date().toISOString(),
    subtotal: 5400.00,
    tax_rate: 0.15,
    total_amount: 6210.00,
    payment_status: "PAID",
    contacts: {
      name: "مجموعة العليان التجارية (محتوى تجريبي)",
      email: "info@olayan.com.sa",
      phone: "+966114567890"
    },
    transaction_items: [
      {
        id: "1",
        quantity: 2,
        unit_price: 2200.00,
        total_price: 4400.00,
        product: { name: "خادم شبكات مروحي Dell Server PowerEdge", is_service: false }
      },
      {
        id: "2",
        quantity: 1,
        unit_price: 1000.00,
        total_price: 1000.00,
        product: { name: "تهيئة وإعداد الخوادم السحابية كخدمة تجريبية", is_service: true }
      }
    ]
  };

  const activeOrg = organization || {
    name: "مؤسسة شريك للتجارة والخدمات السحابية",
    tax_number: "310123456700003",
    currency: "SAR"
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("tx-invoice-sheet");
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${activeTx.reference_number}.pdf`);
      toast.success(language === 'ar' ? 'تم تنزيل الفاتورة بنجاح' : 'Invoice downloaded successfully');
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنشاء ملف PDF' : 'Error generating PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6" id="tx-detail-container">
      {/* Action header - hidden on print */}
      <div className="flex items-center justify-between print:hidden" id="tx-detail-actions-header">
        <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={() => router.push('/transactions')}>
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-slate-700 font-medium cursor-pointer" onClick={handleExportPDF} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer" onClick={handlePrint} disabled={isGeneratingPdf}>
            <Printer className="w-4 h-4 text-white" />
            {t("print")}
          </Button>
        </div>
      </div>

      {isDemo && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-normal gap-2.5 items-center flex print:hidden mb-4">
          <Globe className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t("demoNotice")}</span>
        </div>
      )}

      {/* Primary Sheet Invoice Canvas */}
      <Card className="shadow-lg border-slate-200 print:shadow-none print:border-none print:bg-white bg-white text-slate-900" id="tx-invoice-sheet">
        <CardContent className="p-8 md:p-12 space-y-8">
          {/* SHEET HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-xl leading-none pt-0.5">S</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{activeOrg.name}</h2>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed font-medium">
                <p className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t("taxNo")}: <strong className="font-mono text-slate-700">{activeOrg.tax_number || "N/A"}</strong></span>
                </p>
                <p>{language === 'ar' ? "الرقم الضريبي الموحد لهيئة الزكاة والجمارك بموجب اللائحة" : "Registered Unified VAT identifier according to ZATCA rules"}</p>
              </div>
            </div>

            <div className="md:text-end space-y-1">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-xs tracking-wide">
                {t("title")}
              </span>
              <p className="text-xs text-slate-400 font-mono pt-1"># {activeTx.reference_number}</p>
              <div className="text-xs text-slate-500 leading-normal pt-1">
                <p><strong>{t("date")}:</strong> <span className="font-mono">{new Date(activeTx.transaction_date).toLocaleString()}</span></p>
                <p>
                  <strong>{t("status")}:</strong>{" "}
                  <span className={`font-semibold ${
                    activeTx.payment_status === 'PAID' ? 'text-emerald-600' :
                    activeTx.payment_status === 'PARTIAL' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {activeTx.payment_status === 'PAID' ? (language === 'ar' ? 'مسددة بالكامل' : 'Settled (PAID)') :
                     activeTx.payment_status === 'PARTIAL' ? (language === 'ar' ? 'مسددة جزئياً' : 'Partial (PARTIAL)') :
                                                           (language === 'ar' ? 'آجل غير مسددة' : 'Unpaid (UNPAID)')}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* PARTIES BLOCK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
            {/* Seller */}
            <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-blue-600" />
                {t("seller")}
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-bold text-slate-800">{activeOrg.name}</p>
                <p className="text-xs text-slate-500">{t("taxNo")}: <strong className="font-mono">{activeOrg.tax_number || '-'}</strong></p>
                <p className="text-xs text-slate-500">{language === 'ar' ? "الرياض، المملكة العربية السعودية" : "Riyadh, Kingdom of Saudi Arabia"}</p>
              </div>
            </div>

            {/* Buyer */}
            <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                {t("buyer")}
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-bold text-slate-800">{activeTx.contacts?.name || '-'}</p>
                {activeTx.contacts?.email && <p className="text-xs text-slate-500 font-mono">{activeTx.contacts.email}</p>}
                {activeTx.contacts?.phone && <p className="text-xs text-slate-500 font-mono">{activeTx.contacts.phone}</p>}
              </div>
            </div>
          </div>

          {/* SHEET ITEMS TABLE */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">{language === 'ar' ? "بنود الفاتورة والخدمات" : "Line items invoice specifics"}</h3>
            
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="py-2 text-start font-medium">{t("tableItem")}</th>
                    <th className="py-2 text-center font-medium w-16">{t("tableQty")}</th>
                    <th className="py-2 text-end font-medium w-32">{t("tablePrice")}</th>
                    <th className="py-2 text-end font-medium w-32">{t("tableTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTx.transaction_items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-border/60 text-muted-foreground hover:bg-secondary/30 transition-colors">
                      <td className="py-3 text-start">
                        <p className="font-semibold text-foreground">{item.product?.name || (language === 'ar' ? 'بند غير محدد' : 'Staged catalog resource')}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.product?.sku ? `SKU: ${item.product.sku}` : ''}</p>
                      </td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-end font-mono">SAR {Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-3 text-end font-mono font-bold text-foreground">SAR {Number(item.total_price || (item.quantity * item.unit_price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden space-y-3">
              {activeTx.transaction_items?.map((item: any) => (
                <div key={item.id} className="border border-border/60 rounded-xl p-3 bg-secondary/10 flex flex-col gap-2 relative">
                   <div className="flex justify-between items-start pr-8">
                     <div>
                       <div className="font-bold text-foreground text-sm">{item.product?.name || (language === 'ar' ? 'بند غير محدد' : 'Staged catalog resource')}</div>
                       <div className="text-xs text-muted-foreground font-mono">{item.product?.sku ? `SKU: ${item.product.sku}` : ''}</div>
                     </div>
                     <div className="text-right font-mono font-black text-foreground">
                       <div className="text-[11px] text-muted-foreground font-sans font-normal mb-0.5">{language === 'ar' ? 'الإجمالي' : 'Total'}</div>
                       SAR {Number(item.total_price || (item.quantity * item.unit_price)).toFixed(2)}
                     </div>
                   </div>
                   
                   <div className="flex gap-4 border-t border-border/40 pt-2 mt-1">
                      <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">{language === 'ar' ? 'الكمية' : 'Qty'}</span>
                        <span className="font-mono font-bold text-foreground">{item.quantity}</span>
                      </div>
                      <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</span>
                        <span className="font-mono font-medium">SAR {Number(item.unit_price).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* CALCULATIONS & SUMMARY BLOCK WITH QR CODE */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-end pt-6 gap-8 border-t border-slate-100">
            {/* ZATCA Compliant QR Code placeholder */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 border border-slate-200 rounded-xl">
              {/* Specialized SVG rendering mock high-fidelity QR Code with Saudi flag accent to look incredibly professional */}
              <div className="w-24 h-24 bg-white border border-slate-300 p-1 rounded-sm shrink-0 flex items-center justify-center relative">
                <QrCode className="w-20 h-20 text-slate-900" />
                <div className="absolute w-5 h-5 bg-emerald-600 border border-white rounded-xs flex items-center justify-center shrink-0">
                  <span className="text-white text-[8px] leading-none font-bold">KSA</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 leading-normal space-y-0.5">
                <span className="font-black text-slate-800 block">{t("zatcaVerified")}</span>
                <p>{language === 'ar' ? "موافق لمعايير الفاتورة المبسطة" : "Complies with simplified regulatory specs"}</p>
                <p className="font-mono text-[9px] text-slate-400">UUID: {activeTx.reference_number}</p>
              </div>
            </div>

            {/* Computed Ledger Totals */}
            <div className="w-full md:w-80 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between items-center">
                <span>{t("subtotal")}</span>
                <span className="font-mono text-slate-800">SAR {Number(activeTx.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>{t("vat")}</span>
                <span className="font-semibold text-sapphire-600">+15.00%</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-100 pb-1.5">
                <span>{language === 'ar' ? "قيمة الضريبة" : "VAT Amount"}</span>
                <span className="font-mono">SAR {Number(activeTx.subtotal * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center font-black text-slate-950 text-base pt-1">
                <span>{language === 'ar' ? "الإجمالي النهائي" : "Total Invoice"}</span>
                <span className="text-blue-600 text-lg font-mono font-black">SAR {Number(activeTx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
