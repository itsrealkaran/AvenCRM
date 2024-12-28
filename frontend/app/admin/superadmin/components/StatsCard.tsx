'use client';

import { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>{label}</p>
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-bold'>{value}</h2>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend > 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </span>
              )}
            </div>
            {description && <p className='text-xs text-muted-foreground mt-1'>{description}</p>}
          </div>
          <div className='rounded-full bg-primary/10 p-3'>
            <Icon className='h-5 w-5 text-primary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
