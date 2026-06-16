'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { instructorService } from '@/services/instructorService';
import { formatPrice, toPersianNumber } from '@/lib/utils';

export default function InstructorRevenuePage() {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ['instructor', 'revenue'],
    queryFn: instructorService.getRevenue,
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">گزارش درآمد</h1>
        </div>

        {/* Loading skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between py-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/5" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!revenue) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">گزارش درآمد</h1>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">درآمد کل</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(revenue.totalRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">درآمد ماهانه</h2>

          {revenue.monthlyRevenue.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">اطلاعاتی موجود نیست</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right text-sm font-medium text-gray-500 pb-3 pr-2">
                      ماه
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3 pl-2">
                      مبلغ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.monthlyRevenue.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 pr-2 text-sm text-gray-900 font-medium">
                        {item.month}
                      </td>
                      <td className="py-3 pl-2 text-sm text-gray-900 text-left">
                        {formatPrice(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Course Revenue Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">درآمد به تفکیک دوره</h2>

          {revenue.courseRevenue.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">اطلاعاتی موجود نیست</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right text-sm font-medium text-gray-500 pb-3 pr-2">
                      دوره
                    </th>
                    <th className="text-center text-sm font-medium text-gray-500 pb-3">
                      تعداد فروش
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3 pl-2">
                      درآمد
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.courseRevenue.map((item) => (
                    <tr
                      key={item.courseId}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 pr-2 text-sm text-gray-900 font-medium">
                        {item.courseTitle}
                      </td>
                      <td className="py-3 text-sm text-gray-600 text-center">
                        {toPersianNumber(item.totalSales)}
                      </td>
                      <td className="py-3 pl-2 text-sm text-gray-900 text-left">
                        {formatPrice(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
