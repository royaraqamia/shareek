'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Cookie, Shield, X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or declined cookies
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("shareek_cookies_accepted");
      if (!consent) {
        // Show banner after 2 seconds for pleasant entry
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("shareek_cookies_accepted", "true");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("shareek_cookies_accepted", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl p-6 rounded-3xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 font-arabic"
      id="cookie-consent-banner"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
          <Cookie className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1 text-right">
          <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
            ملفَّات تعريف الارتباط (Cookies) 🍪
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            نحن نستخدم ملفَّات تعريف الارتباط والتِّقنيات المُشابهة لتحسين تجربتك، وضمان أمان اتِّصالك، وتقديم ميِّزات تُناسب احتياجاتك.
          </p>
        </div>
        <button 
          onClick={handleDecline}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2.5 mt-5">
        <Button 
          onClick={handleAccept}
          className="flex-1 bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-bold h-10 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Check className="w-4 h-4 ml-1.5 shrink-0" />
          قبول
        </Button>
        <Button 
          variant="outline"
          onClick={handleDecline}
          className="border-slate-200 hover:bg-slate-50 text-slate-500 text-xs sm:text-sm font-bold h-10 rounded-xl"
        >
          رفض
        </Button>
      </div>
    </div>
  );
}
