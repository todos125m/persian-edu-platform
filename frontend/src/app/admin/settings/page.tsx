'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Settings, Save, Globe, Image, BarChart3,
  Megaphone, Phone, Share2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: { key: string; label: string; dir?: 'ltr' | 'rtl'; multiline?: boolean; placeholder?: string }[];
}

const sections: SettingSection[] = [
  {
    id: 'general',
    title: 'عمومی و ظاهر',
    icon: <Globe className="w-5 h-5" />,
    fields: [
      { key: 'site_name', label: 'نام سایت', placeholder: 'مثلا: آکادمی آموزش' },
      { key: 'site_description', label: 'توضیحات سایت', multiline: true },
      { key: 'site_logo', label: 'آدرس لوگو (URL)', dir: 'ltr', placeholder: 'https://example.com/logo.png' },
      { key: 'site_favicon', label: 'آدرس فاویکون (URL)', dir: 'ltr', placeholder: 'https://example.com/favicon.ico' },
      { key: 'site_copyright', label: 'متن کپی‌رایت فوتر' },
    ],
  },
  {
    id: 'hero',
    title: 'بنر صفحه اصلی',
    icon: <Image className="w-5 h-5" />,
    fields: [
      { key: 'hero_title', label: 'تیتر اصلی بنر' },
      { key: 'hero_subtitle', label: 'توضیحات زیر تیتر', multiline: true },
      { key: 'hero_search_placeholder', label: 'متن جستجو' },
      { key: 'hero_btn_primary', label: 'متن دکمه اول' },
      { key: 'hero_btn_secondary', label: 'متن دکمه دوم' },
    ],
  },
  {
    id: 'stats',
    title: 'آمار صفحه اصلی',
    icon: <BarChart3 className="w-5 h-5" />,
    fields: [
      { key: 'stats_students', label: 'تعداد دانشجو', placeholder: 'مثلا: ۱۵,۰۰۰+' },
      { key: 'stats_courses', label: 'تعداد دوره', placeholder: 'مثلا: ۲۵۰+' },
      { key: 'stats_instructors', label: 'تعداد مدرس', placeholder: 'مثلا: ۵۰+' },
      { key: 'stats_hours', label: 'ساعت ویدیو', placeholder: 'مثلا: ۱,۵۰۰+' },
    ],
  },
  {
    id: 'cta',
    title: 'بخش فراخوان (CTA)',
    icon: <Megaphone className="w-5 h-5" />,
    fields: [
      { key: 'cta_badge', label: 'متن بج (نشان)', placeholder: 'مثلا: شروع کنید - رایگان' },
      { key: 'cta_title', label: 'تیتر فراخوان' },
      { key: 'cta_subtitle', label: 'توضیحات فراخوان', multiline: true },
    ],
  },
  {
    id: 'contact',
    title: 'اطلاعات تماس',
    icon: <Phone className="w-5 h-5" />,
    fields: [
      { key: 'contact_email', label: 'ایمیل تماس', dir: 'ltr' },
      { key: 'contact_phone', label: 'تلفن تماس', dir: 'ltr' },
      { key: 'contact_address', label: 'آدرس' },
    ],
  },
  {
    id: 'social',
    title: 'شبکه‌های اجتماعی',
    icon: <Share2 className="w-5 h-5" />,
    fields: [
      { key: 'social_instagram', label: 'لینک اینستاگرام', dir: 'ltr', placeholder: 'https://instagram.com/...' },
      { key: 'social_telegram', label: 'لینک تلگرام', dir: 'ltr', placeholder: 'https://t.me/...' },
      { key: 'social_linkedin', label: 'لینک لینکدین', dir: 'ltr', placeholder: 'https://linkedin.com/...' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('general');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminService.getSettings,
  });

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

  return (
    <div>
      {/* Header */}
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

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 p-2 sticky top-24">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="text-primary-600">{section.icon}</span>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              </div>

              {/* Logo Preview */}
              {section.id === 'general' && values.site_logo && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">پیش‌نمایش لوگو:</p>
                  <img
                    src={values.site_logo}
                    alt="لوگو"
                    className="h-16 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <div className={`grid gap-4 ${
                section.id === 'stats' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
              }`}>
                {section.fields.map((field) =>
                  field.multiline ? (
                    <Textarea
                      key={field.key}
                      label={field.label}
                      value={values[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      rows={3}
                      dir={field.dir}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      key={field.key}
                      label={field.label}
                      value={values[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      dir={field.dir}
                      placeholder={field.placeholder}
                    />
                  )
                )}
              </div>
            </div>
          ))}

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-2 pb-8">
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              <Save className="w-4 h-4 ml-1" />
              ذخیره همه تنظیمات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
