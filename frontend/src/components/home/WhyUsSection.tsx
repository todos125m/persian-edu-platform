'use client';

import {
  Video,
  Clock,
  RefreshCw,
  MessageCircle,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'آموزش ویدیویی مفهومی',
    description: 'تدریس مفهومی با حل مثال‌های متنوع و تست‌های کنکور سراسری',
  },
  {
    icon: Clock,
    title: 'دسترسی نامحدود',
    description: 'یکبار خرید کنید و تا روز کنکور به دوره دسترسی داشته باشید',
  },
  {
    icon: RefreshCw,
    title: 'به‌روز با کنکور',
    description: 'دوره‌ها بر اساس آخرین تغییرات کنکور و کتاب‌های درسی بروزرسانی می‌شوند',
  },
  {
    icon: MessageCircle,
    title: 'رفع اشکال آنلاین',
    description: 'سوالاتتان را بپرسید و پاسخ سریع از مدرسین دریافت کنید',
  },
  {
    icon: Shield,
    title: 'ضمانت بازگشت وجه',
    description: '۷ روز ضمانت بازگشت وجه بدون قید و شرط',
  },
  {
    icon: Zap,
    title: 'تست‌زنی و آزمون آنلاین',
    description: 'با آزمون‌های شبیه‌ساز کنکور، سرعت و دقت خود را بالا ببرید',
  },
];

export function WhyUsSection() {
  return (
    <section className="section bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">چرا آکادمی؟</h2>
          <p className="section-subtitle mx-auto">
            دلایلی که ما را به بهترین انتخاب برای یادگیری تبدیل می‌کند
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <feature.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
