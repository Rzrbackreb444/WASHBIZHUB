import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, TrendingDown, AlertTriangle, Clock, DollarSign, 
  Target, Shield, Heart, RefreshCcw, Sparkles, CheckCircle, 
  Info, MapPin, MessageSquare, Crown, Star
} from "lucide-react";

function ChurnRiskGauge({ probability }: { probability: number }) {
  const getRiskLevel = (prob: number) => {
    if (prob < 25) return { level: "Low", color: "#22C55E", bgColor: "bg-green-500/10", textColor: "text-green-600" };
    if (prob < 50) return { level: "Medium", color: "#F59E0B", bgColor: "bg-amber-500/10", textColor: "text-amber-600" };
    if (prob < 75) return { level: "High", color: "#EF4444", bgColor: "bg-red-500/10", textColor: "text-red-600" };
    return { level: "Critical", color: "#DC2626", bgColor: "bg-red-600/10", textColor: "text-red-700" };
  };

  const risk = getRiskLevel(probability);
  const rotation = (probability / 100) * 180 - 90;

  return (
    <Card className="bg-card border shadow-sm" data-testid="churn-risk-gauge">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#C8A661]" />
          Churn Risk Meter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-24 mb-4">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="33%" stopColor="#F59E0B" />
                  <stop offset="66%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(probability / 100) * 251.2} 251.2`}
              />
              <g transform={`rotate(${rotation} 100 90)`}>
                <line x1="100" y1="90" x2="100" y2="30" stroke="#0A1628" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="90" r="8" fill="#0A1628" />
              </g>
              <text x="20" y="100" fontSize="10" fill="#6b7280">0%</text>
              <text x="90" y="15" fontSize="10" fill="#6b7280">50%</text>
              <text x="170" y="100" fontSize="10" fill="#6b7280">100%</text>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#C8A661]" data-testid="churn-probability-display">
              {probability.toFixed(1)}%
            </div>
            <Badge 
              className={`mt-2 ${risk.bgColor} ${risk.textColor} border-0`}
              data-testid="churn-risk-level-badge"
            >
              {risk.level} Risk
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RetentionActionsPanel({ riskLevel, churnProbability }: { riskLevel: string; churnProbability: number }) {
  const getActions = (level: string) => {
    switch (level) {
      case "Critical":
        return [
          { action: "Immediate personal outreach call", priority: "Urgent", icon: MessageSquare },
          { action: "Offer 50% discount on next 3 visits", priority: "Urgent", icon: DollarSign },
          { action: "VIP loyalty upgrade (complimentary)", priority: "High", icon: Crown },
          { action: "Send win-back email sequence", priority: "High", icon: RefreshCcw },
          { action: "Schedule in-person visit if possible", priority: "High", icon: Users },
        ];
      case "High":
        return [
          { action: "Personal phone call within 48 hours", priority: "High", icon: MessageSquare },
          { action: "Offer 30% discount on next visit", priority: "High", icon: DollarSign },
          { action: "Send satisfaction survey", priority: "Medium", icon: Target },
          { action: "Loyalty bonus points (2x)", priority: "Medium", icon: Star },
        ];
      case "Medium":
        return [
          { action: "Send personalized re-engagement email", priority: "Medium", icon: MessageSquare },
          { action: "Offer 15% loyalty discount", priority: "Medium", icon: DollarSign },
          { action: "Highlight new services/upgrades", priority: "Low", icon: Sparkles },
          { action: "Add to retention watch list", priority: "Low", icon: Target },
        ];
      default:
        return [
          { action: "Continue standard loyalty program", priority: "Low", icon: Heart },
          { action: "Send monthly newsletter", priority: "Low", icon: MessageSquare },
          { action: "Invite to referral program", priority: "Low", icon: Users },
        ];
    }
  };

  const actions = getActions(riskLevel);
  const priorityColors: Record<string, string> = {
    Urgent: "bg-red-500/10 text-red-600 border-red-200",
    High: "bg-amber-500/10 text-amber-600 border-amber-200",
    Medium: "bg-blue-500/10 text-blue-600 border-blue-200",
    Low: "bg-green-500/10 text-green-600 border-green-200",
  };

  return (
    <Card className="bg-card border shadow-sm" data-testid="retention-actions-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#C8A661]" />
          Recommended Retention Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              data-testid={`retention-action-${index}`}
            >
              <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-[#C8A661]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.action}</p>
              </div>
              <Badge 
                variant="outline" 
                className={`shrink-0 ${priorityColors[item.priority]}`}
                data-testid={`action-priority-${index}`}
              >
                {item.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const churnPredictorConfig: PremiumCalculatorConfig = {
  id: "customer-churn-predictor",
  name: "Customer Churn Predictor Calculator",
  description: "Predict customer churn probability and get actionable retention recommendations. Identify at-risk customers before they leave and maximize customer lifetime value.",
  category: "Customer Intelligence",
  inputs: [
    {
      name: "avgVisitFrequency",
      label: "Average Visit Frequency (Days Between Visits)",
      type: "slider",
      defaultValue: 7,
      min: 1,
      max: 60,
      step: 1,
      tooltip: "How often this customer typically visits your laundromat. Industry average: 7 days (weekly).",
    },
    {
      name: "loyaltyTier",
      label: "Customer Loyalty Tier",
      type: "select",
      defaultValue: "none",
      options: ["none", "bronze", "silver", "gold"],
      tooltip: "Customer's current loyalty program tier. Higher tiers have stronger retention.",
    },
    {
      name: "complaintsCount",
      label: "Complaints in Last 6 Months",
      type: "slider",
      defaultValue: 0,
      min: 0,
      max: 10,
      step: 1,
      tooltip: "Number of complaints or negative feedback received. Each complaint increases churn risk by 15%.",
    },
    {
      name: "monthsSinceLastVisit",
      label: "Months Since Last Visit",
      type: "slider",
      defaultValue: 1,
      min: 0,
      max: 12,
      step: 0.5,
      tooltip: "Time since customer's most recent visit. Longer gaps indicate higher churn risk.",
    },
    {
      name: "avgSpendPerVisit",
      label: "Average Spend per Visit",
      type: "slider",
      defaultValue: 15,
      min: 5,
      max: 100,
      step: 1,
      prefix: "$",
      tooltip: "Average amount spent per visit. Higher spenders are more valuable to retain.",
    },
    {
      name: "totalLifetimeVisits",
      label: "Total Lifetime Visits",
      type: "slider",
      defaultValue: 50,
      min: 1,
      max: 500,
      step: 1,
      tooltip: "Total number of visits since becoming a customer. More visits = stronger relationship.",
    },
    {
      name: "competitorDistance",
      label: "Nearest Competitor Distance (Miles)",
      type: "slider",
      defaultValue: 2,
      min: 0.1,
      max: 10,
      step: 0.1,
      tooltip: "Distance to nearest competitor. Closer competitors increase churn risk.",
    },
  ],
  outputs: [
    {
      name: "churnProbability",
      label: "Churn Probability Score",
      format: "percentage",
      decimals: 1,
      highlight: true,
      description: "Likelihood customer will churn (0-100%)",
    },
    {
      name: "riskLevel",
      label: "Churn Risk Level",
      format: "text",
      description: "Low / Medium / High / Critical classification",
    },
    {
      name: "expectedRemainingVisits",
      label: "Expected Remaining Visits",
      format: "number",
      decimals: 0,
      description: "Predicted visits before potential churn",
    },
    {
      name: "ltvAtRisk",
      label: "Lifetime Value at Risk",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Revenue at risk if customer churns",
    },
    {
      name: "winbackPriority",
      label: "Win-Back Campaign Priority",
      format: "number",
      decimals: 0,
      description: "Priority score for win-back efforts (1-100)",
    },
    {
      name: "retentionROI",
      label: "Retention Investment ROI",
      format: "percentage",
      decimals: 0,
      description: "Expected return on retention spend",
    },
    {
      name: "baseChurnRisk",
      label: "Base Churn Risk",
      format: "percentage",
      decimals: 1,
      description: "Risk based on visit frequency vs. last visit",
    },
    {
      name: "complaintFactor",
      label: "Complaint Impact Factor",
      format: "number",
      decimals: 2,
      description: "Multiplier from complaints (1.0 = no impact)",
    },
    {
      name: "loyaltyDiscount",
      label: "Loyalty Retention Bonus",
      format: "percentage",
      decimals: 0,
      description: "Risk reduction from loyalty tier",
    },
    {
      name: "competitorProximityFactor",
      label: "Competitor Proximity Factor",
      format: "number",
      decimals: 2,
      description: "Risk multiplier based on competitor distance",
    },
  ],
  formulas: {
    daysSinceLastVisit: "monthsSinceLastVisit * 30",
    baseChurnRisk: "Math.min((daysSinceLastVisit / avgVisitFrequency) * 10, 100)",
    complaintFactor: "1 + (complaintsCount * 0.15)",
    loyaltyDiscountRaw: "loyaltyTier === 'gold' ? 0.5 : loyaltyTier === 'silver' ? 0.7 : loyaltyTier === 'bronze' ? 0.85 : 1.0",
    loyaltyDiscount: "(1 - loyaltyDiscountRaw) * 100",
    competitorProximityFactor: "competitorDistance < 1 ? 1.5 : competitorDistance < 2 ? 1.2 : competitorDistance < 5 ? 1.0 : 0.8",
    rawChurnProbability: "baseChurnRisk * complaintFactor * loyaltyDiscountRaw * competitorProximityFactor",
    churnProbability: "Math.min(Math.max(rawChurnProbability, 0), 100)",
    riskLevelNum: "churnProbability < 25 ? 1 : churnProbability < 50 ? 2 : churnProbability < 75 ? 3 : 4",
    expectedRemainingVisits: "Math.max(Math.round((100 - churnProbability) / 10 * (avgVisitFrequency <= 7 ? 4 : avgVisitFrequency <= 14 ? 2 : 1)), 1)",
    avgMonthlySpend: "avgSpendPerVisit * (30 / avgVisitFrequency)",
    remainingLTV: "avgMonthlySpend * 12 * (1 - churnProbability / 100)",
    ltvAtRisk: "avgMonthlySpend * 12 * (churnProbability / 100)",
    winbackPriority: "Math.round((churnProbability * 0.4) + (ltvAtRisk / 100 * 0.3) + (totalLifetimeVisits / 5 * 0.3))",
    retentionCost: "ltvAtRisk * 0.1",
    retentionROI: "retentionCost > 0 ? ((ltvAtRisk - retentionCost) / retentionCost) * 100 : 0",
  },
  charts: [
    {
      type: "bar",
      title: "Risk Factor Breakdown",
      dataKeys: ["baseChurnRisk", "churnProbability"],
      labels: ["Base Risk", "Final Risk"],
      colors: ["#3B82F6", "#EF4444"],
    },
    {
      type: "pie",
      title: "Value Analysis",
      dataKeys: ["remainingLTV", "ltvAtRisk"],
      labels: ["Protected LTV", "LTV at Risk"],
      colors: ["#22C55E", "#EF4444"],
    },
  ],
  tips: [
    "Customers who haven't visited in 2x their normal frequency have 60% higher churn risk",
    "Each unresolved complaint increases churn probability by 15%",
    "Gold loyalty members have 50% lower churn rate than non-members",
    "Competitor proximity within 1 mile increases churn risk by 50%",
    "Proactive outreach to at-risk customers can reduce churn by 30-40%",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function CustomerChurnPredictor() {
  return (
    <>
      <SEO
        title="Customer Churn Predictor Calculator | Laundromat Customer Retention | WashBizHub"
        description="Predict customer churn risk for your laundromat with our AI-powered calculator. Get actionable retention recommendations, win-back priorities, and protect your customer lifetime value."
        canonicalUrl="/customer-churn-predictor"
        ogType="website"
        keywords={[
          "customer churn predictor",
          "laundromat customer retention",
          "churn risk calculator",
          "customer lifetime value",
          "retention strategy laundromat",
          "win-back campaign",
          "customer loyalty laundry",
          "reduce customer churn",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Customer Churn Predictor", url: "/customer-churn-predictor" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="page-title">
                  Customer Churn Predictor
                </h1>
                <p className="text-muted-foreground">
                  Identify at-risk customers and take action before they leave
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-premium">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Calculator
              </Badge>
              <Badge variant="secondary" data-testid="badge-category">
                <Users className="w-3 h-3 mr-1" />
                Customer Intelligence
              </Badge>
              <Badge variant="secondary" data-testid="badge-retention">
                <Shield className="w-3 h-3 mr-1" />
                Retention Tool
              </Badge>
            </div>

            <Alert className="bg-muted/50 border-[#C8A661]/30" data-testid="calculator-description-alert">
              <Info className="h-4 w-4 text-[#C8A661]" />
              <AlertTitle>How This Calculator Works</AlertTitle>
              <AlertDescription>
                This calculator analyzes customer behavior patterns to predict churn probability. 
                It considers visit frequency, loyalty status, complaint history, and competitive factors 
                to generate actionable retention recommendations. Early intervention can reduce customer 
                churn by up to 40%.
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PremiumCalculatorEngine config={churnPredictorConfig} />
            </div>

            <PremiumResults
              featureName="customer-churn-predictor"
              analysisType="customer-churn-predictor"
              title="Customer Churn Analysis Results"
              data={{
                inputValues: {
                  avgVisitFrequency: 7,
                  loyaltyTier: "none",
                  complaintsCount: 0,
                  monthsSinceLastVisit: 1,
                  avgSpendPerVisit: 15,
                  totalLifetimeVisits: 50,
                  competitorDistance: 2,
                },
                results: {
                  churnProbability: 35,
                  riskLevel: "Medium",
                  expectedRemainingVisits: 26,
                  ltvAtRisk: 252,
                  winbackPriority: 44,
                  retentionROI: 800,
                },
                metrics: {
                  churnProbability: "35%",
                  riskLevel: "Medium",
                  ltvAtRisk: "$252",
                  retentionROI: "800%",
                },
                timestamp: new Date().toISOString(),
                analysisType: "customer-churn-predictor",
              }}
              summary={{
                headline: "Churn risk assessment",
                metrics: [
                  { label: "Risk Level", value: "Medium" },
                  { label: "Churn Probability", value: "35%" },
                ]
              }}
              benefits={[
                "Save unlimited analyses",
                "Export to Google Sheets & Docs",
                "Priority support"
              ]}
              cardWrapper={false}
              showTitle={false}
            >
            <div className="space-y-6">
              <ChurnRiskGauge probability={35} />
              <RetentionActionsPanel riskLevel="Medium" churnProbability={35} />
              
              <Card className="bg-card border shadow-sm" data-testid="key-insights-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Industry Benchmark</p>
                        <p className="text-xs text-muted-foreground">
                          Average laundromat customer churn: 15-25% annually
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Critical Threshold</p>
                        <p className="text-xs text-muted-foreground">
                          Customers with 75%+ churn risk need immediate intervention
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-[#C8A661] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Retention ROI</p>
                        <p className="text-xs text-muted-foreground">
                          Retaining a customer costs 5x less than acquiring a new one
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Response Time</p>
                        <p className="text-xs text-muted-foreground">
                          Best win-back results within 48 hours of risk detection
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0A1628] border-0" data-testid="pro-tips-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C8A661]" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {churnPredictorConfig.tips?.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-[#C8A661] mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            </PremiumResults>
          </div>

          <div className="mt-12">
            <CalculatorDisclaimer calculatorName="Customer Churn Predictor" />
          </div>
        </div>
      </div>
    </>
  );
}
