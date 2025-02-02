import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaWhatsapp } from "react-icons/fa"

export function ConnectedAccounts() {
  const accounts = [
    { id: 1, name: "Main Business Account", phoneNumber: "+1 (555) 123-4567", status: "Active" },
    { id: 2, name: "Customer Support", phoneNumber: "+1 (555) 987-6543", status: "Active" },
  ]

  return (
    <Card>
      <CardHeader>
        <div>
        <CardTitle className="text-xl">Connected Accounts</CardTitle>
        <CardDescription>Manage your connected WhatsApp Business accounts</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FaWhatsapp className="w-8 h-8 text-[#25D366]" />
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-muted-foreground">{account.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{account.status}</span>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

