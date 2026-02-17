'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardCheck, Trophy, Clock, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';

export default function DashboardQuizzesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-quiz-attempts', page],
    queryFn: async () => {
      const { data } = await api.get('/quizzes/my/attempts', { params: { page, limit: 10 } });
      return data;
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ClipboardCheck className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نتایج آزمون‌ها</h1>
          <p className="text-gray-500 text-sm mt-1">تاریخچه آزمون‌های شما</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">هنوز در هیچ آزمونی شرکت نکرده‌اید</p>
          <Link href="/quizzes" className="text-primary-600 font-medium hover:underline">
            مشاهده آزمون‌ها
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((attempt: any) => {
            const scoreColor =
              attempt.score >= 70 ? 'text-green-600' : attempt.score >= 40 ? 'text-yellow-600' : 'text-red-600';

            return (
              <div
                key={attempt.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                        attempt.score >= 70
                          ? 'bg-green-100 text-green-600'
                          : attempt.score >= 40
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {attempt.score}%
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{attempt.quiz?.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>
                          {attempt.correctAnswers}/{attempt.totalQuestions} صحیح
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60)
                            .toString()
                            .padStart(2, '0')}
                        </span>
                        <span>{new Date(attempt.createdAt).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                  </div>
                  {attempt.quiz?.slug && (
                    <Link
                      href={`/quizzes/${attempt.quiz.slug}`}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                    >
                      آزمون مجدد
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.meta.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm ${
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
