'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  DollarSign,
  Settings,
  Film,
  Edit3,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { instructorService } from '@/services/instructorService';
import { generateSlug } from '@/lib/utils';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ThumbnailUploader from '@/components/instructor/ThumbnailUploader';
import VideoUploader from '@/components/admin/VideoUploader';

const courseSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  slug: z.string().min(3, 'نامک باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  shortDesc: z.string().optional(),
  price: z.coerce.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  discountPrice: z.coerce.number().min(0).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  categoryId: z.string().min(1, 'دسته‌بندی را انتخاب کنید'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function InstructorEditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const [autoSlug, setAutoSlug] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [lessonIsPublished, setLessonIsPublished] = useState(true);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const pdfInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Fetch course data
  const { data: course } = useQuery({
    queryKey: ['instructor', 'course', courseId],
    queryFn: () => instructorService.getCourse(courseId),
    enabled: !!courseId,
  });

  // Fetch course lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['instructor', 'lessons', courseId],
    queryFn: () => instructorService.getLessons(courseId),
    enabled: !!courseId,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  const title = watch('title');

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        slug: course.slug,
        description: course.description || '',
        shortDesc: course.shortDesc || '',
        price: course.price,
        discountPrice: course.discountPrice || 0,
        level: course.level as any,
        categoryId: course.categoryId || course.category?.id || '',
        status: course.status as any,
      });
      setThumbnail(course.thumbnail);
    }
  }, [course, reset]);

  useEffect(() => {
    if (autoSlug && title) {
      setValue('slug', generateSlug(title));
    }
  }, [title, autoSlug, setValue]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: CourseFormData) => instructorService.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor'] });
      toast.success('دوره با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'خطا در ویرایش دوره');
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: any) => instructorService.createLesson(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'lessons', courseId] });
      toast.success('درس اضافه شد');
      resetLessonForm();
    },
    onError: () => toast.error('خطا در افزودن درس'),
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      instructorService.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'lessons', courseId] });
      toast.success('درس ویرایش شد');
      resetLessonForm();
    },
    onError: () => toast.error('خطا در ویرایش درس'),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => instructorService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'lessons', courseId] });
      toast.success('درس حذف شد');
      setDeletingLessonId(null);
      if (expandedLessonId === deletingLessonId) setExpandedLessonId(null);
    },
    onError: () => toast.error('خطا در حذف درس'),
  });

  const pdfUploadMutation = useMutation({
    mutationFn: ({ lessonId, file }: { lessonId: string; file: File }) =>
      instructorService.uploadLessonPdf(lessonId, file),
    onSuccess: () => {
      toast.success('جزوه آپلود شد');
      queryClient.invalidateQueries({ queryKey: ['instructor', 'lessons', courseId] });
    },
    onError: () => toast.error('خطا در آپلود جزوه'),
  });

  const pdfDeleteMutation = useMutation({
    mutationFn: (lessonId: string) => instructorService.deleteLessonPdf(lessonId),
    onSuccess: () => {
      toast.success('جزوه حذف شد');
      queryClient.invalidateQueries({ queryKey: ['instructor', 'lessons', courseId] });
    },
    onError: () => toast.error('خطا در حذف جزوه'),
  });

  const handlePdfUpload = (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('فقط فایل PDF مجاز است');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از ۵۰ مگابایت باشد');
      return;
    }
    pdfUploadMutation.mutate({ lessonId, file });
  };

  const resetLessonForm = () => {
    setShowLessonForm(false);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonIsFree(false);
    setLessonIsPublished(true);
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonIsFree(lesson.isFree);
    setLessonIsPublished(lesson.isPublished);
    setShowLessonForm(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) {
      toast.error('عنوان درس را وارد کنید');
      return;
    }
    const data = { title: lessonTitle, isFree: lessonIsFree, isPublished: lessonIsPublished };
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, data });
    } else {
      createLessonMutation.mutate(data);
    }
  };

  const onSubmit = (data: CourseFormData) => {
    const payload = { ...data };
    if (!payload.shortDesc) delete payload.shortDesc;
    if (payload.discountPrice === 0) delete payload.discountPrice;
    updateMutation.mutate(payload);
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const levelOptions = [
    { value: 'BEGINNER', label: 'مبتدی' },
    { value: 'INTERMEDIATE', label: 'متوسط' },
    { value: 'ADVANCED', label: 'پیشرفته' },
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'پیش‌نویس' },
    { value: 'PUBLISHED', label: 'منتشر شده' },
  ];

  const categoryOptions = categories.map((cat: any) => ({
    value: cat.id,
    label: cat.nameFA,
  }));

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/instructor/courses"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <BookOpen className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ویرایش دوره</h1>
          <p className="text-sm text-gray-500">{course.title}</p>
        </div>
      </div>

      {/* Top Section: Course Info + Thumbnail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Course Form - 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Card 1: Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">اطلاعات اصلی</h2>
              </div>
              <div className="space-y-5">
                <Input
                  label="عنوان دوره"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <div>
                  <Input
                    label="نامک (Slug)"
                    dir="ltr"
                    className="text-left"
                    error={errors.slug?.message}
                    {...register('slug', { onChange: () => setAutoSlug(false) })}
                  />
                </div>
                <Textarea
                  label="توضیحات کامل"
                  rows={5}
                  error={errors.description?.message}
                  {...register('description')}
                />
                <Input
                  label="توضیح کوتاه"
                  error={errors.shortDesc?.message}
                  {...register('shortDesc')}
                />
              </div>
            </div>

            {/* Card 2: Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">قیمت‌گذاری</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="قیمت (تومان)"
                  type="number"
                  min={0}
                  error={errors.price?.message}
                  {...register('price')}
                />
                <Input
                  label="قیمت تخفیف (تومان)"
                  type="number"
                  min={0}
                  error={errors.discountPrice?.message}
                  {...register('discountPrice')}
                />
              </div>
            </div>

            {/* Card 3: Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">تنظیمات</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Select
                  label="سطح"
                  options={levelOptions}
                  error={errors.level?.message}
                  {...register('level')}
                />
                <Select
                  label="وضعیت"
                  options={statusOptions}
                  error={errors.status?.message}
                  {...register('status')}
                />
                <Select
                  label="دسته‌بندی"
                  options={categoryOptions}
                  error={errors.categoryId?.message}
                  {...register('categoryId')}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <Button type="submit" isLoading={updateMutation.isPending} disabled={!isDirty}>
                ذخیره تغییرات
              </Button>
              <Link href="/instructor/courses">
                <Button type="button" variant="ghost">
                  بازگشت
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Thumbnail - 1 column */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">تصویر شاخص</h2>
            <ThumbnailUploader
              courseId={courseId}
              currentThumbnail={thumbnail}
              onUploadComplete={(newThumbnail) => setThumbnail(newThumbnail)}
            />
          </div>
        </div>
      </div>

      {/* Lessons Section - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">مدیریت درس‌ها</h2>
            {lessons && (
              <span className="text-sm text-gray-400">({lessons.length} درس)</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetLessonForm();
              setShowLessonForm(true);
            }}
          >
            <Plus className="w-4 h-4 ml-1" />
            افزودن درس
          </Button>
        </div>

        {/* Add/Edit Lesson Form */}
        {showLessonForm && (
          <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                {editingLesson ? 'ویرایش درس' : 'افزودن درس جدید'}
              </h3>
              <button onClick={resetLessonForm} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="عنوان درس"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="عنوان درس را وارد کنید"
              />
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonIsFree}
                    onChange={(e) => setLessonIsFree(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  رایگان
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonIsPublished}
                    onChange={(e) => setLessonIsPublished(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  منتشر شده
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveLesson}
                  isLoading={createLessonMutation.isPending || updateLessonMutation.isPending}
                >
                  {editingLesson ? 'ذخیره تغییرات' : 'افزودن درس'}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetLessonForm}>
                  انصراف
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lessons List */}
        {lessonsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !lessons?.length ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">هنوز درسی اضافه نشده</p>
            <p className="text-sm text-gray-400 mt-1">برای شروع، دکمه «افزودن درس» را بزنید</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson: any, index: number) => {
              const isExpanded = expandedLessonId === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
                >
                  {/* Lesson Header - always visible */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleLesson(lesson.id)}
                  >
                    <span className="flex items-center justify-center w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.isFree && <Badge variant="info">رایگان</Badge>}
                      {!lesson.isPublished && <Badge variant="warning">پیش‌نویس</Badge>}
                      {lesson.video && <Badge variant="success">ویدیو</Badge>}
                      {lesson.pdfUrl && <Badge variant="success">جزوه</Badge>}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Lesson Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-5 bg-gray-50/50 space-y-5">
                      {/* Video Section */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                          <Film className="w-4 h-4" />
                          ویدیو درس
                        </h4>
                        <VideoUploader
                          lessonId={lesson.id}
                          existingVideo={lesson.video || undefined}
                          onUploadComplete={() => {
                            queryClient.invalidateQueries({
                              queryKey: ['instructor', 'lessons', courseId],
                            });
                          }}
                        />
                      </div>

                      {/* PDF Section */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                          <FileText className="w-4 h-4" />
                          جزوه PDF
                        </h4>
                        {lesson.pdfUrl ? (
                          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                            <FileText className="w-8 h-8 text-green-600" />
                            <div className="flex-1">
                              <p className="font-medium text-green-800">جزوه آپلود شده</p>
                              <p className="text-sm text-green-600">{lesson.pdfOriginalName || 'فایل PDF'}</p>
                            </div>
                            <button
                              onClick={() => pdfDeleteMutation.mutate(lesson.id)}
                              disabled={pdfDeleteMutation.isPending}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف جزوه"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => pdfInputRefs.current[lesson.id]?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-colors"
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                              فایل PDF جزوه را انتخاب کنید
                            </p>
                            <p className="text-xs text-gray-400 mt-1">حداکثر ۵۰ مگابایت</p>
                          </div>
                        )}
                        <input
                          ref={(el) => { pdfInputRefs.current[lesson.id] = el; }}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => handlePdfUpload(lesson.id, e)}
                        />
                      </div>

                      {/* Lesson Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLesson(lesson);
                          }}
                        >
                          <Edit3 className="w-4 h-4 ml-1" />
                          ویرایش عنوان
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingLessonId(lesson.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          حذف درس
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Lesson */}
      <ConfirmDialog
        isOpen={!!deletingLessonId}
        onClose={() => setDeletingLessonId(null)}
        onConfirm={() => deletingLessonId && deleteLessonMutation.mutate(deletingLessonId)}
        title="حذف درس"
        message="آیا از حذف این درس اطمینان دارید؟ ویدیو و جزوه مرتبط نیز حذف خواهند شد."
        isLoading={deleteLessonMutation.isPending}
      />
    </div>
  );
}
