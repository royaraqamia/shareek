'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { signUpAction, checkUsernameAction } from "@/features/auth/actions";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, User, Building, UserPlus, Sparkles, AtSign, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const translations = {
  title: {
    ar: "إنشاء حساب جديد"
  },
  fullName: {
    ar: "اسمك الكامل"
  },
  username: {
    ar: "اسم المستخدم (فريد بالإنجليزية)"
  },
  organizationName: {
    ar: "اسم المشروع / الشَّركة"
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
    organizationName: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registerSuccessInfo, setRegisterSuccessInfo] = useState({
    email: "",
    fullName: "",
    orgName: "",
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
        message: "أحرف إنجليزية صغيرة، أرقام، أو شرطة سفلية (_) فقط." 
      });
      return;
    }

    async function verify() {
      setUsernameStatus(prev => ({ ...prev, loading: true }));
      try {
        const res = await checkUsernameAction(debouncedUsername);
        if (res.success) {
          setUsernameStatus({ loading: false, available: true, message: "اسم المستخدم هذا متاح ومطابق للشروط! ✅" });
        } else {
          setUsernameStatus({ loading: false, available: false, message: res.message || "غير متاح." });
        }
      } catch {
        setUsernameStatus({ loading: false, available: false, message: "فشل التحقق." });
      }
    }
    verify();
  }, [debouncedUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus.available === false) {
      toast.error("يُرجى تصحيح اسم المستخدم أو اختيار اسم مستخدم متاح قبل المتابعة.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUpAction(formData);
      if (result.success) {
        setRegisterSuccessInfo({
          email: formData.email,
          fullName: formData.fullName,
          orgName: formData.organizationName,
          username: formData.username
        });
        setIsSuccess(true);
        toast.success("تمَّ إنشاء حسابك بنجاح! بانتظار تفعيل البريد الإلكتروني.");
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
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 mb-4 shadow-md border border-blue-500/10">
            <span className="text-white font-black text-2xl leading-none pt-1">ش</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">شريك لتطوير الأعمال</h1>
        </div>

        <Card className="border-slate-200/80 shadow-2xl overflow-hidden" id="register-success-card">
          <div className="bg-emerald-50 border-b border-emerald-100 py-6 px-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900">تمَّ إنشاء حسابك بنجاح! 🎉</h2>
            <p className="text-sm text-emerald-700/90 mt-1">المؤسسة والحساب جاهزة وقيد التنشيط مسبقاً</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-4 text-right">
              <p className="text-sm text-slate-600 leading-relaxed">
                أهلاً بك يا <strong>{registerSuccessInfo.fullName}</strong> في منصة شريك لإدارة وتطوير الأعمال. 
              </p>

              <div className="border border-blue-100 bg-blue-50/50 p-5 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-white pb-2 text-xs">
                  <span className="font-semibold text-blue-900">بيانات حسابك المسجل:</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-xs text-slate-500">البريد الإلكتروني:</span>
                  <span className="font-semibold font-mono text-xs">{registerSuccessInfo.email}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-xs text-slate-500">اسم المستخدم:</span>
                  <span className="font-semibold font-mono text-xs">@{registerSuccessInfo.username}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-xs text-slate-500">اسم المنشأة/الشركة:</span>
                  <span className="font-semibold text-xs">{registerSuccessInfo.orgName}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-800 text-center text-xs">📌 ما هي الخطوة القادمة؟</div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">١</span>
                  <p>تفقد بريدك الإلكتروني الآن، ستجد رسالة من <strong>Shareek ERP</strong> تحتوى على رابط تأكيد البريد.</p>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">٢</span>
                  <p>اضغط على رابط تأكيد البريد الإلكتروني وسيتم تحويلك تلقائياً إلى لوحة القيادة لتفعيل الشركة.</p>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">٣</span>
                  <p>يقوم المشرفون العامون بمطابقة وتفعيل حسابك ماليًا وتجاريًا مسبقاً لبدء العمل.</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-slate-100/60 p-6 flex flex-col gap-4">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 shadow-md">
                الانتقال إلى صفحة تسجيل الدخول
              </Button>
            </Link>
            <p className="text-xs text-slate-400 text-center">
              لم تصلك رسالة التأكيد؟ يرجى فحص ملف الرسائل المهملة (Spam) أو محاولة تسجيل الدخول لإعادة الإرسال.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6" id="register-container">
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 mb-4 shadow-md border border-blue-500/10">
          <span className="text-white font-black text-2xl leading-none pt-1">ش</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("title")}</h1>
      </div>

      <Card className="border-slate-200/80 shadow-lg" id="register-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <CardDescription className="text-slate-500 text-right">
              أدخل كافَّة الحقول التَّالية لإنشاء حسابك
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
              <Label htmlFor="register-username">{t("username")}</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  id="register-username"
                  type="text"
                  className="pl-10 text-left font-mono"
                  placeholder="username_example"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().trim() }))}
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">أحرف إنجليزية صغيرة، أرقام، أو شرطة سفلية _</p>
              {usernameStatus.message && (
                <div className={`mt-1.5 text-xs text-right p-1.5 rounded-lg border font-medium ${
                  usernameStatus.loading 
                    ? "bg-slate-50 border-slate-100 text-slate-500 animate-pulse" 
                    : usernameStatus.available 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                      : "bg-rose-50 border-rose-100 text-rose-700"
                }`}>
                  {usernameStatus.loading ? "جاري التحقق من التوفر..." : usernameStatus.message}
                </div>
              )}
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
    </div>
  );
}
