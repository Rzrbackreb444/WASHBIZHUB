import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, FileText, Eye, EyeOff, Search, Target, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { BlogSEOEditor, BlogFormData } from "@/components/admin/BlogSEOEditor";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  category: string;
  subcategory: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  metaTitle: string;
  metaDescription: string | null;
  focusKeyphrases: string[] | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  pageType: string | null;
  articleType: string | null;
  seoScore: number | null;
  readabilityScore: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  datePublished: string;
}

const defaultFormData: BlogFormData = {
  title: "",
  content: "",
  excerpt: "",
  category: "general",
  subcategory: "",
  tags: "",
  published: false,
  featured: false,
  featuredImage: "",
  featuredImageAlt: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyphrase: "",
  secondaryKeyphrases: "",
  slug: "",
  canonicalUrl: "",
  breadcrumbTitle: "",
  pageType: "WebPage",
  articleType: "BlogPosting",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  authorName: "WashBizHub Research Team",
};

export default function AdminBlog() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog/posts'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const payload = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        subcategory: data.subcategory || null,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: data.published,
        featured: data.featured,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        focusKeyphrases: [data.focusKeyphrase, ...data.secondaryKeyphrases.split(',').map(k => k.trim())].filter(Boolean),
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        twitterTitle: data.twitterTitle || null,
        twitterDescription: data.twitterDescription || null,
        twitterImage: data.twitterImage || null,
        schemaMarkup: {
          pageType: data.pageType,
          articleType: data.articleType,
          breadcrumbTitle: data.breadcrumbTitle
        },
        authorName: data.authorName || "WashBizHub Research Team",
        type: "manual",
        market: "global",
        language: "en",
      };
      const response = await apiRequest("POST", "/api/admin/blog/posts", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setIsEditorOpen(false);
      resetForm();
      toast({ title: "Blog post created successfully", description: "Your post has been saved with full SEO optimization." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlogFormData }) => {
      const payload = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        subcategory: data.subcategory || null,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: data.published,
        featured: data.featured,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        focusKeyphrases: [data.focusKeyphrase, ...data.secondaryKeyphrases.split(',').map(k => k.trim())].filter(Boolean),
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        twitterTitle: data.twitterTitle || null,
        twitterDescription: data.twitterDescription || null,
        twitterImage: data.twitterImage || null,
        schemaMarkup: {
          pageType: data.pageType,
          articleType: data.articleType,
          breadcrumbTitle: data.breadcrumbTitle
        },
        authorName: data.authorName || "WashBizHub Research Team",
      };
      const response = await apiRequest("PATCH", `/api/admin/blog/posts/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      setIsEditorOpen(false);
      setEditingPost(null);
      resetForm();
      toast({ title: "Blog post updated successfully", description: "All SEO settings have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({ title: "Blog post deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/blog/posts/${id}`, { published });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      toast({ title: "Post status updated" });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    const keyphrases = post.focusKeyphrases || [];
    const schemaData = (post as any).schemaMarkup || {};
    
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      subcategory: post.subcategory || "",
      tags: post.tags.join(', '),
      published: post.published,
      featured: post.featured,
      featuredImage: post.featuredImage || "",
      featuredImageAlt: post.featuredImageAlt || "",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      focusKeyphrase: keyphrases[0] || "",
      secondaryKeyphrases: keyphrases.slice(1).join(', '),
      slug: post.slug,
      canonicalUrl: post.canonicalUrl || "",
      breadcrumbTitle: schemaData.breadcrumbTitle || "",
      pageType: schemaData.pageType || post.pageType || "WebPage",
      articleType: schemaData.articleType || post.articleType || "BlogPosting",
      ogTitle: post.ogTitle || "",
      ogDescription: post.ogDescription || "",
      ogImage: post.ogImage || "",
      twitterTitle: post.twitterTitle || "",
      twitterDescription: post.twitterDescription || "",
      twitterImage: post.twitterImage || "",
      authorName: post.authorName || "WashBizHub Research Team",
    });
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setIsEditorOpen(false);
    setEditingPost(null);
    resetForm();
  };

  const handleNewPost = () => {
    setEditingPost(null);
    resetForm();
    setIsEditorOpen(true);
  };

  const getSEOScoreBadge = (score: number | null) => {
    if (score === null) return null;
    if (score >= 70) return <Badge className="bg-green-600 gap-1"><Target className="w-3 h-3" />{score}</Badge>;
    if (score >= 40) return <Badge className="bg-amber-500 gap-1"><Target className="w-3 h-3" />{score}</Badge>;
    return <Badge variant="destructive" className="gap-1"><Target className="w-3 h-3" />{score}</Badge>;
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-heading">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage SEO-optimized blog posts with enterprise-grade tools</p>
        </div>
        <Button onClick={handleNewPost} size="lg" data-testid="button-create-post">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.published).length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <EyeOff className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => !p.published).length}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground mb-4">Create your first SEO-optimized blog post to get started</p>
            <Button onClick={handleNewPost}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-xl truncate">{post.title}</CardTitle>
                      {post.published ? (
                        <Badge variant="default" className="bg-green-600">
                          <Eye className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                      {post.featured && (
                        <Badge className="bg-amber-500">Featured</Badge>
                      )}
                      <Badge variant="outline">{post.category}</Badge>
                      {getSEOScoreBadge(post.seoScore)}
                    </div>
                    <CardDescription className="line-clamp-2 mb-2">{post.excerpt}</CardDescription>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.datePublished || post.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {(post.views || 0).toLocaleString()} views
                      </span>
                      {post.focusKeyphrases?.[0] && (
                        <span className="flex items-center gap-1">
                          <Search className="h-3 w-3" />
                          {post.focusKeyphrases[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags?.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags?.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishMutation.mutate({ id: post.id, published: !post.published })}
                      data-testid={`button-toggle-publish-${post.id}`}
                    >
                      {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this post?')) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={(open) => {
        if (!open) handleCancel();
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-6">
          <BlogSEOEditor
            formData={formData}
            setFormData={setFormData}
            isEditing={!!editingPost}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
