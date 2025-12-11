import { useState, useRef, useEffect } from "react";
import QRCodeStyling, { 
  DotType, 
  CornerSquareType, 
  CornerDotType,
  GradientType 
} from "qr-code-styling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Download, QrCode, Upload, Palette, Settings, Sparkles,
  Gift, CreditCard, MapPin, Smartphone, Star, Zap, Image as ImageIcon,
  RotateCcw, Copy, Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOT_STYLES: { value: DotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
];

const CORNER_SQUARE_STYLES: { value: CornerSquareType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_DOT_STYLES: { value: CornerDotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
];

const LAUNDROMAT_TEMPLATES = [
  {
    id: "loyalty",
    name: "Loyalty Card",
    icon: CreditCard,
    description: "Customer rewards program",
    prefix: "LOYALTY:",
    colors: { dots: "#0A1628", corners: "#C8A661", background: "#FFFFFF" },
    dotType: "rounded" as DotType,
  },
  {
    id: "promo",
    name: "Promotion",
    icon: Gift,
    description: "Discounts & special offers",
    prefix: "PROMO:",
    colors: { dots: "#DC2626", corners: "#B91C1C", background: "#FEF2F2" },
    dotType: "dots" as DotType,
  },
  {
    id: "machine",
    name: "Machine Status",
    icon: Zap,
    description: "Link to machine info/payment",
    prefix: "MACHINE:",
    colors: { dots: "#2563EB", corners: "#1D4ED8", background: "#EFF6FF" },
    dotType: "classy" as DotType,
  },
  {
    id: "location",
    name: "Location/Maps",
    icon: MapPin,
    description: "Directions to your store",
    prefix: "",
    colors: { dots: "#16A34A", corners: "#15803D", background: "#F0FDF4" },
    dotType: "extra-rounded" as DotType,
  },
  {
    id: "contact",
    name: "Business Contact",
    icon: Smartphone,
    description: "vCard with your info",
    prefix: "",
    colors: { dots: "#7C3AED", corners: "#6D28D9", background: "#F5F3FF" },
    dotType: "classy-rounded" as DotType,
  },
  {
    id: "review",
    name: "Leave a Review",
    icon: Star,
    description: "Google/Yelp review link",
    prefix: "",
    colors: { dots: "#EA580C", corners: "#C2410C", background: "#FFF7ED" },
    dotType: "rounded" as DotType,
  },
];

const PRESET_COLORS = [
  { name: "WashBizHub Navy", value: "#0A1628" },
  { name: "WashBizHub Gold", value: "#C8A661" },
  { name: "Classic Black", value: "#000000" },
  { name: "Ocean Blue", value: "#0077B6" },
  { name: "Forest Green", value: "#2D6A4F" },
  { name: "Royal Purple", value: "#7209B7" },
  { name: "Sunset Orange", value: "#F77F00" },
  { name: "Ruby Red", value: "#D90429" },
];

interface AdvancedQRGeneratorProps {
  defaultValue?: string;
  onGenerate?: (dataUrl: string) => void;
}

export function AdvancedQRGenerator({ defaultValue = "", onGenerate }: AdvancedQRGeneratorProps) {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content
  const [content, setContent] = useState(defaultValue || "https://washbizhub.com");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Styling
  const [size, setSize] = useState(300);
  const [dotColor, setDotColor] = useState("#0A1628");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [cornerSquareColor, setCornerSquareColor] = useState("#C8A661");
  const [cornerDotColor, setCornerDotColor] = useState("#C8A661");
  const [dotType, setDotType] = useState<DotType>("rounded");
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");

  // Image
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.4);
  const [logoMargin, setLogoMargin] = useState(5);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);

  // Gradient
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor1, setGradientColor1] = useState("#0A1628");
  const [gradientColor2, setGradientColor2] = useState("#C8A661");
  const [gradientType, setGradientType] = useState<GradientType>("linear");

  // Initialize QR Code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: content,
      dotsOptions: {
        color: dotColor,
        type: dotType,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        color: cornerSquareColor,
        type: cornerSquareType,
      },
      cornersDotOptions: {
        color: cornerDotColor,
        type: cornerDotType,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: logoMargin,
        hideBackgroundDots: hideBackgroundDots,
        imageSize: logoSize,
      },
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCodeRef.current.append(qrRef.current);
    }
  }, []);

  // Update QR Code when options change
  useEffect(() => {
    if (qrCodeRef.current) {
      const dotsOptions: any = {
        type: dotType,
      };

      if (useGradient) {
        dotsOptions.gradient = {
          type: gradientType,
          rotation: 0,
          colorStops: [
            { offset: 0, color: gradientColor1 },
            { offset: 1, color: gradientColor2 },
          ],
        };
      } else {
        dotsOptions.color = dotColor;
      }

      qrCodeRef.current.update({
        width: size,
        height: size,
        data: content,
        image: logoImage || undefined,
        dotsOptions,
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          color: cornerSquareColor,
          type: cornerSquareType,
        },
        cornersDotOptions: {
          color: cornerDotColor,
          type: cornerDotType,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: logoMargin,
          hideBackgroundDots: hideBackgroundDots,
          imageSize: logoSize,
        },
      });
    }
  }, [
    content, size, dotColor, backgroundColor, cornerSquareColor, cornerDotColor,
    dotType, cornerSquareType, cornerDotType, logoImage, logoSize, logoMargin,
    hideBackgroundDots, useGradient, gradientColor1, gradientColor2, gradientType
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
        toast({
          title: "Image Uploaded",
          description: "Your logo has been added to the QR code.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = LAUNDROMAT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setDotColor(template.colors.dots);
      setCornerSquareColor(template.colors.corners);
      setCornerDotColor(template.colors.corners);
      setBackgroundColor(template.colors.background);
      setDotType(template.dotType);
      if (template.prefix && !content.startsWith(template.prefix)) {
        setContent(template.prefix + content);
      }
      toast({
        title: `${template.name} Template Applied`,
        description: "Colors and style updated for this template.",
      });
    }
  };

  const downloadQR = async (format: "png" | "svg" | "jpeg") => {
    if (qrCodeRef.current) {
      await qrCodeRef.current.download({
        name: `washbizhub-qr-${Date.now()}`,
        extension: format,
      });
      toast({
        title: "Downloaded!",
        description: `QR code saved as ${format.toUpperCase()}.`,
      });
    }
  };

  const copyToClipboard = async () => {
    if (qrCodeRef.current) {
      const blob = await qrCodeRef.current.getRawData("png");
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast({
          title: "Copied!",
          description: "QR code copied to clipboard.",
        });
      }
    }
  };

  const resetToDefaults = () => {
    setContent("https://washbizhub.com");
    setSelectedTemplate(null);
    setDotColor("#0A1628");
    setBackgroundColor("#FFFFFF");
    setCornerSquareColor("#C8A661");
    setCornerDotColor("#C8A661");
    setDotType("rounded");
    setCornerSquareType("extra-rounded");
    setCornerDotType("dot");
    setLogoImage(null);
    setLogoSize(0.4);
    setLogoMargin(5);
    setUseGradient(false);
    toast({
      title: "Reset Complete",
      description: "All settings restored to defaults.",
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel - Controls */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C8A661]" />
              Advanced QR Generator
            </CardTitle>
            <CardDescription>
              Create stunning QR codes with custom designs, colors, and embedded images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                <TabsTrigger value="style" data-testid="tab-style">Style</TabsTrigger>
                <TabsTrigger value="image" data-testid="tab-image">Image</TabsTrigger>
                <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>QR Code Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter URL, text, or data..."
                    className="min-h-[100px]"
                    data-testid="input-qr-content"
                  />
                  <p className="text-xs text-muted-foreground">
                    URLs, text, vCards, WiFi credentials, or any data you want to encode
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Size: {size}px</Label>
                  <Slider
                    value={[size]}
                    onValueChange={(v) => setSize(v[0])}
                    min={100}
                    max={500}
                    step={10}
                    data-testid="slider-size"
                  />
                </div>
              </TabsContent>

              {/* Style Tab */}
              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dot Style</Label>
                    <Select value={dotType} onValueChange={(v) => setDotType(v as DotType)}>
                      <SelectTrigger data-testid="select-dot-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOT_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Corner Style</Label>
                    <Select value={cornerSquareType} onValueChange={(v) => setCornerSquareType(v as CornerSquareType)}>
                      <SelectTrigger data-testid="select-corner-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CORNER_SQUARE_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dot Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                        data-testid="input-dot-color"
                      />
                      <Input
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                        data-testid="input-bg-color"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Corner Square Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={cornerSquareColor}
                        onChange={(e) => setCornerSquareColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={cornerSquareColor}
                        onChange={(e) => setCornerSquareColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Corner Dot Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={cornerDotColor}
                        onChange={(e) => setCornerDotColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={cornerDotColor}
                        onChange={(e) => setCornerDotColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Gradient Toggle */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Use Gradient</Label>
                      <p className="text-xs text-muted-foreground">Apply gradient to dots</p>
                    </div>
                    <Switch
                      checked={useGradient}
                      onCheckedChange={setUseGradient}
                      data-testid="switch-gradient"
                    />
                  </div>
                  {useGradient && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Color 1</Label>
                        <Input
                          type="color"
                          value={gradientColor1}
                          onChange={(e) => setGradientColor1(e.target.value)}
                          className="w-full h-10 p-1 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color 2</Label>
                        <Input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="w-full h-10 p-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset Colors */}
                <div className="space-y-2">
                  <Label>Preset Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setDotColor(color.value)}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        data-testid={`preset-color-${color.name.toLowerCase().replace(/\s/g, '-')}`}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Image Tab */}
              <TabsContent value="image" className="space-y-4 mt-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-image-upload"
                  />
                  {logoImage ? (
                    <div className="space-y-4">
                      <img
                        src={logoImage}
                        alt="Logo preview"
                        className="w-24 h-24 mx-auto object-contain rounded-lg border"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoImage(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Upload Logo or Image</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, or SVG. Will be centered in QR code.
                      </p>
                    </div>
                  )}
                </div>

                {logoImage && (
                  <>
                    <div className="space-y-2">
                      <Label>Logo Size: {Math.round(logoSize * 100)}%</Label>
                      <Slider
                        value={[logoSize]}
                        onValueChange={(v) => setLogoSize(v[0])}
                        min={0.1}
                        max={0.5}
                        step={0.05}
                        data-testid="slider-logo-size"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo Margin: {logoMargin}px</Label>
                      <Slider
                        value={[logoMargin]}
                        onValueChange={(v) => setLogoMargin(v[0])}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Hide Background Dots</Label>
                        <p className="text-xs text-muted-foreground">Clear area behind logo</p>
                      </div>
                      <Switch
                        checked={hideBackgroundDots}
                        onCheckedChange={setHideBackgroundDots}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Quick-start templates optimized for laundromat marketing
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {LAUNDROMAT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`template-${template.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <template.icon className="w-4 h-4" style={{ color: template.colors.dots }} />
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      <div className="flex gap-1 mt-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: template.colors.dots }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: template.colors.corners }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: template.colors.background }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Preview */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Preview
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
              <div
                ref={qrRef}
                className="bg-white p-4 rounded-lg shadow-lg"
                data-testid="qr-preview"
              />
            </div>

            {/* Download Options */}
            <div className="mt-6 space-y-4">
              <Label>Download As</Label>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => downloadQR("png")} data-testid="btn-download-png">
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button variant="outline" onClick={() => downloadQR("svg")} data-testid="btn-download-svg">
                  <Download className="w-4 h-4 mr-2" />
                  SVG
                </Button>
                <Button variant="outline" onClick={() => downloadQR("jpeg")} data-testid="btn-download-jpeg">
                  <Download className="w-4 h-4 mr-2" />
                  JPEG
                </Button>
                <Button variant="outline" onClick={copyToClipboard} data-testid="btn-copy-qr">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C8A661]" />
                Pro Tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use high-contrast colors for better scanning</li>
                <li>• Keep logos under 30% of QR size for reliability</li>
                <li>• Test scan before printing at final size</li>
                <li>• SVG format is best for print materials</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdvancedQRGenerator;
