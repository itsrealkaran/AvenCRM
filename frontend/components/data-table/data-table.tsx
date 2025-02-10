'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, CirclePlus, Download, RefreshCw, Trash, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { read, utils } from 'xlsx';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import FileImportModal from './file-import-modal';
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
  onCreateLead,
  onCreateDeal,
  disabled = false,
  additionalActions,
  buttons,
  refetch,
  onDownload,
}: DataTableProps<TData, TValue>) {
  const [ConfirmDialog, confirm] = useConfirm(
    'Are You Sure?',
    'You are about to perform a bulk delete.'
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [fileData, setFileData] = useState<Record<string, string>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) {
      console.error('No file selected');
      return;
    }

    try {
      let jsonData: Record<string, string>[] = [];
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'csv') {
        const text = await file.text();
        const rows = text.split('\n');
        const headers = rows[0].split(',').map((header) => header.trim());

        jsonData = rows.slice(1).map((row) => {
          const values = row.split(',').map((value) => value.trim());
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index];
              return obj;
            },
            {} as Record<string, string>
          );
        });
      } else if (fileType === 'xlsx') {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = utils.sheet_to_json(worksheet);
      } else {
        throw new Error('Unsupported file format');
      }

      // Filter out empty objects (from empty lines)
      const filteredData = jsonData.filter((obj) => Object.keys(obj).length > 0);

      console.log('Converted data:', filteredData);
      toast.success(
        `Successfully parsed ${filteredData.length} rows from ${fileType?.toUpperCase()}`
      );

      // Reset the file input for future uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setFileData(filteredData);
    } catch (error) {
      console.error(`Error parsing ${file.name}:`, error);
      toast.error(`Failed to parse ${file.name}. Please check the format.`);
      setFileData(null);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
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
    <div className='flex flex-col h-full w-full'>
      <ConfirmDialog />
      <div className='flex items-center py-4'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder={onCreateLead ? 'Search leads...' : 'Search deals...'}
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          
        </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger className='p-1 border-[1px] hover:bg-muted/50 px-2 rounded-md flex items-center text-xs'>
              <Download className='size-4 mr-2' />
              Import
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <label className='flex w-full cursor-pointer'>
                  Import as CSV
                  <input
                    type='file'
                    ref={fileInputRef}
                    accept='.csv'
                    className='hidden'
                    onChange={handleFileUpload}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <label className='flex w-full cursor-pointer'>
                  Import as XLSX
                  <input
                    type='file'
                    accept='.xlsx'
                    className='hidden'
                    onChange={handleFileUpload}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant='ghost'
            className='p-1 border-[1px] hover:bg-muted/50 px-2 rounded-md flex items-center text-xs'
            onClick={async () => {
              setIsLoading(true);
              await refetch?.();
              setIsLoading(false);
            }}
          >
            <RefreshCw className='size-4 mr-2' />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='default' className='text-xs'>
                <Upload className='h-4 w-4' />
                Export
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDownload?.('csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload?.('xlsx')}>
                Export as XLSX
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
          {onCreateLead && (
          <Button onClick={onCreateLead} className='text-xs'>
            <CirclePlus className='mr-2 h-4 w-4' /> Add New Lead
          </Button>
          )}

          {onCreateDeal && (
            <Button onClick={onCreateDeal}>
              <CirclePlus className='mr-2 h-4 w-4' /> Add New Deal
            </Button>
          )}
        </div>
      </div>
      {fileData && fileData.length > 0 && (
        <FileImportModal jsonData={fileData} onClose={() => setFileData(null)} />
      )}
      <div className='rounded-md border flex-1 overflow-x-auto'>
        <Table>
          <TableHeader className='bg-gray-50 sticky top-0'>
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
          {isLoading ? (
            <TableBody className='overflow-y-auto'>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className='h-4 text-center'>
                    <div className='h-4 py-2 w-4 animate-pulse rounded bg-gray-200'></div>
                  </TableCell>
                  {[...Array(columns.length - 1)].map((_, j) => (
                    <TableCell key={j} className='whitespace-nowrap'>
                      <div className='h-6 w-24 animate-pulse rounded bg-gray-200'></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody className='overflow-y-auto'>
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
        )}
        </Table>
      </div>
    </div>
  );
}
