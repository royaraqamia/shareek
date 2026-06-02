'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { signUpAction } from "@/features/auth/actions";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, User, Building, UserPlus, Sparkles } from "lucide-react";
import Link from "next/link";

const translations = {
  title: {
    en: "Create a Shareek Workspace",
    ar: "إنشاء مساحة عمل شريك جديدة"
  },
  desc: {
    en: "Set up multi-tenant organization tenancy and initiate resource billing registries.",
    ar: "تعديل إعدادات بنية الحوسبة السحابية متعددة المستأجرين وبدء تكوين دفاتر الفواتير."
  },
  fullName: {
    en: "Full Manager Name",
    ar: "اسم المدير الكامل"
  },
  organizationName: {
    en: "Company / Organization Name",
    ar: "اسم المؤسسة / الشركة"
  },
  email: {
    en: "Email Address",
    ar: "البريد الإلكتروني"
  },
  password: {
    en: "Secure Password",
    ar: "كلمة المرور الآمنة"
  },
  submit: {
    en: "Initialize Organization",
    ar: "بدء تهيئة المنشأة"
  },
  submitting: {
    en: "Bootstrapping Tenant...",
    ar: "جاري ربط حساب المنشأة..."
  },
  hasAccount: {
    en: "Already have a company configured?",
    ar: "هل تم تكوين الشركة بالفعل؟"
  },
  loginLink: {
    en: "Sign in instead",
    ar: "تسجيل الدخول بدلاً من ذلك"
  },
  demoTitle: {
    en: "Sandbox Direct Evaluation",
    ar: "خيارات الفحص والتقييم السريع"
  },
  demoDesc: {
    en: "Gain instant sandbox access to review features without Supabase credentials.",
    ar: "تخطي التسجيل والوصول المباشر للمراجعة دون الحاجة لتهيئة الهوية والعمليات الحقيقية."
  },
  demoBtn: {
    en: "Instant Sandbox Access (Review Mode)",
    ar: "الدخول الفوري المباشر (وضع المراجعة)"
  },
  successMsg: {
    en: "Your multi-tenant workspace was created successfully!",
    ar: "تم إنشاء منشأتك ومساحة عملك التجريبية بنجاح!"
  },
  errorMsg: {
    en: "Failed to configure tenant. Please verify details.",
    ar: "تعذر إكمال ربط المنشأة. يرجى تأكيد البيانات المكتوبة."
  }
};

export function RegisterClient() {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  const t = (key: keyof typeof translations) => translations[key][language];

  const [formData, setFormData] = useState({
    fullName: "",
    organizationName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signUpAction(formData);
      if (result.success) {
        toast.success(t("successMsg"));
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error((result as any).message || t("errorMsg"));
      }
    } catch (err: any) {
      toast.error(err.message || t("errorMsg"));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    toast.success(language === 'ar' ? "تم منح الوصول الفوري للمراجعة الإرشادية!" : "Instant reviewer sandbox access granted!");
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md space-y-6" id="register-container">
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 mb-4 shadow-md">
          <span className="text-white font-black text-2xl leading-none pt-1">S</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("title")}</h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm">{t("desc")}</p>
      </div>

      <Card className="border-slate-200/80 shadow-lg" id="register-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <CardDescription className="text-slate-500">
              {language === 'ar' ? "أدخل كافة الحقول التالية لتهيئة بيئة البرمجيات الخاصة بك" : "Fill out all fields below to compile and start your cloud service instance"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-fullname">{t("fullName")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="register-fullname"
                  type="text"
                  className="pl-10"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-orgname">{t("organizationName")}</Label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="register-orgname"
                  type="text"
                  className="pl-10"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="register-email"
                  type="email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">{t("password")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="register-password"
                  type="password"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading} id="register-submit-btn">
              <UserPlus className="w-4 h-4 mr-2 shrink-0" />
              {loading ? t("submitting") : t("submit")}
            </Button>

            <p className="text-sm text-center text-slate-500">
              {t("hasAccount")}{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                {t("loginLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50" id="register-demo-panel">
        <CardContent className="pt-6 space-y-3">
          <div className="flex gap-2.5 text-amber-800 text-sm">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-0.5">{t("demoTitle")}</p>
              <p className="text-amber-800/90 leading-normal">{t("demoDesc")}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDemoBypass}
            className="w-full border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold"
            id="register-demo-bypass-btn"
          >
            {t("demoBtn")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
