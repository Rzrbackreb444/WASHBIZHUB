import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SaveAnalysisButtonProps {
  analysisType: string;
  data: Record<string, unknown>;
  defaultTitle?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SaveAnalysisButton({
  analysisType,
  data,
  defaultTitle = "",
  variant = "outline",
  size = "default",
  className = "",
}: SaveAnalysisButtonProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (payload: { analysisType: string; title: string; data: Record<string, unknown>; notes?: string }) => {
      const response = await apiRequest("POST", "/api/analyses", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      setSaved(true);
      toast({
        title: "Analysis Saved",
        description: (
          <div className="flex items-center gap-2">
            <span>Your analysis has been saved to your profile.</span>
            <Link href="/saved-analyses" className="text-[#C8A661] hover:underline flex items-center gap-1">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        ),
      });
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setTitle(defaultTitle);
        setNotes("");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save your analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your analysis.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      analysisType,
      title: title.trim(),
      data,
      notes: notes.trim() || undefined,
    });
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          toast({
            title: "Sign In Required",
            description: "Please sign in to save your analyses.",
          });
        }}
        data-testid="button-save-analysis-unauthenticated"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Analysis
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          data-testid="button-save-analysis"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-save-analysis">
        <DialogHeader>
          <DialogTitle>Save Analysis</DialogTitle>
          <DialogDescription>
            Save this {analysisType.replace(/-/g, " ")} analysis to your profile for future reference.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="analysis-title">Title</Label>
            <Input
              id="analysis-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this analysis"
              data-testid="input-analysis-title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="analysis-notes">Notes (optional)</Label>
            <Textarea
              id="analysis-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or context..."
              rows={3}
              data-testid="input-analysis-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saveMutation.isPending}
            data-testid="button-cancel-save"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || saved}
            className={saved ? "bg-green-600 hover:bg-green-600" : "bg-[#0A1628] hover:bg-[#1a3a5c]"}
            data-testid="button-confirm-save"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : saveMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
