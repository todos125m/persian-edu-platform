'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService, AdminCourse } from '@/services/adminService';
import { cn, formatPrice, toJalali } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'DRAFT', label: 'پیش‌نویس' },
  { value: 'PUBLISHED', label: 'منتشر شده' },
  { value: 'ARCHIVED', label: 'آرشیو' },
];

const statusBadge: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'neutral' }
> = {
  DRAFT: { label: 'پیش‌نویس', variant: 'warning' },
  PUBLISHED: { label: 'منتشر شده', variant: 'success' },
  ARCHIVED: { label: 'آرشیو', variant: 'neutral' },
};

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value);
      setPage(1);
    },
    []
  );

  // Fetch courses
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses', { page, search: debouncedSearch, status: statusFilter }],
    queryFn: () =>
      adminService.getCourses({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('وضعیت ویژه دوره تغییر کرد');
    },
    onError: () => {
      toast.error('خطا در تغییر وضعیت ویژه');
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('دوره با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('خطا در حذف دوره');
      setDeleteTarget(null);
    },
  });

  const columns: Column<AdminCourse>[] = [
    {
      key: 'title',
      header: 'عنوان',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnail && (
            <img
              src={row.thumbnail}
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <Link
              href={`/admin/courses/${row.id}`}
              className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
            >
              {row.title}
            </Link>
            <p className="text-xs text-gray-500 mt-0.5" dir="ltr">
              {row.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'دسته‌بندی',
      render: (row) => (
        <span className="text-gray-600">{row.category?.nameFA || '---'}</span>
      ),
    },
    {
      key: 'price',
      header: 'قیمت',
      render: (row) => (
        <div>
          {row.price === 0 ? (
            <Badge variant="info">رایگان</Badge>
          ) : (
            <span className="text-gray-900">{formatPrice(row.price)}</span>
          )}
          {row.discountPrice != null && row.discountPrice > 0 && (
            <p className="text-xs text-green-600 mt-0.5">
              تخفیف: {formatPrice(row.discountPrice)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => {
        const badge = statusBadge[row.status];
        return (
          <Badge variant={badge?.variant || 'neutral'}>
            {badge?.label || row.status}
          </Badge>
        );
      },
    },
    {
      key: 'studentsCount',
      header: 'دانشجو',
      render: (row) => (
        <span className="text-gray-600">{toPersianNumber(row.studentsCount)}</span>
      ),
    },
    {
      key: 'isFeatured',
      header: 'ویژه',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFeaturedMutation.mutate(row.id);
          }}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title={row.isFeatured ? 'حذف از ویژه' : 'افزودن به ویژه'}
        >
          <Star
            className={cn(
              'w-5 h-5 transition-colors',
              row.isFeatured
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        </button>
      ),
      className: 'text-center',
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/courses/${row.id}/edit`}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="ویرایش"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">مدیریت دوره‌ها</h1>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="w-5 h-5 ml-2" />
            افزودن دوره جدید
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در عنوان دوره..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusChange}
              placeholder="وضعیت"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable<AdminCourse>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage="دوره‌ای یافت نشد"
      />

      {/* Pagination */}
      {data?.meta && (
        <Pagination meta={data.meta} onPageChange={setPage} />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        title="حذف دوره"
        message={`آیا از حذف دوره "${deleteTarget?.title}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        confirmText="حذف"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
