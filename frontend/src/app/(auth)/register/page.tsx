'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import Captcha from '@/components/ui/Captcha';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

const gradeOptions = [
  { value: '', label: 'انتخاب پایه تحصیلی (اختیاری)' },
  { value: 'GRADE_10', label: 'دهم' },
  { value: 'GRADE_11', label: 'یازدهم' },
  { value: 'GRADE_12', label: 'دوازدهم' },
  { value: 'GRADUATED', label: 'فارغ‌التحصیل' },
];

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    email: z.string().email('ایمیل معتبر نیست'),
    phone: z
      .string()
      .regex(/^09[0-9]{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'),
    grade: z.string().optional(),
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
      toast.error('لطفا کد امنیتی را وارد کنید');
      return;
    }
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      const payload: any = { ...registerData };
      if (!payload.grade) delete payload.grade;
      const response = await authService.register(payload);
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
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            {...register('phone')}
            type="tel"
            placeholder="شماره موبایل (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"
            className="pr-10"
            error={errors.phone?.message}
            dir="ltr"
          />
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

        {/* Grade Selection */}
        <div className="relative">
          <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            {...register('grade')}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors appearance-none"
          >
            {gradeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="رمز عبور (حداقل ۸ کاراکتر)"
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
