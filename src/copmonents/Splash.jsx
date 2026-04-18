/** @format */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/sign");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden"
      dir="rtl"
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-white/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[450px] h-[450px] bg-white/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[80px]" />

      {/* Main content */}
      <div className="flex flex-col items-center z-10">
        {/* Logo placeholder */}
        <div className="w-[120px] h-[120px] bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-white/20">
          <svg
            className="w-16 h-16 text-white/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* App name */}
        <h1
          className="text-[48px] font-[700] text-white tracking-tight mb-3"
          style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', 'Cairo', system-ui, sans-serif" }}
        >
          شريك
        </h1>

        {/* Tagline */}
        <p
          className="text-white/70 text-[16px] font-[500] leading-relaxed tracking-wide"
          style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', 'Cairo', system-ui, sans-serif" }}
        >
          منصتك الموثوقة للتعاون والشراكة
        </p>

        {/* Loading indicator */}
        <div className="mt-12 flex items-center gap-2">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
