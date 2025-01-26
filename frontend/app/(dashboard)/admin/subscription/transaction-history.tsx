import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Payment {
  id: string;
  amount: number;
  date: string;
  planType: string;
  isSuccessfull: boolean;
  createdAt: string;
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'MMM yyyy'),
  },
  {
    accessorKey: 'planType',
    header: 'Description',
    cell: ({ row }) => (
      <div>
        <p className='font-medium'>{row.getValue('planType')} Plan</p>
        <p className='text-xs text-gray-600'>
          {format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy')}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Billing Amount',
    cell: ({ row }) => (
      <div className='text-right'>₹{row.getValue<number>('amount').toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Due Date',
    cell: ({ row }) => format(new Date(row.getValue('date')), 'dd/MM/yyyy'),
  },
  {
    accessorKey: 'isSuccessfull',
    header: 'Status',
    cell: ({ row }) => (
      <div
        className={`text-center font-medium ${row.getValue('isSuccessfull') ? 'text-emerald-600' : 'text-red-600'}`}
      >
        {row.getValue('isSuccessfull') ? 'Paid' : 'Failed'}
      </div>
    ),
  },
];

interface TransactionHistoryTableProps {
  data: Payment[];
}

export function TransactionHistoryTable({ data }: TransactionHistoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
  );
}
