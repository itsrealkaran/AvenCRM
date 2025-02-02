'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { RefreshCcw } from "lucide-react"
import PropertyCard from "@/components/property/PropertyCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  title: string
  address: string
  price: number
  isVerified: boolean
  image?: string
  beds: number
  baths: number
  sqft: number
  agent: {
    name: string
    image?: string
  }
}

const Page: React.FC = () => {
  const [unverifiedProperties, setUnverifiedProperties] = useState<Property[]>([])
  const [verifiedProperties, setVerifiedProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setIsRefreshing(true)
      const [unverifiedRes, verifiedRes] = await Promise.all([
        fetch("/api/properties?isVerified=false"),
        fetch("/api/properties?isVerified=true"),
      ])
      const unverifiedProps = await unverifiedRes.json()
      const verifiedProps = await verifiedRes.json()
      setUnverifiedProperties(unverifiedProps)
      setVerifiedProperties(verifiedProps)
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      // In a real scenario, you'd make an API call to verify the property
      setUnverifiedProperties((prev) => prev.filter((p) => p.id !== id))
      const verifiedProperty = unverifiedProperties.find((p) => p.id === id)!
      setVerifiedProperties((prev) => [...prev, { ...verifiedProperty, isVerified: true }])

      toast({
        title: "Property Verified",
        description: "The property has been successfully verified.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const PropertySkeleton = () => (
    <Card className="w-[260px] flex-shrink-0">
      <CardContent className="p-0">
        <Skeleton className="h-[180px] w-full" />
        <div className="p-3 space-y-3">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Property Management</h1>
          <p className="text-muted-foreground">Review and verify property listings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProperties} disabled={isRefreshing}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verification</CardTitle>
          <CardDescription>Properties that need your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-wrap gap-3" style={{ minWidth: "max-content" }}>
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <PropertySkeleton key={i} />)
              ) : unverifiedProperties.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 w-full">No properties pending verification</p>
              ) : (
                unverifiedProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    {...prop}
                    onVerify={() => handleVerify(prop.id)}
                    className="w-[260px] flex-shrink-0"
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verified Properties</CardTitle>
          <CardDescription>All verified property listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-wrap gap-3" style={{ minWidth: "max-content" }}>
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => <PropertySkeleton key={i} />)
                : verifiedProperties.map((prop) => (
                    <PropertyCard key={prop.id} {...prop} className="w-[260px] flex-shrink-0" />
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Card>
  )
}


export default Page

