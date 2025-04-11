'use client';

import React, { useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { Box, ListItemIcon, MenuItem } from '@mui/material';
import {
  MaterialReactTable,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreateTemplateModal } from '@/components/whatsapp/create-template-modal';

type Template = {
  id: string;
  name: string;
  parameter_format: string;
  components: any[];
  language: string;
  status: string;
  category: string;
};

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
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      Cell: ({ row }: any) => {
        const category = row.original.category;
        return <div className='max-w-md truncate'>{category}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ row }: any) => {
        const value = row.original.status;
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
      accessorKey: 'language',
      header: 'Language',
      Cell: ({ row }: any) => {
        const language = row.original.language;
        return language;
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: templates,
    enableRowSelection: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    enableRowActions: true,
    enableColumnActions: false,
    positionActionsColumn: 'last',
    enableStickyHeader: true,
    initialState: {
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    muiTablePaperProps: {
      sx: {
        '--mui-palette-primary-main': '#7c3aed',
        '--mui-palette-primary-light': '#7c3aed',
        '--mui-palette-primary-dark': '#7c3aed',
        boxShadow: 'none',
      },
    },
    muiTableContainerProps: {
      sx: {
        '--mui-palette-primary-main': '#7c3aed',
        '--mui-palette-primary-light': '#7c3aed',
        '--mui-palette-primary-dark': '#7c3aed',
        height: '340px',
        border: '1px solid rgb(201, 201, 201)',
        borderRadius: '8px',
      },
    },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '0.5rem',
          py: '12px',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Input
            placeholder='Search templates...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='w-md'
          />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
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
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleEditTemplate(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <FaEdit className='size-4' />
        </ListItemIcon>
        Edit Template
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleDeleteTemplate(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
        className='text-red-600'
      >
        <ListItemIcon>
          <FaTrash className='text-red-600 size-4' />
        </ListItemIcon>
        Delete Template
      </MenuItem>,
    ],
    state: {
      isLoading,
    },
  });

  return (
    <Card>
      <CardContent className='px-4 py-2'>
        <MaterialReactTable table={table} />
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
