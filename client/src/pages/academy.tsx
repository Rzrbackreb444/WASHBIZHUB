import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Star, 
  Users, 
  Wrench,
  Shield,
  Zap,
  Crown,
  ChevronRight,
  Play,
  Lock,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface AcademyCourse {
  id: string;
  title: string;
  description: string;
  price: string;
  level: string;
  duration: number;
  tierLevel: number;
  isFree: boolean;
  certificateEnabled: boolean;
  certificateTitle: string | null;
  prerequisiteCourseId: string | null;
  totalEnrollments: number;
}

const tierColors = {
  1: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
  2: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", gradient: "from-blue-500 to-blue-600" },
  3: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500", gradient: "from-purple-500 to-purple-600" },
  4: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500", gradient: "from-amber-500 to-amber-600" },
};

const tierIcons = {
  1: BookOpen,
  2: Wrench,
  3: Shield,
  4: Crown,
};

const tierBenefits = {
  1: [
    "Basic safety protocols",
    "Customer service fundamentals",
    "Common error code recognition",
    "Daily operational procedures",
    "Equipment cleaning & maintenance",
  ],
  2: [
    "All Level 1 content",
    "Intermediate diagnostic codes",
    "Hands-on troubleshooting workflows",
    "Parts identification & sourcing",
    "Repair time estimation",
    "Multi-brand expertise",
  ],
  3: [
    "All Level 2 content",
    "Control board diagnostics",
    "Motor & drive systems",
    "Advanced electrical troubleshooting",
    "Predictive maintenance techniques",
    "Professional-grade certifications",
  ],
  4: [
    "All Level 3 content",
    "Complete 2,200+ error code database",
    "Business operations management",
    "Vendor relationship strategies",
    "Teaching & mentoring skills",
    "WashBizHub Technical Consultant status",
  ],
};

export default function Academy() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery<AcademyCourse[]>({
    queryKey: ["/api/academy"],
  });

  const bundleCheckout = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/academy/bundle/checkout", {
        method: "POST",
        body: JSON.stringify({ userId: user?.id || "guest" }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    },
  });

  const courseCheckout = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest(`/api/courses/${courseId}/checkout`, {
        method: "POST",
        body: JSON.stringify({ userId: user?.id || "guest" }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    },
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours} hours` : `${minutes} min`;
  };

  const getTotalValue = () => {
    return courses.reduce((sum, c) => sum + parseFloat(c.price), 0);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Laundry Tech Academy",
    "description": "Professional certification program for commercial laundry equipment technicians. From beginner attendant to master technician.",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    },
    "hasCourseInstance": courses.map(c => ({
      "@type": "CourseInstance",
      "name": c.title,
      "courseMode": "online",
      "offers": {
        "@type": "Offer",
        "price": c.price,
        "priceCurrency": "USD"
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Laundry Tech Academy - Professional Certification | WashBizHub"
        description="Become a certified laundry equipment technician. 4-tier certification program from attendant essentials (FREE) to master technician ($799). Learn 2,200+ error codes."
        canonicalUrl="/academy"
        keywords={[
          "laundry technician certification",
          "commercial laundry training",
          "laundromat equipment repair course",
          "Speed Queen repair training",
          "laundry machine maintenance course"
        ]}
        structuredData={[structuredData]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/academy" }
        ]}
      />

      <div className="min-h-screen bg-background" data-testid="page-academy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: "Home", href: "/" },
              { label: "Laundry Tech Academy", href: "/academy" }
            ]} 
          />

          <div className="text-center mb-12 mt-8">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30" data-testid="badge-academy-header">
              <GraduationCap className="w-4 h-4 mr-2" />
              Professional Certification Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-academy-title">
              Laundry Tech Academy
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-academy-subtitle">
              Master commercial laundry equipment repair with our comprehensive 4-tier certification program. 
              From basic attendant skills to master technician expertise.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5" />
                <span>2,200+ Error Codes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="w-5 h-5" />
                <span>Industry Certification</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span>72K+ Community</span>
              </div>
            </div>
          </div>

          <Card className="mb-12 border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10" data-testid="card-bundle-offer">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <Badge className="mb-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    <Gift className="w-3 h-3 mr-1" />
                    Best Value - Save ${getTotalValue() - 999}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2">Complete Academy Bundle</h2>
                  <p className="text-muted-foreground">
                    All 4 certification levels for one price. Unlock your full potential as a laundry equipment expert.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary mb-2">$999</div>
                  <div className="text-sm text-muted-foreground line-through">${getTotalValue()}</div>
                  <Button 
                    size="lg" 
                    className="mt-4"
                    onClick={() => bundleCheckout.mutate()}
                    disabled={bundleCheckout.isPending}
                    data-testid="button-bundle-checkout"
                  >
                    {bundleCheckout.isPending ? "Processing..." : "Get Complete Bundle"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(j => (
                        <div key={j} className="h-4 bg-muted rounded" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => {
                const tier = course.tierLevel || 1;
                const colors = tierColors[tier as keyof typeof tierColors];
                const TierIcon = tierIcons[tier as keyof typeof tierIcons];
                const benefits = tierBenefits[tier as keyof typeof tierBenefits];

                return (
                  <Card 
                    key={course.id} 
                    className={`relative overflow-hidden hover-elevate ${tier === 4 ? 'ring-2 ring-amber-500/50' : ''}`}
                    data-testid={`card-course-tier-${tier}`}
                  >
                    {tier === 4 && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                        Most Popular
                      </div>
                    )}

                    <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                        <TierIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
                          Level {tier}
                        </Badge>
                        {course.isFree && (
                          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            FREE
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDuration(course.duration)}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {course.totalEnrollments} enrolled
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {benefits.slice(0, 5).map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                            <span>{benefit}</span>
                          </div>
                        ))}
                        {benefits.length > 5 && (
                          <div className="text-sm text-muted-foreground pl-6">
                            +{benefits.length - 5} more...
                          </div>
                        )}
                      </div>

                      {course.certificateEnabled && course.certificateTitle && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                          <Award className={`w-5 h-5 ${colors.text}`} />
                          <span className="text-sm font-medium">{course.certificateTitle}</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                      <div className="w-full text-center">
                        {course.isFree ? (
                          <div className="text-2xl font-bold text-emerald-500">FREE</div>
                        ) : (
                          <div className="text-2xl font-bold">${course.price}</div>
                        )}
                      </div>

                      {course.isFree ? (
                        <Link href={`/courses/${course.id}`} className="w-full">
                          <Button className="w-full" data-testid={`button-start-course-${tier}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Start Free Course
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => courseCheckout.mutate(course.id)}
                          disabled={courseCheckout.isPending}
                          data-testid={`button-enroll-course-${tier}`}
                        >
                          {courseCheckout.isPending ? (
                            "Processing..."
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </Button>
                      )}

                      {course.prerequisiteCourseId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          Requires completion of Level {tier - 1}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Why Choose Laundry Tech Academy?</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Industry-Leading Content</h3>
                <p className="text-muted-foreground">
                  Access our database of 2,200+ error codes covering every major commercial laundry brand.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Recognized Certification</h3>
                <p className="text-muted-foreground">
                  Earn certificates that demonstrate your expertise to employers and clients.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Community Support</h3>
                <p className="text-muted-foreground">
                  Join 72K+ industry professionals in our community for ongoing support and networking.
                </p>
              </div>
            </div>
          </div>

          <Card className="mt-16 bg-muted/30" data-testid="card-faq">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Do I need any prior experience?</h4>
                <p className="text-muted-foreground">
                  No! Level 1 (Attendant Essentials) is designed for complete beginners. 
                  Each subsequent level builds on the previous one.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How long do I have access to the courses?</h4>
                <p className="text-muted-foreground">
                  Lifetime access! Once enrolled, you can review materials anytime and access future updates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Are the certificates recognized in the industry?</h4>
                <p className="text-muted-foreground">
                  Yes! Our certifications are recognized by leading laundromat owners and equipment manufacturers 
                  across North America.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What's included in the $999 bundle?</h4>
                <p className="text-muted-foreground">
                  The complete bundle includes all 4 certification levels (normally ${getTotalValue()}), 
                  saving you ${getTotalValue() - 999}. You get full access to all content, certificates, 
                  and community features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
