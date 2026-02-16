'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderTree, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService, AdminCategory } from '@/services/adminService';
import { generateSlug, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const categorySchema = z.object({
  name: z.string().min(1, 'نام انگلیسی الزامی است'),
  nameFA: z.string().min(1, 'نام فارسی الزامی است'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'فقط حروف انگلیسی کوچک، اعداد و خط تیره'),
  description: z.string().optional().or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  sortOrder: z.coerce.number().optional(),
  isActive: z.boolean(),
  parentId: z.string().optional().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminService.getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف دسته‌بندی');
      setDeletingId(null);
    },
  });

  const renderCategory = (cat: AdminCategory, depth = 0) => (
    <div key={cat.id}>
      <div
        className={cn(
          'flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors',
          depth > 0 && 'mr-8'
        )}
      >
        <div className="flex items-center gap-3">
          {cat.icon && <span className="text-lg">{cat.icon}</span>}
          <div>
            <p className="font-medium text-gray-900">{cat.nameFA}</p>
            <p className="text-xs text-gray-500">{cat.name} / {cat.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cat._count && (
            <span className="text-sm text-gray-500">
              {toPersianNumber(cat._count.courses)} دوره
            </span>
          )}
          <Badge variant={cat.isActive ? 'success' : 'neutral'}>
            {cat.isActive ? 'فعال' : 'غیرفعال'}
          </Badge>
          <button
            onClick={() => {
              setEditingCategory(cat);
              setShowForm(true);
            }}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(cat.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {cat.children?.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FolderTree className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">مدیریت دسته‌بندی‌ها</h1>
        </div>
        <Button onClick={() => { setEditingCategory(null); setShowForm(true); }}>
          <Plus className="w-5 h-5 ml-2" />
          افزودن دسته‌بندی
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !categories?.length ? (
          <p className="text-center py-8 text-gray-500">دسته‌بندی‌ای یافت نشد</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => renderCategory(cat))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          categories={categories || []}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف دسته‌بندی"
        message="آیا از حذف این دسته‌بندی اطمینان دارید؟"
        confirmText="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ====== Category Form Modal ======

function CategoryFormModal({
  category,
  categories,
  onClose,
}: {
  category: AdminCategory | null;
  categories: AdminCategory[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      nameFA: category?.nameFA || '',
      slug: category?.slug || '',
      description: category?.description || '',
      icon: category?.icon || '',
      sortOrder: category?.sortOrder || 0,
      isActive: category?.isActive ?? true,
      parentId: category?.parentId || '',
    },
  });

  const name = watch('name');

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      const payload = { ...data, parentId: data.parentId || undefined };
      return adminService.createCategory(payload as any);
    },
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ایجاد'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      const payload = { ...data, parentId: data.parentId || null };
      return adminService.updateCategory(category!.id, payload as any);
    },
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ویرایش'),
  });

  const onSubmit = (data: CategoryFormData) => {
    // Auto slug if empty
    if (!data.slug) data.slug = generateSlug(data.name);
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Flatten categories for parent select (exclude self and children)
  const parentOptions = categories
    .filter((c) => c.id !== category?.id)
    .map((c) => ({ value: c.id, label: c.nameFA }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="نام فارسی"
            placeholder="برنامه‌نویسی"
            error={errors.nameFA?.message}
            {...register('nameFA')}
          />
          <Input
            label="نام انگلیسی"
            placeholder="programming"
            dir="ltr"
            error={errors.name?.message}
            {...register('name', {
              onChange: (e) => {
                if (!isEdit) setValue('slug', generateSlug(e.target.value));
              },
            })}
          />
        </div>
        <Input
          label="آدرس (Slug)"
          placeholder="programming"
          dir="ltr"
          error={errors.slug?.message}
          {...register('slug')}
        />
        <Textarea
          label="توضیحات (اختیاری)"
          rows={2}
          {...register('description')}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="آیکون (ایموجی)"
            placeholder="💻"
            {...register('icon')}
          />
          <Input
            label="ترتیب"
            type="number"
            {...register('sortOrder')}
          />
          <Select
            label="والد"
            options={parentOptions}
            placeholder="بدون والد"
            {...register('parentId')}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            {...register('isActive')}
          />
          <span className="text-sm text-gray-700">فعال</span>
        </label>
        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            انصراف
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'ذخیره' : 'ایجاد'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
