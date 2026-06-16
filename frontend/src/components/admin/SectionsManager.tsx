'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  BookOpen,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { sectionsService, Section } from '@/services/sectionsService';
import { formatDuration } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface SectionsManagerProps {
  courseId: string;
}

export default function SectionsManager({ courseId }: SectionsManagerProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin', 'sections', courseId],
    queryFn: () => sectionsService.getByCourse(courseId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectionsService.delete(id),
    onSuccess: () => {
      toast.success('سرفصل با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections', courseId] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف سرفصل');
      setDeletingId(null);
    },
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">سرفصل‌ها</h3>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingSection(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 ml-1" />
          افزودن سرفصل
        </Button>
      </div>

      {!sections?.length ? (
        <div className="text-center py-8 text-gray-500">
          <Layers className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>هنوز سرفصلی اضافه نشده</p>
          <p className="text-sm mt-1">سرفصل‌ها به شما کمک می‌کنند درس‌ها را دسته‌بندی کنید</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Section Header */}
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(section.id)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{section.title}</p>
                    {section.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {section.lessons?.length || 0} درس
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(section);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(section.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Section Lessons */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-gray-200">
                  {section.lessons?.length ? (
                    <div className="divide-y divide-gray-100">
                      {section.lessons.map((lesson, li) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 px-6 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{li + 1}</span>
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{lesson.title}</span>
                            {lesson.isFree && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                رایگان
                              </span>
                            )}
                          </div>
                          {lesson.video?.duration && (
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.video.duration)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-sm text-gray-400">
                      هنوز درسی در این سرفصل نیست
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section Form Modal */}
      {showForm && (
        <SectionFormModal
          courseId={courseId}
          section={editingSection}
          onClose={() => {
            setShowForm(false);
            setEditingSection(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف سرفصل"
        message="آیا از حذف این سرفصل اطمینان دارید؟ درس‌های این سرفصل بدون سرفصل خواهند شد."
        confirmText="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// ====== Section Form Modal ======

function SectionFormModal({
  courseId,
  section,
  onClose,
}: {
  courseId: string;
  section: Section | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!section;
  const [title, setTitle] = useState(section?.title || '');
  const [description, setDescription] = useState(section?.description || '');

  const createMutation = useMutation({
    mutationFn: () => sectionsService.create({ title, description: description || undefined, courseId }),
    onSuccess: () => {
      toast.success('سرفصل با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections', courseId] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ایجاد سرفصل'),
  });

  const updateMutation = useMutation({
    mutationFn: () => sectionsService.update(section!.id, { title, description: description || undefined }),
    onSuccess: () => {
      toast.success('سرفصل با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections', courseId] });
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ویرایش سرفصل'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('عنوان سرفصل الزامی است');
      return;
    }
    if (isEdit) updateMutation.mutate();
    else createMutation.mutate();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'ویرایش سرفصل' : 'افزودن سرفصل'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="عنوان سرفصل"
          placeholder="مثلا: مقدمات و آشنایی"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="توضیحات (اختیاری)"
          placeholder="توضیح مختصر درباره این سرفصل..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            انصراف
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'ذخیره' : 'ایجاد'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
