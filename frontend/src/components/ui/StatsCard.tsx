'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'green' | 'yellow' | 'purple';
  trend?: { value: number; isUp: boolean };
}

const colorStyles = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-1 font-medium',
                trend.isUp ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isUp ? '+' : '-'}
              {trend.value}%
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.bg)}>
          <Icon className={cn('w-6 h-6', styles.text)} />
        </div>
      </div>
    </div>
  );
}
