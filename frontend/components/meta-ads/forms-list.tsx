'use client';

import React, { useEffect, useState } from 'react';
import { Box, ListItemIcon, MenuItem } from '@mui/material';
import { MoreHorizontal } from 'lucide-react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'fields',
      header: 'Fields',
      Cell: ({ row }: any) => {
        const fields = row.original.questions as Form['questions'];
        return Array.isArray(fields) ? fields.length : 0;
      },
    },
    {
      accessorKey: 'submissions',
      header: 'Submissions',
      Cell: ({ row }: any) => {
        return row.original.submissions || 0;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      Cell: ({ row }: any) => {
        return new Date(row.original.createdAt).toLocaleDateString();
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data,
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
            placeholder='Search forms...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='w-md'
          />
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            onClick={onCreateForm}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
            disabled={isLoading}
          >
            Create Form
          </Button>
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          setSelectedForm(row.original);
          setIsDetailsOpen(true);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <FaEdit className='size-4' />
        </ListItemIcon>
        View Details
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          // Add delete functionality here
          closeMenu();
        }}
        sx={{ m: 0 }}
        className='text-red-600'
      >
        <ListItemIcon>
          <FaTrash className='text-red-600 size-4' />
        </ListItemIcon>
        Delete Form
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

      {/* Form Details Modal */}
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
    </Card>
  );
}
