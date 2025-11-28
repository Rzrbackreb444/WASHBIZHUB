import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Building2, CheckCircle, DollarSign, Clock, Shield, Send, Loader2, Phone, Mail } from "lucide-react";

export default function GoKapital() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    propertyAddress: "",
    propertyType: "",
    transactionType: "",
    purchasePrice: "",
    downPayment: "",
    estimatedValue: "",
    amountOwed: "",
    closingEntity: "",
    liquidAssets: "",
    propertiesOwned: "",
    creditScore: "",
    generatingIncome: "",
    rateTermExpectations: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyAddress || !formData.contactEmail || !formData.contactName) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/gokapital-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Submission failed");

      setSubmitted(true);
      toast({ title: "Application submitted successfully!", description: "We'll be in touch within 24-48 hours." });
    } catch (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SEO
          title="Application Submitted | GoKapital Real Estate Financing"
          description="Your GoKapital financing application has been submitted successfully."
          canonicalUrl="/gokapital"
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Application Received!</h2>
              <p className="text-muted-foreground mb-6">
                Your real estate financing inquiry has been submitted to GoKapital. 
                A specialist will contact you within 24-48 business hours.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
                <p><strong>Property:</strong> {formData.propertyAddress}</p>
                <p><strong>Contact:</strong> {formData.contactName}</p>
                <p><strong>Email:</strong> {formData.contactEmail}</p>
              </div>
              <Button className="mt-6" onClick={() => window.location.href = "/"}>
                Return to WashBizHub
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="GoKapital Real Estate Financing | Commercial Property Loans for Laundromats"
        description="Apply for commercial real estate financing through GoKapital. Purchase or refinance laundromat properties. Competitive rates, fast approval, expert guidance."
        canonicalUrl="/gokapital"
        keywords={["gokapital", "commercial real estate financing", "laundromat property loan", "commercial mortgage", "investment property financing"]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white py-12 sm:py-16 border-b border-teal-400/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-teal-400 flex-shrink-0" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-bebas">GoKapital Real Estate Financing</h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 mb-6">
              Commercial property financing for laundromat purchases, refinances, and investments. 
              Fast approvals. Competitive rates. Expert guidance.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Badge className="bg-teal-400/20 text-teal-400 border-teal-400/30">
                <DollarSign className="w-3 h-3 mr-1" />
                $100K - $50M+
              </Badge>
              <Badge className="bg-teal-400/20 text-teal-400 border-teal-400/30">
                <Clock className="w-3 h-3 mr-1" />
                7-14 Day Approval
              </Badge>
              <Badge className="bg-teal-400/20 text-teal-400 border-teal-400/30">
                <Shield className="w-3 h-3 mr-1" />
                Up to 75% LTV
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Real Estate Financing Application</CardTitle>
                  <CardDescription>Complete this questionnaire for a personalized financing review</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="propertyAddress" className="text-sm font-medium">
                          1. Property Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="propertyAddress"
                          placeholder="Full property address"
                          value={formData.propertyAddress}
                          onChange={(e) => handleChange("propertyAddress", e.target.value)}
                          className="mt-1"
                          data-testid="input-property-address"
                        />
                      </div>

                      <div>
                        <Label htmlFor="propertyType" className="text-sm font-medium">
                          2. Property Type
                        </Label>
                        <Select value={formData.propertyType} onValueChange={(v) => handleChange("propertyType", v)}>
                          <SelectTrigger className="mt-1" data-testid="select-property-type">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="laundromat">Laundromat/Coin Laundry</SelectItem>
                            <SelectItem value="retail">Retail/Strip Center</SelectItem>
                            <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                            <SelectItem value="industrial">Industrial/Warehouse</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="multi-family">Multi-Family</SelectItem>
                            <SelectItem value="other">Other Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">3. Transaction Type</Label>
                        <Select value={formData.transactionType} onValueChange={(v) => handleChange("transactionType", v)}>
                          <SelectTrigger className="mt-1" data-testid="select-transaction-type">
                            <SelectValue placeholder="Purchase or Refinance?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purchase">Purchase</SelectItem>
                            <SelectItem value="refinance">Refinance</SelectItem>
                            <SelectItem value="cash-out">Cash-Out Refinance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.transactionType === "purchase" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Purchase Price</Label>
                            <Input
                              placeholder="$0"
                              value={formData.purchasePrice}
                              onChange={(e) => handleChange("purchasePrice", e.target.value)}
                              className="mt-1"
                              data-testid="input-purchase-price"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Down Payment Available</Label>
                            <Input
                              placeholder="$0"
                              value={formData.downPayment}
                              onChange={(e) => handleChange("downPayment", e.target.value)}
                              className="mt-1"
                              data-testid="input-down-payment"
                            />
                          </div>
                        </div>
                      )}

                      {(formData.transactionType === "refinance" || formData.transactionType === "cash-out") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Estimated Property Value</Label>
                            <Input
                              placeholder="$0"
                              value={formData.estimatedValue}
                              onChange={(e) => handleChange("estimatedValue", e.target.value)}
                              className="mt-1"
                              data-testid="input-estimated-value"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Amount Currently Owed</Label>
                            <Input
                              placeholder="$0"
                              value={formData.amountOwed}
                              onChange={(e) => handleChange("amountOwed", e.target.value)}
                              className="mt-1"
                              data-testid="input-amount-owed"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">5. Closing Entity</Label>
                        <Select value={formData.closingEntity} onValueChange={(v) => handleChange("closingEntity", v)}>
                          <SelectTrigger className="mt-1" data-testid="select-closing-entity">
                            <SelectValue placeholder="LLC, Inc, or Personal?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="inc">Corporation (Inc)</SelectItem>
                            <SelectItem value="personal">Personal Name</SelectItem>
                            <SelectItem value="trust">Trust</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="liquidAssets" className="text-sm font-medium">
                          6. Liquid Assets Available
                        </Label>
                        <Input
                          id="liquidAssets"
                          placeholder="$0 (cash, stocks, etc.)"
                          value={formData.liquidAssets}
                          onChange={(e) => handleChange("liquidAssets", e.target.value)}
                          className="mt-1"
                          data-testid="input-liquid-assets"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          7. Investment Properties Owned (Last 36 Months)
                        </Label>
                        <Select value={formData.propertiesOwned} onValueChange={(v) => handleChange("propertiesOwned", v)}>
                          <SelectTrigger className="mt-1" data-testid="select-properties-owned">
                            <SelectValue placeholder="How many?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 - First time investor</SelectItem>
                            <SelectItem value="1-2">1-2 properties</SelectItem>
                            <SelectItem value="3-5">3-5 properties</SelectItem>
                            <SelectItem value="6-10">6-10 properties</SelectItem>
                            <SelectItem value="10+">10+ properties</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">8. Estimated Credit Score</Label>
                        <Select value={formData.creditScore} onValueChange={(v) => handleChange("creditScore", v)}>
                          <SelectTrigger className="mt-1" data-testid="select-credit-score">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="750+">750+ (Excellent)</SelectItem>
                            <SelectItem value="700-749">700-749 (Good)</SelectItem>
                            <SelectItem value="650-699">650-699 (Fair)</SelectItem>
                            <SelectItem value="600-649">600-649 (Below Average)</SelectItem>
                            <SelectItem value="below-600">Below 600</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">9. Is the Property Generating Income?</Label>
                        <Select value={formData.generatingIncome} onValueChange={(v) => handleChange("generatingIncome", v)}>
                          <SelectTrigger className="mt-1" data-testid="select-generating-income">
                            <SelectValue placeholder="Income status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes-operating">Yes - Currently operating</SelectItem>
                            <SelectItem value="yes-leased">Yes - Leased to tenant</SelectItem>
                            <SelectItem value="no-vacant">No - Vacant</SelectItem>
                            <SelectItem value="no-new">No - New acquisition/development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="rateTermExpectations" className="text-sm font-medium">
                          10. Rate & Term Expectations
                        </Label>
                        <Textarea
                          id="rateTermExpectations"
                          placeholder="Describe your ideal loan terms, rate expectations, timeline, or any special requirements..."
                          value={formData.rateTermExpectations}
                          onChange={(e) => handleChange("rateTermExpectations", e.target.value)}
                          className="mt-1 min-h-[80px]"
                          data-testid="textarea-rate-term"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold">Contact Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="contactName" className="text-sm font-medium">
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactName"
                            placeholder="Your full name"
                            value={formData.contactName}
                            onChange={(e) => handleChange("contactName", e.target.value)}
                            className="mt-1"
                            data-testid="input-contact-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail" className="text-sm font-medium">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.contactEmail}
                            onChange={(e) => handleChange("contactEmail", e.target.value)}
                            className="mt-1"
                            data-testid="input-contact-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPhone" className="text-sm font-medium">
                            Phone
                          </Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={formData.contactPhone}
                            onChange={(e) => handleChange("contactPhone", e.target.value)}
                            className="mt-1"
                            data-testid="input-contact-phone"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold text-lg py-6"
                      disabled={isSubmitting}
                      data-testid="button-submit-application"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Submit Financing Application
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree to be contacted regarding financing options. 
                      Your information is secure and will not be shared outside of the financing review process.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Why GoKapital?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Competitive rates starting at 6.5%</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Up to 75% LTV financing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Fast 7-14 day approvals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Loans from $100K to $50M+</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Flexible terms: 5-25 years</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Bridge & permanent financing</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Loan Programs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <strong>Bridge Loans</strong>
                    <p className="text-muted-foreground text-xs">Short-term financing for acquisitions</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <strong>Permanent Loans</strong>
                    <p className="text-muted-foreground text-xs">Long-term fixed rate financing</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <strong>Cash-Out Refinance</strong>
                    <p className="text-muted-foreground text-xs">Extract equity for expansion</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <strong>Construction Loans</strong>
                    <p className="text-muted-foreground text-xs">Ground-up development financing</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-navy-900 text-white border-teal-400/20">
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-gray-300 mb-3">Questions? Contact us directly:</p>
                  <div className="space-y-2 text-sm">
                    <a href="mailto:consult@washbizhub.com" className="flex items-center gap-2 text-teal-400 hover:underline">
                      <Mail className="w-4 h-4" />
                      consult@washbizhub.com
                    </a>
                    <a href="tel:4798834314" className="flex items-center gap-2 text-teal-400 hover:underline">
                      <Phone className="w-4 h-4" />
                      (479) 883-4314
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
