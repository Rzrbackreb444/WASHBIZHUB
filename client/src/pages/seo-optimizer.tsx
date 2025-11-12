import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, Target, Globe, BarChart3, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SeoKeyword {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: string;
  ranking: number | null;
  targetUrl: string | null;
}

interface CompetitorAnalysis {
  id: string;
  competitorDomain: string;
  targetKeywords: string[];
  backlinks: number;
  domainAuthority: number;
  topPages: string[];
  lastAnalyzed: string;
}

export default function SEOOptimizer() {
  const { toast } = useToast();
  const [showKeywordDialog, setShowKeywordDialog] = useState(false);
  const [showCompetitorDialog, setShowCompetitorDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: "",
    searchVolume: 0,
    difficulty: 0,
    cpc: 0,
  });
  const [newCompetitor, setNewCompetitor] = useState({
    domain: "",
    keywords: "",
  });

  const userId = "user-123";

  // Fetch keywords
  const { data: keywords = [], isLoading: keywordsLoading } = useQuery<SeoKeyword[]>({
    queryKey: ["/api/seo-keywords"],
  });

  // Fetch competitor analysis
  const { data: competitors = [], isLoading: competitorsLoading } = useQuery<CompetitorAnalysis[]>({
    queryKey: ["/api/competitor-analysis"],
  });

  const addKeywordMutation = useMutation({
    mutationFn: async (data: typeof newKeyword) => {
      const response = await apiRequest("/api/seo-keywords", {
        method: "POST",
        body: JSON.stringify({
          userId,
          keyword: data.keyword,
          searchVolume: data.searchVolume,
          difficulty: data.difficulty,
          cpc: data.cpc,
          trend: "stable",
          ranking: null,
          targetUrl: null,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo-keywords"] });
      setShowKeywordDialog(false);
      setNewKeyword({ keyword: "", searchVolume: 0, difficulty: 0, cpc: 0 });
      toast({
        title: "Keyword Added",
        description: "SEO keyword has been added to tracking",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCompetitorMutation = useMutation({
    mutationFn: async (data: typeof newCompetitor) => {
      const response = await apiRequest("/api/competitor-analysis", {
        method: "POST",
        body: JSON.stringify({
          userId,
          competitorDomain: data.domain,
          targetKeywords: data.keywords.split(",").map(k => k.trim()).filter(Boolean),
          backlinks: 0,
          domainAuthority: 0,
          topPages: [],
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-analysis"] });
      setShowCompetitorDialog(false);
      setNewCompetitor({ domain: "", keywords: "" });
      toast({
        title: "Competitor Added",
        description: "Competitor analysis has been initiated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/seo-keywords/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo-keywords"] });
      toast({
        title: "Keyword Removed",
        description: "Keyword has been removed from tracking",
      });
    },
  });

  const deleteCompetitorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/competitor-analysis/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitor-analysis"] });
      toast({
        title: "Competitor Removed",
        description: "Competitor analysis has been removed",
      });
    },
  });

  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty >= 70) return <Badge variant="destructive">Hard</Badge>;
    if (difficulty >= 40) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="default">Easy</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="text-page-title">
            SEO Optimizer
          </h1>
          <p className="text-xl text-green-200">
            Advanced keyword research, competitor analysis, and SERP tracking
          </p>
        </div>

        <Tabs defaultValue="keywords" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="keywords" data-testid="tab-keywords">
              <Search className="w-4 h-4 mr-2" />
              Keyword Research
            </TabsTrigger>
            <TabsTrigger value="competitors" data-testid="tab-competitors">
              <Target className="w-4 h-4 mr-2" />
              Competitor Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Tracked Keywords</h2>
              <Button onClick={() => setShowKeywordDialog(true)} data-testid="button-add-keyword">
                <Plus className="w-4 h-4 mr-2" />
                Add Keyword
              </Button>
            </div>

            {keywordsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : keywords.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No keywords tracked yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add keywords to start tracking your SEO performance
                  </p>
                  <Button onClick={() => setShowKeywordDialog(true)} data-testid="button-add-first-keyword">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Keyword
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keywords.map((keyword) => (
                  <Card key={keyword.id} className="hover-elevate" data-testid={`card-keyword-${keyword.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-1">{keyword.keyword}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteKeywordMutation.mutate(keyword.id)}
                          data-testid={`button-delete-keyword-${keyword.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Search Volume</span>
                        <span className="font-semibold">{keyword.searchVolume.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Difficulty</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{keyword.difficulty}</span>
                          {getDifficultyBadge(keyword.difficulty)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">CPC</span>
                        <span className="font-semibold">${keyword.cpc.toFixed(2)}</span>
                      </div>

                      {keyword.ranking && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Rank</span>
                          <Badge variant="default">#{keyword.ranking}</Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        {keyword.trend}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Competitor Analysis</h2>
              <Button onClick={() => setShowCompetitorDialog(true)} data-testid="button-add-competitor">
                <Plus className="w-4 h-4 mr-2" />
                Add Competitor
              </Button>
            </div>

            {competitorsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : competitors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No competitors tracked yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add competitors to analyze their SEO strategy
                  </p>
                  <Button onClick={() => setShowCompetitorDialog(true)} data-testid="button-add-first-competitor">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Competitor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {competitors.map((competitor) => (
                  <Card key={competitor.id} className="hover-elevate" data-testid={`card-competitor-${competitor.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{competitor.competitorDomain}</span>
                          </CardTitle>
                          <CardDescription>
                            Last analyzed: {new Date(competitor.lastAnalyzed).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCompetitorMutation.mutate(competitor.id)}
                          data-testid={`button-delete-competitor-${competitor.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Domain Authority</div>
                          <div className="text-2xl font-bold">{competitor.domainAuthority}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Backlinks</div>
                          <div className="text-2xl font-bold">{competitor.backlinks.toLocaleString()}</div>
                        </div>
                      </div>

                      {competitor.targetKeywords.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Target Keywords</div>
                          <div className="flex flex-wrap gap-1">
                            {competitor.targetKeywords.slice(0, 5).map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {competitor.targetKeywords.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{competitor.targetKeywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {competitor.topPages.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Top Pages</div>
                          <div className="space-y-1">
                            {competitor.topPages.slice(0, 3).map((page, idx) => (
                              <div key={idx} className="text-xs truncate text-muted-foreground">
                                {page}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      <Button variant="outline" className="w-full" data-testid={`button-refresh-${competitor.id}`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Refresh Analysis
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Keyword Dialog */}
        <Dialog open={showKeywordDialog} onOpenChange={setShowKeywordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add SEO Keyword</DialogTitle>
              <DialogDescription>
                Track a new keyword for SEO analysis and ranking
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="e.g., laundromat equipment"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                  data-testid="input-keyword"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Search Volume</Label>
                  <Input
                    id="volume"
                    type="number"
                    min="0"
                    value={newKeyword.searchVolume}
                    onChange={(e) => setNewKeyword({ ...newKeyword, searchVolume: parseInt(e.target.value) || 0 })}
                    data-testid="input-volume"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty (0-100)</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    min="0"
                    max="100"
                    value={newKeyword.difficulty}
                    onChange={(e) => setNewKeyword({ ...newKeyword, difficulty: parseInt(e.target.value) || 0 })}
                    data-testid="input-difficulty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpc">CPC ($)</Label>
                  <Input
                    id="cpc"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newKeyword.cpc}
                    onChange={(e) => setNewKeyword({ ...newKeyword, cpc: parseFloat(e.target.value) || 0 })}
                    data-testid="input-cpc"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowKeywordDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => addKeywordMutation.mutate(newKeyword)}
                disabled={!newKeyword.keyword || addKeywordMutation.isPending}
                data-testid="button-submit-keyword"
              >
                Add Keyword
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Competitor Dialog */}
        <Dialog open={showCompetitorDialog} onOpenChange={setShowCompetitorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Competitor</DialogTitle>
              <DialogDescription>
                Analyze a competitor's SEO strategy and performance
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Competitor Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g., laundromatresource.com"
                  value={newCompetitor.domain}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, domain: e.target.value })}
                  data-testid="input-domain"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., laundromat, coin laundry, wash and fold"
                  value={newCompetitor.keywords}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, keywords: e.target.value })}
                  data-testid="input-competitor-keywords"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompetitorDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => addCompetitorMutation.mutate(newCompetitor)}
                disabled={!newCompetitor.domain || addCompetitorMutation.isPending}
                data-testid="button-submit-competitor"
              >
                Add Competitor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
