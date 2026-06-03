import type {Metadata} from 'next';
import './globals.css';
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppInitializer } from '@/components/AppInitializer';
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/Navigation";
import { PwaRegister } from "@/components/PwaRegister";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ 
  subsets: ['arabic'], 
  weight: ['300', '400', '500', '600', '700'], 
  variable: '--font-ibm-plex-sans-arabic' 
});

export const metadata: Metadata = {
  title: 'شَريك',
  description: '',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'شَريك',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${ibmPlexSansArabic.variable}`}>
      <body suppressHydrationWarning>
        <AppInitializer>
          <PwaRegister />
          <Navigation />
          {children}
        </AppInitializer>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
