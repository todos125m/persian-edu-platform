import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'آکادمی آموزش | یادگیری آنلاین',
    template: '%s | آکادمی آموزش',
  },
  description: 'پلتفرم آموزش آنلاین فارسی - دوره‌های ویدیویی حرفه‌ای برنامه‌نویسی، طراحی و کسب‌وکار',
  keywords: ['آموزش آنلاین', 'دوره برنامه‌نویسی', 'آموزش فارسی', 'یادگیری'],
  authors: [{ name: 'آکادمی آموزش' }],
  creator: 'آکادمی آموزش',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'آکادمی آموزش',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <ToastContainer
            position="top-left"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Providers>
      </body>
    </html>
  );
}
