import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DiagnosticInfo {
  diagnosticCodeId: string;
  errorCode: string;
  manufacturer: string;
  machineType?: string;
}

interface FixOutcomeFeedbackProps {
  diagnosticInfo: DiagnosticInfo;
  onFeedbackSubmitted?: () => void;
}

export function FixOutcomeFeedback({ diagnosticInfo, onFeedbackSubmitted }: FixOutcomeFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<string>("");
  const [timeSpent, setTimeSpent] = useState<string>("");
  const [additionalSteps, setAdditionalSteps] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitFeedback = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/service-guy/fix-outcome", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps improve repair success rates for everyone."
      });
      onFeedbackSubmitted?.();
      setTimeout(() => setOpen(false), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!outcome) {
      toast({
        title: "Please select an outcome",
        description: "Let us know if the fix worked",
        variant: "destructive"
      });
      return;
    }

    submitFeedback.mutate({
      diagnosticCodeId: diagnosticInfo.diagnosticCodeId,
      errorCode: diagnosticInfo.errorCode,
      manufacturer: diagnosticInfo.manufacturer,
      machineType: diagnosticInfo.machineType,
      outcome,
      timeSpent: timeSpent ? parseInt(timeSpent) : null,
      additionalSteps: additionalSteps || null,
      notes: notes || null
    });
  };

  const outcomeOptions = [
    { value: "fixed", label: "Yes, fixed!", icon: ThumbsUp, color: "text-green-500" },
    { value: "partially_fixed", label: "Partially fixed", icon: AlertCircle, color: "text-amber-500" },
    { value: "not_fixed", label: "Didn't work", icon: ThumbsDown, color: "text-red-500" },
    { value: "wrong_diagnosis", label: "Wrong issue", icon: MessageSquare, color: "text-blue-500" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-fix-feedback"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Did this work?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            How did the repair go?
          </DialogTitle>
          <DialogDescription>
            Your feedback helps improve success rates for all technicians
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Thanks for your feedback!</h3>
            <p className="text-muted-foreground">
              This helps us improve repair success rates for everyone.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Code:</strong> {diagnosticInfo.errorCode}
              </p>
              <p className="text-sm text-muted-foreground">
                {diagnosticInfo.manufacturer}
              </p>
            </div>

            <div className="space-y-3">
              <Label>Did the suggested fix work?</Label>
              <RadioGroup value={outcome} onValueChange={setOutcome} className="grid grid-cols-2 gap-2">
                {outcomeOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      outcome === option.value 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <option.icon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-sm">{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSpent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Actual repair time (minutes)
              </Label>
              <Input
                id="timeSpent"
                type="number"
                placeholder="e.g., 45"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                data-testid="input-time-spent"
              />
            </div>

            {(outcome === "partially_fixed" || outcome === "not_fixed" || outcome === "wrong_diagnosis") && (
              <div className="space-y-2">
                <Label htmlFor="additionalSteps">What else was needed?</Label>
                <Textarea
                  id="additionalSteps"
                  placeholder="Describe any additional steps you took..."
                  value={additionalSteps}
                  onChange={(e) => setAdditionalSteps(e.target.value)}
                  rows={2}
                  data-testid="input-additional-steps"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Any other notes? (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Tips for other techs, part numbers that worked, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                data-testid="input-notes"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!outcome || submitFeedback.isPending}
                data-testid="button-submit-feedback"
              >
                {submitFeedback.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function QuickFixFeedback({ diagnosticInfo, onFeedbackSubmitted }: FixOutcomeFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitFeedback = useMutation({
    mutationFn: async (outcome: string) => {
      return apiRequest("/api/service-guy/fix-outcome", {
        method: "POST",
        body: JSON.stringify({
          diagnosticCodeId: diagnosticInfo.diagnosticCodeId,
          errorCode: diagnosticInfo.errorCode,
          manufacturer: diagnosticInfo.manufacturer,
          machineType: diagnosticInfo.machineType,
          outcome
        }),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Thanks!",
        description: "Your feedback helps improve success rates."
      });
      onFeedbackSubmitted?.();
    }
  });

  if (submitted) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-300">
        <CheckCircle className="w-3 h-3 mr-1" />
        Thanks!
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Did this work?</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={() => submitFeedback.mutate("fixed")}
        disabled={submitFeedback.isPending}
        data-testid="button-quick-thumbs-up"
      >
        <ThumbsUp className="w-4 h-4 text-green-500" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={() => submitFeedback.mutate("not_fixed")}
        disabled={submitFeedback.isPending}
        data-testid="button-quick-thumbs-down"
      >
        <ThumbsDown className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}
