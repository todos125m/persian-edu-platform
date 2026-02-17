'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

interface CourseReviewsProps {
  courseId: string;
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['reviews', courseId, page],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/course/${courseId}`, { params: { page, limit: 5 } });
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/reviews', { courseId, rating, comment });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
      toast.success('نظر شما ثبت شد و پس از تایید نمایش داده می‌شود');
      setRating(0);
      setComment('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ثبت نظر');
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.error('ابتدا وارد حساب کاربری خود شوید');
      return;
    }
    if (rating === 0) {
      toast.error('لطفاً امتیاز خود را انتخاب کنید');
      return;
    }
    submitMutation.mutate();
  };

  const reviews = data?.data || [];
  const stats = data?.stats || { average: 0, count: 0 };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          نظرات دانشجویان
        </h2>
        {stats.count > 0 && (
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-gray-900">{stats.average}</span>
            <span className="text-gray-500 text-sm">({stats.count} نظر)</span>
          </div>
        )}
      </div>

      {/* Submit Review */}
      {isAuthenticated && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">نظر شما:</p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-500 mr-2">
                {rating === 1 ? 'ضعیف' : rating === 2 ? 'متوسط' : rating === 3 ? 'خوب' : rating === 4 ? 'خیلی خوب' : 'عالی'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="نظر خود را بنویسید... (اختیاری)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
            />
            <Button onClick={handleSubmit} isLoading={submitMutation.isPending} size="sm">
              <Send className="w-4 h-4 ml-1" />
              ثبت
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 py-8">هنوز نظری ثبت نشده</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {review.user?.firstName?.[0]}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 text-sm">
                      {review.user?.firstName} {review.user?.lastName}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-600 text-sm mr-12">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
          {Array.from({ length: data.meta.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-xs ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
