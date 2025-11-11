import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Users, Award, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBlogPosts, useCreateBlogPost, useGenerateBlogContent } from "@/hooks/use-blog";
import { useToast } from "@/hooks/use-toast";

export default function Blog() {
  const [activeTab, setActiveTab] = useState("browse");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Operations",
    type: "manual",
  });

  const { toast } = useToast();
  const { data: posts = [], isLoading } = useBlogPosts();
  const createPost = useCreateBlogPost();
  const generateContent = useGenerateBlogContent();

  const samplePosts = [
    {
      id: "1",
      title: "Maximizing Revenue During Peak Hours",
      type: "ai",
      category: "Operations",
      excerpt: "Learn how to optimize your pricing strategy during high-demand periods...",
      views: 1245,
    },
    {
      id: "2",
      title: "Equipment Maintenance Best Practices",
      type: "manual",
      category: "Maintenance",
      excerpt: "Preventive maintenance schedules that save thousands in repairs...",
      views: 892,
    },
    {
      id: "3",
      title: "How I Grew to 5 Locations in 3 Years",
      type: "uge",
      category: "Growth",
      excerpt: "My journey from a single store to a multi-location empire...",
      views: 2341,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ai": return <Sparkles className="h-4 w-4" />;
      case "uge": return <Award className="h-4 w-4" />;
      case "ugb": return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "ai": return "default";
      case "uge": return "default";
      case "ugb": return "secondary";
      default: return "outline";
    }
  };

  const handleGenerateContent = async () => {
    if (!newPost.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a blog post title",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateContent.mutateAsync({
        topic: newPost.title,
        category: newPost.category,
      });
      setNewPost({ ...newPost, content: result.content });
      toast({
        title: "Content Generated!",
        description: "AI has generated your blog post content",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPost.mutateAsync({
        userId: null,
        title: newPost.title,
        content: newPost.content,
        type: newPost.type,
        category: newPost.category,
        featured: false,
        published: true,
      });

      setNewPost({ title: "", content: "", category: "Operations", type: "manual" });
      setActiveTab("browse");
      
      toast({
        title: "Published!",
        description: "Your blog post has been published successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-blog-title">
            Blog Suite
          </h1>
          <p className="text-xl text-white/70" data-testid="text-blog-subtitle">
            Manual, AI-Generated, and User Expert Content
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 bg-white/10 mb-8">
            <TabsTrigger value="browse" data-testid="tab-browse">Browse Posts</TabsTrigger>
            <TabsTrigger value="create" data-testid="tab-create">Create Post</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 text-accent animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="py-20 text-center">
                  <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No blog posts yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2"
                      data-testid={`card-post-${post.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge 
                            variant={getTypeBadgeVariant(post.type)}
                            className="flex items-center gap-1"
                          >
                            {getTypeIcon(post.type)}
                            {post.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-white/70 border-white/30">
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-xl">{post.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {post.content.substring(0, 120)}...
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm text-white/60">
                          <span>Published</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-accent hover:text-accent/90"
                            data-testid={`button-read-${post.id}`}
                          >
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-white/10 backdrop-blur border-white/20 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Create New Post</CardTitle>
                <CardDescription className="text-white/70">
                  Write manually or use AI to generate professional content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="post-type" className="text-white/90 font-medium">Post Type</Label>
                    <Select 
                      value={newPost.type} 
                      onValueChange={(value) => setNewPost({ ...newPost, type: value })}
                    >
                      <SelectTrigger 
                        id="post-type" 
                        className="bg-white/20 border-white/30 text-white mt-2"
                        data-testid="select-post-type"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="ai">AI-Generated</SelectItem>
                        <SelectItem value="ugb">User Blog</SelectItem>
                        <SelectItem value="uge">User Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white/90 font-medium">Category</Label>
                    <Select 
                      value={newPost.category} 
                      onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                    >
                      <SelectTrigger 
                        id="category" 
                        className="bg-white/20 border-white/30 text-white mt-2"
                        data-testid="select-category"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-white/90 font-medium">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter your blog post title"
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-white/90 font-medium">Content</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Write your content or use AI to generate..."
                    rows={12}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="textarea-content"
                  />
                </div>

                <div className="flex gap-4">
                  {newPost.type === "ai" && (
                    <Button 
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                      data-testid="button-generate-ai"
                      onClick={handleGenerateContent}
                      disabled={generateContent.isPending}
                    >
                      {generateContent.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  )}
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    data-testid="button-publish"
                    onClick={handlePublish}
                    disabled={createPost.isPending}
                  >
                    {createPost.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Publish Post
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
