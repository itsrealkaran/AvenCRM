import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { fetchEmailRecipients, createEmailRecipient, updateEmailRecipient, deleteEmailRecipient } from "@/components/email/api"
import type { EmailRecipient } from "@/types/email"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import { MoreHorizontal } from "lucide-react"
import { RefreshCw } from "lucide-react"

export function EmailRecipientsList() {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "" })
  const [editingRecipient, setEditingRecipient] = useState<EmailRecipient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const fetchedRecipients = await fetchEmailRecipients()
        setRecipients(fetchedRecipients)
      } catch (error) {
        console.error("Failed to fetch email recipients:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRecipients()
  }, [])

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const addedRecipient = await createEmailRecipient(newRecipient)
      setRecipients([...recipients, addedRecipient])
      setNewRecipient({ name: "", email: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add recipient:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRecipient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecipient) return
    setIsSubmitting(true)
    try {
      const updatedRecipient = await updateEmailRecipient(editingRecipient.id, editingRecipient)
      setRecipients(recipients.map((r) => (r.id === updatedRecipient.id ? updatedRecipient : r)))
      setEditingRecipient(null)
    } catch (error) {
      console.error("Failed to update recipient:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRecipient = async (id: string) => {
    try {
      await deleteEmailRecipient(id)
      setRecipients(recipients.filter((r) => r.id !== id))
    } catch (error) {
      console.error("Failed to delete recipient:", error)
    }
  }

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const loadRecipients = async () => {
    setIsLoading(true)
    try {
      const fetchedRecipients = await fetchEmailRecipients()
      setRecipients(fetchedRecipients)
    } catch (error) {
      console.error("Failed to fetch email recipients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Email Recipients</CardTitle>
            <CardDescription>Manage your email recipients</CardDescription>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Input
            placeholder="Search recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="space-x-2">
            <Button variant="outline" onClick={() => loadRecipients()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#5932EA] hover:bg-[#5932EA]/90">
              <FaPlus className="mr-2 h-4 w-4" /> Add Recipient
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded float-right animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRecipients.length > 0 ? (
              filteredRecipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell>{recipient.name}</TableCell>
                  <TableCell>{recipient.email}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingRecipient(recipient)} className="cursor-pointer">
                          <FaEdit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRecipient(recipient.id)}
                          className="cursor-pointer text-red-600"
                        >
                          <FaTrash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <h3 className="text-lg font-semibold mb-2">No recipients found</h3>
                  <p className="text-muted-foreground mb-4">Add your first recipient to get started</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#5932EA] hover:bg-[#5932EA]/90">
                    <FaPlus className="mr-2 h-4 w-4" /> Add Recipient
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog
        open={isAddDialogOpen || !!editingRecipient}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingRecipient(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingRecipient ? "Edit Recipient" : "Add New Recipient"}</DialogTitle>
            <DialogDescription>
              {editingRecipient
                ? "Make changes to the recipient details below."
                : "Enter the details for the new recipient."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingRecipient ? handleUpdateRecipient : handleAddRecipient}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor={editingRecipient ? "edit-name" : "name"}>Name</Label>
                <Input
                  id={editingRecipient ? "edit-name" : "name"}
                  value={editingRecipient ? editingRecipient.name : newRecipient.name}
                  onChange={(e) =>
                    editingRecipient
                      ? setEditingRecipient({ ...editingRecipient, name: e.target.value })
                      : setNewRecipient({ ...newRecipient, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={editingRecipient ? "edit-email" : "email"}>Email</Label>
                <Input
                  id={editingRecipient ? "edit-email" : "email"}
                  type="email"
                  value={editingRecipient ? editingRecipient.email : newRecipient.email}
                  onChange={(e) =>
                    editingRecipient
                      ? setEditingRecipient({ ...editingRecipient, email: e.target.value })
                      : setNewRecipient({ ...newRecipient, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#5932EA] hover:bg-[#5932EA]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {editingRecipient ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingRecipient ? "Update Recipient" : "Add Recipient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
