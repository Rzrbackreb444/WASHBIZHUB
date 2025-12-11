import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Calculator,
  Brain,
  MapPin,
  FileText,
  ArrowLeft,
  BarChart3,
  Calendar,
  Layers,
} from "lucide-react";
import { Link } from "wouter";
import { SavedAnalysesList } from "@/components/SavedAnalysesList";
import { useAuth } from "@/hooks/useAuth";
import type { SavedAnalysis } from "@shared/schema";

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  "valuation-calculator": "Valuation Calculator",
  "roi-calculator": "ROI Calculator",
  "cleanbi-score": "CleanBI Score",
  "location-analysis": "Location Analysis",
  "ai-consultant": "AI Consultant",
  "service-guy-ai": "Service Guy AI",
  "utility-analysis": "Utility Analysis",
};

export default function SavedAnalysesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);

  const { data: stats } = useQuery<{
    analyses: SavedAnalysis[];
    pagination: { total: number };
  }>({
    queryKey: ["/api/analyses"],
    enabled: !!user,
  });

  const { data: types } = useQuery<string[]>({
    queryKey: ["/api/analyses/types"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C8A661] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view and manage your saved analyses.
          </p>
          <Button asChild className="bg-[#0A1628] hover:bg-[#1a3a5c]">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const typeStats = types?.reduce((acc, type) => {
    const count = stats?.analyses.filter((a) => a.analysisType === type).length || 0;
    acc[type] = count;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <>
      <Helmet>
        <title>Saved Analyses | WashBizHub</title>
        <meta
          name="description"
          content="Access all your saved calculator results and AI analyses in one place."
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="bg-[#0A1628] text-white py-12">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-[#C8A661]/20 flex items-center justify-center">
                <FolderOpen className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Saved Analyses</h1>
                <p className="text-gray-300 mt-1">
                  Access all your saved calculator results and AI insights
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card data-testid="stat-total-analyses">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Layers className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">
                      {stats?.pagination.total || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-total-types">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">
                      {types?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Analysis Types</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-calculators">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">
                      {(typeStats["valuation-calculator"] || 0) + (typeStats["roi-calculator"] || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Calculator</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="stat-ai-analyses">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Brain className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#C8A661]">
                      {(typeStats["ai-consultant"] || 0) + (typeStats["service-guy-ai"] || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">AI Analyses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-card border" data-testid="tabs-analysis-types">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="calculators">Calculators</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="ai">AI Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <SavedAnalysesList onViewAnalysis={setSelectedAnalysis} />
            </TabsContent>

            <TabsContent value="calculators">
              <SavedAnalysesList onViewAnalysis={setSelectedAnalysis} />
            </TabsContent>

            <TabsContent value="location">
              <SavedAnalysesList onViewAnalysis={setSelectedAnalysis} />
            </TabsContent>

            <TabsContent value="ai">
              <SavedAnalysesList onViewAnalysis={setSelectedAnalysis} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={selectedAnalysis !== null} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-view-analysis">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C8A661]" />
              {selectedAnalysis?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {ANALYSIS_TYPE_LABELS[selectedAnalysis.analysisType] || selectedAnalysis.analysisType}
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(selectedAnalysis.createdAt), "PPP 'at' p")}
                </div>
              </div>

              {selectedAnalysis.notes && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedAnalysis.notes}</p>
                </div>
              )}

              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">Analysis Data</h4>
                <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto">
                  {JSON.stringify(selectedAnalysis.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
