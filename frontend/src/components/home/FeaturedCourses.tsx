'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, PlayCircle } from 'lucide-react';
import { formatPrice, formatTotalDuration, toPersianNumber } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  thumbnail: string | null;
  price: number;
  discountPrice: number | null;
  duration: number;
  lessonsCount: number;
  studentsCount: number;
  level: string;
  category?: { name: string; nameFA: string; slug: string };
}

const levelLabels: Record<string, string> = {
  BEGINNER: 'مقدماتی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

export function FeaturedCourses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data } = await api.get('/courses/featured');
      return data as Course[];
    },
  });

  if (isLoading) {
    return (
      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <h2 className="section-title">دوره‌های پرطرفدار</h2>
              <p className="section-subtitle">
                محبوب‌ترین دوره‌های آموزشی ریاضی را مشاهده کنید
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <section className="section bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="section-title">دوره‌های پرطرفدار</h2>
            <p className="section-subtitle">
              محبوب‌ترین دوره‌های آموزشی ریاضی را مشاهده کنید
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-4 md:mt-0"
          >
            مشاهده همه دوره‌ها
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.slice(0, 8).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/courses" className="btn-primary">
            مشاهده همه دوره‌ها
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: Course }) {
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountPrice!) / course.price) * 100)
    : 0;

  return (
    <Link href={`/courses/${course.slug}`} className="card card-hover group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100">
            <PlayCircle className="w-12 h-12 text-primary-400" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-20">
            {toPersianNumber(discountPercent)}٪ تخفیف
          </div>
        )}

        {/* Category */}
        {course.category && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-lg z-20">
            {course.category.nameFA}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        {course.shortDesc && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {course.shortDesc}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {course.duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTotalDuration(course.duration)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" />
            {toPersianNumber(course.lessonsCount)} درس
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {hasDiscount ? (
              <>
                <span className="text-gray-400 text-sm line-through">
                  {formatPrice(course.price)}
                </span>
                <div className="text-primary-600 font-bold">
                  {formatPrice(course.discountPrice!)}
                </div>
              </>
            ) : course.price === 0 ? (
              <div className="text-green-600 font-bold">رایگان</div>
            ) : (
              <div className="text-primary-600 font-bold">
                {formatPrice(course.price)}
              </div>
            )}
          </div>
          <div className="badge-primary">
            {levelLabels[course.level] || course.level}
          </div>
        </div>
      </div>
    </Link>
  );
}
