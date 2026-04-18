/** @format */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Email,
  AlertCircle,
  ToastSuccess,
  ToastError,
  CloseIcon,
  LoadingSpinner,
  ArrowLeft,
} from "./Box";

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      className='fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[400px] animate-[slideDown_0.4s_cubic-bezier(0.4,0,0.2,1)]'
      dir='rtl'>
      <div
        className={`bg-white rounded-xl shadow-2xl border-r-4 overflow-hidden ${
          type === "success" ? "border-r-emerald-500" : "border-r-rose-500"
        }`}>
        <div className='p-4 flex items-center gap-3'>
          <div className='shrink-0'>
            {type === "success" ? (
              <ToastSuccess className='w-6 h-6 text-emerald-500' />
            ) : (
              <ToastError className='w-6 h-6 text-rose-500' />
            )}
          </div>

          <p
            className='flex-1 text-right text-slate-800 text-[15px] font-[500] leading-relaxed'
            style={{
              fontFamily:
                "'IBM Plex Sans Arabic', 'Tajawal', 'Cairo', system-ui, sans-serif",
            }}>
            {message}
          </p>

          <button
            onClick={onClose}
            className='shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200'
            aria-label='إغلاق'>
            <CloseIcon className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [errorId] = useState(
    () => `email-error-${Math.random().toString(36).slice(2)}`
  );
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast({ message: "", type: "" });
  };

  const validateEmailField = (value) => {
    if (!value) return "البريد الإلكتروني مطلوب";
    if (!validateEmail(value)) return "يرجى إدخال بريد إلكتروني صحيح";
    return "";
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) {
      setError(validateEmailField(e.target.value));
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    setError(validateEmailField(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const validationError = validateEmailField(trimmedEmail);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned HTML instead of JSON. Check the API Endpoint."
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "هذا البريد غير مسجل لدينا"
        );
      }

      showToast(
        data?.message || "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        "success"
      );
      setEmail("");
      setError("");
      setTouched(false);

      setTimeout(() => {
        navigate("/password-confirmation", {
          state: { email: trimmedEmail },
        });
      }, 800);
    } catch (err) {
      console.error("API Error:", err);
      showToast(err.message || "حدث خطأ. يرجى المحاولة مرة أخرى.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = () => {
    let base =
      "w-full h-[48px] pr-12 pl-4 border rounded-[12px] text-[16px] font-[500] leading-relaxed transition-all duration-200 bg-slate-50/80 text-slate-900 placeholder-slate-400";
    base +=
      " focus:outline-none focus:bg-white focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]";
    if (touched) {
      if (error) {
        base +=
          " border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)]";
      } else if (email) {
        base += " border-emerald-400 bg-emerald-50/30";
      } else {
        base += " border-slate-200";
      }
    } else {
      base += " border-slate-200/80";
    }
    return base;
  };

  return (
    <div
      className='min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/30'
      dir='rtl'>
      {/* Custom Toast */}
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Main Content */}
      <div className='flex-1 flex flex-col px-5 py-8 max-w-lg mx-auto w-full'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-[100px] h-[100px] mx-auto mb-6 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center'>
            <Email className='w-12 h-12 text-violet-600' />
          </div>
          <h1 className='text-[24px] font-[700] text-slate-900 tracking-tight mb-2 leading-relaxed'>
            نسيت كلمة المرور
          </h1>
          <p className='text-slate-500 text-[16px] leading-relaxed'>
            أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6'>
          <form
            className='space-y-5'
            onSubmit={handleSubmit}
            aria-label='استعادة كلمة المرور'>
            {/* Email */}
            <div>
              <label
                className='block text-[16px] font-semibold text-slate-700 mb-2'
                htmlFor='email'>
                البريد الإلكتروني
              </label>
              <div className='relative'>
                <span
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  aria-hidden='true'>
                  <Email className='w-5 h-5' />
                </span>
                <input
                  type='email'
                  id='email'
                  name='email'
                  className={getInputClass()}
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder='you@example.com'
                  autoComplete='email'
                  aria-invalid={touched && !!error}
                  aria-describedby={touched && error ? errorId : undefined}
                />
              </div>
              {touched && error && (
                <div
                  id={errorId}
                  role='alert'
                  className='flex items-center gap-1.5 mt-1.5 h-4'>
                  <AlertCircle
                    className='w-3.5 h-3.5 text-rose-500 shrink-0'
                    aria-hidden='true'
                  />
                  <span className='text-xs text-rose-500 font-medium'>
                    {error}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-[16px] font-[600] leading-relaxed rounded-[12px] shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center'
              disabled={isSubmitting}
              aria-busy={isSubmitting}>
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2.5'>
                  <span className='animate-spin'>
                    <LoadingSpinner className='h-5 w-5' />
                  </span>
                  جاري الإرسال...
                </span>
              ) : (
                "إرسال رمز التحقق"
              )}
            </button>
          </form>
        </div>

        {/* Back to Login Link */}
        <div className='mt-8 text-center'>
          <Link
            to='/login'
            className='inline-flex items-center gap-1.5 text-slate-500 text-[14px] font-[500] hover:text-violet-600 active:text-violet-700 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>

      {/* Animations */}
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
