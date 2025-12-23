import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface OwnerGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function OwnerGuard({ 
  children, 
  title = "Owner Access Only",
  description = "This area is restricted to Larry Larsen and Nick Kremers."
}: OwnerGuardProps) {
  const { user, isLoading, authResolved } = useAuth();
  
  const { data: ownerCheck, isLoading: checkingOwner } = useQuery<{ isOwner: boolean }>({
    queryKey: ["/api/auth/check-owner"],
    enabled: !!user,
  });

  if (!authResolved || (user && checkingOwner)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C8A661]" />
          <p className="text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-[#C8A661]/10 w-fit">
              <Lock className="w-8 h-8 text-[#C8A661]" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Sign In Required</CardTitle>
            <CardDescription className="text-slate-400">
              Please sign in to access the Command Center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]" 
              size="lg"
              onClick={() => {
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
              }}
              data-testid="button-owner-login"
            >
              Sign In
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = ownerCheck?.isOwner === true;

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-red-500/10 w-fit">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
            <CardDescription className="text-slate-400">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-300">
                Signed in as: <span className="font-medium text-white">{user.email}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This account doesn't have owner access.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full bg-[#C8A661] hover:bg-[#b89551] text-[#0A1628]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to WashBizHub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
