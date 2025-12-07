import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, MapPin, Trash2, Search, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ReviewSentiment {
  overallSentiment: "positive" | "mixed" | "negative";
  sentimentScore: number;
  positiveThemes: string[];
  negativeThemes: string[];
  reviewHighlights: { text: string; sentiment: "positive" | "negative" }[];
  strengthsCount: number;
  weaknessesCount: number;
}

export interface SavedAnalysis {
  id: string;
  address: string;
  lat: number;
  lng: number;
  cleanbiScore: number;
  grade: string;
  competitorCount: number;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated" | "oversaturated";
  aerialViewUrl?: string;
  streetViewUrl?: string;
  walkScore?: number;
  walkDescription?: string;
  transitScore?: number | null;
  transitDescription?: string | null;
  bikeScore?: number | null;
  bikeDescription?: string | null;
  timestamp: number;
  sentiment?: ReviewSentiment | null;
}

export interface SavedAddressesPanelProps {
  onSelect: (analysis: SavedAnalysis) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const STORAGE_KEY = "cleanbi_analyses";
const MAX_DISPLAY_COUNT = 10;

const GRADE_COLORS: Record<string, string> = {
  "A": "#22C55E",
  "B": "#A3E635",
  "C": "#FBBF24",
  "Needs Work": "#C8A661"
};

function getStoredAnalyses(): SavedAnalysis[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function deleteAnalysis(id: string): SavedAnalysis[] {
  const analyses = getStoredAnalyses().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  return analyses;
}

function clearAllAnalyses(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

function truncateAddress(address: string, maxLength: number = 40): string {
  if (address.length <= maxLength) return address;
  return address.slice(0, maxLength - 3) + "...";
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGradeColor(grade: string): string {
  return GRADE_COLORS[grade] || GRADE_COLORS["Needs Work"];
}

export function SavedAddressesPanel({ onSelect, isOpen, onToggle }: SavedAddressesPanelProps) {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setAnalyses(getStoredAnalyses());
  }, [isOpen]);

  useEffect(() => {
    const handleStorageChange = () => {
      setAnalyses(getStoredAnalyses());
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredAnalyses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return analyses.slice(0, MAX_DISPLAY_COUNT);
    return analyses
      .filter(a => a.address.toLowerCase().includes(query) || a.grade.toLowerCase().includes(query))
      .slice(0, MAX_DISPLAY_COUNT);
  }, [analyses, searchQuery]);

  const handleSelect = (analysis: SavedAnalysis) => {
    onSelect(analysis);
    toast({
      title: "Analysis Loaded",
      description: `Loaded analysis for ${truncateAddress(analysis.address, 30)}`,
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteAnalysis(id);
    setAnalyses(updated);
    toast({
      title: "Analysis Deleted",
      description: "The saved analysis has been removed.",
    });
  };

  const handleClearAll = () => {
    clearAllAnalyses();
    setAnalyses([]);
    setShowClearConfirm(false);
    toast({
      title: "All Analyses Cleared",
      description: "Your saved analyses history has been cleared.",
    });
  };

  const totalCount = analyses.length;

  return (
    <>
      <Card className="bg-card border shadow-sm overflow-hidden" data-testid="saved-addresses-panel">
        <CardHeader 
          className="p-4 cursor-pointer hover-elevate"
          onClick={onToggle}
          data-testid="panel-header-toggle"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <History className="h-4 w-4 text-[#C8A661]" />
              </div>
              <CardTitle className="text-base font-semibold">Saved Analyses</CardTitle>
              {totalCount > 0 && (
                <Badge 
                  className="bg-[#C8A661] text-[#0A1628] text-xs px-2 py-0.5"
                  data-testid="saved-count-badge"
                >
                  {totalCount}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              data-testid="panel-collapse-button"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-4 pt-0 space-y-3">
                {totalCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search addresses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                        data-testid="search-input"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setSearchQuery("")}
                          data-testid="clear-search-button"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => setShowClearConfirm(true)}
                          data-testid="clear-all-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear all saved analyses</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {filteredAnalyses.length > 0 ? (
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-2 pr-2">
                      {filteredAnalyses.map((analysis) => (
                        <motion.div
                          key={analysis.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="group"
                        >
                          <div
                            className="p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer border border-transparent hover:border-[#C8A661]/30 transition-colors"
                            onClick={() => handleSelect(analysis)}
                            data-testid={`saved-analysis-item-${analysis.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span 
                                    className="text-sm font-medium text-foreground truncate"
                                    title={analysis.address}
                                    data-testid={`address-text-${analysis.id}`}
                                  >
                                    {truncateAddress(analysis.address, 35)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span 
                                    className="font-semibold"
                                    style={{ color: getGradeColor(analysis.grade) }}
                                    data-testid={`grade-badge-${analysis.id}`}
                                  >
                                    Grade {analysis.grade}
                                  </span>
                                  <span data-testid={`score-text-${analysis.id}`}>
                                    Score: {analysis.cleanbiScore}
                                  </span>
                                  <span data-testid={`timestamp-text-${analysis.id}`}>
                                    {formatTimestamp(analysis.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDelete(analysis.id, e)}
                                data-testid={`delete-button-${analysis.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div 
                    className="py-8 text-center"
                    data-testid="empty-state"
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <History className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {searchQuery ? "No matching analyses" : "No saved analyses yet"}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                      {searchQuery 
                        ? "Try a different search term" 
                        : "Run a CLEANBI analysis to save locations for quick access later"}
                    </p>
                  </div>
                )}

                {filteredAnalyses.length > 0 && filteredAnalyses.length < totalCount && !searchQuery && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    Showing {filteredAnalyses.length} of {totalCount} saved analyses
                  </p>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-[400px]" data-testid="clear-all-dialog">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Clear All Analyses?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              This will permanently delete all {totalCount} saved analyses. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowClearConfirm(false)}
              data-testid="cancel-clear-button"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
              data-testid="confirm-clear-button"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
