'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, signOutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Hourglass, LogOut, RefreshCw, RefreshCcw, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const language = useAppStore(state => state.language);
  const router = useRouter();
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState<{
    authenticated: boolean;
    isApproved: boolean;
    isPlatform: boolean;
    fullName?: string;
    username?: string;
  }>({
    authenticated: false,
    isApproved: false,
    isPlatform: false,
  });

  const checkUserStatus = async () => {
    try {
      const res = await getUser();
      if (res.success && res.user) {
        setUserState({
          authenticated: true,
          isApproved: !!res.is_approved,
          isPlatform: !!res.isPlatformAdmin,
          fullName: res.fullName,
          username: res.username
        });
      } else {
        setUserState({
          authenticated: false,
          isApproved: false,
          isPlatform: false,
        });
      }
    } catch {
      setUserState({
        authenticated: false,
        isApproved: false,
        isPlatform: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    // Check status on mount and on route changes to ensure instant protection
    checkUserStatus();
  }, [pathname]);

  const handleLogoutInWait = async () => {
    try {
      const res = await signOutAction();
      if (res.success) {
        toast.success('تمَّ تسجيل الخروج');
        setUserState({ authenticated: false, isApproved: false, isPlatform: false });
        router.push('/auth/login');
      } else {
        toast.error('فشل تسجيل الخروج');
      }
    } catch {
      toast.error('حدث خطأ');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen opacity-0" />; // hide until initialized to prevent hydration mismatch for RTL
  }

  // Bypass waiting approval gate on login, registration, or landing pages
  const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/';
  const showWaitingScreen = userState.authenticated && !userState.isApproved && !userState.isPlatform && !isAuthRoute;

  if (loading && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-arabic">جاري مراجعة صلاحيات الوصول والتحقق...</p>
      </div>
    );
  }

  if (showWaitingScreen) {
    return (
      <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased ${language === 'ar' ? 'font-arabic' : 'font-english'}`}>
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-8 text-center space-y-8 animate-fade-in">
          {/* Header Graphic */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full border border-amber-200/50 mb-4 animate-pulse">
              <Hourglass className="w-10 h-10 text-amber-600" />
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold font-mono">!</span>
            </div>
            
            <div className="flex items-center gap-2 border border-slate-100 bg-slate-50 py-1 px-3.5 rounded-full text-xs text-slate-600 mb-2 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>مرحبًا، {userState.fullName || "شريك جديد"} 👋</span>
              {userState.username && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-slate-500">@{userState.username}</span>
                </>
              )}
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              الحساب قيد المراجعة والموافقة
            </h1>
          </div>

          {/* Description Block */}
          <div className="space-y-3.5 text-right bg-slate-50 border border-slate-100 p-5 rounded-xl text-slate-600 text-sm leading-relaxed">
            <p className="font-bold text-slate-800 text-center">أهلاً بك في منصة شريك (Shareek ERP)</p>
            <p>لقد تمَّ إنشاء مؤسستك وحسابك بنجاح. لأسباب أمنية وتنظيمية، يتطلب تفعيل الحساب موافقة مسبقة من الإدارة العامة للمنصة.</p>
            <p className="text-[12px] text-slate-500">ملاحظة: يمكنك التواصل مباشرة مع مسؤولي النظام لسرعة تفعيل الحساب أو الاستفسار.</p>
          </div>

          {/* Actions Button Group */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 shadow-md shadow-blue-500/10 cursor-pointer"
              onClick={() => {
                setLoading(true);
                checkUserStatus();
              }}
            >
              <RefreshCw className="w-4 h-4 ml-2 animate-spin-slow" />
              تحديث وحالة الموافقة
            </Button>
            
            <Button 
              variant="outline"
              className="px-6 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white border border-red-100 h-11 font-semibold cursor-pointer"
              onClick={handleLogoutInWait}
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`font-sans antialiased bg-slate-50 relative ${language === 'ar' ? 'font-arabic' : 'font-english'}`}>
      <main className="min-h-screen pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
