'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Download, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

export default function DashboardCertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const { data } = await api.get('/certificates/my');
      return data;
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Award className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">گواهینامه‌ها</h1>
          <p className="text-gray-500 text-sm mt-1">گواهینامه‌های صادر شده برای شما</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : !certificates?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">هنوز گواهینامه‌ای صادر نشده</p>
          <p className="text-sm text-gray-400">با تکمیل ۱۰۰٪ دوره‌ها، گواهینامه دریافت کنید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert: any) => (
            <div
              key={cert.id}
              className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border-2 border-primary-200 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-primary-100/50 rounded-full -translate-x-8 -translate-y-8" />
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-primary-100/30 rounded-full translate-x-4 translate-y-4" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <Award className="w-10 h-10 text-primary-600" />
                  <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded">
                    {cert.certificateNo}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{cert.course?.title}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  صادر شده در {new Date(cert.issuedAt).toLocaleDateString('fa-IR')}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/verify/${cert.certificateNo}`
                      );
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    لینک تایید
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
