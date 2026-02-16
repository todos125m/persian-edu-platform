'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const groupLabels: Record<string, string> = {
  general: 'عمومی',
  contact: 'تماس',
  social: 'شبکه‌های اجتماعی',
};

const settingLabels: Record<string, string> = {
  site_name: 'نام سایت',
  site_description: 'توضیحات سایت',
  contact_email: 'ایمیل تماس',
  contact_phone: 'تلفن تماس',
  social_instagram: 'اینستاگرام',
  social_telegram: 'تلگرام',
  social_linkedin: 'لینکدین',
};

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminService.getSettings,
  });

  // Init form values from API
  useEffect(() => {
    if (settings) {
      const flat: Record<string, string> = {};
      Object.values(settings).forEach((group: any) => {
        if (Array.isArray(group)) {
          group.forEach((s: any) => {
            flat[s.key] = s.value || '';
          });
        }
      });
      setValues(flat);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const settingsArray = Object.entries(values).map(([key, value]) => ({
        key,
        value,
      }));
      return adminService.updateSettings(settingsArray);
    },
    onSuccess: () => toast.success('تنظیمات با موفقیت ذخیره شد'),
    onError: () => toast.error('خطا در ذخیره تنظیمات'),
  });

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">تنظیمات سایت</h1>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">تنظیمات سایت</h1>
        </div>
        <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
          <Save className="w-4 h-4 ml-1" />
          ذخیره تنظیمات
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(settings).map(([group, items]: [string, any]) => {
          if (!Array.isArray(items)) return null;

          return (
            <div key={group} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {groupLabels[group] || group}
              </h2>
              <div className="space-y-4">
                {items.map((setting: any) => (
                  <Input
                    key={setting.key}
                    label={settingLabels[setting.key] || setting.key}
                    value={values[setting.key] || ''}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    dir={setting.key.startsWith('social_') || setting.key === 'contact_email' ? 'ltr' : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
