import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen, GraduationCap, Award, Zap } from "lucide-react";
import { getStripe } from "@/lib/lazy-stripe";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function PremiumComboPackage() {
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleComboCheckout = async () => {
    setIsPurchasing(true);
    try {
      const response = await apiRequest("POST", "/api/premium-combo/checkout", {
        courseIds: ["course-1", "course-2"], // All courses
        includeBook: true,
      });

      const stripe = await getStripe();
      if (!stripe) throw new Error("Stripe not available");

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.sessionId,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const benefits = [
    { icon: BookOpen, text: "The Laundromat Bible ($97 value)" },
    { icon: GraduationCap, text: "All Premium Courses (unlimited)" },
    { icon: Award, text: "Certificates of Completion" },
    { icon: Zap, text: "Priority Support" },
    { icon: CheckCircle2, text: "Lifetime Access" },
    { icon: Zap, text: "Monthly Updates & New Content" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="text-center space-y-4">
          <Badge className="mx-auto w-fit">BEST VALUE</Badge>
          <CardTitle className="text-4xl">Premium Combo Package</CardTitle>
          <p className="text-muted-foreground">
            Everything you need to master the laundromat business
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Pricing */}
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold">$297</span>
              <span className="text-xl text-muted-foreground line-through">$600+</span>
            </div>
            <p className="text-sm text-green-600 font-semibold">Save $300+ (50% off)</p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit.text}</span>
                </div>
              );
            })}
          </div>

          {/* What's Included */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              The Laundromat Bible
            </h3>
            <p className="text-sm text-muted-foreground">
              13 chapters of proven strategies, financial frameworks, and step-by-step operational playbooks.
              Access lifetime updates as new laundromat trends emerge.
            </p>

            <h3 className="font-semibold flex items-center gap-2 mt-4">
              <GraduationCap className="w-4 h-4" />
              Premium Courses
            </h3>
            <div className="space-y-2 text-sm">
              <p>✓ <strong>Finding Deals</strong> - Location analysis, due diligence, negotiation tactics</p>
              <p>✓ <strong>Operations Mastery</strong> - POS systems, IoT monitoring, cost optimization</p>
              <p>✓ <strong>Scaling Strategy</strong> - Multi-store management, financing, exit planning</p>
            </div>
          </div>

          {/* Interactive Features Highlight */}
          <div className="border rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-sm">Interactive Learning Experience</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🎥 Video lessons with real-time progress tracking</li>
              <li>📚 Interactive book reader with highlights & bookmarks</li>
              <li>🎓 Knowledge checks with instant feedback</li>
              <li>📝 Annotate, bookmark & take notes anywhere</li>
              <li>🏆 Earn certificates & track your learning journey</li>
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleComboCheckout}
            disabled={isPurchasing}
            data-testid="button-combo-checkout"
          >
            {isPurchasing ? "Processing..." : "Get Premium Access Now"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ✓ 30-day money-back guarantee • ✓ Access updates forever • ✓ Cancel anytime
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
