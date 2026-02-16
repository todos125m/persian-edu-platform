'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Eye, Trash2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService, AdminUser } from '@/services/adminService';
import { toJalali } from '@/lib/utils';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

const roleFilterOptions = [
  { value: '', label: 'همه' },
  { value: 'admin', label: 'ادمین' },
  { value: 'instructor', label: 'مدرس' },
  { value: 'user', label: 'کاربر' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Debounce search input by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, search: debouncedSearch, role }],
    queryFn: () =>
      adminService.getUsers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        role: role || undefined,
      }),
  });

  // Toggle user active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleUserActive(id),
    onSuccess: () => {
      toast.success('وضعیت کاربر با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('خطا در تغییر وضعیت کاربر');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('کاربر با موفقیت حذف شد');
      setDeleteUserId(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('خطا در حذف کاربر');
    },
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'نام',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'ایمیل',
      render: (row) => (
        <span className="text-gray-600" dir="ltr">
          {row.email}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'نقش',
      render: (row) => (
        <Badge variant="info">{row.role.nameFA}</Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'وضعیت',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'تاریخ عضویت',
      render: (row) => (
        <span className="text-gray-500">{toJalali(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/users/${row.id}`}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="مشاهده"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleActiveMutation.mutate(row.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isActive
                ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
            title={row.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
          >
            {row.isActive ? (
              <Ban className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteUserId(row.id);
            }}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="جستجوی نام، ایمیل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={roleFilterOptions}
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              placeholder="فیلتر نقش"
            />
          </div>
        </div>
      </div>

      {/* Results Info */}
      {data?.meta && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {toPersianNumber(data.meta.total)} کاربر یافت شد
          </p>
        </div>
      )}

      {/* Data Table */}
      <DataTable<AdminUser>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage="کاربری یافت نشد"
      />

      {/* Pagination */}
      {data?.meta && (
        <Pagination meta={data.meta} onPageChange={setPage} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={() => {
          if (deleteUserId) {
            deleteUserMutation.mutate(deleteUserId);
          }
        }}
        title="حذف کاربر"
        message="آیا از حذف این کاربر اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
        confirmText="حذف"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
