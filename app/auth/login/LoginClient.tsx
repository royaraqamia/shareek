'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { signInAction } from "@/features/auth/actions";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";

const translations = {
  title: {
    en: "Sign in to Shareek ERP",
    ar: "تسجيل الدخول إلى نظام شريك"
  },
  desc: {
    en: "Manage products, inventory, transactions and contacts seamlessly",
    ar: "إدارة المنتجات والمخزون والمعاملات وجهات الاتصال بكل سلاسة"
  },
  email: {
    en: "Email Address",
    ar: "البريد الإلكتروني"
  },
  password: {
    en: "Password",
    ar: "كلمة المرور"
  },
  submit: {
    en: "Sign In",
    ar: "تسجيل الدخول"
  },
  submitting: {
    en: "Signing in...",
    ar: "جاري الدخول..."
  },
  noAccount: {
    en: "Don't have an workspace yet?",
    ar: "ليس لديك مساحة عمل بعد؟"
  },
  registerLink: {
    en: "Create an organization",
    ar: "إنشاء حساب جديد للمنشأة"
  },
  demoTitle: {
    en: "Evaluation & Testing Option",
    ar: "خيارات الفحص والتقييم السريع"
  },
  demoDesc: {
    en: "Gain instant sandbox access to review features without Supabase credentials.",
    ar: "تخطي تسجيل الدخول والوصول المباشر للمراجعة دون الحاجة لتهيئة الهوية."
  },
  demoBtn: {
    en: "Instant Sandbox Access (Review Mode)",
    ar: "الدخول الفوري المباشر (وضع المراجعة)"
  },
  authSuccess: {
    en: "Successfully signed in!",
    ar: "تم تسجيل الدخول بنجاح!"
  },
  authFailed: {
    en: "Authentication failed. Please verify credentials.",
    ar: "فشل التحقق. يرجى التأكد من صحة البيانات."
  }
};

export function LoginClient() {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  const t = (key: keyof typeof translations) => translations[key][language];

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInAction(formData);
      if (result.success) {
        toast.success(t("authSuccess"));
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error((result as any).message || t("authFailed"));
      }
    } catch (err: any) {
      toast.error(err.message || t("authFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    toast.success(language === 'ar' ? "تم منح الوصول الفوري للمراجعة الإرشادية!" : "Instant reviewer sandbox access granted!");
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md space-y-6" id="login-container">
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 mb-4 shadow-md">
          <span className="text-white font-black text-2xl leading-none pt-1">S</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("title")}</h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm">{t("desc")}</p>
      </div>

      <Card className="border-slate-200/80 shadow-lg" id="login-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <CardDescription className="text-slate-500">
              {language === 'ar' ? "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة" : "Enter your workspace details to securely connect"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="login-email"
                  type="email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">{t("password")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="login-password"
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading} id="login-submit-btn">
              <LogIn className="w-4 h-4 mr-2 shrink-0" />
              {loading ? t("submitting") : t("submit")}
            </Button>

            <p className="text-sm text-center text-slate-500">
              {t("noAccount")}{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-semibold">
                {t("registerLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50" id="login-demo-panel">
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
            id="login-demo-bypass-btn"
          >
            {t("demoBtn")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
