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
import { CreateAudienceModal } from "./create-audience-modal"
import { FaEdit, FaTrash, FaUsers } from "react-icons/fa"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { useState } from "react"

export interface AudienceGroup {
  id: string
  name: string
  phoneNumbers: string[]
  createdAt: string
}

interface AudienceListProps {
  audiences: AudienceGroup[]
  onCreateAudience: (audience: AudienceGroup) => void
}

export function AudienceList({ audiences, onCreateAudience }: AudienceListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [editingAudience, setEditingAudience] = useState<AudienceGroup | null>(null)

  const handleEditAudience = (audience: AudienceGroup) => {
    setEditingAudience(audience)
    setShowCreateModal(true)
  }

  const handleDeleteAudience = (audience: AudienceGroup) => {
    // TODO: Implement delete functionality
    console.log("Delete audience:", audience)
  }

  const columns: ColumnDef<AudienceGroup>[] = [
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
      accessorKey: "phoneNumbers",
      header: "Contacts",
      cell: ({ row }) => {
        const phoneNumbers = row.getValue("phoneNumbers") as string[]
        return <Badge variant="secondary">{phoneNumbers.length} contacts</Badge>
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
        const date = new Date(row.getValue("createdAt"))
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const audience = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditAudience(audience)}>
                <FaEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteAudience(audience)}>
                <FaTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: audiences,
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
            <CardTitle className="text-xl">Audience Groups</CardTitle>
            <CardDescription>Manage your WhatsApp audience groups</CardDescription>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Input placeholder="Filter audiences..." className="max-w-sm" />
          <Button
            onClick={() => {
              setEditingAudience(null)
              setShowCreateModal(true)
            }}
            className="bg-[#5932EA] hover:bg-[#5932EA]/90"
          >
            Create Audience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {audiences.length > 0 ? (
          <div className="container overflow-auto">
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
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold mb-2">No audience groups yet</h3>
            <p className="text-muted-foreground mb-4">Create your first audience group to get started</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-[#5932EA] hover:bg-[#5932EA]/90">
              Create Audience
            </Button>
          </div>
        )}
      </CardContent>
      <CreateAudienceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAudience={onCreateAudience}
        editingAudience={editingAudience}
      />
    </Card>
  )
}

