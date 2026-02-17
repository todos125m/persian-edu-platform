'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page, filter],
    queryFn: () => adminService.getReviews({ page, limit: 10, approved: filter }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleReviewApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success('وضعیت نظر تغییر کرد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success('نظر حذف شد');
      setDeletingId(null);
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت نظرات</h1>
            <p className="text-gray-500 text-sm mt-1">تایید و مدیریت نظرات کاربران</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'همه' },
          { value: 'false', label: 'در انتظار تایید' },
          { value: 'true', label: 'تایید شده' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">در حال بارگذاری...</div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center text-gray-500">هیچ نظری یافت نشد</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.data.map((review: any) => (
              <div key={review.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                      <div className="flex">{renderStars(review.rating)}</div>
                      <Badge variant={review.isApproved ? 'success' : 'warning'}>
                        {review.isApproved ? 'تایید شده' : 'در انتظار'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">دوره: {review.course?.title}</p>
                    {review.comment && (
                      <p className="text-gray-700 text-sm mt-2 bg-gray-50 rounded-lg p-3">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={review.isApproved ? 'text-orange-600' : 'text-green-600'}
                      onClick={() => toggleMutation.mutate(review.id)}
                    >
                      {review.isApproved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setDeletingId(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.meta.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف نظر"
        message="آیا از حذف این نظر اطمینان دارید؟"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
