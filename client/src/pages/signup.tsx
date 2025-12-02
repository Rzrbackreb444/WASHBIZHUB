import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, User, 
  CheckCircle2, Sparkles, Loader2, ArrowRight 
} from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSendingMagicLink(true);

    try {
      const response = await fetch("/api/auth/email/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicLinkEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send magic link");
        return;
      }

      setMagicLinkSent(true);
      toast({
        title: "Check your email!",
        description: "We've sent you a magic link to sign in.",
      });
    } catch (err) {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleReplitSignup = () => {
    window.location.href = "/api/login";
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/email/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      toast({
        title: "Welcome to WashBizHub!",
        description: "Your account has been created successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const passwordStrength = () => {
    if (!password) return null;
    if (password.length < 8) return { label: "Too short", color: "text-red-500" };
    if (password.length < 12) return { label: "Good", color: "text-amber-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Get Started Free</h1>
          <p className="text-muted-foreground">Join 72,000+ laundromat professionals</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription>Choose how you'd like to sign up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password" data-testid="tab-password">
                  <Lock className="w-4 h-4 mr-2" />
                  Email & Password
                </TabsTrigger>
                <TabsTrigger value="magic-link" data-testid="tab-magic-link">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Magic Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="magic-link" className="space-y-4 mt-4">
                {!magicLinkSent ? (
                  <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                    <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No password needed! We'll email you a secure link to sign in instantly.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="magicEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="magicEmail"
                          type="email"
                          placeholder="you@example.com"
                          value={magicLinkEmail}
                          onChange={(e) => setMagicLinkEmail(e.target.value)}
                          className="pl-10"
                          disabled={isSendingMagicLink}
                          data-testid="input-magic-email"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11"
                      disabled={isSendingMagicLink || !magicLinkEmail}
                      data-testid="button-send-magic-link"
                    >
                      {isSendingMagicLink ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Magic Link
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Check your email!</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        We sent a magic link to <span className="font-medium text-foreground">{magicLinkEmail}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the link in the email to sign in. The link expires in 15 minutes.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setMagicLinkSent(false)}
                      className="mt-4"
                      data-testid="button-resend-magic-link"
                    >
                      Send another link
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="password" className="space-y-4 mt-4">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10"
                          disabled={isSubmitting}
                          data-testid="input-firstname"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isSubmitting}
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                        data-testid="input-email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={isSubmitting}
                        data-testid="input-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {strength && (
                      <p className={`text-xs ${strength.color}`}>
                        Password strength: {strength.label}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                        data-testid="input-confirm-password"
                        required
                      />
                      {confirmPassword && password === confirmPassword && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isSubmitting}
                    data-testid="button-signup-email"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleReplitSignup}
              variant="outline"
              className="w-full h-11"
              data-testid="button-signup-google"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Free</Badge>
                <span>1 CLEANBI analysis per day</span>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Free</Badge>
                <span>Access to all calculators & tools</span>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Free</Badge>
                <span>Community forum access</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
