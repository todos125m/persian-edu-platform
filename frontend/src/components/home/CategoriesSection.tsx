'use client';

import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Target,
  Calculator,
  ArrowLeft,
} from 'lucide-react';
import { toPersianNumber } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const iconMap: Record<string, any> = {
  'math': Calculator,
  'math-10': BookOpen,
  'math-11': BookOpen,
  'math-12': GraduationCap,
  'math-final': Target,
  'math-konkur': Trophy,
};

const colorMap: Record<string, { light: string; text: string }> = {
  'math-10': { light: 'bg-emerald-50', text: 'text-emerald-600' },
  'math-11': { light: 'bg-purple-50', text: 'text-purple-600' },
  'math-12': { light: 'bg-orange-50', text: 'text-orange-600' },
  'math-final': { light: 'bg-red-50', text: 'text-red-600' },
  'math-konkur': { light: 'bg-yellow-50', text: 'text-yellow-600' },
};

interface Category {
  id: string;
  name: string;
  nameFA: string;
  slug: string;
  icon?: string;
  _count?: { courses: number };
  children?: Category[];
}

export function CategoriesSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data as Category[];
    },
  });

  // Flatten: show subcategories only, filter out empty parents
  const displayCategories: Category[] = [];
  if (categories) {
    for (const cat of categories) {
      if (cat.children?.length) {
        for (const child of cat.children) {
          displayCategories.push(child);
        }
      } else if ((cat._count?.courses || 0) > 0) {
        displayCategories.push(cat);
      }
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="section-title">دسته‌بندی دوره‌ها</h2>
          <p className="section-subtitle mx-auto">
            پایه و سطح مورد نظرتان را انتخاب کنید
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {displayCategories.map((category) => {
            const Icon = iconMap[category.slug] || BookOpen;
            const colors = colorMap[category.slug] || { light: 'bg-blue-50', text: 'text-blue-600' };
            const count = category._count?.courses || 0;

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.nameFA}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-500">{toPersianNumber(count)} دوره</span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:-translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
