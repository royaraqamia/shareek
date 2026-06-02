import type {Metadata} from 'next';
import './globals.css';
import { Inter, Tajawal } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppInitializer } from '@/components/AppInitializer';
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({ subsets: ['arabic'], weight: ['300', '400', '500', '700'], variable: '--font-tajawal' });

export const metadata: Metadata = {
  title: 'Shareek ERP',
  description: 'Business Management ERP',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${tajawal.variable}`}>
      <body suppressHydrationWarning>
        <AppInitializer>
          <Navigation />
          {children}
        </AppInitializer>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
