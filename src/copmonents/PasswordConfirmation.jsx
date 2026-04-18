/** @format */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeClosed, AlertCircle, ToastSuccess, ToastError, CloseIcon, LoadingSpinner, ArrowLeft, Email } from "./Box";

const validatePassword = (password) => {
  return password.length >= 8;
};

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

export default function PasswordConfirmation() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const countdownRef = useRef(null);

  // Email is passed via location.state from ForgotPassword page
  const email = location.state?.email || "";

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast({ message: "", type: "" });
  };

  const validateField = (name, value) => {
    switch (name) {
      case "otp":
        if (!value) return "رمز التحقق مطلوب";
        if (!/^\d{6}$/.test(value)) return "رمز التحقق يجب أن يكون 6 أرقام";
        break;
      case "newPassword":
        if (!value) return "كلمة المرور مطلوبة";
        if (!validatePassword(value)) return "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
        break;
      case "confirmNewPassword":
        if (!value) return "يرجى تأكيد كلمة المرور";
        if (value !== formData.newPassword) return "كلمتا المرور غير متطابقتين";
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
    if (name === "confirmNewPassword" && formData.newPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmNewPassword: value !== formData.newPassword ? "كلمتا المرور غير متطابقتين" : "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResendingOtp(true);
    try {
      const res = await fetch("${import.meta.env.VITE_API_URL}/auth/forgot-password", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "فشل إعادة إرسال الرمز");
      }

      showToast("تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني", "success");

      setCountdown(60);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      showToast(err.message || "حدث خطأ. يرجى المحاولة مرة أخرى.", "error");
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

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
      const res = await fetch("${import.meta.env.VITE_API_URL}/auth/reset-password", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(msg || "فشل إعادة تعيين كلمة المرور");
      }

      showToast(data?.message || "تم إعادة تعيين كلمة المرور بنجاح!", "success");
      setFormData({ otp: "", newPassword: "", confirmNewPassword: "" });
      setErrors({});
      setTouched({});
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showToast(err.message || "فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.", "error");
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
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-slate-500 text-[16px] leading-relaxed">
            أدخل كلمة المرور الجديدة أدناه
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Email Display */}
            {email && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-slate-600 text-[14px]">
                  <Email className="w-4 h-4" />
                  <span>{email}</span>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="otp">
                رمز التحقق (6 أرقام)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  className={getInputClass("otp")}
                  value={formData.otp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="أدخل رمز التحقق المكون من 6 أرقام"
                  autoComplete="one-time-code"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
              <ErrorMsg message={touched.otp ? errors.otp : ""} />

              {/* Resend OTP */}
              <div className="mt-2 text-left">
                <button
                  type="button"
                  className="text-[13px] text-violet-600 hover:text-violet-700 font-[500] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp || countdown > 0}
                >
                  {isResendingOtp ? (
                    <span className="flex items-center gap-1.5">
                      <span className="animate-spin">
                        <LoadingSpinner className="h-3.5 w-3.5 inline" />
                      </span>
                      جاري الإرسال...
                    </span>
                  ) : countdown > 0 ? (
                    `إعادة إرسال الرمز (${countdown}s)`
                  ) : (
                    "إعادة إرسال رمز التحقق"
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="newPassword">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  className={getInputClass("newPassword") + " pl-11"}
                  value={formData.newPassword}
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
              <ErrorMsg message={touched.newPassword ? errors.newPassword : ""} />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[16px] font-[500] text-slate-700 mb-2 leading-relaxed" htmlFor="confirmNewPassword">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  className={getInputClass("confirmNewPassword") + " pl-11"}
                  value={formData.confirmNewPassword}
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
              <ErrorMsg message={touched.confirmNewPassword ? errors.confirmNewPassword : ""} />
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
                  جاري إعادة التعيين...
                </span>
              ) : (
                "إعادة تعيين"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[14px] text-violet-600 font-[500] leading-relaxed hover:text-violet-700 active:text-violet-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة إلى تسجيل الدخول
          </Link>
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
