'use client';

import React from 'react';
import { User } from '@/types';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Trash, UserPlus } from 'lucide-react';
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

// Add base interface for data items
interface BaseData {
  id: string;
}

interface DataTableProps<TData extends BaseData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (user: User) => void;
  onDelete: (userId: string) => void;
  onBulkDelete: (rows: Row<TData>[]) => void;
  onViewMetrics?: (userId: string) => void;
  onAddTeamMember?: (teamLeaderId: string) => void;
  disabled?: boolean;
  showTeamActions?: boolean;
}

export function DataTable<TData extends BaseData, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  onViewMetrics,
  onAddTeamMember,
  disabled,
  showTeamActions = false,
}: DataTableProps<TData, TValue>) {
  const [ConfirmDialog, confirm] = useConfirm(
    'Are You Sure?',
    'You are about to perform a bulk delete of agents. This action cannot be undone.'
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

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
    },
    onRowSelectionChange: setRowSelection,
    meta: {
      onEdit,
      onDelete,
      onViewMetrics,
      onAddTeamMember,
    },
  });

  return (
    <div>
      <ConfirmDialog />
      <div className='flex items-center justify-between py-4'>
        <Input
          placeholder='Filter agents...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <div className='flex items-center gap-2'>
          {showTeamActions && table.getFilteredSelectedRowModel().rows.length === 1 && (
            <Button
              disabled={disabled}
              size={'sm'}
              variant={'outline'}
              className='font-normal text-xs bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
              onClick={() => {
                const row = table.getFilteredSelectedRowModel().rows[0];
                onAddTeamMember?.(row.original.id);
              }}
            >
              <UserPlus className='size-4 mr-2' />
              Add Team Member
            </Button>
          )}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              disabled={disabled}
              size={'sm'}
              variant={'outline'}
              className='font-normal text-xs bg-red-600 text-white hover:bg-red-700 hover:text-white'
              onClick={async () => {
                const ok = await confirm();

                if (ok) {
                  toast.loading('Deleting agents...', {
                    id: 'delete',
                  });

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
      <div className='border rounded-md'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className='whitespace-nowrap'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
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
                    No agents found.
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
