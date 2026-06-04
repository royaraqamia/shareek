import Link from "next/link";
import { Scale, ArrowRight, ShieldCheck, ScrollText, AlertTriangle, Globe } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-arabic flex flex-col justify-between" dir="rtl">
      {/* Decorative top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-primary to-indigo-600" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 w-full space-y-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-card border border-border shadow-md flex items-center justify-center rounded-2xl shrink-0">
              <img src="/shareek_logo.png" alt="شريك" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">الشُّروط والأحكام</h1>
              <p className="text-sm text-muted-foreground font-bold mt-1">تطبيق شَريك</p>
            </div>
          </div>

          <Link 
            href="/auth/register" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:bg-muted text-foreground font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-sm self-start sm:self-auto"
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            العودة
          </Link>
        </div>

        {/* Introduction Banner Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-950/20">
          {/* Background graphics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black text-indigo-200 border border-white/10">
              <Scale className="w-3.5 h-3.5" />
              اتفاقيّة ترخيص واستخدام المنصّة قانوناً
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">مرحبًا بك في تطبيق شَريك! يُرجى قراءة شروط الخدمة بدقَّة قبل الاستمتاع بالنظام.</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
              باستخدامك لتطبيق شَريك، فإنك توافق بالكامل على الالتزام ببنود الاستخدام والشروط الموضَّحة في هذه الاتفاقيَّة التنظيميَّة لتسيير معاملات الأعمال والماليَّة الفعَّالة.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-card border border-border/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">١</span>
              شروط وأمان الحساب
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              عند إنشائك لحساب في منَّصتنا، يجب عليك الالتزام بالآتي لضمان سلامتكم وسلامة أعمالكم:
            </p>
            <ul className="space-y-2.5 text-muted-foreground text-sm font-medium mr-4 list-disc list-inside">
              <li>تزويد المنصَّة ببيانات صحيحة ودقيقة (الاسم، البريد الإلكتروني، واسم المستخدم الصحيح).</li>
              <li>الحفاظ على سريَّة كلمة مرورك والتحقّق المستمر من قوَّة تفاصيلها (ننصح دائماً باجتياز مقياس حماية كلمة المرور بنجاح).</li>
              <li>أنت مسؤول بالكامل عن كافَّة المعاملات والفواتير والأعمال المسجلَّة باستخدام حسابكم.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-card border border-border/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">٢</span>
              الاستخدام المقبول والمصرّح به
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              يُسمح باستخدام تطبيق شريك لإدارة معاملات المحاسبة والأعمال وتسجيل المبيعات والمشتريات وفقاً للقواعد والأخلاقيَّات التجاريَّة السليمة. يُحظر تمامًا استخدام تطبيق شريك في:
            </p>
            <ul className="space-y-2.5 text-muted-foreground text-sm font-medium mr-4 list-disc list-inside">
              <li>أي معاملات ماليَّة مشبوهة أو غير قانونيَّة تتعارض مع السياسات الضريبيَّة والمحاسبيَّة الوطنيَّة.</li>
              <li>انتحال هويَّة مؤسَّسات ماليَّة أخرى أو تقديم بيانات مبيعات وهميَّة للعملاء.</li>
              <li>محاولة فك تشفير البيانات أو القيام بأي هجوم إلكتروني قد يضر بخدماتنا وخوادمنا السحابيَّة.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-card border border-border/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">٣</span>
              إخلاء المسؤولية القانونيَّة
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              يُقدّم تطبيق شريك بصيغته الحالية &quot;كما هو&quot; لتنظيم أعمالكم وتوليد تقارير المحاسبة والبيع والتحليلات. نبذل كافّة الجهود لضمان الاستقرار الكلي والخدمة الدائمة بدون انقطاع، ومع ذلك فإن تسيير شؤون القرارات الماليَّة والاستثماريَّة الدقيقة لمؤسَّستك والتدقيق النهائي لإتاحة الفواتير يندرج بالكامل تحت مسؤوليَّة العميل بمفرده دون أدنى مسؤوليَّة قانونيَّة على المنصَّة.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-card border border-border/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">٤</span>
              التعديلات وإلغاء الخدمة
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              نحتفظ بالحق الكامل في تعديل شروط الخدمة وتعديل باقات المميِّزات المتاحة بما يتماشى مع التطوّرات التقنيَّة والتنظيميَّة لبرمجيَّات إدارة الأعمال، وسيتم إخطار المستخدمين بأي تغيير جوهري على هذه الشروط فور حدوثه.
            </p>
          </div>
        </div>

        {/* Footer info card */}
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl text-center space-y-2">
          <p className="text-sm text-primary font-bold">بمتابعة تشغيل وإنشاء حسابك، فإنك تعبر صراحة عن موافقتك الكاملة على هذه البنود.</p>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-card border-t border-border/60 py-6 text-center text-xs text-muted-foreground font-bold">
        <p dir="ltr">© {new Date().getFullYear()} Shareek. All rights reserved.</p>
      </footer>
    </div>
  );
}
