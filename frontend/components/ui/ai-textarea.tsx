"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onAIComplete?: (result: string) => void;
}

export function AITextarea({ className, onAIComplete, value: propValue, onChange: propOnChange, ...props }: AITextareaProps) {
  const [prompt, setPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { toast } = useToast();

  // Sync with external value prop if provided
  React.useEffect(() => {
    if (propValue !== undefined) {
      setValue(propValue as string);
    }
  }, [propValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    propOnChange?.(e);
  };

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setValue(data.result);
      onAIComplete?.(data.result);
      setOpen(false);
      setPrompt("");
      
      toast({
        title: "Success",
        description: "Content generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleChange}
        className={cn(
          "min-h-[100px] resize-y pr-12",
          className
        )}
        {...props}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-8 w-8 opacity-70 hover:opacity-100"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Content</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleGenerateContent}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}