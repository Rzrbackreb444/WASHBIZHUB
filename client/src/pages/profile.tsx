import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Building2,
  Globe,
  Eye,
  BarChart3,
  MessageSquare,
  Store,
  Award,
  Calendar,
  UserPlus,
  UserMinus,
  Pencil,
  Users,
  ExternalLink,
  Activity,
  FileBarChart,
  Trophy,
  Sparkles,
} from "lucide-react";
import {
  SiLinkedin,
  SiX,
  SiFacebook,
  SiInstagram,
  SiYoutube,
  SiGithub,
} from "react-icons/si";
import { format } from "date-fns";

interface ProfileData {
  userId: string;
  username: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatarUrl: string | null;
  avatarType: string;
  coverImageUrl: string | null;
  visibility: string;
  profileViews: number;
  showEmail: boolean;
  showLocation: boolean;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    email?: string;
  } | null;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  displayOrder: number;
}

interface ActivityEvent {
  id: number;
  userId: string;
  eventType: string;
  entityType: string | null;
  entityId: string | null;
  metadata: any;
  isPublic: boolean;
  createdAt: string;
}

const SOCIAL_ICONS: Record<string, typeof SiLinkedin> = {
  linkedin: SiLinkedin,
  twitter: SiX,
  x: SiX,
  facebook: SiFacebook,
  instagram: SiInstagram,
  youtube: SiYoutube,
  github: SiGithub,
};

const SOCIAL_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  instagram: "#E4405F",
  youtube: "#FF0000",
  github: "#181717",
};

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background" data-testid="skeleton-profile">
      <div className="relative">
        <Skeleton className="h-48 md:h-64 w-full" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-8 md:pl-44">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-5 w-64 mx-auto md:mx-0" />
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 mx-auto md:mx-0" />
        </div>
        
        <div className="flex justify-center md:justify-start gap-6 mt-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        
        <Skeleton className="h-12 w-full max-w-xl mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

function NotFoundProfile() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" data-testid="profile-not-found">
      <div className="text-center px-4">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          The user you're looking for doesn't exist or their profile is private.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "text-[#C8A661]" }: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card className="bg-card border shadow-sm hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-[#C8A661]" />
          </div>
          <div className="min-w-0">
            <div className={`text-xl font-bold ${color} truncate`}>{value}</div>
            <div className="text-xs text-muted-foreground truncate">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const getActivityDetails = () => {
    switch (event.eventType) {
      case "listing_created":
        return { icon: Store, text: "Created a new listing", color: "text-green-600" };
      case "cleanbi_analysis":
        return { icon: BarChart3, text: "Ran a CLEANBI analysis", color: "text-blue-600" };
      case "forum_post":
        return { icon: MessageSquare, text: "Posted in the forum", color: "text-purple-600" };
      case "forum_reply":
        return { icon: MessageSquare, text: "Replied to a forum topic", color: "text-indigo-600" };
      case "follow":
        return { icon: UserPlus, text: "Followed a member", color: "text-[#C8A661]" };
      case "achievement":
        return { icon: Trophy, text: "Earned an achievement", color: "text-amber-600" };
      default:
        return { icon: Activity, text: "Was active", color: "text-muted-foreground" };
    }
  };

  const { icon: Icon, text, color } = getActivityDetails();

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" data-testid={`activity-item-${event.id}`}>
      <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{text}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery<ProfileData>({
    queryKey: ["/api/profile", username],
    enabled: !!username,
  });

  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ["/api/profile", username, "social-links"],
    enabled: !!username,
  });

  const { data: activityData } = useQuery<{ activities: ActivityEvent[]; total: number }>({
    queryKey: ["/api/profile", username, "activity"],
    enabled: !!username,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.userId) throw new Error("No user ID");
      await apiRequest("POST", `/api/profile/${profile.userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", username] });
      toast({
        title: "Following",
        description: `You are now following ${profile?.user?.firstName || username}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.userId) throw new Error("No user ID");
      await apiRequest("DELETE", `/api/profile/${profile.userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", username] });
      toast({
        title: "Unfollowed",
        description: `You have unfollowed ${profile?.user?.firstName || username}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    },
  });

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return <NotFoundProfile />;
  }

  const isOwnProfile = isAuthenticated && currentUser?.id === profile.userId;
  const displayName = profile.user?.firstName && profile.user?.lastName
    ? `${profile.user.firstName} ${profile.user.lastName}`
    : profile.username || "WashBizHub Member";
  const avatarUrl = profile.avatarUrl || profile.user?.profileImageUrl;
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{displayName} - Profile | WashBizHub</title>
        <meta name="description" content={profile.headline || `View ${displayName}'s profile on WashBizHub - The #1 laundromat resource hub.`} />
        <meta property="og:title" content={`${displayName} - WashBizHub Profile`} />
        <meta property="og:description" content={profile.headline || profile.bio || `${displayName}'s professional profile`} />
        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
      </Helmet>

      <div className="min-h-screen bg-background" data-testid="profile-page">
        <div className="relative">
          {profile.coverImageUrl ? (
            <div 
              className="h-48 md:h-64 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.coverImageUrl})` }}
              data-testid="profile-cover-image"
            />
          ) : (
            <div 
              className="h-48 md:h-64 w-full bg-gradient-to-br from-[#0A1628] via-[#1a3a5c] to-[#0A1628]"
              data-testid="profile-cover-gradient"
            >
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_40%,_#C8A661_0%,_transparent_50%)]" />
            </div>
          )}
          
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
            <Avatar 
              className="h-32 w-32 ring-4 ring-[#C8A661] ring-offset-4 ring-offset-background"
              data-testid="profile-avatar"
            >
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl font-bold bg-[#0A1628] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-8 md:pl-44">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="profile-name">
                {displayName}
              </h1>
              {profile.headline && (
                <p className="text-muted-foreground mt-1" data-testid="profile-headline">
                  {profile.headline}
                </p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                {profile.showLocation && profile.location && (
                  <span className="flex items-center gap-1" data-testid="profile-location">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.company && (
                  <span className="flex items-center gap-1" data-testid="profile-company">
                    <Building2 className="h-4 w-4" />
                    {profile.company}
                  </span>
                )}
                {profile.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#C8A661] hover:underline"
                    data-testid="profile-website"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              {isOwnProfile ? (
                <Button asChild variant="outline" data-testid="button-edit-profile">
                  <Link href="/settings">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : isAuthenticated ? (
                profile.isFollowing ? (
                  <Button
                    variant="outline"
                    onClick={() => unfollowMutation.mutate()}
                    disabled={unfollowMutation.isPending}
                    data-testid="button-unfollow"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {unfollowMutation.isPending ? "Unfollowing..." : "Unfollow"}
                  </Button>
                ) : (
                  <Button
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    data-testid="button-follow"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {followMutation.isPending ? "Following..." : "Follow"}
                  </Button>
                )
              ) : (
                <Button asChild className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid="button-login-to-follow">
                  <Link href="/login">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Login to Follow
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-6 mt-6">
            <Link 
              href={`/profile/${username}/followers`}
              className="text-center hover:text-[#C8A661] transition-colors"
              data-testid="link-followers"
            >
              <span className="font-bold text-foreground">{profile.followerCount}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </Link>
            <Link 
              href={`/profile/${username}/following`}
              className="text-center hover:text-[#C8A661] transition-colors"
              data-testid="link-following"
            >
              <span className="font-bold text-foreground">{profile.followingCount}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </Link>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex justify-center md:justify-start gap-3 mt-6" data-testid="social-links-bar">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICONS[link.platform.toLowerCase()];
                const color = SOCIAL_COLORS[link.platform.toLowerCase()];
                if (!Icon) return null;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ color }}
                    data-testid={`social-link-${link.platform.toLowerCase()}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="profile-stats">
            <StatCard
              icon={Eye}
              label="Profile Views"
              value={profile.profileViews.toLocaleString()}
            />
            <StatCard
              icon={BarChart3}
              label="CLEANBI Analyses"
              value={activityData?.activities.filter(a => a.eventType === "cleanbi_analysis").length || 0}
            />
            <StatCard
              icon={MessageSquare}
              label="Forum Posts"
              value={activityData?.activities.filter(a => a.eventType === "forum_post" || a.eventType === "forum_reply").length || 0}
            />
            <StatCard
              icon={Store}
              label="Listings"
              value={activityData?.activities.filter(a => a.eventType === "listing_created").length || 0}
            />
          </div>

          <Tabs defaultValue="about" className="w-full" data-testid="profile-tabs">
            <TabsList className="w-full max-w-xl bg-muted mb-6 flex flex-wrap h-auto p-1">
              <TabsTrigger value="about" className="flex-1" data-testid="tab-about">
                About
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1" data-testid="tab-activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex-1" data-testid="tab-listings">
                Listings
              </TabsTrigger>
              <TabsTrigger value="analyses" className="flex-1" data-testid="tab-analyses">
                Analyses
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-1" data-testid="tab-achievements">
                Badges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" data-testid="tab-content-about">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C8A661]" />
                    About
                  </h3>
                  {profile.bio ? (
                    <p className="text-muted-foreground whitespace-pre-wrap" data-testid="profile-bio">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {isOwnProfile 
                        ? "Add a bio to tell others about yourself"
                        : "This user hasn't added a bio yet."
                      }
                    </p>
                  )}
                  
                  {profile.showEmail && profile.user?.email && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium text-foreground mb-2">Contact</h4>
                      <a 
                        href={`mailto:${profile.user.email}`}
                        className="text-[#C8A661] hover:underline"
                        data-testid="profile-email"
                      >
                        {profile.user.email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" data-testid="tab-content-activity">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#C8A661]" />
                    Recent Activity
                  </h3>
                  {activityData?.activities && activityData.activities.length > 0 ? (
                    <div className="divide-y">
                      {activityData.activities.slice(0, 10).map((event) => (
                        <ActivityItem key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No recent activity to show
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" data-testid="tab-content-listings">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#C8A661]" />
                    Laundromat Listings
                  </h3>
                  <div className="text-center py-12">
                    <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {isOwnProfile 
                        ? "You haven't created any listings yet" 
                        : "No listings to display"
                      }
                    </p>
                    {isOwnProfile && (
                      <Button asChild className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                        <Link href="/add-listing">Create Listing</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyses" data-testid="tab-content-analyses">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-[#C8A661]" />
                    CLEANBI Analyses
                  </h3>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {isOwnProfile 
                        ? "Run your first CLEANBI analysis to see it here" 
                        : "No public analyses to display"
                      }
                    </p>
                    {isOwnProfile && (
                      <Button asChild className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                        <Link href="/cleanbi">Run Analysis</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" data-testid="tab-content-achievements">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#C8A661]" />
                    Achievements & Badges
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="h-12 w-12 rounded-full bg-[#C8A661]/20 flex items-center justify-center mx-auto mb-2">
                        <Trophy className="h-6 w-6 text-[#C8A661]" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Early Adopter</p>
                      <p className="text-xs text-muted-foreground">Joined WashBizHub</p>
                    </div>
                    {profile.followerCount >= 10 && (
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                          <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Community Builder</p>
                        <p className="text-xs text-muted-foreground">10+ Followers</p>
                      </div>
                    )}
                    {profile.profileViews >= 100 && (
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                          <Eye className="h-6 w-6 text-purple-500" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Rising Star</p>
                        <p className="text-xs text-muted-foreground">100+ Profile Views</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
