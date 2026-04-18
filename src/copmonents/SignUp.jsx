/** @format */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Email, Lock, Eye, EyeClosed, UserType, AlertCircle, ToastSuccess, ToastError, CloseIcon, LoadingSpinner, CheckBadge, Crown, UserPerson } from "./Box";

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const USER_TYPES = ["مدير", "موظف"];

// Custom Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[400px] animate-[slideDown_0.4s_cubic-bezier(0.4,0,0.2,1)]"
      dir="rtl"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border-r-4 overflow-hidden ${type === "success" ? "border-r-emerald-500" : "border-r-rose-500"
          }`}
      >
        <div className="p-4 flex items-center gap-3">
          {/* Icon */}
          <div className="shrink-0">
            {type === "success" ? (
              <ToastSuccess className="w-6 h-6 text-emerald-500" />
            ) : (
              <ToastError className="w-6 h-6 text-rose-500" />
            )}
          </div>

          {/* Message */}
          <p
            className="flex-1 text-right text-slate-800 text-[15px] font-[500] leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', 'Cairo', system-ui, sans-serif" }}
          >
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            aria-label="إغلاق"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    userType: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast({ message: "", type: "" });
  };

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "الاسم الكامل مطلوب";
        if (value.trim().length < 2) return "يجب أن يكون الاسم حرفين على الأقل";
        break;
      case "userType":
        if (!value) return "يرجى اختيار نوع المستخدم";
        break;
      case "email":
        if (!value) return "البريد الإلكتروني مطلوب";
        if (!validateEmail(value)) return "يرجى إدخال بريد إلكتروني صحيح";
        break;
      case "password":
        if (!value) return "كلمة المرور مطلوبة";
        if (!validatePassword(value)) return "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
        break;
      case "confirmPassword":
        if (!value) return "يرجى تأكيد كلمة المرور";
        if (value !== formData.password) return "كلمتا المرور غير متطابقتين";
        break;
      default:
        break;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
    if (name === "confirmPassword" && formData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.password ? "كلمتا المرور غير متطابقتين" : "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(msg || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.");
      }

      showToast(data?.message || "تم إنشاء الحساب! تحقق من بريدك الإلكتروني.", "success");
      setFormData({ fullName: "", userType: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
      setTouched({});
      setTimeout(() => navigate("/verify-email?type=signup", { state: { email: formData.email } }), 800);
    } catch (err) {
      showToast(err.message || "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    let base =
      "w-full h-[48px] pr-12 pl-4 border rounded-[12px] text-[16px] font-[500] leading-relaxed transition-all duration-200 bg-slate-50/80 text-slate-900 placeholder-slate-400";
    base += " focus:outline-none focus:bg-white focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]";
    if (touched[fieldName]) {
      if (errors[fieldName]) {
        base += " border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)]";
      } else if (formData[fieldName]) {
        base += " border-emerald-400 bg-emerald-50/30";
      } else {
        base += " border-slate-200";
      }
    } else {
      base += " border-slate-200/80";
    }
    return base;
  };

  const ErrorMsg = ({ message }) => {
    if (!message) return <div className="h-4" />;
    return (
      <div className="flex items-center gap-1.5 mt-1.5 h-4">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span className="text-xs text-rose-500 font-medium">{message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/30" dir="rtl">
      {/* Custom Toast */}
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 py-8 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-[700] text-slate-900 tracking-tight mb-2 leading-relaxed">
            إنشاء حساب جديد
          </h1>
          <p className="text-slate-500 text-[16px] leading-relaxed">
            انضم إلى شَريك وابدأ رحلتك
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="fullName">
                الاسم الكامل
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={getInputClass("fullName")}
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="أدخل اسمك الكامل"
                  autoComplete="name"
                />
              </div>
              <ErrorMsg message={touched.fullName ? errors.fullName : ""} />
            </div>

            {/* User Type */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-3 leading-relaxed">
                نوع المستخدم
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "مدير", label: "مدير", icon: Crown, desc: "إدارة كاملة للنظام" },
                  { value: "موظف", label: "موظف", icon: UserPerson, desc: "صلاحيات محدودة" }
                ].map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${formData.userType === type.value
                        ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={formData.userType === type.value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="sr-only"
                      />
                      <IconComponent className={`w-8 h-8 mb-2 ${formData.userType === type.value ? "text-violet-600" : "text-slate-400"
                        }`} />
                      <span className={`text-[15px] font-[600] mb-1 ${formData.userType === type.value ? "text-violet-700" : "text-slate-700"
                        }`}>
                        {type.label}
                      </span>
                      <span className={`text-xs ${formData.userType === type.value ? "text-violet-600" : "text-slate-500"
                        }`}>
                        {type.desc}
                      </span>
                      {formData.userType === type.value && (
                        <div className="absolute top-2 left-2">
                          <CheckBadge className="w-5 h-5 text-violet-500" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              <ErrorMsg message={touched.userType ? errors.userType : ""} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="email">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Email className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={getInputClass("email")}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <ErrorMsg message={touched.email ? errors.email : ""} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="password">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={getInputClass("password") + " pl-11"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="8 أحرف على الأقل"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 active:scale-95 transition-all p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="تبديل ظهور كلمة المرور"
                >
                  {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <ErrorMsg message={touched.password ? errors.password : ""} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="confirmPassword">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={getInputClass("confirmPassword") + " pl-11"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="أعد إدخال كلمة المرور"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 active:scale-95 transition-all p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="تبديل ظهور تأكيد كلمة المرور"
                >
                  {showConfirmPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <ErrorMsg message={touched.confirmPassword ? errors.confirmPassword : ""} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-[16px] font-[600] leading-relaxed rounded-[12px] shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 mt-2 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="animate-spin">
                    <LoadingSpinner className="h-5 w-5" />
                  </span>
                  جاري إنشاء الحساب...
                </span>
              ) : (
                "إنشاء الحساب"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[14px] text-slate-500 leading-relaxed font-[500]">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              className="text-violet-600 font-[500] hover:text-violet-700 active:text-violet-800 transition-colors"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center px-4">
          <p className="text-xs text-slate-500 leading-relaxed font-[500]">
            بإنشاء حساب، فإنك توافق على{" "}
            <a href="#" className="text-slate-700 underline underline-offset-2 hover:text-violet-600 font-[500]">
              شروط الخدمة
            </a>{" "}
            و{" "}
            <a href="#" className="text-slate-700 underline underline-offset-2 hover:text-violet-600 font-[500]">
              سياسة الخصوصية
            </a>
          </p>
        </div>
      </div>

      {/* Toast Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}