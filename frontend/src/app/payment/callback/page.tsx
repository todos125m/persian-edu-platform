'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentsService } from '@/services';
import { Button } from '@/components/ui';

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary-600" /></div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const authority = searchParams.get('Authority');
    const paymentStatus = searchParams.get('Status');

    if (!authority) {
      setStatus('failed');
      setMessage('اطلاعات پرداخت نامعتبر است');
      return;
    }

    try {
      const result = await paymentsService.verify(authority, paymentStatus || 'OK');
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setRefId(result.refId);
      } else {
        setStatus('failed');
        setMessage(result.message);
      }
    } catch (error: any) {
      setStatus('failed');
      setMessage(error.response?.data?.message || 'خطا در تأیید پرداخت');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              در حال بررسی پرداخت...
            </h1>
            <p className="text-gray-500">لطفاً صبر کنید</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              پرداخت موفق!
            </h1>
            <p className="text-gray-500 mb-4">{message}</p>
            {refId && (
              <p className="text-sm text-gray-400 mb-6">
                شماره پیگیری: {refId}
              </p>
            )}
            <div className="space-y-3">
              <Button fullWidth onClick={() => router.push('/dashboard/courses')}>
                مشاهده دوره‌های من
              </Button>
              <Button variant="outline" fullWidth onClick={() => router.push('/courses')}>
                مشاهده دوره‌های بیشتر
              </Button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              پرداخت ناموفق
            </h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="space-y-3">
              <Button fullWidth onClick={() => router.push('/dashboard')}>
                بازگشت به داشبورد
              </Button>
              <Button variant="outline" fullWidth onClick={() => router.push('/courses')}>
                مشاهده دوره‌ها
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
