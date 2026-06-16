'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, DollarSign, Settings, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { instructorService } from '@/services/instructorService';
import { generateSlug } from '@/lib/utils';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

const courseSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  slug: z.string().min(3, 'نامک باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  shortDesc: z.string().optional(),
  price: z.coerce.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  discountPrice: z.coerce.number().min(0, 'قیمت تخفیف نمی‌تواند منفی باشد').optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    required_error: 'سطح دوره را انتخاب کنید',
  }),
  categoryId: z.string().min(1, 'دسته‌بندی را انتخاب کنید'),
  status: z.enum(['DRAFT', 'PUBLISHED'], {
    required_error: 'وضعیت دوره را انتخاب کنید',
  }),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Category {
  id: string;
  nameFA: string;
  slug: string;
}

export default function InstructorNewCoursePage() {
  const router = useRouter();
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      shortDesc: '',
      price: 0,
      discountPrice: 0,
      level: 'BEGINNER',
      status: 'DRAFT',
      categoryId: '',
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (autoSlug && title) {
      setValue('slug', generateSlug(title));
    }
  }, [title, autoSlug, setValue]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => instructorService.createCourse(data),
    onSuccess: (course: any) => {
      toast.success('دوره با موفقیت ایجاد شد! اکنون می‌توانید تصویر و درس‌ها را اضافه کنید.');
      router.push(`/instructor/courses/${course.id}/edit`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'خطا در ایجاد دوره';
      toast.error(message);
    },
  });

  const onSubmit = (data: CourseFormData) => {
    const payload = { ...data };
    if (!payload.shortDesc) delete payload.shortDesc;
    if (payload.discountPrice === 0) delete payload.discountPrice;
    createMutation.mutate(payload);
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

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.nameFA,
  }));

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
        <h1 className="text-2xl font-bold text-gray-900">ایجاد دوره جدید</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {/* Card 1: Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">اطلاعات اصلی</h2>
          </div>
          <div className="space-y-5">
            <Input
              label="عنوان دوره"
              placeholder="مثلا: ریاضی یازدهم - مثلثات"
              error={errors.title?.message}
              {...register('title')}
            />
            <div>
              <Input
                label="نامک (Slug)"
                dir="ltr"
                className="text-left"
                placeholder="course-slug"
                error={errors.slug?.message}
                {...register('slug', {
                  onChange: () => setAutoSlug(false),
                })}
              />
              <p className="mt-1 text-xs text-gray-400">
                نامک به صورت خودکار از عنوان تولید می‌شود.
              </p>
            </div>
            <Textarea
              label="توضیحات کامل"
              placeholder="توضیحات دوره را وارد کنید..."
              rows={5}
              error={errors.description?.message}
              {...register('description')}
            />
            <Input
              label="توضیح کوتاه"
              placeholder="یک جمله کوتاه درباره دوره"
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
              placeholder="0"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="قیمت تخفیف‌خورده (تومان)"
              type="number"
              min={0}
              placeholder="0"
              hint="خالی بگذارید اگر تخفیف ندارد"
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
              label="سطح دوره"
              options={levelOptions}
              placeholder="انتخاب سطح"
              error={errors.level?.message}
              {...register('level')}
            />
            <Select
              label="وضعیت"
              options={statusOptions}
              placeholder="انتخاب وضعیت"
              error={errors.status?.message}
              {...register('status')}
            />
            <Select
              label="دسته‌بندی"
              options={categoryOptions}
              placeholder="انتخاب دسته‌بندی"
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />
          </div>
        </div>

        {/* Card 4: Info */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800">
            پس از ایجاد دوره، به صفحه ویرایش هدایت می‌شوید تا بتوانید <strong>تصویر شاخص</strong>، <strong>ویدیوهای درس‌ها</strong> و <strong>جزوات PDF</strong> را آپلود کنید.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={createMutation.isPending}>
            ایجاد دوره
          </Button>
          <Link href="/instructor/courses">
            <Button type="button" variant="ghost">
              انصراف
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
