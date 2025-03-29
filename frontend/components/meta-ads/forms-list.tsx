'use client';

import React, { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export type Form = {
  id: string;
  name: string;
  questions: JSON[];
  formId?: string;
  submissions: number;
  createdAt: string;
};

interface FormsListProps {
  data: Form[];
  onCreateForm: () => void;
  accessToken: string;
}

export function FormsList({ data, onCreateForm, accessToken }: FormsListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const columns: ColumnDef<Form>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'fields',
      header: 'Fields',
      cell: ({ row }) => {
        const fields = row.original.questions as Form['questions'];
        return Array.isArray(fields) ? fields.length : 0;
      },
    },
    {
      accessorKey: 'submissions',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Submissions
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        return row.original.submissions || 0; // Default to 0 if submissions is not set
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created At
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.getValue('createdAt')).toLocaleDateString();
      },
    },
    {
      id: 'select',
      cell: ({ row }) => (
        <div
          className='cursor-pointer'
          onClick={() => {
            setSelectedForm(row.original);
            setIsDetailsOpen(true);
          }}
        >
          <Button variant='ghost' size='sm'>
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <>
      <Card className='border rounded-lg'>
        <CardHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl'>Forms</CardTitle>
              <CardDescription>Manage your lead generation forms</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>Export Forms</DropdownMenuItem>
                <DropdownMenuItem>Import Forms</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='mt-4'>
            <Input placeholder='Filter forms...' className='max-w-sm' />
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {data.length === 0 ? (
            <p className='mt-2 text-sm text-gray-500'>Loading forms...</p>
          ) : data.length === 0 ? (
            <div className='text-center py-10'>
              <h3 className='text-lg font-semibold mb-2'>No forms yet</h3>
              <p className='text-muted-foreground mb-4'>Create your first form to get started</p>
              <Button onClick={onCreateForm} className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
                Create Form
              </Button>
            </div>
          ) : (
            <div className='overflow-auto'>
              <table className='w-full min-w-[800px]'>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className='h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground bg-gray-50/50'
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className='border-t hover:bg-gray-50/50'>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='p-4 align-middle text-sm'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Form Details</DialogTitle>
          </DialogHeader>

          {selectedForm && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>Form Name</h3>
                <p className='mt-1'>{selectedForm.name}</p>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-500'>Created At</h3>
                <p className='mt-1'>{new Date(selectedForm.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-500'>Submissions</h3>
                <p className='mt-1'>{selectedForm.submissions || 0}</p>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-500'>Form Fields</h3>
                <div className='mt-2 space-y-2'>
                  {Array.isArray(selectedForm.questions) &&
                    selectedForm.questions.map((question: any, index: number) => (
                      <div key={index} className='p-3 bg-gray-50 rounded-md'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <p className='font-medium'>{question.type}</p>
                            {question.label && (
                              <p className='text-sm text-gray-500'>{question.label}</p>
                            )}
                          </div>
                          <span className='text-xs text-gray-400'>Field {index + 1}</span>
                        </div>

                        {question.options && (
                          <div className='mt-2'>
                            <p className='text-sm text-gray-500'>Options:</p>
                            <div className='mt-1 flex flex-wrap gap-1'>
                              {question.options.map((option: any, optIndex: number) => (
                                <span
                                  key={optIndex}
                                  className='text-xs bg-white px-2 py-1 rounded-full border'
                                >
                                  {option.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className='mt-6 flex justify-end'>
                <Button variant='outline' onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
