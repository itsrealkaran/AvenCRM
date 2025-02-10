'use client';

import { useRef, useState } from 'react';
import type { User } from '@/types';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { Download, PlusCircle, RefreshCw, Trash, Upload, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { read, utils } from 'xlsx';

import FileImportModal from '@/components/data-table/file-import-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  isLoading?: boolean;
  onRefresh: () => void;
  onDownload: (format: 'csv' | 'xlsx') => void;
  onCreateAgent: () => void;
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
  isLoading,
  onRefresh,
  onDownload,
  onCreateAgent,
}: DataTableProps<TData, TValue>) {
  const [ConfirmDialog, confirm] = useConfirm(
    'Are You Sure?',
    'You are about to perform a bulk delete of agents. This action cannot be undone.'
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [fileData, setFileData] = useState<Record<string, string>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className='h-full w-full'>
      <ConfirmDialog />
      <div className='flex items-center justify-between py-4'>
        <Input
          placeholder='Search agents...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <div className='flex items-center space-x-2'>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              disabled={disabled}
              size={'sm'}
              variant={'outline'}
              className='font-normal text-xs bg-red-600 text-white hover:bg-red-700 hover:text-white'
              onClick={async () => {
                const ok = await confirm();
                if (ok) {
                  toast.loading('Deleting agents...', { id: 'delete' });
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
          <DropdownMenu>
            <DropdownMenuTrigger className='border-[1px] hover:bg-muted/50 p-2 rounded-md flex items-center text-xs'>
              <Download className='size-4 mr-2' />
              Import
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <label className='flex w-full cursor-pointer'>
                  Import from CSV
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
                  Import from XLSX
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
          <Button variant='outline' size='sm' onClick={onRefresh}>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <Upload className='h-4 w-4' />
                Export
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDownload('csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('xlsx')}>
                Export as XLSX
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

          <Button size='sm' onClick={onCreateAgent}>
            <PlusCircle className='h-4 w-4' /> Add New Agent
          </Button>
        </div>
      </div>

      <div className='border rounded-md'>
        <div className='h-[55vh] overflow-x-auto'>
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
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index} className='hover:bg-muted/50 animate-pulse'>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
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
          {fileData && <FileImportModal jsonData={fileData} onClose={() => setFileData(null)} />}
        </div>
      </div>
    </div>
  );
}
