'use client';

import Link from 'next/link';
import { Search, Play, Users, BookOpen, Award } from 'lucide-react';
import { useSettingsStore } from '@/store';

export function HeroSection() {
  const get = useSettingsStore((s) => s.get);

  return (
    <section className="relative bg-gradient-to-bl from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white text-center lg:text-right">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {get('hero_title', 'مهارت‌های جدید یاد بگیرید و آینده‌تان را بسازید')}
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              {get('hero_subtitle', 'با بهترین دوره‌های آموزشی فارسی در زمینه برنامه‌نویسی، طراحی و کسب‌وکار، مسیر حرفه‌ای خود را شروع کنید')}
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl mx-auto lg:mx-0 mb-8">
              <input
                type="text"
                placeholder={get('hero_search_placeholder', 'دنبال چه دوره‌ای می‌گردید؟')}
                className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 transition-all"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium px-6 py-2 rounded-xl transition-colors">
                جستجو
              </button>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/courses"
                className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg"
              >
                {get('hero_btn_primary', 'مشاهده دوره‌ها')}
              </Link>
              <button className="btn border-2 border-white/30 text-white hover:bg-white/10 btn-lg">
                <Play className="w-5 h-5" />
                {get('hero_btn_secondary', 'ویدیو معرفی')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                value={get('stats_students', '۱۵,۰۰۰+')}
                label="دانشجوی فعال"
                color="bg-white"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                value={get('stats_courses', '۲۵۰+')}
                label="دوره آموزشی"
                color="bg-yellow-400"
                className="mt-8"
              />
              <StatCard
                icon={<Award className="w-6 h-6" />}
                value={get('stats_instructors', '۵۰+')}
                label="مدرس حرفه‌ای"
                color="bg-green-400"
              />
              <StatCard
                icon={<Play className="w-6 h-6" />}
                value={get('stats_hours', '۱,۵۰۰+')}
                label="ساعت ویدیو"
                color="bg-white"
                className="mt-8"
              />
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MobileStat value={get('stats_students', '۱۵,۰۰۰+')} label="دانشجو" />
          <MobileStat value={get('stats_courses', '۲۵۰+')} label="دوره" />
          <MobileStat value={get('stats_instructors', '۵۰+')} label="مدرس" />
          <MobileStat value={get('stats_hours', '۱,۵۰۰+')} label="ساعت ویدیو" />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  className = '',
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`${color} rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform ${className}`}
    >
      <div className="text-primary-600 mb-3">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

function MobileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-primary-200 text-sm">{label}</div>
    </div>
  );
}
