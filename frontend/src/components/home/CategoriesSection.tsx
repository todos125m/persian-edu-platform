'use client';

import Link from 'next/link';
import {
  Code,
  Globe,
  Smartphone,
  Database,
  Brain,
  Palette,
  Shield,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import { toPersianNumber } from '@/lib/utils';

const categories = [
  {
    slug: 'programming',
    nameFA: 'برنامه‌نویسی',
    icon: Code,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    coursesCount: 45,
  },
  {
    slug: 'web-development',
    nameFA: 'طراحی وب',
    icon: Globe,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    coursesCount: 38,
  },
  {
    slug: 'mobile',
    nameFA: 'موبایل',
    icon: Smartphone,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    coursesCount: 22,
  },
  {
    slug: 'database',
    nameFA: 'پایگاه داده',
    icon: Database,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    coursesCount: 18,
  },
  {
    slug: 'ai-ml',
    nameFA: 'هوش مصنوعی',
    icon: Brain,
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    coursesCount: 28,
  },
  {
    slug: 'design',
    nameFA: 'طراحی',
    icon: Palette,
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50',
    coursesCount: 32,
  },
  {
    slug: 'security',
    nameFA: 'امنیت',
    icon: Shield,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    coursesCount: 15,
  },
  {
    slug: 'business',
    nameFA: 'کسب‌وکار',
    icon: Briefcase,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    coursesCount: 25,
  },
];

export function CategoriesSection() {
  return (
    <section className="section">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">دسته‌بندی دوره‌ها</h2>
          <p className="section-subtitle mx-auto">
            دوره مورد نظرتان را در دسته‌بندی‌های مختلف پیدا کنید
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: (typeof categories)[0] }) {
  const Icon = category.icon;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div
        className={`w-14 h-14 ${category.lightColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-7 h-7 text-${category.color.replace('bg-', '')}`} />
      </div>

      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {category.nameFA}
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {toPersianNumber(category.coursesCount)} دوره
        </span>
        <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:-translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
