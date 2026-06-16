'use client';

import { useState, useRef } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { instructorService } from '@/services/instructorService';

interface ThumbnailUploaderProps {
  courseId: string;
  currentThumbnail?: string;
  onUploadComplete: (thumbnail: string) => void;
}

export default function ThumbnailUploader({
  courseId,
  currentThumbnail,
  onUploadComplete,
}: ThumbnailUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const thumbnailUrl = currentThumbnail
    ? currentThumbnail.startsWith('http')
      ? currentThumbnail
      : `${apiUrl.replace('/api/v1', '')}/uploads/${currentThumbnail}`
    : null;

  const displayImage = preview || thumbnailUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('فقط فایل‌های تصویری مجاز هستند');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setUploading(true);
    try {
      const result = await instructorService.uploadThumbnail(courseId, file);
      toast.success('تصویر شاخص با موفقیت آپلود شد');
      onUploadComplete(result.thumbnail);
    } catch {
      toast.error('خطا در آپلود تصویر');
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {displayImage ? (
        <div
          className="relative group rounded-xl overflow-hidden cursor-pointer border border-gray-200"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <img
            src={displayImage}
            alt="تصویر شاخص"
            className="w-full aspect-video object-cover"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <div className="text-center text-white">
                <ImagePlus className="w-8 h-8 mx-auto mb-1" />
                <span className="text-sm">تغییر تصویر</span>
              </div>
            )}
          </div>
          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-medium">آپلود تصویر شاخص</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG - حداکثر ۵ مگابایت</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
