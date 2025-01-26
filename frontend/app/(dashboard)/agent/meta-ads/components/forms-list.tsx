"use client"

import React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import type { Form } from "./create-form-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FormsListProps {
  forms: Form[]
  onCreateForm: () => void
}

export function FormsList({ forms, onCreateForm }: FormsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns: ColumnDef<Form>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "Active" // Default to "Active" if status is not set
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "fields",
      header: "Fields",
      cell: ({ row }) => {
        const fields = row.getValue("fields") as Form["fields"]
        return fields.length
      },
    },
    {
      accessorKey: "submissions",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Submissions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return row.original.submissions || 0 // Default to 0 if submissions is not set
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: forms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <Card className="border rounded-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Forms</CardTitle>
            <CardDescription>Manage your lead generation forms</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export Forms</DropdownMenuItem>
              <DropdownMenuItem>Import Forms</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4">
          <Input placeholder="Filter forms..." className="max-w-sm" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {forms.length === 0 && (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground mb-4">Create your first form to get started</p>
            <Button onClick={onCreateForm} className="bg-[#5932EA] hover:bg-[#5932EA]/90">
              Create Form
            </Button>
          </div>
        )}
        {forms.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground bg-gray-50/50"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

