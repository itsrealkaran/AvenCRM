'use client';

import { useEffect, useState } from 'react';
import { EmailStatus } from '@/types';
import { EmailRecipient } from '@/types/email';
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
import { ArrowUpDown, MoreHorizontal, Plus, Users, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { createEmailRecipient, deleteEmailRecipient, fetchEmailRecipients } from '../api';

interface NewRecipient {
  name: string;
  email: string;
  tags: string[];
  notes?: string;
  isPrivate: boolean;
}

export default function EmailRecipientsSection() {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [newRecipient, setNewRecipient] = useState<NewRecipient>({
    name: '',
    email: '',
    tags: [],
    notes: '',
    isPrivate: false,
  });

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      setIsLoading(true);
      const data = await fetchEmailRecipients();
      setRecipients(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch recipients',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<EmailRecipient>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className='flex gap-1 flex-wrap'>
          {row.getValue<string[]>('tags').map((tag, index) => (
            <Badge key={index} className='capitalize'>
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'isPrivate',
      header: 'Private',
      cell: ({ row }) => (
        <div>
          {row.getValue<boolean>('isPrivate') ? (
            <Badge className='bg-green-100 text-green-800'>Private</Badge>
          ) : (
            <Badge className='bg-red-100 text-red-800'>Public</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => {
        const notes = row.getValue<string>('notes');
        return notes ? notes : 'No notes';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const recipient = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(recipient.email)}>
                Copy email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(recipient.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: recipients,
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

  const handleAddTag = (e: { key: string }) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setNewRecipient({
        ...newRecipient,
        tags: [...newRecipient.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewRecipient({
      ...newRecipient,
      tags: newRecipient.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddRecipient = async () => {
    try {
      const tagsArray = newRecipient.tags.map((tag) => tag.toLowerCase());

      await createEmailRecipient({
        ...newRecipient,
        tags: tagsArray,
        status: EmailStatus.PENDING,
      });

      setIsAddDialogOpen(false);
      setNewRecipient({
        name: '',
        email: '',
        tags: [],
        notes: '',
        isPrivate: false,
      });
      await loadRecipients();

      toast({
        title: 'Success',
        description: 'Recipient added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add recipient',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmailRecipient(id);
      await loadRecipients();
      toast({
        title: 'Success',
        description: 'Recipient deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete recipient',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Input
          placeholder='Filter emails...'
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle className='text-xl font-semibold'>Add New Recipient</DialogTitle>
              <DialogDescription className='text-gray-500'>
                Add a new recipient to your email list and manage their details.
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-6 py-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Name</label>
                <input
                  type='text'
                  className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm'
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                />
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Email</label>
                <input
                  type='email'
                  className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm'
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                />
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Tags</label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {newRecipient.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant='secondary'
                      className='px-2 py-1 flex items-center gap-1'
                    >
                      {tag}
                      <X
                        className='h-3 w-3 cursor-pointer hover:text-red-500'
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <input
                  type='text'
                  className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm'
                  placeholder='Type a tag and press Enter'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                />
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Notes</label>
                <Textarea
                  className='min-h-[100px]'
                  value={newRecipient.notes}
                  onChange={(e) => setNewRecipient({ ...newRecipient, notes: e.target.value })}
                  placeholder='Add any additional notes...'
                />
              </div>

              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>Private Recipient</label>
                <Switch
                  checked={newRecipient.isPrivate}
                  onCheckedChange={(checked) =>
                    setNewRecipient({ ...newRecipient, isPrivate: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleAddRecipient} className='w-full sm:w-auto'>
                Add Recipient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                  No recipients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
