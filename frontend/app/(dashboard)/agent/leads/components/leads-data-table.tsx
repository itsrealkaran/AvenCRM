'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import axios from 'axios';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableViewOptions } from './data-table-view-options';

// Define the Lead type based on your schema
type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyId: string;
  agentId: string;
  leadAmount: number | null;
  source: string;
  status: string;
  propertyType: string | null;
  budget: number | null;
  location: string | null;
  expectedDate: Date | null;
  lastContactDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'leadAmount',
    header: 'Lead Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('leadAmount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className='font-medium'>{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('status')}</div>,
  },
  {
    accessorKey: 'lastContactDate',
    header: 'Last Contact',
    cell: ({ row }) => {
      const date = row.getValue('lastContactDate') as Date;
      return <div>{date?.toLocaleDateString()}</div>;
    },
  },
];

export function LeadsDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [data, setData] = useState<Lead[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'a6B7X@example.com',
      phone: '(123) 456-7890',
      companyId: '1',
      agentId: '1',
      leadAmount: 50000,
      source: 'Website',
      status: 'WON',
      propertyType: 'Apartment',
      budget: 100000,
      location: 'New York, NY',
      expectedDate: new Date('2023-07-15'),
      lastContactDate: new Date('2023-06-30'),
      notes: 'Follow-up required',
      createdAt: new Date(),
      updatedAt: null,
    },
  ]);

  const fetchLeads = useCallback(async () => {
    debugger;

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const leads = await response.data;
      setData(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter leads...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
      <DataTablePagination table={table} />
    </div>
  );
}
