import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBlogPosts, useCreateBlogPost, useGenerateBlogContent } from "@/hooks/use-blog";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function Blog() {
  const [activeTab, setActiveTab] = useState("browse");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Operations",
  });

  const { toast } = useToast();
  const { data: posts = [], isLoading } = useBlogPosts();
  const createPost = useCreateBlogPost();
  const generateContent = useGenerateBlogContent();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  const seoKeywords = [
    "laundromat industry news",
    "laundromat business tips",
    "how to run a laundromat blog",
    "coin laundry tips",
    "laundromat operations guide",
    "laundromat profitability strategies",
    "coin laundry management",
    "self-service laundry advice",
    "laundromat marketing ideas",
    "laundromat maintenance tips",
    "laundromat industry trends",
    "laundromat business articles",
    "commercial laundry blog",
    "laundromat owner resources",
    "laundry business insights"
  ];

  const blogFaqs = [
    {
      question: "Where can I find laundromat industry news?",
      answer: "WashBizHub's blog publishes regular laundromat industry news covering equipment innovations, market trends, regulatory updates, and business strategies. We aggregate insights from 72,000+ professionals and industry experts to keep you informed about the latest developments in the coin laundry sector."
    },
    {
      question: "How do I run a successful laundromat blog?",
      answer: "Running a successful laundromat blog involves sharing practical operations tips, industry news, success stories, and educational content. Focus on SEO optimization, consistent publishing, and addressing common pain points like equipment maintenance, customer acquisition, and profitability optimization. WashBizHub offers AI-powered content generation to help you create professional articles quickly."
    },
    {
      question: "What are the best coin laundry tips for beginners?",
      answer: "Top coin laundry tips for beginners: 1) Focus on high-traffic locations with 40%+ renters, 2) Invest in efficient equipment to reduce utility costs, 3) Price based on local competition and costs, 4) Maintain clean, safe facilities, 5) Implement card payment systems, 6) Use IoT monitoring for predictive maintenance, and 7) Join community forums like WashBizHub to learn from experienced operators."
    },
    {
      question: "What topics does the WashBizHub blog cover?",
      answer: "The WashBizHub blog covers comprehensive laundromat topics including: operations optimization, marketing strategies, equipment maintenance, financial management, growth tactics, industry trends, technology adoption (IoT, AI), regulatory compliance, customer service best practices, and success stories from top-performing laundromats."
    },
    {
      question: "How often is new laundromat content published?",
      answer: "WashBizHub publishes fresh laundromat content weekly, including expert articles, industry analysis, how-to guides, and case studies. Premium members get access to exclusive deep-dive content, while free users can browse all published blog posts and community contributions."
    },
    {
      question: "Can I contribute articles to WashBizHub's blog?",
      answer: "Yes, WashBizHub welcomes contributions from laundromat professionals. You can create and publish blog posts directly through our platform. Our AI content generation tool helps you draft professional articles, and your contributions reach our community of 72,000+ laundromat owners and operators."
    },
    {
      question: "What makes WashBizHub different from other laundromat blogs?",
      answer: "WashBizHub combines expert-written content with AI-powered tools, data-driven insights from 72,000+ members, and practical resources like calculators, CLEANBI scoring, and equipment databases. Unlike generic blogs, we provide actionable intelligence backed by real industry data and professional expertise."
    },
    {
      question: "How can I stay updated on laundromat industry trends?",
      answer: "Stay updated by: 1) Following the WashBizHub blog for weekly articles, 2) Joining our 72,000+ member community forum, 3) Subscribing to our newsletter for curated insights, 4) Using CLEANBI to track market conditions in your area, and 5) Connecting with industry vendors and experts through our directory."
    }
  ];

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "WashBizHub Laundromat Blog",
    "description": "Expert articles on laundromat profitability, operations, maintenance, growth strategies, and industry trends from the #1 laundromat resource hub.",
    "url": `${baseUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": { "@type": "ImageObject", "url": `${baseUrl}/washbizhub-logo.png` }
    },
    "inLanguage": "en-US",
    "audience": {
      "@type": "Audience",
      "audienceType": "Laundromat owners, operators, investors"
    }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest Laundromat Articles",
    "description": "Recent blog posts from WashBizHub covering laundromat operations, profitability, and industry trends",
    "numberOfItems": posts.length,
    "itemListElement": posts.slice(0, 10).map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.content.substring(0, 150),
        "url": `${baseUrl}/blog/${post.id}`,
        "author": { "@type": "Organization", "name": "WashBizHub" },
        "publisher": {
          "@type": "Organization",
          "name": "WashBizHub",
          "logo": { "@type": "ImageObject", "url": `${baseUrl}/washbizhub-logo.png` }
        },
        "articleSection": post.category,
        "datePublished": new Date().toISOString()
      }
    }))
  };

  const structuredData = [blogSchema, itemListSchema];

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
        type: "manual",
        category: newPost.category,
        featured: false,
        published: true,
      });

      setNewPost({ title: "", content: "", category: "Operations" });
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
    <>
      <SEO 
        title="WashBizHub Blog | Laundromat Industry News, Tips & Expert Articles" 
        description="Expert laundromat articles: operations, profitability, maintenance, marketing. Industry news from 72,000+ professionals. Free tips and guides."
        keywords={seoKeywords} 
        canonicalUrl="/blog"
        structuredData={structuredData}
        faqs={blogFaqs}
        speakableSelectors={["h1", ".blog-post-title", "[data-testid='text-blog-title']"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" }
        ]}
      />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-blog-title">
            Blog Suite
          </h1>
          <p className="text-xl text-white/70" data-testid="text-blog-subtitle">
            Expert Content for Laundromat Professionals
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
                      <SelectItem value="Partners">Partners</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Button 
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
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
                        Generate Draft
                      </>
                    )}
                  </Button>
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
    </>
  );
}
