import { useState, useRef, useId, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Copy, QrCode, Gift, CreditCard, MapPin, User, Link, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QRCodeType = "loyalty" | "coupon" | "tracking" | "business" | "custom";

interface QRCodeData {
  type: QRCodeType;
  value: string;
  label?: string;
}

interface QRCodeGeneratorProps {
  defaultType?: QRCodeType;
  defaultValue?: string;
  showTypeSelector?: boolean;
  size?: number;
  onGenerate?: (data: QRCodeData) => void;
}

export function QRCodeGenerator({
  defaultType = "custom",
  defaultValue = "",
  showTypeSelector = true,
  size = 200,
  onGenerate
}: QRCodeGeneratorProps) {
  const [qrType, setQrType] = useState<QRCodeType>(defaultType);
  const [qrValue, setQrValue] = useState(defaultValue);
  const [loyaltyCardNumber, setLoyaltyCardNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    website: ""
  });
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const instanceId = useId();

  const generateQRValue = (): string => {
    switch (qrType) {
      case "loyalty":
        return `WASHBIZHUB:LOYALTY:${loyaltyCardNumber}`;
      case "coupon":
        return `WASHBIZHUB:COUPON:${couponCode}`;
      case "tracking":
        return trackingUrl || "";
      case "business":
        const vCard = `BEGIN:VCARD
VERSION:3.0
N:${businessInfo.name}
FN:${businessInfo.name}
TEL:${businessInfo.phone}
EMAIL:${businessInfo.email}
ADR:;;${businessInfo.address}
URL:${businessInfo.website}
END:VCARD`;
        return vCard;
      case "custom":
      default:
        return qrValue;
    }
  };

  const currentQRValue = generateQRValue();

  useEffect(() => {
    if (currentQRValue && onGenerate) {
      onGenerate({ type: qrType, value: currentQRValue });
    }
  }, [currentQRValue, qrType, onGenerate]);

  const downloadQRCode = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.fillStyle = "#FFFFFF";
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-code-${qrType}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    
    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been saved to your device."
    });
  };

  const copyQRValue = () => {
    navigator.clipboard.writeText(currentQRValue);
    toast({
      title: "Copied!",
      description: "QR code value copied to clipboard."
    });
  };

  const printQRCode = () => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .container { text-align: center; }
              h3 { font-family: Arial, sans-serif; color: #0A1628; }
            </style>
          </head>
          <body>
            <div class="container">
              <h3>WashBizHub QR Code</h3>
              ${svg.outerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="w-full max-w-lg" data-testid="qr-code-generator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#C8A661]" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR codes for loyalty cards, coupons, tracking, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showTypeSelector && (
          <div className="space-y-2">
            <Label>QR Code Type</Label>
            <Select value={qrType} onValueChange={(v) => setQrType(v as QRCodeType)}>
              <SelectTrigger data-testid="select-qr-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loyalty">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Loyalty Card
                  </div>
                </SelectItem>
                <SelectItem value="coupon">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Coupon Code
                  </div>
                </SelectItem>
                <SelectItem value="tracking">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Tracking Link
                  </div>
                </SelectItem>
                <SelectItem value="business">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Business Card (vCard)
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Custom URL/Text
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {qrType === "loyalty" && (
          <div className="space-y-2">
            <Label htmlFor="loyalty-card">Loyalty Card Number</Label>
            <Input
              id="loyalty-card"
              placeholder="Enter customer loyalty card number"
              value={loyaltyCardNumber}
              onChange={(e) => setLoyaltyCardNumber(e.target.value)}
              data-testid="input-loyalty-card"
            />
          </div>
        )}

        {qrType === "coupon" && (
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Coupon Code</Label>
            <Input
              id="coupon-code"
              placeholder="Enter coupon code (e.g., SAVE20)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              data-testid="input-coupon-code"
            />
          </div>
        )}

        {qrType === "tracking" && (
          <div className="space-y-2">
            <Label htmlFor="tracking-url">Tracking URL</Label>
            <Input
              id="tracking-url"
              placeholder="https://washbizhub.com/track/..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              data-testid="input-tracking-url"
            />
          </div>
        )}

        {qrType === "business" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="biz-name">Business Name</Label>
              <Input
                id="biz-name"
                placeholder="Joe's Laundromat"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                data-testid="input-business-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="biz-phone">Phone</Label>
                <Input
                  id="biz-phone"
                  placeholder="(555) 123-4567"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  data-testid="input-business-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biz-email">Email</Label>
                <Input
                  id="biz-email"
                  type="email"
                  placeholder="hello@laundromat.com"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  data-testid="input-business-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-address">Address</Label>
              <Input
                id="biz-address"
                placeholder="123 Main St, City, State 12345"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                data-testid="input-business-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-website">Website</Label>
              <Input
                id="biz-website"
                placeholder="https://mylaundromat.com"
                value={businessInfo.website}
                onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                data-testid="input-business-website"
              />
            </div>
          </div>
        )}

        {qrType === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="custom-value">URL or Text</Label>
            <Input
              id="custom-value"
              placeholder="Enter any URL or text to encode"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              data-testid="input-custom-value"
            />
          </div>
        )}

        {currentQRValue && (
          <div className="flex flex-col items-center space-y-4 pt-4 border-t">
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <QRCodeSVG
                ref={svgRef as any}
                value={currentQRValue}
                size={size}
                level="H"
                includeMargin={true}
                fgColor="#0A1628"
                bgColor="#FFFFFF"
                data-testid={`qr-code-preview-${instanceId}`}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
                data-testid="button-download-qr"
              >
                <Download className="h-4 w-4 mr-1" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyQRValue}
                data-testid="button-copy-qr"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Value
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printQRCode}
                data-testid="button-print-qr"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QuickQRDialog({ 
  type, 
  value, 
  label,
  trigger 
}: { 
  type: QRCodeType; 
  value: string; 
  label?: string;
  trigger?: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" data-testid="button-quick-qr">
            <QrCode className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#C8A661]" />
            {label || "QR Code"}
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with any smartphone camera
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <QRCodeGenerator 
            defaultType={type} 
            defaultValue={value} 
            showTypeSelector={false}
            size={250}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LoyaltyCardQR({ cardNumber }: { cardNumber: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-[#0A1628] to-[#1a2d4a] rounded-lg text-white">
      <div className="text-sm font-medium mb-2">WashBizHub Loyalty Card</div>
      <div className="p-3 bg-white rounded-lg">
        <QRCodeSVG
          value={`WASHBIZHUB:LOYALTY:${cardNumber}`}
          size={150}
          level="H"
          includeMargin={false}
          fgColor="#0A1628"
          bgColor="#FFFFFF"
          data-testid="loyalty-card-qr"
        />
      </div>
      <div className="mt-2 text-xs text-[#C8A661] font-mono">{cardNumber}</div>
    </div>
  );
}

export function CouponQR({ code, discount }: { code: string; discount: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-[#C8A661] to-[#a08551] rounded-lg text-white">
      <div className="text-lg font-bold mb-1">{discount}</div>
      <div className="text-xs mb-2">Use code: {code}</div>
      <div className="p-3 bg-white rounded-lg">
        <QRCodeSVG
          value={`WASHBIZHUB:COUPON:${code}`}
          size={120}
          level="H"
          includeMargin={false}
          fgColor="#0A1628"
          bgColor="#FFFFFF"
          data-testid="coupon-qr"
        />
      </div>
      <div className="mt-2 text-xs">Scan to redeem</div>
    </div>
  );
}
