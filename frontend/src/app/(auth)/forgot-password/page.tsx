'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import Captcha from '@/components/ui/Captcha';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

type Method = 'phone' | 'email';
type Step = 'input' | 'otp' | 'newPassword' | 'done';

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<Method>('phone');
  const [step, setStep] = useState<Step>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(180);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error('لطفا کد امنیتی را وارد کنید');
      return;
    }

    if (method === 'phone' && !phone.match(/^09[0-9]{9}$/)) {
      toast.error('شماره موبایل معتبر نیست');
      return;
    }
    if (method === 'email' && !email) {
      toast.error('ایمیل را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      if (method === 'phone') {
        await authService.forgotPasswordByPhone(phone);
        startCountdown();
        setStep('otp');
        toast.success('کد تایید ارسال شد');
      } else {
        await authService.forgotPassword(email);
        setStep('done');
      }
    } catch {
      toast.error('خطا در ارسال. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 5) {
      toast.error('کد تایید ۵ رقمی را وارد کنید');
      return;
    }
    setIsLoading(true);
    try {
      await authService.verifyOtp(phone, otpCode);
      setStep('newPassword');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'کد تایید اشتباه است');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('رمز عبور و تکرار آن یکسان نیست');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPasswordByPhone(phone, otpCode, newPassword);
      toast.success('رمز عبور تغییر کرد');
      setStep('done');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در تغییر رمز عبور');
    } finally {
      setIsLoading(false);
    }
  };

  // Done state
  if (step === 'done') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {method === 'email' ? 'ایمیل ارسال شد' : 'رمز عبور تغییر کرد'}
        </h1>
        <p className="text-gray-500 mb-6">
          {method === 'email'
            ? 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد.'
            : 'رمز عبور جدید شما ذخیره شد. اکنون می‌توانید وارد شوید.'}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          رفتن به صفحه ورود
        </Link>
      </div>
    );
  }

  // OTP step
  if (step === 'otp') {
    return (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">کد تایید</h1>
          <p className="text-gray-500">
            کد ۵ رقمی ارسال شده به <span className="font-medium text-gray-700" dir="ltr">{phone}</span> را وارد کنید
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <Input
            type="text"
            placeholder="کد ۵ رقمی"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            dir="ltr"
            className="text-center text-2xl tracking-[0.5em] font-bold"
            maxLength={5}
          />
          {countdown > 0 && (
            <p className="text-sm text-gray-500 text-center">
              ارسال مجدد تا {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
          )}
          {countdown === 0 && (
            <button
              type="button"
              onClick={() => {
                setCaptchaVerified(true);
                handleSendCode({ preventDefault: () => {} } as React.FormEvent);
              }}
              className="text-sm text-primary-600 hover:underline w-full text-center"
            >
              ارسال مجدد کد
            </button>
          )}
          <Button type="submit" fullWidth isLoading={isLoading}>
            تایید کد
          </Button>
        </form>
      </div>
    );
  }

  // New password step
  if (step === 'newPassword') {
    return (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">رمز عبور جدید</h1>
          <p className="text-gray-500">رمز عبور جدید خود را وارد کنید</p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
              dir="ltr"
            />
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              placeholder="تکرار رمز عبور جدید"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
              dir="ltr"
            />
          </div>
          <Button type="submit" fullWidth isLoading={isLoading}>
            ذخیره رمز عبور جدید
          </Button>
        </form>
      </div>
    );
  }

  // Initial input step
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">بازیابی رمز عبور</h1>
        <p className="text-gray-500">روش بازیابی را انتخاب کنید</p>
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            method === 'phone' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          شماره موبایل
        </button>
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            method === 'email' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          ایمیل
        </button>
      </div>

      <form onSubmit={handleSendCode} className="space-y-5">
        {method === 'phone' ? (
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="tel"
              placeholder="شماره موبایل (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"
              className="pr-10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </div>
        ) : (
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
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">کد امنیتی</label>
          <Captcha onVerify={setCaptchaVerified} />
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} disabled={!captchaVerified}>
          {method === 'phone' ? 'ارسال کد تایید' : 'ارسال لینک بازیابی'}
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
