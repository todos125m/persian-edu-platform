'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Pencil } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { formatPrice } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LessonsList from '@/components/admin/LessonsList';
import SectionsManager from '@/components/admin/SectionsManager';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  DRAFT: { label: 'پیش‌نویس', variant: 'warning' },
  PUBLISHED: { label: 'منتشر شده', variant: 'success' },
  ARCHIVED: { label: 'آرشیو', variant: 'neutral' },
};

const levelLabels: Record<string, string> = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin', 'courses', 'all-for-detail'],
    queryFn: () => adminService.getCourses({ limit: 200 }),
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['admin', 'lessons', id],
    queryFn: () => adminService.getLessons(id),
  });

  const course = coursesData?.data?.find((c) => c.id === id);

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">دوره یافت نشد</p>
        <Link href="/admin/courses" className="text-primary-600 hover:underline">
          بازگشت به لیست دوره‌ها
        </Link>
      </div>
    );
  }

  const status = statusLabels[course.status];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <BookOpen className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        </div>
        <Link href={`/admin/courses/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4 ml-1" />
            ویرایش
          </Button>
        </Link>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">وضعیت</p>
            <Badge variant={status?.variant || 'neutral'}>{status?.label || course.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">سطح</p>
            <p className="font-medium text-gray-900">{levelLabels[course.level] || course.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">قیمت</p>
            <p className="font-medium text-gray-900">
              {course.price === 0 ? 'رایگان' : formatPrice(course.price)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">دانشجویان</p>
            <p className="font-medium text-gray-900">{toPersianNumber(course.studentsCount)}</p>
          </div>
        </div>
      </div>

      {/* Sections Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <SectionsManager courseId={id} />
      </div>

      {/* Lessons Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {lessonsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <LessonsList courseId={id} lessons={lessons || []} />
        )}
      </div>
    </div>
  );
}
