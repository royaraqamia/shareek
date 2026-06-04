'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { signInAction, requestPasswordResetAction } from "@/features/auth/actions";
import { toast } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, LogIn, Sparkles, Eye, EyeOff, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered user email if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("shareek_remembered_email");
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
    }
  }, []);

  // Forgot password dialog states
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInAction(formData);
      if (result.success) {
        toast.success(t("authSuccess"));
        
        // Handle Remember Me storage
        if (rememberMe) {
          localStorage.setItem("shareek_remembered_email", formData.email);
        } else {
          localStorage.removeItem("shareek_remembered_email");
        }

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

  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      toast.error("يُرجَى إدخال البريد الإلكتروني أو اسم المستخدم");
      return;
    }
    setResetLoading(true);

    try {
      const result = await requestPasswordResetAction(resetIdentifier);
      if (result.success) {
        toast.success(result.message);
        setResetSuccessMessage(result.message);
      } else {
        toast.error(result.message || "فشلت العمليَّة، يُرجَى المحاولة مرَّة أخرى.");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ غير مُتوقَّع.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500" id="login-container">
      <div className="text-center flex flex-col items-center">
        <img
          src="/shareek_logo.png"
          alt="Shareek ERP Logo"
          className="w-24 h-24 object-contain mb-5"
        />
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
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="font-bold text-slate-700">{t("password")}</Label>
                <button
                  type="button"
                  className="text-sm font-semibold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setResetIdentifier("");
                    setResetSuccessMessage("");
                    setIsResetOpen(true);
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1 font-arabic select-none">
              <label htmlFor="remember-me" className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-600 font-bold hover:text-slate-850 transition-colors">
                <input
                  type="checkbox"
                  id="remember-me"
                  onChange={(e) => setRememberMe(e.target.checked)}
                  checked={rememberMe}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-1 accent-blue-600 cursor-pointer"
                />
                تذكَّرني على هذا الجهاز 💻
              </label>
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

      {/* Forgot Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200/80 shadow-2xl rounded-2xl p-6 sm:p-8 font-arabic">
          <DialogHeader className="text-center flex flex-col items-center">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-2">
              إستعادة حسابك 🔑
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">
              أدخل اسم المستخدم الخاص بك أو البريد الإلكتروني وسنقوم بالتَّحقُّق من حسابك وإرسال رابط لإعادة تعيين كلمة المرور.
            </DialogDescription>
          </DialogHeader>

          {resetSuccessMessage ? (
            <div className="space-y-6 py-4 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 mb-4 animate-bounce">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">تمَّ إرسال رابط استعادة الحساب</h3>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-slate-700 text-sm leading-relaxed text-right">
                <p>{resetSuccessMessage}</p>
                <p className="text-[12px] text-slate-500 mt-2 border-t border-emerald-100/50 pt-2">
                  يُرجَى فحص صندوق البريد الوارد (او صندوق البريد المزعج/Spam) للوصول إلى رسالة لإعادة تعيين كلمة مرور جديدة.
                </p>
              </div>
              <Button
                type="button"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-lg"
                onClick={() => setIsResetOpen(false)}
              >
                حسنًا، فهمت
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPasswordRequest} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-identifier" className="font-bold text-slate-700">
                  البريد الإلكتروني أو اسم المستخدم
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="reset-identifier"
                    type="text"
                    placeholder="البريد الإلكتروني أو اسم المستخدم"
                    className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm font-medium"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all text-base"
                  disabled={resetLoading}
                >
                  {resetLoading ? "جاري الإرسال..." : "إرسال رابط استعادة الحساب"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 text-slate-500 hover:text-slate-800"
                  onClick={() => setIsResetOpen(false)}
                >
                  إلغاء التَّراجع
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

