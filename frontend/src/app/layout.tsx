import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'آکادمی ریاضی | آموزش ریاضیات کنکور',
    template: '%s | آکادمی ریاضی',
  },
  description: 'آموزش آنلاین ریاضیات دبیرستان و کنکور - دوره‌های ویدیویی مفهومی ریاضی دهم، یازدهم، دوازدهم و آمادگی کنکور',
  keywords: ['آموزش ریاضی', 'کنکور ریاضی', 'ریاضیات دبیرستان', 'آمادگی کنکور', 'ریاضی نهایی', 'آموزش آنلاین'],
  authors: [{ name: 'آکادمی ریاضی' }],
  creator: 'آکادمی ریاضی',
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'آکادمی ریاضی',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
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
