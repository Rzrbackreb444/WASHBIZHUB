import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Save,
  Check,
  Download,
  Share2,
  Printer,
  FileText,
  FileSpreadsheet,
  FileJson,
  Copy,
  ExternalLink,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Crown,
  ChevronDown,
} from "lucide-react";
import { SiX, SiFacebook } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

interface ResultsToolbarProps {
  analysisType: string;
  title: string;
  data: Record<string, any>;
  summary?: {
    headline: string;
    metrics: { label: string; value: string }[];
  };
  isPremiumFeature?: boolean;
  className?: string;
}

export function ResultsToolbar({
  analysisType,
  title,
  data,
  summary,
  isPremiumFeature = false,
  className = "",
}: ResultsToolbarProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const generateDefaultTitle = () => {
    const typeLabel = analysisType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (summary?.metrics?.[0]) {
      return `${typeLabel} - ${summary.metrics[0].value} (${dateStr})`;
    }
    return `${typeLabel} Analysis (${dateStr})`;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: { analysisType: string; title: string; data: Record<string, any>; notes?: string }) => {
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
        setSaveDialogOpen(false);
        setSaved(false);
        setSaveTitle("");
        setSaveNotes("");
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
    if (!saveTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your analysis.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      analysisType,
      title: saveTitle.trim(),
      data,
      notes: saveNotes.trim() || undefined,
    });
  };

  const handleSaveClick = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save your analyses.",
      });
      return;
    }
    setSaveTitle(generateDefaultTitle());
    setSaveDialogOpen(true);
  };

  const exportToPDF = async () => {
    if (isPremiumFeature && !user) {
      toast({
        title: "Premium Feature",
        description: "Sign in to export your results as PDF.",
      });
      return;
    }

    try {
      setIsExporting(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(10, 22, 40);
      doc.rect(0, 0, pageWidth, 50, "F");

      doc.setTextColor(200, 166, 97);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(title, pageWidth / 2, 25, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Powered by WashBizHub.com", pageWidth / 2, 38, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      let yPos = 65;

      if (summary) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(summary.headline, 20, yPos);
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        summary.metrics.forEach((metric) => {
          doc.text(`${metric.label}: ${metric.value}`, 25, yPos);
          yPos += 10;
        });
        yPos += 10;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Analysis Data", 20, yPos);
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const formatDataForPDF = (obj: Record<string, any>, indent = 0): void => {
        Object.entries(obj).forEach(([key, value]) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          if (typeof value === "object" && value !== null) {
            doc.text(`${label}:`, 25 + indent, yPos);
            yPos += 8;
            formatDataForPDF(value, indent + 10);
          } else {
            const displayValue = typeof value === "number" ? value.toLocaleString() : String(value);
            doc.text(`${label}: ${displayValue}`, 25 + indent, yPos);
            yPos += 8;
          }
        });
      };

      formatDataForPDF(data);

      yPos += 15;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | WashBizHub.com - Professional Laundromat Intelligence`,
        20,
        yPos
      );
      doc.text("This report is for informational purposes only and does not constitute financial advice.", 20, yPos + 5);

      doc.save(`${analysisType}-report-${Date.now()}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your professional report has been saved.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogleSheets = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to export to Google Sheets.",
      });
      return;
    }

    try {
      setIsExporting(true);
      const response = await apiRequest("POST", "/api/google/export-to-sheets", {
        title,
        analysisType,
        data,
        summary,
      });

      const result = await response.json();
      if (result.spreadsheetUrl) {
        window.open(result.spreadsheetUrl, "_blank");
        toast({
          title: "Exported to Google Sheets",
          description: "Your analysis has been exported successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export to Google Sheets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogleDocs = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to export to Google Docs.",
      });
      return;
    }

    try {
      setIsExporting(true);
      const response = await apiRequest("POST", "/api/google/export-to-docs", {
        title,
        analysisType,
        data,
        summary,
      });

      const result = await response.json();
      if (result.documentUrl) {
        window.open(result.documentUrl, "_blank");
        toast({
          title: "Exported to Google Docs",
          description: "Your analysis has been exported successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export to Google Docs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAsJSON = () => {
    const exportData = {
      title,
      analysisType,
      generatedAt: new Date().toISOString(),
      summary,
      data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analysisType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "JSON Downloaded",
      description: "Your analysis data has been saved.",
    });
  };

  const copyToClipboard = async () => {
    const textContent = generateShareText();
    try {
      await navigator.clipboard.writeText(textContent);
      toast({
        title: "Copied to Clipboard",
        description: "Analysis results copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const generateShareText = () => {
    let text = `${title}\n\n`;
    if (summary) {
      text += `${summary.headline}\n\n`;
      summary.metrics.forEach((m) => {
        text += `${m.label}: ${m.value}\n`;
      });
      text += "\n";
    }
    text += `Analyzed with WashBizHub.com - Professional Laundromat Intelligence`;
    return text;
  };

  const generateShareUrl = () => {
    return `${window.location.origin}?utm_source=share&utm_medium=social&utm_campaign=${analysisType}`;
  };

  const shareToLinkedIn = () => {
    const text = encodeURIComponent(
      summary?.headline || `Check out my ${title} analysis from WashBizHub!`
    );
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank", "width=600,height=600");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `${summary?.headline || title}\n\nAnalyzed with @WashBizHub\n${generateShareUrl()}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=600,height=400");
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=600");
  };

  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl());
      toast({
        title: "Link Copied",
        description: "Shareable link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link.",
        variant: "destructive",
      });
    }
  };

  const emailResults = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(generateShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border",
          className
        )}
        data-testid="results-toolbar"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveClick}
              className="gap-1.5"
              data-testid="button-save-to-profile"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save to Profile</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={isExporting}
                  data-testid="button-export-dropdown"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Export Options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Export As</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportToPDF} data-testid="menu-export-pdf">
              <FileText className="h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToGoogleSheets} data-testid="menu-export-sheets">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Google Sheets
              {!user && <Crown className="h-3 w-3 ml-auto text-[#C8A661]" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToGoogleDocs} data-testid="menu-export-docs">
              <FileText className="h-4 w-4" />
              Export to Google Docs
              {!user && <Crown className="h-3 w-3 ml-auto text-[#C8A661]" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={downloadAsJSON} data-testid="menu-export-json">
              <FileJson className="h-4 w-4" />
              Download as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyToClipboard} data-testid="menu-copy-clipboard">
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  data-testid="button-share-dropdown"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Share Results</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Share To</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={shareToLinkedIn} data-testid="menu-share-linkedin">
              <Linkedin className="h-4 w-4" />
              Share to LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareToTwitter} data-testid="menu-share-twitter">
              <SiX className="h-4 w-4" />
              Share to X (Twitter)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareToFacebook} data-testid="menu-share-facebook">
              <SiFacebook className="h-4 w-4" />
              Share to Facebook
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyShareableLink} data-testid="menu-copy-link">
              <LinkIcon className="h-4 w-4" />
              Copy Shareable Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={emailResults} data-testid="menu-email-results">
              <Mail className="h-4 w-4" />
              Email Results
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
              data-testid="button-print"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print Results</TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
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
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter a title for this analysis"
                data-testid="input-analysis-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="analysis-notes">Notes (optional)</Label>
              <Textarea
                id="analysis-notes"
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                placeholder="Add any notes or context..."
                rows={3}
                data-testid="input-analysis-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
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
    </>
  );
}
