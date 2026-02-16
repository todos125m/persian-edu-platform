'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  CheckCircle,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { formatPrice } from '@/lib/utils';
import StatsCard from '@/components/ui/StatsCard';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export default function AdminPaymentsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: adminService.getPaymentStats,
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">گزارش مالی</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">گزارش مالی</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="کل تراکنش‌ها"
          value={toPersianNumber(stats.totalPayments)}
          icon={CreditCard}
          color="primary"
        />
        <StatsCard
          title="تراکنش‌های موفق"
          value={toPersianNumber(stats.successfulPayments)}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="درآمد کل"
          value={formatPrice(stats.totalRevenue)}
          icon={Banknote}
          color="purple"
        />
        <StatsCard
          title="نرخ موفقیت"
          value={`${toPersianNumber(Math.round(stats.successRate))}٪`}
          icon={TrendingUp}
          color="yellow"
        />
      </div>
    </div>
  );
}
