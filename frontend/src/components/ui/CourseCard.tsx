'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, BookOpen } from 'lucide-react';
import { cn, formatPrice, formatDuration } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  lessonsCount: number;
  studentsCount: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isFeatured?: boolean;
  className?: string;
}

const levelLabels = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

export default function CourseCard({
  title,
  slug,
  shortDesc,
  thumbnail,
  price,
  discountPrice,
  duration,
  lessonsCount,
  studentsCount,
  level,
  isFeatured,
  className,
}: CourseCardProps) {
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <Link href={`/courses/${slug}`}>
      <article
        className={cn(
          'group bg-white rounded-2xl overflow-hidden border border-gray-100',
          'hover:shadow-xl hover:border-primary-200 transition-all duration-300',
          'flex flex-col h-full',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                levelColors[level]
              )}
            >
              {levelLabels[level]}
            </span>
            {isFeatured && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-600 text-white">
                ویژه
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {discountPercent}% تخفیف
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          
          {shortDesc && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{shortDesc}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{lessonsCount} درس</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{studentsCount}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(discountPrice)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary-600">
                  {price === 0 ? 'رایگان' : formatPrice(price)}
                </span>
              )}
            </div>
            <span className="text-sm text-primary-600 font-medium group-hover:translate-x-1 transition-transform">
              مشاهده ←
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
