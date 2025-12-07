import { useState } from "react";
import { Download, Mail, Loader2, Lock, Crown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AnalysisReportGeneratorProps {
  analysis: {
    address: string;
    cleanbiScore: number;
    grade: string;
    competitorCount: number;
    populationDensity: number;
    medianIncome: number;
    trafficScore: number;
    opportunityLevel: string;
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
  } | null;
  isSubscriber: boolean;
  onUpgradeClick?: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635", 
  "C": "#FBBF24",
  "D": "#F97316",
  "F": "#EF4444",
  "Needs Work": "#C8A661"
};

const OPPORTUNITY_LABELS: Record<string, string> = {
  "goldmine": "Gold Mine Zone",
  "promising": "High Opportunity",
  "moderate": "Good Potential",
  "saturated": "Room to Grow",
  "oversaturated": "Strategic Location"
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function AnalysisReportGenerator({ 
  analysis, 
  isSubscriber, 
  onUpgradeClick 
}: AnalysisReportGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!analysis) {
      toast({
        title: "No Analysis Data",
        description: "Please run an analysis first before generating a report.",
        variant: "destructive"
      });
      return;
    }

    if (!isSubscriber) {
      onUpgradeClick?.();
      return;
    }

    setIsGenerating(true);

    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      const gradeColor = GRADE_COLORS[analysis.grade] || GRADE_COLORS["Needs Work"];
      const opportunityText = OPPORTUNITY_LABELS[analysis.opportunityLevel] || analysis.opportunityLevel;
      const analysisDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      container.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <!-- Header -->
          <div style="background: #0A1628; padding: 24px 32px; border-radius: 8px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="color: #C8A661; font-size: 28px; font-weight: 700; margin: 0;">WashBizHub</h1>
                <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0; opacity: 0.9;">CLEANBI Location Intelligence Report</p>
              </div>
              <div style="text-align: right;">
                <p style="color: #C8A661; font-size: 12px; margin: 0;">Report Generated</p>
                <p style="color: #ffffff; font-size: 14px; margin: 4px 0 0 0;">${analysisDate}</p>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #C8A661;">
            <p style="color: #666; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Property Address</p>
            <p style="color: #0A1628; font-size: 18px; font-weight: 600; margin: 0;">${analysis.address}</p>
          </div>

          <!-- Score Section -->
          <div style="display: flex; gap: 24px; margin-bottom: 32px;">
            <!-- CLEANBI Score Circle -->
            <div style="flex: 1; text-align: center; padding: 24px; background: #f8f9fa; border-radius: 12px;">
              <div style="width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #0A1628 0%, #1a3a5c 100%); margin: 0 auto 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(10, 22, 40, 0.3);">
                <span style="color: #C8A661; font-size: 48px; font-weight: 700; line-height: 1;">${analysis.cleanbiScore}</span>
                <span style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 4px;">CLEANBI Score</span>
              </div>
              <div style="display: inline-block; padding: 8px 24px; border-radius: 20px; background: ${gradeColor}20;">
                <span style="color: ${gradeColor}; font-size: 24px; font-weight: 700;">Grade ${analysis.grade}</span>
              </div>
            </div>

            <!-- Opportunity Assessment -->
            <div style="flex: 1; padding: 24px; background: #f8f9fa; border-radius: 12px;">
              <h3 style="color: #0A1628; font-size: 14px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Opportunity Assessment</h3>
              <div style="background: #0A1628; color: #C8A661; padding: 12px 20px; border-radius: 8px; font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 16px;">
                ${opportunityText}
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="text-align: center; padding: 12px; background: #ffffff; border-radius: 8px;">
                  <p style="color: #0A1628; font-size: 24px; font-weight: 700; margin: 0;">${analysis.competitorCount}</p>
                  <p style="color: #666; font-size: 11px; margin: 4px 0 0 0;">Competitors (1mi)</p>
                </div>
                <div style="text-align: center; padding: 12px; background: #ffffff; border-radius: 8px;">
                  <p style="color: #0A1628; font-size: 24px; font-weight: 700; margin: 0;">${analysis.trafficScore}</p>
                  <p style="color: #666; font-size: 11px; margin: 4px 0 0 0;">Traffic Score</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div style="margin-bottom: 32px;">
            <h3 style="color: #0A1628; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #C8A661;">Key Market Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #C8A661; font-size: 28px; font-weight: 700; margin: 0;">${formatNumber(analysis.populationDensity)}</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">Population Density</p>
                <p style="color: #999; font-size: 10px; margin: 2px 0 0 0;">per sq mi</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #C8A661; font-size: 28px; font-weight: 700; margin: 0;">${formatCurrency(analysis.medianIncome)}</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">Median Income</p>
                <p style="color: #999; font-size: 10px; margin: 2px 0 0 0;">annual household</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #C8A661; font-size: 28px; font-weight: 700; margin: 0;">${analysis.competitorCount}</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">Nearby Competitors</p>
                <p style="color: #999; font-size: 10px; margin: 2px 0 0 0;">within 1 mile radius</p>
              </div>
            </div>
          </div>

          ${(analysis.walkScore || analysis.transitScore || analysis.bikeScore) ? `
          <!-- Walkability Scores -->
          <div style="margin-bottom: 32px;">
            <h3 style="color: #0A1628; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #C8A661;">Accessibility Scores</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              ${analysis.walkScore ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #0A1628; font-size: 32px; font-weight: 700; margin: 0;">${analysis.walkScore}</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">Walk Score</p>
              </div>
              ` : ''}
              ${analysis.transitScore ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #0A1628; font-size: 32px; font-weight: 700; margin: 0;">${analysis.transitScore}</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">Transit Score</p>
              </div>
              ` : ''}
              ${analysis.bikeScore ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #0A1628; font-size: 32px; font-weight: 700; margin: 0;">${analysis.bikeScore}</p>
                <p style="color: #666; font-size: 12px; margin: 8px 0 0 0;">Bike Score</p>
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="color: #0A1628; font-size: 14px; font-weight: 600; margin: 0;">Generated by WashBizHub.com</p>
                <p style="color: #666; font-size: 11px; margin: 4px 0 0 0;">The #1 Platform for Laundromat Intelligence</p>
              </div>
              <div style="text-align: right;">
                <p style="color: #666; font-size: 11px; margin: 0;">${timestamp}</p>
                <p style="color: #999; font-size: 10px; margin: 4px 0 0 0;">Data subject to change. For informational purposes only.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const addressSlug = analysis.address
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30);
      const fileName = `cleanbi-report-${addressSlug}-${Date.now()}.pdf`;
      
      pdf.save(fileName);

      toast({
        title: "Report Generated",
        description: "Your CLEANBI report has been downloaded successfully."
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = () => {
    if (!analysis) return;
    
    const subject = encodeURIComponent(`CLEANBI Report: ${analysis.address}`);
    const body = encodeURIComponent(
      `CLEANBI Location Intelligence Report\n\n` +
      `Address: ${analysis.address}\n` +
      `CLEANBI Score: ${analysis.cleanbiScore}\n` +
      `Grade: ${analysis.grade}\n` +
      `Opportunity Level: ${OPPORTUNITY_LABELS[analysis.opportunityLevel] || analysis.opportunityLevel}\n\n` +
      `Key Metrics:\n` +
      `- Population Density: ${formatNumber(analysis.populationDensity)} per sq mi\n` +
      `- Median Income: ${formatCurrency(analysis.medianIncome)}\n` +
      `- Competitors: ${analysis.competitorCount} within 1 mile\n` +
      `- Traffic Score: ${analysis.trafficScore}\n\n` +
      `Generated by WashBizHub.com - The #1 Platform for Laundromat Intelligence`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!analysis) {
    return null;
  }

  if (!isSubscriber) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-[#C8A661]/40 text-muted-foreground"
        onClick={onUpgradeClick}
        data-testid="button-export-locked"
      >
        <Lock className="w-4 h-4 mr-2" />
        Export Report
        <Crown className="w-3 h-3 ml-1 text-[#C8A661]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isGenerating}
          data-testid="button-export-report"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={generatePDF}
          disabled={isGenerating}
          data-testid="menu-item-download-pdf"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleEmailReport}
          data-testid="menu-item-email-report"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
