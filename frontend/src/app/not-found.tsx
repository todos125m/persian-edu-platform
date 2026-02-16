import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary-600 mb-4">۴۰۴</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          صفحه‌ای یافت نشد
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          صفحه‌ای که دنبالش هستید وجود ندارد یا حذف شده است.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            صفحه اصلی
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            مشاهده دوره‌ها
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
