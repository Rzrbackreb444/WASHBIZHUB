import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, TrendingUp, AlertTriangle, Star, Users, Eye, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

interface CleanbiBreakdownItem {
  score: number;
  data: any;
}

interface CleanbiResult {
  score: number;
  grade: string; // A+, A, A-, B+, B, etc. (residential) or A, B, C, D, F (business)
  confidence: number;
  industry?: string; // Auto-detected industry
  industryDisplay?: string; // Human-readable industry name
  breakdown: any; // Can be business OR residential breakdown
  recommendations: string[];
  warnings?: string[]; // Optional for residential
  dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
  addressType?: 'business' | 'residential'; // NEW: Address type
  rentalPotential?: string; // NEW: For residential properties
}

export default function CleanbiAuto() {
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CleanbiResult | null>(null);
  const { toast } = useToast();

  const handleCalculate = async () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address (business or residential)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/cleanbi/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.trim(),
          businessName: businessName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate score');
      }

      setResult(data);
      toast({
        title: "Success!",
        description: `CLEANBI Score: ${data.score}/100 (Grade: ${data.grade})`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate CLEANBI score",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    // Handle business (A, B, C, Needs Work) and residential (A+, A-, B+, B-, C+, C-, Needs Work) grades
    const baseGrade = grade.charAt(0).toUpperCase();
    switch (baseGrade) {
      case 'A': return 'text-green-600 dark:text-green-400';
      case 'B': return 'text-blue-600 dark:text-blue-400';
      case 'C': return 'text-yellow-600 dark:text-yellow-400';
      case 'N': return 'text-orange-600 dark:text-orange-400'; // "Needs Work"
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getGradeDescription = (grade: string) => {
    // Handle business (A, B, C, Needs Work) and residential (A+, A-, B+, B-, C+, C-, Needs Work) grades
    const baseGrade = grade.charAt(0).toUpperCase();
    switch (baseGrade) {
      case 'A': return 'Excellent Investment Opportunity';
      case 'B': return 'Strong Buy - Above Average';
      case 'C': return 'Average - Due Diligence Required';
      case 'N': return 'Opportunity for Improvement - Turnaround Potential'; // "Needs Work"
      default: return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>Google-Powered CLEANBI™ Score | Score ANY Address GLOBALLY - Business OR Residential</title>
        <meta name="description" content="Get instant CLEANBI scores for ANY address in 220+ countries - commercial businesses AND residential properties worldwide. Restaurants, retail, homes, condos, investment properties in USA, Philippines, Japan, Australia, UK, EU, Asia, Africa. 100% automatic, 100% free. For informational purposes only." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent">
              Powered by Google APIs
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Score ANY Address GLOBALLY: Business OR Residential
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Get comprehensive intelligence in seconds for <span className="font-bold text-purple-100">ANY address worldwide</span> - commercial businesses AND residential properties in <span className="font-bold text-purple-100">220+ countries</span>. Just enter an address - our Google-powered engine does the rest.
            </p>
            <p className="text-sm text-purple-300 max-w-2xl mx-auto mt-2">
              <span className="font-semibold text-purple-100">Businesses:</span> Restaurants • Retail • Gyms • Salons • Car Washes • Laundromats • Gas Stations • Hotels • Any Business Type<br/>
              <span className="font-semibold text-purple-100">Properties:</span> Single-Family Homes • Condos • Townhouses • Investment Properties • Rental Properties<br/>
              <span className="font-semibold text-purple-100">Global Coverage:</span> USA • Philippines • Japan • Australia • UK • EU • Asia • Africa • Americas • 220+ Countries
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>No Login Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Real-Time Data</span>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Calculate CLEANBI Score</CardTitle>
              <CardDescription>Enter ANY address - business OR residential - and we'll analyze it using Google data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP (Business OR Residential)"
                  data-testid="input-address"
                  className="text-base"
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCalculate()}
                />
                <p className="text-xs text-muted-foreground">
                  Works for commercial businesses AND residential properties
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name (Optional - For Businesses Only)</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Joe's Coffee Shop"
                  data-testid="input-business-name"
                  className="text-base"
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCalculate()}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to automatically detect the business, or skip for residential properties
                </p>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full"
                size="lg"
                data-testid="button-calculate"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with Google APIs...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Calculate CLEANBI Score
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Legal Disclaimer */}
          <div className="mb-8">
            <LegalDisclaimer />
          </div>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Overview */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CLEANBI Score</CardTitle>
                    <CardDescription>
                      {result.industryDisplay ? `${result.industryDisplay} Analysis` : 'Overall Rating'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getGradeColor(result.grade)} mb-2`} data-testid="text-grade">
                        {result.grade}
                      </div>
                      <div className="text-3xl font-bold mb-1" data-testid="text-score">
                        {result.score}/100
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {getGradeDescription(result.grade)}
                      </div>
                      <Progress value={result.score} className="h-3" data-testid="progress-overall-score" />
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      {result.industryDisplay && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Industry</span>
                          <Badge variant="secondary" className="capitalize">{result.industryDisplay}</Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-bold">{result.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Quality</span>
                        <Badge variant="outline" className="capitalize">{result.dataQuality}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Rental Potential (Residential Only) */}
                {result.addressType === 'residential' && result.rentalPotential && (
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-green-600 dark:text-green-400">
                        Rental Potential
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="capitalize text-lg px-4 py-2">
                        {result.rentalPotential}
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Score Breakdown</CardTitle>
                    <CardDescription>
                      {result.addressType === 'residential' ? 'Investment Analysis' : 'Powered by Google Places API'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* BUSINESS BREAKDOWN */}
                    {result.addressType !== 'residential' && result.breakdown.footTraffic && (
                      <>
                        {/* Foot Traffic */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Foot Traffic</span>
                            </div>
                            <Badge>{result.breakdown.footTraffic.score}/30</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.footTraffic.data.description}
                          </p>
                          <Progress value={(result.breakdown.footTraffic.score / 30) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Competition */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Competition</span>
                            </div>
                            <Badge>{result.breakdown.competition.score}/20</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.competition.data.competitorCount} competitors within 5 miles
                          </p>
                          <Progress value={(result.breakdown.competition.score / 20) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Reviews */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Customer Reviews</span>
                            </div>
                            <Badge>{result.breakdown.reviews.score}/25</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.reviews.data.rating}/5 stars · {result.breakdown.reviews.data.totalReviews} reviews
                          </p>
                          <Progress value={(result.breakdown.reviews.score / 25) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Location */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Location Quality</span>
                            </div>
                            <Badge>{result.breakdown.location.score}/15</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.location.data.address}
                          </p>
                          <Progress value={(result.breakdown.location.score / 15) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Visibility */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Online Visibility</span>
                            </div>
                            <Badge>{result.breakdown.visibility.score}/10</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.visibility.data.photoCount} photos · {result.breakdown.visibility.data.businessStatus}
                          </p>
                          <Progress value={(result.breakdown.visibility.score / 10) * 100} className="h-2" />
                        </div>
                      </>
                    )}

                    {/* RESIDENTIAL BREAKDOWN */}
                    {result.addressType === 'residential' && result.breakdown.propertyValueTrend && (
                      <>
                        {/* Property Value Trend */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Property Value Trend</span>
                            </div>
                            <Badge>{result.breakdown.propertyValueTrend.score}/30</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Appreciation potential based on location characteristics
                          </p>
                          <Progress value={(result.breakdown.propertyValueTrend.score / 30) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Neighborhood Quality */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Neighborhood Quality</span>
                            </div>
                            <Badge>{result.breakdown.neighborhoodQuality.score}/25</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Based on area characteristics and amenities
                          </p>
                          <Progress value={(result.breakdown.neighborhoodQuality.score / 25) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* School Rating */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">School Ratings</span>
                            </div>
                            <Badge>{result.breakdown.schoolRating.score}/20</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.schoolRating.data.schools?.length || 0} nearby schools
                          </p>
                          <Progress value={(result.breakdown.schoolRating.score / 20) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Crime Score */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Safety Score</span>
                            </div>
                            <Badge>{result.breakdown.crimeScore.score}/15</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Higher score indicates safer neighborhood
                          </p>
                          <Progress value={(result.breakdown.crimeScore.score / 15) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Walkability */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Walkability</span>
                            </div>
                            <Badge>{result.breakdown.walkability.score}/10</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Urban accessibility and pedestrian-friendliness
                          </p>
                          <Progress value={(result.breakdown.walkability.score / 10) * 100} className="h-2" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Recommendations
                      </CardTitle>
                      <CardDescription>Actions to improve score</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* CTA for Full Report */}
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold">Want the Full Intelligence Report?</h3>
                      <p className="text-muted-foreground">
                        {result.addressType === 'residential' 
                          ? 'Get comprehensive property analysis, neighborhood insights, and investment potential assessment'
                          : 'Get comprehensive market analysis, financial projections, and personalized acquisition strategy'}
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button size="lg" className="bg-accent hover:bg-accent/90" data-testid="button-get-report">
                          Get Full CLEANBI Report - $97
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Available for businesses and residential properties
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
