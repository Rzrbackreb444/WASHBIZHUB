import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ArrowRight, Settings, BookOpen, Calculator } from "lucide-react";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    planName?: string;
    status?: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      fetch(`/api/stripe/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSubscriptionDetails({
            planName: data.planName || 'Pro',
            status: data.status || 'active',
          });
        })
        .catch(() => {
          setSubscriptionDetails({ planName: 'Your Plan', status: 'active' });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setSubscriptionDetails({ planName: 'Your Plan', status: 'active' });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-white/70">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white/10 backdrop-blur border-accent/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <CardTitle className="text-3xl text-white" data-testid="text-success-title">
              Welcome to WashBizHub!
            </CardTitle>
            <CardDescription className="text-xl text-white/70">
              Your {subscriptionDetails?.planName} subscription is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 text-center">
              <p className="text-white/80 mb-2">
                You now have full access to all premium features. Here's what you can do next:
              </p>
            </div>

            <div className="grid gap-4">
              <Link href="/cleanbi-auto">
                <Button 
                  className="w-full justify-between bg-accent hover:bg-accent/90 text-accent-foreground"
                  data-testid="button-go-cleanbi"
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Run a CLEANBI Analysis
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/pos-command-center">
                <Button 
                  variant="outline"
                  className="w-full justify-between border-white/30 text-white hover:bg-white/10"
                  data-testid="button-go-pos"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Set Up Your POS System
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/courses">
                <Button 
                  variant="outline"
                  className="w-full justify-between border-white/30 text-white hover:bg-white/10"
                  data-testid="button-go-courses"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Browse Premium Courses
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="text-center text-white/50 text-sm">
              Need help getting started? Contact us at{' '}
              <a href="mailto:support@washbizhub.com" className="text-accent hover:underline">
                support@washbizhub.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
