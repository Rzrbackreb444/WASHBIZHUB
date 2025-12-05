import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Send,
  Pin,
  Lock,
  CheckCircle2,
  MoreVertical,
  Image,
  Video,
  Play,
  ZoomIn,
  Upload,
  Plus,
  X,
} from "lucide-react";
import type { EnrichedForumTopic, EnrichedForumReply } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { FileUpload } from "@/components/FileUpload";

export default function ForumTopicPage() {
  const params = useParams();
  const topicSlug = params.slug;
  const { toast } = useToast();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [replyFiles, setReplyFiles] = useState<{url: string; filename: string; contentType: string; size: number}[]>([]);
  const [replyVideos, setReplyVideos] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState("");

  const { data: topics } = useQuery<EnrichedForumTopic[]>({
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
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }
    createReplyMutation.mutate(replyContent);
  };

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
        <Link href="/forum">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </Link>
      </div>
    );
  }

  const authorDisplayName = topic.author.username || `${topic.author.firstName || ''} ${topic.author.lastName || ''}`.trim() || 'Anonymous';
  const authorInitials = authorDisplayName.substring(0, 2).toUpperCase();
  
  // Extract any SEO fields from topic (if available)
  const topicMeta = topic as any;
  const seoTitle = topicMeta.metaTitle || topic.title;
  const seoDescription = topicMeta.metaDescription || topic.content.substring(0, 160).replace(/\n/g, ' ');
  const seoKeywords = topicMeta.keywords || (topic.tags as string[]) || [];
  const topicImages = (topicMeta.images as string[]) || [];
  const topicVideos = (topicMeta.videos as string[]) || [];
  const datePublished = topic.createdAt ? format(new Date(topic.createdAt), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined;
  const dateModified = topic.lastActivityAt ? format(new Date(topic.lastActivityAt), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined;

  // Build structured data for SEO/AEO
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

  // QAPage structured data for answer engine optimization
  const bestAnswer = replies?.find(r => r.isBestAnswer);
  const qaPageData = bestAnswer ? {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": topic.title,
      "text": topic.content,
      "dateCreated": datePublished,
      "author": {
        "@type": "Person",
        "name": authorDisplayName,
      },
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
  if (qaPageData) {
    structuredDataArray.push(qaPageData);
  }

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

      {/* Header */}
      <div className="border-b">
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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Topic */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {topic.isPinned && (
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
              <CardTitle className="text-2xl md:text-3xl mb-4">
                {topic.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {topic.views} views
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {topic.replyCount} replies
                </div>
                <div className="text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
                {topic.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>

              {/* Image Gallery */}
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
                          <div className="relative group cursor-pointer overflow-hidden rounded-lg border">
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
                          <img 
                            src={img} 
                            alt={`Image ${idx + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Gallery */}
              {topicVideos.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Videos</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topicVideos.map((video, idx) => {
                      // Convert YouTube URLs to embed format
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
              <div className="flex items-center justify-between">
                <VoteButtons
                  entityType="topic"
                  entityId={topic.id}
                  upvotes={topic.upvotes}
                  downvotes={topic.downvotes}
                />
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {topic.author.profileImageUrl ? (
                      <img src={topic.author.profileImageUrl} alt={authorDisplayName} />
                    ) : (
                      <AvatarFallback>{authorInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{authorDisplayName}</span>
                      {topic.author.role && (
                        <Badge variant="secondary" className="text-xs">
                          {topic.author.role}
                        </Badge>
                      )}
                    </div>
                    {topic.author.tagline && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {topic.author.tagline}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Replies */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {replies?.length || 0} {replies?.length === 1 ? "Reply" : "Replies"}
              </h2>
            </div>

            {repliesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6 animate-pulse">
                      <div className="h-4 bg-muted rounded w-full mb-3"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : replies && replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((reply) => {
                  const replyAuthorName = reply.author.username || `${reply.author.firstName || ''} ${reply.author.lastName || ''}`.trim() || 'Anonymous';
                  const replyInitials = replyAuthorName.substring(0, 2).toUpperCase();
                  
                  return (
                    <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                      <CardContent className="p-6">
                        {reply.isBestAnswer && (
                          <Badge variant="default" className="gap-1 mb-3">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted Answer
                          </Badge>
                        )}
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="w-10 h-10 shrink-0">
                            {reply.author.profileImageUrl ? (
                              <img src={reply.author.profileImageUrl} alt={replyAuthorName} />
                            ) : (
                              <AvatarFallback>{replyInitials}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{replyAuthorName}</span>
                              {reply.author.role && (
                                <Badge variant="secondary" className="text-xs">
                                  {reply.author.role}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {reply.author.tagline && (
                              <p className="text-xs text-muted-foreground mb-3">
                                {reply.author.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-neutral dark:prose-invert max-w-none mb-4 pl-13">
                          {reply.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-2">{paragraph}</p>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between pl-13">
                          <VoteButtons
                            entityType="reply"
                            entityId={reply.id}
                            upvotes={reply.upvotes}
                            downvotes={reply.downvotes}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No replies yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to reply to this topic
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reply Form */}
          {!topic.isLocked && (
            <Card>
              <CardHeader>
                <CardTitle>Post a Reply</CardTitle>
                {!user && (
                  <CardDescription>
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                    {" "}to post a reply
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts, ask a question, or provide helpful information..."
                    className="min-h-32"
                    disabled={!user || createReplyMutation.isPending}
                    data-testid="input-reply"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!user || createReplyMutation.isPending || !replyContent.trim()}
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
              </CardContent>
            </Card>
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
      // Revert optimistic update
      setLocalUpvotes(upvotes);
      setLocalDownvotes(downvotes);
    },
  });

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on posts",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    if (voteType === "upvote") {
      setLocalUpvotes(prev => prev + 1);
    } else {
      setLocalDownvotes(prev => prev + 1);
    }

    voteMutation.mutate(voteType);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("upvote")}
        className="gap-1"
        data-testid={`button-upvote-${entityType}`}
      >
        <ThumbsUp className="w-4 h-4" />
        {localUpvotes}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("downvote")}
        className="gap-1"
        data-testid={`button-downvote-${entityType}`}
      >
        <ThumbsDown className="w-4 h-4" />
        {localDownvotes}
      </Button>
    </div>
  );
}
