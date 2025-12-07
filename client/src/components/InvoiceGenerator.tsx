import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Mail, 
  Plus, 
  Trash2, 
  DollarSign,
  Clock,
  Wrench,
  User,
  Building2
} from "lucide-react";

interface DiagnosticData {
  code: string;
  title: string;
  description: string;
  manufacturer: string;
  machineType: string;
  estimatedRepairTime: number;
  requiredParts: string[];
  partsWithPricing?: { partNumber: string; name: string; estimatedPrice: number }[];
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagnosticData: DiagnosticData;
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${randomNum}`;
}

export function InvoiceGenerator({ open, onOpenChange, diagnosticData }: InvoiceGeneratorProps) {
  const { toast } = useToast();
  
  const [invoiceType, setInvoiceType] = useState<"invoice" | "quote">("invoice");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  const [hourlyRate, setHourlyRate] = useState(75);
  const [taxRate, setTaxRate] = useState(8);
  const [notes, setNotes] = useState("");
  
  const [laborItems, setLaborItems] = useState<LineItem[]>([]);
  const [partsItems, setPartsItems] = useState<LineItem[]>([]);
  
  // Track if modal was previously open to detect open transition
  const prevOpenRef = useRef(false);
  const prevDiagnosticCodeRef = useRef<string | null>(null);

  // Initialize ONLY when modal opens (transition from closed to open) or when diagnostic data changes
  useEffect(() => {
    const modalJustOpened = open && !prevOpenRef.current;
    const diagnosticCodeChanged = diagnosticData?.code !== prevDiagnosticCodeRef.current;
    
    if (open && (modalJustOpened || diagnosticCodeChanged)) {
      setInvoiceNumber(generateInvoiceNumber());
      
      const laborHours = diagnosticData.estimatedRepairTime / 60;
      setLaborItems([{
        id: crypto.randomUUID(),
        description: `Service/Repair: ${diagnosticData.code} - ${diagnosticData.title}`,
        quantity: Math.max(1, Math.round(laborHours * 10) / 10),
        unitPrice: hourlyRate
      }]);
      
      if (diagnosticData.partsWithPricing && diagnosticData.partsWithPricing.length > 0) {
        setPartsItems(diagnosticData.partsWithPricing.map(part => ({
          id: crypto.randomUUID(),
          description: `${part.name} (${part.partNumber})`,
          quantity: 1,
          unitPrice: part.estimatedPrice
        })));
      } else if (diagnosticData.requiredParts && diagnosticData.requiredParts.length > 0) {
        setPartsItems(diagnosticData.requiredParts.map(part => ({
          id: crypto.randomUUID(),
          description: part,
          quantity: 1,
          unitPrice: 0
        })));
      } else {
        setPartsItems([]);
      }
    }
    
    prevOpenRef.current = open;
    if (diagnosticData?.code) {
      prevDiagnosticCodeRef.current = diagnosticData.code;
    }
  }, [open, diagnosticData?.code]); // Only depend on the CODE string, not the whole object
  
  // Separate effect to update labor unitPrice when hourlyRate changes (without destroying arrays)
  useEffect(() => {
    setLaborItems(prevItems => {
      if (prevItems.length === 0) return prevItems;
      return prevItems.map(item => ({
        ...item,
        unitPrice: hourlyRate
      }));
    });
  }, [hourlyRate]);

  const addLaborItem = () => {
    setLaborItems([...laborItems, {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: hourlyRate
    }]);
  };

  const addPartsItem = () => {
    setPartsItems([...partsItems, {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: 0
    }]);
  };

  const updateLaborItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLaborItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updatePartsItem = (id: string, field: keyof LineItem, value: string | number) => {
    setPartsItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLaborItem = (id: string) => {
    setLaborItems(items => items.filter(item => item.id !== id));
  };

  const removePartsItem = (id: string) => {
    setPartsItems(items => items.filter(item => item.id !== id));
  };

  const laborSubtotal = laborItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const partsSubtotal = partsItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const subtotal = laborSubtotal + partsSubtotal;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    const headerText = invoiceType === "invoice" ? "SERVICE INVOICE" : "SERVICE QUOTE";
    doc.text(headerText, pageWidth / 2, yPos, { align: "center" });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("WashBizHub Service", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 20;
    doc.setFontSize(10);
    doc.text(`${invoiceType === "invoice" ? "Invoice" : "Quote"} #: ${invoiceNumber}`, leftMargin, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, rightMargin, yPos, { align: "right" });
    
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", leftMargin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    
    if (customerName) {
      doc.text(customerName, leftMargin, yPos);
      yPos += 5;
    }
    if (customerAddress) {
      const addressLines = customerAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }
    if (customerPhone) {
      doc.text(`Phone: ${customerPhone}`, leftMargin, yPos);
      yPos += 5;
    }
    if (customerEmail) {
      doc.text(`Email: ${customerEmail}`, leftMargin, yPos);
      yPos += 5;
    }
    
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("SERVICE DETAILS:", leftMargin, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Error Code: ${diagnosticData.code}`, leftMargin, yPos);
    yPos += 5;
    doc.text(`Description: ${diagnosticData.title}`, leftMargin, yPos);
    yPos += 5;
    if (diagnosticData.manufacturer) {
      doc.text(`Equipment: ${diagnosticData.manufacturer} ${diagnosticData.machineType}`, leftMargin, yPos);
      yPos += 5;
    }
    
    yPos += 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(leftMargin, yPos - 5, pageWidth - 40, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", leftMargin + 2, yPos);
    doc.text("Qty", rightMargin - 60, yPos, { align: "right" });
    doc.text("Rate", rightMargin - 30, yPos, { align: "right" });
    doc.text("Amount", rightMargin, yPos, { align: "right" });
    
    yPos += 10;
    doc.setFont("helvetica", "normal");
    
    if (laborItems.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Labor:", leftMargin, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 6;
      
      laborItems.forEach(item => {
        const descText = item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '');
        doc.text(descText, leftMargin + 2, yPos);
        doc.text(item.quantity.toString(), rightMargin - 60, yPos, { align: "right" });
        doc.text(`$${item.unitPrice.toFixed(2)}/hr`, rightMargin - 30, yPos, { align: "right" });
        doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, rightMargin, yPos, { align: "right" });
        yPos += 6;
      });
    }
    
    if (partsItems.length > 0 && partsItems.some(p => p.unitPrice > 0)) {
      yPos += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Parts:", leftMargin, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 6;
      
      partsItems.filter(p => p.unitPrice > 0 || p.description).forEach(item => {
        const descText = item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '');
        doc.text(descText, leftMargin + 2, yPos);
        doc.text(item.quantity.toString(), rightMargin - 60, yPos, { align: "right" });
        doc.text(`$${item.unitPrice.toFixed(2)}`, rightMargin - 30, yPos, { align: "right" });
        doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, rightMargin, yPos, { align: "right" });
        yPos += 6;
      });
    }
    
    yPos += 10;
    doc.line(rightMargin - 60, yPos - 3, rightMargin, yPos - 3);
    
    doc.text("Subtotal:", rightMargin - 60, yPos, { align: "left" });
    doc.text(`$${subtotal.toFixed(2)}`, rightMargin, yPos, { align: "right" });
    yPos += 6;
    
    doc.text(`Tax (${taxRate}%):`, rightMargin - 60, yPos, { align: "left" });
    doc.text(`$${taxAmount.toFixed(2)}`, rightMargin, yPos, { align: "right" });
    yPos += 6;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", rightMargin - 60, yPos, { align: "left" });
    doc.text(`$${total.toFixed(2)}`, rightMargin, yPos, { align: "right" });
    
    yPos += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    if (notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", leftMargin, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      const noteLines = doc.splitTextToSize(notes, pageWidth - 40);
      doc.text(noteLines, leftMargin, yPos);
      yPos += noteLines.length * 5 + 10;
    }
    
    doc.setFont("helvetica", "italic");
    doc.text(invoiceType === "invoice" ? "Payment due within 30 days." : "Quote valid for 30 days.", leftMargin, yPos);
    yPos += 5;
    doc.text("Thank you for your business!", leftMargin, yPos);
    
    const filename = `${invoiceType === "invoice" ? "Invoice" : "Quote"}_${invoiceNumber}.pdf`;
    doc.save(filename);
    
    toast({
      title: "PDF Generated",
      description: `${filename} has been downloaded.`
    });
  };

  const handleDownloadPdf = () => {
    if (subtotal === 0) {
      toast({
        title: "Cannot generate invoice",
        description: "Invoice total is $0. Please add or adjust line items before downloading.",
        variant: "destructive"
      });
      return;
    }
    generatePDF();
  };

  const handleEmailInvoice = () => {
    toast({
      title: "Coming Soon",
      description: "Email integration will be available in a future update."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-invoice-generator">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate {invoiceType === "invoice" ? "Invoice" : "Quote"}
          </DialogTitle>
          <DialogDescription>
            Create a professional {invoiceType} for error code {diagnosticData.code} repair service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Document Type</Label>
              <Select value={invoiceType} onValueChange={(v: "invoice" | "quote") => setInvoiceType(v)}>
                <SelectTrigger data-testid="select-invoice-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label>{invoiceType === "invoice" ? "Invoice" : "Quote"} Number</Label>
              <Input 
                value={invoiceNumber} 
                onChange={(e) => setInvoiceNumber(e.target.value)}
                data-testid="input-invoice-number"
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">Customer Information</span>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer-name">Name</Label>
                  <Input 
                    id="customer-name"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input 
                    id="customer-email"
                    type="email"
                    placeholder="customer@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    data-testid="input-customer-email"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Phone</Label>
                  <Input 
                    id="customer-phone"
                    placeholder="(555) 123-4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    data-testid="input-customer-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-address">Address</Label>
                  <Input 
                    id="customer-address"
                    placeholder="123 Main St, City, State"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    data-testid="input-customer-address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">Service Details</span>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                <div><span className="font-medium">Error Code:</span> {diagnosticData.code}</div>
                <div><span className="font-medium">Description:</span> {diagnosticData.title}</div>
                {diagnosticData.manufacturer && (
                  <div><span className="font-medium">Equipment:</span> {diagnosticData.manufacturer} {diagnosticData.machineType}</div>
                )}
                <div><span className="font-medium">Est. Repair Time:</span> {diagnosticData.estimatedRepairTime} minutes</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Labor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Hourly Rate:</Label>
                  <div className="relative w-24">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input 
                      type="number"
                      className="pl-6"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      data-testid="input-hourly-rate"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {laborItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input 
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLaborItem(item.id, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Input 
                      type="number"
                      placeholder="Hrs"
                      value={item.quantity}
                      onChange={(e) => updateLaborItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-20"
                      step="0.5"
                    />
                    <Input 
                      type="number"
                      placeholder="Rate"
                      value={item.unitPrice}
                      onChange={(e) => updateLaborItem(item.id, 'unitPrice', Number(e.target.value))}
                      className="w-24"
                    />
                    <div className="w-24 text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeLaborItem(item.id)}
                      disabled={laborItems.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLaborItem} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Labor Item
                </Button>
              </div>
              
              <div className="text-right mt-3 text-sm">
                <span className="text-muted-foreground">Labor Subtotal:</span>{" "}
                <span className="font-semibold">${laborSubtotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Parts</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {partsItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No parts added</p>
                ) : (
                  partsItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input 
                        placeholder="Part description"
                        value={item.description}
                        onChange={(e) => updatePartsItem(item.id, 'description', e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updatePartsItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-20"
                      />
                      <div className="relative w-24">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input 
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => updatePartsItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="pl-6"
                        />
                      </div>
                      <div className="w-24 text-right font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => removePartsItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))
                )}
                <Button variant="outline" size="sm" onClick={addPartsItem} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Part
                </Button>
              </div>
              
              <div className="text-right mt-3 text-sm">
                <span className="text-muted-foreground">Parts Subtotal:</span>{" "}
                <span className="font-semibold">${partsSubtotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <Label>Technician Notes</Label>
                  <Textarea 
                    placeholder="Additional notes for the customer..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label className="whitespace-nowrap">Tax Rate (%):</Label>
                  <Input 
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-24"
                    step="0.5"
                    data-testid="input-tax-rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleDownloadPdf} 
              className="flex-1 bg-[#0A1628] hover:bg-[#1a3a5c]"
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEmailInvoice}
              className="flex-1"
              data-testid="button-email-invoice"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email {invoiceType === "invoice" ? "Invoice" : "Quote"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
