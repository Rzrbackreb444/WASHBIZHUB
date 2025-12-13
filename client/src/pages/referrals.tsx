import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Gift, 
  Copy, 
  Check, 
  Mail, 
  UserPlus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Link as LinkIcon,
  Lock,
  LogIn,
  Loader2,
  Send
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface ReferralCodeResponse {
  referralCode: string;
  referralLink: string;
}

interface ReferralItem {
  id: number;
  referredEmail: string;
  status: string;
  referrerReward: string | null;
  invitedAt: string;
  signedUpAt: string | null;
  convertedAt: string | null;
}

interface MyReferralsResponse {
  referrals: ReferralItem[];
  stats: {
    total: number;
    signedUp: number;
    converted: number;
  };
}

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "signed_up":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
          <UserPlus className="w-3 h-3 mr-1" />
          Signed Up
        </Badge>
      );
    case "converted":
    case "rewarded":
      return (
        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Converted
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Referrals() {
  const { user, isLoading: authLoading, authResolved } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  });

  const { data: codeData, isLoading: codeLoading } = useQuery<ReferralCodeResponse>({
    queryKey: ["/api/referrals/my-code"],
    enabled: !!user,
  });

  const { data: referralsData, isLoading: referralsLoading } = useQuery<MyReferralsResponse>({
    queryKey: ["/api/referrals/my-referrals"],
    enabled: !!user,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const res = await apiRequest("POST", "/api/referrals/invite", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: "Your friend will receive an email invitation.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/my-referrals"] });
    },
    onError: (error: Error) => {
      const message = error.message.includes(":") 
        ? error.message.split(":").slice(1).join(":").trim()
        : error.message;
      toast({
        title: "Error",
        description: message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = (data: InviteFormData) => {
    inviteMutation.mutate(data);
  };

  if (!authResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEO
          title="Referral Program | WashBizHub"
          description="Invite friends to WashBizHub and earn rewards. Share your unique referral link and track your referrals."
          canonicalUrl="/referrals"
        />
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Sign In to Access Referrals</CardTitle>
              <CardDescription className="text-base">
                Please sign in to view your referral code and invite friends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = '/api/auth/cloudflare/login'}
                data-testid="button-login-required"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In to Continue
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Create a free account to start earning referral rewards
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const referralCode = codeData?.referralCode || "Loading...";
  const referralLink = codeData?.referralLink || "";
  const stats = referralsData?.stats || { total: 0, signedUp: 0, converted: 0 };
  const referrals = referralsData?.referrals || [];

  return (
    <>
      <SEO
        title="Your Referrals | Invite Friends | WashBizHub"
        description="Invite friends to WashBizHub and earn rewards. Share your unique referral link and track your referrals."
        canonicalUrl="/referrals"
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <Badge className="mb-4" variant="secondary">
              <Gift className="w-3 h-3 mr-1.5" />
              Referral Program
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-page-title">
              Invite Friends & Earn Rewards
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Share WashBizHub with your network. When friends sign up using your link, you both earn bonus CLEANBI analyses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invites</p>
                    <p className="text-2xl font-bold" data-testid="text-total-invites">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <UserPlus className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Signed Up</p>
                    <p className="text-2xl font-bold" data-testid="text-signed-up">{stats.signedUp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Converted</p>
                    <p className="text-2xl font-bold" data-testid="text-converted">{stats.converted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link with friends to invite them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Referral Code</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={referralCode} 
                      readOnly 
                      className="font-mono text-lg"
                      data-testid="input-referral-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Referral Link</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={referralLink} 
                      readOnly 
                      className="text-sm"
                      data-testid="input-referral-link"
                    />
                    <Button 
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(referralLink)}
                      disabled={!referralLink || codeLoading}
                      data-testid="button-copy-link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Invite by Email
                </CardTitle>
                <CardDescription>
                  Send a personalized invitation email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="friend@example.com"
                              type="email"
                              {...field}
                              data-testid="input-invite-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={inviteMutation.isPending}
                      data-testid="button-send-invite"
                    >
                      {inviteMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Referrals
              </CardTitle>
              <CardDescription>
                Track the status of your referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                  <p className="text-muted-foreground">
                    Share your referral link or invite friends by email to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-referrals">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invited</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Signed Up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr 
                          key={referral.id} 
                          className="border-b last:border-0"
                          data-testid={`row-referral-${referral.id}`}
                        >
                          <td className="py-3 px-2">
                            <span className="text-sm" data-testid={`text-email-${referral.id}`}>
                              {referral.referredEmail}
                            </span>
                          </td>
                          <td className="py-3 px-2" data-testid={`status-${referral.id}`}>
                            {getStatusBadge(referral.status)}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {formatDate(referral.invitedAt)}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {formatDate(referral.signedUpAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
