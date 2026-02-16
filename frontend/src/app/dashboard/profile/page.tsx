'use client';

import { useState } from 'react';
import { User, Mail, Phone, Camera, Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersService, UpdateProfileDto } from '@/services/usersService';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function DashboardProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      toast.error('لطفا نام و نام خانوادگی را وارد کنید');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: UpdateProfileDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      if (formData.phone) data.phone = formData.phone;

      const updated = await usersService.updateProfile(data);
      updateUser({ firstName: updated.firstName, lastName: updated.lastName });
      toast.success('پروفایل با موفقیت به‌روز شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">پروفایل</h1>
        <p className="text-gray-500">اطلاعات حساب کاربری خود را مدیریت کنید</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600">
                    {user?.firstName?.[0]}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 left-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
              {user?.role?.nameFA || 'کاربر'}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">ویرایش اطلاعات</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="نام"
                  placeholder="نام خود را وارد کنید"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <Input
                  label="نام خانوادگی"
                  placeholder="نام خانوادگی خود را وارد کنید"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              <Input
                label="ایمیل"
                type="email"
                value={user?.email || ''}
                disabled
                dir="ltr"
              />

              <Input
                label="شماره تلفن"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <div className="pt-2">
                <Button type="submit" isLoading={isSubmitting}>
                  <Save className="w-4 h-4 ml-2" />
                  ذخیره تغییرات
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
