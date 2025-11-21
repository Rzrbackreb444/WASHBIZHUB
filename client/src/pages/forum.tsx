import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  MessageCircle,
  ThumbsUp,
  Clock,
} from "lucide-react";
import type { ForumCategory, EnrichedForumTopic } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function ForumPage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const { data: trendingTopics, isLoading: topicsLoading } = useQuery<EnrichedForumTopic[]>({
    queryKey: ["/api/forum/topics"],
  });

  const topTopics = trendingTopics
    ?.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <MessageSquare className="w-10 h-10 text-primary" />
                Community Forum
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with 72,000+ laundromat owners, share knowledge, and grow together
              </p>
            </div>
            <Link href="/forum/new">
              <Button size="lg" className="gap-2" data-testid="button-create-topic">
                <Plus className="w-5 h-5" />
                New Topic
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Categories */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Badge variant="secondary">{categories?.length || 0} Categories</Badge>
            </div>

            {categoriesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="hover-elevate">
                    <CardHeader className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum/category/${category.slug}`}
                  >
                    <Card
                      className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                      data-testid={`card-category-${category.slug}`}
                    >
                      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            {category.name}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {category.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {category.totalTopics || 0} topics
                        </Badge>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Trending Topics */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Trending Now</h2>
            </div>

            {topicsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardHeader className="p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topTopics.map((topic) => (
                  <Link key={topic.id} href={`/forum/topic/${topic.slug}`}>
                    <Card
                      className="hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`card-topic-${topic.id}`}
                    >
                      <CardHeader className="p-4 space-y-0">
                        <CardTitle className="text-sm font-medium line-clamp-2 mb-2">
                          {topic.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {topic.upvotes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {topic.replyCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {topic.views}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <Separator />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Topics</span>
                  <span className="font-bold">{trendingTopics?.length || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Today</span>
                  <Badge variant="secondary">
                    {trendingTopics?.filter(t => 
                      new Date(t.lastActivityAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
                    ).length || 0}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <span className="font-bold">{categories?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
