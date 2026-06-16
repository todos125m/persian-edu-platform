'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { adminService, AdminLesson } from '@/services/adminService';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

const lessonSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().optional(),
  isFree: z.boolean(),
  isPublished: z.boolean(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormModalProps {
  courseId: string;
  lesson?: AdminLesson;
  onClose: () => void;
}

export default function LessonFormModal({
  courseId,
  lesson,
  onClose,
}: LessonFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!lesson;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      description: lesson?.description || '',
      isFree: lesson?.isFree || false,
      isPublished: lesson?.isPublished || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: LessonFormData) =>
      adminService.createLesson({ ...data, courseId }),
    onSuccess: () => {
      toast.success('درس با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
      onClose();
    },
    onError: () => toast.error('خطا در ایجاد درس'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: LessonFormData) =>
      adminService.updateLesson(lesson!.id, data),
    onSuccess: () => {
      toast.success('درس با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
      onClose();
    },
    onError: () => toast.error('خطا در ویرایش درس'),
  });

  const onSubmit = (data: LessonFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش درس' : 'افزودن درس جدید'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="عنوان درس"
          placeholder="مثال: حد و پیوستگی - جلسه اول"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="توضیحات (اختیاری)"
          placeholder="توضیح کوتاه درباره این درس..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              {...register('isFree')}
            />
            <span className="text-sm text-gray-700">رایگان</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              {...register('isPublished')}
            />
            <span className="text-sm text-gray-700">منتشر شده</span>
          </label>
        </div>

        <div className="flex items-center gap-3 justify-end pt-4">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            انصراف
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد درس'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
