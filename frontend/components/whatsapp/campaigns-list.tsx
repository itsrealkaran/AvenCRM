"use client"

import React, { useState } from "react"
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
import type { Campaign } from "./create-campaign-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FaEdit, FaPause, FaPlay, FaTrash } from "react-icons/fa"
import { CreateCampaignModal } from "./create-campaign-modal"


interface AudienceGroup {
  id: string
  name: string
  phoneNumbers: string[]
  createdAt: string
}

interface CampaignsListProps {
  campaigns: Campaign[]
  onCreateCampaign: () => void
  audiences: AudienceGroup[]
  onUpdateCampaign: (campaign: Campaign) => void
}

export function CampaignsList({ campaigns = [], onCreateCampaign, audiences, onUpdateCampaign }: CampaignsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setShowCampaignModal(true)
  }

  const handleToggleCampaignStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === "Active" ? "Paused" : "Active"
    // TODO: Implement status toggle functionality
    console.log("Toggle campaign status:", campaign, "New status:", newStatus)
  }

  const handleDeleteCampaign = (campaign: Campaign) => {
    // TODO: Implement delete functionality
    console.log("Delete campaign:", campaign)
  }

  const columns: ColumnDef<Campaign>[] = [
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
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const value = row.getValue("type") as string
        const typeColors = {
          text: "bg-blue-100 text-blue-800",
          image: "bg-green-100 text-green-800",
          template: "bg-purple-100 text-purple-800",
        }
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${typeColors[value as keyof typeof typeColors]}`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        )
      },
    },
    {
      accessorKey: "audience",
      header: "Audience",
      cell: ({ row }) => {
        const audience = row.getValue("audience") as AudienceGroup
        return audience.name
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const value = row.getValue("status") as string
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {value}
          </span>
        )
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
        const campaign = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                <FaEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleCampaignStatus(campaign)}>
                {campaign.status === "Active" ? (
                  <>
                    <FaPause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2 h-4 w-4" />
                    Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteCampaign(campaign)}>
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
    data: campaigns,
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
            <CardTitle className="text-xl">Campaigns</CardTitle>
            <CardDescription>View and manage your WhatsApp campaigns</CardDescription>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Input placeholder="Filter campaigns..." className="max-w-sm" />
          <Button
            onClick={() => {
              setEditingCampaign(null)
              setShowCampaignModal(true)
            }}
            className="bg-[#5932EA] hover:bg-[#5932EA]/90"
          >
            Create Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {campaigns && campaigns.length > 0 ? (
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
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">Create your first WhatsApp campaign to get started</p>
            <Button
              onClick={() => {
                setEditingCampaign(null)
                setShowCampaignModal(true)
              }}
              className="bg-[#5932EA] hover:bg-[#5932EA]/90"
            >
              Create Campaign
            </Button>
          </div>
        )}
      </CardContent>
      <CreateCampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreateCampaign={(campaign) => {
          onUpdateCampaign(campaign)
          setShowCampaignModal(false)
        }}
        onCreateAudience={(audience: AudienceGroup): AudienceGroup => {
          // This is a placeholder. The actual audience creation is handled in the parent component.
          console.log("New audience created:", audience)
          return audience
        }}
        editingCampaign={editingCampaign}
        audiences={audiences}
      />
    </Card>
  )
}