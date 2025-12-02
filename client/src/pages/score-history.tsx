import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, TrendingUp, Clock, Star, Search, 
  Download, Trash2, Eye, Filter, Calendar,
  ChevronRight, ArrowUpRight, BarChart3, Target,
  Sparkles, Crown, Zap, History, FileText
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getGradeInfo, getGradeColor } from "@shared/cleanbi-grades";

interface SavedScore {
  id: string;
  address: string;
  businessName?: string;
  score: number;
  grade: string;
  confidence: number;
  industry?: string;
  breakdown: any;
  createdAt: string;
  isFavorite?: boolean;
}

interface ScoreHistoryResponse {
  scores: SavedScore[];
  total: number;
  streak: number;
  totalAnalyses: number;
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "CLEANBI Score History - Track Your Property Analyses",
  "description": "View and compare all your CLEANBI property and business analyses. Track trends, download PDF reports, and make data-driven investment decisions.",
  "url": "https://washbizhub.com/score-history"
};

export default function ScoreHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<ScoreHistoryResponse>({
    queryKey: ['/api/cleanbi/history'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (scoreId: string) => {
      return apiRequest(`/api/cleanbi/history/${scoreId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cleanbi/history'] });
      toast({
        title: "Analysis removed",
        description: "The score has been removed from your history.",
      });
    },
  });

  const scores = data?.scores || [];
  const filteredScores = scores.filter(score => {
    const matchesSearch = !searchQuery || 
      score.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = !gradeFilter || score.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const gradeDistribution = scores.reduce((acc, score) => {
    acc[score.grade] = (acc[score.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0;

  return (
    <>
      <SEO
        title="CLEANBI Score History | Track Your Property Analyses | WashBizHub"
        description="View and compare all your CLEANBI property and business location analyses. Track scoring trends, download professional PDF reports, and make data-driven investment decisions."
        canonicalUrl="/score-history"
        ogType="website"
        keywords={[
          "cleanbi score history",
          "property analysis tracker",
          "laundromat location scores",
          "business location analysis history",
          "investment property tracking"
        ]}
        structuredData={[structuredData]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-8 h-8 text-gold-400" />
              <h1 className="text-4xl font-black text-white" data-testid="text-page-title">
                Score History
              </h1>
            </div>
            <p className="text-white/70 text-lg">
              Track, compare, and analyze all your CLEANBI property scores
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Total Analyses</span>
                  <BarChart3 className="w-5 h-5 text-gold-400" />
                </div>
                <div className="text-3xl font-black text-white" data-testid="text-total-analyses">
                  {data?.totalAnalyses || scores.length}
                </div>
                <p className="text-white/50 text-xs mt-1">Lifetime scores</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Average Score</span>
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white" data-testid="text-avg-score">
                  {averageScore}
                </div>
                <Progress value={averageScore} className="h-1.5 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Current Streak</span>
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white" data-testid="text-streak">
                  {data?.streak || 0}
                  <span className="text-lg text-white/50 ml-1">days</span>
                </div>
                <p className="text-amber-400/80 text-xs mt-1">Keep analyzing daily!</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gold-500/20 to-amber-500/20 backdrop-blur-xl border-gold-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Grade Distribution</span>
                  <Crown className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['A', 'B', 'C', 'Needs Work'].map(grade => {
                    const info = getGradeInfo(grade === 'A' ? 90 : grade === 'B' ? 75 : grade === 'C' ? 60 : 40);
                    return (
                      <Badge 
                        key={grade}
                        style={{ backgroundColor: `${info.color}20`, color: info.color, borderColor: `${info.color}40` }}
                        className="text-xs"
                        data-testid={`badge-grade-${grade.toLowerCase().replace(' ', '-')}`}
                      >
                        {grade}: {gradeDistribution[grade] || 0}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    placeholder="Search addresses or business names..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    data-testid="input-search"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={gradeFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGradeFilter(null)}
                    className={gradeFilter === null ? "bg-gold-500 text-black" : "border-white/20 text-white"}
                    data-testid="button-filter-all"
                  >
                    All
                  </Button>
                  {['A', 'B', 'C', 'Needs Work'].map(grade => (
                    <Button
                      key={grade}
                      variant={gradeFilter === grade ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGradeFilter(grade)}
                      className={gradeFilter === grade ? "bg-gold-500 text-black" : "border-white/20 text-white"}
                      data-testid={`button-filter-${grade.toLowerCase().replace(' ', '-')}`}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-white/10 backdrop-blur-xl border-white/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-white/10 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded mb-2 w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredScores.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-12 text-center">
                <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {scores.length === 0 ? "No analyses yet" : "No matching results"}
                </h3>
                <p className="text-white/60 mb-6">
                  {scores.length === 0 
                    ? "Start analyzing properties to build your score history"
                    : "Try adjusting your search or filters"}
                </p>
                {scores.length === 0 && (
                  <Link href="/cleanbi-auto">
                    <Button className="bg-gold-500 hover:bg-gold-600 text-black font-bold" data-testid="button-start-analyzing">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Analyzing
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScores.map((score) => {
                const gradeInfo = getGradeInfo(score.score);
                const date = new Date(score.createdAt);
                
                return (
                  <Card 
                    key={score.id} 
                    className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all group"
                    data-testid={`card-score-${score.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          {score.businessName && (
                            <h3 className="font-bold text-white truncate mb-1" data-testid={`text-business-${score.id}`}>
                              {score.businessName}
                            </h3>
                          )}
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate" data-testid={`text-address-${score.id}`}>{score.address}</span>
                          </div>
                        </div>
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ml-3"
                          style={{ backgroundColor: `${gradeInfo.color}20` }}
                        >
                          <span 
                            className="text-xl font-black"
                            style={{ color: gradeInfo.color }}
                            data-testid={`text-grade-${score.id}`}
                          >
                            {score.grade === 'Needs Work' ? 'NW' : score.grade}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <div className="text-2xl font-black text-white" data-testid={`text-score-${score.id}`}>
                            {score.score}
                          </div>
                          <div className="text-xs text-white/50">Score</div>
                        </div>
                        <Separator orientation="vertical" className="h-8 bg-white/20" />
                        <div>
                          <div className="text-lg font-bold text-white/80">
                            {score.confidence}%
                          </div>
                          <div className="text-xs text-white/50">Confidence</div>
                        </div>
                        {score.industry && (
                          <>
                            <Separator orientation="vertical" className="h-8 bg-white/20" />
                            <div>
                              <Badge className="bg-white/10 text-white/80 text-xs border-white/20">
                                {score.industry}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/cleanbi-auto?address=${encodeURIComponent(score.address)}`}>
                            <Button size="sm" variant="ghost" className="text-white/70 hover:text-white h-8 w-8 p-0" data-testid={`button-view-${score.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white/70 hover:text-white h-8 w-8 p-0"
                            data-testid={`button-download-${score.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-400/70 hover:text-red-400 h-8 w-8 p-0"
                            onClick={() => deleteMutation.mutate(score.id)}
                            data-testid={`button-delete-${score.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="bg-gradient-to-r from-gold-500/20 to-amber-500/20 backdrop-blur-xl border-gold-400/30 mt-12">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Want Professional PDF Reports?
                  </h3>
                  <p className="text-white/70">
                    Get detailed analysis reports with Vision AI, competitor mapping, and expert recommendations.
                  </p>
                </div>
                <Link href="/cleanbi-reports">
                  <Button className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8" data-testid="button-get-reports">
                    <FileText className="w-4 h-4 mr-2" />
                    Get PDF Reports
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
