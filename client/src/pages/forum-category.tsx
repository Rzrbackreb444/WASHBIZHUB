import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Eye,
  MessageCircle,
  ThumbsUp,
  ArrowLeft,
  Plus,
  Pin,
  Lock,
  Flame,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { ForumCategory, EnrichedForumTopic } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function ForumCategoryPage() {
  const params = useParams();
  const categorySlug = params.slug;
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");

  const { data: categories } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const category = categories?.find(c => c.slug === categorySlug);

  const { data: topics, isLoading } = useQuery<EnrichedForumTopic[]>({
    queryKey: ["/api/forum/topics", categorySlug],
    queryFn: async () => {
      const res = await fetch(`/api/forum/topics?categoryId=${category?.id || ""}`);
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
    enabled: !!category,
  });

  // Sort topics
  const sortedTopics = topics ? [...topics].sort((a, b) => {
    if (sortBy === "hot") {
      // Hot: combination of recent activity and votes
      const scoreA = (a.upvotes - a.downvotes) + a.replyCount * 0.5;
      const scoreB = (b.upvotes - b.downvotes) + b.replyCount * 0.5;
      const timeA = new Date(a.lastActivityAt).getTime();
      const timeB = new Date(b.lastActivityAt).getTime();
      return (scoreB / (Date.now() - timeB)) - (scoreA / (Date.now() - timeA));
    } else if (sortBy === "new") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // top: most upvotes
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
  }) : [];

  // Separate pinned topics
  const pinnedTopics = sortedTopics.filter(t => t.isPinned);
  const regularTopics = sortedTopics.filter(t => !t.isPinned);

  if (!category && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Link href="/forum">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/forum">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-forum">
                <ArrowLeft className="w-4 h-4" />
                Forum
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                {category?.name}
              </h1>
              <p className="text-muted-foreground">
                {category?.description}
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
        {/* Sort Tabs */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <TabsList>
              <TabsTrigger value="hot" className="gap-2">
                <Flame className="w-4 h-4" />
                Hot
              </TabsTrigger>
              <TabsTrigger value="new" className="gap-2">
                <Clock className="w-4 h-4" />
                New
              </TabsTrigger>
              <TabsTrigger value="top" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Top
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Badge variant="secondary">
            {topics?.length || 0} Topics
          </Badge>
        </div>

        {/* Topics List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned Topics */}
            {pinnedTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} isPinned />
            ))}

            {/* Regular Topics */}
            {regularTopics.length === 0 && pinnedTopics.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to start a discussion in this category
                  </p>
                  <Link href="/forum/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Topic
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              regularTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCard({ topic, isPinned = false }: { topic: EnrichedForumTopic; isPinned?: boolean }) {
  const displayName = topic.author.username || `${topic.author.firstName || ''} ${topic.author.lastName || ''}`.trim() || 'Anonymous';
  const initials = displayName.substring(0, 2).toUpperCase();
  
  return (
    <Link href={`/forum/topic/${topic.slug}`}>
      <Card
        className="hover-elevate active-elevate-2 cursor-pointer"
        data-testid={`card-topic-${topic.id}`}
      >
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <Avatar className="w-10 h-10 shrink-0">
            {topic.author.profileImageUrl ? (
              <img src={topic.author.profileImageUrl} alt={displayName} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-sm">{displayName}</span>
              {topic.author.role && (
                <Badge variant="secondary" className="text-xs">
                  {topic.author.role}
                </Badge>
              )}
            </div>
            {topic.author.tagline && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                {topic.author.tagline}
              </p>
            )}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isPinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="w-3 h-3" />
                  Pinned
                </Badge>
              )}
              {topic.isLocked && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </Badge>
              )}
              {(topic.tags as string[] || []).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {topic.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {topic.content.substring(0, 200)}...
            </CardDescription>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {topic.upvotes - topic.downvotes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {topic.replyCount} replies
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {topic.views} views
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(topic.lastActivityAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
