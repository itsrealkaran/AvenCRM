import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaMicrosoft } from "react-icons/fa"
import { connectEmailAccount } from "@/components/email/api"
import type { EmailAccount } from "@/types/email"

interface ConnectEmailModalProps {
  open: boolean
  onClose: () => void
  onConnect: (account: EmailAccount) => void
}

export function ConnectEmailModal({ open, onClose, onConnect }: ConnectEmailModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (provider: "GMAIL" | "OUTLOOK") => {
    setIsConnecting(true)
    try {
      const redirectUrl = await connectEmailAccount(provider)
      window.location.href = redirectUrl
      // Note: You'll need to handle the OAuth callback and account creation separately
    } catch (error) {
      console.error("Failed to connect account:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Email Account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 mt-4">
          <Button
            onClick={() => handleConnect("GMAIL")}
            disabled={isConnecting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <FaGoogle className="w-5 h-5 mr-2" />
            Connect Gmail
          </Button>
          <Button
            onClick={() => handleConnect("OUTLOOK")}
            disabled={isConnecting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <FaMicrosoft className="w-5 h-5 mr-2" />
            Connect Outlook
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

