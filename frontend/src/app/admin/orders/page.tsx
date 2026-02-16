'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { adminService, AdminOrder } from '@/services/adminService';
import { cn, formatPrice, toJalali } from '@/lib/utils';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

const statusBadge: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }
> = {
  PENDING: { label: 'در انتظار', variant: 'warning' },
  PAID: { label: 'پرداخت شده', variant: 'success' },
  FAILED: { label: 'ناموفق', variant: 'danger' },
  REFUNDED: { label: 'بازگشتی', variant: 'info' },
  CANCELLED: { label: 'لغو شده', variant: 'neutral' },
};

const statusFilters = [
  { key: '', label: 'همه' },
  { key: 'PENDING', label: 'در انتظار' },
  { key: 'PAID', label: 'پرداخت شده' },
  { key: 'FAILED', label: 'ناموفق' },
  { key: 'REFUNDED', label: 'بازگشتی' },
  { key: 'CANCELLED', label: 'لغو شده' },
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { page, status }],
    queryFn: () =>
      adminService.getOrders({
        page,
        limit: 10,
        status: status || undefined,
      }),
  });

  const columns: Column<AdminOrder>[] = [
    {
      key: 'orderNumber',
      header: 'شماره سفارش',
      render: (row) => (
        <span className="font-medium text-gray-900" dir="ltr">
          {row.orderNumber}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'کاربر',
      render: (row) => (
        <span className="text-gray-900">
          {row.user.firstName} {row.user.lastName}
        </span>
      ),
    },
    {
      key: 'finalAmount',
      header: 'مبلغ',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {formatPrice(Number(row.finalAmount))}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => (
        <Badge variant={statusBadge[row.status]?.variant || 'neutral'}>
          {statusBadge[row.status]?.label || row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'تاریخ',
      render: (row) => (
        <span className="text-gray-500">{toJalali(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">مدیریت سفارش‌ها</h1>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => {
                setStatus(filter.key);
                setPage(1);
              }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                status === filter.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      {data?.meta && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {toPersianNumber(data.meta.total)} سفارش یافت شد
          </p>
        </div>
      )}

      {/* Data Table */}
      <DataTable<AdminOrder>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage="سفارشی یافت نشد"
      />

      {/* Pagination */}
      {data?.meta && (
        <Pagination meta={data.meta} onPageChange={setPage} />
      )}
    </div>
  );
}
