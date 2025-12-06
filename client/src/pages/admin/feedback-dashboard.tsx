import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Lightbulb,
  Bug,
  FileText,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FeedbackSubmission } from "@shared/schema";

const categoryConfig: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
  "feature-request": { label: "Feature Request", icon: Lightbulb, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  "improvement": { label: "Improvement", icon: ChevronUp, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "bug-report": { label: "Bug Report", icon: Bug, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  "general-feedback": { label: "General", icon: FileText, color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  "other": { label: "Other", icon: HelpCircle, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  "new": { label: "New", icon: Clock, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "reviewed": { label: "Reviewed", icon: Eye, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  "in_progress": { label: "In Progress", icon: RefreshCw, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  "resolved": { label: "Resolved", icon: CheckCircle2, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "closed": { label: "Closed", icon: XCircle, color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
};

interface FeedbackStats {
  total: number;
  new: number;
  resolved: number;
  byCategory: Record<string, number>;
}

function FeedbackCard({ 
  feedback, 
  onStatusChange 
}: { 
  feedback: FeedbackSubmission; 
  onStatusChange: (id: string, status: string, adminNotes?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(feedback.adminNotes || "");
  const [selectedStatus, setSelectedStatus] = useState(feedback.status);
  const { toast } = useToast();
  
  const category = categoryConfig[feedback.category] || categoryConfig["other"];
  const status = statusConfig[feedback.status] || statusConfig["new"];
  const CategoryIcon = category.icon;
  const StatusIcon = status.icon;

  const handleUpdate = () => {
    onStatusChange(feedback.id, selectedStatus, adminNotes);
    toast({
      title: "Feedback Updated",
      description: `Status changed to ${statusConfig[selectedStatus].label}`,
    });
  };

  return (
    <Card className="hover-elevate" data-testid={`card-feedback-${feedback.id}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={category.color} data-testid={`badge-category-${feedback.id}`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {category.label}
              </Badge>
              <Badge className={status.color} data-testid={`badge-status-${feedback.id}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <CardTitle className="text-lg truncate" data-testid={`text-subject-${feedback.id}`}>
              {feedback.subject}
            </CardTitle>
            <CardDescription className="mt-1">
              From <span className="font-medium">{feedback.name}</span> ({feedback.email})
              {feedback.page && <span className="ml-2 text-xs">• Page: {feedback.page}</span>}
            </CardDescription>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(feedback.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-message-${feedback.id}`}>
            {feedback.message}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full"
            data-testid={`button-expand-${feedback.id}`}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                View Details & Update
              </>
            )}
          </Button>
          
          {expanded && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium mb-2">Full Message</h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {feedback.message}
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                    data-testid={`select-status-${feedback.id}`}
                  >
                    <SelectTrigger data-testid={`select-trigger-status-${feedback.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" data-testid={`option-status-new-${feedback.id}`}>New</SelectItem>
                      <SelectItem value="reviewed" data-testid={`option-status-reviewed-${feedback.id}`}>Reviewed</SelectItem>
                      <SelectItem value="in_progress" data-testid={`option-status-in_progress-${feedback.id}`}>In Progress</SelectItem>
                      <SelectItem value="resolved" data-testid={`option-status-resolved-${feedback.id}`}>Resolved</SelectItem>
                      <SelectItem value="closed" data-testid={`option-status-closed-${feedback.id}`}>Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  className="min-h-[80px]"
                  data-testid={`textarea-notes-${feedback.id}`}
                />
              </div>
              
              <Button 
                onClick={handleUpdate} 
                className="w-full"
                style={{ backgroundColor: '#C8A661' }}
                data-testid={`button-update-${feedback.id}`}
              >
                Update Feedback
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeedbackDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check", { credentials: "include" });
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const { data: stats, refetch: refetchStats, isFetching: statsFetching } = useQuery<FeedbackStats>({
    queryKey: ['/api/feedback/admin/stats'],
    enabled: isAuthenticated === true,
    queryFn: async () => {
      const res = await fetch('/api/feedback/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  const { data: feedbacks, refetch: refetchFeedbacks, isFetching: feedbacksFetching } = useQuery<FeedbackSubmission[]>({
    queryKey: ['/api/feedback/admin/list'],
    enabled: isAuthenticated === true,
    queryFn: async () => {
      const res = await fetch('/api/feedback/admin/list', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch feedback');
      return res.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const res = await apiRequest('PATCH', `/api/feedback/admin/${id}`, { status, adminNotes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/admin/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/admin/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: string, adminNotes?: string) => {
    updateMutation.mutate({ id, status, adminNotes });
  };

  const handleRefresh = () => {
    refetchStats();
    refetchFeedbacks();
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-state">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="unauthorized-state">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Unauthorized Access</CardTitle>
            <CardDescription>
              You must be an admin to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/admin/login")} data-testid="button-login-redirect">
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFetching = statsFetching || feedbacksFetching;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8" data-testid="feedback-dashboard">
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/admin")}
            data-testid="button-back-admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#C8A661' }}>
              Feedback Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Manage user feedback and feature requests
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          data-testid="button-refresh"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card data-testid="stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#0A1628' }}>
              {stats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-new">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.new || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-resolved">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.resolved || 0}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-categories">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats?.byCategory || {}).map(([cat, count]) => (
                <Badge 
                  key={cat} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`badge-category-count-${cat}`}
                >
                  {categoryConfig[cat]?.label || cat}: {count}
                </Badge>
              ))}
              {(!stats?.byCategory || Object.keys(stats.byCategory).length === 0) && (
                <span className="text-xs text-muted-foreground">No data</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: '#0A1628' }}>
          All Feedback ({feedbacks?.length || 0})
        </h2>
        
        {feedbacksFetching && !feedbacks ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : feedbacks && feedbacks.length > 0 ? (
          <div className="grid gap-4">
            {feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12" data-testid="empty-state">
            <CardContent className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback submissions yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
