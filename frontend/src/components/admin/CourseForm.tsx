'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { adminService, AdminCourse } from '@/services/adminService';
import { generateSlug } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const courseSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'فقط حروف انگلیسی کوچک، اعداد و خط تیره'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  shortDesc: z.string().optional().or(z.literal('')),
  thumbnail: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'قیمت نامعتبر'),
  discountPrice: z.coerce.number().optional().or(z.literal(0)),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  isFeatured: z.boolean(),
  categoryId: z.string().min(1, 'دسته‌بندی انتخاب نشده'),
  metaTitle: z.string().optional().or(z.literal('')),
  metaDescription: z.string().optional().or(z.literal('')),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: AdminCourse;
  mode: 'create' | 'edit';
}

const levelOptions = [
  { value: 'BEGINNER', label: 'مبتدی' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'پیشرفته' },
];

const statusOptions = [
  { value: 'DRAFT', label: 'پیش‌نویس' },
  { value: 'PUBLISHED', label: 'منتشر شده' },
  { value: 'ARCHIVED', label: 'آرشیو' },
];

export default function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminService.getCategories,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      shortDesc: initialData?.shortDesc || '',
      thumbnail: initialData?.thumbnail || '',
      price: initialData?.price || 0,
      discountPrice: initialData?.discountPrice || 0,
      level: initialData?.level || 'BEGINNER',
      status: initialData?.status || 'DRAFT',
      isFeatured: initialData?.isFeatured || false,
      categoryId: initialData?.categoryId || '',
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
    },
  });

  const title = watch('title');
  const slug = watch('slug');

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && title && (!slug || slug === generateSlug(title.slice(0, -1)))) {
      setValue('slug', generateSlug(title));
    }
  }, [title, slug, mode, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => adminService.createCourse(data),
    onSuccess: () => {
      toast.success('دوره با موفقیت ایجاد شد');
      router.push('/admin/courses');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد دوره');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CourseFormData) =>
      adminService.updateCourse(initialData!.id, data),
    onSuccess: () => {
      toast.success('دوره با موفقیت ویرایش شد');
      router.push('/admin/courses');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش دوره');
    },
  });

  const onSubmit = (data: CourseFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const categoryOptions = (categories || []).map((c: any) => ({
    value: c.id,
    label: c.nameFA,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* اطلاعات اصلی */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">اطلاعات اصلی</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="عنوان دوره"
              placeholder="مثال: آموزش جامع React"
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="آدرس (Slug)"
              placeholder="react-course"
              dir="ltr"
              error={errors.slug?.message}
              {...register('slug')}
            />
          </div>
          <Textarea
            label="توضیحات کامل"
            placeholder="توضیحات دوره را وارد کنید..."
            rows={5}
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            label="توضیح کوتاه (اختیاری)"
            placeholder="یک خلاصه کوتاه از دوره"
            error={errors.shortDesc?.message}
            {...register('shortDesc')}
          />
        </div>
      </div>

      {/* رسانه */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">رسانه</h2>
        <Input
          label="آدرس تصویر شاخص"
          placeholder="https://example.com/thumbnail.jpg"
          dir="ltr"
          error={errors.thumbnail?.message}
          {...register('thumbnail')}
        />
      </div>

      {/* قیمت‌گذاری */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">قیمت‌گذاری</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="قیمت (تومان)"
            type="number"
            placeholder="0"
            error={errors.price?.message}
            {...register('price')}
          />
          <Input
            label="قیمت با تخفیف (تومان)"
            type="number"
            placeholder="0"
            hint="اگر تخفیف ندارد خالی بگذارید"
            error={errors.discountPrice?.message}
            {...register('discountPrice')}
          />
        </div>
      </div>

      {/* تنظیمات */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">تنظیمات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="سطح دوره"
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
            placeholder="انتخاب کنید"
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              {...register('isFeatured')}
            />
            <span className="text-sm text-gray-700">دوره ویژه</span>
          </label>
        </div>
      </div>

      {/* سئو */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">سئو</h2>
        <div className="space-y-4">
          <Input
            label="عنوان سئو (اختیاری)"
            placeholder="عنوان صفحه در موتورهای جستجو"
            error={errors.metaTitle?.message}
            {...register('metaTitle')}
          />
          <Textarea
            label="توضیحات سئو (اختیاری)"
            placeholder="توضیحات صفحه در موتورهای جستجو"
            rows={3}
            error={errors.metaDescription?.message}
            {...register('metaDescription')}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.push('/admin/courses')}
          disabled={isLoading}
        >
          انصراف
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'ایجاد دوره' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </form>
  );
}
