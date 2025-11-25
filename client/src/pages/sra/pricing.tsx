import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Star,
  Crown,
  Shield,
  Zap,
  Heart,
  Users,
  Bot,
  GraduationCap,
  PenTool,
  Pill,
  Calendar,
  MessageCircle,
  Dumbbell,
  Trophy,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Infinity,
  Sparkles,
  Gift,
  BookOpen,
  Target,
  Award,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";

type BillingCycle = "monthly" | "annual";

const pricingTiers = [
  {
    id: "free",
    name: "Free",
    icon: Heart,
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Start your recovery journey",
    popular: false,
    features: [
      "Basic medication tracking (3 meds max)",
      "3 AI companion chats per month",
      "Community read-only access",
      "1 exercise routine",
      "Email support"
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const
  },
  {
    id: "warrior",
    name: "Warrior",
    icon: Shield,
    monthlyPrice: 29,
    annualPrice: 290,
    description: "Full recovery toolkit",
    popular: false,
    features: [
      "Unlimited medication & appointment tracking",
      "Unlimited AI Recovery Companion chats",
      "Full community access (post, comment, message)",
      "Exercise library with 50+ routines",
      "Progress milestones & achievements",
      "Daily check-ins with AI feedback",
      "SMS/Email reminders",
      "Priority email support"
    ],
    cta: "Become a Warrior",
    ctaVariant: "default" as const
  },
  {
    id: "champion",
    name: "Champion",
    icon: Trophy,
    monthlyPrice: 79,
    annualPrice: 790,
    description: "Complete recovery education",
    popular: true,
    badge: "MOST POPULAR",
    features: [
      "Everything in Warrior PLUS:",
      "Recovery University access (33 chapters)",
      "Ghostwriting Suite (AI book writing)",
      "3 book projects",
      "KDP export formatting",
      "Chapter templates from Nick's books",
      "Monthly group coaching calls",
      "Custom exercise plans",
      "Phone support"
    ],
    cta: "Become a Champion",
    ctaVariant: "default" as const
  },
  {
    id: "legend",
    name: "Legend",
    icon: Crown,
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "Premium coaching experience",
    popular: false,
    features: [
      "Everything in Champion PLUS:",
      "Unlimited ghostwriting projects",
      "1-on-1 coaching with Nick's team (2 calls/month)",
      "Professional book editing assistance",
      "Priority publishing support",
      "VR Recovery App access (when available)",
      "White-label community features",
      "Direct line to Nick for questions"
    ],
    cta: "Become a Legend",
    ctaVariant: "default" as const
  }
];

const lifetimeTier = {
  id: "lifetime",
  name: "Lifetime Access",
  icon: Infinity,
  price: 997,
  description: "Everything in Legend FOREVER",
  features: [
    "All current and future features",
    "Founding Member badge",
    "Name in Recovery Bible acknowledgments",
    "Exclusive Founder's community",
    "All future courses included",
    "Priority feature requests"
  ],
  cta: "Get Lifetime Access",
  badge: "BEST VALUE"
};

const faqs = [
  {
    id: 1,
    question: "Can I switch plans at any time?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, your new rate will take effect at the next billing cycle."
  },
  {
    id: 2,
    question: "What's included in the money-back guarantee?",
    answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied with your recovery experience, contact us within 30 days for a full refund, no questions asked."
  },
  {
    id: 3,
    question: "How does the AI Recovery Companion work?",
    answer: "Our AI Recovery Companion is trained on Nick's wisdom from The Ultimate Stroke Recovery Bible, 6+ years of recovery experience, and proven rehabilitation techniques. It provides personalized guidance, motivation, and answers 24/7."
  },
  {
    id: 4,
    question: "Can my caregiver access my account?",
    answer: "Absolutely! Warrior plans and above include caregiver access features. You can invite family members or caregivers to help track your progress and coordinate your recovery."
  },
  {
    id: 5,
    question: "What is the Ghostwriting Suite?",
    answer: "The Ghostwriting Suite helps you write and publish your own stroke recovery story. It includes AI-assisted writing, KDP formatting for Amazon publishing, and chapter templates based on Nick's bestselling books."
  },
  {
    id: 6,
    question: "Is my health data secure?",
    answer: "Yes, we take your privacy seriously. All health data is encrypted, HIPAA-compliant where applicable, and never shared with third parties. You own your data and can export or delete it at any time."
  }
];

export default function SRAPricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Stroke Recovery Academy Membership",
    "description": "Comprehensive stroke recovery platform with AI coaching, courses, and community support",
    "brand": {
      "@type": "Brand",
      "name": "Stroke Recovery Academy"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Basic recovery tracking and 3 AI chats per month"
      },
      {
        "@type": "Offer",
        "name": "Warrior Plan",
        "price": "29",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Champion Plan",
        "price": "79",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Legend Plan",
        "price": "149",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Lifetime Access",
        "price": "997",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - Stroke Recovery Academy | Choose Your Recovery Path | REBUILD. REWIRE. RISE.</title>
        <meta name="description" content="Choose your Stroke Recovery Academy membership. From free basic tracking to Legend status with 1-on-1 coaching. 30-day money-back guarantee. Start your recovery journey today." />
        <meta name="keywords" content="stroke recovery pricing, stroke recovery membership, stroke recovery program cost, stroke rehabilitation subscription, stroke survivor community, AI stroke coaching, stroke recovery app pricing" />
        <meta property="og:title" content="Pricing - Stroke Recovery Academy | Choose Your Recovery Path" />
        <meta property="og:description" content="Find the perfect recovery plan for your journey. Free to Legend - we have a plan for every stroke warrior. 30-day money-back guarantee." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={sosLogo} />
        <meta property="og:url" content={typeof window !== 'undefined' ? `${window.location.origin}/sra/pricing` : "https://strokerecoveryacademy.com/pricing"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing - Stroke Recovery Academy" />
        <meta name="twitter:description" content="Choose your recovery path. From Free to Legend - plans for every stroke warrior." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/sra/pricing` : "https://strokerecoveryacademy.com/pricing"} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF6600]/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/sra">
              <img 
                src={sosLogo} 
                alt="Stroke Recovery Academy Logo" 
                className="w-24 h-24 object-contain mb-6 cursor-pointer hover:opacity-80 transition-opacity"
                data-testid="img-sra-pricing-logo"
              />
            </Link>
            
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <Target className="w-3 h-3 mr-1" />
              Choose Your Path
            </Badge>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-pricing-hero-title"
            >
              Choose Your Recovery Path
            </h1>
            
            <p 
              className="text-lg md:text-xl text-white/80 max-w-2xl mb-8"
              data-testid="text-pricing-hero-subtitle"
            >
              From free basics to legendary status with 1-on-1 coaching. 
              Every warrior finds their level.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center gap-4 mb-4">
              <Tabs 
                value={billingCycle} 
                onValueChange={(v) => setBillingCycle(v as BillingCycle)}
                className="w-full max-w-sm"
              >
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger 
                    value="monthly" 
                    className="data-[state=active]:bg-[#FF6600] data-[state=active]:text-white"
                    data-testid="tab-billing-monthly"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger 
                    value="annual"
                    className="data-[state=active]:bg-[#FF6600] data-[state=active]:text-white"
                    data-testid="tab-billing-annual"
                  >
                    Annual
                    <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      2 Months Free
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {billingCycle === "annual" && (
              <p className="text-green-400 text-sm font-semibold" data-testid="text-annual-savings">
                Save 2 months with annual billing!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => {
              const IconComponent = tier.icon;
              const price = billingCycle === "monthly" ? tier.monthlyPrice : tier.annualPrice;
              const monthlyEquivalent = billingCycle === "annual" && tier.annualPrice > 0 
                ? Math.round(tier.annualPrice / 12) 
                : null;
              
              return (
                <Card 
                  key={tier.id}
                  className={`relative bg-[#111] border-[#222] ${tier.popular ? 'border-[#FF6600] ring-2 ring-[#FF6600]/30 scale-105 z-10' : ''} transition-all hover:border-[#FF6600]/50`}
                  data-testid={`card-pricing-${tier.id}`}
                >
                  {tier.popular && tier.badge && (
                    <Badge 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6600] text-white border-[#FF6600] text-xs uppercase tracking-wide"
                      data-testid="badge-most-popular"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {tier.badge}
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 p-3 rounded-full bg-[#FF6600]/20 w-fit">
                      <IconComponent className="h-7 w-7 text-[#FF6600]" />
                    </div>
                    
                    <CardTitle className="text-2xl font-black text-white uppercase" data-testid={`text-tier-name-${tier.id}`}>
                      {tier.name}
                    </CardTitle>
                    
                    <CardDescription className="text-white/60 text-sm" data-testid={`text-tier-description-${tier.id}`}>
                      {tier.description}
                    </CardDescription>
                    
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-white" data-testid={`text-price-${tier.id}`}>
                          ${price}
                        </span>
                        {price > 0 && (
                          <span className="text-white/50 text-sm">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                        )}
                        {price === 0 && (
                          <span className="text-white/50 text-sm">/forever</span>
                        )}
                      </div>
                      {monthlyEquivalent && (
                        <div className="text-xs text-[#FF6600] mt-1" data-testid={`text-monthly-equivalent-${tier.id}`}>
                          ${monthlyEquivalent}/mo equivalent
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <Button 
                      className={`w-full ${tier.popular ? 'bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600]' : tier.ctaVariant === 'outline' ? 'border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10' : 'bg-[#FF6600]/80 hover:bg-[#FF6600] text-white'}`}
                      variant={tier.ctaVariant}
                      data-testid={`button-subscribe-${tier.id}`}
                    >
                      {tier.cta}
                    </Button>
                    
                    <ul className="space-y-2 pt-4 border-t border-[#222]">
                      {tier.features.map((feature, idx) => (
                        <li 
                          key={idx} 
                          className={`flex items-start gap-2 text-sm ${feature.includes('PLUS:') ? 'text-[#FF6600] font-semibold' : 'text-white/70'}`}
                        >
                          {!feature.includes('PLUS:') && (
                            <Check className="w-4 h-4 text-[#FF6600] mt-0.5 shrink-0" />
                          )}
                          <span className={feature.includes('PLUS:') ? '' : ''}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lifetime Access Section */}
      <section className="py-16 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Card 
            className="relative bg-gradient-to-br from-[#1a1a1a] to-[#111] border-[#FF6600] overflow-hidden"
            data-testid="card-pricing-lifetime"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF6600]/20 via-transparent to-transparent" />
            
            <Badge 
              className="absolute top-4 right-4 bg-[#FF6600] text-white border-[#FF6600] text-xs uppercase tracking-wide"
              data-testid="badge-lifetime-best-value"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {lifetimeTier.badge}
            </Badge>
            
            <CardHeader className="relative text-center pb-6">
              <div className="mx-auto mb-4 p-4 rounded-full bg-[#FF6600]/20 w-fit">
                <Infinity className="h-10 w-10 text-[#FF6600]" />
              </div>
              
              <CardTitle className="text-3xl md:text-4xl font-black text-white uppercase" data-testid="text-tier-name-lifetime">
                {lifetimeTier.name}
              </CardTitle>
              
              <CardDescription className="text-white/70 text-lg" data-testid="text-tier-description-lifetime">
                {lifetimeTier.description}
              </CardDescription>
              
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-black text-[#FF6600]" data-testid="text-price-lifetime">
                    ${lifetimeTier.price}
                  </span>
                  <span className="text-white/50 text-lg">one-time</span>
                </div>
                <p className="text-green-400 text-sm mt-2 font-semibold">
                  Pay once, access forever
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {lifetimeTier.features.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 text-white/80"
                  >
                    <div className="p-1 rounded-full bg-[#FF6600]/20">
                      <Check className="w-4 h-4 text-[#FF6600]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8 py-6 text-lg font-bold uppercase tracking-wide"
                  data-testid="button-subscribe-lifetime"
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Get Lifetime Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-black">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Card className="bg-[#111] border-[#222] p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="p-4 rounded-full bg-green-500/20 shrink-0">
                <Shield className="h-10 w-10 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase mb-2" data-testid="text-guarantee-title">
                  30-Day Money-Back Guarantee
                </h3>
                <p className="text-white/70">
                  Try any paid plan risk-free. If you're not completely satisfied with your recovery experience 
                  within the first 30 days, we'll refund your payment in full. No questions asked.
                </p>
              </div>
              <Badge 
                className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0 whitespace-nowrap"
                data-testid="badge-guarantee"
              >
                <Check className="w-3 h-3 mr-1" />
                Risk-Free
              </Badge>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <HelpCircle className="w-3 h-3 mr-1" />
              FAQ
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-faq-title"
            >
              Frequently Asked Questions
            </h2>
            
            <p className="text-white/70">
              Everything you need to know about our membership plans
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card 
                key={faq.id}
                className="bg-[#111] border-[#222] cursor-pointer hover:border-[#FF6600]/50 transition-colors"
                onClick={() => toggleFaq(faq.id)}
                data-testid={`card-faq-${faq.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg font-bold text-white">
                      {faq.question}
                    </CardTitle>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-[#FF6600] shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/50 shrink-0" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === faq.id && (
                  <CardContent>
                    <p className="text-white/70">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Questions CTA Section */}
      <section className="py-16 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
            <MessageCircle className="w-3 h-3 mr-1" />
            We're Here to Help
          </Badge>
          
          <h2 
            className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
            data-testid="text-contact-title"
          >
            Still Have Questions?
          </h2>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Our team is ready to help you choose the perfect plan for your recovery journey. 
            Reach out anytime and we'll respond within 24 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8"
              data-testid="button-contact-email"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10 px-8"
              data-testid="button-contact-phone"
            >
              <Phone className="mr-2 h-4 w-4" />
              Schedule a Call
            </Button>
          </div>
          
          <p className="text-white/50 text-sm mt-8">
            Or email us directly at{" "}
            <a 
              href="mailto:support@strokerecoveryacademy.com" 
              className="text-[#FF6600] hover:underline"
              data-testid="link-support-email"
            >
              support@strokerecoveryacademy.com
            </a>
          </p>
        </div>
      </section>

      {/* Back to SRA Home Link */}
      <section className="py-8 bg-black border-t border-[#222]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Link href="/sra">
            <Button 
              variant="ghost" 
              className="text-white/60 hover:text-[#FF6600] hover:bg-transparent"
              data-testid="link-back-to-sra"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Stroke Recovery Academy
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
