/** @format */

import { useNavigate, Link } from "react-router-dom";
import signImage from "../assets/sign.png";

export default function Sign() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/30" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 py-8 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[32px] font-[700] bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2 leading-relaxed">
            شريك
          </h1>
          <p className="text-slate-500 text-[15px] leading-relaxed">
            منصتك الموثوقة للتعاون والشراكة
          </p>
        </div>

        {/* Image Section */}
        <div className="flex justify-center">
          <img
            src={signImage}
            alt="شريك - التعاون والشراكة"
            className="w-[420px] h-auto"
          />
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full h-[48px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-[16px] font-[600] leading-relaxed rounded-[12px] shadow-lg shadow-violet-500/25 transition-all duration-200"
          >
            تسجيل الدخول
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full h-[48px] bg-transparent border-2 border-violet-500 rounded-[12px] text-violet-600 text-[16px] font-[600] leading-relaxed hover:bg-violet-50 active:scale-[0.98] transition-all duration-200"
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-[30px] pt-5 border-t border-slate-200">
          <p className="text-[12px] text-slate-500 leading-relaxed">
            بالتسجيل، فإنك توافق على{" "}
            <Link
              to="/terms"
              className="text-violet-600 no-underline hover:text-violet-700 font-[500] transition-colors"
            >
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link
              to="/privacy"
              className="text-violet-600 no-underline hover:text-violet-700 font-[500] transition-colors"
            >
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}