'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Users, PlayCircle } from 'lucide-react';
import { formatPrice, formatTotalDuration, toPersianNumber } from '@/lib/utils';

// Temporary mock data - replace with API call
const mockCourses = [
  {
    id: '1',
    title: 'دوره جامع React و Next.js',
    slug: 'react-nextjs-complete',
    shortDesc: 'از مقدماتی تا پیشرفته - پروژه محور',
    thumbnail: '/images/courses/react.jpg',
    price: 1500000,
    discountPrice: 990000,
    duration: 36000,
    lessonsCount: 120,
    studentsCount: 2500,
    level: 'INTERMEDIATE',
    category: { nameFA: 'طراحی وب' },
  },
  {
    id: '2',
    title: 'آموزش Python برای هوش مصنوعی',
    slug: 'python-ai',
    shortDesc: 'یادگیری ماشین و شبکه‌های عصبی',
    thumbnail: '/images/courses/python.jpg',
    price: 2000000,
    discountPrice: null,
    duration: 48000,
    lessonsCount: 85,
    studentsCount: 1800,
    level: 'ADVANCED',
    category: { nameFA: 'هوش مصنوعی' },
  },
  {
    id: '3',
    title: 'طراحی UI/UX با Figma',
    slug: 'figma-uiux',
    shortDesc: 'از صفر تا طراحی حرفه‌ای',
    thumbnail: '/images/courses/figma.jpg',
    price: 890000,
    discountPrice: 690000,
    duration: 24000,
    lessonsCount: 65,
    studentsCount: 3200,
    level: 'BEGINNER',
    category: { nameFA: 'طراحی' },
  },
  {
    id: '4',
    title: 'توسعه اپلیکیشن موبایل با Flutter',
    slug: 'flutter-mobile',
    shortDesc: 'ساخت اپ iOS و Android',
    thumbnail: '/images/courses/flutter.jpg',
    price: 1800000,
    discountPrice: 1200000,
    duration: 42000,
    lessonsCount: 95,
    studentsCount: 1500,
    level: 'INTERMEDIATE',
    category: { nameFA: 'موبایل' },
  },
];

const levelLabels = {
  BEGINNER: 'مقدماتی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

export function FeaturedCourses() {
  return (
    <section className="section bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="section-title">دوره‌های پرطرفدار</h2>
            <p className="section-subtitle">
              محبوب‌ترین دوره‌های آموزشی را مشاهده کنید
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
          {mockCourses.map((course) => (
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

function CourseCard({ course }: { course: (typeof mockCourses)[0] }) {
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

        {/* Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-20">
            {toPersianNumber(discountPercent)}٪ تخفیف
          </div>
        )}

        {/* Category */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-lg z-20">
          {course.category.nameFA}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {course.shortDesc}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTotalDuration(course.duration)}
          </span>
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
            ) : (
              <div className="text-primary-600 font-bold">
                {formatPrice(course.price)}
              </div>
            )}
          </div>
          <div className="badge-primary">
            {levelLabels[course.level as keyof typeof levelLabels]}
          </div>
        </div>
      </div>
    </Link>
  );
}
