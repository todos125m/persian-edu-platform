'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { instructorService, InstructorCourse } from '@/services/instructorService';
import { formatPrice, toPersianNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const statusBadge: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'neutral' }
> = {
  DRAFT: { label: 'پیش\u200cنویس', variant: 'warning' },
  PUBLISHED: { label: 'منتشر شده', variant: 'success' },
  ARCHIVED: { label: 'آرشیو', variant: 'neutral' },
};

const levelLabels: Record<string, string> = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

export default function InstructorCoursesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<InstructorCourse | null>(null);

  // Fetch courses
  const { data, isLoading } = useQuery({
    queryKey: ['instructor', 'courses', { page }],
    queryFn: () => instructorService.getCourses({ page, limit: 10 }),
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => instructorService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      toast.success('دوره با موفقیت حذف شد');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('خطا در حذف دوره');
      setDeleteTarget(null);
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">دوره&#8204;های من</h1>
        </div>
        <Link href="/instructor/courses/new">
          <Button>
            <Plus className="w-5 h-5 ml-2" />
            افزودن دوره
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 last:border-0 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses Table */}
      {!isLoading && data && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-7 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div className="col-span-2">عنوان</div>
            <div>وضعیت</div>
            <div>سطح</div>
            <div>قیمت</div>
            <div>دانشجو / درس</div>
            <div>عملیات</div>
          </div>

          {/* Table Body */}
          {data.data.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">هنوز دوره&#8204;ای ایجاد نکرده&#8204;اید</p>
              <Link href="/instructor/courses/new" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 ml-1" />
                  ایجاد اولین دوره
                </Button>
              </Link>
            </div>
          ) : (
            data.data.map((course) => {
              const badge = statusBadge[course.status];
              return (
                <div
                  key={course.id}
                  className="grid grid-cols-1 md:grid-cols-7 gap-4 px-6 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Title */}
                  <div className="col-span-2 flex items-center gap-3">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{course.title}</p>
                      {course.category && (
                        <p className="text-xs text-gray-500 mt-0.5">{course.category.nameFA}</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge variant={badge?.variant || 'neutral'}>
                      {badge?.label || course.status}
                    </Badge>
                  </div>

                  {/* Level */}
                  <div>
                    <span className="text-sm text-gray-600">
                      {levelLabels[course.level] || course.level}
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    {course.price === 0 ? (
                      <Badge variant="info">رایگان</Badge>
                    ) : (
                      <div>
                        <span className="text-sm text-gray-900">{formatPrice(course.price)}</span>
                        {course.discountPrice != null && course.discountPrice > 0 && (
                          <p className="text-xs text-green-600 mt-0.5">
                            تخفیف: {formatPrice(course.discountPrice)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Students / Lessons */}
                  <div>
                    <span className="text-sm text-gray-600">
                      {toPersianNumber(course.studentsCount)} دانشجو
                    </span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-sm text-gray-600">
                      {toPersianNumber(course.lessonsCount)} درس
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/instructor/courses/${course.id}/edit`}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="ویرایش"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(course)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Simple Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            قبلی
          </Button>
          <span className="text-sm text-gray-600 px-4">
            صفحه {toPersianNumber(page)} از {toPersianNumber(data.meta.totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </div>
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
