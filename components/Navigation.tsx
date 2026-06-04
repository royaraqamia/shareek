'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Package, 
  Settings as SettingsIcon, 
  Building2, 
  LogOut,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getUser, signOutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';
import { GlobalSearch } from './GlobalSearch';

const MENU_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, labelAr: 'لوحة القيادة' },
  { href: '/inventory', icon: Package, labelAr: 'المخزون' },
  { href: '/transactions', icon: Receipt, labelAr: 'المعاملات' },
  { href: '/contacts', icon: Users, labelAr: 'العلاقات' },
  { href: '/tasks', icon: ClipboardList, labelAr: 'المهام' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const language = useAppStore(state => state.language);
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);
  const [profile, setProfile] = useState<{ 
    fullName?: string; 
    email?: string; 
    role?: string; 
    isPlatformAdmin?: boolean;
    isApproved?: boolean;
    isEmailConfirmed?: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await getUser();
      if (res.success && res.fullName) {
        setProfile({
          fullName: res.fullName,
          email: res.email,
          role: res.role,
          isPlatformAdmin: !!res.isPlatformAdmin,
          isApproved: !!res.is_approved,
          isEmailConfirmed: !!res.isEmailConfirmed,
        });
      } else {
        setProfile(null);
      }
    }
    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await signOutAction();
      if (res.success) {
        toast.success('تمَّ تسجيل الخروج بنجاح');
        setProfile(null);
        router.push('/auth/login');
      } else {
        toast.error('حدث خطأ أثناء تسجيل الخروج');
      }
    } catch {
      toast.error('حدث خطأ غير مُتوقَّع');
    }
  };

  const showMenuItems = profile && (profile.isPlatformAdmin || (profile.isApproved && profile.isEmailConfirmed));

  return (
    <>
      {/* Top Header - Unified for Desktop & Mobile */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950/75 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="container max-w-[90rem] mx-auto px-4 md:px-8 h-[4.5rem] flex items-center justify-between">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/shareek_logo.png"
                alt="Shareek ERP Logo"
                className="w-11 h-11 object-contain transition-transform group-hover:scale-105 group-active:scale-95"
              />
              <span className="font-extrabold text-xl text-slate-900 dark:text-slate-50 tracking-tight block">
                شَريك
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {showMenuItems && MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative cursor-pointer",
                      isActive 
                        ? "bg-slate-900/5 dark:bg-slate-800 text-primary dark:text-blue-400 font-bold shadow-inner" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400 opacity-70 group-hover:opacity-100")} />
                    <span>{item.labelAr}</span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-3 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

           {/* Profile & End Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center h-10 w-10 shadow-sm"
              title={theme === 'dark' ? 'المظهر النَّهاري' : 'المظهر الليلي'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500 animate-[spin_12s_linear_infinite]" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {profile ? (
              <>
                <GlobalSearch />
                
                {/* Desktop Profile Status */}
                <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 py-1.5 px-4 rounded-full text-xs shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="font-bold tracking-tight">{profile.fullName}</span>
                  </div>

                  {/* Status Badges */}
                  {!profile.isPlatformAdmin && !profile.isEmailConfirmed && (
                    <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100/60 dark:border-red-900/40 px-2 py-0.5 rounded text-[10px] font-bold" id="badge-email-req">
                      تأكيد البريد مطلوب ✉️
                    </span>
                  )}
                  {!profile.isPlatformAdmin && profile.isEmailConfirmed && !profile.isApproved && (
                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40 px-2 py-0.5 rounded text-[10px] font-bold" id="badge-appr-pen">
                      بانتظار موافقة الإدارة ⏳
                    </span>
                  )}
                  {!profile.isPlatformAdmin && profile.isEmailConfirmed && profile.isApproved && (
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-bold" id="badge-act">
                      حساب نشط ✅
                    </span>
                  )}

                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button 
                    onClick={handleLogout} 
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3" />
                    <span>خروج</span>
                  </button>
                </div>

                {/* Mobile Profile Display */}
                <div className="sm:hidden flex items-center gap-2">
                  {!profile.isPlatformAdmin && !profile.isEmailConfirmed && (
                    <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100/60 dark:border-red-900/40 px-2 py-1 rounded text-[10px] font-bold" id="badge-email-req-mb">
                      بريد غير مُؤكَّد ✉️
                    </span>
                  )}
                  {!profile.isPlatformAdmin && profile.isEmailConfirmed && !profile.isApproved && (
                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40 px-2 py-1 rounded text-[10px] font-bold animate-pulse" id="badge-appr-pen-mb">
                      بانتظار الموافقة ⏳
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 text-xs px-2.5 h-8 font-semibold cursor-pointer border border-red-100/40 dark:border-red-900/40 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5 ml-1" />
                    <span>خروج</span>
                  </Button>
                </div>
              </>
            ) : (
              !(pathname?.startsWith('/auth/login') || pathname?.startsWith('/auth/register')) && (
                <Link href="/auth/login">
                  <Button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2 h-10 rounded-xl cursor-pointer border-none shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                    تسجيل الدُّخول
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* Fixed Bottom Navigation Bar - Mobile ONLY (`md:hidden`) */}
      {showMenuItems && (
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 h-16 flex items-center justify-around px-2 z-40 md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.4)] pb-safe">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all cursor-pointer relative",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400 stroke-[2.2px]" : "text-slate-500")} />
                </div>
                <span className={cn(
                  "text-[10px] tracking-tight font-bold",
                  isActive ? "text-blue-600 dark:text-blue-400 font-extrabold" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.labelAr}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
