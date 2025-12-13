import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  StatusBadge,
  CardSkeleton,
  CardSkeletonGrid,
} from "@/components/premium";
import {
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  MessageCircle,
  ThumbsUp,
  Clock,
  Search,
  Users,
  Wrench,
  DollarSign,
  ShoppingCart,
  Megaphone,
  HelpCircle,
  Lightbulb,
  Shield,
  Zap,
  Star,
  Crown,
  ArrowRight,
  Flame,
} from "lucide-react";
import type { ForumCategory, EnrichedForumTopic } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  "operations": Wrench,
  "equipment": Wrench,
  "buying-selling": ShoppingCart,
  "marketing": Megaphone,
  "finance": DollarSign,
  "support": HelpCircle,
  "tips": Lightbulb,
  "security": Shield,
  "technology": Zap,
  "general": MessageSquare,
};

function getCategoryIcon(slug: string) {
  const lowerSlug = slug?.toLowerCase() || '';
  for (const [key, Icon] of Object.entries(categoryIcons)) {
    if (lowerSlug.includes(key)) return Icon;
  }
  return MessageSquare;
}

function ForumSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 skeleton-shimmer rounded" />
          <div className="h-6 w-24 skeleton-shimmer-subtle rounded-full" />
        </div>
        <CardSkeletonGrid 
          count={6} 
          columns={1} 
          variant="medium"
          showIcon={true}
          contentRows={2}
          testId="forum-category-skeleton"
        />
      </div>
      <div className="space-y-6">
        <div className="h-6 w-40 skeleton-shimmer rounded" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton 
              key={i} 
              variant="small" 
              contentRows={2}
              testId={`trending-skeleton-${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const { data: trendingTopics, isLoading: topicsLoading } = useQuery<EnrichedForumTopic[]>({
    queryKey: ["/api/forum/topics"],
  });

  const topTopics = trendingTopics
    ?.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 8) || [];

  const recentTopics = trendingTopics
    ?.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
    .slice(0, 5) || [];

  const activeMembers = trendingTopics
    ?.flatMap(t => [t.author])
    .filter((author, index, self) => 
      index === self.findIndex(a => a.id === author.id)
    )
    .slice(0, 8) || [];

  const filteredCategories = categories?.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = categoriesLoading || topicsLoading;

  return (
    <>
      <SEO 
        title="Laundromat Owner Forum - 73,000+ Members | Free Community | WashBizHub" 
        description="Join 73,000+ laundromat owners in the #1 industry forum. Get advice on pricing, operations, equipment, and more. Free to join. Ask questions, share experiences."
        keywords={[
          "laundromat forum",
          "laundromat owner community",
          "coin laundry forum",
          "laundromat advice",
          "laundromat owners group",
          "laundry business forum",
          "laundromat questions",
          "laundromat help",
          "laundromat discussion board",
          "commercial laundry forum",
          "laundromat networking",
          "laundromat tips",
          "laundromat owner support",
          "laundry industry community",
          "laundromat business advice"
        ]}
        canonicalUrl="/forum"
        ogType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/forum" }
        ]}
        faqs={[
          {
            question: "Where can I find a laundromat owner community or forum?",
            answer: "WashBizHub hosts the largest laundromat owner community with 73,000+ members. Our free forum covers topics like pricing strategies, equipment selection, operations, marketing, and buying/selling laundromats. Join discussions, ask questions, and network with experienced owners and industry experts."
          },
          {
            question: "How do I get advice from experienced laundromat owners?",
            answer: "Post your question in the WashBizHub Community Forum. Our active community of 73,000+ laundromat owners and industry professionals responds to most questions within 24 hours. Categories include Operations, Equipment & Maintenance, Buying & Selling, Marketing, and more."
          },
          {
            question: "What topics are discussed in laundromat forums?",
            answer: "Popular forum topics include: vend pricing strategies, equipment recommendations (Speed Queen vs Dexter), attendant vs unattended operations, utility cost reduction, marketing ideas, dealing with problem customers, buying/selling laundromats, financing options, and new technology like card/app payment systems."
          },
          {
            question: "Is the WashBizHub forum free to join?",
            answer: "Yes, the WashBizHub Community Forum is completely free. Create a topic, reply to discussions, and connect with other laundromat owners at no cost. Premium members get additional features like priority support and expert consultations, but forum access is free for everyone."
          },
          {
            question: "How do I start a new topic in the laundromat forum?",
            answer: "Click the 'New Topic' button at the top of the forum page. Choose the appropriate category (Operations, Equipment, Buying & Selling, etc.), write a clear title, and describe your question or discussion topic. The community typically responds within hours."
          },
          {
            question: "Can I ask questions about buying a laundromat?",
            answer: "Absolutely! Our Buying & Selling category is perfect for due diligence questions, valuation help, and advice on negotiating deals. Many forum members are experienced buyers and sellers who share insights on evaluating laundromats, financing, and avoiding common pitfalls."
          },
          {
            question: "How active is the WashBizHub laundromat forum?",
            answer: "Very active! With 73,000+ members, new topics and replies are posted daily. Trending topics are displayed on the sidebar, and you can sort by newest or most popular discussions. Most questions receive helpful responses within 24 hours."
          },
          {
            question: "Do industry experts participate in the forum?",
            answer: "Yes! WashBizHub forum includes equipment distributors, service technicians, brokers, lenders, and multi-store owners. Look for verified badges on expert profiles. Many manufacturers also monitor discussions to provide official support and product information."
          }
        ]}
        howTo={{
          name: "How to Get Help from Laundromat Experts in the WashBizHub Forum",
          description: "Step-by-step guide to asking questions and getting advice from the laundromat owner community",
          totalTime: "PT5M",
          steps: [
            {
              name: "Browse Existing Topics",
              text: "Search or browse forum categories to see if your question has already been answered. Use the search bar or click on relevant categories like Operations, Equipment, or Buying & Selling."
            },
            {
              name: "Create a New Topic",
              text: "Click the 'New Topic' button. Choose the most relevant category for your question to reach the right audience."
            },
            {
              name: "Write a Clear Title",
              text: "Create a specific, descriptive title that summarizes your question. For example: 'Speed Queen vs Dexter for 2,000 sq ft store' is better than 'Equipment advice needed'."
            },
            {
              name: "Provide Context",
              text: "Include relevant details: your location, store size, equipment age, specific challenges, and what you've already tried. The more context, the better advice you'll receive."
            },
            {
              name: "Engage with Responses",
              text: "Check back regularly for replies. Respond to follow-up questions and thank helpful members. Upvote useful answers to help others find good advice."
            },
            {
              name: "Share Your Experience",
              text: "Once you've solved your problem, update the topic with your results. This helps future owners who face similar challenges."
            }
          ]
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://washbizhub.com/forum"
          },
          "headline": "WashBizHub Community Forum - Laundromat Owner Discussions",
          "description": "The largest online community for laundromat owners with 73,000+ members discussing operations, equipment, pricing, and business strategies.",
          "author": {
            "@type": "Organization",
            "name": "WashBizHub"
          },
          "publisher": {
            "@type": "Organization",
            "name": "WashBizHub",
            "logo": {
              "@type": "ImageObject",
              "url": "https://washbizhub.com/washbizhub-logo.png"
            }
          },
          "about": [
            { "@type": "Thing", "name": "Laundromat Operations" },
            { "@type": "Thing", "name": "Commercial Laundry Equipment" },
            { "@type": "Thing", "name": "Laundromat Business" }
          ],
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": "72000"
          }
        }}
      />
      
      <div className="min-h-screen bg-background">
        <div className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <MessageSquare className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-forum-title">
                      Community Forum
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">
                      Connect with 73,000+ laundromat owners
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <StatusBadge 
                    variant="success" 
                    label="73K+ Members" 
                    icon={Users}
                    size="md"
                    testId="badge-members"
                  />
                  <StatusBadge 
                    variant="info" 
                    label={`${trendingTopics?.length || 0} Topics`}
                    icon={MessageSquare}
                    size="md"
                    testId="badge-topics"
                  />
                  <StatusBadge 
                    variant="warning" 
                    label="Active Now"
                    pulse
                    size="md"
                    testId="badge-active"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-background"
                    data-testid="input-forum-search"
                  />
                </div>
                <Link href="/forum/new">
                  <Button size="default" className="gap-2 w-full sm:w-auto" data-testid="button-create-topic">
                    <Plus className="w-4 h-4" />
                    New Topic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <ForumSkeleton />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-2xl font-bold flex items-center gap-2" data-testid="text-categories-heading">
                    <span className="p-1.5 rounded-lg bg-primary/10">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </span>
                    Categories
                  </h2>
                  <StatusBadge 
                    variant="neutral" 
                    label={`${filteredCategories?.length || 0} Categories`}
                    size="sm"
                    testId="badge-category-count"
                  />
                </div>

                <div className="grid gap-4">
                  {filteredCategories?.map((category) => {
                    const IconComponent = getCategoryIcon(category.slug);
                    return (
                      <Link
                        key={category.id}
                        href={`/forum/category/${category.slug}`}
                      >
                        <PremiumCard
                          interactive
                          accentPosition="left"
                          testId={`card-category-${category.slug}`}
                        >
                          <div className="p-5 md:p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 p-3 rounded-xl bg-accent/10 text-accent">
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-foreground" data-testid={`text-category-name-${category.slug}`}>
                                    {category.name}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <StatusBadge 
                                      variant="info"
                                      label={`${category.totalTopics || 0} topics`}
                                      size="sm"
                                      testId={`badge-topics-${category.slug}`}
                                    />
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-category-desc-${category.slug}`}>
                                  {category.description}
                                </p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 hidden md:block" />
                            </div>
                          </div>
                        </PremiumCard>
                      </Link>
                    );
                  })}
                </div>

                {recentTopics.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2" data-testid="text-recent-heading">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      Recent Discussions
                    </h2>
                    <div className="grid gap-3">
                      {recentTopics.map((topic) => (
                        <Link key={topic.id} href={`/forum/topic/${topic.slug}`}>
                          <PremiumCard interactive testId={`card-recent-${topic.id}`}>
                            <div className="p-4 flex items-center gap-4">
                              <Avatar className="w-10 h-10 flex-shrink-0">
                                {topic.author.profileImageUrl ? (
                                  <img src={topic.author.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {(topic.author.username || topic.author.firstName || 'A').substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-1">{topic.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>{topic.author.username || topic.author.firstName || 'Anonymous'}</span>
                                  <span>{formatDistanceToNow(new Date(topic.lastActivityAt), { addSuffix: true })}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {topic.replyCount}
                                </div>
                              </div>
                            </div>
                          </PremiumCard>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <PremiumCard accentPosition="top" accentGradient testId="card-trending-section">
                  <PremiumCardHeader 
                    title="Trending Now"
                    icon={<Flame className="w-5 h-5" />}
                    testId="trending-header"
                  />
                  <PremiumCardContent className="pt-0">
                    {topTopics.length > 0 ? (
                      <div className="space-y-3">
                        {topTopics.map((topic, index) => (
                          <Link key={topic.id} href={`/forum/topic/${topic.slug}`}>
                            <div 
                              className="group flex items-start gap-3 p-3 -mx-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                              data-testid={`card-trending-${topic.id}`}
                            >
                              <span className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                index === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" :
                                index === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" :
                                index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                  {topic.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
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
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No trending topics yet
                      </div>
                    )}
                  </PremiumCardContent>
                </PremiumCard>

                {activeMembers.length > 0 && (
                  <PremiumCard testId="card-active-members">
                    <PremiumCardHeader 
                      title="Active Members"
                      icon={<Users className="w-5 h-5" />}
                      testId="members-header"
                    />
                    <PremiumCardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {activeMembers.map((member) => (
                          <div 
                            key={member.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                            data-testid={`member-${member.id}`}
                          >
                            <Avatar className="w-7 h-7">
                              {member.profileImageUrl ? (
                                <img src={member.profileImageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {(member.username || member.firstName || 'A').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="text-xs font-medium truncate max-w-[80px]">
                              {member.username || member.firstName || 'Member'}
                            </span>
                            {member.role && member.role !== 'user' && (
                              <Crown className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>
                )}

                <PremiumCard testId="card-community-stats">
                  <PremiumCardHeader 
                    title="Community Stats"
                    icon={<TrendingUp className="w-5 h-5" />}
                    testId="stats-header"
                  />
                  <PremiumCardContent className="pt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Topics</span>
                      <span className="font-bold text-lg" data-testid="stat-total-topics">{trendingTopics?.length || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Today</span>
                      <StatusBadge 
                        variant="success"
                        label={String(trendingTopics?.filter(t => 
                          new Date(t.lastActivityAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
                        ).length || 0)}
                        pulse
                        size="sm"
                        testId="stat-active-today"
                      />
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Categories</span>
                      <span className="font-bold text-lg" data-testid="stat-categories">{categories?.length || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Replies</span>
                      <span className="font-bold text-lg" data-testid="stat-replies">
                        {trendingTopics?.reduce((sum, t) => sum + t.replyCount, 0) || 0}
                      </span>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>

                <PremiumCard className="bg-gradient-to-br from-primary/5 to-accent/5" testId="card-cta">
                  <PremiumCardContent className="text-center py-6">
                    <Star className="w-10 h-10 mx-auto text-accent mb-3" />
                    <h3 className="font-semibold mb-2">Share Your Expertise</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Help fellow owners by answering questions and sharing your experience
                    </p>
                    <Link href="/forum/new">
                      <Button variant="default" className="gap-2" data-testid="button-start-discussion">
                        <Plus className="w-4 h-4" />
                        Start a Discussion
                      </Button>
                    </Link>
                  </PremiumCardContent>
                </PremiumCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
