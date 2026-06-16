'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BookOpen,
  ShoppingCart,
  Banknote,
  Eye,
  LayoutDashboard,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { formatPrice } from '@/lib/utils';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';
import Chart from '@/components/ui/Chart';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

const statusBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }> = {
  PENDING: { label: 'در انتظار', variant: 'warning' },
  PAID: { label: 'پرداخت شده', variant: 'success' },
  FAILED: { label: 'ناموفق', variant: 'danger' },
  REFUNDED: { label: 'بازگشتی', variant: 'info' },
  CANCELLED: { label: 'لغو شده', variant: 'neutral' },
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">داشبورد مدیریت</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
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
        <h1 className="text-2xl font-bold text-gray-900">داشبورد مدیریت</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="کل کاربران"
          value={toPersianNumber(stats.totalUsers)}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="کل دوره‌ها"
          value={toPersianNumber(stats.totalCourses)}
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="کل بازدیدها"
          value={toPersianNumber(stats.totalViews || 0)}
          icon={Eye}
          color="cyan"
        />
        <StatsCard
          title="کل سفارش‌ها"
          value={toPersianNumber(stats.totalOrders)}
          icon={ShoppingCart}
          color="yellow"
        />
        <StatsCard
          title="درآمد کل"
          value={formatPrice(stats.totalRevenue)}
          icon={Banknote}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">درآمد ماهانه</h2>
          <Chart
            data={stats.monthlyRevenue.map((m) => ({
              label: m.month,
              value: m.amount,
            }))}
            type="bar"
            color="#3b82f6"
            height={200}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">رشد کاربران</h2>
          <Chart
            data={stats.userGrowth.map((m) => ({
              label: m.month,
              value: m.count,
            }))}
            type="line"
            color="#10b981"
            height={200}
          />
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">دوره‌های پرفروش</h2>
          <div className="space-y-3">
            {stats.topCourses.map((course, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {toPersianNumber(i + 1)}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{course.title}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(course.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {toPersianNumber(course.students)} دانشجو | {toPersianNumber(course.views || 0)} بازدید
                  </p>
                </div>
              </div>
            ))}
            {stats.topCourses.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">دوره‌ای یافت نشد</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">سفارش‌های اخیر</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500" dir="ltr">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(Number(order.finalAmount))}
                  </p>
                  <Badge variant={statusBadge[order.status]?.variant || 'neutral'}>
                    {statusBadge[order.status]?.label || order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">سفارشی یافت نشد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
