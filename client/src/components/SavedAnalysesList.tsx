import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Download,
  Calculator,
  Brain,
  MapPin,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedAnalysis } from "@shared/schema";

interface SavedAnalysesListProps {
  onViewAnalysis?: (analysis: SavedAnalysis) => void;
}

const ANALYSIS_TYPE_ICONS: Record<string, typeof Calculator> = {
  "valuation-calculator": Calculator,
  "roi-calculator": Calculator,
  "cleanbi-score": MapPin,
  "location-analysis": MapPin,
  "ai-consultant": Brain,
  "service-guy-ai": Brain,
  "utility-analysis": FileText,
  default: FileText,
};

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  "valuation-calculator": "Valuation Calculator",
  "roi-calculator": "ROI Calculator",
  "cleanbi-score": "CleanBI Score",
  "location-analysis": "Location Analysis",
  "ai-consultant": "AI Consultant",
  "service-guy-ai": "Service Guy AI",
  "utility-analysis": "Utility Analysis",
};

export function SavedAnalysesList({ onViewAnalysis }: SavedAnalysesListProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { data, isLoading, error } = useQuery<{
    analyses: SavedAnalysis[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ["/api/analyses", { search, type: typeFilter === "all" ? undefined : typeFilter }],
  });

  const { data: analysisTypes } = useQuery<string[]>({
    queryKey: ["/api/analyses/types"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({ title: "Analysis deleted" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      const response = await apiRequest("PATCH", `/api/analyses/${id}`, { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({ title: "Analysis renamed" });
      setEditId(null);
    },
    onError: () => {
      toast({ title: "Failed to rename", variant: "destructive" });
    },
  });

  const handleExport = (analysis: SavedAnalysis) => {
    const exportData = {
      title: analysis.title,
      type: analysis.analysisType,
      data: analysis.data,
      notes: analysis.notes,
      createdAt: analysis.createdAt,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analysis.title.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(analysis.createdAt), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Analysis exported" });
  };

  const getIcon = (type: string) => {
    const Icon = ANALYSIS_TYPE_ICONS[type] || ANALYSIS_TYPE_ICONS.default;
    return Icon;
  };

  const groupedAnalyses = data?.analyses.reduce((acc, analysis) => {
    const type = analysis.analysisType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(analysis);
    return acc;
  }, {} as Record<string, SavedAnalysis[]>);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          Failed to load saved analyses. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search saved analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-analyses"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-type">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {analysisTypes?.map((type) => (
              <SelectItem key={type} value={type}>
                {ANALYSIS_TYPE_LABELS[type] || type.replace(/-/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!data?.analyses.length ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Analyses</h3>
            <p className="text-muted-foreground mb-6">
              Save your calculator results and AI analyses to access them anytime.
            </p>
            <Button asChild variant="outline">
              <Link href="/calculators" data-testid="link-explore-calculators">
                Explore Calculators
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.analyses.map((analysis) => {
            const Icon = getIcon(analysis.analysisType);
            return (
              <Card
                key={analysis.id}
                className="hover-elevate cursor-pointer transition-all"
                data-testid={`card-analysis-${analysis.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#C8A661]" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base line-clamp-1">{analysis.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {ANALYSIS_TYPE_LABELS[analysis.analysisType] || analysis.analysisType}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${analysis.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewAnalysis?.(analysis)}
                          data-testid={`action-view-${analysis.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditId(analysis.id);
                            setEditTitle(analysis.title);
                          }}
                          data-testid={`action-rename-${analysis.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExport(analysis)}
                          data-testid={`action-export-${analysis.id}`}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export JSON
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(analysis.id)}
                          className="text-destructive"
                          data-testid={`action-delete-${analysis.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent onClick={() => onViewAnalysis?.(analysis)}>
                  {analysis.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {analysis.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(analysis.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(analysis.createdAt), "h:mm a")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent data-testid="dialog-delete-analysis">
          <DialogHeader>
            <DialogTitle>Delete Analysis</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this saved analysis? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <DialogContent data-testid="dialog-rename-analysis">
          <DialogHeader>
            <DialogTitle>Rename Analysis</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Enter new title"
            data-testid="input-rename-title"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)} data-testid="button-cancel-rename">
              Cancel
            </Button>
            <Button
              onClick={() => editId && updateMutation.mutate({ id: editId, title: editTitle })}
              disabled={updateMutation.isPending || !editTitle.trim()}
              className="bg-[#0A1628] hover:bg-[#1a3a5c]"
              data-testid="button-confirm-rename"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
