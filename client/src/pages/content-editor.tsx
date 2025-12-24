import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BlockEditor, ContentBlock } from "@/components/content-editor/BlockEditor";
import {
  Save,
  Eye,
  FileText,
  Settings,
  ArrowLeft,
  Plus,
  Loader2,
  Lock,
  Crown,
  Users,
  Sparkles,
} from "lucide-react";

interface ContentDocument {
  id: string;
  title: string;
  slug: string;
  blocks: ContentBlock[];
  status: "draft" | "published";
  authorId: string;
  createdAt: string;
  updatedAt: string;
  collaborators?: { id: string; name: string; avatar?: string }[];
}

interface Entitlements {
  authenticated: boolean;
  tier: string;
  features: {
    contentEditor: boolean;
    realTimeCollab: boolean;
  };
}

export default function ContentEditorPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/content-editor/:id");
  const documentId = params?.id;
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: entitlements, isLoading: entitlementsLoading } = useQuery<Entitlements>({
    queryKey: ["/api/entitlements/me"],
  });

  const { data: document, isLoading: documentLoading } = useQuery<ContentDocument>({
    queryKey: ["/api/content", documentId],
    enabled: !!documentId && documentId !== "new",
  });

  const { data: documents } = useQuery<ContentDocument[]>({
    queryKey: ["/api/content"],
    enabled: !documentId,
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setBlocks(document.blocks || []);
      setStatus(document.status);
    }
  }, [document]);

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; blocks: ContentBlock[]; status: string }) => {
      const endpoint = documentId && documentId !== "new" 
        ? `/api/content/${documentId}` 
        : "/api/content";
      const method = documentId && documentId !== "new" ? "PATCH" : "POST";
      
      return apiRequest(endpoint, { 
        method, 
        body: JSON.stringify({
          ...data,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        }),
      });
    },
    onSuccess: (data) => {
      toast({ title: "Document saved" });
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      if (!documentId || documentId === "new") {
        setLocation(`/content-editor/${data.id}`);
      }
    },
    onError: (error: any) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ title, blocks, status });
  };

  const handleBlocksChange = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  if (entitlementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!entitlements?.authenticated) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the Content Editor</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/login")} data-testid="login-button">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entitlements?.features?.contentEditor) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <CardTitle>Pro Feature</CardTitle>
            <CardDescription>
              The Content Editor is available with a Pro or Enterprise subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Block-based editing</Badge>
              <Badge variant="secondary">Embed videos & code</Badge>
              <Badge variant="secondary">AI writing assistant</Badge>
              <Badge variant="secondary">SEO optimization</Badge>
            </div>
            <Button onClick={() => setLocation("/pricing")} data-testid="upgrade-button">
              Upgrade to Pro - $29/month
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!documentId) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Content Editor</h1>
            <p className="text-muted-foreground">Create and manage your content</p>
          </div>
          <Button onClick={() => setLocation("/content-editor/new")} data-testid="new-document-button">
            <Plus className="h-4 w-4 mr-2" /> New Document
          </Button>
        </div>

        <div className="grid gap-4">
          {documents?.length === 0 && (
            <Card className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents yet. Create your first one!</p>
            </Card>
          )}
          
          {documents?.map((doc) => (
            <Card 
              key={doc.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setLocation(`/content-editor/${doc.id}`)}
              data-testid={`document-${doc.id}`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === "published" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                  {doc.collaborators && doc.collaborators.length > 0 && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {doc.collaborators.length}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation("/content-editor")}
                data-testid="back-button"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Untitled Document"
                className="text-xl font-bold border-0 bg-transparent focus-visible:ring-0 max-w-md"
                data-testid="document-title-input"
              />
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-amber-600">Unsaved</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {entitlements?.features?.realTimeCollab && (
                <Button variant="outline" size="sm" data-testid="collab-button">
                  <Users className="h-4 w-4 mr-2" /> Collaborate
                </Button>
              )}
              
              <Select value={status} onValueChange={(v: "draft" | "published") => setStatus(v)}>
                <SelectTrigger className="w-32" data-testid="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" data-testid="preview-button">
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending || !hasUnsavedChanges}
                data-testid="save-button"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {!entitlements?.features?.realTimeCollab && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Upgrade to Enterprise for real-time collaboration with your team
            </AlertDescription>
          </Alert>
        )}

        <BlockEditor
          blocks={blocks}
          onChange={handleBlocksChange}
          readOnly={false}
        />
      </div>
    </div>
  );
}
