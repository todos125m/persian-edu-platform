'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Linkedin,
  Clock,
  MessageSquare,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Captcha from '@/components/ui/Captcha';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { useSettingsStore } from '@/store';

const contactInfo = [
  {
    icon: Phone,
    title: 'تلفن پشتیبانی',
    value: '۰۲۱-۱۲۳۴-۵۶۷۸',
    dirLtr: true,
  },
  {
    icon: Mail,
    title: 'ایمیل',
    value: 'info@academy.ir',
    dirLtr: true,
  },
  {
    icon: MapPin,
    title: 'آدرس',
    value: 'تهران، خیابان آزادی، پلاک ۱۲۳',
    dirLtr: false,
  },
  {
    icon: Clock,
    title: 'ساعات کاری',
    value: 'شنبه تا پنج‌شنبه - ۹ صبح تا ۶ عصر',
    dirLtr: false,
  },
];

export default function ContactPage() {
  const get = useSettingsStore((s) => s.get);
  const socialInstagram = get('social_instagram');
  const socialTelegram = get('social_telegram');
  const socialLinkedin = get('social_linkedin');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('لطفا فیلدهای الزامی را پر کنید');
      return;
    }
    if (!captchaVerified) {
      toast.error('لطفا کپچا را حل کنید');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/contact', formData);
      toast.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('خطا در ارسال پیام. لطفا دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            تماس با ما
          </h1>
          <p className="text-primary-100 text-lg">
            سوالی دارید؟ ما آماده پاسخگویی هستیم
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">ارسال پیام</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="نام و نام خانوادگی *"
                      placeholder="نام خود را وارد کنید"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      label="ایمیل *"
                      type="email"
                      placeholder="example@email.com"
                      dir="ltr"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <Input
                    label="موضوع"
                    placeholder="موضوع پیام خود را وارد کنید"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                  <Textarea
                    label="پیام *"
                    placeholder="پیام خود را بنویسید..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">کد امنیتی</label>
                    <Captcha onVerify={setCaptchaVerified} />
                  </div>

                  <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!captchaVerified}>
                    <Send className="w-4 h-4 ml-2" />
                    ارسال پیام
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{info.title}</p>
                      <p
                        className="font-medium text-gray-900 mt-1"
                        dir={info.dirLtr ? 'ltr' : undefined}
                      >
                        {info.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-3">شبکه‌های اجتماعی</p>
                <div className="flex gap-3">
                  {socialInstagram && (
                    <a
                      href={socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialTelegram && (
                    <a
                      href={socialTelegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinkedin && (
                    <a
                      href={socialLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {!socialInstagram && !socialTelegram && !socialLinkedin && (
                    <p className="text-sm text-gray-400">لینکی تنظیم نشده است</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
