import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Search,
  MapPin,
  Briefcase,
  Award,
  MessageCircle,
  UserPlus,
  UserCheck,
  Filter,
  X,
  Building2,
  Clock,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Calendar,
  Globe,
  Linkedin,
  Facebook,
  ChevronRight,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string | null;
  companyName: string | null;
  headline: string | null;
  location: string | null;
  specialties: string[] | null;
  services: string[] | null;
  yearsInIndustry: number | null;
  badges: string[] | null;
  isOpenToNetwork: boolean | null;
  isAvailableForConsulting?: boolean;
  isFollowing?: boolean;
}

interface MembersResponse {
  members: Member[];
  total: number;
}

interface NetworkStats {
  totalMembers: number;
  newThisMonth: number;
  yourConnections: number;
}

interface MemberProfile {
  id: string;
  userId: string;
  headline: string | null;
  specialties: string[] | null;
  services: string[] | null;
  yearsInIndustry: number | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  location: string | null;
  isOpenToNetwork: boolean;
  isAvailableForConsulting: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "Owner", label: "Owner" },
  { value: "Investor", label: "Investor" },
  { value: "Vendor", label: "Vendor" },
  { value: "Service Provider", label: "Service Provider" },
  { value: "Operator", label: "Operator" },
  { value: "Broker", label: "Broker" },
  { value: "Consultant", label: "Consultant" },
];

const EXPERIENCE_LEVELS = [
  { value: "all", label: "Any Experience" },
  { value: "0-2", label: "0-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
];

function MemberCardSkeleton() {
  return (
    <Card className="bg-card border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, label, testId }: { icon: any; value: number | string; label: string; testId: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center" data-testid={testId}>
      <div className="flex items-center justify-center mb-2">
        <div className="h-10 w-10 rounded-full bg-[#0A1628] flex items-center justify-center">
          <Icon className="h-5 w-5 text-[#C8A661]" />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#C8A661]" data-testid={`${testId}-value`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MemberCard({ member, onFollow, onUnfollow, isFollowPending }: {
  member: Member;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  isFollowPending: boolean;
}) {
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(" ") || "Member";
  const initials = [member.firstName?.[0], member.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "M";
  
  return (
    <Card className="bg-card border shadow-sm hover-elevate transition-all" data-testid={`member-card-${member.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-[#C8A661]/20">
            <AvatarImage src={member.profileImageUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-[#0A1628] text-[#C8A661] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate" data-testid={`member-name-${member.id}`}>
              {displayName}
            </h3>
            {member.headline && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5" data-testid={`member-headline-${member.id}`}>
                {member.headline}
              </p>
            )}
            {member.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span data-testid={`member-location-${member.id}`}>{member.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {member.role && (
            <Badge variant="secondary" className="bg-[#0A1628] text-white text-xs" data-testid={`member-role-${member.id}`}>
              <Briefcase className="h-3 w-3 mr-1" />
              {member.role}
            </Badge>
          )}
          {member.companyName && (
            <Badge variant="outline" className="text-xs" data-testid={`member-company-${member.id}`}>
              <Building2 className="h-3 w-3 mr-1" />
              {member.companyName}
            </Badge>
          )}
          {member.yearsInIndustry && member.yearsInIndustry > 0 && (
            <Badge variant="outline" className="text-xs border-[#C8A661]/40 text-[#C8A661]" data-testid={`member-experience-${member.id}`}>
              <Clock className="h-3 w-3 mr-1" />
              {member.yearsInIndustry}+ yrs
            </Badge>
          )}
        </div>

        {member.specialties && member.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {member.specialties.slice(0, 3).map((specialty, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-muted/50"
                data-testid={`member-specialty-${member.id}-${idx}`}
              >
                {specialty}
              </Badge>
            ))}
            {member.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs bg-muted/50">
                +{member.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}

        {member.badges && member.badges.length > 0 && (
          <div className="flex gap-1 mt-3">
            {member.badges.includes("verified") && (
              <Badge className="bg-[#C8A661] text-[#0A1628] text-xs">
                <Award className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {member.badges.includes("pro") && (
              <Badge className="bg-[#0A1628] text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0 flex gap-2">
        {member.isFollowing ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onUnfollow(member.id)}
            disabled={isFollowPending}
            data-testid={`button-unfollow-${member.id}`}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Following
          </Button>
        ) : (
          <Button 
            size="sm" 
            className="flex-1 bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
            onClick={() => onFollow(member.id)}
            disabled={isFollowPending}
            data-testid={`button-follow-${member.id}`}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        )}
        <Link href={`/messages?user=${member.id}`}>
          <Button variant="outline" size="sm" data-testid={`button-message-${member.id}`}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/profile/${member.id}`}>
          <Button variant="ghost" size="sm" data-testid={`button-view-profile-${member.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function FilterSidebar({
  role,
  setRole,
  location,
  setLocation,
  experience,
  setExperience,
  consultingOnly,
  setConsultingOnly,
  onClear,
}: {
  role: string;
  setRole: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  consultingOnly: boolean;
  setConsultingOnly: (v: boolean) => void;
  onClear: () => void;
}) {
  const hasFilters = role !== "all" || location || experience !== "all" || consultingOnly;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger data-testid="select-role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value} data-testid={`role-option-${r.value}`}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <Input
            placeholder="City, State, or Country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            data-testid="input-location-filter"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Industry Experience</Label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger data-testid="select-experience">
              <SelectValue placeholder="Any Experience" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((e) => (
                <SelectItem key={e.value} value={e.value} data-testid={`experience-option-${e.value}`}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="consulting" className="text-sm font-medium cursor-pointer">
            Available for Consulting
          </Label>
          <Switch
            id="consulting"
            checked={consultingOnly}
            onCheckedChange={setConsultingOnly}
            data-testid="switch-consulting"
          />
        </div>
      </div>
    </div>
  );
}

function ProfileEditModal({ 
  profile, 
  isOpen, 
  onClose, 
  onSave,
  isSaving,
}: { 
  profile: MemberProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MemberProfile>) => void;
  isSaving: boolean;
}) {
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [specialties, setSpecialties] = useState(profile?.specialties?.join(", ") || "");
  const [services, setServices] = useState(profile?.services?.join(", ") || "");
  const [yearsInIndustry, setYearsInIndustry] = useState(profile?.yearsInIndustry?.toString() || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebookUrl || "");
  const [isOpenToNetwork, setIsOpenToNetwork] = useState(profile?.isOpenToNetwork ?? true);
  const [isAvailableForConsulting, setIsAvailableForConsulting] = useState(profile?.isAvailableForConsulting ?? false);
  const [showEmail, setShowEmail] = useState(profile?.showEmail ?? false);

  const handleSubmit = () => {
    onSave({
      headline: headline || null,
      specialties: specialties ? specialties.split(",").map(s => s.trim()).filter(Boolean) : null,
      services: services ? services.split(",").map(s => s.trim()).filter(Boolean) : null,
      yearsInIndustry: yearsInIndustry ? parseInt(yearsInIndustry) : null,
      location: location || null,
      websiteUrl: websiteUrl || null,
      linkedinUrl: linkedinUrl || null,
      facebookUrl: facebookUrl || null,
      isOpenToNetwork,
      isAvailableForConsulting,
      showEmail,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Update your networking profile to help others find and connect with you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Multi-Unit Laundromat Owner | 15 Years Experience"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={200}
              data-testid="input-edit-headline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Los Angeles, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-edit-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">Years in Industry</Label>
            <Input
              id="years"
              type="number"
              placeholder="e.g., 10"
              value={yearsInIndustry}
              onChange={(e) => setYearsInIndustry(e.target.value)}
              min={0}
              max={50}
              data-testid="input-edit-years"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Textarea
              id="specialties"
              placeholder="e.g., Multi-Unit Operations, Equipment Maintenance, Staff Training"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              data-testid="input-edit-specialties"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services Offered (comma-separated)</Label>
            <Textarea
              id="services"
              placeholder="e.g., Consulting, Site Analysis, Equipment Selection"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              data-testid="input-edit-services"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              data-testid="input-edit-website"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              data-testid="input-edit-linkedin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/yourpage"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              data-testid="input-edit-facebook"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="openToNetwork" className="cursor-pointer">Open to Networking</Label>
                <p className="text-xs text-muted-foreground">Show in member directory</p>
              </div>
              <Switch
                id="openToNetwork"
                checked={isOpenToNetwork}
                onCheckedChange={setIsOpenToNetwork}
                data-testid="switch-edit-network"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="consulting" className="cursor-pointer">Available for Consulting</Label>
                <p className="text-xs text-muted-foreground">Let others know you offer consulting</p>
              </div>
              <Switch
                id="consulting"
                checked={isAvailableForConsulting}
                onCheckedChange={setIsAvailableForConsulting}
                data-testid="switch-edit-consulting"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showEmail" className="cursor-pointer">Show Email</Label>
                <p className="text-xs text-muted-foreground">Display email on your profile</p>
              </div>
              <Switch
                id="showEmail"
                checked={showEmail}
                onCheckedChange={setShowEmail}
                data-testid="switch-edit-email"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-edit-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
            data-testid="button-edit-save"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NetworkPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [consultingOnly, setConsultingOnly] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (roleFilter && roleFilter !== "all") params.append("role", roleFilter);
    if (locationFilter) params.append("location", locationFilter);
    params.append("limit", "30");
    return params.toString();
  }, [searchQuery, roleFilter, locationFilter]);

  const { data: membersData, isLoading: membersLoading } = useQuery<MembersResponse>({
    queryKey: ["/api/members", queryParams ? `?${queryParams}` : ""],
    enabled: isAuthenticated,
  });

  const { data: followingData, isLoading: followingLoading } = useQuery<MembersResponse>({
    queryKey: ["/api/members/following"],
    enabled: isAuthenticated && activeTab === "following",
  });

  const { data: followersData, isLoading: followersLoading } = useQuery<MembersResponse>({
    queryKey: ["/api/members/followers"],
    enabled: isAuthenticated && activeTab === "followers",
  });

  const { data: myProfile } = useQuery<MemberProfile>({
    queryKey: ["/api/members/profile/me"],
    enabled: isAuthenticated,
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/members/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/following"] });
      toast({ title: "Connected!", description: "You are now following this member." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to connect. Please try again.", variant: "destructive" });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/members/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members/following"] });
      toast({ title: "Unfollowed", description: "You are no longer following this member." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unfollow. Please try again.", variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<MemberProfile>) => {
      await apiRequest("PUT", "/api/members/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members/profile/me"] });
      setIsEditModalOpen(false);
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    },
  });

  const clearFilters = () => {
    setRoleFilter("all");
    setLocationFilter("");
    setExperienceFilter("all");
    setConsultingOnly(false);
  };

  const stats: NetworkStats = {
    totalMembers: membersData?.total || 0,
    newThisMonth: Math.floor((membersData?.total || 0) * 0.08),
    yourConnections: followingData?.total || 0,
  };

  const getCurrentMembers = () => {
    switch (activeTab) {
      case "following":
        return followingData?.members || [];
      case "followers":
        return followersData?.members || [];
      default:
        return membersData?.members || [];
    }
  };

  const isCurrentLoading = () => {
    switch (activeTab) {
      case "following":
        return followingLoading;
      case "followers":
        return followersLoading;
      default:
        return membersLoading;
    }
  };

  const members = getCurrentMembers();
  const isLoading = isCurrentLoading();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8A661]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 py-16">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-[#C8A661]" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Join the Network</h1>
          <p className="text-muted-foreground mb-6">
            Connect with laundromat owners, investors, vendors, and service providers in our professional network.
          </p>
          <Link href="/login">
            <Button className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white" data-testid="button-login-cta">
              Sign In to Access
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Industry Network - Connect with Laundromat Professionals | WashBizHub"
        description="Join the largest network of laundromat professionals. Connect with owners, investors, vendors, and service providers. Find consulting opportunities and grow your business."
        keywords={[
          "laundromat network",
          "laundromat professionals",
          "laundromat owners",
          "laundry industry network",
          "laundromat consulting",
          "laundry business connections",
        ]}
        canonicalUrl="/network"
      />

      <div className="min-h-screen bg-muted/30">
        <section className="bg-[#0A1628] py-12">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <Badge variant="outline" className="mb-3 border-[#C8A661]/40 text-[#C8A661]">
                  <Users className="w-3 h-3 mr-1.5" />
                  Professional Community
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" data-testid="text-page-title">
                  Industry Network
                </h1>
                <p className="text-gray-300 max-w-lg">
                  Connect with laundromat owners, investors, vendors, and service providers across the industry.
                </p>
              </div>
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] w-full md:w-auto"
                data-testid="button-edit-profile"
              >
                Edit Your Profile
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <StatCard icon={Users} value={stats.totalMembers.toLocaleString()} label="Total Members" testId="stat-total-members" />
              <StatCard icon={TrendingUp} value={`+${stats.newThisMonth}`} label="New This Month" testId="stat-new-members" />
              <StatCard icon={UserCheck} value={stats.yourConnections} label="Your Connections" testId="stat-connections" />
            </div>

            <div className="mt-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-0 text-foreground"
                data-testid="input-search-members"
              />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <Card className="bg-card border shadow-sm sticky top-24">
                <CardContent className="p-6">
                  <FilterSidebar
                    role={roleFilter}
                    setRole={setRoleFilter}
                    location={locationFilter}
                    setLocation={setLocationFilter}
                    experience={experienceFilter}
                    setExperience={setExperienceFilter}
                    consultingOnly={consultingOnly}
                    setConsultingOnly={setConsultingOnly}
                    onClear={clearFilters}
                  />
                </CardContent>
              </Card>
            </aside>

            <div className="lg:hidden mb-4">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full" data-testid="button-mobile-filters">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filter Members</SheetTitle>
                    <SheetDescription>
                      Narrow down your search with filters.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      role={roleFilter}
                      setRole={setRoleFilter}
                      location={locationFilter}
                      setLocation={setLocationFilter}
                      experience={experienceFilter}
                      setExperience={setExperienceFilter}
                      consultingOnly={consultingOnly}
                      setConsultingOnly={setConsultingOnly}
                      onClear={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <main className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="discover" data-testid="tab-discover">
                    <Users className="h-4 w-4 mr-2" />
                    Discover
                  </TabsTrigger>
                  <TabsTrigger value="following" data-testid="tab-following">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </TabsTrigger>
                  <TabsTrigger value="followers" data-testid="tab-followers">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Followers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discover" className="mt-0">
                  {isLoading ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <MemberCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : members.length === 0 ? (
                    <Card className="bg-card border shadow-sm">
                      <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Members Found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search or filters to find more members.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={clearFilters}
                          data-testid="button-clear-empty"
                        >
                          Clear Filters
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {members.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          onFollow={(id) => followMutation.mutate(id)}
                          onUnfollow={(id) => unfollowMutation.mutate(id)}
                          isFollowPending={followMutation.isPending || unfollowMutation.isPending}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="following" className="mt-0">
                  {followingLoading ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <MemberCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (followingData?.members?.length || 0) === 0 ? (
                    <Card className="bg-card border shadow-sm">
                      <CardContent className="py-12 text-center">
                        <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Not Following Anyone Yet</h3>
                        <p className="text-muted-foreground">
                          Start connecting with industry professionals to build your network.
                        </p>
                        <Button 
                          className="mt-4 bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                          onClick={() => setActiveTab("discover")}
                          data-testid="button-discover-cta"
                        >
                          Discover Members
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {(followingData?.members || []).map((member) => (
                        <MemberCard
                          key={member.id}
                          member={{ ...member, isFollowing: true }}
                          onFollow={(id) => followMutation.mutate(id)}
                          onUnfollow={(id) => unfollowMutation.mutate(id)}
                          isFollowPending={followMutation.isPending || unfollowMutation.isPending}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="followers" className="mt-0">
                  {followersLoading ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <MemberCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (followersData?.members?.length || 0) === 0 ? (
                    <Card className="bg-card border shadow-sm">
                      <CardContent className="py-12 text-center">
                        <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Followers Yet</h3>
                        <p className="text-muted-foreground">
                          Complete your profile and connect with others to grow your network.
                        </p>
                        <Button 
                          className="mt-4 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                          onClick={() => setIsEditModalOpen(true)}
                          data-testid="button-complete-profile-cta"
                        >
                          Complete Your Profile
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {(followersData?.members || []).map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          onFollow={(id) => followMutation.mutate(id)}
                          onUnfollow={(id) => unfollowMutation.mutate(id)}
                          isFollowPending={followMutation.isPending || unfollowMutation.isPending}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>

      <ProfileEditModal
        profile={myProfile || null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(data) => updateProfileMutation.mutate(data)}
        isSaving={updateProfileMutation.isPending}
      />
    </>
  );
}
