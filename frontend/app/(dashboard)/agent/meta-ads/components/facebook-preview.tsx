import { Button } from "@/components/ui/button"

interface FacebookPreviewProps {
  headline: string
  description: string
}

export function FacebookPreview({ headline, description }: FacebookPreviewProps) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div>
            <div className="font-semibold">Page Name</div>
            <div className="text-sm text-muted-foreground">Sponsored</div>
          </div>
        </div>

        <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">Preview Image</div>

        <div className="space-y-2">
          <h3 className="font-semibold">{headline || "Ad Headline"}</h3>
          <p className="text-sm text-muted-foreground">
            {description || "Ad description will appear here. Write compelling copy that attracts your audience."}
          </p>
        </div>

        <Button className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90">Sign Up Now</Button>
      </div>
    </div>
  )
}

