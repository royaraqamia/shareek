'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { signInAction } from "@/features/auth/actions";
import { toast } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, LogIn, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const translations = {
  title: {
    ar: "تسجيل الدُّخول"
  },
  email: {
    ar: "البريد الإلكتروني أو اسم المستخدم"
  },
  password: {
    ar: "كلمة المرور"
  },
  submit: {
    ar: "تسجيل الدُّخول"
  },
  submitting: {
    ar: "جاري الدُّخول..."
  },
  noAccount: {
    ar: "ليس لديك حساب بعد؟"
  },
  registerLink: {
    ar: "إنشاء حساب جديد"
  },
  forgotPassword: {
    ar: "نسيت كلمة المرور؟"
  },
  authSuccess: {
    ar: "تمَّ تسجيل الدُّخول بنجاح!"
  },
  authFailed: {
    ar: "فشل التَّحقُّق. يُرجَى التَّأكُّد من صحَّة البيانات."
  }
};

export function LoginClient() {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  
  const t = (key: keyof typeof translations) => {
    const item = translations[key];
    if (!item) return "";
    return item[language] || item['ar'] || "";
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInAction(formData);
      if (result.success) {
        toast.success(t("authSuccess"));
        if ((result as any).isPlatformAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
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

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500" id="login-container">
      <div className="text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-primary/20 border border-slate-100 bg-white relative flex items-center justify-center shrink-0 mb-6">
          <img
            src="/shareek_logo.png"
            alt="Shareek ERP Logo"
            className="w-full h-full object-contain p-1"
          />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("title")}</h1>
      </div>

      <Card className="border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden" id="login-card">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8 pt-8">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="font-bold text-slate-700">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="login-email"
                  type="text"
                  placeholder="البريد الإلكتروني أو @اسم_المستخدم"
                  className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="font-bold text-slate-700">{t("password")}</Label>
                <button
                  type="button"
                  className="text-sm font-semibold text-primary hover:underline hover:text-primary/80"
                  onClick={(e) => {
                    e.preventDefault();
                    // Optional: handle forgot password logic here, e.g. open a modal
                    toast.info("سيتم تفعيل هذه الخاصية قريباً");
                  }}
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="pl-11 pr-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading} id="login-submit-btn">
              <LogIn className="w-5 h-5 mr-2 shrink-0" />
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
    </div>
  );
}
