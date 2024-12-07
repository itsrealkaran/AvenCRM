'use client';

import * as React from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SheetProviderProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function SheetProvider({
  title,
  description,
  children,
  isOpen,
  onClose,
}: SheetProviderProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-[540px]'>
        <SheetHeader className='space-y-2'>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className='mt-6'>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
