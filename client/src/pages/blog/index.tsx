import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SuperSEOWrapper } from "@/components/SuperSEOWrapper";
import { DEFAULT_AUTHOR, SEO_PRESETS } from "@/lib/seo-template";
import { WASHBIZHUB_GLASSMORPHISM, WASHBIZHUB_GRADIENTS, WASHBIZHUB_TYPOGRAPHY } from "@/lib/design-system";
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  BookOpen,
  TrendingUp,
  FileText,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  category: string;
  subcategory: string | null;
  authorName: string;
  authorImage: string | null;
  datePublished: string;
  dateModified: string;
  views: number;
  featured: boolean;
  seoScore: number | null;
}

interface BlogCategory {
  name: string;
  count: number;
  slug: string;
}

interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Industry News": TrendingUp,
  "Guides": BookOpen,
  "Case Studies": FileText,
  "Tools": Wrench,
  "Equipment": Wrench,
  "Operations": FileText,
  "Marketing": TrendingUp,
  "Finance": TrendingUp,
  "Growth": TrendingUp,
};

function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: postsData, isLoading: postsLoading } = useQuery<{
    posts: BlogPost[];
    pagination: BlogPagination;
  }>({
    queryKey: ["/api/blog/posts", currentPage, selectedCategory, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      const res = await fetch(`/api/blog/posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery<{
    categories: BlogCategory[];
    total: number;
  }>({
    queryKey: ["/api/blog/categories"],
  });

  const { data: featuredData } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/blog/featured"],
  });

  const posts = postsData?.posts ?? [];
  const pagination = postsData?.pagination;
  const categories = categoriesData?.categories ?? [];
  const featuredPosts = featuredData?.posts ?? [];

  const seoFaqs = [
    {
      question: "What topics does WashBizHub blog cover?",
      answer: "WashBizHub's blog covers comprehensive laundromat business topics including industry news, investment guides, case studies, equipment reviews, operational strategies, marketing tips, and financial analysis. Our content is backed by 72,000+ industry professionals."
    },
    {
      question: "How can I stay updated with laundromat industry news?",
      answer: "Subscribe to WashBizHub's blog for weekly industry news, guides, and case studies. Our team of industry experts and CLEANBI AI analyze market trends, equipment innovations, and business strategies to keep you informed about the laundromat industry."
    },
    {
      question: "Are WashBizHub blog articles free to read?",
      answer: "Yes, all WashBizHub blog articles are free to read. Premium members get access to additional exclusive content, downloadable PDFs, and priority access to new resources. Our blog covers everything from beginner guides to advanced investment strategies."
    },
    {
      question: "Who writes the WashBizHub blog content?",
      answer: "WashBizHub content is created by experienced laundromat industry professionals, former multi-location operators, and certified business valuators. Our research team combines 20+ years of industry experience with AI-powered insights for comprehensive coverage."
    }
  ];

  const breadcrumbs = [
    { name: "Blog", url: "/blog" }
  ];

  return (
    <SuperSEOWrapper
      title="Laundromat Industry Blog | Expert Guides, News & Case Studies"
      description="Expert laundromat business articles: industry news, investment guides, case studies, and operational strategies from 72,000+ professionals. Free tips and resources."
      keywords={[
        "laundromat blog",
        "laundromat industry news",
        "laundromat guides",
        "coin laundry tips",
        "laundromat case studies",
        "laundromat business articles",
        "laundry industry trends",
        "laundromat investment",
        "coin laundry operations",
        "laundromat profitability"
      ]}
      pageType="blog"
      author={DEFAULT_AUTHOR}
      faqs={seoFaqs}
      breadcrumbs={breadcrumbs}
      ogImage="https://washbizhub.com/blog-og-image.png"
      {...SEO_PRESETS.blog}
      showBreadcrumbs={true}
    >
      <div className={`min-h-screen ${WASHBIZHUB_GRADIENTS.primary} py-8 md:py-16`}>
        <div className="max-w-7xl mx-auto px-4">
          
          <header className="text-center mb-12">
            <h1 className={`${WASHBIZHUB_TYPOGRAPHY.heroHeadline} text-foreground mb-4`} data-testid="text-blog-heading">
              Industry Insights & Expert Guides
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert articles on laundromat profitability, operations, and growth strategies from the #1 laundromat intelligence platform.
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                data-testid="input-blog-search"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => { setSelectedCategory("all"); setCurrentPage(1); }}
                className="rounded-full"
                data-testid="button-category-all"
              >
                All ({categoriesData?.total ?? 0})
              </Button>
              {categories.slice(0, 6).map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.name] || FileText;
                return (
                  <Button
                    key={cat.name}
                    variant={selectedCategory === cat.name ? "default" : "outline"}
                    onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                    className="rounded-full gap-2"
                    data-testid={`button-category-${cat.slug}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {cat.name} ({cat.count})
                  </Button>
                );
              })}
            </div>
          </div>

          {featuredPosts.length > 0 && selectedCategory === "all" && !debouncedSearch && currentPage === 1 && (
            <section className="mb-16">
              <h2 className={`${WASHBIZHUB_TYPOGRAPHY.sectionTitle} text-foreground mb-6`}>
                Featured Articles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.slice(0, 3).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card 
                      className={`${WASHBIZHUB_GLASSMORPHISM.cardHover} h-full overflow-hidden group`}
                      data-testid={`card-featured-${post.id}`}
                    >
                      <div className="aspect-video bg-card/30 relative overflow-hidden">
                        {post.featuredImage ? (
                          <img 
                            src={post.featuredImage} 
                            alt={post.featuredImageAlt || post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge 
                          className="absolute top-3 left-3 bg-accent text-accent-foreground"
                        >
                          Featured
                        </Badge>
                      </div>
                      <CardHeader>
                        <Badge variant="outline" className="w-fit mb-2">
                          {post.category}
                        </Badge>
                        <CardTitle className="text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-muted-foreground">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{post.authorName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.datePublished).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${WASHBIZHUB_TYPOGRAPHY.sectionTitle} text-foreground`}>
                {selectedCategory === "all" ? "All Articles" : selectedCategory}
              </h2>
              {pagination && (
                <span className="text-muted-foreground">
                  Showing {posts.length} of {pagination.total} articles
                </span>
              )}
            </div>

            {postsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className={WASHBIZHUB_GLASSMORPHISM.card}>
                    <div className="aspect-video">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className={`${WASHBIZHUB_GLASSMORPHISM.card} text-center py-16`}>
                <CardContent>
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Articles Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {debouncedSearch 
                      ? `No results for "${debouncedSearch}". Try a different search term.`
                      : "No articles in this category yet. Check back soon!"}
                  </p>
                  <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card 
                        className={`${WASHBIZHUB_GLASSMORPHISM.cardHover} h-full overflow-hidden group`}
                        data-testid={`card-post-${post.id}`}
                      >
                        <div className="aspect-video bg-card/30 relative overflow-hidden">
                          {post.featuredImage ? (
                            <img 
                              src={post.featuredImage} 
                              alt={post.featuredImageAlt || post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                              <BookOpen className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                            {post.views > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                {post.views.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-foreground line-clamp-2 text-lg group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-muted-foreground text-sm">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[100px]">{post.authorName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(post.datePublished).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-4 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                            Read Article <ArrowRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <nav 
                    className="flex items-center justify-center gap-2 mt-12"
                    aria-label="Blog pagination"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev}
                      data-testid="button-page-prev"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          data-testid={`button-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={!pagination.hasNext}
                      data-testid="button-page-next"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </section>

          <section className={`${WASHBIZHUB_GLASSMORPHISM.card} mt-16 p-8 text-center`}>
            <h2 className={`${WASHBIZHUB_TYPOGRAPHY.cardTitle} text-foreground mb-4`}>
              Get Industry Updates Delivered
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join 72,000+ laundromat professionals receiving weekly insights, tips, and exclusive content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-newsletter-subscribe">
                Subscribe
              </Button>
            </div>
          </section>
        </div>
      </div>
    </SuperSEOWrapper>
  );
}

export default BlogIndexPage;
