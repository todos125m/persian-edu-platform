'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Clock, BookOpen, Users } from 'lucide-react';
import { wishlistsService, WishlistItem } from '@/services/wishlistsService';
import { formatPrice, formatDuration } from '@/lib/utils';
import { toast } from 'react-toastify';

const LEVEL_LABELS: Record<WishlistItem['course']['level'], string> = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

const LEVEL_COLORS: Record<WishlistItem['course']['level'], string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

export default function DashboardWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await wishlistsService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('خطا در دریافت لیست علاقه‌مندی‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (courseId: string) => {
    setRemovingId(courseId);
    try {
      await wishlistsService.toggle(courseId);
      setItems((prev) => prev.filter((item) => item.courseId !== courseId));
      toast.success('دوره از علاقه‌مندی‌ها حذف شد');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('خطا در حذف از علاقه‌مندی‌ها');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">علاقه‌مندی‌ها</h1>
          <p className="text-gray-500 text-sm mt-1">
            دوره‌هایی که به علاقه‌مندی‌ها اضافه کرده‌اید
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            هنوز دوره‌ای به علاقه‌مندی‌ها اضافه نشده
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            مشاهده دوره‌ها
          </Link>
        </div>
      ) : (
        /* Wishlist Items */
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <Link
                  href={`/courses/${item.course.slug}`}
                  className="w-24 h-24 bg-gray-100 rounded-xl shrink-0 overflow-hidden"
                >
                  {item.course.thumbnail ? (
                    <img
                      src={item.course.thumbnail}
                      alt={item.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/courses/${item.course.slug}`}
                      className="block"
                    >
                      <h3 className="font-bold text-gray-900 mb-1 truncate hover:text-primary-600 transition-colors">
                        {item.course.title}
                      </h3>
                    </Link>

                    {/* Level Badge */}
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        LEVEL_COLORS[item.course.level]
                      }`}
                    >
                      {LEVEL_LABELS[item.course.level]}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {item.course.lessonsCount} درس
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(item.course.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {item.course.studentsCount} دانشجو
                    </span>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.course.discountPrice != null &&
                      item.course.discountPrice < item.course.price ? (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(item.course.price)}
                          </span>
                          <span className="text-base font-bold text-primary-600">
                            {formatPrice(item.course.discountPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-bold text-gray-900">
                          {item.course.price === 0
                            ? 'رایگان'
                            : formatPrice(item.course.price)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemove(item.courseId)}
                      disabled={removingId === item.courseId}
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {removingId === item.courseId ? (
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
