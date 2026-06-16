'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Trophy, Search, Filter, AlertTriangle } from 'lucide-react';
import { usersService, UserCourse } from '@/services/usersService';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'in_progress' | 'completed' | 'not_started';

export default function DashboardCoursesPage() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await usersService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((item) => {
    // Search filter
    if (search && !item.course.title.includes(search)) return false;

    // Status filter
    switch (filter) {
      case 'in_progress':
        return item.progress > 0 && item.progress < 100;
      case 'completed':
        return item.progress === 100;
      case 'not_started':
        return item.progress === 0;
      default:
        return true;
    }
  });

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'همه', count: courses.length },
    {
      key: 'in_progress',
      label: 'در حال یادگیری',
      count: courses.filter((c) => c.progress > 0 && c.progress < 100).length,
    },
    {
      key: 'completed',
      label: 'تکمیل شده',
      count: courses.filter((c) => c.progress === 100).length,
    },
    {
      key: 'not_started',
      label: 'شروع نشده',
      count: courses.filter((c) => c.progress === 0).length,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">دوره‌های من</h1>
        <p className="text-gray-500">دوره‌هایی که در آن‌ها ثبت‌نام کرده‌اید</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در دوره‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  filter === f.key
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                {f.label}
                <span className="mr-1 text-xs opacity-60">({f.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {filteredCourses.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/courses/${item.course.id}`}
              className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
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
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">
                      {item.course.title}
                    </h3>
                    {item.isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        قفل شده
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {item.course.lessonsCount} درس
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(item.course.duration)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.progress === 100
                            ? 'bg-green-500'
                            : item.progress > 0
                            ? 'bg-primary-500'
                            : 'bg-gray-300'
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-left">
                      {item.progress}%
                    </span>
                  </div>
                </div>

                {item.progress === 100 && (
                  <div className="hidden sm:flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          {courses.length === 0 ? (
            <>
              <p className="text-gray-500 mb-4">هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                مشاهده دوره‌ها
              </Link>
            </>
          ) : (
            <p className="text-gray-500">دوره‌ای با این فیلتر یافت نشد</p>
          )}
        </div>
      )}
    </div>
  );
}
