'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Search,
  ChevronLeft,
  User,
} from 'lucide-react';
import { ticketsService, Ticket } from '@/services/ticketsService';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';

const statusConfig: Record<string, { label: string; variant: any }> = {
  OPEN: { label: 'باز', variant: 'info' },
  ANSWERED: { label: 'پاسخ داده شده', variant: 'success' },
  WAITING: { label: 'در انتظار پاسخ', variant: 'warning' },
  CLOSED: { label: 'بسته شده', variant: 'neutral' },
};

const priorityConfig: Record<string, { label: string; variant: any }> = {
  LOW: { label: 'کم', variant: 'neutral' },
  MEDIUM: { label: 'متوسط', variant: 'info' },
  HIGH: { label: 'بالا', variant: 'warning' },
  URGENT: { label: 'فوری', variant: 'danger' },
};

export default function AdminTicketsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page, status, priority, search],
    queryFn: () =>
      ticketsService.getAllTickets({
        page,
        limit: 20,
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
      }),
  });

  const tickets = data?.data || [];
  const meta = data?.meta;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت تیکت‌ها</h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta?.total || 0} تیکت
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'همه وضعیت‌ها' },
              { value: 'OPEN', label: 'باز' },
              { value: 'ANSWERED', label: 'پاسخ داده شده' },
              { value: 'WAITING', label: 'در انتظار' },
              { value: 'CLOSED', label: 'بسته شده' },
            ]}
          />
          <Select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'همه اولویت‌ها' },
              { value: 'LOW', label: 'کم' },
              { value: 'MEDIUM', label: 'متوسط' },
              { value: 'HIGH', label: 'بالا' },
              { value: 'URGENT', label: 'فوری' },
            ]}
          />
        </div>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">تیکتی وجود ندارد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: Ticket) => {
            const st = statusConfig[ticket.status];
            const pr = priorityConfig[ticket.priority];

            return (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <Badge variant={st.variant}>{st.label}</Badge>
                      <Badge variant={pr.variant}>{pr.label}</Badge>
                      {ticket.user && (
                        <span className="text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {ticket.user.firstName} {ticket.user.lastName}
                        </span>
                      )}
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

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            meta={meta}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
