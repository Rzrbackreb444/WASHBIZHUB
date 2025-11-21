import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, CheckCircle, Clock, AlertCircle, Trash2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AiBlogTask {
  id: string;
  userId: string;
  topic: string;
  keywords: string[];
  aiProvider: "openai" | "anthropic" | "gemini" | "perplexity" | "grok";
  targetWordCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  content: string | null;
  createdAt: string;
  completedAt: string | null;
}

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI GPT-4", description: "Best for structured, professional content" },
  { value: "anthropic", label: "Anthropic Claude", description: "Excellent for long-form writing" },
  { value: "gemini", label: "Google Gemini", description: "Great for research and analysis" },
  { value: "perplexity", label: "Perplexity", description: "Perfect for fact-based articles" },
  { value: "grok", label: "Grok", description: "Ideal for trending topics" },
];

export default function AIBlogging() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AiBlogTask | null>(null);
  const [newTask, setNewTask] = useState({
    topic: "",
    keywords: "",
    aiProvider: "openai" as const,
    targetWordCount: 1500,
  });

  const userId = "user-123";

  const { data: tasks = [], isLoading } = useQuery<AiBlogTask[]>({
    queryKey: ["/api/ai-blog-tasks", userId],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof newTask) => {
      const response = await apiRequest("POST", "/api/ai-blog-tasks", {
        userId,
        topic: data.topic,
        keywords: data.keywords.split(",").map(k => k.trim()).filter(Boolean),
        aiProvider: data.aiProvider,
        targetWordCount: data.targetWordCount,
        status: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-blog-tasks"] });
      setShowCreateDialog(false);
      setNewTask({ topic: "", keywords: "", aiProvider: "openai", targetWordCount: 1500 });
      toast({
        title: "Task Created",
        description: "Your blog task has been created successfully",
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

  const generateMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/ai-blog-tasks/${taskId}/generate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-blog-tasks"] });
      toast({
        title: "Content Generated",
        description: "Your blog post has been generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/ai-blog-tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-blog-tasks"] });
      toast({
        title: "Task Deleted",
        description: "The blog task has been removed",
      });
    },
  });

  const getStatusBadge = (status: AiBlogTask["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "processing":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const downloadContent = (task: AiBlogTask) => {
    if (!task.content) return;
    
    const blob = new Blob([task.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${task.topic.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="text-page-title">
              AI Blogging Agent
            </h1>
            <p className="text-xl text-purple-200">
              Generate professional blog content with multi-AI orchestration
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" data-testid="button-create-task">
            <Sparkles className="w-5 h-5 mr-2" />
            New Blog Task
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No blog tasks yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI-powered blog task to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first">
                <Sparkles className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="flex flex-col hover-elevate" data-testid={`card-task-${task.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg line-clamp-2">{task.topic}</CardTitle>
                    {getStatusBadge(task.status)}
                  </div>
                  <CardDescription>
                    {AI_PROVIDERS.find(p => p.value === task.aiProvider)?.label}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {task.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Target: {task.targetWordCount} words
                  </div>

                  {task.content && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Length: </span>
                      <span className="font-medium">{task.content.split(/\s+/).length} words</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex-none flex gap-2">
                  {task.status === "pending" && (
                    <Button
                      className="flex-1"
                      onClick={() => generateMutation.mutate(task.id)}
                      disabled={generateMutation.isPending}
                      data-testid={`button-generate-${task.id}`}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  )}
                  
                  {task.status === "completed" && (
                    <>
                      <Button
                        className="flex-1"
                        onClick={() => setSelectedTask(task)}
                        data-testid={`button-view-${task.id}`}
                      >
                        View Content
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => downloadContent(task)}
                        data-testid={`button-download-${task.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    disabled={deleteTaskMutation.isPending}
                    data-testid={`button-delete-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Blog Task</DialogTitle>
              <DialogDescription>
                Configure your AI-powered blog generation task
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Blog Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., The Ultimate Guide to Laundromat Equipment Maintenance"
                  value={newTask.topic}
                  onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                  data-testid="input-topic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., laundromat, maintenance, equipment, cleaning"
                  value={newTask.keywords}
                  onChange={(e) => setNewTask({ ...newTask, keywords: e.target.value })}
                  data-testid="input-keywords"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">AI Provider</Label>
                <Select
                  value={newTask.aiProvider}
                  onValueChange={(value: any) => setNewTask({ ...newTask, aiProvider: value })}
                >
                  <SelectTrigger id="provider" data-testid="select-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div>
                          <div className="font-medium">{provider.label}</div>
                          <div className="text-xs text-muted-foreground">{provider.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordCount">Target Word Count</Label>
                <Input
                  id="wordCount"
                  type="number"
                  min="500"
                  max="5000"
                  step="100"
                  value={newTask.targetWordCount}
                  onChange={(e) => setNewTask({ ...newTask, targetWordCount: parseInt(e.target.value) })}
                  data-testid="input-word-count"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createTaskMutation.mutate(newTask)}
                disabled={!newTask.topic || !newTask.keywords || createTaskMutation.isPending}
                data-testid="button-create"
              >
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTask?.topic}</DialogTitle>
              <DialogDescription>
                Generated by {AI_PROVIDERS.find(p => p.value === selectedTask?.aiProvider)?.label}
              </DialogDescription>
            </DialogHeader>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{selectedTask?.content}</pre>
            </div>

            <DialogFooter>
              <Button onClick={() => selectedTask && downloadContent(selectedTask)}>
                <Download className="w-4 h-4 mr-2" />
                Download Markdown
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
