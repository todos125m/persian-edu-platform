'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen } from 'lucide-react';
import { adminService } from '@/services/adminService';
import CourseForm from '@/components/admin/CourseForm';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['admin', 'courses', 'all-for-edit'],
    queryFn: () => adminService.getCourses({ limit: 200 }),
  });

  const course = coursesData?.data?.find((c) => c.id === id);

  if (isLoading) {
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/courses"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <BookOpen className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">ویرایش دوره: {course.title}</h1>
      </div>
      <CourseForm mode="edit" initialData={course} />
    </div>
  );
}
