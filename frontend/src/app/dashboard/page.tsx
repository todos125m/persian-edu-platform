'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersService } from '@/services/usersService';
import { formatDuration } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const data = await usersService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalCourses: courses.length,
    inProgress: courses.filter((c: any) => c.progress > 0 && c.progress < 100).length,
    completed: courses.filter((c: any) => c.progress === 100).length,
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          سلام {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500">به داشبورد آکادمی آموزش خوش آمدید</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              <p className="text-gray-500">دوره ثبت‌نام شده</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-gray-500">در حال یادگیری</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-gray-500">تکمیل شده</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">دوره‌های من</h2>
          <Link
            href="/dashboard/courses"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            مشاهده همه
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-4">
            {courses.slice(0, 5).map((item: any) => (
              <Link
                key={item.course.id}
                href={`/dashboard/courses/${item.course.slug}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0">
                  {item.course.thumbnail && (
                    <img
                      src={item.course.thumbnail}
                      alt={item.course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{item.course.lessonsCount} درس</span>
                    <span>{formatDuration(item.course.duration)}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{item.progress}%</p>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              مشاهده دوره‌ها
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
