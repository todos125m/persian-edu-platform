'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderOpen, Search, ArrowRight } from 'lucide-react';
import { CourseCard, Button } from '@/components/ui';
import { coursesService } from '@/services/coursesService';
import api from '@/lib/api';
import { toPersianNumber } from '@/lib/utils';

const levels = [
  { value: '', label: 'همه سطوح' },
  { value: 'BEGINNER', label: 'مبتدی' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'پیشرفته' },
];

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [category, setCategory] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCategory();
  }, [slug]);

  useEffect(() => {
    loadCourses();
  }, [slug, level, page]);

  const loadCategory = async () => {
    try {
      const res = await api.get(`/categories/slug/${slug}`);
      setCategory(res.data);
    } catch {
      // Category will be null
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await coursesService.getCourses({
        page,
        limit: 12,
        category: slug,
        level: level || undefined,
      });
      setCourses(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch {
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-primary-200 hover:text-white mb-4 text-sm transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به همه دوره‌ها
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">
              {category?.nameFA || slug}
            </h1>
          </div>
          {category?.description && (
            <p className="text-primary-100 text-lg mt-2">{category.description}</p>
          )}
          <p className="text-primary-200 mt-3">
            {toPersianNumber(total)} دوره در این دسته‌بندی
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => {
                  setLevel(l.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  level === l.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {toPersianNumber(i + 1)}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">دوره‌ای در این دسته‌بندی یافت نشد</p>
              <Link href="/courses" className="text-primary-600 hover:underline mt-2 inline-block">
                مشاهده همه دوره‌ها
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
