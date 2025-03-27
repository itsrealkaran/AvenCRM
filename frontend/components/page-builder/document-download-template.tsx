"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Download, Search, Eye, Clock, X, Mail, Phone, User, Building, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Document {
  id: number
  title: string
  description: string
  category: string
  type: string
  size: string
  updated: string
  downloads: number
  featured: boolean
}

interface DocumentDownloadTemplateProps {
  documents: Document[]
  title?: string
  description?: string
}

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

export default function DocumentDownloadTemplate({
  documents,
  title = "Document Resource Center",
  description = "Access our comprehensive collection of real estate documents, forms, and templates.",
}: DocumentDownloadTemplateProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showContactForm, setShowContactForm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    agreeToTerms: false,
  })

  // Filter documents based on search query and category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(documents.map((doc) => doc.category)))]

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowContactForm(false)
    // In a real app, you would send this data to your backend
  }

  const handleDownloadClick = (document: Document) => {
    if (formSubmitted) {
      // In a real app, you would trigger the actual download
      alert(`Downloading ${document.title}`)
    } else {
      setSelectedDocument(document)
      setShowContactForm(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="bg-white/20 text-white mb-4">Resource Library</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">{title}</h1>
          <p className="text-emerald-50 max-w-2xl mx-auto mb-10 text-lg">{description}</p>

          {formSubmitted ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-xl mx-auto border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">You're all set!</h2>
              <p className="text-emerald-100 mb-6">
                Thank you for your information. You can now download any document from our resource center.
              </p>
              <Button
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() =>
                  window.scrollTo({ top: document.getElementById("document-list")?.offsetTop || 0, behavior: "smooth" })
                }
              >
                Browse Documents
              </Button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-xl mx-auto border border-white/20">
              <h2 className="text-xl font-semibold mb-2">Access Our Document Library</h2>
              <p className="text-emerald-100 mb-6">
                Fill out a quick form to gain access to our complete collection of real estate documents and templates.
              </p>
              <Button
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() => setShowContactForm(true)}
              >
                Request Access
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Document List Section */}
      <div id="document-list" className="container mx-auto max-w-6xl px-4 py-12">
        {formSubmitted ? (
          <>
            {/* Search and Filter */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Browse Documents</h2>
                  <p className="text-gray-600">Find the perfect template for your real estate needs</p>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10 pr-4 py-2 w-full"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={selectedCategory === category ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDownload={() => handleDownloadClick(doc)}
                    canDownload={formSubmitted}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No documents found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Access Required</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              Please complete the request form to access our document library. This helps us provide you with the most
              relevant resources.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowContactForm(true)}>
              Request Access Now
            </Button>
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md relative border-0 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full bg-gray-100 hover:bg-gray-200 z-10"
              onClick={() => setShowContactForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardContent className="p-0 overflow-hidden">
              <div className="bg-emerald-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Document Access Request</h2>
                <p className="text-emerald-100 mt-1">
                  {selectedDocument
                    ? `Please provide your information to access "${selectedDocument.title}"`
                    : "Please provide your information to access our document library"}
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="John Doe"
                        className="pl-10 border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="john@example.com"
                        className="pl-10 border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="(123) 456-7890"
                        className="pl-10 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">
                      Company/Organization
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      placeholder="Your company name"
                      className="border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="text-sm font-medium">
                      Purpose of Download
                    </Label>
                    <Textarea
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleFormChange}
                      placeholder="Please briefly describe how you plan to use this document..."
                      rows={3}
                      className="border-gray-200 resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={handleCheckboxChange}
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-600 hover:underline">
                        Terms of Use
                      </a>{" "}
                      and acknowledge that my information will be used in accordance with the{" "}
                      <a href="#" className="text-emerald-600 hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-6">
                    <Download className="mr-2 h-4 w-4" />
                    Submit Request
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function DocumentCard({
  document,
  onDownload,
  canDownload,
}: { document: Document; onDownload: () => void; canDownload: boolean }) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-10 w-10 text-red-500" />
      case "DOCX":
        return <FileText className="h-10 w-10 text-blue-500" />
      case "XLSX":
        return <FileText className="h-10 w-10 text-green-500" />
      default:
        return <FileText className="h-10 w-10 text-gray-500" />
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md group">
      <CardHeader
        className={`p-4 ${document.type === "PDF" ? "bg-red-50" : document.type === "DOCX" ? "bg-blue-50" : "bg-green-50"}`}
      >
        <div className="flex justify-between items-start">
          {getFileIcon(document.type)}
          <div className="flex gap-2">
            <Badge
              className={`${document.type === "PDF" ? "bg-red-500" : document.type === "DOCX" ? "bg-blue-500" : "bg-green-500"}`}
            >
              {document.type}
            </Badge>
            {document.featured && <Badge className="bg-amber-500">Featured</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mt-1 group-hover:text-emerald-600 transition-colors">{document.title}</h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{document.description}</p>

        <div className="flex items-center text-xs text-gray-500 mt-4">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated {formatDate(document.updated)}</span>
        </div>

        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Download className="h-3 w-3 mr-1" />
          <span>{document.downloads.toLocaleString()} downloads</span>
        </div>

        <div className="flex items-center text-xs text-gray-500 mt-1">
          <FileText className="h-3 w-3 mr-1" />
          <span>{document.size}</span>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-between border-t border-gray-100">
        <Button variant="outline" size="sm" className="text-gray-600">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          size="sm"
          className={canDownload ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-600 hover:bg-gray-700"}
          onClick={onDownload}
        >
          {canDownload ? (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Request
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

