import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Users, ArrowRight, Store, Wrench, Package,
  Megaphone, Gift, TrendingUp, MessageSquare, CheckCircle, HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const partnerStats = [
  { value: "73,000+", label: "Active Professionals" },
  { value: "150K+", label: "Monthly Page Views" },
  { value: "45%", label: "Buyer Conversion Rate" }
];

const listingOptions = [
  {
    id: "laundromat",
    title: "List Your Laundromat",
    description: "Sell your laundromat to qualified buyers",
    icon: Store,
    link: "/listing-form",
    badge: "FREE",
    badgeClass: "bg-green-500/20 text-green-400 border-green-500/30",
    testId: "card-list-laundromat"
  },
  {
    id: "equipment",
    title: "List Equipment",
    description: "Sell new or used commercial laundry equipment",
    icon: Wrench,
    link: "/list-equipment",
    testId: "card-list-equipment"
  },
  {
    id: "supplies",
    title: "List Supplies",
    description: "Sell detergents, vending products, and supplies",
    icon: Package,
    link: "/list-supplies",
    testId: "card-list-supplies"
  }
];

const vendorPrograms = [
  {
    id: "vendor",
    title: "Become a Vendor",
    description: "Create your storefront and reach thousands of buyers",
    icon: Store,
    link: "/vendor-form",
    testId: "card-become-vendor"
  },
  {
    id: "advertise",
    title: "Advertising Options",
    description: "Promote your products and services to our audience",
    icon: Megaphone,
    link: "/advertise",
    testId: "card-advertising"
  }
];

const affiliateBenefits = [
  "Earn commissions on referrals",
  "Dedicated affiliate dashboard",
  "Marketing materials provided",
  "Monthly payouts"
];

const partnerFaqs = [
  {
    question: "How do I list my laundromat for sale on WashBizHub?",
    answer: "Listing your laundromat on WashBizHub is free and takes just 5 minutes: 1) Click 'List Your Business Free' and create an account, 2) Fill out the listing form with property details, financials, and photos, 3) Submit for review - we verify all listings within 24-48 hours, 4) Your listing goes live to 73,000+ active laundromat professionals, 5) Receive inquiries directly to your inbox. Premium listing options available for enhanced visibility and featured placement."
  },
  {
    question: "What are the benefits of becoming a WashBizHub vendor?",
    answer: "WashBizHub vendors gain access to: 1) Direct exposure to 73,000+ laundromat professionals actively buying equipment and supplies, 2) Your own branded storefront to showcase products, 3) Lead generation tools and inquiry management, 4) Featured placement in relevant categories, 5) Integration with our marketplace and directory, 6) Marketing support including social media promotion. Vendor accounts start at $99/month with performance-based upgrades available."
  },
  {
    question: "What types of businesses can partner with WashBizHub?",
    answer: "We welcome partnerships from: Equipment manufacturers and distributors (Speed Queen, Dexter, Huebsch, etc.), Supply vendors (detergents, vending products, change machines), Service providers (repair technicians, cleaning services, consultants), Financial services (lenders, insurance, payment processors), Technology companies (POS systems, apps, monitoring solutions), Real estate professionals (brokers, agents specializing in commercial laundry), and Industry associations. Contact us to discuss custom partnership opportunities."
  },
  {
    question: "How does the WashBizHub affiliate program work?",
    answer: "Our affiliate program rewards you for referring new users: 1) Sign up for a free affiliate account, 2) Get your unique referral link and marketing materials, 3) Share with your network - laundromat owners, industry contacts, social media, 4) Earn commissions when referrals subscribe or make purchases: 20% on Pro subscriptions, 10% on marketplace sales, bonuses for high performers. Commissions are tracked in your dashboard and paid monthly via PayPal or direct deposit."
  },
  {
    question: "What advertising options are available on WashBizHub?",
    answer: "Advertising options include: 1) Featured Listings - priority placement in search results and category pages, 2) Banner Ads - homepage, category pages, and high-traffic areas, 3) Sponsored Content - articles and guides featuring your products/services, 4) Email Marketing - inclusion in our newsletters to 40,000+ subscribers, 5) Directory Spotlight - enhanced visibility in vendor/distributor directory. Contact our advertising team for custom packages and pricing based on your goals."
  },
  {
    question: "How can equipment manufacturers partner with WashBizHub?",
    answer: "Equipment manufacturers can partner through: 1) Vendor Storefront - showcase your full product line with specs, pricing, and lead capture, 2) Error Code Database - integrate your equipment's error codes into our diagnostic tools, 3) Service Guy AI - train our AI on your equipment for better troubleshooting, 4) Featured Equipment - highlighted placement in marketplace and buyer guides, 5) Educational Content - co-branded guides, webinars, and training materials. Enterprise partnerships available for major manufacturers."
  },
  {
    question: "What is the process for selling laundromat equipment on WashBizHub?",
    answer: "Selling equipment on WashBizHub: 1) Create a free account and select 'List Equipment', 2) Provide equipment details - brand, model, age, condition, photos, and asking price, 3) Specify if item is new, refurbished, or used, 4) Set location for pickup/delivery options, 5) Publish listing - reaches equipment buyers nationwide, 6) Respond to buyer inquiries and negotiate directly, 7) Close the sale and arrange logistics. Vendor accounts offer enhanced features including bulk listings and featured placement."
  },
  {
    question: "How do I become a featured vendor on WashBizHub?",
    answer: "Featured vendor status is earned through: 1) Maintaining a complete, professional storefront with quality images and descriptions, 2) Achieving positive buyer reviews and ratings, 3) Quick response times to inquiries (under 24 hours), 4) Active participation in the platform (regular updates, new listings), 5) Upgrade to Premium Vendor tier ($299/month) for guaranteed featured placement, priority support, and exclusive promotional opportunities. Top performers are invited to our annual Vendor Excellence program."
  }
];

const partnerHowTo = {
  name: "How to Partner with WashBizHub",
  description: "Step-by-step guide to becoming a WashBizHub partner, from listing your business to becoming a featured vendor and growing your reach in the laundromat industry.",
  totalTime: "PT30M",
  steps: [
    {
      name: "Choose Your Partnership Type",
      text: "Decide how you want to partner: list a laundromat for sale (free), sell equipment or supplies, become a vendor with a storefront, advertise your services, or join our affiliate program."
    },
    {
      name: "Create Your Account",
      text: "Sign up for a free WashBizHub account. Provide your business information, contact details, and partnership goals. Verification typically takes 24-48 hours."
    },
    {
      name: "Complete Your Profile or Listing",
      text: "Add comprehensive details to your listing or vendor profile. Include high-quality photos, detailed descriptions, pricing, and contact information. Complete profiles convert 3x better."
    },
    {
      name: "Choose Your Visibility Level",
      text: "Select from free basic listings or upgrade to premium options for featured placement, enhanced analytics, and priority support. Premium vendors see 5x more inquiries on average."
    },
    {
      name: "Engage with Inquiries",
      text: "Respond to buyer inquiries promptly (within 24 hours recommended). Use our messaging system to communicate securely and track all conversations."
    },
    {
      name: "Grow Your Partnership",
      text: "Track performance in your dashboard, collect reviews from satisfied customers, and explore additional opportunities like sponsored content or exclusive promotions."
    }
  ]
};

export default function PartnerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Partner With WashBizHub",
    "description": "Reach 73,000+ laundromat professionals. List your laundromat, sell equipment, become a vendor, or advertise with us.",
    "url": "https://washbizhub.com/partner",
    "mainEntity": {
      "@type": "Article",
      "headline": "Laundromat Partnership and Vendor Opportunities",
      "description": "Complete guide to partnering with WashBizHub including listing businesses, vendor programs, advertising options, and affiliate opportunities.",
      "author": {
        "@type": "Organization",
        "name": "WashBizHub"
      }
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Partner With Us", url: "/partner" }
  ];

  return (
    <>
      <SEO
        title="Partner With WashBizHub - Vendor, Advertising & Listing Opportunities"
        description="Reach 73,000+ laundromat professionals. List your laundromat for sale free, sell equipment, become a vendor, advertise your services, or join our affiliate program. The largest laundromat industry marketplace."
        canonicalUrl="/partner"
        keywords={[
          "laundromat vendor",
          "sell laundromat",
          "laundromat advertising",
          "list laundromat for sale",
          "laundromat equipment vendor",
          "laundromat marketplace",
          "coin laundry advertising",
          "laundromat affiliate program",
          "laundromat partnership opportunities",
          "laundromat broker",
          "laundromat business broker",
          "laundromat vendor partnerships",
          "laundromat distributor",
          "laundromat supplier",
          "laundromat B2B marketplace"
        ]}
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        faqs={partnerFaqs}
        howTo={partnerHowTo}
        author={{
          name: "WashBizHub Team",
          expertise: "Laundromat Industry Marketplace",
          credentials: "Connecting 73,000+ laundromat professionals with vendors, equipment, and opportunities"
        }}
      />

      <div className="min-h-screen bg-background" data-testid="page-partner">
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
          <div className="absolute inset-0 bg-purple-500/10" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Users className="w-3 h-3 mr-1" />
                For Vendors & Brokers
              </Badge>
              <h1 
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white"
                data-testid="text-partner-hero-title"
              >
                Partner With <span className="text-purple-400">WashBizHub</span>
              </h1>
              <p 
                className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                data-testid="text-partner-hero-subtitle"
              >
                Reach 73,000+ laundromat professionals
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/listing-form">
                  <Button 
                    size="lg"
                    className="bg-purple-500 text-white hover-elevate active-elevate-2 font-semibold"
                    data-testid="button-partner-list"
                  >
                    <Store className="mr-2 h-5 w-5" />
                    List Your Business Free
                  </Button>
                </Link>
                <Link href="/vendor-form">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                    data-testid="button-partner-vendor"
                  >
                    Become a Vendor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-partner-stats">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-benefits-heading">
                Why Partner With Us?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Join the largest community of laundromat professionals
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {partnerStats.map((stat, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-white/5 border border-white/10 text-center"
                  data-testid={`card-stat-${index}`}
                >
                  <div className="text-4xl font-bold text-purple-400 mb-2">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-listing-options">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-500/20 text-purple-500 border-purple-500/30">
                <Store className="w-3 h-3 mr-1" />
                Listing Options
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-listing-heading">
                List With Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reach thousands of qualified buyers for your listings
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listingOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link key={option.id} href={option.link}>
                    <Card 
                      className="h-full hover-elevate active-elevate-2 cursor-pointer group transition-all"
                      data-testid={option.testId}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                            <Icon className="w-5 h-5 text-purple-500" />
                          </div>
                          {option.badge && (
                            <Badge className={option.badgeClass}>
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl group-hover:text-purple-500 transition-colors">
                          {option.title}
                        </CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-purple-500">
                          Get Started <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-vendor-programs">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Vendor Programs
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-vendor-heading">
                  Grow Your Business
                </h2>
                <p className="text-lg text-white/70 mb-8">
                  Become a vendor and create your own storefront to sell products and services directly to laundromat owners and operators.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {vendorPrograms.map((program) => {
                    const Icon = program.icon;
                    return (
                      <Link key={program.id} href={program.link}>
                        <Card 
                          className="h-full bg-white/5 border border-white/10 hover-elevate active-elevate-2 cursor-pointer group transition-all"
                          data-testid={program.testId}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 mb-3">
                              <Icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                              {program.title}
                            </CardTitle>
                            <CardDescription className="text-white/60 text-sm">
                              {program.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <Card className="bg-white/5 border border-purple-500/20 p-8" data-testid="card-affiliate-program">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/20">
                      <Gift className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Affiliate Program</h3>
                      <p className="text-white/60 text-sm">Earn while you refer</p>
                    </div>
                  </div>
                  <p className="text-white/70 mb-6">
                    Join our affiliate program and earn commissions by referring new vendors, subscribers, and customers to WashBizHub.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {affiliateBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3 text-white/80">
                        <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/affiliate">
                    <Button 
                      className="w-full bg-purple-500 text-white hover-elevate active-elevate-2 font-semibold"
                      data-testid="button-join-affiliate"
                    >
                      Join Affiliate Program
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-faqs">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-500/20 text-purple-500 border-purple-500/30">
                <HelpCircle className="w-3 h-3 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-faq-heading">
                Partnership FAQs
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about partnering with WashBizHub
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {partnerFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-purple-600" data-testid="section-contact-cta">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <MessageSquare className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-contact-cta-heading">
                Questions?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Our team is here to help you find the best partnership opportunity. Schedule a call to learn more about how we can work together.
              </p>
              <Link href="/consultation">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover-elevate active-elevate-2 font-semibold"
                  data-testid="button-contact-us"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
