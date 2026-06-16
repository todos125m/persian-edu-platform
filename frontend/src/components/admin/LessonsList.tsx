'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Video,
  Eye,
  EyeOff,
  FileText,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService, AdminLesson } from '@/services/adminService';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LessonFormModal from './LessonFormModal';
import VideoUploader from './VideoUploader';

interface LessonsListProps {
  courseId: string;
  lessons: AdminLesson[];
}

export default function LessonsList({ courseId, lessons }: LessonsListProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null);

  const pdfUploadMutation = useMutation({
    mutationFn: ({ lessonId, file }: { lessonId: string; file: File }) =>
      adminService.uploadLessonPdf(lessonId, file),
    onSuccess: () => {
      toast.success('جزوه با موفقیت آپلود شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
      setUploadingPdfId(null);
    },
    onError: () => toast.error('خطا در آپلود جزوه'),
  });

  const pdfDeleteMutation = useMutation({
    mutationFn: (lessonId: string) => adminService.deleteLessonPdf(lessonId),
    onSuccess: () => {
      toast.success('جزوه حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
    },
    onError: () => toast.error('خطا در حذف جزوه'),
  });

  const handlePdfUpload = (lessonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('فقط فایل PDF مجاز است');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از ۵۰ مگابایت باشد');
      return;
    }
    pdfUploadMutation.mutate({ lessonId, file });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteLesson(id),
    onSuccess: () => {
      toast.success('درس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
      setDeletingId(null);
    },
    onError: () => toast.error('خطا در حذف درس'),
  });

  const reorderMutation = useMutation({
    mutationFn: (lessonIds: string[]) => adminService.reorderLessons(courseId, lessonIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
    },
  });

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLessons = [...lessons];
    const [dragged] = newLessons.splice(draggedIndex, 1);
    newLessons.splice(index, 0, dragged);

    setDraggedIndex(index);
    reorderMutation.mutate(newLessons.map((l) => l.id));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const sortedLessons = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">درس‌ها</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 ml-1" />
          افزودن درس
        </Button>
      </div>

      {sortedLessons.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">هنوز درسی اضافه نشده</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 transition-all',
                draggedIndex === index && 'opacity-50 border-primary-300'
              )}
            >
              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab flex-shrink-0" />

              <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                {lesson.sortOrder + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {lesson.isFree && <Badge variant="success">رایگان</Badge>}
                  <Badge variant={lesson.isPublished ? 'primary' : 'neutral'}>
                    {lesson.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
                  </Badge>
                  {lesson.video && (
                    <Badge variant={lesson.video.status === 'READY' ? 'success' : 'warning'}>
                      {lesson.video.status === 'READY' ? 'ویدیو آماده' : 'در حال پردازش'}
                    </Badge>
                  )}
                  {lesson.pdfUrl && (
                    <Badge variant="info">
                      <FileText className="w-3 h-3 ml-1 inline" />
                      جزوه
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {/* PDF Upload/Delete */}
                {lesson.pdfUrl ? (
                  <button
                    onClick={() => pdfDeleteMutation.mutate(lesson.id)}
                    className="p-2 text-green-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف جزوه"
                    disabled={pdfDeleteMutation.isPending}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                ) : (
                  <label
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                    title="آپلود جزوه PDF"
                  >
                    <FileText className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handlePdfUpload(lesson.id, e)}
                    />
                  </label>
                )}
                <button
                  onClick={() => setUploadingLessonId(lesson.id)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="آپلود ویدیو"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingLesson(lesson)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="ویرایش"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(lesson.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showForm || editingLesson) && (
        <LessonFormModal
          courseId={courseId}
          lesson={editingLesson || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingLesson(null);
          }}
        />
      )}

      {/* Video Upload Modal */}
      {uploadingLessonId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">آپلود ویدیو</h3>
            <VideoUploader
              lessonId={uploadingLessonId}
              existingVideo={
                sortedLessons.find((l) => l.id === uploadingLessonId)?.video || undefined
              }
              onUploadComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', courseId] });
                setUploadingLessonId(null);
              }}
            />
            <button
              onClick={() => setUploadingLessonId(null)}
              className="mt-4 w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف درس"
        message="آیا از حذف این درس اطمینان دارید؟ این عمل قابل بازگشت نیست."
        confirmText="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
