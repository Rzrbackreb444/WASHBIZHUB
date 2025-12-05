import { useEffect, useState } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-verified">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Invalid verification link. Please request a new one.");
      return;
    }

    verifyEmail(token, email);
  }, [searchString]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch("/api/auth/email/verify-email", {
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

      if (data.alreadyVerified) {
        setStatus("already-verified");
      } else {
        setStatus("success");
      }
      
      toast({
        title: data.alreadyVerified ? "Already Verified!" : "Email Verified!",
        description: data.alreadyVerified 
          ? "Your email was already verified. You're all set!"
          : "Welcome to WashBizHub! Your email is now verified.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage("Verification failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 auth-gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="text-center pb-2">
            {status === "loading" && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Verifying your email...</CardTitle>
                <CardDescription className="text-base">Please wait while we verify your account.</CardDescription>
              </>
            )}
            
            {(status === "success" || status === "already-verified") && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  {status === "already-verified" ? "Already Verified!" : "Email Verified!"}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {status === "already-verified" 
                    ? "Your email was already verified. Redirecting..."
                    : "Welcome to WashBizHub! Redirecting you now..."
                  }
                </CardDescription>
              </motion.div>
            )}
            
            {status === "error" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">Verification Failed</CardTitle>
                <CardDescription className="text-base mt-2">{errorMessage}</CardDescription>
              </motion.div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {(status === "success" || status === "already-verified") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    You now have full access to CLEANBI, calculators, marketplace, and more!
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation("/")} 
                  className="w-full h-11"
                  data-testid="button-go-home"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <Button 
                  onClick={() => setLocation("/login")} 
                  className="w-full h-11"
                  data-testid="button-go-login"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In & Request New Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/signup")} 
                  className="w-full h-11"
                  data-testid="button-go-signup"
                >
                  Create New Account
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
        
        {status !== "loading" && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
