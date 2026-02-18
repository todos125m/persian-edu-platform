'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Trash2, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import api from '@/lib/api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface VideoUploaderProps {
  lessonId: string;
  existingVideo?: {
    id: string;
    status: string;
    duration: number;
    originalName: string;
  };
  onUploadComplete: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'confirming' | 'done' | 'error';

export default function VideoUploader({
  lessonId,
  existingVideo,
  onUploadComplete,
}: VideoUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('فقط فایل‌های ویدیویی مجاز هستند');
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از ۲ گیگابایت باشد');
      return;
    }

    setSelectedFile(file);
  };

  const detectDuration = (file: File): Promise<number> => {
    return new Promise<number>((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration));
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setStatus('uploading');
      setProgress(0);

      const duration = await detectDuration(selectedFile);

      // Check storage mode
      const { data: storageInfo } = await api.get('/videos/storage-mode');
      const isLocal = storageInfo.mode === 'local';

      if (isLocal) {
        // Local upload: send file directly to backend
        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('lessonId', lessonId);
        formData.append('duration', String(duration));

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

          const token = document.cookie
            .split('; ')
            .find((c) => c.startsWith('token='))
            ?.split('=')[1];

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
          xhr.open('POST', `${apiUrl}/videos/upload-local`);
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });
      } else {
        // S3 upload: get pre-signed URL then upload directly
        const { videoId, uploadUrl } = await adminService.getUploadUrl(
          lessonId,
          selectedFile.name,
        );

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', selectedFile.type);
          xhr.send(selectedFile);
        });

        setStatus('confirming');
        await adminService.confirmUpload(videoId, duration);
      }

      setStatus('done');
      toast.success('ویدیو با موفقیت آپلود شد');
      setTimeout(() => onUploadComplete(), 1500);
    } catch (error: any) {
      if (error.message === 'Upload cancelled') {
        setStatus('idle');
        setProgress(0);
        return;
      }
      setStatus('error');
      toast.error('خطا در آپلود ویدیو');
    }
  };

  const handleCancel = () => {
    xhrRef.current?.abort();
    setStatus('idle');
    setProgress(0);
    setSelectedFile(null);
  };

  const handleDelete = async () => {
    if (!existingVideo) return;
    setDeleting(true);
    try {
      await adminService.deleteVideo(existingVideo.id);
      toast.success('ویدیو با موفقیت حذف شد');
      setShowDeleteConfirm(false);
      onUploadComplete();
    } catch {
      toast.error('خطا در حذف ویدیو');
    } finally {
      setDeleting(false);
    }
  };

  // Show existing video info
  if (existingVideo && status === 'idle' && !selectedFile) {
    return (
      <div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-primary-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{existingVideo.originalName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={existingVideo.status === 'READY' ? 'success' : 'warning'}>
                  {existingVideo.status === 'READY' ? 'آماده' : 'در حال پردازش'}
                </Badge>
                {existingVideo.duration > 0 && (
                  <span className="text-xs text-gray-500">
                    {Math.floor(existingVideo.duration / 60)}:{(existingVideo.duration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          جایگزینی ویدیو
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="حذف ویدیو"
          message="آیا از حذف این ویدیو اطمینان دارید؟"
          confirmText="حذف"
          variant="danger"
          isLoading={deleting}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Upload Zone */}
      {status === 'idle' && !selectedFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">فایل ویدیو را انتخاب کنید</p>
          <p className="text-sm text-gray-400 mt-1">حداکثر ۲ گیگابایت - MP4, MKV, AVI</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Selected File */}
      {selectedFile && status === 'idle' && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-primary-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Button className="w-full mt-3" onClick={handleUpload}>
            <Upload className="w-4 h-4 ml-1" />
            شروع آپلود
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {(status === 'uploading' || status === 'confirming') && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {status === 'uploading' ? 'در حال آپلود...' : 'در حال تایید...'}
            </span>
            <span className="text-sm font-bold text-primary-600">
              %{toPersianNumber(progress)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {status === 'uploading' && (
            <button
              onClick={handleCancel}
              className="mt-3 w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              لغو آپلود
            </button>
          )}
        </div>
      )}

      {/* Done */}
      {status === 'done' && (
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-green-700 font-medium">آپلود با موفقیت انجام شد</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-red-700 font-medium">خطا در آپلود</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
            تلاش مجدد
          </Button>
        </div>
      )}
    </div>
  );
}
