"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { fetchEmailCampaigns, cancelEmailCampaign, deleteEmailCampaign, getCampaignAnalytics } from "@/components/email/api"
import type { EmailCampaign } from "@/types/email"
import { FaTrash, FaChartBar, FaBan, FaPlus } from "react-icons/fa"
import { MoreHorizontal, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { AddCampaignModal } from "./add-campaign-modal"

export function EmailCampaignsList() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [currentCampaignStats, setCurrentCampaignStats] = useState<any>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setIsLoading(true)
    try {
      const response = await fetchEmailCampaigns()
      setCampaigns(response)
    } catch (error) {
      console.error("Failed to fetch email campaigns:", error)
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelCampaign = async (id: string) => {
    try {
      await cancelEmailCampaign(id)
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: "Cancelled" } : c)))
    } catch (error) {
      console.error("Failed to cancel campaign:", error)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteEmailCampaign(id)
      setCampaigns(campaigns.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Failed to delete campaign:", error)
    }
  }

  const handleViewStats = async (campaignId: string) => {
    try {
      const stats = await getCampaignAnalytics(campaignId)
      setCurrentCampaignStats(stats)
      setIsStatsModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch campaign stats:", error)
    }
  }

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Email Campaigns</CardTitle>
            <CardDescription>Create and manage your email campaigns</CardDescription>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="space-x-2">
            <Button variant="outline" onClick={loadCampaigns}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#5932EA] hover:bg-[#5932EA]/90">
              <FaPlus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.title}</TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {campaign.scheduledAt ? format(new Date(campaign.scheduledAt), "PPp") : "Not scheduled"}
                  </TableCell>
                  <TableCell>{campaign.recipientCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewStats(campaign.id)}>
                          <FaChartBar className="mr-2 h-4 w-4" />
                          View Stats
                        </DropdownMenuItem>
                        {campaign.status !== "Sent" && campaign.status !== "Cancelled" && (
                          <DropdownMenuItem onClick={() => handleCancelCampaign(campaign.id)}>
                            <FaBan className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteCampaign(campaign.id)}>
                          <FaTrash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">Create your first email campaign to get started</p>
          </div>
        )}
      </CardContent>

      <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Campaign Stats</DialogTitle>
            <DialogDescription>Detailed statistics for the selected campaign.</DialogDescription>
          </DialogHeader>
          {currentCampaignStats && (
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold">Delivery</h3>
                <p>Total: {currentCampaignStats.stats.delivery.total}</p>
                <p>Sent: {currentCampaignStats.stats.delivery.sent}</p>
                <p>Failed: {currentCampaignStats.stats.delivery.failed}</p>
                <p>Success Rate: {currentCampaignStats.stats.delivery.successRate}</p>
                <p>Delivery Rate: {currentCampaignStats.stats.delivery.deliveryRate}</p>
              </div>
              <div>
                <h3 className="font-semibold">Timing</h3>
                <p>Scheduled: {format(new Date(currentCampaignStats.stats.timing.scheduledAt), "PPp")}</p>
                <p>Sent: {format(new Date(currentCampaignStats.stats.timing.sentAt), "PPp")}</p>
                <p>Completed: {format(new Date(currentCampaignStats.stats.timing.completedAt), "PPp")}</p>
                <p>Duration: {currentCampaignStats.stats.timing.duration} seconds</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AddCampaignModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCampaignAdded={loadCampaigns}
      />
    </Card>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "Draft":
      return "bg-yellow-100 text-yellow-800"
    case "Scheduled":
      return "bg-blue-100 text-blue-800"
    case "Active":
      return "bg-green-100 text-green-800"
    case "Completed":
      return "bg-gray-100 text-gray-800"
    case "Cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

