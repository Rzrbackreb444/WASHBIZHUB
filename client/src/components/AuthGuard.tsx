import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogIn, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthGuard({ 
  children, 
  title = "Sign In Required",
  description = "Please sign in to access this feature. It's free to create an account!"
}: AuthGuardProps) {
  const { user, isLoading, authResolved } = useAuth();
  const [location] = useLocation();

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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                const redirectUrl = encodeURIComponent(location);
                window.location.href = `/login?redirect=${redirectUrl}`;
              }}
              data-testid="button-login-required"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Continue
            </Button>
            <p className="text-center text-sm text-muted-foreground">Free account includes 3 CLEANBI analyses total</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
