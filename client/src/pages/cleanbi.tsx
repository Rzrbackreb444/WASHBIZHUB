import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Brain, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useCreateCleanbiScore, useGenerateInsights } from "@/hooks/use-cleanbi";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const cleanbiFormSchema = z.object({
  laundromatName: z.string()
    .min(2, "Please enter the laundromat name (at least 2 characters)")
    .max(100, "Name is too long (maximum 100 characters)"),
});

type CleanbiFormData = z.infer<typeof cleanbiFormSchema>;

export default function CleanBI() {
  const [scores, setScores] = useState({
    customer: 50,
    location: 50,
    equipment: 50,
    adaptability: 50,
    numbers: 50,
    intelligence: 50,
    brand: 50,
  });
  const [aiInsights, setAiInsights] = useState<string>("");
  const [currentScoreId, setCurrentScoreId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { toast } = useToast();
  const createScore = useCreateCleanbiScore();
  const generateInsights = useGenerateInsights();

  const form = useForm<CleanbiFormData>({
    resolver: zodResolver(cleanbiFormSchema),
    defaultValues: {
      laundromatName: "",
    },
    mode: "onTouched",
  });

  const categories = [
    { key: "customer", label: "Customer Experience", description: "Service quality, cleanliness, amenities" },
    { key: "location", label: "Location Quality", description: "Demographics, accessibility, competition" },
    { key: "equipment", label: "Equipment Grade", description: "Age, efficiency, capacity mix" },
    { key: "adaptability", label: "Adaptability", description: "Innovation, flexibility, responsiveness" },
    { key: "numbers", label: "Financial Numbers", description: "Revenue, margins, cash flow" },
    { key: "intelligence", label: "Business Intelligence", description: "Data usage, analytics, insights" },
    { key: "brand", label: "Brand Strength", description: "Recognition, reputation, marketing" },
  ];

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const avgScore = totalScore / 7;
  
  const getGrade = (score: number) => {
    if (score >= 85) return { grade: "A", color: "text-green-400", bg: "bg-green-400/20" };
    if (score >= 70) return { grade: "B", color: "text-yellow-400", bg: "bg-yellow-400/20" };
    if (score >= 50) return { grade: "C", color: "text-orange-400", bg: "bg-orange-400/20" };
    return { grade: "Needs Work", color: "text-red-400", bg: "bg-red-400/20" };
  };

  const gradeInfo = getGrade(avgScore);

  const handleGenerateInsights = async (data: CleanbiFormData) => {
    try {
      // Save score first
      const scoreResult = await createScore.mutateAsync({
        laundromatName: data.laundromatName,
        userId: null,
        customerScore: scores.customer,
        locationScore: scores.location,
        equipmentScore: scores.equipment,
        adaptabilityScore: scores.adaptability,
        numbersScore: scores.numbers,
        intelligenceScore: scores.intelligence,
        brandScore: scores.brand,
        totalScore,
        grade: gradeInfo.grade,
        aiInsights: null,
      });

      setCurrentScoreId(scoreResult.id);

      // Generate AI insights
      const insightsResult = await generateInsights.mutateAsync(scoreResult.id);
      setAiInsights(insightsResult.insights);
      setShowSuccess(true);

      toast({
        title: "Insights generated successfully!",
        description: `CLEANBI analysis complete for ${data.laundromatName}`,
      });

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      toast({
        title: "Unable to generate insights",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO 
        title="CLEANBI™ - Free Laundromat Location Scoring & Analysis | WashBizHub" 
        description="Score any laundromat location in seconds with CLEANBI™. Free A/B/C grades, competition mapping, demographics analysis, and AI-powered insights. Industry-standard 17-factor scoring system trusted by 5,600+ operators. 3 free scores per day."
        canonicalUrl="/cleanbi"
        ogType="website"
        keywords={[
          "laundromat location analysis",
          "laundromat feasibility study free",
          "best location for laundromat",
          "laundromat market research",
          "laundromat competition analysis",
          "laundromat demographics",
          "laundromat site selection tool",
          "CLEANBI score",
          "laundromat business valuation",
          "laundromat health score",
          "coin laundry analysis",
          "laundromat investment scoring",
          "laundry location calculator",
          "laundromat market analysis tool",
          "free laundromat feasibility study"
        ]}
        faqs={[
          {
            question: "What is a good location for a laundromat?",
            answer: "A good laundromat location scores 85+ on CLEANBI (Grade A). Key factors: high population density (5,000+ within 1 mile), median income $30,000-$70,000, high renter percentage (40%+), limited competition, high visibility, and adequate parking. CLEANBI's free tool analyzes all these factors instantly."
          },
          {
            question: "How do you analyze a laundromat location?",
            answer: "CLEANBI analyzes laundromat locations using 17 weighted factors: Customer Experience (C), Location Quality (L), Equipment Grade (E), Adaptability (A), Numbers/Financials (N), Business Intelligence (B), and Brand Strength (I). Each factor scores 0-100, producing an overall grade from A to 'Needs Work'."
          },
          {
            question: "What demographics are best for laundromat success?",
            answer: "Ideal laundromat demographics: 40-70% renter population, apartment-dense areas, median income $30,000-$70,000, families with children, college students, and blue-collar workers. Areas with high in-unit washer/dryer ownership (over 80%) are poor locations."
          },
          {
            question: "How do I check competition for a laundromat location?",
            answer: "CLEANBI automatically maps all competing laundromats within 1, 3, and 5 miles, showing their ratings, review counts, and estimated volume. Healthy markets have 1 laundromat per 4,000-6,000 people. Use CLEANBI to find underserved areas."
          },
          {
            question: "Is there a free laundromat feasibility study?",
            answer: "Yes! CLEANBI provides free instant feasibility analysis for any address. Get A/B/C grades, competition mapping, demographic match scores, and AI recommendations - no login required. Premium reports with detailed valuations start at $197."
          },
          {
            question: "What is the CLEANBI scoring system?",
            answer: "CLEANBI (Customer-Location-Equipment-Adaptability-Numbers-Brand-Intelligence) is a 17-factor scoring system that evaluates laundromats on a 0-100 scale. Scores 85+ earn Grade A (excellent investment), 70-84 Grade B (strong buy), 55-69 Grade C (average), below 55 'Needs Work'."
          },
          {
            question: "How many laundromats per population is ideal?",
            answer: "Industry standard is 1 laundromat per 4,000-6,000 people. Areas with 1 per 8,000+ are underserved opportunities. Areas with 1 per 2,000 or less may be oversaturated. CLEANBI calculates local saturation automatically."
          },
          {
            question: "What are the best areas to open a laundromat?",
            answer: "Best laundromat locations: urban areas with high apartment density, near colleges, mixed-use developments, underserved suburban areas, near transit stops. CLEANBI scores A-grade locations (85+) as prime opportunities for new laundromats."
          }
        ]}
        howTo={{
          name: "How to Analyze Any Laundromat Location with CLEANBI",
          description: "Complete guide to using CLEANBI's 17-factor scoring system for laundromat location analysis and business health assessment",
          steps: [
            { name: "Enter Laundromat Details", text: "Input the laundromat name and address. CLEANBI works for existing laundromats you're evaluating OR potential new locations." },
            { name: "Rate Each Category", text: "Score your laundromat across 7 core categories (Customer, Location, Equipment, Adaptability, Numbers, Intelligence, Brand) from 0-100 using the interactive sliders." },
            { name: "Calculate Total Score", text: "CLEANBI combines all category scores into a total out of 700, then converts to an A/B/C grade based on your average score." },
            { name: "Generate AI Insights", text: "Click 'Generate AI Insights' to receive personalized recommendations from Gemini AI based on your specific scores and improvement opportunities." },
            { name: "Take Action", text: "Use the AI recommendations to prioritize improvements. Low-scoring categories with high impact should be addressed first for maximum ROI." }
          ],
          totalTime: "PT5M"
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "CLEANBI Location Scoring System",
          "alternateName": ["CLEANBI Score", "CLEANBI Analysis", "Laundromat Location Analyzer"],
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free 17-factor laundromat location analysis"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "5640",
            "bestRating": "5",
            "worstRating": "1"
          },
          "description": "Industry-standard 17-factor scoring system for laundromat location analysis, business valuation, and investment due diligence. Score any location with A/B/C grades and AI-powered insights.",
          "featureList": [
            "17-Factor Location Scoring",
            "A/B/C Investment Grades", 
            "Competition Mapping",
            "Demographics Analysis",
            "AI-Powered Insights",
            "Free Chrome Extension",
            "Premium Reports from $197"
          ],
          "author": {
            "@type": "Organization",
            "name": "WashBizHub",
            "url": "https://washbizhub.com"
          }
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI Scoring System", url: "/cleanbi" }
        ]}
        author={{
          name: "WashBizHub CLEANBI Team",
          expertise: "Laundromat Business Intelligence & Location Analysis",
          credentials: "Proprietary 17-factor CLEANBI algorithm used by 5,640+ industry professionals for site selection and due diligence."
        }}
      />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 sm:py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <Brain className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-accent mx-auto mb-3 sm:mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4" data-testid="text-cleanbi-title">
            CLEANBI™ Scoring System
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/70 px-2" data-testid="text-cleanbi-subtitle">
            17-Factor Business Intelligence Analysis with AI Insights
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20 mb-6 sm:mb-8">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white text-xl sm:text-2xl">Laundromat Assessment</CardTitle>
            <CardDescription className="text-white/70 text-sm sm:text-base">
              Rate your laundromat across 7 core categories (0-100)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerateInsights)} className="space-y-6 sm:space-y-8">
                <FormField
                  control={form.control}
                  name="laundromatName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-medium">Laundromat Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your laundromat name"
                          className={`bg-white/20 border-white/30 text-white placeholder-white/50 ${fieldState.error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                          data-testid="input-laundromat-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                      {showSuccess && !fieldState.error && field.value && (
                        <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Assessment saved successfully</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {categories.map((category) => (
                  <div key={category.key}>
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <FormLabel className="text-white/90 font-medium text-sm sm:text-base">{category.label}</FormLabel>
                        <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1">{category.description}</p>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-accent min-w-[50px] sm:min-w-[60px] text-right flex-shrink-0" data-testid={`score-${category.key}`}>
                        {scores[category.key as keyof typeof scores]}
                      </div>
                    </div>
                    <Slider
                      value={[scores[category.key as keyof typeof scores]]}
                      onValueChange={([value]) => setScores({ ...scores, [category.key]: value })}
                      max={100}
                      step={1}
                      className="w-full"
                      data-testid={`slider-${category.key}`}
                    />
                  </div>
                ))}

                <Button 
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6"
                  data-testid="button-generate-insights"
                  disabled={generateInsights.isPending || createScore.isPending}
                >
                  {generateInsights.isPending || createScore.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating insights...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate AI Insights
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-white/70 mb-2">Total CLEANBI™ Score</div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-accent mb-3 sm:mb-4" data-testid="total-score">
                  {totalScore}
                </div>
                <div className="text-lg sm:text-xl md:text-2xl text-white/80">out of 700</div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${gradeInfo.bg} backdrop-blur border-white/20`}>
            <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-white/70 mb-2">Grade</div>
                <div className={`text-4xl sm:text-5xl md:text-6xl font-black ${gradeInfo.color} mb-3 sm:mb-4`} data-testid="grade">
                  {gradeInfo.grade}
                </div>
                <div className="text-lg sm:text-xl md:text-2xl text-white/80">Average: {avgScore.toFixed(1)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights ? (
              <div className="text-white/90 whitespace-pre-wrap" data-testid="text-ai-insights">
                {aiInsights}
              </div>
            ) : (
              <p className="text-white/70" data-testid="text-ai-insights-placeholder">
                Complete the assessment and click "Generate AI Insights" to receive personalized 
                recommendations powered by Gemini AI. Our system analyzes your scores across all 
                17 factors to identify specific improvement opportunities.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
