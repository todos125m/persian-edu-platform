'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

const routeLabels: Record<string, string> = {
  admin: 'مدیریت',
  courses: 'دوره‌ها',
  users: 'کاربران',
  orders: 'سفارش‌ها',
  payments: 'مالی',
  categories: 'دسته‌بندی‌ها',
  settings: 'تنظیمات',
  preview: 'پیش‌نمایش',
  new: 'جدید',
  edit: 'ویرایش',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
      {crumbs.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400" />}
          {crumb.isLast ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.path}
              className="hover:text-primary-600 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
