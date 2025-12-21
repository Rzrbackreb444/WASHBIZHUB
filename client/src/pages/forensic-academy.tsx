import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/components/AuthModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/WBH_LOGO_TRANSPARENT_1766327248095.png";
import {
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  Users,
  Shield,
  CheckCircle,
  Play,
  Lock,
  Star,
  ArrowRight,
  Target,
  Briefcase,
  TrendingUp,
  Zap,
  Clock,
  DollarSign,
  Building2,
  Search,
  Calculator,
  AlertTriangle,
  Eye,
  FileCheck,
  Loader2,
  ExternalLink
} from "lucide-react";

const ACADEMY_PRICE = 997;
const ACADEMY_STRIPE_PRICE_ID = "price_forensic_academy_997";

const CURRICULUM_MODULES = [
  {
    id: 1,
    title: "Foundation: Understanding Laundromat Financials",
    duration: "2 hours",
    lessons: [
      "Decoding P&L Statements for Laundromats",
      "Cash Flow Analysis: What Really Matters",
      "Understanding Revenue Recognition",
      "The 7 Key Financial Metrics Every Investor Must Know"
    ],
    icon: Calculator
  },
  {
    id: 2,
    title: "Forensic Due Diligence Framework",
    duration: "3 hours",
    lessons: [
      "Larry's 50+ Red Flag Checklist",
      "Lease Analysis: Spotting Hidden Traps",
      "Equipment Age vs. Actual Condition",
      "Utility Bill Forensics: Verifying Revenue Claims"
    ],
    icon: Search
  },
  {
    id: 3,
    title: "Valuation Mastery",
    duration: "2.5 hours",
    lessons: [
      "The 4 Valuation Methods Explained",
      "SDE Adjustments & Normalization",
      "Multiple Selection: When to Pay More (or Less)",
      "Building Your Offer Strategy"
    ],
    icon: DollarSign
  },
  {
    id: 4,
    title: "Location Intelligence with CLEANBI",
    duration: "2 hours",
    lessons: [
      "The 17-Factor Scoring System",
      "Demographics That Drive Revenue",
      "Competition Mapping & Analysis",
      "Using CLEANBI Reports in Negotiations"
    ],
    icon: Target
  },
  {
    id: 5,
    title: "Deal Structuring & Negotiation",
    duration: "2.5 hours",
    lessons: [
      "Letter of Intent (LOI) Strategies",
      "Asset vs. Stock Purchase Decisions",
      "Seller Financing Negotiations",
      "SBA Loan Preparation"
    ],
    icon: Briefcase
  },
  {
    id: 6,
    title: "Blue Whale BCT Engineering Module",
    duration: "3 hours",
    lessons: [
      "Advanced Equipment Diagnostics",
      "Dexter vs. Speed Queen: Technical Deep Dive",
      "Preventive Maintenance Economics",
      "Equipment Replacement Decision Framework"
    ],
    icon: Zap,
    featured: true
  }
];

const VAULT_CONTENTS = [
  { title: "400+ Larry Larsen Articles", icon: FileText, description: "Decades of industry wisdom" },
  { title: "Due Diligence Checklists", icon: FileCheck, description: "100-point verification system" },
  { title: "Financial Model Templates", icon: Calculator, description: "Excel models for valuation" },
  { title: "Lease Red Flag Guide", icon: AlertTriangle, description: "50+ trap alerts" },
  { title: "LOI Templates", icon: Briefcase, description: "Battle-tested documents" },
  { title: "Equipment Guides", icon: Zap, description: "Brand comparisons & specs" }
];

const TESTIMONIALS = [
  {
    name: "Michael R.",
    role: "Acquired 3 laundromats",
    quote: "Larry's forensic approach saved me from a $180K mistake. The utility bill analysis alone was worth the entire course.",
    rating: 5
  },
  {
    name: "Sarah T.",
    role: "First-time buyer",
    quote: "I went from knowing nothing to confidently negotiating my first deal. The vault resources are incredible.",
    rating: 5
  },
  {
    name: "David K.",
    role: "Multi-unit operator",
    quote: "Even with 15 years in the industry, I learned new forensic techniques. The CLEANBI integration is a game-changer.",
    rating: 5
  }
];

export default function ForensicAcademy() {
  const { user, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["/api/forensic-academy/enrollment"],
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/forensic-academy/checkout", {
        method: "POST",
      });
      return response;
    },
    onSuccess: (data: { url?: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment Error",
        description: error.message || "Failed to start enrollment. Please try again.",
        variant: "destructive",
      });
      setIsEnrolling(false);
    },
  });

  const handleEnroll = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsEnrolling(true);
    enrollMutation.mutate();
  };

  const isEnrolled = enrollment?.enrolled === true;

  return (
    <>
      <SEO
        title="WBH Forensic Investor Academy | Master Laundromat Due Diligence"
        description="Learn Larry Larsen's proven forensic due diligence framework. Access 400+ exclusive articles, templates, and the certification that serious investors demand."
        canonicalUrl="/forensic-academy"
        keywords={["laundromat investing", "due diligence", "forensic analysis", "laundromat training", "Larry Larsen"]}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2e4a] via-[#1e3a5f] to-[#0f1d30] py-20 lg:py-28">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-[#C8A661] text-white border-none">
                  <Award className="w-3 h-3 mr-1" />
                  Professional Certification
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  WBH Forensic<br />
                  <span className="text-[#C8A661]">Investor Academy</span>
                </h1>
                
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Master Larry Larsen's proven forensic due diligence framework.
                  Stop guessing. Start investing with confidence.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="w-5 h-5 text-[#C8A661]" />
                    <span>15+ Hours of Content</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <FileText className="w-5 h-5 text-[#C8A661]" />
                    <span>400+ Articles</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Award className="w-5 h-5 text-[#C8A661]" />
                    <span>WBH Certification</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <div className="space-y-4">
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      You're Enrolled!
                    </Badge>
                    <div className="flex gap-4">
                      <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#b89551] text-white">
                        <a href={`https://classroom.google.com/c/${process.env.GOOGLE_CLASSROOM_COURSE_ID || 'WBH_FORENSIC'}`} target="_blank" rel="noopener noreferrer">
                          <Play className="w-5 h-5 mr-2" />
                          Go to Classroom
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        <a href={`https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_VAULT_FOLDER_ID || 'VAULT'}`} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-5 h-5 mr-2" />
                          Access Vault
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      size="lg"
                      className="bg-[#C8A661] hover:bg-[#b89551] text-white text-lg px-8 py-6"
                      onClick={handleEnroll}
                      disabled={isEnrolling || enrollMutation.isPending}
                      data-testid="button-enroll-academy"
                    >
                      {isEnrolling || enrollMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-5 h-5 mr-2" />
                          Enroll Now - ${ACADEMY_PRICE}
                        </>
                      )}
                    </Button>
                    <p className="text-white/50 text-sm">
                      One-time payment • Lifetime access
                    </p>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-6">
                      <img src={logoUrl} alt="WBH" className="h-24 w-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-white text-center mb-4">
                      Certified Forensic Investor
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Complete 6-module curriculum",
                        "Pass the final assessment",
                        "Earn your WBH certificate",
                        "Join the alumni network"
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-white/80">
                          <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Master Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                Comprehensive Curriculum
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                What You'll Master
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Six intensive modules designed by Larry Larsen with 40+ years of industry experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CURRICULUM_MODULES.map((module) => (
                <Card 
                  key={module.id} 
                  className={`hover-elevate ${module.featured ? 'border-[#C8A661] ring-1 ring-[#C8A661]/20' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${module.featured ? 'bg-[#C8A661]/10' : 'bg-muted'}`}>
                        <module.icon className={`w-6 h-6 ${module.featured ? 'text-[#C8A661]' : 'text-muted-foreground'}`} />
                      </div>
                      {module.featured && (
                        <Badge className="bg-[#C8A661] text-white">Featured</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-4">
                      Module {module.id}: {module.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.lessons.map((lesson, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Laundromat Larry Vault Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">
                  <Lock className="w-3 h-3 mr-1" />
                  Exclusive Access
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  The Laundromat Larry Vault
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Get instant access to Larry Larsen's private library of 400+ articles, templates, 
                  and resources accumulated over 40+ years in the industry.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {VAULT_CONTENTS.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-md bg-[#C8A661]/10">
                        <item.icon className="w-5 h-5 text-[#C8A661]" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Card className="bg-gradient-to-br from-[#1a2e4a] to-[#0f1d30] text-white border-none">
                  <CardContent className="p-8">
                    <div className="absolute -top-4 -right-4 bg-[#C8A661] text-white px-4 py-1 rounded-full text-sm font-medium">
                      $2,500+ Value
                    </div>
                    <h3 className="text-2xl font-bold mb-6">Vault Contents Include:</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                        <span>400+ Larry Larsen Articles</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                        <span>Financial Model Templates (Excel)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                        <span>Due Diligence Checklists</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                        <span>LOI & Contract Templates</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                        <span>Equipment Comparison Guides</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                        <span>Private Alumni Community</span>
                      </div>
                    </div>
                    <Separator className="my-6 bg-white/20" />
                    <div className="text-center">
                      <p className="text-white/60 text-sm mb-2">Lifetime Access</p>
                      <p className="text-3xl font-bold text-[#C8A661]">${ACADEMY_PRICE}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Users className="w-3 h-3 mr-1" />
                Success Stories
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                What Our Graduates Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, idx) => (
                <Card key={idx} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#C8A661] text-[#C8A661]" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#1a2e4a] to-[#0f1d30]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge className="mb-4 bg-[#C8A661] text-white border-none">
              <Zap className="w-3 h-3 mr-1" />
              Limited Enrollment
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Invest with Confidence?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join serious investors who trust Larry's forensic methodology.
              Your due diligence advantage starts here.
            </p>

            {isEnrolled ? (
              <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#b89551] text-white text-lg px-8 py-6">
                <a href={`https://classroom.google.com/c/${process.env.GOOGLE_CLASSROOM_COURSE_ID || 'WBH_FORENSIC'}`} target="_blank" rel="noopener noreferrer">
                  <Play className="w-5 h-5 mr-2" />
                  Continue Learning
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-[#C8A661] hover:bg-[#b89551] text-white text-lg px-8 py-6"
                onClick={handleEnroll}
                disabled={isEnrolling || enrollMutation.isPending}
                data-testid="button-enroll-academy-cta"
              >
                {isEnrolling || enrollMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Enroll Now - ${ACADEMY_PRICE}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}

            <p className="text-white/40 text-sm mt-4">
              30-day money-back guarantee • Secure payment via Stripe
            </p>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-8 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">WBH Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">500+ Graduates</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">$50M+ Deals Analyzed</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
