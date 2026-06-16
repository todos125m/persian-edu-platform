'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Mail, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'messages', page],
    queryFn: () => adminService.getContactMessages({ page, limit: 20 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminService.markContactRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      toast.success('پیام حذف شد');
      setDeletingId(null);
    },
  });

  const handleExpand = (msg: any) => {
    setExpandedId(expandedId === msg.id ? null : msg.id);
    if (!msg.isRead) {
      markReadMutation.mutate(msg.id);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">پیام‌های تماس</h1>
          <p className="text-gray-500 text-sm mt-1">پیام‌های دریافتی از فرم تماس با ما</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">در حال بارگذاری...</div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center text-gray-500">پیامی یافت نشد</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.data.map((msg: any) => (
              <div
                key={msg.id}
                className={`p-4 transition-colors cursor-pointer ${
                  !msg.isRead ? 'bg-primary-50/50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleExpand(msg)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {!msg.isRead && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full shrink-0" />
                      )}
                      <span className="font-bold text-gray-900">{msg.name}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1" dir="ltr">
                        <Mail className="w-3.5 h-3.5" />
                        {msg.email}
                      </span>
                      <Badge variant={msg.isRead ? 'neutral' : 'info'}>
                        {msg.isRead ? 'خوانده شده' : 'جدید'}
                      </Badge>
                    </div>
                    {msg.subject && (
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        موضوع: {msg.subject}
                      </p>
                    )}
                    <p className={`text-sm text-gray-600 ${expandedId !== msg.id ? 'line-clamp-1' : ''}`}>
                      {msg.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.createdAt).toLocaleDateString('fa-IR')} - {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mr-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setDeletingId(msg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data?.meta && (
        <Pagination meta={data.meta} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف پیام"
        message="آیا از حذف این پیام اطمینان دارید؟"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
