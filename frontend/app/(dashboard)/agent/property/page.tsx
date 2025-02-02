'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { Plus, RefreshCcw } from "lucide-react"
import PropertyCard from "@/components/property/PropertyCard"
import AddPropertyModal from "@/components/property/AddPropertyModal"
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { CurrencyProvider } from "@/contexts/CurrencyContext"

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

const dummyProperties: Property[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    address: "123 Main St, New York, NY",
    price: 750000,
    isVerified: true,
    image: "https://picsum.photos/400/300",
    beds: 2,
    baths: 2,
    sqft: 1200,
    agent: {
      name: "John Doe",
      image: "https://i.pravatar.cc/150?u=1"
    }
  },
  {
    id: "2", 
    title: "Luxury Beach House",
    address: "456 Ocean Dr, Miami, FL",
    price: 1250000,
    isVerified: false,
    image: "https://picsum.photos/400/300?random=2",
    beds: 4,
    baths: 3,
    sqft: 2500,
    agent: {
      name: "Jane Smith",
      image: "https://i.pravatar.cc/150?u=2"
    }
  },
  {
    id: "3",
    title: "Cozy Mountain Cabin",
    address: "789 Pine Rd, Aspen, CO", 
    price: 950000,
    isVerified: true,
    image: "https://picsum.photos/400/300?random=3",
    beds: 3,
    baths: 2,
    sqft: 1800,
    agent: {
      name: "Bob Wilson",
      image: "https://i.pravatar.cc/150?u=3"
    }
  }
]

const Page: React.FC = () => {
  const [myProperties, setMyProperties] = useState<Property[]>([])
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setIsRefreshing(true)
      setIsLoading(true)
      const [myPropsRes, allPropsRes] = await Promise.all([
        fetch("/api/properties?agentId=123"),
        fetch("/api/properties"),
      ])
      const myProps = await myPropsRes.json()
      const allProps = await allPropsRes.json()
      
      // Use dummy data if API returns empty arrays
      setMyProperties(myProps.length ? myProps : dummyProperties)
      setAllProperties(allProps.length ? allProps : [...dummyProperties, ...dummyProperties])
    } catch (error) {
      console.error("Error fetching properties:", error)
      // Use dummy data on API error
      setMyProperties(dummyProperties)
      setAllProperties([...dummyProperties, ...dummyProperties])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleAddProperty = (newProperty: any) => {
    console.log("New property:", newProperty)
    toast({
      title: "Property Added",
      description: "The new property has been successfully added.",
    })
    fetchProperties()
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

          <p className="text-muted-foreground">Manage and track your property listings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchProperties} disabled={isRefreshing}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      <Card className="w-[40%]">
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
          <CardDescription>Properties that need verification will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-nowrap gap-3" style={{ minWidth: "max-content" }}>
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <PropertySkeleton key={i} />)
                : myProperties.map((prop) => (
                    <PropertyCard key={prop.id} {...prop} className="w-[260px] flex-shrink-0" />
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-[60%]">
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>Browse all available properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-wrap gap-3" style={{ minWidth: "max-content" }}>
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => <PropertySkeleton key={i} />)
                : allProperties.map((prop) => (
                    <PropertyCard key={prop.id} {...prop} className="w-[260px] flex-shrink-0" />
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddProperty} />
    </Card>
  )
}


export default Page