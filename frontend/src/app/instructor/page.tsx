'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Users,
  DollarSign,
  ShoppingCart,
  LayoutDashboard,
} from 'lucide-react';
import { instructorService } from '@/services/instructorService';
import { formatPrice, toPersianNumber } from '@/lib/utils';
import StatsCard from '@/components/ui/StatsCard';

export default function InstructorDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['instructor', 'dashboard'],
    queryFn: instructorService.getDashboard,
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">داشبورد مدرس</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
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
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">داشبورد مدرس</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="تعداد دوره\u200cها"
          value={toPersianNumber(stats.totalCourses)}
          icon={BookOpen}
          color="primary"
        />
        <StatsCard
          title="تعداد دانشجویان"
          value={toPersianNumber(stats.totalStudents)}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="درآمد کل"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="سفارش\u200cهای پرداخت شده"
          value={toPersianNumber(stats.totalPaidOrders)}
          icon={ShoppingCart}
          color="yellow"
        />
      </div>
    </div>
  );
}
