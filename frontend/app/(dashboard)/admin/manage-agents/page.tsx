"use client"

import { useState } from "react"
import { type User, UserRole } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { AgentMetricsDialog } from "./agent-metrics-dialog"
import { columns } from "./columns"
import { CreateAgentDialog } from "./create-agent-dialog"
import { DataTable } from "./data-table"
import { EditAgentDialog } from "./edit-agent-dialog"

async function getAgents(): Promise<User[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Failed to fetch agents")
  }
  return response.json()
}

async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Failed to fetch current user")
  }
  return response.json()
}

export default function ManageAgentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  //const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient()

  const {
    data: agents = [],
    isLoading: isAgentsLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAgents,
  })

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  })

  const deleteAgent = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${agentId}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Agent deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete agent")
    },
  })

  const bulkDeleteAgents = useMutation({
    mutationFn: async (agentIds: string[]) => {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user?ids=${agentIds.join(",")}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Agents deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete agents")
    },
  })

  const handleEdit = (agent: User) => {
    setSelectedAgent(agent)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (agentId: string) => {
    try {
      await deleteAgent.mutateAsync(agentId)
    } catch (error) {
      toast.error("Failed to delete agent")
    }
  }

  const handleBulkDelete = async (agentIds: string[]) => {
    try {
      await bulkDeleteAgents.mutateAsync(agentIds)
    } catch (error) {
      toast.error("Failed to delete agents")
    }
  }

  const handleViewMetrics = (agentId: string) => {
    setSelectedAgentId(agentId)
    setIsMetricsDialogOpen(true)
  }

  const handleAddTeamMember = async (teamLeaderId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team/add-member/${teamLeaderId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to add team member")
      }

      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Team member added successfully")
    } catch (error) {
      console.error("Error adding team member:", error)
      toast.error("Failed to add team member")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleDownload = (format: "csv" | "xlsx") => {
    // Implement download logic here
    toast.success(`Downloading ${format.toUpperCase()} file...`)
  }

  return (
    <div className="container h-full mx-auto">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Agent Management</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {/*<div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search agents..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>*/}
          <DataTable
              columns={columns}
              data={agents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkDelete={async (rows) => {
              const agentIds = rows.map((row) => row.original.id)
              await handleBulkDelete(agentIds)
            }}
            onViewMetrics={handleViewMetrics}
            onAddTeamMember={handleAddTeamMember}
            showTeamActions={currentUser?.role === "TEAM_LEADER"}
            disabled={isLoading || isAgentsLoading}
            isLoading={isAgentsLoading}
            onRefresh={handleRefresh}
            onDownload={handleDownload}
            onCreateAgent={() => setIsCreateDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <CreateAgentDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      <EditAgentDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} user={selectedAgent} />
      <AgentMetricsDialog open={isMetricsDialogOpen} onOpenChange={setIsMetricsDialogOpen} userId={selectedAgentId} />
    </div>
  )
}

