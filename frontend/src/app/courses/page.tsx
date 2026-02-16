'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { CourseCard, Button } from '@/components/ui';
import { coursesService } from '@/services/coursesService';
import api from '@/lib/api';

const levels = [
  { value: '', label: 'همه سطوح' },
  { value: 'BEGINNER', label: 'مبتدی' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'پیشرفته' },
];

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>}>
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, [page, selectedCategory, selectedLevel]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await coursesService.getCourses({
        page,
        limit: 12,
        category: selectedCategory,
        level: selectedLevel,
        search,
      });
      setCourses(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              دوره‌های آموزشی
            </h1>
            <p className="text-primary-100 text-lg mb-8">
              از بین صدها دوره آموزشی، مسیر یادگیری خودتان را انتخاب کنید
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجوی دوره..."
                  className="w-full pr-12 pl-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-300"
                />
                <Button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2">
                  جستجو
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="w-full lg:w-64 shrink-0">
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    فیلترها
                  </h3>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      دسته‌بندی
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">همه دسته‌بندی‌ها</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.nameFA}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سطح دوره
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => {
                        setSelectedLevel(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {levels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {(selectedCategory || selectedLevel || search) && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedLevel('');
                        setSearch('');
                        setPage(1);
                      }}
                    >
                      پاک کردن فیلترها
                    </Button>
                  )}
                </div>
              </aside>

              {/* Course Grid */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl h-96 animate-pulse"
                      />
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {courses.map((course: any) => (
                        <CourseCard key={course.id} {...course} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-12">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              page === i + 1
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">دوره‌ای یافت نشد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
