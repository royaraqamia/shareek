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
  LogOut 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getUser, signOutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MENU_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, labelAr: 'لوحة القيادة' },
  { href: '/inventory', icon: Package, labelAr: 'المخزون' },
  { href: '/transactions', icon: Receipt, labelAr: 'المعاملات' },
  { href: '/contacts', icon: Users, labelAr: 'جهات الاتصال' },
  { href: '/settings', icon: SettingsIcon, labelAr: 'الإعدادات' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const language = useAppStore(state => state.language);
  const [profile, setProfile] = useState<{ fullName?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await getUser();
      if (res.success && res.fullName) {
        setProfile({
          fullName: res.fullName,
          email: res.email,
          role: res.role,
        });
      }
    }
    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await signOutAction();
      if (res.success) {
        toast.success('تم تسجيل الخروج بنجاح');
        setProfile(null);
        router.push('/auth/login');
      } else {
        toast.error('حدث خطأ أثناء تسجيل الخروج');
      }
    } catch {
      toast.error('حدث خطأ غير متوقع');
    }
  };

  return (
    <>
      {/* Top Header - Unified for Desktop & Mobile */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm cursor-pointer border border-blue-500/10">
                <span className="text-white font-black text-xl leading-none">ش</span>
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block">
                شريك <span className="text-blue-600 font-normal">ERP</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative cursor-pointer",
                      isActive 
                        ? "bg-slate-100 text-blue-600 font-bold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
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
            {profile ? (
              <>
                {/* Desktop Profile Status */}
                <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 px-3.5 rounded-full text-xs">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                    <span className="font-bold">{profile.fullName}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <button 
                    onClick={handleLogout} 
                    className="text-red-500 hover:text-red-700 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3" />
                    <span>خروج</span>
                  </button>
                </div>

                {/* Mobile Profile Display */}
                <div className="sm:hidden flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs px-2.5 h-8 font-semibold cursor-pointer border border-red-100/40 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5 ml-1" />
                    <span>خروج</span>
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 h-8 rounded-lg cursor-pointer border-none shadow-sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Fixed Bottom Navigation Bar - Mobile ONLY (`md:hidden`) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-2 z-40 md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-safe">
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
                  ? "text-blue-600" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-blue-50 text-blue-600" : "text-slate-400"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600 stroke-[2.2px]" : "text-slate-500")} />
              </div>
              <span className={cn(
                "text-[10px] tracking-tight font-bold",
                isActive ? "text-blue-600 font-extrabold" : "text-slate-500"
              )}>
                {item.labelAr}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
