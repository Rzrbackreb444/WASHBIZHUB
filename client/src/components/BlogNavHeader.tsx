import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  FileText,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  Star,
  BookOpen,
  Newspaper
} from "lucide-react";
import type { BlogPost } from "@shared/schema";

const CATEGORIES = [
  { value: "all", label: "All Posts", icon: FileText },
  { value: "Industry News", label: "News", icon: Newspaper },
  { value: "Guides", label: "Guides", icon: BookOpen },
  { value: "Case Studies", label: "Case Studies", icon: TrendingUp },
  { value: "Equipment", label: "Equipment", icon: Star },
  { value: "Operations", label: "Operations", icon: Clock },
];

interface BlogNavHeaderProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  showFeatured?: boolean;
  compact?: boolean;
}

export default function BlogNavHeader({ 
  selectedCategory = "all", 
  onCategoryChange,
  showFeatured = true,
  compact = false
}: BlogNavHeaderProps) {
  const { data: recentPosts = [], isLoading: isLoadingRecent } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/blog/posts?limit=5");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      return data.posts || [];
    }
  });

  const { data: featuredPosts = [], isLoading: isLoadingFeatured } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/blog/posts?featured=true&limit=4");
      if (!res.ok) throw new Error("Failed to fetch featured posts");
      const data = await res.json();
      return data.posts || [];
    },
    enabled: showFeatured
  });

  if (compact) {
    return (
      <div className="border-b bg-muted/30">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center gap-1 px-4 py-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.value;
              return (
                <Button
                  key={cat.value}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5 shrink-0"
                  onClick={() => onCategoryChange?.(cat.value)}
                  data-testid={`button-category-${cat.value}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="border-b bg-gradient-to-b from-muted/50 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-2" data-testid="nav-categories">
                  <FileText className="h-4 w-4" />
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <NavigationMenuLink key={cat.value} asChild>
                          <button
                            onClick={() => onCategoryChange?.(cat.value)}
                            className={`flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent ${
                              selectedCategory === cat.value ? "bg-accent" : ""
                            }`}
                            data-testid={`nav-category-${cat.value}`}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium">{cat.label}</div>
                              <p className="text-xs text-muted-foreground">
                                Browse {cat.label.toLowerCase()} posts
                              </p>
                            </div>
                          </button>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {showFeatured && featuredPosts.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="gap-2" data-testid="nav-featured">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Featured
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4 md:w-[500px]">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-medium">Featured Articles</h4>
                        <Link href="/blog?featured=true">
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            View All <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {isLoadingFeatured ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3 rounded-lg p-2">
                              <Skeleton className="h-12 w-12 shrink-0 rounded" />
                              <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </div>
                          ))
                        ) : (
                          featuredPosts.slice(0, 4).map((post) => (
                            <NavigationMenuLink key={post.id} asChild>
                              <Link href={`/blog/${post.slug}`}>
                                <div 
                                  className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent cursor-pointer"
                                  data-testid={`nav-featured-post-${post.id}`}
                                >
                                  {post.featuredImage && (
                                    <img
                                      src={post.featuredImage}
                                      alt={post.featuredImageAlt || post.title}
                                      className="h-12 w-12 shrink-0 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium line-clamp-1">{post.title}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge variant="secondary" className="text-[10px] h-4">
                                        {post.category}
                                      </Badge>
                                      <span>{post.views || 0} views</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))
                        )}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-2" data-testid="nav-recent">
                  <Clock className="h-4 w-4" />
                  Recent
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4 md:w-[500px]">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Latest Articles</h4>
                      <Link href="/blog">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          View All <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {isLoadingRecent ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex gap-3 rounded-lg p-2">
                            <Skeleton className="h-12 w-12 shrink-0 rounded" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))
                      ) : (
                        recentPosts.slice(0, 5).map((post) => (
                          <NavigationMenuLink key={post.id} asChild>
                            <Link href={`/blog/${post.slug}`}>
                              <div 
                                className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent cursor-pointer"
                                data-testid={`nav-recent-post-${post.id}`}
                              >
                                {post.featuredImage ? (
                                  <img
                                    src={post.featuredImage}
                                    alt={post.featuredImageAlt || post.title}
                                    className="h-12 w-12 shrink-0 rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-12 w-12 shrink-0 rounded bg-muted flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium line-clamp-1">{post.title}</div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-[10px] h-4">
                                      {post.category}
                                    </Badge>
                                    {post.datePublished && (
                                      <span>{new Date(post.datePublished).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))
                      )}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <Link href="/admin/blog">
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex" data-testid="link-write-post">
                <Sparkles className="h-4 w-4" />
                Write Post
              </Button>
            </Link>
          </div>
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-3">
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <Button
                  key={cat.value}
                  variant={isSelected ? "default" : "secondary"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => onCategoryChange?.(cat.value)}
                  data-testid={`button-quick-category-${cat.value}`}
                >
                  {cat.label}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
