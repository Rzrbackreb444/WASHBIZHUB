import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Target,
  TrendingUp,
  ClipboardCheck,
  Shield,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Star,
  CheckCircle,
  Zap,
  Users,
  BarChart3,
  Rocket,
  Crown,
  Gift,
  GraduationCap,
} from "lucide-react";

const doctrineSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "The Laundromat Bible Doctrines",
  "description": "Four proven frameworks from three generations of industry expertise: C.L.E.A.N., W.A.S.H., S.O.A.P., and D.R.Y.",
  "provider": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "courseWorkload": "PT20H"
  }
};

const frameworks = [
  {
    id: "clean",
    acronym: "C.L.E.A.N.",
    title: "Business Foundation",
    icon: Target,
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-500/20",
    borderColor: "border-teal-500/30",
    items: [
      { letter: "C", term: "Customers", description: "Retention strategies, LTV focus" },
      { letter: "L", term: "Location", description: "Prime site selection, CLEANBI scoring" },
      { letter: "E", term: "Efficiency", description: "AI-powered operations" },
      { letter: "A", term: "Adapt", description: "Hybrid services, trends" },
      { letter: "N", term: "Numbers", description: "KPIs, metrics mastery" },
    ],
  },
  {
    id: "wash",
    acronym: "W.A.S.H.",
    title: "Growth Strategy",
    icon: TrendingUp,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    items: [
      { letter: "W", term: "Work Biz", description: "Hands-on approach" },
      { letter: "A", term: "Align Market", description: "Demographics targeting" },
      { letter: "S", term: "Scale Smart", description: "Systems and SOPs" },
      { letter: "H", term: "Harness Trends", description: "Eco, tech, hybrids" },
    ],
  },
  {
    id: "soap",
    acronym: "S.O.A.P.",
    title: "Daily Operations",
    icon: ClipboardCheck,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    items: [
      { letter: "S", term: "Systems Check", description: "Daily machine/store audit" },
      { letter: "O", term: "Observe Customers", description: "Flow analysis" },
      { letter: "A", term: "Adjust Ops", description: "Dynamic pricing" },
      { letter: "P", term: "Promote Brand", description: "Authentic marketing" },
    ],
  },
  {
    id: "dry",
    acronym: "D.R.Y.",
    title: "Buying/Selling",
    icon: Shield,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
    items: [
      { letter: "D", term: "Due Diligence", description: "Verification process" },
      { letter: "R", term: "Risk Management", description: "Compliance, insurance" },
      { letter: "Y", term: "Your Eyes Open", description: "Avoid turnkey traps" },
    ],
  },
];

const learningPath = [
  {
    step: 1,
    framework: "D.R.Y.",
    phase: "Before Buying",
    description: "Master due diligence before investing",
    link: "/cleanbi",
    linkText: "Use CLEANBI",
    icon: Shield,
  },
  {
    step: 2,
    framework: "S.O.A.P.",
    phase: "Daily Operations",
    description: "Run your store efficiently every day",
    link: "/pos",
    linkText: "Try WashBizPOS",
    icon: ClipboardCheck,
  },
  {
    step: 3,
    framework: "W.A.S.H.",
    phase: "Growth Phase",
    description: "Scale your business strategically",
    link: "/courses",
    linkText: "View Courses",
    icon: TrendingUp,
  },
  {
    step: 4,
    framework: "C.L.E.A.N.",
    phase: "Mastery",
    description: "Build a laundromat empire",
    link: "/book",
    linkText: "Get The Bible",
    icon: Target,
  },
];

const subscriptionTiers = [
  {
    name: "Free",
    price: 0,
    icon: Gift,
    description: "Basic doctrine overview",
    features: [
      "Access to CLEANBI scoring",
      "Framework summaries",
      "Community forum access",
      "Basic calculators",
    ],
    cta: "Get Started Free",
    ctaLink: "/pricing",
    highlight: false,
  },
  {
    name: "14-Day Trial",
    price: 0,
    duration: "14 days",
    icon: Rocket,
    description: "Full POS with doctrine integration",
    features: [
      "Complete POS system access",
      "AI-powered insights",
      "Doctrine-based alerts",
      "Dynamic pricing engine",
    ],
    cta: "Start Free Trial",
    ctaLink: "/pricing",
    highlight: true,
  },
  {
    name: "Pro",
    price: 99,
    icon: Crown,
    description: "Full doctrine courses + coaching",
    features: [
      "All doctrine video courses",
      "Personalized coaching calls",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Go Pro",
    ctaLink: "/pricing",
    highlight: false,
  },
];

export default function DoctrinePage() {
  const scrollToFrameworks = () => {
    document.getElementById("frameworks")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SEO
        title="Doctrine Learning Hub | The Laundromat Bible Frameworks"
        description="Master the C.L.E.A.N., W.A.S.H., S.O.A.P., and D.R.Y. frameworks from The Laundromat Bible. Four proven methodologies from three generations of industry expertise."
        keywords="laundromat business framework, CLEAN methodology, WASH strategy, SOAP operations, DRY due diligence, laundromat bible"
        canonical="/doctrine"
        schema={doctrineSchema}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#002855] to-[#001428]">
        <section className="relative py-20 md:py-32 overflow-hidden" data-testid="section-hero">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center">
              <Badge variant="outline" className="mb-6 border-teal-500/50 text-teal-400 bg-teal-500/10" data-testid="badge-hero">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                The Laundromat Bible
              </Badge>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" data-testid="text-hero-title">
                Master The Laundromat Bible
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                  Doctrines
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10" data-testid="text-hero-subtitle">
                Four proven frameworks from three generations of industry expertise
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={scrollToFrameworks}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold px-8 py-6 text-lg"
                  data-testid="button-start-journey"
                >
                  Start Your Journey
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Link href="/book">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 text-lg"
                    data-testid="button-get-book"
                  >
                    <BookOpen className="mr-2 w-5 h-5" />
                    Get The Book
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/60">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span>3 Generations of Knowledge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <span>72K+ Community Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span>Proven Results</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="frameworks" className="py-20" data-testid="section-frameworks">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-frameworks-title">
                The Four Doctrine Frameworks
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Each framework addresses a critical phase of laundromat ownership
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {frameworks.map((framework) => (
                <Card
                  key={framework.id}
                  className={`bg-white/5 backdrop-blur-xl border ${framework.borderColor} hover:bg-white/10 transition-all duration-300`}
                  data-testid={`card-framework-${framework.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${framework.bgColor}`}>
                          <framework.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black text-white">
                            {framework.acronym}
                          </CardTitle>
                          <CardDescription className="text-white/60">
                            {framework.title}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {framework.items.map((item) => (
                        <div
                          key={item.letter}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                        >
                          <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${framework.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {item.letter}
                          </span>
                          <div>
                            <span className="font-semibold text-white">{item.term}</span>
                            <p className="text-sm text-white/60">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white/5" data-testid="section-learning-path">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-learning-path-title">
                Your Learning Path
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Progress through each phase to build your laundromat empire
              </p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 via-blue-500 to-teal-500 -translate-y-1/2 mx-16" />

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {learningPath.map((step, index) => (
                  <div key={step.step} className="relative" data-testid={`card-learning-step-${step.step}`}>
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all duration-300 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {step.step}
                        </div>
                        <step.icon className="w-5 h-5 text-teal-400" />
                      </div>

                      <Badge variant="outline" className="mb-3 text-xs border-white/30 text-white/80">
                        {step.phase}
                      </Badge>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {step.framework}
                      </h3>
                      <p className="text-sm text-white/60 mb-4">
                        {step.description}
                      </p>

                      <Link href={step.link}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 p-0"
                          data-testid={`link-learning-step-${step.step}`}
                        >
                          {step.linkText}
                          <ArrowRight className="ml-1.5 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    {index < learningPath.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20">
                        <ChevronRight className="w-6 h-6 text-white/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20" data-testid="section-subscription">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-subscription-title">
                Choose Your Path
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                From free tools to full coaching, we have the right plan for your journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative bg-white/5 backdrop-blur-xl border ${
                    tier.highlight
                      ? "border-teal-500 ring-2 ring-teal-500/20"
                      : "border-white/10"
                  } hover:bg-white/10 transition-all duration-300`}
                  data-testid={`card-tier-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${
                      tier.highlight ? "bg-gradient-to-br from-teal-500 to-cyan-500" : "bg-white/10"
                    } flex items-center justify-center`}>
                      <tier.icon className="w-7 h-7 text-white" />
                    </div>

                    <CardTitle className="text-2xl font-bold text-white">
                      {tier.name}
                    </CardTitle>

                    <div className="mt-2">
                      <span className="text-4xl font-black text-white">${tier.price}</span>
                      {tier.duration ? (
                        <span className="text-white/60 text-sm"> / {tier.duration}</span>
                      ) : tier.price > 0 ? (
                        <span className="text-white/60 text-sm"> /month</span>
                      ) : null}
                    </div>

                    <CardDescription className="text-white/60">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={tier.ctaLink}>
                      <Button
                        className={`w-full font-bold ${
                          tier.highlight
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                        data-testid={`button-tier-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {tier.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white/5" data-testid="section-book-promotion">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-400 bg-amber-500/10">
                    <Star className="w-3.5 h-3.5 mr-1.5" />
                    The Complete Guide
                  </Badge>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-book-promo-title">
                    Get The Laundromat Bible
                  </h2>

                  <p className="text-lg text-white/70 mb-6">
                    The definitive guide to laundromat success. Written by Nick Kremers and Larry Kremers, 
                    combining decades of hands-on experience with modern AI-powered strategies.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 text-white/80">
                      <GraduationCap className="w-5 h-5 text-teal-400" />
                      <span>20+ Chapters</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span>4 Frameworks</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span>Expert Authors</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/book">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                        data-testid="button-get-the-book"
                      >
                        <BookOpen className="mr-2 w-5 h-5" />
                        Get The Book
                      </Button>
                    </Link>
                    <Link href="/courses">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        data-testid="button-view-courses"
                      >
                        View Video Courses
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl blur-2xl" />
                  <div className="relative bg-gradient-to-br from-[#001F3F] to-[#002855] rounded-2xl p-8 border border-white/10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                          NK
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Nick Kremers</h4>
                          <p className="text-sm text-white/60">Author & Operator</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                          LK
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Larry Kremers</h4>
                          <p className="text-sm text-white/60">Industry Veteran</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-white/70 italic">
                          "Three generations of laundromat knowledge distilled into actionable frameworks for modern operators."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-white/10" data-testid="section-final-cta">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Laundromat Business?
            </h2>
            <p className="text-lg text-white/60 mb-8">
              Start with the free tools or dive into the complete doctrine courses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cleanbi">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold"
                  data-testid="button-try-cleanbi"
                >
                  Try CLEANBI Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  data-testid="button-view-all-plans"
                >
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
