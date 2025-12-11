import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { 
  ClipboardCheck, FileText, Building2, Wrench, Users, Scale,
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Shield,
  ArrowRight, Info, Sparkles, Target, AlertCircle
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  isCritical: boolean;
  weight: number;
  description: string;
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  borderColor: string;
}

const categories: CategoryConfig[] = [
  { id: "financial", name: "Financial Documents", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { id: "lease", name: "Lease Review", icon: Building2, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  { id: "equipment", name: "Equipment Assessment", icon: Wrench, color: "text-amber-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  { id: "operations", name: "Operations Verification", icon: Users, color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  { id: "legal", name: "Legal Clearance", icon: Scale, color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
];

const checklistItems: ChecklistItem[] = [
  { id: "pnl_verified", label: "P&L Statement Verified", category: "financial", isCritical: true, weight: 15, description: "Profit & loss statements reviewed for accuracy and consistency" },
  { id: "tax_returns", label: "Tax Returns Reviewed", category: "financial", isCritical: true, weight: 12, description: "Last 3 years of tax returns examined and verified" },
  { id: "bank_statements", label: "Bank Statements Checked", category: "financial", isCritical: true, weight: 10, description: "Bank statements reconciled with reported income" },
  
  { id: "lease_reviewed", label: "Lease Terms Reviewed", category: "lease", isCritical: true, weight: 12, description: "Current lease agreement thoroughly analyzed" },
  { id: "terms_acceptable", label: "Terms Acceptable", category: "lease", isCritical: false, weight: 8, description: "Lease terms align with business requirements" },
  { id: "renewal_options", label: "Renewal Options Verified", category: "lease", isCritical: false, weight: 6, description: "Future renewal terms and options confirmed" },
  
  { id: "inventory_complete", label: "Equipment Inventory Complete", category: "equipment", isCritical: true, weight: 10, description: "Full inventory of all equipment documented" },
  { id: "age_verified", label: "Equipment Age Verified", category: "equipment", isCritical: false, weight: 6, description: "Age and condition of all machines confirmed" },
  { id: "maintenance_records", label: "Maintenance Records Obtained", category: "equipment", isCritical: false, weight: 5, description: "Service history and maintenance logs reviewed" },
  
  { id: "utility_bills", label: "Utility Bills Verified", category: "operations", isCritical: false, weight: 6, description: "12+ months of utility bills analyzed" },
  { id: "staff_assessed", label: "Staff Situation Assessed", category: "operations", isCritical: false, weight: 4, description: "Current staffing needs and costs understood" },
  { id: "customer_data", label: "Customer Data Reviewed", category: "operations", isCritical: false, weight: 4, description: "Customer traffic patterns and demographics analyzed" },
  
  { id: "title_clear", label: "Title/Ownership Clear", category: "legal", isCritical: true, weight: 15, description: "Business ownership and any liens verified" },
  { id: "permits_current", label: "Permits Current", category: "legal", isCritical: true, weight: 10, description: "All required permits and licenses are valid" },
  { id: "no_litigation", label: "No Pending Litigation", category: "legal", isCritical: true, weight: 8, description: "Confirmed no ongoing legal issues or disputes" },
];

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E', '#EF4444'];

export default function DueDiligenceVerifier() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAll = () => {
    setCheckedItems({});
  };

  const checkAll = () => {
    const allChecked: Record<string, boolean> = {};
    checklistItems.forEach(item => { allChecked[item.id] = true; });
    setCheckedItems(allChecked);
  };

  const results = useMemo(() => {
    const completedItems = checklistItems.filter(item => checkedItems[item.id]);
    const totalItems = checklistItems.length;
    const completedCount = completedItems.length;
    
    const completionScore = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    
    const totalWeight = checklistItems.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = completedItems.reduce((sum, item) => sum + item.weight, 0);
    const weightedScore = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    
    const criticalItems = checklistItems.filter(item => item.isCritical);
    const completedCritical = criticalItems.filter(item => checkedItems[item.id]);
    const criticalScore = criticalItems.length > 0 ? Math.round((completedCritical.length / criticalItems.length) * 100) : 0;
    
    const missingCritical = criticalItems.filter(item => !checkedItems[item.id]);
    const missingNonCritical = checklistItems.filter(item => !item.isCritical && !checkedItems[item.id]);
    
    let riskRating: "Low" | "Medium" | "High";
    let riskColor: string;
    if (criticalScore === 100 && weightedScore >= 80) {
      riskRating = "Low";
      riskColor = "text-green-500";
    } else if (criticalScore >= 70 && weightedScore >= 50) {
      riskRating = "Medium";
      riskColor = "text-amber-500";
    } else {
      riskRating = "High";
      riskColor = "text-red-500";
    }
    
    const isReady = criticalScore === 100 && weightedScore >= 80;
    
    const categoryProgress = categories.map(cat => {
      const categoryItems = checklistItems.filter(item => item.category === cat.id);
      const completedCategoryItems = categoryItems.filter(item => checkedItems[item.id]);
      const progress = categoryItems.length > 0 ? Math.round((completedCategoryItems.length / categoryItems.length) * 100) : 0;
      return {
        category: cat.name,
        completed: completedCategoryItems.length,
        total: categoryItems.length,
        progress,
      };
    });

    const nextSteps: string[] = [];
    if (missingCritical.length > 0) {
      nextSteps.push(`Complete ${missingCritical.length} critical item${missingCritical.length > 1 ? 's' : ''}: ${missingCritical.slice(0, 2).map(i => i.label).join(', ')}${missingCritical.length > 2 ? '...' : ''}`);
    }
    if (weightedScore < 80 && missingCritical.length === 0) {
      nextSteps.push("Complete remaining non-critical items to reach 80% threshold");
    }
    if (isReady) {
      nextSteps.push("Due diligence complete - proceed with offer negotiation");
      nextSteps.push("Engage attorney for contract review");
      nextSteps.push("Finalize financing arrangements");
    } else if (riskRating === "Medium") {
      nextSteps.push("Address critical gaps before proceeding");
      nextSteps.push("Request additional documentation from seller");
    } else if (riskRating === "High") {
      nextSteps.push("Halt negotiations until critical items are verified");
      nextSteps.push("Consider hiring professional due diligence service");
    }

    return {
      completionScore,
      weightedScore,
      criticalScore,
      riskRating,
      riskColor,
      isReady,
      missingCritical,
      missingNonCritical,
      categoryProgress,
      nextSteps,
      completedCount,
      totalItems,
    };
  }, [checkedItems]);

  const pieData = results.categoryProgress.map((cat, idx) => ({
    name: cat.category.split(' ')[0],
    value: cat.progress,
    fill: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  const barData = results.categoryProgress.map(cat => ({
    name: cat.category.split(' ')[0],
    completed: cat.completed,
    remaining: cat.total - cat.completed,
  }));

  return (
    <>
      <SEO
        title="Due Diligence Verifier Calculator | Laundromat Acquisition Checklist | WashBizHub"
        description="Complete due diligence checklist for laundromat acquisitions. Track financial verification, lease review, equipment assessment, and legal clearance. Get risk ratings and readiness scores."
        canonicalUrl="/due-diligence-verifier"
        ogType="website"
        keywords={[
          "due diligence checklist",
          "laundromat acquisition",
          "buy laundromat checklist",
          "due diligence calculator",
          "laundromat purchase verification",
          "business acquisition checklist",
          "laundromat buyer checklist",
          "due diligence score",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators-hub" },
          { name: "Due Diligence Verifier", url: "/due-diligence-verifier" },
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Due Diligence Verifier", url: "/due-diligence-verifier" },
            ]}
          />

          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Due Diligence Verifier
                </h1>
                <p className="text-muted-foreground">
                  Track your acquisition due diligence progress and readiness
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Acquisition Tools
              </Badge>
            </div>
          </div>

          <PremiumResults
            featureName="due-diligence-verifier"
            analysisType="due-diligence-verifier"
            title="Due Diligence Verification Results"
            data={{
              checklist: {
                checkedItems: checkedItems,
                allItems: checklistItems.map(item => ({
                  id: item.id,
                  label: item.label,
                  category: item.category,
                  isCritical: item.isCritical,
                  completed: checkedItems[item.id] || false,
                })),
              },
              results: {
                completionScore: results.completionScore,
                weightedScore: results.weightedScore,
                criticalScore: results.criticalScore,
                riskRating: results.riskRating,
                isReady: results.isReady,
                completedCount: results.completedCount,
                totalItems: results.totalItems,
              },
              categoryProgress: results.categoryProgress,
              missingCritical: results.missingCritical.map(item => item.label),
              nextSteps: results.nextSteps,
              metrics: {
                completionScore: `${results.completionScore}%`,
                weightedScore: `${results.weightedScore}%`,
                criticalScore: `${results.criticalScore}%`,
                riskRating: results.riskRating,
                readiness: results.isReady ? "Ready" : "Not Ready",
              },
              timestamp: new Date().toISOString(),
              analysisType: "due-diligence-verifier",
            }}
            summary={{
              headline: "Acquisition readiness analysis",
              metrics: [
                { label: "Completion Score", value: `${results.completionScore}%` },
                { label: "Risk Rating", value: results.riskRating },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-[#C8A661]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Score</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-completion-score">{results.completionScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Weighted Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-weighted-score">{results.weightedScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className={`w-8 h-8 ${results.riskColor}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Rating</p>
                    <p className={`text-2xl font-bold ${results.riskColor}`} data-testid="text-risk-rating">{results.riskRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {results.isReady ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Readiness</p>
                    <p className={`text-2xl font-bold ${results.isReady ? 'text-green-500' : 'text-amber-500'}`} data-testid="text-readiness-status">
                      {results.isReady ? 'Ready' : 'Not Ready'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground" data-testid="text-progress-fraction">
                {results.completedCount} of {results.totalItems} items completed
              </span>
            </div>
            <Progress value={results.completionScore} className="h-3" data-testid="progress-bar-completion" />
          </div>

          <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Due Diligence Best Practices</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Complete all critical items (marked with ★) before making an offer. Target 80%+ completion score for a thorough due diligence process.
              Items are weighted by importance - financial and legal items carry more weight.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={checkAll} data-testid="button-check-all">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Check All
                </Button>
                <Button variant="outline" size="sm" onClick={resetAll} data-testid="button-reset-all">
                  <XCircle className="w-4 h-4 mr-1" />
                  Reset All
                </Button>
              </div>

              {categories.map((category) => {
                const categoryItems = checklistItems.filter(item => item.category === category.id);
                const completedCount = categoryItems.filter(item => checkedItems[item.id]).length;
                const progress = Math.round((completedCount / categoryItems.length) * 100);
                const isComplete = completedCount === categoryItems.length;
                const Icon = category.icon;

                return (
                  <Card 
                    key={category.id} 
                    className={`bg-card border shadow-sm overflow-hidden ${isComplete ? 'border-green-500/50' : ''}`}
                    data-testid={`card-category-${category.id}`}
                  >
                    <div className={`h-1 ${isComplete ? 'bg-green-500' : 'bg-[#C8A661]'}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${category.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <CardDescription>{completedCount} of {categoryItems.length} complete</CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={isComplete ? "default" : "secondary"}
                          className={isComplete ? "bg-green-500 text-white" : ""}
                          data-testid={`badge-category-progress-${category.id}`}
                        >
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2 mt-3" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {categoryItems.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                            checkedItems[item.id] ? 'bg-green-500/10' : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <Switch
                            id={item.id}
                            checked={checkedItems[item.id] || false}
                            onCheckedChange={() => toggleItem(item.id)}
                            data-testid={`toggle-${item.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={item.id} 
                              className={`text-sm font-medium cursor-pointer flex items-center gap-2 ${
                                checkedItems[item.id] ? 'text-green-600 line-through' : 'text-foreground'
                              }`}
                            >
                              {item.label}
                              {item.isCritical && (
                                <Badge variant="outline" className="text-xs border-red-500/50 text-red-500">
                                  ★ Critical
                                </Badge>
                              )}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          {checkedItems[item.id] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-6">
              <Card className="bg-card border shadow-sm">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#C8A661]" />
                    Category Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]" data-testid="chart-category-progress">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" domain={[0, 'dataMax']} />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                        <RechartsTooltip />
                        <Bar dataKey="completed" stackId="a" fill="#22C55E" name="Completed" />
                        <Bar dataKey="remaining" stackId="a" fill="#E5E7EB" name="Remaining" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {results.missingCritical.length > 0 && (
                <Card className="bg-card border border-red-500/30 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      Missing Critical Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2" data-testid="list-missing-critical">
                      {results.missingCritical.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card border shadow-sm">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[#C8A661]" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3" data-testid="list-next-steps">
                    {results.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="h-5 w-5 rounded-full bg-[#C8A661]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-[#C8A661]">{idx + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className={`border shadow-sm ${results.isReady ? 'bg-green-500/10 border-green-500/50' : 'bg-amber-500/10 border-amber-500/50'}`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    {results.isReady ? (
                      <>
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-600 mb-2" data-testid="text-readiness-message">Ready to Proceed</h3>
                        <p className="text-sm text-muted-foreground">
                          All critical items verified. You're ready to move forward with confidence.
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-amber-600 mb-2" data-testid="text-readiness-message">Not Ready Yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete all critical items and reach 80%+ score before proceeding.
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Simple Completion</span>
                      <span className="font-medium" data-testid="text-simple-score">{results.completionScore}%</span>
                    </div>
                    <Progress value={results.completionScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Weighted Score</span>
                      <span className="font-medium" data-testid="text-weighted-display">{results.weightedScore}%</span>
                    </div>
                    <Progress value={results.weightedScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Critical Items</span>
                      <span className="font-medium" data-testid="text-critical-score">{results.criticalScore}%</span>
                    </div>
                    <Progress value={results.criticalScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Due Diligence Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Verify income claims</strong> - Request 3 years of tax returns and bank statements
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Review lease carefully</strong> - Check rent increases, renewal terms, and assignment clauses
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Inspect all equipment</strong> - Note ages, conditions, and expected replacement costs
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Clear all legal issues</strong> - Ensure no liens, lawsuits, or permit problems exist
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Common Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Seller reluctant to provide financial documentation
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Lease expires soon with no renewal guarantee
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Equipment significantly older than represented
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Outstanding liens or unresolved legal issues
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          </PremiumResults>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
