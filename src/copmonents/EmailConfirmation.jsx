/** @format */

// /** @format */

// import { useState, useEffect } from "react";
// import {
//   useNavigate,
//   useSearchParams,
//   useLocation,
//   Link,
// } from "react-router-dom";
// import {
//   CheckCircle,
//   AlertCircle,
//   ArrowLeft,
//   ToastSuccess,
//   ToastError,
//   CloseIcon,
//   LoadingSpinner,
// } from "./Box";

// // Custom Toast Component
// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   if (!message) return null;

//   return (
//     <div
//       className='fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[400px] animate-[slideDown_0.4s_cubic-bezier(0.4,0,0.2,1)]'
//       dir='rtl'>
//       <div
//         className={`bg-white rounded-xl shadow-2xl border-r-4 overflow-hidden ${
//           type === "success" ? "border-r-emerald-500" : "border-r-rose-500"
//         }`}>
//         <div className='p-4 flex items-center gap-3'>
//           <div className='shrink-0'>
//             {type === "success" ? (
//               <ToastSuccess className='w-6 h-6 text-emerald-500' />
//             ) : (
//               <ToastError className='w-6 h-6 text-rose-500' />
//             )}
//           </div>

//           <p
//             className='flex-1 text-right text-slate-800 text-[15px] font-[500] leading-relaxed'
//             style={{
//               fontFamily:
//                 "'IBM Plex Sans Arabic', 'Tajawal', 'Cairo', system-ui, sans-serif",
//             }}>
//             {message}
//           </p>

//           <button
//             onClick={onClose}
//             className='shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200'
//             aria-label='إغلاق'>
//             <CloseIcon className='w-5 h-5' />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function EmailConfirmation() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const type = searchParams.get("type") || "signup";

//   const [verificationCode, setVerificationCode] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [touched, setTouched] = useState(false);
//   const [toast, setToast] = useState({ message: "", type: "" });
//   const emailFromState = location.state?.email || "";
//   const showToast = (message, type) => {
//     setToast({ message, type });
//   };

//   const hideToast = () => {
//     setToast({ message: "", type: "" });
//   };

//   // Auto-submit when code is complete
//   useEffect(() => {
//     if (verificationCode.length === 6 && !isSubmitting) {
//       setTouched(true);
//       const validationError = validateCode(verificationCode);
//       if (!validationError) {
//         handleSubmit(new Event("submit"));
//       }
//     }
//   }, [verificationCode]);

//   const validateCode = (code) => {
//     if (!code) return "رمز التحقق مطلوب";
//     if (!/^\d{6}$/.test(code)) return "يرجى إدخال رمز التحقق المكون من 6 أرقام";
//     return "";
//   };

//   const handleBack = () => {
//     if (type === "signup") {
//       navigate("/signup");
//     } else {
//       navigate("/login");
//     }
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();

//     const validationError = validateCode(verificationCode);
//     if (validationError) {
//       setError(validationError);
//       setTouched(true);
//       showToast("يرجى تصحيح الأخطاء في النموذج", "error");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1500));
//       console.log("Verification code submitted:", verificationCode);
//       showToast("تم تأكيد بريدك الإلكتروني بنجاح!", "success");
//       setVerificationCode("");
//       setError("");
//       setTouched(false);

//       if (type === "reset") {
//         setTimeout(() => navigate("/password-confirmation"), 800);
//       } else {
//         setTimeout(() => navigate("/pending-approval"), 800);
//       }
//     } catch (err) {
//       showToast("فشل التحقق. يرجى المحاولة مرة أخرى.", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleResendCode = async () => {
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       console.log("Resending verification code...");
//       showToast("تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني", "success");
//     } catch (err) {
//       showToast("فشل إعادة الإرسال. يرجى المحاولة مرة أخرى.", "error");
//     }
//   };

//   const pageTitle =
//     type === "reset" ? "إعادة تعيين كلمة المرور" : "تأكيد البريد الإلكتروني";

//   const pageDescription =
//     type === "reset"
//       ? "أدخل رمز التحقق المرسل لبريدك الإلكتروني"
//       : "أدخل رمز التحقق المكون من 6 أرقام";

//   return (
//     <div
//       className='min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/30'
//       dir='rtl'>
//       {/* Custom Toast */}
//       {toast.message && (
//         <Toast message={toast.message} type={toast.type} onClose={hideToast} />
//       )}

//       {/* Main Content */}
//       <div className='flex-1 flex flex-col px-5 py-8 max-w-lg mx-auto w-full'>
//         {/* Header */}
//         <div className='text-center mb-8'>
//           <div className='w-[100px] h-[100px] mx-auto mb-6 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center'>
//             <CheckCircle className='w-12 h-12 text-violet-600' />
//           </div>
//           <h1 className='text-[24px] font-[700] text-slate-900 tracking-tight mb-2 leading-relaxed'>
//             {pageTitle}
//           </h1>
//           <p className='text-slate-500 text-[16px] leading-relaxed'>
//             {pageDescription}
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className='bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6'>
//           <form className='space-y-5' onSubmit={handleSubmit}>
//             {/* Verification Code */}
//             <div>
//               <label className='block text-[16px] font-semibold text-slate-700 mb-3 text-center'>
//                 رمز التحقق
//               </label>
//               <div className='flex justify-center gap-2.5' dir='ltr'>
//                 {[0, 1, 2, 3, 4, 5].map((index) => {
//                   const digit = verificationCode[index] || "";
//                   const isActive = verificationCode.length === index;
//                   const isFilled = index < verificationCode.length;

//                   let boxClass =
//                     "w-[52px] h-[60px] text-center text-[22px] font-[700] rounded-[14px] border-2 transition-all duration-200 outline-none bg-slate-50/80 text-slate-900 caret-violet-600";
//                   boxClass +=
//                     " focus:bg-white focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] focus:scale-105";

//                   if (touched && error) {
//                     boxClass += " border-rose-400 bg-rose-50/50";
//                   } else if (isActive) {
//                     boxClass +=
//                       " border-violet-400 bg-white scale-105 shadow-[0_0_0_3px_rgba(139,92,246,0.08)]";
//                   } else if (isFilled) {
//                     boxClass +=
//                       " border-emerald-400 bg-emerald-50/30 text-emerald-700";
//                   } else {
//                     boxClass += " border-slate-200/80";
//                   }

//                   return (
//                     <input
//                       key={index}
//                       type='text'
//                       inputMode='numeric'
//                       maxLength={1}
//                       value={digit}
//                       autoFocus={index === 0}
//                       onChange={(e) => {
//                         const val = e.target.value.replace(/[^0-9]/g, "");
//                         if (!val) return;
//                         const newCode = verificationCode.split("");
//                         newCode[index] = val;
//                         const code = newCode.join("").slice(0, 6);
//                         setVerificationCode(code);
//                         setError("");
//                         // Auto-focus next empty box
//                         if (index < 5) {
//                           const next =
//                             e.target.parentElement?.children[index + 1];
//                           if (next instanceof HTMLInputElement) next.focus();
//                         }
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.key === "Backspace") {
//                           e.preventDefault();
//                           const newCode = verificationCode.split("");
//                           if (newCode[index]) {
//                             // Delete current digit
//                             newCode[index] = "";
//                             setVerificationCode(newCode.join(""));
//                             setError("");
//                           } else if (index > 0) {
//                             // Move to previous box and delete
//                             newCode[index - 1] = "";
//                             setVerificationCode(newCode.join(""));
//                             setError("");
//                             const prev =
//                               e.target.parentElement?.children[index - 1];
//                             if (prev instanceof HTMLInputElement) prev.focus();
//                           }
//                         } else if (e.key === "ArrowLeft" && index < 5) {
//                           const next =
//                             e.target.parentElement?.children[index + 1];
//                           if (next instanceof HTMLInputElement) next.focus();
//                         } else if (e.key === "ArrowRight" && index > 0) {
//                           const prev =
//                             e.target.parentElement?.children[index - 1];
//                           if (prev instanceof HTMLInputElement) prev.focus();
//                         }
//                       }}
//                       onFocus={(e) => e.target.select()}
//                       className={boxClass}
//                       aria-label={`رقم ${index + 1}`}
//                     />
//                   );
//                 })}
//               </div>
//               {error && touched && (
//                 <div className='flex items-center justify-center gap-1.5 mt-3 animate-[fadeIn_0.3s_ease-out]'>
//                   <AlertCircle className='w-4 h-4 text-rose-500 shrink-0' />
//                   <span className='text-sm text-rose-500 font-[500]'>
//                     {error}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type='submit'
//               className='w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-[16px] font-[600] leading-relaxed rounded-[12px] shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center'
//               disabled={isSubmitting}>
//               {isSubmitting ? (
//                 <span className='flex items-center justify-center gap-2.5'>
//                   <span className='animate-spin'>
//                     <LoadingSpinner className='h-5 w-5' />
//                   </span>
//                   جاري التأكيد...
//                 </span>
//               ) : (
//                 "تأكيد"
//               )}
//             </button>
//           </form>
//         </div>

//         {/* Resend Code */}
//         <div className='mt-8 text-center'>
//           <p className='text-[14px] text-slate-500 leading-relaxed font-[500] mb-3'>
//             لم تستلم الرمز؟
//           </p>
//           <button
//             type='button'
//             className='h-[48px] bg-transparent border-2 border-violet-500 rounded-[12px] text-violet-600 text-[14px] font-[600] hover:bg-violet-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 px-6'
//             onClick={handleResendCode}
//             disabled={isSubmitting}>
//             إعادة الإرسال
//           </button>
//         </div>

//         {/* Back Link */}
//         <div className='mt-6 text-center'>
//           <Link
//             to={type === "signup" ? "/signup" : "/login"}
//             className='inline-flex items-center gap-1.5 text-slate-500 text-[14px] font-[500] hover:text-violet-600 active:text-violet-700 transition-colors'>
//             <ArrowLeft className='w-4 h-4' />
//             العودة
//           </Link>
//         </div>
//       </div>

//       {/* Animations */}
//       <style>{`
//                 @keyframes slideDown {
//                     from {
//                         transform: translateY(-100%);
//                         opacity: 0;
//                     }
//                     to {
//                         transform: translateY(0);
//                         opacity: 1;
//                     }
//                 }
//                 @keyframes fadeIn {
//                     from { opacity: 0; transform: translateY(-4px); }
//                     to { opacity: 1; transform: translateY(0); }
//                 }
//             `}</style>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ToastSuccess,
  ToastError,
  CloseIcon,
  LoadingSpinner,
} from "./Box";

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

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "signup";

  const emailFromState = location.state?.email || "";

  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast({ message: "", type: "" });
  };

  // Auto-submit when code is complete
  useEffect(() => {
    if (verificationCode.length === 6 && !isSubmitting) {
      setTouched(true);
      const validationError = validateCode(verificationCode);
      if (!validationError) {
        handleSubmit(new Event("submit"));
      }
    }
  }, [verificationCode]);

  const validateCode = (code) => {
    if (!code) return "رمز التحقق مطلوب";
    if (!/^\d{6}$/.test(code)) return "يرجى إدخال رمز التحقق المكون من 6 أرقام";
    return "";
  };

  //   const handleBack = () => {
  //     if (type === "signup") {
  //       navigate("/signup");
  //     } else {
  //       navigate("/login");
  //     }
  //   };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const validationError = validateCode(verificationCode);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/auth/verify-email`;

      const res = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          email: emailFromState, 
          otp: verificationCode 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "رمز التحقق غير صحيح");
      }

      showToast(data?.message || "تم تأكيد البريد الإلكتروني بنجاح!", "success");
      setVerificationCode("");
      setError("");
      setTouched(false);

      if (type === "reset") {
        setTimeout(() => navigate("/password-confirmation", { 
          state: { email: emailFromState } 
        }), 800);
      } else {
        setTimeout(() => navigate("/pending-approval"), 800);
      }
    } catch (err) {
      console.error("Verification Error:", err);
      showToast(err.message || "فشل التحقق. يرجى المحاولة مرة أخرى.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const endpoint = `${import.meta.env.VITE_API_URL}/auth/resend-otp`;

      const res = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: emailFromState }),
      });

      const data = await res.json();

      // Print resend OTP response for debugging
      console.log("════════════════════════════════════════");
      console.log("🔄 Resend OTP Response:", JSON.stringify(data, null, 2));
      if (data.otp) {
        console.log("🔑 New OTP sent to email:", data.otp);
      }
      console.log("════════════════════════════════════════");

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "فشل إعادة إرسال الرمز");
      }

      showToast(data?.message || "تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني", "success");
    } catch (err) {
      console.error("Resend Error:", err);
      showToast(err.message || "فشل إعادة الإرسال. يرجى المحاولة مرة أخرى.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle =
    type === "reset" ? "إعادة تعيين كلمة المرور" : "تأكيد البريد الإلكتروني";

  const pageDescription =
    type === "reset"
      ? "أدخل رمز التحقق المرسل لبريدك الإلكتروني"
      : "أدخل رمز التحقق المكون من 6 أرقام";

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
            <CheckCircle className='w-12 h-12 text-violet-600' />
          </div>
          <h1 className='text-[24px] font-[700] text-slate-900 tracking-tight mb-2 leading-relaxed'>
            {pageTitle}
          </h1>
          <p className='text-slate-500 text-[16px] leading-relaxed'>
            {pageDescription}
          </p>
          {emailFromState && type === "reset" && (
            <p
              className='text-violet-600 text-[14px] font-[500] mt-2 leading-relaxed'
              dir='ltr'>
              {emailFromState}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6'>
          <form className='space-y-5' onSubmit={handleSubmit}>
            {/* Verification Code */}
            <div>
              <label className='block text-[16px] font-semibold text-slate-700 mb-3 text-center'>
                رمز التحقق
              </label>
              <div className='flex justify-center gap-2.5' dir='ltr'>
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const digit = verificationCode[index] || "";
                  const isActive = verificationCode.length === index;
                  const isFilled = index < verificationCode.length;

                  let boxClass =
                    "w-[52px] h-[60px] text-center text-[22px] font-[700] rounded-[14px] border-2 transition-all duration-200 outline-none bg-slate-50/80 text-slate-900 caret-violet-600";
                  boxClass +=
                    " focus:bg-white focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] focus:scale-105";

                  if (touched && error) {
                    boxClass += " border-rose-400 bg-rose-50/50";
                  } else if (isActive) {
                    boxClass +=
                      " border-violet-400 bg-white scale-105 shadow-[0_0_0_3px_rgba(139,92,246,0.08)]";
                  } else if (isFilled) {
                    boxClass +=
                      " border-emerald-400 bg-emerald-50/30 text-emerald-700";
                  } else {
                    boxClass += " border-slate-200/80";
                  }

                  return (
                    <input
                      key={index}
                      type='text'
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (!val) return;
                        const newCode = verificationCode.split("");
                        newCode[index] = val;
                        const code = newCode.join("").slice(0, 6);
                        setVerificationCode(code);
                        setError("");
                        // Auto-focus next empty box
                        if (index < 5) {
                          const next =
                            e.target.parentElement?.children[index + 1];
                          if (next instanceof HTMLInputElement) next.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          e.preventDefault();
                          const newCode = verificationCode.split("");
                          if (newCode[index]) {
                            // Delete current digit
                            newCode[index] = "";
                            setVerificationCode(newCode.join(""));
                            setError("");
                          } else if (index > 0) {
                            // Move to previous box and delete
                            newCode[index - 1] = "";
                            setVerificationCode(newCode.join(""));
                            setError("");
                            const prev =
                              e.target.parentElement?.children[index - 1];
                            if (prev instanceof HTMLInputElement) prev.focus();
                          }
                        } else if (e.key === "ArrowLeft" && index < 5) {
                          const next =
                            e.target.parentElement?.children[index + 1];
                          if (next instanceof HTMLInputElement) next.focus();
                        } else if (e.key === "ArrowRight" && index > 0) {
                          const prev =
                            e.target.parentElement?.children[index - 1];
                          if (prev instanceof HTMLInputElement) prev.focus();
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      className={boxClass}
                      aria-label={`رقم ${index + 1}`}
                    />
                  );
                })}
              </div>
              {error && touched && (
                <div className='flex items-center justify-center gap-1.5 mt-3 animate-[fadeIn_0.3s_ease-out]'>
                  <AlertCircle className='w-4 h-4 text-rose-500 shrink-0' />
                  <span className='text-sm text-rose-500 font-[500]'>
                    {error}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-[16px] font-[600] leading-relaxed rounded-[12px] shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center'
              disabled={isSubmitting}>
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2.5'>
                  <span className='animate-spin'>
                    <LoadingSpinner className='h-5 w-5' />
                  </span>
                  جاري التأكيد...
                </span>
              ) : (
                "تأكيد"
              )}
            </button>
          </form>
        </div>

        {/* Resend Code */}
        <div className='mt-8 text-center'>
          <p className='text-[14px] text-slate-500 leading-relaxed font-[500] mb-3'>
            لم تستلم الرمز؟
          </p>
          <button
            type='button'
            className='h-[48px] bg-transparent border-2 border-violet-500 rounded-[12px] text-violet-600 text-[14px] font-[600] hover:bg-violet-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 px-6'
            onClick={handleResendCode}
            disabled={isSubmitting}>
            إعادة الإرسال
          </button>
        </div>

        {/* Back Link */}
        <div className='mt-6 text-center'>
          <Link
            to={type === "signup" ? "/signup" : "/login"}
            className='inline-flex items-center gap-1.5 text-slate-500 text-[14px] font-[500] hover:text-violet-600 active:text-violet-700 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            العودة
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
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
}
