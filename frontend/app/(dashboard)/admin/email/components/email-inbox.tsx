import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaInbox } from "react-icons/fa"

export function EmailInbox() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Inbox</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FaInbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Inbox Feature Disabled</h3>
          <p className="text-muted-foreground mt-2">
            This feature is currently not available. Check back later for updates.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

