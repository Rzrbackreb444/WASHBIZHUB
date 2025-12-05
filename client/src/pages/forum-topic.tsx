import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  StatusBadge,
  CardSkeleton,
} from "@/components/premium";
import { GifPicker } from "@/components/GifPicker";
import { FileUpload } from "@/components/FileUpload";
import {
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Send,
  Pin,
  Lock,
  CheckCircle2,
  Image,
  Video,
  ZoomIn,
  Smile,
  Paperclip,
  Quote,
  Reply,
  Clock,
  Crown,
  Shield,
  Star,
  Sparkles,
  MessageCircle,
  X,
  Plus,
  Play,
} from "lucide-react";
import type { EnrichedForumTopic, EnrichedForumReply } from "@shared/schema";
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

function formatTimestamp(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  } else if (isThisWeek(date)) {
    return format(date, "EEEE 'at' h:mm a");
  } else {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  }
}

function getRoleBadge(role: string | null | undefined) {
  if (!role || role === 'user') return null;
  
  const roleConfig: Record<string, { variant: "premium" | "success" | "info" | "warning"; icon: any }> = {
    admin: { variant: "premium", icon: Crown },
    moderator: { variant: "warning", icon: Shield },
    expert: { variant: "success", icon: Star },
    contributor: { variant: "info", icon: Sparkles },
  };
  
  const config = roleConfig[role.toLowerCase()] || { variant: "info" as const, icon: Star };
  return (
    <StatusBadge 
      variant={config.variant}
      label={role.charAt(0).toUpperCase() + role.slice(1)}
      icon={config.icon}
      size="sm"
    />
  );
}

function TopicSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CardSkeleton 
        variant="large" 
        showIcon 
        contentRows={5} 
        showFooter
        testId="topic-skeleton"
      />
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 skeleton-shimmer rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <CardSkeleton 
            key={i} 
            variant="medium" 
            showIcon 
            contentRows={3}
            testId={`reply-skeleton-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ForumTopicPage() {
  const params = useParams();
  const topicSlug = params.slug;
  const { toast } = useToast();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [selectedGif, setSelectedGif] = useState<{url: string; previewUrl: string} | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{url: string; filename: string; contentType: string; size: number}[]>([]);
  const [quotedReply, setQuotedReply] = useState<EnrichedForumReply | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: topics, isLoading: topicsLoading } = useQuery<EnrichedForumTopic[]>({
    queryKey: ["/api/forum/topics"],
  });

  const topic = topics?.find(t => t.slug === topicSlug);

  const { data: replies, isLoading: repliesLoading } = useQuery<EnrichedForumReply[]>({
    queryKey: ["/api/forum/topics", topic?.id, "replies"],
    queryFn: async () => {
      const res = await fetch(`/api/forum/topics/${topic!.id}/replies`);
      if (!res.ok) throw new Error("Failed to fetch replies");
      return res.json();
    },
    enabled: !!topic,
  });

  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/forum/replies", {
        topicId: topic!.id,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics", topic!.id, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      setReplyContent("");
      setSelectedGif(null);
      setAttachedFiles([]);
      setQuotedReply(null);
      toast({
        title: "Reply posted!",
        description: "Your reply has been added to the discussion.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    let finalContent = replyContent.trim();
    
    if (quotedReply) {
      const quotedAuthor = quotedReply.author.username || quotedReply.author.firstName || 'Anonymous';
      const quotedText = quotedReply.content.substring(0, 150);
      finalContent = `> **${quotedAuthor}** said:\n> ${quotedText}${quotedReply.content.length > 150 ? '...' : ''}\n\n${finalContent}`;
    }
    
    if (selectedGif) {
      finalContent += `\n\n![GIF](${selectedGif.url})`;
    }
    
    if (!finalContent) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }
    createReplyMutation.mutate(finalContent);
  };

  const handleGifSelect = (gifUrl: string, previewUrl: string) => {
    setSelectedGif({ url: gifUrl, previewUrl });
  };

  const handleQuoteReply = (reply: EnrichedForumReply) => {
    setQuotedReply(reply);
    replyTextareaRef.current?.focus();
    replyTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const isLoading = topicsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="h-9 w-32 skeleton-shimmer rounded" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <TopicSkeleton />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This topic may have been removed or the link is incorrect.
          </p>
          <Link href="/forum">
            <Button variant="default" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const authorDisplayName = topic.author.username || `${topic.author.firstName || ''} ${topic.author.lastName || ''}`.trim() || 'Anonymous';
  const authorInitials = authorDisplayName.substring(0, 2).toUpperCase();
  
  const topicMeta = topic as any;
  const seoTitle = topicMeta.metaTitle || topic.title;
  const seoDescription = topicMeta.metaDescription || topic.content.substring(0, 160).replace(/\n/g, ' ');
  const seoKeywords = topicMeta.keywords || (topic.tags as string[]) || [];
  const topicImages = (topicMeta.images as string[]) || [];
  const topicVideos = (topicMeta.videos as string[]) || [];
  const datePublished = topic.createdAt ? format(new Date(topic.createdAt), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined;
  const dateModified = topic.lastActivityAt ? format(new Date(topic.lastActivityAt), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined;

  const discussionForumPosting = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": topic.title,
    "text": topic.content,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": authorDisplayName,
      "image": topic.author.profileImageUrl || undefined,
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": topic.upvotes
      },
      {
        "@type": "InteractionCounter", 
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": topic.replyCount
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": topic.views
      }
    ],
    "url": typeof window !== 'undefined' ? window.location.href : undefined,
    "image": topicImages.length > 0 ? topicImages[0] : undefined,
  };

  const bestAnswer = replies?.find(r => r.isBestAnswer);
  const qaPageData = bestAnswer ? {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": topic.title,
      "text": topic.content,
      "dateCreated": datePublished,
      "author": { "@type": "Person", "name": authorDisplayName },
      "answerCount": topic.replyCount,
      "upvoteCount": topic.upvotes,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": bestAnswer.content,
        "dateCreated": bestAnswer.createdAt ? format(new Date(bestAnswer.createdAt), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
        "upvoteCount": bestAnswer.upvotes,
        "author": {
          "@type": "Person",
          "name": bestAnswer.author.username || `${bestAnswer.author.firstName || ''} ${bestAnswer.author.lastName || ''}`.trim() || 'Anonymous',
        }
      }
    }
  } : null;

  const structuredDataArray: object[] = [discussionForumPosting];
  if (qaPageData) structuredDataArray.push(qaPageData);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={`/forum/topic/${topic.slug}`}
        ogType="article"
        ogImage={topicImages[0]}
        datePublished={datePublished}
        dateModified={dateModified}
        author={{
          name: authorDisplayName,
          expertise: "Laundromat Industry Professional",
          credentials: topic.author.tagline || undefined,
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Forum", url: "/forum" },
          { name: topic.title, url: `/forum/topic/${topic.slug}` },
        ]}
        structuredData={structuredDataArray}
      />

      <div className="border-b bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="container mx-auto px-4 py-4">
          <Link href="/forum">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-forum">
              <ArrowLeft className="w-4 h-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <PremiumCard accentPosition="left" accentGradient testId="card-topic-main">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {topic.isPinned && (
                  <StatusBadge variant="warning" label="Pinned" icon={Pin} size="sm" testId="badge-pinned" />
                )}
                {topic.isLocked && (
                  <StatusBadge variant="error" label="Locked" icon={Lock} size="sm" testId="badge-locked" />
                )}
                {(topic.tags as string[] || []).map((tag) => (
                  <StatusBadge key={tag} variant="neutral" label={tag} size="sm" />
                ))}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-topic-title">
                {topic.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <StatusBadge variant="info" label={`${topic.views} views`} icon={Eye} size="sm" testId="badge-views" />
                <StatusBadge variant="success" label={`${topic.replyCount} replies`} icon={MessageCircle} size="sm" testId="badge-replies" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimestamp(new Date(topic.createdAt))}</span>
                </div>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
                {topic.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>

              {topicImages.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Images</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {topicImages.map((img, idx) => (
                      <Dialog key={idx}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer overflow-hidden rounded-lg border hover-elevate">
                            <img 
                              src={img} 
                              alt={`Image ${idx + 1}`}
                              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <VisuallyHidden>
                            <DialogHeader>
                              <DialogTitle>Image {idx + 1}</DialogTitle>
                              <DialogDescription>Full-size image from forum post</DialogDescription>
                            </DialogHeader>
                          </VisuallyHidden>
                          <img src={img} alt={`Image ${idx + 1}`} className="w-full h-auto rounded-lg" />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              )}

              {topicVideos.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Videos</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topicVideos.map((video, idx) => {
                      let embedUrl = video;
                      if (video.includes('youtube.com/watch')) {
                        const videoId = new URL(video).searchParams.get('v');
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (video.includes('youtu.be/')) {
                        const videoId = video.split('youtu.be/')[1]?.split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (video.includes('vimeo.com/')) {
                        const videoId = video.split('vimeo.com/')[1]?.split('?')[0];
                        embedUrl = `https://player.vimeo.com/video/${videoId}`;
                      }
                      
                      return (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border">
                          <iframe
                            src={embedUrl}
                            title={`Video ${idx + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator className="my-6" />
              
              <div className="flex items-center justify-between flex-wrap gap-4">
                <VoteButtons
                  entityType="topic"
                  entityId={topic.id}
                  upvotes={topic.upvotes}
                  downvotes={topic.downvotes}
                />
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-accent/20">
                    {topic.author.profileImageUrl ? (
                      <img src={topic.author.profileImageUrl} alt={authorDisplayName} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-accent/10 text-accent font-semibold">{authorInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <span className="font-semibold">{authorDisplayName}</span>
                      {getRoleBadge(topic.author.role)}
                    </div>
                    {topic.author.tagline && (
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                        {topic.author.tagline}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-bold flex items-center gap-2" data-testid="text-replies-heading">
                <span className="p-1.5 rounded-lg bg-primary/10">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </span>
                {replies?.length || 0} {replies?.length === 1 ? "Reply" : "Replies"}
              </h2>
              {replies && replies.length > 0 && (
                <StatusBadge 
                  variant="success" 
                  label="Active Discussion"
                  pulse
                  size="sm"
                />
              )}
            </div>

            {repliesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} variant="medium" showIcon contentRows={3} testId={`reply-skeleton-${i}`} />
                ))}
              </div>
            ) : replies && replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((reply, index) => {
                  const replyAuthorName = reply.author.username || `${reply.author.firstName || ''} ${reply.author.lastName || ''}`.trim() || 'Anonymous';
                  const replyInitials = replyAuthorName.substring(0, 2).toUpperCase();
                  const isQuote = reply.content.startsWith('>');
                  
                  return (
                    <PremiumCard 
                      key={reply.id} 
                      className={cn(
                        reply.isBestAnswer && "ring-2 ring-accent/50"
                      )}
                      testId={`card-reply-${reply.id}`}
                    >
                      <div className="p-5 md:p-6">
                        {reply.isBestAnswer && (
                          <div className="mb-4">
                            <StatusBadge 
                              variant="success" 
                              label="Accepted Answer" 
                              icon={CheckCircle2} 
                              size="md"
                              testId="badge-best-answer"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-muted">
                              {reply.author.profileImageUrl ? (
                                <img src={reply.author.profileImageUrl} alt={replyAuthorName} className="object-cover" />
                              ) : (
                                <AvatarFallback className="text-sm font-medium">{replyInitials}</AvatarFallback>
                              )}
                            </Avatar>
                            {index > 0 && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-border hidden md:block" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{replyAuthorName}</span>
                                {getRoleBadge(reply.author.role)}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimestamp(new Date(reply.createdAt))}
                              </span>
                            </div>
                            
                            {reply.author.tagline && (
                              <p className="text-xs text-muted-foreground mb-3">
                                {reply.author.tagline}
                              </p>
                            )}
                            
                            <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
                              {reply.content.split('\n').map((paragraph, i) => {
                                if (paragraph.startsWith('>')) {
                                  return (
                                    <blockquote key={i} className="border-l-4 border-accent/30 pl-4 py-1 my-2 bg-muted/30 rounded-r-lg italic text-muted-foreground">
                                      {paragraph.replace(/^>\s*/, '')}
                                    </blockquote>
                                  );
                                }
                                if (paragraph.includes('![GIF]')) {
                                  const gifUrl = paragraph.match(/!\[GIF\]\((.*?)\)/)?.[1];
                                  if (gifUrl) {
                                    return (
                                      <div key={i} className="my-3">
                                        <img src={gifUrl} alt="GIF" className="max-w-xs rounded-lg border" />
                                      </div>
                                    );
                                  }
                                }
                                return paragraph ? <p key={i} className="mb-2">{paragraph}</p> : null;
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <VoteButtons
                            entityType="reply"
                            entityId={reply.id}
                            upvotes={reply.upvotes}
                            downvotes={reply.downvotes}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-muted-foreground hover:text-foreground"
                              onClick={() => handleQuoteReply(reply)}
                              data-testid={`button-quote-${reply.id}`}
                            >
                              <Quote className="w-4 h-4" />
                              Quote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PremiumCard>
                  );
                })}
              </div>
            ) : (
              <PremiumCard testId="card-no-replies">
                <PremiumCardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No replies yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share your thoughts on this topic
                  </p>
                </PremiumCardContent>
              </PremiumCard>
            )}
          </div>

          {!topic.isLocked && (
            <PremiumCard accentPosition="top" testId="card-reply-form">
              <PremiumCardHeader 
                title="Post a Reply"
                icon={<Reply className="w-5 h-5" />}
                testId="reply-header"
              />
              <PremiumCardContent className="pt-0">
                {!user && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-muted flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      Join the conversation by signing in to your account
                    </p>
                    <Link href="/login">
                      <Button size="sm" data-testid="button-signin-reply">Sign In</Button>
                    </Link>
                  </div>
                )}
                
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  {quotedReply && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-muted relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 w-6 h-6"
                        onClick={() => setQuotedReply(null)}
                        data-testid="button-remove-quote"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <Quote className="w-3 h-3" />
                        Replying to {quotedReply.author.username || quotedReply.author.firstName || 'Anonymous'}
                      </div>
                      <p className="text-sm line-clamp-2 pr-8">
                        {quotedReply.content.substring(0, 150)}{quotedReply.content.length > 150 ? '...' : ''}
                      </p>
                    </div>
                  )}
                  
                  <Textarea
                    ref={replyTextareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts, ask a question, or provide helpful information..."
                    className="min-h-32 resize-y"
                    disabled={!user || createReplyMutation.isPending}
                    data-testid="input-reply"
                  />
                  
                  {selectedGif && (
                    <div className="relative inline-block">
                      <img 
                        src={selectedGif.previewUrl} 
                        alt="Selected GIF" 
                        className="max-w-[200px] rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => setSelectedGif(null)}
                        data-testid="button-remove-gif"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-1">
                      <GifPicker onSelect={handleGifSelect} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover-elevate"
                        disabled={!user}
                        data-testid="button-attach-file"
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={!user || createReplyMutation.isPending || (!replyContent.trim() && !selectedGif)}
                      className="gap-2"
                      data-testid="button-submit-reply"
                    >
                      {createReplyMutation.isPending ? (
                        "Posting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Post Reply
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </PremiumCardContent>
            </PremiumCard>
          )}

          {topic.isLocked && (
            <PremiumCard className="bg-muted/30" testId="card-topic-locked">
              <PremiumCardContent className="py-6 text-center">
                <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">This topic is locked</h3>
                <p className="text-sm text-muted-foreground">
                  New replies are no longer accepted
                </p>
              </PremiumCardContent>
            </PremiumCard>
          )}
        </div>
      </div>
    </div>
  );
}

function VoteButtons({
  entityType,
  entityId,
  upvotes,
  downvotes,
}: {
  entityType: "topic" | "reply";
  entityId: string;
  upvotes: number;
  downvotes: number;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

  const voteMutation = useMutation({
    mutationFn: async (voteType: "upvote" | "downvote") => {
      return apiRequest("POST", "/api/forum/votes", {
        entityType,
        entityId,
        voteType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote. Please try again.",
        variant: "destructive",
      });
      setLocalUpvotes(upvotes);
      setLocalDownvotes(downvotes);
      setUserVote(null);
    },
  });

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote",
      });
      return;
    }

    if (userVote === voteType) {
      if (voteType === "upvote") setLocalUpvotes(prev => prev - 1);
      else setLocalDownvotes(prev => prev - 1);
      setUserVote(null);
    } else {
      if (userVote) {
        if (userVote === "upvote") setLocalUpvotes(prev => prev - 1);
        else setLocalDownvotes(prev => prev - 1);
      }
      if (voteType === "upvote") setLocalUpvotes(prev => prev + 1);
      else setLocalDownvotes(prev => prev + 1);
      setUserVote(voteType);
    }

    voteMutation.mutate(voteType);
  };

  const netVotes = localUpvotes - localDownvotes;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 px-3",
          userVote === 'upvote' && "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
        )}
        onClick={() => handleVote("upvote")}
        disabled={voteMutation.isPending}
        data-testid={`button-upvote-${entityId}`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="font-medium">{localUpvotes}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-1.5 px-3",
          userVote === 'downvote' && "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
        )}
        onClick={() => handleVote("downvote")}
        disabled={voteMutation.isPending}
        data-testid={`button-downvote-${entityId}`}
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="font-medium">{localDownvotes}</span>
      </Button>
      <Separator orientation="vertical" className="h-5 mx-2" />
      <span className={cn(
        "text-sm font-semibold",
        netVotes > 0 && "text-green-600 dark:text-green-400",
        netVotes < 0 && "text-red-600 dark:text-red-400"
      )}>
        {netVotes > 0 ? '+' : ''}{netVotes}
      </span>
    </div>
  );
}
