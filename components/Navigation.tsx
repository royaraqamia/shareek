'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Receipt, Package, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const MENU_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelAr: 'لوحة القيادة' },
  { href: '/inventory', icon: Package, labelEn: 'Inventory', labelAr: 'المخزون' },
  { href: '/transactions', icon: Receipt, labelEn: 'Transactions', labelAr: 'المعاملات' },
  { href: '/contacts', icon: Users, labelEn: 'Contacts', labelAr: 'جهات الاتصال' },
  { href: '/settings', icon: SettingsIcon, labelEn: 'Settings', labelAr: 'الإعدادات' },
];

export function Navigation() {
  const pathname = usePathname();
  const language = useAppStore(state => state.language);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 mx-auto md:px-8">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg leading-none mt-1">S</span>
              </div>
              <span className="hidden font-bold sm:inline-block ms-2">
                Shareek ERP
              </span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80 font-medium text-sm",
                    pathname?.startsWith(item.href) ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </header>
  );
}
