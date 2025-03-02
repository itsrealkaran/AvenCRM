import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userLimit: number;
}

export function UpgradePlanDialog({ isOpen, onClose, userLimit }: UpgradePlanDialogProps) {
  const handleUpgrade = () => {
    window.location.href = `/admin/subscription`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the maximum limit of {userLimit} users for your current plan. 
            Upgrade your plan to add more agents and unlock additional features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpgrade}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            Upgrade Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 