import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { useCreateCleanbiScore, useGenerateInsights } from "@/hooks/use-cleanbi";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function CleanBI() {
  const [laundromatName, setLaundromatName] = useState("");
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

  const { toast } = useToast();
  const createScore = useCreateCleanbiScore();
  const generateInsights = useGenerateInsights();

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

  const seoKeywords = [
    "CLEANBI score",
    "laundromat business valuation",
    "laundromat health score",
    "business scoring system",
    "laundromat analysis tool"
  ];

  const handleGenerateInsights = async () => {
    if (!laundromatName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a laundromat name",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save score first
      const scoreResult = await createScore.mutateAsync({
        laundromatName,
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

      toast({
        title: "Success!",
        description: "AI insights generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO 
        title="CLEANBI™ Score | Laundromat Business Health Assessment" 
        description="Evaluate your laundromat's business health using CLEANBI™ - the industry-standard 17-factor scoring system. Get AI-powered insights on customer experience, location quality, equipment, adaptability, financial metrics, business intelligence, and brand strength."
        canonicalUrl="/cleanbi"
        keywords={seoKeywords}
        ogType="website"
      />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Brain className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-cleanbi-title">
            CLEANBI™ Scoring System
          </h1>
          <p className="text-xl text-white/70" data-testid="text-cleanbi-subtitle">
            17-Factor Business Intelligence Analysis with AI Insights
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Laundromat Assessment</CardTitle>
            <CardDescription className="text-white/70">
              Rate your laundromat across 7 core categories (0-100)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <Label htmlFor="name" className="text-white/90 font-medium">Laundromat Name</Label>
              <Input
                id="name"
                value={laundromatName}
                onChange={(e) => setLaundromatName(e.target.value)}
                placeholder="Enter your laundromat name"
                className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                data-testid="input-laundromat-name"
              />
            </div>

            {categories.map((category) => (
              <div key={category.key}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Label className="text-white/90 font-medium text-base">{category.label}</Label>
                    <p className="text-sm text-white/60 mt-1">{category.description}</p>
                  </div>
                  <div className="text-2xl font-black text-accent min-w-[60px] text-right" data-testid={`score-${category.key}`}>
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
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6"
              data-testid="button-generate-insights"
              onClick={handleGenerateInsights}
              disabled={generateInsights.isPending || createScore.isPending}
            >
              {generateInsights.isPending || createScore.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="text-sm text-white/70 mb-2">Total CLEANBI™ Score</div>
                <div className="text-6xl font-black text-accent mb-4" data-testid="total-score">
                  {totalScore}
                </div>
                <div className="text-2xl text-white/80">out of 700</div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${gradeInfo.bg} backdrop-blur border-white/20`}>
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="text-sm text-white/70 mb-2">Grade</div>
                <div className={`text-6xl font-black ${gradeInfo.color} mb-4`} data-testid="grade">
                  {gradeInfo.grade}
                </div>
                <div className="text-2xl text-white/80">Average: {avgScore.toFixed(1)}</div>
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
