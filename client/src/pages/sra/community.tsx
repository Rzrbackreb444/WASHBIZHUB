import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Users,
  MessageSquare,
  Heart,
  ArrowLeft,
  Search,
  Plus,
  TrendingUp,
  Clock,
  ThumbsUp,
  MessageCircle,
  Flame,
  Award,
  Star,
  CheckCircle2
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";
import type { ForumCategory, ForumTopic } from "@shared/schema";

const categoryIcons: Record<string, typeof MessageSquare> = {
  "all": MessageSquare,
  "wins": Award,
  "victories": Award,
  "support": Heart,
  "questions": MessageCircle,
  "tips": Star,
  "recovery-tips": Star,
};

const defaultCategories = [
  { id: "all", name: "All Posts", icon: MessageSquare, count: 0 },
  { id: "wins", name: "Victories", icon: Award, count: 0 },
  { id: "support", name: "Support", icon: Heart, count: 0 },
  { id: "questions", name: "Questions", icon: MessageCircle, count: 0 },
  { id: "tips", name: "Recovery Tips", icon: Star, count: 0 },
];

const topContributors = [
  { name: "RecoveryWarrior23", posts: 156, streak: 89, avatar: null },
  { name: "TherapyChamp", posts: 134, streak: 67, avatar: null },
  { name: "StrokeCoach", posts: 98, streak: 45, avatar: null },
  { name: "HopeAndHeal", posts: 87, streak: 34, avatar: null },
];

function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}

function PostSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 bg-gray-800" />
              <Skeleton className="h-4 w-16 bg-gray-800" />
            </div>
            <Skeleton className="h-5 w-3/4 bg-gray-800" />
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-2/3 bg-gray-800" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16 bg-gray-800" />
              <Skeleton className="h-8 w-16 bg-gray-800" />
              <Skeleton className="h-6 w-20 bg-gray-800" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SRACommunity() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: apiCategories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ['/api/sra/forum/categories'],
  });

  const { data: topics, isLoading: topicsLoading } = useQuery<ForumTopic[]>({
    queryKey: ['/api/sra/forum/topics', activeCategory !== 'all' ? activeCategory : null],
    queryFn: async () => {
      const url = activeCategory !== 'all' 
        ? `/api/sra/forum/topics?categoryId=${activeCategory}`
        : '/api/sra/forum/topics';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch topics');
      return res.json();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ entityType, entityId, voteType }: { entityType: string; entityId: string; voteType: number }) => {
      const res = await apiRequest('POST', '/api/sra/forum/vote', { entityType, entityId, voteType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sra/forum/topics'] });
    },
  });

  const categories = apiCategories && apiCategories.length > 0
    ? [
        { id: "all", name: "All Posts", icon: MessageSquare, count: apiCategories.reduce((sum, c) => sum + (c.totalTopics || 0), 0) },
        ...apiCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: categoryIcons[cat.slug?.toLowerCase() || ''] || MessageSquare,
          count: cat.totalTopics || 0,
        })),
      ]
    : defaultCategories;

  const filteredTopics = topics?.filter(topic => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return topic.title.toLowerCase().includes(query) || 
             topic.content.toLowerCase().includes(query);
    }
    return true;
  }) || [];

  const handleVote = (topicId: string, voteType: number) => {
    voteMutation.mutate({ entityType: 'topic', entityId: topicId, voteType });
  };

  const isLoading = categoriesLoading || topicsLoading;
  const totalPosts = apiCategories?.reduce((sum, c) => sum + (c.totalTopics || 0), 0) || 0;

  return (
    <>
      <Helmet>
        <title>Community Forum | Stroke Recovery Academy</title>
        <meta name="description" content="Connect with fellow stroke survivors. Share victories, get support, and learn from others on the recovery journey." />
        <meta property="og:title" content="Community Forum | Stroke Recovery Academy" />
        <meta property="og:description" content="Join our supportive community of stroke survivors. Share your journey, celebrate wins, and never recover alone." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sra">
                  <Button variant="ghost" size="icon" data-testid="button-back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold" data-testid="text-title">Community Forum</h1>
                    <p className="text-sm text-gray-400">Connect • Share • Recover</p>
                  </div>
                </div>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-new-post">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-600/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500" data-testid="stat-members">12,847</div>
                  <div className="text-xs text-gray-400">Warriors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500" data-testid="stat-posts">
                    {categoriesLoading ? <Skeleton className="h-7 w-12 bg-gray-800 inline-block" /> : totalPosts.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500" data-testid="stat-online">247</div>
                  <div className="text-xs text-gray-400">Online Now</div>
                </div>
              </div>
              <p className="text-sm italic text-gray-300" data-testid="text-tagline">
                "You're not alone. We recover together."
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="pl-10 bg-gray-900 border-gray-700"
                    data-testid="input-search"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categoriesLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-9 w-28 bg-gray-800 rounded-md" />
                    ))}
                  </>
                ) : (
                  categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(category.id)}
                      className={activeCategory === category.id ? "bg-orange-600 hover:bg-orange-700" : "border-gray-700"}
                      data-testid={`button-category-${category.id}`}
                    >
                      <category.icon className="h-4 w-4 mr-2" />
                      {category.name}
                      <Badge variant="secondary" className="ml-2 bg-gray-700 text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  ))
                )}
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {topicsLoading ? (
                  <>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                  </>
                ) : filteredTopics.length === 0 ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Be the first to share your story or ask a question!
                      </p>
                      <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-first-post">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTopics.map((topic) => {
                    const category = categories.find(c => c.id === topic.categoryId);
                    return (
                      <Card 
                        key={topic.id} 
                        className={`bg-gray-900 border-gray-800 hover-elevate cursor-pointer ${topic.isPinned ? 'border-orange-600/50' : ''}`} 
                        data-testid={`post-card-${topic.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Avatar className="h-10 w-10 border border-gray-700">
                              <AvatarFallback className="bg-orange-600 text-sm">
                                {(topic.title || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">User</span>
                                {topic.isPinned && (
                                  <Badge className="bg-orange-600 text-xs">Pinned</Badge>
                                )}
                                {topic.isHot && (
                                  <Badge className="bg-red-600 text-xs">
                                    <Flame className="h-3 w-3 mr-1" />
                                    Hot
                                  </Badge>
                                )}
                                {topic.isSolved && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                                <span className="text-xs text-gray-500">• {formatTimeAgo(topic.createdAt)}</span>
                              </div>
                              <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{topic.content}</p>
                              <div className="flex items-center gap-4 flex-wrap">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-orange-500"
                                  onClick={() => handleVote(topic.id, 1)}
                                  disabled={voteMutation.isPending}
                                  data-testid={`button-like-${topic.id}`}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  {topic.upvotes || 0}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-orange-500" 
                                  data-testid={`button-comment-${topic.id}`}
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {topic.replyCount || 0}
                                </Button>
                                {category && (
                                  <Badge variant="outline" className="border-gray-600 text-xs">
                                    {category.name}
                                  </Badge>
                                )}
                                {topic.tags && topic.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {topic.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="bg-gray-800 text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Community Guidelines */}
              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-600/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-orange-500" />
                    Community Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Be supportive and kind</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Celebrate all victories</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Share honestly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Respect privacy</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Contributors */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Top Warriors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topContributors.map((contributor, idx) => (
                    <div key={contributor.name} className="flex items-center gap-3" data-testid={`contributor-${idx}`}>
                      <span className="text-orange-500 font-bold w-4">{idx + 1}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-700 text-xs">
                          {contributor.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{contributor.name}</p>
                        <p className="text-xs text-gray-500">{contributor.posts} posts</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <Flame className="h-3 w-3" />
                        {contributor.streak}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Join Banner */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-4 text-center">
                  <img src={sosLogo} alt="SOS" className="h-12 w-12 mx-auto mb-3 opacity-75" />
                  <h4 className="font-semibold mb-2">Never Recover Alone</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Join 12,000+ warriors in the largest stroke recovery community.
                  </p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-join">
                    Join Now Free
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
