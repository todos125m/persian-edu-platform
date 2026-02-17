'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ClipboardCheck, Clock, Users, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';

export default function QuizzesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes', page],
    queryFn: async () => {
      const { data } = await api.get('/quizzes', { params: { page, limit: 12 } });
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ClipboardCheck className="w-4 h-4" />
            آزمون‌های آنلاین
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            دانشت رو بسنج!
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            با آزمون‌های تستی آنلاین، سطح خودت رو بسنج و نقاط ضعفت رو پیدا کن
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-20 text-gray-500">
            <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">هنوز آزمونی ثبت نشده</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((quiz: any) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-primary-600" />
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ClipboardCheck className="w-4 h-4" />
                    {quiz._count?.questions || 0} سوال
                  </span>
                  {quiz.duration > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.round(quiz.duration / 60)} دقیقه
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {quiz._count?.attempts || 0} شرکت‌کننده
                  </span>
                </div>
                {quiz.course && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {quiz.course.title}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: data.meta.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
