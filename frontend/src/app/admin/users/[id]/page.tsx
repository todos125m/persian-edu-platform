'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Mail,
  Phone,
  Shield,
  Calendar,
  BookOpen,
  Trash2,
  Ban,
  CheckCircle,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService, AdminUser, Role } from '@/services/adminService';
import api from '@/lib/api';
import { toJalali } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [showGrantSection, setShowGrantSection] = useState(false);

  // Fetch user detail
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminService.getUser(id),
    enabled: !!id,
  });

  // Fetch roles list
  const { data: roles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: adminService.getRoles,
  });

  // Fetch all courses for grant access dropdown
  const { data: allCourses } = useQuery({
    queryKey: ['admin', 'courses', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/courses/admin/all?limit=200');
      return data;
    },
  });

  // Grant course access mutation
  const grantAccessMutation = useMutation({
    mutationFn: (courseId: string) => adminService.grantCourseAccess(id, courseId),
    onSuccess: () => {
      toast.success('دسترسی دوره با موفقیت اعطا شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      setSelectedCourseId('');
      setShowGrantSection(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'خطا در اعطای دسترسی');
    },
  });

  // Revoke course access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: (courseId: string) => adminService.revokeCourseAccess(id, courseId),
    onSuccess: () => {
      toast.success('دسترسی دوره با موفقیت لغو شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'خطا در لغو دسترسی');
    },
  });

  // Filter out already enrolled courses from the dropdown
  const enrolledCourseIds = user?.courses?.map((e: any) => e.course.id) || [];
  const availableCourses = (allCourses?.data || []).filter(
    (c: any) => !enrolledCourseIds.includes(c.id)
  );

  // Set selected role once user and roles data are available
  const currentRoleId =
    selectedRoleId ||
    (user && roles
      ? roles.find((r) => r.name === user.role.name)?.id || ''
      : '');

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: (roleId: string) => adminService.changeUserRole(id, roleId),
    onSuccess: () => {
      toast.success('نقش کاربر با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('خطا در تغییر نقش کاربر');
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: () => adminService.toggleUserActive(id),
    onSuccess: () => {
      toast.success('وضعیت کاربر با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('خطا در تغییر وضعیت کاربر');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: () => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('کاربر با موفقیت حذف شد');
      router.push('/admin/users');
    },
    onError: () => {
      toast.error('خطا در حذف کاربر');
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/users"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">جزئیات کاربر</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-10 bg-gray-200 rounded w-full mb-3" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/users"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">جزئیات کاربر</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">کاربر یافت نشد</p>
          <Link
            href="/admin/users"
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            بازگشت به لیست کاربران
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">جزئیات کاربر</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.firstName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info">{user.role.nameFA}</Badge>
                  <Badge variant={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                  <Badge variant={user.isVerified ? 'success' : 'warning'}>
                    {user.isVerified ? 'تایید شده' : 'تایید نشده'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">ایمیل</p>
                  <p className="text-sm text-gray-900 font-medium" dir="ltr">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">تلفن</p>
                  <p className="text-sm text-gray-900 font-medium" dir="ltr">
                    {user.phone || '---'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">نقش</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {user.role.nameFA}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">تاریخ عضویت</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {toJalali(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">دوره‌های ثبت‌نام شده</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGrantSection(!showGrantSection)}
              >
                {showGrantSection ? (
                  <><X className="w-4 h-4 ml-1" /> انصراف</>
                ) : (
                  <><Plus className="w-4 h-4 ml-1" /> اعطای دسترسی</>
                )}
              </Button>
            </div>

            {/* Grant Access Form */}
            {showGrantSection && (
              <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200 space-y-3">
                <p className="text-sm font-medium text-primary-800">
                  اعطای دسترسی رایگان به دوره (بدون پرداخت)
                </p>
                <Select
                  options={availableCourses.map((c: any) => ({
                    value: c.id,
                    label: c.title,
                  }))}
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  placeholder="انتخاب دوره"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedCourseId) {
                      grantAccessMutation.mutate(selectedCourseId);
                    }
                  }}
                  isLoading={grantAccessMutation.isPending}
                  disabled={!selectedCourseId}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  اعطای دسترسی
                </Button>
              </div>
            )}

            {user.courses && user.courses.length > 0 ? (
              <div className="space-y-3">
                {user.courses.map((enrollment: any) => (
                  <div
                    key={enrollment.course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      {enrollment.course.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {enrollment.course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          ثبت‌نام: {toJalali(enrollment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">پیشرفت:</span>
                          <span className="text-sm font-medium text-primary-600">
                            {toPersianNumber(enrollment.progress)}%
                          </span>
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-primary-600 rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => revokeAccessMutation.mutate(enrollment.course.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="لغو دسترسی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">
                این کاربر در هیچ دوره‌ای ثبت‌نام نکرده است
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Role Change */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تغییر نقش</h3>
            <div className="space-y-3">
              <Select
                options={
                  roles?.map((r: Role) => ({
                    value: r.id,
                    label: r.nameFA,
                  })) || []
                }
                value={currentRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                placeholder="انتخاب نقش"
              />
              <Button
                onClick={() => {
                  const roleId = selectedRoleId || currentRoleId;
                  if (roleId) {
                    changeRoleMutation.mutate(roleId);
                  }
                }}
                isLoading={changeRoleMutation.isPending}
                disabled={!currentRoleId}
                fullWidth
              >
                <Save className="w-4 h-4 ml-2" />
                ذخیره نقش
              </Button>
            </div>
          </div>

          {/* Status Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">عملیات</h3>
            <div className="space-y-3">
              <Button
                variant={user.isActive ? 'outline' : 'primary'}
                onClick={() => toggleActiveMutation.mutate()}
                isLoading={toggleActiveMutation.isPending}
                fullWidth
              >
                {user.isActive ? (
                  <>
                    <Ban className="w-4 h-4 ml-2" />
                    غیرفعال کردن
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    فعال کردن
                  </>
                )}
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteDialog(true)}
                fullWidth
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف کاربر
              </Button>
            </div>
          </div>

          {/* Back Link */}
          <Link
            href="/admin/users"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-gray-600 hover:text-gray-900 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به لیست کاربران
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteUserMutation.mutate()}
        title="حذف کاربر"
        message={`آیا از حذف کاربر "${user.firstName} ${user.lastName}" اطمینان دارید؟ تمام اطلاعات و دوره‌های این کاربر حذف خواهد شد. این عملیات غیرقابل بازگشت است.`}
        confirmText="حذف"
        cancelText="انصراف"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
