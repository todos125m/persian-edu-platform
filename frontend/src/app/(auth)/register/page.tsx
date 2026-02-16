'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import Captcha from '@/components/ui/Captcha';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    email: z.string().email('ایمیل معتبر نیست'),
    phone: z
      .string()
      .regex(/^09[0-9]{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
      .optional()
      .or(z.literal('')),
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیست',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!captchaVerified) {
      toast.error('لطفا کپچا را حل کنید');
      return;
    }
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);
      storeLogin(response.user, response.token, response.refreshToken);
      toast.success('ثبت‌نام با موفقیت انجام شد!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ثبت‌نام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ثبت‌نام</h1>
        <p className="text-gray-500">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/login" className="text-primary-600 hover:underline">
            وارد شوید
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              {...register('firstName')}
              placeholder="نام"
              className="pr-10"
              error={errors.firstName?.message}
            />
          </div>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              {...register('lastName')}
              placeholder="نام خانوادگی"
              className="pr-10"
              error={errors.lastName?.message}
            />
          </div>
        </div>

        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            {...register('email')}
            type="email"
            placeholder="ایمیل"
            className="pr-10"
            error={errors.email?.message}
            dir="ltr"
          />
        </div>

        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            {...register('phone')}
            type="tel"
            placeholder="شماره موبایل (اختیاری)"
            className="pr-10"
            error={errors.phone?.message}
            dir="ltr"
          />
        </div>

        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="رمز عبور"
            className="pr-10 pl-10"
            error={errors.password?.message}
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="تکرار رمز عبور"
            className="pr-10"
            error={errors.confirmPassword?.message}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">کد امنیتی</label>
          <Captcha onVerify={setCaptchaVerified} />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            required
            className="mt-1 rounded border-gray-300 text-primary-600"
          />
          <span className="text-sm text-gray-600">
            با{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              قوانین و مقررات
            </Link>{' '}
            سایت موافقم
          </span>
        </label>

        <Button type="submit" fullWidth isLoading={isLoading} disabled={!captchaVerified}>
          ثبت‌نام
        </Button>
      </form>
    </div>
  );
}
