"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, FileText, Type, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

interface SetupFormProps {
  navigateTo: (view: string) => void
}

export default function UpdateDocumentDownload({ navigateTo }: SetupFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    documentTitle: "Document Resource Center",
    documentDescription: "Access our comprehensive collection of real estate documents, forms, and templates.",
    documentRequireForm: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load existing data if available
  useEffect(() => {
    const savedData = localStorage.getItem("realtorData")
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setFormData({
        documentTitle: parsedData.documentTitle || formData.documentTitle,
        documentDescription: parsedData.documentDescription || formData.documentDescription,
        documentRequireForm:
          parsedData.documentRequireForm !== undefined ? parsedData.documentRequireForm : formData.documentRequireForm,
      })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, documentRequireForm: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      // Get existing data
      const existingData = localStorage.getItem("realtorData")
      const parsedData = existingData ? JSON.parse(existingData) : {}

      // Update only the document download fields
      const updatedData = {
        ...parsedData,
        documentTitle: formData.documentTitle,
        documentDescription: formData.documentDescription,
        documentRequireForm: formData.documentRequireForm,
      }

      // Save back to localStorage
      localStorage.setItem("realtorData", JSON.stringify(updatedData))

      setIsSaving(false)
      setSaveSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }, 1000)
  }

  const handlePreview = () => {
    router.push("/document-download/preview")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Update Document Center
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              Preview
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="content" className="flex items-center gap-1">
              <Type className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <Card className="border-none shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Document Center Settings</CardTitle>
              </CardHeader>

              <CardContent>
                <TabsContent value="content" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="documentTitle">Page Title</Label>
                    <Input
                      id="documentTitle"
                      name="documentTitle"
                      value={formData.documentTitle}
                      onChange={handleChange}
                      placeholder="e.g. Document Resource Center"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This title appears at the top of your document center page.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentDescription">Page Description</Label>
                    <Textarea
                      id="documentDescription"
                      name="documentDescription"
                      value={formData.documentDescription}
                      onChange={handleChange}
                      placeholder="e.g. Access our comprehensive collection of real estate documents..."
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This description appears below the title and helps explain the purpose of the document center.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="documentRequireForm" className="text-base">
                          Require Contact Form
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Users must fill out a contact form before downloading documents
                        </p>
                      </div>
                      <Switch
                        id="documentRequireForm"
                        checked={formData.documentRequireForm}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                        Contact Form Fields
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        The following information will be collected from users before they can download documents:
                      </p>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li className="flex items-center">
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded mr-2">
                            Required
                          </span>
                          Full Name
                        </li>
                        <li className="flex items-center">
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded mr-2">
                            Required
                          </span>
                          Email Address
                        </li>
                        <li className="flex items-center">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded mr-2">Optional</span>
                          Phone Number
                        </li>
                        <li className="flex items-center">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded mr-2">Optional</span>
                          Company/Organization
                        </li>
                        <li className="flex items-center">
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded mr-2">
                            Required
                          </span>
                          Purpose of Download
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>

              <CardFooter className="flex justify-between">
                <div>{saveSuccess && <span className="text-green-600 text-sm">✓ Changes saved successfully</span>}</div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Tabs>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => router.push("/update/location-search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Location Search
          </Button>
          <Button variant="outline" onClick={() => router.push("/update/contact")}>
            Contact Form
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  )
}

