'use client';

import { Users, BookOpen, Award, PlayCircle } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '۱۵,۰۰۰+',
    label: 'دانشجوی فعال',
    description: 'در حال یادگیری',
  },
  {
    icon: BookOpen,
    value: '۲۵۰+',
    label: 'دوره آموزشی',
    description: 'در دسته‌های مختلف',
  },
  {
    icon: Award,
    value: '۵۰+',
    label: 'مدرس حرفه‌ای',
    description: 'با تجربه عملی',
  },
  {
    icon: PlayCircle,
    value: '۱,۵۰۰+',
    label: 'ساعت ویدیو',
    description: 'آموزش عملی',
  },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-primary-600">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white font-medium mb-1">{stat.label}</div>
              <div className="text-primary-200 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
