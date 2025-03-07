import { Button } from "../ui/button";
import { Card } from "../ui/card"
import { Crown, FileText, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BrochurePlaceholder = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const handleNotifyAdmin = () => {
        toast({
            title: "Notification sent to admin",
            description: "We notified the admin about your request to upgrade to the Premium plan."
        });
    };

    return (
        <Card className="relative h-full overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            
            {/* Content */}
            <div className="relative p-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Brochure Builder</h1>
                        <p className="text-sm text-muted-foreground">Enterprise Feature</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto space-y-6">
                        <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                            <Crown className="w-8 h-8 text-primary" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">
                                Unlock Brochure Builder
                            </h2>
                            <p className="text-muted-foreground">
                                Create professional property brochures with our advanced builder. 
                                Design, customize, and generate beautiful brochures instantly.
                            </p>
                        </div>

                        {user?.role === "ADMIN" ? (
                            <Button
                                className="w-full"
                                onClick={() => window.location.href = '/admin/subscription'}
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade to Premium
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                onClick={handleNotifyAdmin}
                            >
                                Notify Admin
                            </Button>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Get access to Brochure Builder and more enterprise features
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>Enterprise Feature</span>
                        </div>
                        <span>Contact support for more info</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default BrochurePlaceholder;