'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuthStore } from '@/store/authStore';

// Routes that have their own layout (no main Header/Footer)
const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/admin'];
const noLayoutPrefixes = ['/admin', '/dashboard'];

function CookieSync() {
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      document.cookie = 'token=; path=/; max-age=0';
    }
  }, [token, isAuthenticated]);

  return null;
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideLayout =
    noLayoutRoutes.includes(pathname) ||
    noLayoutPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      <CookieSync />
      {!hideLayout && <Header />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
