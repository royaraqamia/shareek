import Link from "next/link";
import { Shield, ArrowRight, Lock, Eye, ScrollText, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic flex flex-col justify-between" dir="rtl">
      {/* Decorative top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-primary to-indigo-600" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 w-full space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-205 shadow-md flex items-center justify-center rounded-2xl shrink-0">
              <img src="/shareek_logo.png" alt="شريك" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">سياسة الخصوصيَّة</h1>
              <p className="text-sm text-slate-500 font-bold mt-1">تطبيق شَريك</p>
            </div>
          </div>

          <Link 
            href="/auth/register" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-sm self-start sm:self-auto"
          >
            <ArrowRight className="w-4 h-4 text-slate-500" />
            العودة
          </Link>
        </div>

        {/* Introduction Banner Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/20">
          {/* Background graphics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black text-blue-200 border border-white/10">
              <Shield className="w-3.5 h-3.5" />
              أمان البيانات أولويَّتنا القصوى
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">يلتزم تطبيق شَريك بحماية خصوصيَّتك وأمان بياناتك بالكامل.</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              تُوضِّح هذه السِّياسة نوعيَّة البيانات التي نقوم بجمعها، وكيف نحميها بالكامل باستخدام أعلى معايير التَّشفير والأمان السَّحابي.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-white border border-slate-205/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">١</span>
              البيانات التي نجمعها
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              نقوم بجمع وتخزين المعلومات المحدودة والضَّروريَّة لتقديم خدمات المنصَّة لك:
            </p>
            <ul className="space-y-2.5 text-slate-600 text-sm font-medium mr-4 list-disc list-inside">
              <li>المعلومات الشَّخصيَّة الأساسيَّة (الاسم، البريد الإلكتروني، واسم المستخدم).</li>
              <li>معلومات السِّجلات التجاريَّة والمعاملات مثل (الفواتير، والزَّبائن والمورِّدين، ومعاملات الشِّراء والبيع الخاصَّة بك).</li>
              <li>ملفَّات تعريف الارتباط المحدودة لتحديث وتخزين تفضيلات حسابك (مثل اللغّة ووضعيَّة الاتِّصال).</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-slate-205/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">٢</span>
              كيفيَّة استخدام البيانات
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              نحن نستخدم البيانات التي نجمعها بشكلٍ حصري للأغراض التَّالية:
            </p>
            <ul className="space-y-2.5 text-slate-600 text-sm font-medium mr-4 list-disc list-inside">
              <li>تخصيص لوحة التَّحكُّم والتقارير الماليَّة لتناسب مؤسَّستك التجاريَّة.</li>
              <li>إرسال الإشعارات وتنبيهات الأمان الهامَّة مثل (تغيير كلمة المرور وتعيين الحساب).</li>
              <li>توفير وتفعيل وضع عدم الاتِّصال بالإنترنت (Offline Mode) لضمان استمراريَّة إدخال فواتيرك بأمان تامّ.</li>
              <li>امتثالًا للقوانين والأنظمة المحاسبيَّة والضَّريبيَّة المحلِّيَّة السَّارية.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white border border-slate-205/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">٣</span>
              أمان وحفظ البيانات
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              جميع بياناتك وخوادمنا مُشفَّرَة بالكامل باستخدام بروتوكولات الأمان القياسيَّة (SSL/TLS). نحن لا نقوم بمشاركة أي من بيانات معاملاتك الماليَّة أو فواتيرك مع أي جهة خارجيَّة على الإطلاق، كما يتمُّ حفظ هويَّتك بشكل مجهول وحمايتها ضدَّ أيِّ اختراقات.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white border border-slate-205/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">٤</span>
              حقوق المستخدم
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              لديك كافَّة الحقوق في تعديل بيانات حسابك، أو تصدير تقارير معاملاتك بصيغة Excel أو CSV، كما يحقُّ لك طلب حذف الحساب نهائيًّا من خوادمنا بشكلٍ فوري إذا رغبت في ذلك.
            </p>
          </div>
        </div>

        {/* Footer Contact Info Card */}
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl text-center space-y-2">
          <p className="text-sm text-blue-800 font-bold">هل لديك أي استفسار أو مخاوف بشأن الخصوصيَّة؟</p>
          <p className="text-xs text-blue-600 font-medium">قنواتنا مفتوحة دائمًا لدعمك. يمكنك مراسلتنا مباشرةً عبر البريد الإلكتروني الخاص بـ شَريك.</p>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-bold">
        <p dir="ltr">© {new Date().getFullYear()} Shareek. All rights reserved.</p>
      </footer>
    </div>
  );
}
