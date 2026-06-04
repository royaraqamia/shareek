'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { updatePasswordAction } from "@/features/auth/actions";
import { toast } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, CheckCircle2, LogIn, Sparkles, Check, X } from "lucide-react";
import Link from "next/link";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  checks: {
    length: boolean;
    mixed: boolean;
    number: boolean;
    special: boolean;
  };
}

function getPasswordStrength(pass: string): PasswordStrength {
  const checks = {
    length: pass.length >= 6,
    mixed: /[a-z]/.test(pass) && /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[^A-Za-z0-9]/.test(pass),
  };

  let score = 0;
  if (pass.length > 0) {
    if (checks.length) score++;
    if (checks.mixed) score++;
    if (checks.number) score++;
    if (checks.special) score++;
  }

  let label = "ضعيفة جدًّا";
  let color = "bg-rose-500";
  let bgColor = "text-rose-500";

  switch (score) {
    case 0:
      label = pass.length > 0 ? "ضعيفة جدًّا" : "فارغة";
      color = "bg-slate-200";
      bgColor = "text-slate-400";
      break;
    case 1:
      label = "ضعيفة ⚠️";
      color = "bg-rose-500";
      bgColor = "text-rose-600";
      break;
    case 2:
      label = "متوسِّطة ⚡";
      color = "bg-amber-500";
      bgColor = "text-amber-600";
      break;
    case 3:
      label = "قويَّة 💪";
      color = "bg-sky-500";
      bgColor = "text-sky-600";
      break;
    case 4:
      label = "ممتازة 🛡️";
      color = "bg-emerald-500";
      bgColor = "text-emerald-600";
      break;
  }

  return { score, label, color, bgColor, checks };
}

const translations = {
  title: {
    ar: "تعيين كلمة مرور جديدة"
  },
  subtitle: {
    ar: "يُرجَى إدخال كلمة مرور جديدة قويَّة لحماية حسابك."
  },
  newPassword: {
    ar: "كلمة المرور الجديدة"
  },
  confirmPassword: {
    ar: "تأكيد كلمة المرور الجديدة"
  },
  submit: {
    ar: "تحديث كلمة المرور"
  },
  submitting: {
    ar: "جاري تحديث كلمة المرور..."
  },
  matchError: {
    ar: "كلمتا المرور غير متطابقتين!"
  },
  lengthError: {
    ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
  },
  successTitle: {
    ar: "تمَّ تغيير كلمة المرور بنجاح! 🎉"
  },
  successMessage: {
    ar: "تمَّ تحديث كلمة المرور. يمكنك الآن الانتقال لتسجيل الدُّخول باستخدام كلمة المرور الجديدة."
  },
  goToLogin: {
    ar: "الذَّهاب لتسجيل الدُّخول"
  }
};

export function ResetPasswordClient() {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  
  const t = (key: keyof typeof translations) => {
    const item = translations[key];
    if (!item) return "";
    return item[language] || item['ar'] || "";
  };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const strength = getPasswordStrength(password);
    if (strength.score < 2) {
      toast.error("كلمة المرور ضعيفة جدًّا. يُرجَى إدخال كلمة مرور تحتوي على مزيج من الحروف والأرقام لضمان الأمان.");
      return;
    }

    if (password.length < 6) {
      toast.error(t("lengthError"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("matchError"));
      return;
    }

    setLoading(true);

    try {
      const result = await updatePasswordAction(password);
      if (result.success) {
        toast.success(result.message);
        setIsSuccess(true);
      } else {
        toast.error(result.message || "حدث خطأ أثناء محاولة تحديث كلمة المرور.");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء محاولة تحديث كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500" id="reset-success-container">
        <div className="text-center flex flex-col items-center">
          <img
            src="/shareek_logo.png"
            alt="Shareek ERP Logo"
            className="w-24 h-24 object-contain mb-5"
          />
        </div>

        <Card className="border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden p-8 text-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full border border-emerald-200/50 mb-4 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {t("successTitle")}
            </h1>
          </div>

          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {t("successMessage")}
          </p>

          <Link href="/auth/login" className="block w-full">
            <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all text-base">
              <LogIn className="w-5 h-5 ml-2" />
              {t("goToLogin")}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500" id="reset-container">
      <div className="text-center flex flex-col items-center">
        <img
          src="/shareek_logo.png"
          alt="Shareek Logo"
          className="w-24 h-24 object-contain mb-5"
        />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("title")}</h1>
        <p className="text-sm font-medium text-slate-400 mt-2">{t("subtitle")}</p>
      </div>

      <Card className="border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden" id="reset-card">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8 pt-8">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="reset-new-password" className="font-bold text-slate-700">{t("newPassword")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  className="pl-11 pr-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {password.length > 0 && (() => {
                const strength = getPasswordStrength(password);
                return (
                  <div className="space-y-2.5 mt-2.5 p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 font-arabic">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">قوَّة كلمة المرور:</span>
                      <span className={`font-black tracking-tight ${strength.bgColor}`}>{strength.label}</span>
                    </div>
                    
                    {/* Multi-segment Progress Bar */}
                    <div className="grid grid-cols-4 gap-1.5 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-100'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-100'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-100'}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-slate-100'}`} />
                    </div>

                    {/* Real-time Dynamic Checklist */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1 text-[11px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5 select-none">
                        {strength.checks.length ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 bg-emerald-50 rounded-full p-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 bg-slate-100 rounded-full p-0.5" />
                        )}
                        <span className={strength.checks.length ? "text-slate-700" : "text-slate-400"}>٦ أحرف على الأقل</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 select-none">
                        {strength.checks.mixed ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 bg-emerald-50 rounded-full p-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 bg-slate-100 rounded-full p-0.5" />
                        )}
                        <span className={strength.checks.mixed ? "text-slate-700" : "text-slate-400"}>حروف كبيرة وصغيرة</span>
                      </div>

                      <div className="flex items-center gap-1.5 select-none">
                        {strength.checks.number ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 bg-emerald-50 rounded-full p-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 bg-slate-100 rounded-full p-0.5" />
                        )}
                        <span className={strength.checks.number ? "text-slate-700" : "text-slate-400"}>رقم واحد على الأقل</span>
                      </div>

                      <div className="flex items-center gap-1.5 select-none">
                        {strength.checks.special ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 bg-emerald-50 rounded-full p-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 bg-slate-100 rounded-full p-0.5" />
                        )}
                        <span className={strength.checks.special ? "text-slate-700" : "text-slate-400"}>رمز خاص (@، !، *...)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password" className="font-bold text-slate-700">{t("confirmPassword")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-11 pr-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading} 
              id="reset-submit-btn"
            >
              {loading ? t("submitting") : t("submit")}
            </Button>

            <p className="text-sm text-center text-slate-500">
              <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                العودة لتسجيل الدُّخول
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
