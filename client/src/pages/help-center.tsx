import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, BookOpen, Calculator, MapPin, CreditCard, 
  Users, Settings, HelpCircle, MessageCircle, Mail,
  ChevronRight, Sparkles, FileText, Video, Lightbulb,
  Shield, Zap, Target, BarChart3, Building2, Award
} from "lucide-react";
import { SEO } from "@/components/SEO";

interface FAQCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  faqs: Array<{ q: string; a: string }>;
}

const categories: FAQCategory[] = [
  {
    id: "cleanbi",
    title: "CLEANBI Scoring",
    icon: Target,
    description: "Learn about our proprietary location intelligence system",
    faqs: [
      {
        q: "What is CLEANBI and how does it work?",
        a: "CLEANBI (Customer, Location, Equipment, Adaptability, Numbers, Brand, Intelligence) is our proprietary 17-factor scoring algorithm that rates any business or residential address from 0-100. It analyzes demographics, competition, foot traffic, visibility, and more using Google Places API and census data. Scores 85+ indicate excellent opportunities, 70-84 good potential, 55-69 fair, and below 55 needs strategic consideration."
      },
      {
        q: "How many CLEANBI analyses can I run?",
        a: "Free users get 5 analyses total. Starter ($29/mo) and Pro ($99/mo) get unlimited analyses. Enterprise ($699/mo) includes API access and team collaboration. Admin emails have unlimited quotas."
      },
      {
        q: "What's the difference between A, B, C grades and 'Needs Work'?",
        a: "We use a positive grading system: A (85+) = Excellent opportunity, B (70-84) = Good opportunity, C (55-69) = Fair opportunity. Anything below 55 is labeled 'Needs Work' - we never use D or F grades. This reflects our philosophy that every location has potential with the right strategy."
      },
      {
        q: "Can I use CLEANBI for any type of business?",
        a: "Yes! CLEANBI works for any business type (restaurants, retail, gyms, salons, laundromats, car washes) and residential properties (homes, apartments, investment properties). The algorithm auto-detects the address type and adjusts scoring factors accordingly."
      },
      {
        q: "How do I download a CLEANBI PDF report?",
        a: "PDF reports are available for Pro and Enterprise subscribers. After running an analysis, click the 'Download PDF Report' button. Reports include detailed breakdowns, competitor mapping, demographic data, and AI-generated recommendations."
      }
    ]
  },
  {
    id: "calculators",
    title: "Calculators & Tools",
    icon: Calculator,
    description: "Master our 50+ business calculators",
    faqs: [
      {
        q: "What calculators are available?",
        a: "We offer 50+ calculators including: ROI Calculator, Valuation Calculator (6 methods), Utility Cost Calculator, Labor Cost Calculator, TPD (Turns Per Day) Calculator, Loan Payment Calculator, Break-Even Calculator, Equipment Depreciation, Machine Mix Optimizer, and many more specialized tools."
      },
      {
        q: "What valuation method should I use?",
        a: "Use SDE Multiple (2.5-4x) for owner-operated laundromats, NOI Multiple for investor-owned operations, Asset-Based for equipment-heavy deals, and Comparable Sales when you have market data. Our calculator shows all 6 methods for comprehensive analysis."
      },
      {
        q: "What's a good Turns Per Day (TPD)?",
        a: "Target TPD is 3-4 turns/day. Below 2 is poor utilization, 5-8 is excellent. TPD = Monthly Revenue ÷ (Avg Price × Machine Count × 30). Higher TPD means better equipment utilization and stronger revenue per machine."
      },
      {
        q: "What should my rent-to-revenue ratio be?",
        a: "Optimal is 15-20% of gross revenue. 20-25% is acceptable but tight. Above 25% is high risk, and above 30% is usually unsustainable. This is one of the most critical factors in laundromat profitability."
      }
    ]
  },
  {
    id: "subscriptions",
    title: "Subscriptions & Billing",
    icon: CreditCard,
    description: "Pricing, plans, and payment questions",
    faqs: [
      {
        q: "What subscription plans are available?",
        a: "We offer 4 tiers: Free (5 CLEANBI analyses total, basic calculators), Starter ($29/mo - unlimited analyses, all calculators), Pro ($99/mo - unlimited analyses, PDF reports, ROI calculators, API access), Enterprise ($699/mo - everything in Pro plus ownership data, team features, white-label, priority support)."
      },
      {
        q: "Do you offer annual discounts?",
        a: "Yes! Annual plans save 20% compared to monthly billing. Additionally, we offer PPP-adjusted pricing for 220+ countries based on purchasing power parity."
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Account Settings → Subscription → Cancel Plan. You'll retain access until your current billing period ends. No refunds for partial periods, but you can downgrade to Free anytime."
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a 14-day money-back guarantee for first-time subscribers. After that, we don't provide refunds but you can cancel anytime. For billing issues, contact support@washbizhub.com."
      }
    ]
  },
  {
    id: "marketplace",
    title: "Marketplace & Listings",
    icon: Building2,
    description: "Buying, selling, and listing laundromats",
    faqs: [
      {
        q: "How do I list my laundromat for sale?",
        a: "Go to Marketplace → List Your Laundromat. Basic listings are free, Premium listings ($49/mo) get featured placement and more visibility. All listings include CLEANBI scores and are reviewed before publishing."
      },
      {
        q: "How is the asking price verified?",
        a: "We don't verify asking prices, but we do show the CLEANBI score and estimated fair market value based on industry multiples. Buyers should always perform their own due diligence."
      },
      {
        q: "What's included in the Vendor Directory?",
        a: "The Vendor Directory lists equipment manufacturers, service providers, financiers, brokers, and consultants. Vendors can claim their listing for free and upgrade to Premium ($99/mo) for enhanced visibility and lead generation."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: Users,
    description: "Managing your WashBizHub account",
    faqs: [
      {
        q: "How do I update my profile?",
        a: "Go to Account Settings to update your name, email, company information, and preferences. Profile completeness affects your forum reputation and networking visibility."
      },
      {
        q: "How does the referral program work?",
        a: "Share your unique referral link and earn 10-25% recurring commission when friends subscribe. Tiers: Starter (0+ referrals, 10%), Partner (5+, 15%), Ambassador (15+, 20%), Elite (50+, 25%)."
      },
      {
        q: "What's the Founding Member program?",
        a: "Founding Members are our first 500 users who receive permanent 20% discounts, priority support, early access to features, and an exclusive badge. Limited spots available."
      }
    ]
  }
];

const popularArticles = [
  { title: "Getting Started with CLEANBI", icon: Target, href: "/cleanbi-explorer" },
  { title: "Understanding Laundromat Valuations", icon: Calculator, href: "/valuation-calculator" },
  { title: "How to Read a CLEANBI Report", icon: FileText, href: "/cleanbi-reports" },
  { title: "Subscription Plan Comparison", icon: CreditCard, href: "/pricing" },
  { title: "Using the Design Studio", icon: Building2, href: "/design-studio" },
  { title: "Forum Guidelines", icon: Users, href: "/forum" },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": categories.flatMap(cat => 
    cat.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  )
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
    { "@type": "ListItem", "position": 2, "name": "Help Center", "item": "https://washbizhub.com/help-center" }
  ]
};

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(faq => 
      !searchQuery || 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0);

  const totalFAQs = categories.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <>
      <SEO
        title="Help Center | WashBizHub Support & FAQs"
        description="Find answers to common questions about CLEANBI scoring, calculators, subscriptions, and the WashBizHub platform. Browse our knowledge base or contact support."
        canonicalUrl="/help-center"
        ogType="website"
        keywords={[
          "washbizhub help",
          "cleanbi support",
          "laundromat calculator help",
          "subscription faq",
          "washbizhub support"
        ]}
        structuredData={[faqSchema, breadcrumbSchema]}
        faqs={categories.flatMap(c => c.faqs.map(f => ({ question: f.q, answer: f.a })))}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-gradient-to-b from-primary/20 to-transparent py-16 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Badge className="mb-4 bg-gold-500/20 text-gold-400 border-gold-400/30">
              <HelpCircle className="w-3 h-3 mr-1.5" />
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4" data-testid="text-page-title">
              How Can We Help?
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Search our knowledge base or browse categories below
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                data-testid="input-search"
              />
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/60">
              <span>{totalFAQs} articles</span>
              <span>{categories.length} categories</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Popular Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {popularArticles.map((article, idx) => {
                const Icon = article.icon;
                return (
                  <Link key={idx} href={article.href}>
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all group cursor-pointer" data-testid={`card-article-${idx}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-gold-400" />
                        </div>
                        <span className="text-white font-medium group-hover:text-gold-400 transition-colors">
                          {article.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/40 ml-auto group-hover:translate-x-1 transition-transform" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-white mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(isActive ? null : cat.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isActive 
                          ? 'bg-gold-500/20 border border-gold-400/30' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-category-${cat.id}`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : 'text-white/60'}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${isActive ? 'text-gold-400' : 'text-white'}`}>
                          {cat.title}
                        </div>
                        <div className="text-xs text-white/50">{cat.faqs.length} articles</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-3">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                if (activeCategory && activeCategory !== cat.id) return null;
                
                return (
                  <Card key={cat.id} className="bg-white/10 backdrop-blur-xl border-white/20 mb-6" data-testid={`section-${cat.id}`}>
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-400" />
                        </div>
                        {cat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {cat.faqs.map((faq, idx) => (
                          <AccordionItem 
                            key={idx} 
                            value={`${cat.id}-${idx}`}
                            className="border border-white/10 rounded-lg px-4 bg-white/5"
                            data-testid={`accordion-${cat.id}-${idx}`}
                          >
                            <AccordionTrigger className="text-white hover:text-gold-400 text-left py-4">
                              {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/70 pb-4 leading-relaxed">
                              {faq.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}

              {searchQuery && filteredCategories.length === 0 && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                    <p className="text-white/60 mb-6">
                      Try different keywords or browse categories
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-white/20 text-white"
                      onClick={() => setSearchQuery("")}
                      data-testid="button-clear-search"
                    >
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/30 to-accent/20 backdrop-blur-xl border-gold-400/30 mt-12">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gold-500/20 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Still Need Help?</h3>
                    <p className="text-white/70">Our support team is ready to assist you</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href="mailto:support@washbizhub.com">
                    <Button variant="outline" className="border-white/20 text-white" data-testid="button-email-support">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </a>
                  <Link href="/ai-consultant">
                    <Button className="bg-gold-500 hover:bg-gold-600 text-black font-bold" data-testid="button-ai-help">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ask AI Assistant
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
