'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid3X3, BookOpen, ArrowLeft } from 'lucide-react';
import { categoriesService, Category } from '@/services/categoriesService';
import { toPersianNumber } from '@/lib/utils';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <Grid3X3 className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            دسته‌بندی دوره‌ها
          </h1>
          <p className="text-primary-100 text-lg">
            دوره مورد نظر خود را از بین دسته‌بندی‌ها پیدا کنید
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    {category.icon ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <BookOpen className="w-7 h-7 text-primary-600" />
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {category.nameFA || category.name}
                  </h2>

                  {category.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {toPersianNumber(category._count?.courses || 0)} دوره
                    </span>
                    <ArrowLeft className="w-5 h-5 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Children */}
                  {category.children && category.children.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {category.children.map((child) => (
                          <span
                            key={child.id}
                            className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full"
                          >
                            {child.nameFA || child.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid3X3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">دسته‌بندی‌ای یافت نشد</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
