'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ticketsService, Ticket } from '@/services/ticketsService';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  OPEN: { label: 'باز', variant: 'info', icon: AlertCircle },
  ANSWERED: { label: 'پاسخ داده شده', variant: 'success', icon: CheckCircle },
  WAITING: { label: 'در انتظار پاسخ', variant: 'warning', icon: Clock },
  CLOSED: { label: 'بسته شده', variant: 'neutral', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; variant: any }> = {
  LOW: { label: 'کم', variant: 'neutral' },
  MEDIUM: { label: 'متوسط', variant: 'info' },
  HIGH: { label: 'بالا', variant: 'warning' },
  URGENT: { label: 'فوری', variant: 'danger' },
};

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [department, setDepartment] = useState('support');

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => ticketsService.getMyTickets({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      ticketsService.create({ subject, body, priority, department }),
    onSuccess: () => {
      toast.success('تیکت با موفقیت ارسال شد');
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      setShowForm(false);
      setSubject('');
      setBody('');
      setPriority('MEDIUM');
    },
    onError: () => toast.error('خطا در ارسال تیکت'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error('لطفاً موضوع و متن پیام را وارد کنید');
      return;
    }
    createMutation.mutate();
  };

  const tickets = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تیکت‌های پشتیبانی</h1>
          <p className="text-sm text-gray-500 mt-1">
            سوالات و مشکلات خود را مطرح کنید
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 ml-1" />
          تیکت جدید
        </Button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900">تیکت جدید</h2>

          <Input
            label="موضوع"
            placeholder="موضوع تیکت را وارد کنید"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="اولویت"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'LOW', label: 'کم' },
                { value: 'MEDIUM', label: 'متوسط' },
                { value: 'HIGH', label: 'بالا' },
                { value: 'URGENT', label: 'فوری' },
              ]}
            />
            <Select
              label="دپارتمان"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: 'support', label: 'پشتیبانی' },
                { value: 'technical', label: 'فنی' },
                { value: 'financial', label: 'مالی' },
              ]}
            />
          </div>

          <Textarea
            label="متن پیام"
            placeholder="مشکل یا سوال خود را شرح دهید..."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={createMutation.isPending}>
              ارسال تیکت
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              انصراف
            </Button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            تیکتی وجود ندارد
          </h3>
          <p className="text-gray-500 mb-4">
            برای ارسال سوال یا مشکل، یک تیکت جدید ایجاد کنید
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 ml-1" />
            تیکت جدید
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: Ticket) => {
            const status = statusConfig[ticket.status];
            const prio = priorityConfig[ticket.priority];

            return (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant={prio.variant}>{prio.label}</Badge>
                      <span className="text-gray-400">
                        {ticket._count?.messages || 0} پیام
                      </span>
                      <span className="text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
