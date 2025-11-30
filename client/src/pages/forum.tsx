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
import { SEO } from "@/components/SEO";

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
    <>
      <SEO 
        title="Laundromat Owner Forum - 72,000+ Members | Free Community | WashBizHub" 
        description="Join 72,000+ laundromat owners in the #1 industry forum. Get advice on pricing, operations, equipment, and more. Free to join. Ask questions, share experiences."
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
            answer: "WashBizHub hosts the largest laundromat owner community with 72,000+ members. Our free forum covers topics like pricing strategies, equipment selection, operations, marketing, and buying/selling laundromats. Join discussions, ask questions, and network with experienced owners and industry experts."
          },
          {
            question: "How do I get advice from experienced laundromat owners?",
            answer: "Post your question in the WashBizHub Community Forum. Our active community of 72,000+ laundromat owners and industry professionals responds to most questions within 24 hours. Categories include Operations, Equipment & Maintenance, Buying & Selling, Marketing, and more."
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
            answer: "Very active! With 72,000+ members, new topics and replies are posted daily. Trending topics are displayed on the sidebar, and you can sort by newest or most popular discussions. Most questions receive helpful responses within 24 hours."
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
          "description": "The largest online community for laundromat owners with 72,000+ members discussing operations, equipment, pricing, and business strategies.",
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
    </>
  );
}
