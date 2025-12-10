import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { 
  MessageSquare, 
  Package, 
  Users, 
  Trophy, 
  User, 
  Heart, 
  MessageCircle, 
  Filter,
  Activity,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface ActivityUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  username: string | null;
}

interface ActivityEvent {
  id: number;
  userId: string;
  eventType: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  isPublic: boolean;
  createdAt: string;
  user?: ActivityUser;
}

interface ActivityFeedResponse {
  activities: ActivityEvent[];
  nextCursor: number | null;
  hasMore: boolean;
}

const activityTypeConfig: Record<string, { icon: typeof Activity; label: string; color: string }> = {
  forum_post: { icon: MessageSquare, label: "New Post", color: "bg-blue-500" },
  forum_reply: { icon: MessageCircle, label: "Replied", color: "bg-blue-400" },
  listing_created: { icon: Package, label: "New Listing", color: "bg-green-500" },
  follow: { icon: Users, label: "New Connection", color: "bg-purple-500" },
  achievement: { icon: Trophy, label: "Achievement", color: "bg-[#C8A661]" },
  profile_update: { icon: User, label: "Profile Update", color: "bg-gray-500" },
  cleanbi_analysis: { icon: Activity, label: "Analysis", color: "bg-[#0A1628]" },
};

const activityTypes = [
  { value: "all", label: "All Activity" },
  { value: "forum_post", label: "Forum Posts" },
  { value: "forum_reply", label: "Forum Replies" },
  { value: "listing_created", label: "New Listings" },
  { value: "follow", label: "Connections" },
  { value: "achievement", label: "Achievements" },
  { value: "profile_update", label: "Profile Updates" },
];

function getActivityDescription(activity: ActivityEvent): string {
  const metadata = activity.metadata || {};
  
  switch (activity.eventType) {
    case "forum_post":
      return `posted "${metadata.title || 'a new topic'}" in the forum`;
    case "forum_reply":
      return `replied to "${metadata.topicTitle || 'a forum topic'}"`;
    case "listing_created":
      return `listed "${metadata.name || 'a new laundromat'}" for sale`;
    case "follow":
      return `connected with ${metadata.targetName || 'another member'}`;
    case "achievement":
      return `unlocked the "${metadata.badgeName || 'achievement'}" badge`;
    case "profile_update":
      return "updated their profile";
    case "cleanbi_analysis":
      return `analyzed a location in ${metadata.city || 'the area'}`;
    default:
      return "performed an action";
  }
}

function getEntityLink(activity: ActivityEvent): string | null {
  const metadata = activity.metadata || {};
  
  switch (activity.entityType) {
    case "forum_topic":
      return activity.entityId ? `/forum/topic/${activity.entityId}` : null;
    case "listing":
      return activity.entityId ? `/listings/${activity.entityId}` : null;
    case "user":
      return activity.entityId ? `/profile/${activity.entityId}` : null;
    default:
      return null;
  }
}

function ActivityCard({ activity }: { activity: ActivityEvent }) {
  const config = activityTypeConfig[activity.eventType] || {
    icon: Activity,
    label: "Activity",
    color: "bg-gray-500",
  };
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
  const description = getActivityDescription(activity);
  const entityLink = getEntityLink(activity);
  
  const userName = activity.user
    ? `${activity.user.firstName || ""} ${activity.user.lastName || ""}`.trim() || activity.user.username || "User"
    : "User";
  
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="bg-card border shadow-sm overflow-hidden hover-elevate" data-testid={`activity-card-${activity.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/profile/${activity.userId}`} data-testid={`link-user-${activity.userId}`}>
            <Avatar className="h-10 w-10 ring-2 ring-[#C8A661]/20 cursor-pointer">
              <AvatarImage src={activity.user?.profileImageUrl || undefined} alt={userName} />
              <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${activity.userId}`}>
                <span className="font-medium text-foreground hover:text-[#C8A661] cursor-pointer" data-testid={`text-username-${activity.id}`}>
                  {userName}
                </span>
              </Link>
              <Badge variant="secondary" className="text-xs py-0">
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {entityLink ? (
                <Link href={entityLink}>
                  <span className="hover:text-[#C8A661] cursor-pointer" data-testid={`link-entity-${activity.id}`}>
                    {description}
                  </span>
                </Link>
              ) : (
                description
              )}
            </p>
            
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-muted-foreground/70" data-testid={`text-time-${activity.id}`}>
                {timeAgo}
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-[#C8A661]"
                  data-testid={`button-like-${activity.id}`}
                >
                  <Heart className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Like</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-[#C8A661]"
                  data-testid={`button-comment-${activity.id}`}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Comment</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", config.color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="bg-card border shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-4 mt-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ActivityFeed() {
  const { isAuthenticated } = useAuth();
  const [filterType, setFilterType] = useState("all");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ActivityFeedResponse>({
    queryKey: ['/api/activity-feed', filterType],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.set('cursor', String(pageParam));
      params.set('limit', '10');
      if (filterType !== 'all') {
        params.set('type', filterType);
      }
      const response = await fetch(`/api/activity-feed?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch activity feed');
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: isAuthenticated,
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const activities = data?.pages.flatMap((page) => page.activities) || [];

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Activity Feed | WashBizHub</title>
          <meta name="description" content="Stay updated with the latest activity from the WashBizHub community." />
        </Helmet>
        <div className="min-h-screen bg-muted/30 py-12">
          <div className="max-w-3xl mx-auto px-4">
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">Sign in to view activity</h2>
                <p className="text-muted-foreground mb-4">
                  Join WashBizHub to see activity from the community and your connections.
                </p>
                <Link href="/login">
                  <Button className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-login">
                    Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Activity Feed | WashBizHub</title>
        <meta name="description" content="Stay updated with the latest activity from the WashBizHub community." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Activity Feed</h1>
              <p className="text-muted-foreground">See what's happening in the community</p>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} data-testid={`filter-option-${type.value}`}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <>
                <ActivitySkeleton />
                <ActivitySkeleton />
                <ActivitySkeleton />
              </>
            ) : isError ? (
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-red-500/50" />
                  <h2 className="text-xl font-semibold mb-2">Failed to load activity</h2>
                  <p className="text-muted-foreground">
                    Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : activities.length === 0 ? (
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h2 className="text-xl font-semibold mb-2">No activity yet</h2>
                  <p className="text-muted-foreground mb-4">
                    {filterType !== "all"
                      ? "No activity matches this filter. Try selecting a different type."
                      : "Follow other members to see their activity in your feed."}
                  </p>
                  <Link href="/network">
                    <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-find-members">
                      <Users className="h-4 w-4 mr-2" />
                      Find Members
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
                
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more...</span>
                    </div>
                  ) : hasNextPage ? (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      data-testid="button-load-more"
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load more
                    </Button>
                  ) : activities.length > 0 ? (
                    <p className="text-sm text-muted-foreground">You've reached the end</p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
