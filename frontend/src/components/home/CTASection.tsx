'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store';

export function CTASection() {
  const get = useSettingsStore((s) => s.get);

  return (
    <section className="section">
      <div className="container">
        <div className="relative bg-gradient-to-bl from-primary-600 to-primary-800 rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative px-6 py-12 md:px-12 md:py-16 lg:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              {get('cta_badge', 'شروع کنید - رایگان')}
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 max-w-2xl mx-auto">
              {get('cta_title', 'همین امروز یادگیری را شروع کنید')}
            </h2>

            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
              {get('cta_subtitle', 'با ثبت‌نام رایگان، به بخشی از دوره‌ها دسترسی پیدا کنید و مسیر حرفه‌ای خود را شروع کنید')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg"
              >
                ثبت‌نام رایگان
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/courses"
                className="btn border-2 border-white/30 text-white hover:bg-white/10 btn-lg"
              >
                مشاهده دوره‌ها
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
