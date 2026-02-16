'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import Captcha from '@/components/ui/Captcha';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('لطفا ایمیل خود را وارد کنید');
      return;
    }
    if (!captchaVerified) {
      toast.error('لطفا کپچا را حل کنید');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1500));
      setIsSent(true);
    } catch {
      toast.error('خطا در ارسال ایمیل. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">ایمیل ارسال شد</h1>
        <p className="text-gray-500 mb-6">
          لینک بازیابی رمز عبور به <span className="font-medium text-gray-700" dir="ltr">{email}</span> ارسال شد.
          لطفا صندوق ورودی خود را بررسی کنید.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به صفحه ورود
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">بازیابی رمز عبور</h1>
        <p className="text-gray-500">
          ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="email"
            placeholder="ایمیل"
            className="pr-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">کد امنیتی</label>
          <Captcha onVerify={setCaptchaVerified} />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} disabled={!captchaVerified}>
          ارسال لینک بازیابی
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به صفحه ورود
        </Link>
      </div>
    </div>
  );
}
