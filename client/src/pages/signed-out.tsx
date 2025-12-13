import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, LogIn, Home, Shield } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function SignedOut() {
  return (
    <>
      <Helmet>
        <title>Signed Out | WashBizHub</title>
        <meta name="description" content="You have been successfully signed out of your WashBizHub account." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 auth-gradient-bg"
        data-testid="signed-out-page"
      >
        <motion.div 
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="shadow-lg border-border/50 overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>

              <h1 
                className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
                data-testid="text-signed-out-title"
              >
                You're Signed Out
              </h1>
              
              <p 
                className="text-muted-foreground mb-6"
                data-testid="text-signed-out-message"
              >
                You have been successfully signed out of your WashBizHub account. Your session has been securely ended.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Session Secured
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your session has been cleared and you've been logged out from all devices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button 
                    className="w-full h-11 bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-sign-in-again"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In Again
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="w-full h-11"
                    data-testid="button-go-home"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                Thank you for using WashBizHub. We hope to see you again soon!
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help?{" "}
            <Link 
              href="/contact" 
              className="text-[#C8A661] hover:underline font-medium"
              data-testid="link-contact"
            >
              Contact Support
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
