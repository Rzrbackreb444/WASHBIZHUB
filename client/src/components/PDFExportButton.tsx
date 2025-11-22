import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import logoUrl from "@assets/Untitled design (24)_1763778677287.png";

interface PDFExportButtonProps {
  contentRef: React.RefObject<HTMLElement>;
  fileName?: string;
  title?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PDFExportButton({
  contentRef,
  fileName = "WashBizHub_Export",
  title = "Export PDF",
  variant = "outline",
  size = "default",
  className = ""
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      const logo = new Image();
      logo.src = logoUrl;
      
      await new Promise((resolve) => {
        logo.onload = resolve;
      });

      const logoWidth = 40;
      const logoHeight = 40;
      const logoX = pageWidth - logoWidth - margin;
      const logoY = margin;

      pdf.addImage(
        logo,
        "PNG",
        logoX,
        logoY,
        logoWidth,
        logoHeight,
        undefined,
        "NONE"
      );

      const watermarkOpacity = 0.1;
      pdf.saveGraphicsState();
      pdf.setGState({ opacity: watermarkOpacity } as any);
      const watermarkSize = 60;
      const watermarkX = (pageWidth - watermarkSize) / 2;
      const watermarkY = (pageHeight - watermarkSize) / 2;
      pdf.addImage(
        logo,
        "PNG",
        watermarkX,
        watermarkY,
        watermarkSize,
        watermarkSize,
        undefined,
        "NONE"
      );
      pdf.restoreGraphicsState();

      const content = contentRef.current.cloneNode(true) as HTMLElement;
      
      const elementsToHide = content.querySelectorAll(
        'button, [data-pdf-exclude="true"]'
      );
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const contentY = logoY + logoHeight + 10;
      const availableHeight = pageHeight - contentY - margin;

      if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, "PNG", margin, contentY, imgWidth, imgHeight);
      } else {
        let currentY = contentY;
        let remainingHeight = imgHeight;
        let sourceY = 0;

        while (remainingHeight > 0) {
          const sliceHeight = Math.min(availableHeight, remainingHeight);
          const sourceHeight = (sliceHeight / imgWidth) * canvas.width;

          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sourceHeight;
          const sliceCtx = sliceCanvas.getContext("2d");

          if (sliceCtx) {
            sliceCtx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              canvas.width,
              sourceHeight
            );

            const sliceData = sliceCanvas.toDataURL("image/png");
            pdf.addImage(sliceData, "PNG", margin, currentY, imgWidth, sliceHeight);
          }

          remainingHeight -= sliceHeight;
          sourceY += sourceHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
            currentY = margin;
            
            pdf.saveGraphicsState();
            pdf.setGState({ opacity: watermarkOpacity } as any);
            pdf.addImage(
              logo,
              "PNG",
              watermarkX,
              watermarkY,
              watermarkSize,
              watermarkSize,
              undefined,
              "NONE"
            );
            pdf.restoreGraphicsState();
          }
        }
      }

      const timestamp = new Date().toISOString().split("T")[0];
      pdf.save(`${fileName}_${timestamp}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
      data-testid="button-export-pdf"
      data-pdf-exclude="true"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          {title}
        </>
      )}
    </Button>
  );
}

async function html2canvas(
  element: HTMLElement,
  options: any
): Promise<HTMLCanvasElement> {
  const html2canvasModule = await import("html2canvas");
  return html2canvasModule.default(element, options);
}
