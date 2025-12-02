import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AuthVerify() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Invalid magic link. Please request a new one.");
      return;
    }

    verifyMagicLink(token, email);
  }, [searchString]);

  const verifyMagicLink = async (token: string, email: string) => {
    try {
      const response = await fetch("/api/auth/email/magic-link/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Verification failed");
        return;
      }

      setStatus("success");
      toast({
        title: "Welcome to WashBizHub!",
        description: "You've successfully signed in.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage("Verification failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
              </div>
              <CardTitle>Verifying your magic link...</CardTitle>
              <CardDescription>Please wait while we sign you in.</CardDescription>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">Success!</CardTitle>
              <CardDescription>You've been signed in. Redirecting you now...</CardDescription>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-red-600 dark:text-red-400">Verification Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>
        
        {status === "error" && (
          <CardContent className="text-center space-y-4">
            <Button onClick={() => setLocation("/signup")} className="w-full" data-testid="button-try-again">
              Request New Magic Link
            </Button>
            <Button variant="outline" onClick={() => setLocation("/login")} className="w-full" data-testid="button-go-login">
              Go to Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
