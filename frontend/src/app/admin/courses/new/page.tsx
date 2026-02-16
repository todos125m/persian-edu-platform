'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">افزودن دوره جدید</h1>
      </div>
      <CourseForm mode="create" />
    </div>
  );
}
