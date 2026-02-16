'use client';

import { useState } from 'react';
import { Lock, Bell, Eye, EyeOff, Save, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';

export default function DashboardSettingsPage() {
  const { user } = useAuthStore();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    courseUpdates: true,
    promotions: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.error('لطفا رمز عبور فعلی و جدید را وارد کنید');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('رمز عبور جدید باید حداقل ۸ کاراکتر باشد');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('رمز عبور با موفقیت تغییر کرد');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'خطا در تغییر رمز عبور');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationSave = () => {
    toast.success('تنظیمات اعلان‌ها ذخیره شد');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تنظیمات</h1>
        <p className="text-gray-500">تنظیمات حساب کاربری و امنیت</p>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">تغییر رمز عبور</h2>
              <p className="text-sm text-gray-500">رمز عبور خود را تغییر دهید</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="relative">
              <Input
                label="رمز عبور فعلی"
                type={showOldPassword ? 'text' : 'password'}
                placeholder="رمز عبور فعلی"
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="رمز عبور جدید"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="حداقل ۸ کاراکتر"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Input
              label="تکرار رمز عبور جدید"
              type="password"
              placeholder="تکرار رمز عبور جدید"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              dir="ltr"
            />

            <Button type="submit" isLoading={isChangingPassword}>
              <Save className="w-4 h-4 ml-2" />
              تغییر رمز عبور
            </Button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">اعلان‌ها</h2>
              <p className="text-sm text-gray-500">تنظیمات دریافت اعلان‌ها</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            {[
              { key: 'email' as const, label: 'اعلان ایمیلی', desc: 'دریافت اعلان‌ها از طریق ایمیل' },
              { key: 'sms' as const, label: 'اعلان پیامکی', desc: 'دریافت اعلان‌ها از طریق پیامک' },
              { key: 'courseUpdates' as const, label: 'به‌روزرسانی دوره‌ها', desc: 'اطلاع‌رسانی درباره دوره‌های جدید و به‌روزرسانی‌ها' },
              { key: 'promotions' as const, label: 'تخفیف‌ها و پیشنهادات', desc: 'دریافت اطلاع‌رسانی تخفیف‌ها' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 transition-colors" />
                  <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:-translate-x-5 transition-transform" />
                </div>
              </label>
            ))}

            <Button onClick={handleNotificationSave} variant="secondary">
              ذخیره تنظیمات
            </Button>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">امنیت حساب</h2>
              <p className="text-sm text-gray-500">وضعیت امنیت حساب کاربری</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">ایمیل</span>
              <span className="text-sm font-medium text-gray-900" dir="ltr">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-600">نقش</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.role?.nameFA || 'کاربر'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
