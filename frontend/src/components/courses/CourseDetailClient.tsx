'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Clock,
  Users,
  BookOpen,
  PlayCircle,
  Lock,
  CheckCircle,
  Share2,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui';
import CourseReviews from './CourseReviews';
import { ordersService } from '@/services/ordersService';
import { wishlistsService } from '@/services/wishlistsService';
import { coursesService } from '@/services/coursesService';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatDuration } from '@/lib/utils';
import { toast } from 'react-toastify';

const levelLabels = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
};

interface CourseDetailClientProps {
  course: any;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Track page view
  useEffect(() => {
    coursesService.trackView(course.id);
  }, [course.id]);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistsService.getAll().then((items) => {
        setIsWishlisted(items.some((item) => item.courseId === course.id));
      }).catch(() => {});
    }
  }, [isAuthenticated, course.id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }
    setWishlistLoading(true);
    try {
      const { wishlisted } = await wishlistsService.toggle(course.id);
      setIsWishlisted(wishlisted);
      toast.success(wishlisted ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
    } catch {
      toast.error('خطا در بروزرسانی علاقه‌مندی‌ها');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    setIsEnrolling(true);
    try {
      const order = await ordersService.create([course.id]);
      const payment = await ordersService.initiatePayment(order.id);
      window.location.href = payment.paymentUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setIsEnrolling(false);
    }
  };

  const hasDiscount =
    course.discountPrice &&
    course.discountPrice < course.price &&
    new Date(course.discountExpiry) > new Date();

  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-l from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-primary-400 mb-4">
                <span>{course.category?.nameFA}</span>
                <span>•</span>
                <span>{levelLabels[course.level as keyof typeof levelLabels]}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-gray-300 text-lg mb-6">{course.shortDesc}</p>

              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.lessonsCount} درس</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.studentsCount} دانشجو</span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />
              )}
              {course.previewVideo && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                  <PlayCircle className="w-16 h-16 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">درباره دوره</h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  {course.description}
                </div>
              </div>

              {/* Lessons */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  سرفصل‌های دوره
                </h2>
                <div className="space-y-2">
                  {course.lessons?.map((lesson: any, index: number) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedLesson(
                            expandedLesson === lesson.id ? null : lesson.id
                          )
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900">
                            {lesson.title}
                          </span>
                          {lesson.isFree && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              رایگان
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          {lesson.video?.duration && (
                            <span className="text-sm">
                              {formatDuration(lesson.video.duration)}
                            </span>
                          )}
                          {lesson.isFree ? (
                            <PlayCircle className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                      {expandedLesson === lesson.id && lesson.description && (
                        <div className="px-4 pb-4 text-gray-600 text-sm">
                          {lesson.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <CourseReviews courseId={course.id} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                {/* Price */}
                <div className="mb-6">
                  {hasDiscount ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(course.discountPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(course.price)}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded-lg">
                        {discountPercent}% تخفیف
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      {course.price === 0 ? 'رایگان' : formatPrice(course.price)}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleEnroll}
                  isLoading={isEnrolling}
                  className="mb-4"
                >
                  <ShoppingCart className="w-5 h-5 ml-2" />
                  ثبت‌نام در دوره
                </Button>

                <div className="flex gap-2 mb-6">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleWishlistToggle}
                    isLoading={wishlistLoading}
                    className={isWishlisted ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
                  >
                    <Heart className={`w-5 h-5 ml-2 ${isWishlisted ? 'fill-red-500' : ''}`} />
                    {isWishlisted ? 'در علاقه‌مندی‌ها' : 'علاقه‌مندی'}
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('لینک کپی شد');
                    }}
                  >
                    <Share2 className="w-5 h-5 ml-2" />
                    اشتراک
                  </Button>
                </div>

                {/* Features */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="font-bold text-gray-900">این دوره شامل:</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{course.lessonsCount} جلسه ویدیویی</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{formatDuration(course.duration)} محتوای آموزشی</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>دسترسی مادام‌العمر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>پشتیبانی دائمی</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>گواهینامه پایان دوره</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
