'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { signUpAction, checkUsernameAction } from "@/features/auth/actions";
import { toast } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, User, Building, UserPlus, Sparkles, AtSign, CheckCircle2, Eye, EyeOff, Check, X } from "lucide-react";
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
    ar: "إنشاء حساب جديد"
  },
  fullName: {
    ar: "اسمك الكامل (بالعربيَّة)"
  },
  username: {
    ar: "اسم المستخدم (بالإنجليزيَّة)"
  },
  email: {
    ar: "البريد الإلكتروني"
  },
  password: {
    ar: "كلمة المرور"
  },
  submit: {
    ar: "إنشاء الحساب"
  },
  submitting: {
    ar: "جاري إنشاء الحساب..."
  },
  hasAccount: {
    ar: "هل لديك حساب بالفعل؟"
  },
  loginLink: {
    ar: "تسجيل الدُّخول"
  },
  confirmPassword: {
    ar: "تأكيد كلمة المرور"
  },
  passwordMismatch: {
    ar: "كلمتا المرور غير متطابقتين"
  },
  successMsg: {
    ar: "تمَّ إنشاء حسابك بنجاح! وهو قيد المراجعة الآن."
  },
  errorMsg: {
    ar: "تعذَّر إكمال إنشاء الحساب. يُرجَى تأكيد البيانات المكتوبة."
  }
};

export function RegisterClient() {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  const t = (key: keyof typeof translations) => {
    const item = translations[key];
    if (!item) return "";
    return item[language] || item['ar'] || "";
  };

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [registerSuccessInfo, setRegisterSuccessInfo] = useState({
    email: "",
    fullName: "",
    username: ""
  });
  
  const [usernameStatus, setUsernameStatus] = useState<{
    loading: boolean;
    available: boolean | null;
    message: string;
  }>({
    loading: false,
    available: null,
    message: "",
  });

  const [debouncedUsername, setDebouncedUsername] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(formData.username);
    }, 450);
    return () => clearTimeout(timer);
  }, [formData.username]);

  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameStatus({ loading: false, available: null, message: "" });
      return;
    }

    if (debouncedUsername.length < 3) {
      setUsernameStatus({ 
        loading: false, 
        available: false, 
        message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل." 
      });
      return;
    }

    const regex = /^[a-z0-9_]+$/;
    if (!regex.test(debouncedUsername)) {
      setUsernameStatus({ 
        loading: false, 
        available: false, 
        message: "أحرف إنجليزيَّة صغيرة، أرقام، أو شرطة سُفليَّة (_) فقط." 
      });
      return;
    }

    async function verify() {
      setUsernameStatus(prev => ({ ...prev, loading: true }));
      try {
        const res = await checkUsernameAction(debouncedUsername);
        if (res.success) {
          setUsernameStatus({ loading: false, available: true, message: "متاح! ✅" });
        } else {
          setUsernameStatus({ loading: false, available: false, message: res.message || "غير متاح!" });
        }
      } catch {
        setUsernameStatus({ loading: false, available: false, message: "فشل التَّحقُّق." });
      }
    }
    verify();
  }, [debouncedUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus.available === false) {
      toast.error("يُرجَى تصحيح اسم المستخدم أو اختيار اسم مستخدم متاح قبل المتابعة.");
      return;
    }

    const strength = getPasswordStrength(formData.password);
    if (strength.score < 2) {
      toast.error("كلمة المرور ضعيفة جدًّا. يُرجَى إدخال كلمة مرور تحتوي على مزيج من الحروف والأرقام لضمان الأمان.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    if (!acceptTerms) {
      toast.error("يُرجَى الموافقة على الشُّروط والأحكام وسياسة الخصوصيَّة للمتابعة.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUpAction(formData);
      if (result.success) {
        setRegisterSuccessInfo({
          email: formData.email,
          fullName: formData.fullName,
          username: formData.username
        });
        setIsSuccess(true);
        toast.success("تمَّ إنشاء حسابك بنجاح! بانتظار التَّحقُّق من البريد الإلكتروني.");
      } else {
        toast.error((result as any).message || t("errorMsg"));
      }
    } catch (err: any) {
      toast.error(err.message || t("errorMsg"));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-lg space-y-6 animate-fade-in" id="register-success-container">
        <div className="text-center flex flex-col items-center">
        <img
          src="/shareek_logo.png"
          alt="Shareek Logo"
          className="w-20 h-20 object-contain mb-3"
        />
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">شَريك</h1>
        </div>

        <Card className="border-slate-200/80 shadow-2xl overflow-hidden" id="register-success-card">
          <div className="bg-emerald-50 border-b border-emerald-100 py-6 px-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900">تمَّ إنشاء حسابك بنجاح! 🎉</h2>
            <p className="text-sm text-emerald-700/90 mt-1">الحساب جاهز وقيد التَّنشيط مسبقًا</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-4 text-right">
              <p className="text-sm text-slate-600 leading-relaxed">
                أهلًا بك يا <strong>{registerSuccessInfo.fullName}</strong> في منصَّة شَريك. 
              </p>

              <div className="border border-blue-100 bg-blue-50/50 p-5 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-white pb-2 text-xs">
                  <span className="font-semibold text-blue-900">بيانات حسابك المُسجَّل:</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-xs text-slate-500">البريد الإلكتروني:</span>
                  <span className="font-semibold font-mono text-xs">{registerSuccessInfo.email}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-xs text-slate-500">اسم المستخدم:</span>
                  <span className="font-semibold font-mono text-xs">@{registerSuccessInfo.username}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-800 text-center text-xs">📌 ما هي الخطوة القادمة؟</div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">١</span>
                  <p>تفقَّد بريدك الإلكتروني الآن، ستجد رسالة من <strong>شَريك | رؤية رقمية</strong> تحتوى على رابط تأكيد البريد.</p>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">٢</span>
                  <p>اضغط على رابط تأكيد البريد الإلكتروني وسيتمُّ تحويلك تلقائيًّا إلى لوحة القيادة لتفعيل الحساب.</p>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">٣</span>
                  <p>يقوم المشرفون بمراجعة حسابك.</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-slate-100/60 p-6 flex flex-col gap-4">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 shadow-md">
                الانتقال إلى صفحة تسجيل الدُّخول
              </Button>
            </Link>
            <p className="text-xs text-slate-400 text-center">
              لم تصلك رسالة التَّأكيد؟ يُرجَى فحص صندوق الرَّسائل المُهمَلَة (Spam) أو محاولة تسجيل الدُّخول لإعادة الإرسال.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-500" id="register-container">
      <div className="text-center flex flex-col items-center">
        <img
          src="/shareek_logo.png"
          alt="Shareek Logo"
          className="w-24 h-24 object-contain mb-5"
        />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("title")}</h1>
      </div>

      <Card className="border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden" id="register-card">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8 pt-8">
            <div className="space-y-1.5">
              <Label htmlFor="register-fullname" className="font-bold text-slate-700">{t("fullName")}</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="register-fullname"
                  type="text"
                  className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm font-medium"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-username" className="font-bold text-slate-700">{t("username")}</Label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="register-username"
                  type="text"
                  className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm text-left font-mono"
                  placeholder="username_example"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().trim() }))}
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">أحرف إنجليزيَّة صغيرة، أرقام، أو شرطة سُفليَّة _</p>
              {usernameStatus.message && (
                <div className={`mt-1.5 text-xs text-right p-1.5 rounded-lg border font-medium ${
                  usernameStatus.loading 
                    ? "bg-slate-50 border-slate-100 text-slate-500 animate-pulse" 
                    : usernameStatus.available 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                      : "bg-rose-50 border-rose-100 text-rose-700"
                }`}>
                  {usernameStatus.loading ? "جاري التَّحقُّق من التَّوفُّر..." : usernameStatus.message}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-email" className="font-bold text-slate-700">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="register-email"
                  type="email"
                  className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-password" className="font-bold text-slate-700">{t("password")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="register-password"
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

              {formData.password.length > 0 && (() => {
                const strength = getPasswordStrength(formData.password);
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

            <div className="space-y-1.5">
              <Label htmlFor="register-confirm-password" className="font-bold text-slate-700">{t("confirmPassword")}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-11 pr-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl shadow-sm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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

            {/* Accept Privacy & Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1 font-arabic select-none">
              <button
                type="button"
                id="accept-terms-btn"
                onClick={() => setAcceptTerms(!acceptTerms)}
                className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-slate-600 font-bold hover:text-slate-850 transition-colors focus:outline-none group text-right"
              >
                <div className={`w-5 h-5 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-all duration-200 shrink-0 ${
                  acceptTerms 
                    ? "bg-primary border-primary shadow-md shadow-primary/20 scale-105" 
                    : "border-slate-300 bg-white group-hover:border-slate-400 group-focus:ring-2 group-focus:ring-primary/25"
                }`}>
                  {acceptTerms && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                </div>
                <span className="leading-relaxed text-right">
                  أوافق على{" "}
                  <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-black decoration-blue-200" onClick={(e) => e.stopPropagation()}>الشُّروط والأحكام</Link>
                  {" "}و{" "}
                  <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-black decoration-blue-200" onClick={(e) => e.stopPropagation()}>سياسة الخصوصيَّة</Link>
                </span>
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading} id="register-submit-btn">
              <UserPlus className="w-5 h-5 mr-2 shrink-0" />
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
    </div>
  );
}
