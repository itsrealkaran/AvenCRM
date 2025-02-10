import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEmailCampaign, fetchEmailTemplates, fetchEmailRecipients, fetchEmailTemplate } from "@/components/email/api"
import type { EmailTemplate, EmailRecipient } from "@/types/email"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface AddCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignAdded: () => void
}

export function AddCampaignModal({ isOpen, onClose, onCampaignAdded }: AddCampaignModalProps) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [templateId, setTemplateId] = useState("")
  const [recipientIds, setRecipientIds] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [recipients, setRecipients] = useState<EmailRecipient[]>([])
  const [recipientSearch, setRecipientSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const templatesResponse = await fetchEmailTemplates()
        setTemplates(templatesResponse)
        const recipientsResponse = await fetchEmailRecipients()
        setRecipients(recipientsResponse)
      } catch (error) {
        console.error("Failed to load templates or recipients:", error)
      }
    }
    loadData()
  }, [])

  const handleTemplateChange = async (value: string) => {
    setTemplateId(value)
    if (value) {
      try {
        const template = await fetchEmailTemplate(value)
        if (template) {
          setSubject(template.subject)
          setContent(template.content)
        } else {
          console.error("Template not found")
          // Optionally, you can show an error message to the user here
        }
      } catch (error) {
        console.error("Failed to fetch template details:", error)
        // Optionally, you can show an error message to the user here
      }
    } else {
      // Reset subject and content if no template is selected
      setSubject("")
      setContent("")
    }
  }

  const handleAddRecipient = (recipientId: string) => {
    if (!recipientIds.includes(recipientId)) {
      setRecipientIds([...recipientIds, recipientId])
    }
    setRecipientSearch("")
  }

  const handleRemoveRecipient = (recipientId: string) => {
    setRecipientIds(recipientIds.filter((id) => id !== recipientId))
  }

  const filteredRecipients = recipients.filter(
    (recipient) =>
      !recipientIds.includes(recipient.id) &&
      (recipient.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        recipient.email.toLowerCase().includes(recipientSearch.toLowerCase())),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createEmailCampaign({
        title,
        subject,
        content,
        recipientIds,
        templateId: templateId || undefined,
        scheduledAt: scheduledAt?.toISOString(),
      })
      onCampaignAdded()
      onClose()
      // Reset form
      setTitle("")
      setSubject("")
      setContent("")
      setTemplateId("")
      setRecipientIds([])
      setScheduledAt(undefined)
    } catch (error) {
      console.error("Failed to create campaign:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Create a new email campaign for your audience.</DialogDescription>
        </DialogHeader>
        <form id="campaignForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-6">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter campaign title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Email Content</Label>
              <div className="border rounded-md bg-white">
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="p-4">
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[200px] w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Enter your email content here..."
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="p-4">
                    <div className="border rounded p-4 min-h-[200px]" dangerouslySetInnerHTML={{ __html: content }} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipients">Recipients</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    id="recipients"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder="Search recipients..."
                  />
                </div>
                {recipientSearch && filteredRecipients.length > 0 && (
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    {filteredRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAddRecipient(recipient.id)}
                      >
                        <span>
                          {recipient.name} ({recipient.email})
                        </span>
                        <Button type="button" variant="ghost" size="sm">
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {recipientIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipientIds.map((id) => {
                      const recipient = recipients.find((r) => r.id === id)
                      return (
                        <Badge key={id} variant="secondary" className="flex items-center space-x-1">
                          <span>{recipient?.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveRecipient(id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scheduledAt">Schedule</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="scheduledAt"
                    variant={"outline"}
                    className={cn("justify-start text-left font-normal", !scheduledAt && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledAt ? format(scheduledAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={scheduledAt} onSelect={setScheduledAt} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button 
            type="submit" 
            form="campaignForm" 
            className="bg-[#5932EA] hover:bg-[#5932EA]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Campaign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
