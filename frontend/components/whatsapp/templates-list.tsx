'use client';

import React, { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { CreateTemplateModal } from '@/components/whatsapp/create-template-modal';

interface Template {
  id: string;
  name: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface TemplatesListProps {
  templates?: Template[];
  onCreateTemplate: () => void;
  onUpdateTemplate: (template: Template) => void;
}

export function TemplatesList({
  templates = [],
  onCreateTemplate,
  onUpdateTemplate,
}: TemplatesListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!template.id) return;

    try {
      setIsLoading(true);
      await whatsAppService.deleteTemplate(template.id);

      // Notify parent component to refresh templates
      onCreateTemplate();

      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      template.content.toLowerCase().includes(filterValue.toLowerCase()) ||
      template.status.toLowerCase().includes(filterValue.toLowerCase())
  );

  const columns: ColumnDef<Template>[] = [
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
      accessorKey: 'content',
      header: 'Content',
      cell: ({ row }) => {
        const content = row.getValue('content') as string;
        return <div className='max-w-md truncate'>{content}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.getValue('status') as string;
        const statusColors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              statusColors[value as keyof typeof statusColors]
            }`}
          >
            {value}
          </span>
        );
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
        const date = new Date(row.getValue('createdAt'));
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0' disabled={isLoading}>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                <FaEdit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTemplate(template)}>
                <FaTrash className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredTemplates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card className='border rounded-lg'>
      <CardHeader className='border-b'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-xl'>Templates</CardTitle>
            <CardDescription>View and manage your WhatsApp message templates</CardDescription>
          </div>
        </div>
        <div className='mt-4 flex justify-between items-center'>
          <div className='relative max-w-sm'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Filter templates...'
              className='pl-8'
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateModal(true);
            }}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
            disabled={isLoading}
          >
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {templates && templates.length > 0 ? (
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
        ) : (
          <div className='text-center py-10'>
            <h3 className='text-lg font-semibold mb-2'>No templates yet</h3>
            <p className='text-muted-foreground mb-4'>
              Create your first WhatsApp message template to get started
            </p>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              className='bg-[#5932EA] hover:bg-[#5932EA]/90'
              disabled={isLoading}
            >
              Create Template
            </Button>
          </div>
        )}
      </CardContent>
      <CreateTemplateModal
        open={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        onCreateTemplate={onCreateTemplate}
        editingTemplate={editingTemplate}
      />
    </Card>
  );
}
