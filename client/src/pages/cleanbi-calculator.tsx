import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/AuthGuard";
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
import { getGradeInfo } from "@shared/cleanbi-grades";

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
  
  // Use canonical CLEANBI grading: A (85+), B (70-84), C (55-69), Needs Work (<55)
  // Uses shared grading from @shared/cleanbi-grades
  const grade = useMemo(() => {
    const gradeInfo = getGradeInfo(percentageScore);
    return {
      letter: gradeInfo.grade,
      color: gradeInfo.grade === 'A' ? 'text-green-600' : 
             gradeInfo.grade === 'B' ? 'text-lime-600' : 
             gradeInfo.grade === 'C' ? 'text-amber-600' : 'text-yellow-700',
      description: gradeInfo.opportunity
    };
  }, [percentageScore]);

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
    <AuthGuard title="Sign In to Use CLEANBI Calculator" description="Sign in to access this calculator and track your usage.">
      <SEO
        title="CLEANBI™ Calculator - Free 17-Factor Laundromat Viability Score | WashBizHub"
        description="Calculate laundromat location viability with CLEANBI's free 17-factor scorecard. Evaluate location quality, revenue potential, equipment condition, lease terms, competition, and 12 more critical factors. Get instant A/B/C grades for investment decisions."
        canonicalUrl="/cleanbi-calculator"
        keywords={[
          "laundromat location analysis",
          "laundromat feasibility study free",
          "best location for laundromat",
          "laundromat market research",
          "laundromat competition analysis",
          "laundromat demographics",
          "laundromat site selection",
          "laundromat scorecard",
          "CLEANBI business intelligence",
          "laundromat valuation calculator",
          "laundry business viability tool",
          "laundromat investment scoring",
          "17 factor laundromat analysis",
          "laundromat due diligence checklist",
          "coin laundry location calculator"
        ]}
        faqs={[
          {
            question: "What is a good location for a laundromat?",
            answer: "A good laundromat location scores 85%+ on the CLEANBI 17-factor scorecard (Grade A). Key high-weight factors: Location Quality (15%), Revenue Performance (12%), Equipment Condition (10%), and Lease Terms (8%). Use this calculator to evaluate any potential site."
          },
          {
            question: "How do you calculate laundromat location viability?",
            answer: "The CLEANBI calculator scores 17 weighted factors on a 1-10 scale: Location Quality (15%), Revenue (12%), Equipment (10%), Lease (8%), Competition (7%), Parking (6%), Cleanliness (6%), Utilities (6%), Security (5%), Hours (5%), Services (5%), Branding (4%), Technology (4%), Staffing (3%), Maintenance (2%), Growth (1%), Financials (1%). Total weighted score determines the final grade."
          },
          {
            question: "What demographics are best for laundromat success?",
            answer: "Ideal demographics for laundromats: 40-70% renter population, median income $30K-$70K, apartment-dense areas, families with children, college students, blue-collar workers. Score these in the 'Location Quality' factor which carries 15% weight in CLEANBI."
          },
          {
            question: "How do I evaluate laundromat competition?",
            answer: "Competition Level (7% weight) evaluates: number of laundromats within 1-3 miles, market saturation, competitor ratings/reviews, price positioning. Score 8-10 for underserved areas (<3 competitors in 3mi), 5-7 for moderate competition, 1-4 for oversaturated markets."
          },
          {
            question: "Is this laundromat feasibility calculator free?",
            answer: "Yes! The CLEANBI 17-factor calculator is 100% free with no login required. Export your scorecard as JSON for records. For premium features including AI analysis, valuation estimates, and professional reports, upgrade to CLEANBI Pro."
          },
          {
            question: "What are critical factors in laundromat site selection?",
            answer: "The 5 highest-weight factors in CLEANBI: 1) Location Quality (15%) - demographics, foot traffic, visibility; 2) Revenue Performance (12%) - historical income and growth; 3) Equipment Condition (10%) - age, efficiency, maintenance; 4) Lease Terms (8%) - length, rate, escalations; 5) Competition Level (7%) - market saturation."
          },
          {
            question: "How many laundromats per population is too many?",
            answer: "Industry benchmark: 1 laundromat per 4,000-6,000 people is healthy. Score Competition as 8-10 if ratio is 1:8,000+ (underserved), 5-7 for 1:4,000-8,000 (healthy), 3-4 for 1:2,000-4,000 (competitive), 1-2 for 1:2,000 or less (oversaturated)."
          },
          {
            question: "What CLEANBI score is needed for a good investment?",
            answer: "CLEANBI Grade A (85%+): Excellent investment opportunity - minimal risk. Grade B (70-84%): Strong buy - above average potential. Grade C (55-69%): Average - requires due diligence and improvement plan. Below 55%: Needs significant work or turnaround strategy."
          }
        ]}
        howTo={{
          name: "How to Calculate Laundromat Location Viability with CLEANBI",
          description: "Complete guide to using the 17-factor CLEANBI scorecard for laundromat investment analysis and due diligence",
          steps: [
            { name: "Review All 17 Factors", text: "Examine each factor in the scorecard: Location, Revenue, Equipment, Lease, Competition, Parking, Cleanliness, Utilities, Security, Hours, Services, Branding, Technology, Staffing, Maintenance, Growth Potential, and Financial Transparency." },
            { name: "Score Each Factor 1-10", text: "Use the sliders to rate each factor from 1 (Poor) to 10 (Excellent). Be honest - inflated scores lead to poor investment decisions. Focus on high-weight factors first." },
            { name: "Review Critical Issues", text: "Check for red flags: any high-weight factor (5%+) scored 3 or below triggers a 'Critical Issue' warning. These dealbreakers must be addressed." },
            { name: "Analyze Your Grade", text: "Your weighted score converts to a letter grade: A (85%+), B (70-84%), C (55-69%), or 'Needs Work' (<55%). Grade A locations are prime investments." },
            { name: "Export and Take Action", text: "Click 'Export Scorecard' to save your analysis. Use recommendations to negotiate purchase price, plan improvements, or identify better locations." }
          ],
          totalTime: "PT10M"
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "17-Factor Calculator", url: "/cleanbi-calculator" }
        ]}
        author={{
          name: "WashBizHub CLEANBI Team",
          expertise: "Laundromat Business Intelligence & Investment Analysis",
          credentials: "Proprietary 17-factor weighted scoring system used by 5,640+ laundromat professionals for site selection and due diligence."
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

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-cleanbi-title">
              CLEANBI 2.0 Scorecard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-cleanbi-description">
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

                  {percentageScore >= 85 && (
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
    </AuthGuard>
  );
}
