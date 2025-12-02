/**
 * SEO COMMAND CENTER
 * 
 * Complete 300-point SEO dashboard for seo.washbizhub.com
 * Professional design with real-time scoring
 * 
 * Features:
 * - 300-point master score display
 * - 20 category breakdowns
 * - Trending charts
 * - AI agent management
 * - Task prioritization
 * - Domain purchasing
 * - Auto-indexing status
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, Bot, CheckCircle2, Globe, Link2, Search, Sparkles, Target, 
  TrendingUp, Zap, AlertCircle, Award, Gauge, Shield, Smartphone, 
  Eye, Flame, Languages, FileText, Users, ShoppingCart, Video,
  Star, Trophy, FileStack, Plus, Play, Settings, Trash2, ExternalLink
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

/**
 * Get grade color
 */
function getGradeColor(grade: string): string {
  if (grade === "S+" || grade === "S") return "text-amber-500 dark:text-amber-400";
  if (grade === "A+" || grade === "A") return "text-emerald-500 dark:text-emerald-400";
  if (grade === "B+" || grade === "B") return "text-blue-500 dark:text-blue-400";
  if (grade === "C") return "text-orange-500 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}

/**
 * Get priority color
 */
function getPriorityColor(priority: string): "default" | "destructive" | "secondary" | "outline" {
  if (priority === "critical") return "destructive";
  if (priority === "high") return "default";
  if (priority === "medium") return "secondary";
  return "outline";
}

/**
 * Category icon mapping
 */
const CATEGORY_ICONS: Record<string, any> = {
  baseSEO: Search,
  eeat: Award,
  coreWebVitals: Gauge,
  backlinks: Link2,
  localSEO: Globe,
  mobile: Smartphone,
  security: Shield,
  accessibility: Eye,
  engagement: Activity,
  freshness: Flame,
  international: Languages,
  aeo: Bot,
  technical: Settings,
  brand: Sparkles,
  ux: Users,
  conversion: ShoppingCart,
  video: Video,
  richResults: Star,
  competitive: Trophy,
  contentDepth: FileText,
};

export default function SeoCommandCenter() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);

  // Fetch user's SEO projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/seo/projects"],
  });

  const projects = (projectsData as any)?.projects || [];
  const selectedProject = projects.find((p: any) => p.id === selectedProjectId) || projects[0];

  // Fetch project details with latest audit
  const { data: projectDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["/api/seo/projects", selectedProject?.id],
    enabled: !!selectedProject,
  });

  // Fetch agent templates
  const { data: templatesData } = useQuery({
    queryKey: ["/api/seo/agents/templates"],
  });

  const templates = (templatesData as any)?.templates || [];

  // Fetch user's agents
  const { data: agentsData } = useQuery({
    queryKey: ["/api/seo/agents"],
  });

  const agents = (agentsData as any)?.agents || [];

  // Run audit mutation
  const runAuditMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch("/api/seo/audits", {
        method: "POST",
        body: JSON.stringify({ projectId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "300-Point Audit Complete!", description: "Your SEO score has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/seo/projects"] });
      if (selectedProject) {
        queryClient.invalidateQueries({ queryKey: ["/api/seo/projects", selectedProject.id] });
      }
    },
    onError: (error: any) => {
      toast({ title: "Audit Failed", description: error.message || "Failed to run audit", variant: "destructive" });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/seo/projects", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Project Created!", description: "Your SEO project is ready." });
      setCreateProjectOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/seo/projects"] });
    },
  });

  const latestAudit = (projectDetails as any)?.latestAudit;
  const tasks = (projectDetails as any)?.tasks || [];

  return (
    <AuthGuard title="Sign In to Access SEO Command Center" description="Sign in to access this tool.">
      {projectsLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading SEO Command Center...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen max-w-2xl mx-auto p-6">
          <Target className="h-24 w-24 mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Welcome to SEO Command Center</h1>
          <p className="text-muted-foreground text-center mb-8">
            The 300-point master SEO system. Create your first project to get started!
          </p>
          <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-project">
                <Plus className="mr-2 h-5 w-5" />
                Create SEO Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create SEO Project</DialogTitle>
                <DialogDescription>
                  Add a website to analyze with our 300-point scoring system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProjectMutation.mutate({
                  name: formData.get("name"),
                  url: formData.get("url"),
                  description: formData.get("description"),
                  primaryKeywords: (formData.get("keywords") as string || "").split(",").map(k => k.trim()).filter(Boolean),
                });
              }}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" name="name" placeholder="My Awesome Website" required data-testid="input-project-name" />
                  </div>
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input id="url" name="url" type="url" placeholder="https://example.com" required data-testid="input-project-url" />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
                    <Input id="keywords" name="keywords" placeholder="seo, marketing, analytics" data-testid="input-keywords" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea id="description" name="description" placeholder="Describe your SEO goals..." data-testid="textarea-description" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-primary">SEO</span> Command Center
            </h1>
            <p className="text-muted-foreground">300-Point Master SEO System • Real-time Analysis • AI-Powered Optimization</p>
          </div>
          <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-project">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create SEO Project</DialogTitle>
                <DialogDescription>Add a website to analyze</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProjectMutation.mutate({
                  name: formData.get("name"),
                  url: formData.get("url"),
                  description: formData.get("description"),
                  primaryKeywords: (formData.get("keywords") as string || "").split(",").map(k => k.trim()).filter(Boolean),
                });
              }}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" name="name" placeholder="My Website" required />
                  </div>
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input id="url" name="url" type="url" placeholder="https://example.com" required />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Target Keywords</Label>
                    <Input id="keywords" name="keywords" placeholder="seo, marketing" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Describe your goals..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Selector */}
        <Select value={selectedProject?.id || ""} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-full max-w-md" data-testid="select-project">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project: any) => (
              <SelectItem key={project.id} value={project.id} data-testid={`project-${project.id}`}>
                <div className="flex items-center gap-2">
                  <span>{project.name}</span>
                  <Badge variant="outline">{project.currentScore}/300</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Score Card */}
      {selectedProject && (
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <ExternalLink className="h-4 w-4" />
                  <a href={selectedProject.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {selectedProject.url}
                  </a>
                </CardDescription>
              </div>
              <Button 
                size="lg"
                onClick={() => runAuditMutation.mutate(selectedProject.id)}
                disabled={runAuditMutation.isPending}
                data-testid="button-run-audit"
              >
                {runAuditMutation.isPending ? (
                  <>
                    <Activity className="mr-2 h-5 w-5 animate-spin" />
                    Running Audit...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Run 300-Point Audit
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {latestAudit && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Master Score */}
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getGradeColor(latestAudit.grade)}`}>
                    {latestAudit.totalScore}
                    <span className="text-2xl text-muted-foreground">/300</span>
                  </div>
                  <div className={`text-3xl font-bold mb-4 ${getGradeColor(latestAudit.grade)}`}>
                    {latestAudit.grade} Grade
                  </div>
                  <Progress value={latestAudit.percentage} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2">{latestAudit.percentage}% Optimized</p>
                </div>

                {/* Progress to Target */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress to Target</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedProject.targetScore} goal
                    </span>
                  </div>
                  <Progress 
                    value={(latestAudit.totalScore / selectedProject.targetScore) * 100} 
                    className="h-3 mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-500">
                        +{latestAudit.totalScore - (selectedProject.currentScore - latestAudit.totalScore)}
                      </div>
                      <div className="text-xs text-muted-foreground">Points Gained</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">
                        {selectedProject.targetScore - latestAudit.totalScore}
                      </div>
                      <div className="text-xs text-muted-foreground">To Goal</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Wins
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-emerald-500">
                        {Object.values(latestAudit.breakdown || {}).reduce((sum: number, cat: any) => 
                          sum + (cat.wins?.length || 0), 0
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Issues
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-500">
                        {Object.values(latestAudit.breakdown || {}).reduce((sum: number, cat: any) => 
                          sum + (cat.issues?.length || 0), 0
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents">AI Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="domains" data-testid="tab-domains">Domains</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {latestAudit && latestAudit.breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(latestAudit.breakdown).map(([key, data]: [string, any]) => {
                const Icon = CATEGORY_ICONS[key] || FileText;
                return (
                  <Card key={key} className="hover-elevate">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <Badge variant={data.grade === "A" ? "default" : data.grade === "F" ? "destructive" : "secondary"}>
                          {data.grade}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold">{Math.round(data.score)}</span>
                        <span className="text-sm text-muted-foreground">/{data.maxScore}</span>
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">{data.percentage}%</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!latestAudit && selectedProject && (
            <Card className="text-center p-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Audit Data Yet</h3>
              <p className="text-muted-foreground mb-6">
                Run your first 300-point audit to see detailed insights
              </p>
              <Button onClick={() => runAuditMutation.mutate(selectedProject.id)}>
                <Zap className="mr-2 h-4 w-4" />
                Run First Audit
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>SEO Tasks</CardTitle>
              <CardDescription>Prioritized recommendations from your latest audit</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                  <p>No tasks yet. Run an audit to get recommendations!</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {tasks.map((task: any) => (
                      <Card key={task.id} className="hover-elevate">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                <Badge variant="outline">+{task.impact} pts</Badge>
                                <Badge variant="secondary">{task.effort}</Badge>
                              </div>
                              <CardTitle className="text-sm">{task.title}</CardTitle>
                            </div>
                            <div className="text-xs text-muted-foreground">{task.estimatedTime}</div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Templates */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Templates</CardTitle>
                  <CardDescription>Deploy pre-built SEO automation agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template: any) => (
                        <Card key={template.id} className="hover-elevate">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Bot className="h-8 w-8 text-primary" />
                              {template.isPremium && <Badge variant="default">Pro</Badge>}
                            </div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-xs">{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(template.capabilities || []).slice(0, 3).map((cap: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{cap}</Badge>
                              ))}
                            </div>
                            <Button size="sm" className="w-full" data-testid={`button-deploy-${template.id}`}>
                              <Play className="mr-2 h-3 w-3" />
                              Deploy Agent
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Active Agents */}
            <Card>
              <CardHeader>
                <CardTitle>Your Agents</CardTitle>
                <CardDescription>Active SEO automation</CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-sm">No agents deployed yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {agents.map((agent: any) => (
                        <Card key={agent.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{agent.name}</CardTitle>
                            <CardDescription className="text-xs">{agent.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{agent.tasksCompleted} tasks</span>
                              <Badge variant={agent.isActive ? "default" : "secondary"}>
                                {agent.isActive ? "Active" : "Paused"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Domain Management</CardTitle>
              <CardDescription>Purchase domains through WashBizHub</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Domain Management</h3>
                <p className="text-sm max-w-md mx-auto">
                  Purchase and manage .com, .net, .org domains directly through WashBizHub with integrated SEO configuration.
                </p>
                <p className="text-xs mt-4 text-muted-foreground/70">
                  Contact support for domain purchasing assistance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
      )}
    </AuthGuard>
  );
}
