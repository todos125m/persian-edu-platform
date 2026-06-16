'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag as TagIcon, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { tagsService, Tag } from '@/services/tagsService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export default function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: tagsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => tagsService.create(name),
    onSuccess: () => {
      toast.success('برچسب با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      setNewTagName('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد برچسب');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => {
      toast.success('برچسب با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف برچسب');
      setDeletingId(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    createMutation.mutate(name);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TagIcon className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">مدیریت برچسب‌ها</h1>
        </div>
      </div>

      {/* Add Tag Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">افزودن برچسب جدید</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="نام برچسب..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={createMutation.isPending}>
            <Plus className="w-5 h-5 ml-2" />
            افزودن
          </Button>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          برچسب‌ها ({tags ? toPersianNumber(tags.length) : '...'})
        </h2>

        {isLoading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
        ) : !tags?.length ? (
          <p className="text-center py-8 text-gray-500">برچسبی یافت نشد</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors group"
              >
                <span className="text-gray-800 font-medium">{tag.name}</span>
                {tag._count && (
                  <span className="text-xs text-gray-500">
                    ({toPersianNumber(tag._count.courses)})
                  </span>
                )}
                <button
                  onClick={() => setDeletingId(tag.id)}
                  className="p-0.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف برچسب"
        message="آیا از حذف این برچسب اطمینان دارید؟ این عمل برچسب را از تمام دوره‌ها حذف می‌کند."
        confirmText="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
