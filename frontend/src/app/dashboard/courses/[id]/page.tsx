'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  PlayCircle,
  Lock,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@/services/coursesService';
import { usersService } from '@/services/usersService';
import VideoPlayer from '@/components/video/VideoPlayer';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import api from '@/lib/api';

export default function WatchCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessonsOpen, setLessonsOpen] = useState(true);

  // Check if user owns this course
  const { data: myCourses, isLoading: loadingAccess } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => usersService.getMyCourses(),
  });

  const userCourse = myCourses?.find((uc: any) => uc.course?.id === courseId);

  // Get course with lessons
  const { data: allLessons, isLoading: loadingLessons } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => coursesService.getLessons(courseId),
    enabled: !!courseId,
  });

  // Filter out unpublished lessons for student view
  const lessons = allLessons?.filter((l: any) => l.isPublished !== false);

  // Load lesson details when selected
  useEffect(() => {
    if (activeLessonId) {
      api.get(`/lessons/${activeLessonId}`)
        .then(({ data }) => setActiveLesson(data))
        .catch((err) => {
          if (err.response?.status === 403) {
            const msg = err.response?.data?.message || 'برای مشاهده این درس باید دوره را خریداری کنید';
            toast.error(msg);
            setActiveLessonId(null);
          }
        });
    }
  }, [activeLessonId]);

  // Auto-select first lesson
  useEffect(() => {
    if (lessons?.length && !activeLessonId) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  const handleDownloadPdf = async () => {
    if (!activeLessonId) return;
    try {
      const { data } = await api.get(`/lessons/${activeLessonId}/pdf`);
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch {
      toast.error('خطا در دانلود جزوه');
    }
  };

  const handleProgress = (position: number, completed: boolean) => {
    // Could update lesson completion status in UI here
  };

  const goToNextLesson = () => {
    if (!lessons || !activeLessonId) return;
    const currentIndex = lessons.findIndex((l: any) => l.id === activeLessonId);
    if (currentIndex < lessons.length - 1) {
      setActiveLessonId(lessons[currentIndex + 1].id);
      setActiveLesson(null);
    }
  };

  const goToPrevLesson = () => {
    if (!lessons || !activeLessonId) return;
    const currentIndex = lessons.findIndex((l: any) => l.id === activeLessonId);
    if (currentIndex > 0) {
      setActiveLessonId(lessons[currentIndex - 1].id);
      setActiveLesson(null);
    }
  };

  if (loadingAccess || loadingLessons) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  // If user doesn't own this course, redirect
  if (!userCourse) {
    return (
      <div className="text-center py-20">
        <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">شما به این دوره دسترسی ندارید</h2>
        <p className="text-gray-500 mb-6">برای مشاهده درس‌ها ابتدا دوره را خریداری کنید</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium"
        >
          مشاهده دوره‌ها
        </Link>
      </div>
    );
  }

  // If course is locked due to unpaid installments
  if (userCourse.isLocked) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">دسترسی شما قفل شده است</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          به دلیل عدم پرداخت اقساط، دسترسی شما به این دوره موقتاً مسدود شده است.
          لطفاً اقساط معوق را پرداخت کنید تا دسترسی‌تان بازگردد.
        </p>
        <Link
          href="/dashboard/installments"
          className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors font-medium"
        >
          مشاهده و پرداخت اقساط
        </Link>
      </div>
    );
  }

  const currentIndex = lessons?.findIndex((l: any) => l.id === activeLessonId) ?? -1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/courses"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {userCourse?.course?.title || 'دوره'}
          </h1>
          <p className="text-sm text-gray-500">
            پیشرفت: {userCourse?.progress || 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Video Player - 3 columns */}
        <div className="xl:col-span-3">
          {activeLesson?.video?.id ? (
            <VideoPlayer
              videoId={activeLesson.video.id}
              onProgress={handleProgress}
            />
          ) : (
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">
                  {activeLesson ? 'ویدیویی برای این درس آپلود نشده' : 'درسی را انتخاب کنید'}
                </p>
              </div>
            </div>
          )}

          {/* Lesson Info & Navigation */}
          {activeLesson && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{activeLesson.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    درس {currentIndex + 1} از {lessons?.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeLesson.pdfUrl && (
                    <button
                      onClick={handleDownloadPdf}
                      className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      دانلود جزوه
                    </button>
                  )}
                  <button
                    onClick={goToPrevLesson}
                    disabled={currentIndex <= 0}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    درس قبلی
                  </button>
                  <button
                    onClick={goToNextLesson}
                    disabled={currentIndex >= (lessons?.length || 0) - 1}
                    className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    درس بعدی
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lessons Sidebar - 1 column */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            <button
              onClick={() => setLessonsOpen(!lessonsOpen)}
              className="w-full flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <span className="font-bold text-gray-900">سرفصل‌ها</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{lessons?.length || 0} درس</span>
                {lessonsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {lessonsOpen && (
              <div className="max-h-[60vh] overflow-y-auto">
                {lessons?.map((lesson: any, index: number) => {
                  const isActive = lesson.id === activeLessonId;
                  const canAccess = lesson.isFree || !!userCourse;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && setActiveLessonId(lesson.id)}
                      disabled={!canAccess}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 text-right transition-colors border-b border-gray-50 last:border-0',
                        isActive
                          ? 'bg-primary-50 border-r-2 border-r-primary-600'
                          : canAccess
                          ? 'hover:bg-gray-50 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm truncate',
                            isActive ? 'font-bold text-primary-700' : 'text-gray-800'
                          )}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lesson.video?.duration && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(lesson.video.duration)}
                            </span>
                          )}
                          {lesson.pdfUrl && (
                            <span className="text-xs text-blue-500 flex items-center gap-0.5">
                              <FileText className="w-3 h-3" />
                              جزوه
                            </span>
                          )}
                          {lesson.isFree && (
                            <span className="text-xs text-green-600">رایگان</span>
                          )}
                        </div>
                      </div>
                      {!canAccess ? (
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-primary-600 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
