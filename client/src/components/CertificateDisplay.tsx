import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Certificate {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  verificationUrl: string;
  finalScore?: number;
}

interface CertificateDisplayProps {
  certificate: Certificate;
}

export function CertificateDisplay({ certificate }: CertificateDisplayProps) {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    const element = document.getElementById("certificate");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save(`${certificate.studentName}-certificate.pdf`);

    toast({
      title: "Downloaded",
      description: "Certificate saved to downloads",
    });
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(certificate.verificationUrl);
    toast({
      title: "Copied",
      description: "Verification link copied to clipboard",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Certificate Display */}
      <div
        id="certificate"
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-12 rounded-lg text-center space-y-4"
      >
        <div className="flex justify-center mb-6">
          <Award className="w-16 h-16 text-amber-600" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Certificate of Completion
          </p>
          <h1 className="text-4xl font-bold text-foreground">
            {certificate.courseTitle}
          </h1>
        </div>

        <div className="space-y-2 py-8">
          <p className="text-sm text-muted-foreground">This certifies that</p>
          <p className="text-3xl font-bold text-foreground">
            {certificate.studentName}
          </p>
          <p className="text-sm text-muted-foreground">
            has successfully completed the course
          </p>
        </div>

        <div className="border-t border-foreground/20 pt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Completed on {new Date(certificate.completionDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Certificate #{certificate.certificateNumber}
          </p>
        </div>

        {certificate.finalScore && (
          <div className="mt-4 pt-4 border-t border-foreground/20">
            <p className="text-sm">
              Final Score: <span className="font-bold text-lg">{certificate.finalScore}%</span>
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={handleDownloadPDF} className="gap-2" data-testid="button-download-cert">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="gap-2"
          data-testid="button-share-cert"
        >
          <Share2 className="w-4 h-4" />
          Share Certificate
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(certificate.certificateNumber);
            toast({
              title: "Copied",
              description: "Certificate number copied",
            });
          }}
          className="gap-2"
          data-testid="button-copy-cert-number"
        >
          <Copy className="w-4 h-4" />
          Copy Number
        </Button>
      </div>

      {/* Verification Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verify This Certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Anyone can verify this certificate at:
          </p>
          <div className="flex gap-2 bg-muted p-3 rounded text-sm break-all">
            <code>{certificate.verificationUrl}</code>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Certificate Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Student Name</p>
            <p className="font-semibold">{certificate.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course</p>
            <p className="font-semibold">{certificate.courseTitle}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Date</p>
            <p className="font-semibold">
              {new Date(certificate.completionDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Certificate Number</p>
            <p className="font-semibold text-xs font-mono">{certificate.certificateNumber}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
