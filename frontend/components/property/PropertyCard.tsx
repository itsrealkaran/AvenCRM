import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Car, Bath, Maximize2, Share2, Heart } from "lucide-react"
import { useCurrency } from "@/contexts/CurrencyContext"

interface PropertyCardProps {
  id: string
  title: string
  address: string
  price: number
  isVerified: boolean
  onVerify?: () => void
  image?: string
  beds: number
  baths: number
  sqft: number
  agent: {
    name: string
    image?: string
  }
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  address,
  price,
  isVerified,
  onVerify,
  image = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2Ch4LV1lFtOMyKP31tCMdmxjiljjrr.png",
  beds = 4,
  baths = 4,
  sqft = 2096,
  agent = {
    name: "Jenny Wilson",
    image: "/placeholder.svg?height=32&width=32",
  },
}) => {
  const { formatPrice } = useCurrency()

  return (
    <Card className="w-full max-w-[260px] overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
        {!isVerified && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-medium"
          >
            Pending Verification
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white">
            <Share2 className="w-4 h-4 text-gray-700" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white">
            <Heart className="w-4 h-4 text-gray-700" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm text-gray-500">{address}</h3>
            <p className="text-xl font-bold text-[#4F46E5] mt-1">{formatPrice(price)}</p>
          </div>

          <div className="flex items-center justify-between py-1 border-y border-gray-100">
            <div className="flex items-center gap-1.5">
              <Car className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">{beds}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">{baths}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">{sqft.toLocaleString()} ft²</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={agent.image} alt={agent.name} />
                <AvatarFallback>{agent.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-gray-700">{agent.name}</span>
            </div>
          </div>

          {!isVerified && onVerify && (
            <Button onClick={onVerify} className="w-full mt-2 text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
              Verify Property
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyCard

