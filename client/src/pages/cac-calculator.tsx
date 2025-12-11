import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WASHBIZHUB_SEO_DEFAULTS } from "@/lib/design-system";
import { 
  UserPlus, TrendingUp, DollarSign, Target, Megaphone,
  BarChart3, PieChart, Sparkles, AlertTriangle, CheckCircle, Info
} from "lucide-react";

const cacCalculatorConfig: PremiumCalculatorConfig = {
  id: "customer-acquisition-cost-calculator",
  name: "Customer Acquisition Cost (CAC) Calculator",
  description: "Calculate the true cost of acquiring new customers for your laundromat. Industry target: $5-15 per customer. Compare across marketing channels.",
  category: "Customer Intelligence",
  inputs: [
    {
      name: "monthlyMarketingBudget",
      label: "Monthly Marketing Budget",
      type: "slider",
      defaultValue: 1000,
      min: 100,
      max: 10000,
      step: 100,
      prefix: "$",
      tooltip: "Total monthly spend on all marketing and advertising efforts.",
    },
    {
      name: "socialMediaSpend",
      label: "Social Media Ads",
      type: "slider",
      defaultValue: 300,
      min: 0,
      max: 5000,
      step: 50,
      prefix: "$",
      tooltip: "Monthly spend on Facebook, Instagram, TikTok, and other social media advertising.",
    },
    {
      name: "googleAdsSpend",
      label: "Google Ads / Search",
      type: "slider",
      defaultValue: 400,
      min: 0,
      max: 5000,
      step: 50,
      prefix: "$",
      tooltip: "Monthly spend on Google Ads, local search, and SEO services.",
    },
    {
      name: "flyersSignageSpend",
      label: "Flyers / Signage / Print",
      type: "slider",
      defaultValue: 150,
      min: 0,
      max: 2000,
      step: 25,
      prefix: "$",
      tooltip: "Monthly cost for flyers, door hangers, newspaper ads, and signage.",
    },
    {
      name: "referralProgramSpend",
      label: "Referral Program Rewards",
      type: "slider",
      defaultValue: 100,
      min: 0,
      max: 2000,
      step: 25,
      prefix: "$",
      tooltip: "Monthly cost of referral rewards, loyalty bonuses, and incentives.",
    },
    {
      name: "otherMarketingSpend",
      label: "Other Marketing",
      type: "slider",
      defaultValue: 50,
      min: 0,
      max: 2000,
      step: 25,
      prefix: "$",
      tooltip: "Sponsorships, community events, email marketing tools, etc.",
    },
    {
      name: "newCustomersFromSocial",
      label: "New Customers from Social",
      type: "slider",
      defaultValue: 20,
      min: 0,
      max: 200,
      step: 1,
      tooltip: "Estimated new customers acquired through social media ads monthly.",
    },
    {
      name: "newCustomersFromGoogle",
      label: "New Customers from Google",
      type: "slider",
      defaultValue: 30,
      min: 0,
      max: 200,
      step: 1,
      tooltip: "Estimated new customers from Google Ads and search marketing monthly.",
    },
    {
      name: "newCustomersFromPrint",
      label: "New Customers from Print",
      type: "slider",
      defaultValue: 10,
      min: 0,
      max: 100,
      step: 1,
      tooltip: "Estimated new customers from flyers, signage, and print ads monthly.",
    },
    {
      name: "newCustomersFromReferrals",
      label: "New Customers from Referrals",
      type: "slider",
      defaultValue: 15,
      min: 0,
      max: 100,
      step: 1,
      tooltip: "New customers acquired through referral programs monthly.",
    },
    {
      name: "newCustomersWalkIns",
      label: "Organic Walk-ins",
      type: "slider",
      defaultValue: 25,
      min: 0,
      max: 200,
      step: 1,
      tooltip: "New customers who discover you organically (drive-by, word of mouth, etc.).",
    },
    {
      name: "customerLTV",
      label: "Customer Lifetime Value",
      type: "slider",
      defaultValue: 1152,
      min: 200,
      max: 5000,
      step: 50,
      prefix: "$",
      tooltip: "Average lifetime value per customer. Use LTV Calculator for accurate value.",
    },
  ],
  outputs: [
    {
      name: "totalNewCustomers",
      label: "Total New Customers/Month",
      format: "number",
      decimals: 0,
      description: "Combined new customers from all channels",
    },
    {
      name: "totalMarketingSpend",
      label: "Total Marketing Spend",
      format: "currency",
      decimals: 0,
      description: "Sum of all marketing expenditures",
    },
    {
      name: "blendedCAC",
      label: "Blended CAC",
      format: "currency",
      decimals: 2,
      highlight: true,
      description: "Average cost per new customer across all channels",
    },
    {
      name: "socialCAC",
      label: "Social Media CAC",
      format: "currency",
      decimals: 2,
      description: "Cost per customer from social media",
    },
    {
      name: "googleCAC",
      label: "Google Ads CAC",
      format: "currency",
      decimals: 2,
      description: "Cost per customer from Google/search",
    },
    {
      name: "printCAC",
      label: "Print/Signage CAC",
      format: "currency",
      decimals: 2,
      description: "Cost per customer from traditional marketing",
    },
    {
      name: "referralCAC",
      label: "Referral CAC",
      format: "currency",
      decimals: 2,
      description: "Cost per customer from referral programs",
    },
    {
      name: "organicCAC",
      label: "Organic CAC",
      format: "currency",
      decimals: 2,
      description: "Effective cost for organic/walk-in customers",
    },
    {
      name: "ltvCacRatio",
      label: "LTV:CAC Ratio",
      format: "number",
      decimals: 1,
      highlight: true,
      description: "Target: 3:1 minimum, 5:1+ excellent",
    },
    {
      name: "paybackMonths",
      label: "CAC Payback (Months)",
      format: "number",
      decimals: 1,
      description: "Months to recover acquisition cost",
    },
    {
      name: "annualMarketingROI",
      label: "Marketing ROI",
      format: "percentage",
      decimals: 0,
      highlight: true,
      description: "Return on marketing investment (LTV-based)",
    },
  ],
  formulas: {
    totalNewCustomers: "newCustomersFromSocial + newCustomersFromGoogle + newCustomersFromPrint + newCustomersFromReferrals + newCustomersWalkIns",
    totalMarketingSpend: "socialMediaSpend + googleAdsSpend + flyersSignageSpend + referralProgramSpend + otherMarketingSpend",
    blendedCAC: "totalNewCustomers > 0 ? totalMarketingSpend / totalNewCustomers : 0",
    socialCAC: "newCustomersFromSocial > 0 ? socialMediaSpend / newCustomersFromSocial : 0",
    googleCAC: "newCustomersFromGoogle > 0 ? googleAdsSpend / newCustomersFromGoogle : 0",
    printCAC: "newCustomersFromPrint > 0 ? flyersSignageSpend / newCustomersFromPrint : 0",
    referralCAC: "newCustomersFromReferrals > 0 ? referralProgramSpend / newCustomersFromReferrals : 0",
    organicCAC: "newCustomersWalkIns > 0 ? otherMarketingSpend / newCustomersWalkIns : 0",
    ltvCacRatio: "blendedCAC > 0 ? customerLTV / blendedCAC : 0",
    avgMonthlyRevPerCustomer: "customerLTV / 24",
    paybackMonths: "avgMonthlyRevPerCustomer > 0 ? blendedCAC / avgMonthlyRevPerCustomer : 0",
    annualMarketingROI: "totalMarketingSpend > 0 ? ((customerLTV * totalNewCustomers) - (totalMarketingSpend * 12)) / (totalMarketingSpend * 12) * 100 : 0",
  },
  charts: [
    {
      type: "bar",
      title: "CAC by Channel",
      dataKeys: ["socialCAC", "googleCAC", "printCAC", "referralCAC"],
      labels: ["Social", "Google", "Print", "Referral"],
      colors: ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6"],
    },
    {
      type: "pie",
      title: "Customer Sources",
      dataKeys: ["newCustomersFromSocial", "newCustomersFromGoogle", "newCustomersFromPrint", "newCustomersFromReferrals", "newCustomersWalkIns"],
      labels: ["Social", "Google", "Print", "Referrals", "Walk-ins"],
      colors: ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"],
    },
  ],
  tips: [
    "Industry target CAC: $5-15 per customer for laundromats",
    "Minimum viable LTV:CAC ratio is 3:1 for profitability",
    "Referral programs typically have lowest CAC and highest quality customers",
    "Track customers by source using simple surveys or QR codes",
    "Organic/walk-in customers have near-zero CAC - optimize for visibility",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function CACCalculator() {
  return (
    <>
      <SEO
        title="Customer Acquisition Cost (CAC) Calculator | Laundromat Marketing ROI | WashBizHub"
        description="Calculate your customer acquisition cost by marketing channel. Compare CAC across social media, Google Ads, print, and referrals. Optimize marketing spend for your laundromat."
        canonicalUrl="/cac-calculator"
        ogType="website"
        keywords={[
          "customer acquisition cost calculator",
          "laundromat CAC",
          "marketing ROI laundromat",
          "laundromat marketing cost",
          "CAC calculator",
          "laundromat advertising cost",
          "customer acquisition laundry",
          "marketing analytics laundromat",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Calculators", href: "/calculators-hub" },
              { label: "Customer Acquisition Cost Calculator" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Customer Acquisition Cost Calculator
                </h1>
                <p className="text-muted-foreground">
                  Measure marketing efficiency and optimize customer acquisition
                </p>
              </div>
              <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Customer Intelligence
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target CAC</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-target-cac">$5 - $15</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target LTV:CAC</p>
                    <p className="text-2xl font-bold text-foreground">3:1+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Marketing Budget</p>
                    <p className="text-2xl font-bold text-foreground">3-5% Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Channel</p>
                    <p className="text-2xl font-bold text-foreground">Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Understanding Customer Acquisition Cost</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              CAC measures how much you spend to acquire each new customer. Lower CAC means more efficient marketing. 
              Compare your CAC to customer LTV to ensure profitability - target at least 3:1 LTV:CAC ratio.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={cacCalculatorConfig} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Ways to Lower CAC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Referral programs</strong> - Lowest CAC, highest quality customers
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Local SEO</strong> - Free organic traffic from Google Maps
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Better signage</strong> - Capture more walk-in traffic
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Customer reviews</strong> - Build social proof for free
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-5 h-5 text-blue-500" />
                  CAC by Channel (Industry Averages)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Referral Programs</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">$3 - $8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Google Ads (Local)</span>
                  <Badge variant="outline">$8 - $20</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Facebook/Instagram Ads</span>
                  <Badge variant="outline">$10 - $25</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Print/Flyers</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">$15 - $40</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
