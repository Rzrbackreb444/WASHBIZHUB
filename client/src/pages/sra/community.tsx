import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const categories = [
  { id: "all", name: "All Posts", icon: MessageSquare, count: 1247 },
  { id: "wins", name: "Victories", icon: Award, count: 342 },
  { id: "support", name: "Support", icon: Heart, count: 456 },
  { id: "questions", name: "Questions", icon: MessageCircle, count: 289 },
  { id: "tips", name: "Recovery Tips", icon: Star, count: 160 },
];

const mockPosts = [
  {
    id: "1",
    author: "RecoveryWarrior23",
    avatar: null,
    title: "Just walked 100 steps without my cane!",
    content: "After 8 months of grinding every day, I finally hit this milestone. Nick always says 'the grind is the gospel' and he's right. Don't give up, warriors!",
    category: "wins",
    likes: 247,
    comments: 52,
    timeAgo: "2 hours ago",
    verified: true,
    pinned: true
  },
  {
    id: "2",
    author: "StrokeSurvivor2023",
    avatar: null,
    title: "Struggling with fatigue - any tips?",
    content: "I'm 6 months post-stroke and the fatigue is overwhelming. Some days I can barely get out of bed. Has anyone found strategies that help?",
    category: "support",
    likes: 89,
    comments: 34,
    timeAgo: "4 hours ago",
    verified: false
  },
  {
    id: "3",
    author: "TherapyChamp",
    avatar: null,
    title: "MusicGlove changed everything for my hand recovery",
    content: "I was skeptical about the MusicGlove but after 6 weeks of daily use, I can finally grip a cup again. The gamification makes therapy actually fun!",
    category: "tips",
    likes: 156,
    comments: 28,
    timeAgo: "6 hours ago",
    verified: true
  },
  {
    id: "4",
    author: "NewToRecovery",
    avatar: null,
    title: "Day 30 of my recovery journey",
    content: "Just hit my 30-day streak on the tracker! Small wins but they add up. Grateful for this community.",
    category: "wins",
    likes: 203,
    comments: 41,
    timeAgo: "8 hours ago",
    verified: false
  }
];

const topContributors = [
  { name: "RecoveryWarrior23", posts: 156, streak: 89, avatar: null },
  { name: "TherapyChamp", posts: 134, streak: 67, avatar: null },
  { name: "StrokeCoach", posts: 98, streak: 45, avatar: null },
  { name: "HopeAndHeal", posts: 87, streak: 34, avatar: null },
];

export default function SRACommunity() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = mockPosts.filter(post => 
    activeCategory === "all" || post.category === activeCategory
  );

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
                  <div className="text-2xl font-bold text-orange-500" data-testid="stat-posts">8,923</div>
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
                {categories.map((category) => (
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
                ))}
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className={`bg-gray-900 border-gray-800 hover-elevate cursor-pointer ${post.pinned ? 'border-orange-600/50' : ''}`} data-testid={`post-card-${post.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10 border border-gray-700">
                          <AvatarFallback className="bg-orange-600 text-sm">
                            {post.author.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{post.author}</span>
                            {post.verified && (
                              <CheckCircle2 className="h-4 w-4 text-orange-500" />
                            )}
                            {post.pinned && (
                              <Badge className="bg-orange-600 text-xs">Pinned</Badge>
                            )}
                            <span className="text-xs text-gray-500">• {post.timeAgo}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500" data-testid={`button-like-${post.id}`}>
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500" data-testid={`button-comment-${post.id}`}>
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Badge variant="outline" className="border-gray-600 text-xs">
                              {categories.find(c => c.id === post.category)?.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
