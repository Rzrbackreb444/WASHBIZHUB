import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Github, Mail, LogIn } from "lucide-react";
import { useEffect } from "react";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleReplitLogin = async () => {
    // Replit Auth handles login via the auth setup in server
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Lock className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to WashBizHub</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Replit Auth Button */}
            <Button
              onClick={handleReplitLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold gap-2 h-11"
              data-testid="button-login-replit"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Replit
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">or</span>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2 h-10"
                data-testid="button-login-github"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 h-10"
                data-testid="button-login-email"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Badge>✓</Badge>
                <span>Access all calculators & tools</span>
              </div>
              <div className="flex gap-2">
                <Badge>✓</Badge>
                <span>Save designs & marketplace listings</span>
              </div>
              <div className="flex gap-2">
                <Badge>✓</Badge>
                <span>Track your progress & achievements</span>
              </div>
              <div className="flex gap-2">
                <Badge>✓</Badge>
                <span>Join our community forum</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? Create one during login to get started for free.
        </p>
      </div>
    </div>
  );
}
