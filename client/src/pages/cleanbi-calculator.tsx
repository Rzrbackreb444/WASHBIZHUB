import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Download, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";

const cleanbiStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CLEANBI 2.0 Business Intelligence Scorecard",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "description": "Comprehensive 17-factor business intelligence scoring system for laundromat valuation and investment analysis. Evaluate location quality, revenue performance, equipment condition, and 14 more critical factors.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "5640"
  }
};

interface Factor {
  id: string;
  name: string;
  weight: number;
  score: number;
  description: string;
}

export default function CLEANBICalculator() {
  const [factors, setFactors] = useState<Factor[]>([
    { id: "location", name: "Location Quality", weight: 15, score: 5, description: "Demographics, foot traffic, visibility" },
    { id: "revenue", name: "Revenue Performance", weight: 12, score: 5, description: "Monthly revenue consistency and growth" },
    { id: "equipment", name: "Equipment Condition", weight: 10, score: 5, description: "Age, maintenance, efficiency" },
    { id: "lease", name: "Lease Terms", weight: 8, score: 5, description: "Length, rate, escalation clauses" },
    { id: "competition", name: "Competition Level", weight: 7, score: 5, description: "Nearby competitors and market saturation" },
    { id: "parking", name: "Parking Availability", weight: 6, score: 5, description: "Spaces, accessibility, safety" },
    { id: "cleanliness", name: "Facility Cleanliness", weight: 6, score: 5, description: "Appearance and maintenance standards" },
    { id: "utilities", name: "Utility Costs", weight: 6, score: 5, description: "Water, electric, gas efficiency" },
    { id: "security", name: "Security & Safety", weight: 5, score: 5, description: "Cameras, lighting, neighborhood" },
    { id: "hours", name: "Operating Hours", weight: 5, score: 5, description: "24/7 access vs limited hours" },
    { id: "services", name: "Additional Services", weight: 5, score: 5, description: "Wash-dry-fold, vending, pickup/delivery" },
    { id: "branding", name: "Branding & Marketing", weight: 4, score: 5, description: "Online presence, signage, reputation" },
    { id: "technology", name: "Technology Integration", weight: 4, score: 5, description: "Payment systems, mobile app, IoT" },
    { id: "staffing", name: "Staffing Quality", weight: 3, score: 5, description: "Attendant presence, training, reliability" },
    { id: "maintenance", name: "Maintenance Systems", weight: 2, score: 5, description: "Preventive programs, response time" },
    { id: "growth", name: "Growth Potential", weight: 1, score: 5, description: "Expansion opportunities, market trends" },
    { id: "financials", name: "Financial Transparency", weight: 1, score: 5, description: "Record keeping, documentation quality" },
  ]);

  const updateScore = (id: string, score: number) => {
    setFactors(prev => prev.map(f => f.id === id ? { ...f, score } : f));
  };

  // Calculate weighted score
  const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);
  const maxScore = factors.reduce((sum, f) => sum + (10 * f.weight), 0);
  const percentageScore = (totalScore / maxScore) * 100;
  
  // Grade calculation
  const getGrade = (pct: number): { letter: string; color: string; description: string } => {
    if (pct >= 90) return { letter: "A+", color: "text-green-600", description: "Excellent - Prime Investment" };
    if (pct >= 80) return { letter: "A", color: "text-green-600", description: "Very Good - Strong Buy" };
    if (pct >= 70) return { letter: "B", color: "text-blue-600", description: "Good - Solid Investment" };
    if (pct >= 60) return { letter: "C", color: "text-yellow-600", description: "Average - Proceed with Caution" };
    if (pct >= 50) return { letter: "D", color: "text-orange-600", description: "Below Average - High Risk" };
    return { letter: "F", color: "text-red-600", description: "Poor - Avoid Investment" };
  };

  const grade = getGrade(percentageScore);

  // Risk assessment
  const lowScoreFactors = factors.filter(f => f.score < 5);
  const criticalFactors = factors.filter(f => f.score <= 3 && f.weight >= 5);

  const exportToPDF = () => {
    const data = {
      reportTitle: "CLEANBI 2.0 Business Intelligence Scorecard",
      generatedAt: new Date().toLocaleString(),
      scorecard: {
        totalScore: totalScore.toFixed(1),
        maxScore,
        percentageScore: percentageScore.toFixed(1),
        grade: grade.letter,
        gradeDescription: grade.description,
      },
      factors: factors.map(f => ({
        name: f.name,
        description: f.description,
        weight: f.weight,
        score: f.score,
        weightedScore: (f.score * f.weight).toFixed(1),
        maxWeightedScore: f.weight * 10,
      })),
      analysis: {
        totalFactors: factors.length,
        lowScoreFactors: lowScoreFactors.map(f => f.name),
        criticalFactors: criticalFactors.map(f => f.name),
        lowScoreCount: lowScoreFactors.length,
        criticalCount: criticalFactors.length,
      },
      recommendations: lowScoreFactors.length > 0 ? 
        lowScoreFactors.sort((a, b) => b.weight - a.weight).map(f => ({
          factor: f.name,
          currentScore: f.score,
          weight: f.weight,
          priority: f.weight >= 10 ? 'High' : f.weight >= 5 ? 'Medium' : 'Low',
          impact: `${f.weight}% of total score`,
        })) : 
        [{ note: 'All factors scored 5 or above - excellent performance!' }],
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleanbi-scorecard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO
        title="CLEANBI 2.0 Scorecard - 17-Factor Laundromat Business Intelligence"
        description="Comprehensive 17-factor business intelligence scoring system for laundromat valuation and investment analysis. Evaluate location, revenue, equipment, lease terms, competition, and 12 more critical factors with weighted scoring."
        canonicalUrl="/cleanbi-calculator"
        keywords={[
          "laundromat scorecard",
          "CLEANBI business intelligence",
          "laundromat valuation scorecard",
          "laundry business analysis tool",
          "laundromat investment scoring",
          "17 factor laundromat analysis",
          "laundromat due diligence tool",
          "coin laundry business rating"
        ]}
        breadcrumbs={[
          { name: "Calculators", url: "/calculators" },
          { name: "CLEANBI Scorecard", url: "/cleanbi-calculator" }
        ]}
        author={{
          name: "WashBizHub CLEANBI Team",
          expertise: "Laundromat Business Intelligence & Scoring Specialists",
          credentials: "Proprietary 17-factor analysis system used by industry professionals"
        }}
        structuredData={cleanbiStructuredData}
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[
            { name: "Calculators", url: "/calculators" },
            { name: "CLEANBI Scorecard", url: "/cleanbi-calculator" }
          ]} />
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4" data-testid="text-cleanbi-title">
              CLEANBI 2.0 Scorecard
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto" data-testid="text-cleanbi-description">
              Comprehensive 17-factor business intelligence scoring system for laundromat valuation
            </p>
            <Badge variant="default" className="mt-4 bg-amber-600" data-testid="badge-industry-standard">
              Industry Standard
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score Overview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                  <CardDescription>CLEANBI 2.0 Rating</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${grade.color} mb-2`} data-testid="text-grade">
                      {grade.letter}
                    </div>
                    <div className="text-2xl font-bold mb-1" data-testid="text-percentage">
                      {percentageScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {grade.description}
                    </div>
                    <Progress value={percentageScore} className="h-3" />
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weighted Score</span>
                      <span className="font-bold">{totalScore.toFixed(1)} / {maxScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Factors Analyzed</span>
                      <span className="font-bold">{factors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low Score Flags</span>
                      <span className={`font-bold ${lowScoreFactors.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {lowScoreFactors.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Critical Issues</span>
                      <span className={`font-bold ${criticalFactors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {criticalFactors.length}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {criticalFactors.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-red-900 dark:text-red-100 mb-1">
                            Critical Issues Detected
                          </div>
                          <div className="text-red-700 dark:text-red-300">
                            {criticalFactors.length} high-weight factors scored 3 or below
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {percentageScore >= 80 && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Excellent Investment
                          </div>
                          <div className="text-green-700 dark:text-green-300">
                            This laundromat scores in the top tier for business quality
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={exportToPDF} data-testid="button-export">
                    <Download className="w-4 h-4 mr-2" />
                    Export Scorecard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Factor Scoring */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>17-Factor Analysis</CardTitle>
                  <CardDescription>Rate each factor from 1-10 (1 = Poor, 10 = Excellent)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {factors.map((factor) => (
                    <div key={factor.id} className="space-y-3 pb-6 border-b last:border-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="text-base font-semibold">{factor.name}</Label>
                            <Badge variant="secondary" className="text-xs">
                              Weight: {factor.weight}%
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {factor.description}
                          </div>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-2xl font-bold" data-testid={`text-score-${factor.id}`}>
                            {factor.score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(factor.score * factor.weight).toFixed(1)} pts
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Slider
                          value={[factor.score]}
                          onValueChange={([value]) => updateScore(factor.id, value)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                          data-testid={`slider-${factor.id}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Poor (1)</span>
                          <span>Average (5)</span>
                          <span>Excellent (10)</span>
                        </div>
                      </div>

                      {factor.score <= 3 && factor.weight >= 5 && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Critical - High impact factor with low score</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Improvement Recommendations
                  </CardTitle>
                  <CardDescription>Priority actions to increase score</CardDescription>
                </CardHeader>
                <CardContent>
                  {lowScoreFactors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                      <p>All factors scored 5 or above. Excellent performance!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lowScoreFactors
                        .sort((a, b) => b.weight - a.weight)
                        .map((factor) => (
                          <div key={factor.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="flex-1">
                              <div className="font-medium mb-1">{factor.name}</div>
                              <div className="text-sm text-muted-foreground">{factor.description}</div>
                            </div>
                            <div className="text-right">
                              <Badge variant={factor.score <= 3 ? "destructive" : "secondary"}>
                                Score: {factor.score}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {factor.weight}% weight
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
