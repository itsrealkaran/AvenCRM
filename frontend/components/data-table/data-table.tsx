'use client';

import React, { useCallback } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Trash, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useConfirm } from '@/hooks/use-confirm';

import { BaseRecord, DataTableProps } from './types';

export function DataTable<TData extends BaseRecord, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  onStatusChange,
  onSelectionChange,
  onConvertToDeal,
  filterPlaceholder = 'Filter...',
  disabled = false,
  additionalActions,
  buttons,
}: DataTableProps<TData, TValue>) {
  const [ConfirmDialog, confirm] = useConfirm(
    'Are You Sure?',
    'You are about to perform a bulk delete.'
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(0);

  const handleSelectionChange = useCallback(
    (updatedSelection: typeof rowSelection) => {
      setRowSelection(updatedSelection);
      if (onSelectionChange) {
        const selectedRows = Object.keys(updatedSelection)
          .map((index) => data[parseInt(index)])
          .filter((item): item is TData => item !== undefined) as TData[];
        onSelectionChange(selectedRows);
      }
    },
    [data, onSelectionChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageIndex: currentPage,
        pageSize: 10,
      },
    },
    pageCount: Math.ceil(data.length / 10),
    enableRowSelection: true,
    onRowSelectionChange: handleSelectionChange,
    meta: {
      onEdit,
      onDelete,
      onStatusChange,
      onConvertToDeal,
    },
  });

  return (
    <div>
      <ConfirmDialog />
      <div className='flex items-center py-4'>
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <Button
          variant='secondary'
          size='sm'
          className='hover:bg-gray-100 transition duration-200 ml-2'
          onClick={() => table.reset()}
        >
          <ReloadIcon className='size-4 mr-2' />
          Reload
        </Button>
        <div className='ml-auto flex gap-2'>
          {buttons}
          {additionalActions}
          {onBulkDelete && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              disabled={disabled}
              size='sm'
              variant='outline'
              className='font-normal text-xs bg-red-600 text-white hover:bg-red-700 hover:text-white'
              onClick={async () => {
                const ok = await confirm();
                if (ok) {
                  toast.loading('Deleting...', { id: 'delete' });
                  onBulkDelete(table.getFilteredSelectedRowModel().rows);
                  toast.dismiss('delete');
                  table.resetRowSelection();
                }
              }}
            >
              <Trash className='size-4 mr-2' />
              Delete({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
      </div>
      <div className='rounded-md border overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-white'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='whitespace-nowrap'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
