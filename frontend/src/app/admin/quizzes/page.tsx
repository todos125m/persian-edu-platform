'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Plus, Trash2, Edit3, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Question {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation?: string;
}

export default function AdminQuizzesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: 30,
  });
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'quizzes', page, search],
    queryFn: () => adminService.getQuizzes({ page, limit: 10, search }),
  });

  const createMutation = useMutation({
    mutationFn: (quizData: any) => adminService.createQuiz(quizData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast.success('آزمون با موفقیت ایجاد شد');
      resetForm();
    },
    onError: () => toast.error('خطا در ایجاد آزمون'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      toast.success('آزمون حذف شد');
      setDeletingId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateQuiz(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setFormData({ title: '', slug: '', description: '', duration: 30 });
    setQuestions([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' }]);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      toast.error('عنوان و اسلاگ الزامی است');
      return;
    }
    const validQuestions = questions.filter((q) => q.question && q.optionA && q.optionB && q.optionC && q.optionD);
    if (validQuestions.length === 0) {
      toast.error('حداقل یک سوال کامل وارد کنید');
      return;
    }
    createMutation.mutate({
      ...formData,
      duration: formData.duration * 60,
      questions: validQuestions,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مدیریت آزمون‌ها</h1>
            <p className="text-gray-500 text-sm mt-1">ایجاد و مدیریت آزمون‌های تستی</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 ml-2" />
          آزمون جدید
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="جستجو در آزمون‌ها..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">در حال بارگذاری...</div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center text-gray-500">هیچ آزمونی یافت نشد</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.data.map((quiz: any) => (
              <div key={quiz.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedQuiz === quiz.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <h3 className="font-bold text-gray-900">{quiz.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{quiz._count?.questions || 0} سوال</span>
                        <span>{quiz._count?.attempts || 0} شرکت‌کننده</span>
                        {quiz.course && <span>دوره: {quiz.course.title}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={quiz.isActive ? 'success' : 'danger'}>
                      {quiz.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate({ id: quiz.id, isActive: quiz.isActive })}
                    >
                      {quiz.isActive ? 'غیرفعال' : 'فعال'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setDeletingId(quiz.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {expandedQuiz === quiz.id && quiz.questions && (
                  <div className="mt-4 mr-8 space-y-3">
                    {quiz.questions.map((q: any, i: number) => (
                      <div key={q.id} className="bg-gray-50 rounded-xl p-3">
                        <p className="font-medium text-gray-800">
                          {i + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <span
                              key={opt}
                              className={`px-2 py-1 rounded ${
                                q.correctOption === opt ? 'bg-green-100 text-green-700 font-bold' : 'text-gray-600'
                              }`}
                            >
                              {opt}) {q[`option${opt}`]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.meta.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title="ایجاد آزمون جدید" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <Input
            label="عنوان آزمون"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
            }}
          />
          <Input
            label="اسلاگ (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            dir="ltr"
          />
          <Textarea
            label="توضیحات"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="مدت زمان (دقیقه)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: +e.target.value })}
          />

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">سوالات</h3>
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 ml-1" />
                سوال جدید
              </Button>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-700">سوال {i + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700 text-sm">
                      حذف
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="متن سوال"
                  value={q.question}
                  onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                  className="mb-2"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input placeholder="گزینه الف" value={q.optionA} onChange={(e) => updateQuestion(i, 'optionA', e.target.value)} />
                  <Input placeholder="گزینه ب" value={q.optionB} onChange={(e) => updateQuestion(i, 'optionB', e.target.value)} />
                  <Input placeholder="گزینه ج" value={q.optionC} onChange={(e) => updateQuestion(i, 'optionC', e.target.value)} />
                  <Input placeholder="گزینه د" value={q.optionD} onChange={(e) => updateQuestion(i, 'optionD', e.target.value)} />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">پاسخ صحیح:</label>
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={q.correctOption === opt}
                        onChange={() => updateQuestion(i, 'correctOption', opt)}
                        className="text-primary-600"
                      />
                      <span className="text-sm">{opt === 'A' ? 'الف' : opt === 'B' ? 'ب' : opt === 'C' ? 'ج' : 'د'}</span>
                    </label>
                  ))}
                </div>
                <Input
                  placeholder="توضیح پاسخ (اختیاری)"
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(i, 'explanation', e.target.value)}
                  className="mt-2"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} isLoading={createMutation.isPending} className="flex-1">
              ایجاد آزمون
            </Button>
            <Button variant="outline" onClick={resetForm}>
              انصراف
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف آزمون"
        message="آیا از حذف این آزمون اطمینان دارید؟ تمام سوالات و نتایج نیز حذف خواهند شد."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
