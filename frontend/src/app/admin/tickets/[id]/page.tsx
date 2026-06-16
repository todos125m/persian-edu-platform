'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Send,
  XCircle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ticketsService } from '@/services/ticketsService';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; variant: any }> = {
  OPEN: { label: 'باز', variant: 'info' },
  ANSWERED: { label: 'پاسخ داده شده', variant: 'success' },
  WAITING: { label: 'در انتظار پاسخ', variant: 'warning' },
  CLOSED: { label: 'بسته شده', variant: 'neutral' },
};

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin-ticket', ticketId],
    queryFn: () => ticketsService.getTicketAdmin(ticketId),
    enabled: !!ticketId,
  });

  const replyMutation = useMutation({
    mutationFn: () => ticketsService.adminReply(ticketId, replyText),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
    },
    onError: () => toast.error('خطا در ارسال پاسخ'),
  });

  const closeMutation = useMutation({
    mutationFn: () => ticketsService.adminClose(ticketId),
    onSuccess: () => {
      toast.success('تیکت بسته شد');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
    },
    onError: () => toast.error('خطا در بستن تیکت'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      ticketsService.changeStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
    },
    onError: () => toast.error('خطا در تغییر وضعیت'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">تیکت یافت نشد</p>
      </div>
    );
  }

  const status = statusConfig[ticket.status];
  const isClosed = ticket.status === 'CLOSED';

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/admin/tickets"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            {ticket.user && (
              <span className="text-sm text-gray-500">
                {ticket.user.firstName} {ticket.user.lastName}
                {ticket.user.email && ` (${ticket.user.email})`}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={ticket.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            options={[
              { value: 'OPEN', label: 'باز' },
              { value: 'ANSWERED', label: 'پاسخ داده شده' },
              { value: 'WAITING', label: 'در انتظار' },
              { value: 'CLOSED', label: 'بسته شده' },
            ]}
          />
          {!isClosed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => closeMutation.mutate()}
              isLoading={closeMutation.isPending}
            >
              <XCircle className="w-4 h-4 ml-1" />
              بستن
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
        {ticket.messages?.map((msg) => {
          const isAdmin = msg.isAdmin;

          return (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                isAdmin ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  isAdmin
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl p-3',
                  isAdmin
                    ? 'bg-primary-600 text-white rounded-tl-sm'
                    : 'bg-white border border-gray-200 rounded-tr-sm'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isAdmin ? 'text-primary-100' : 'text-gray-600'
                    )}
                  >
                    {msg.user.firstName} {msg.user.lastName}
                    {isAdmin && ' (ادمین)'}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isAdmin ? 'text-primary-200' : 'text-gray-400'
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm whitespace-pre-wrap leading-relaxed',
                    isAdmin ? 'text-white' : 'text-gray-800'
                  )}
                >
                  {msg.body}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      {!isClosed ? (
        <form
          onSubmit={handleSubmitReply}
          className="mt-3 flex items-end gap-2"
        >
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              rows={2}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitReply(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            isLoading={replyMutation.isPending}
            disabled={!replyText.trim()}
            className="h-12 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <div className="mt-3 text-center py-3 bg-gray-100 rounded-xl text-sm text-gray-500">
          این تیکت بسته شده است
        </div>
      )}
    </div>
  );
}
