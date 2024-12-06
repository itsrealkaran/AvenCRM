'use client'

import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { labels, priorities, statuses } from '@/data/data'
import { DataTableColumnHeader } from '@/components/data-table-column-header'

// Define the data type
type Customer = {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  priority: 'low' | 'medium' | 'high'
  label: string
  lastContact: string
}

// Sample data
const data: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    priority: 'high',
    label: 'new',
    lastContact: '2024-01-15',
  },
  // Add more sample data as needed
]

// Define columns
export const columns: ColumnDef<Customer>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.getValue('status'))

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => {
      const priority = priorities.find((priority) => priority.value === row.getValue('priority'))

      if (!priority) {
        return null
      }

      return (
        <div className="flex items-center">
          {priority.icon && <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'label',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.getValue('label'))

      if (!label) {
        return null
      }

      return <Badge variant="outline">{label.label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'lastContact',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Contact" />,
  },
]

export default function CustomersPage() {
  // Define filterable columns
  const filterableColumns = [
    {
      id: 'status',
      title: 'Status',
      options: statuses,
    },
    {
      id: 'priority',
      title: 'Priority',
      options: priorities,
    },
    {
      id: 'label',
      title: 'Label',
      options: labels,
    },
  ]

  // Define searchable columns
  const searchableColumns = [
    {
      id: 'name',
      title: 'Name',
    },
    {
      id: 'email',
      title: 'Email',
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        filterableColumns={filterableColumns}
        searchableColumns={searchableColumns}
      />
    </div>
  )
}
