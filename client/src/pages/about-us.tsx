import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Zap, Users, Target, Globe } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function AboutUs() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  const aboutKeywords = [
    "who created WashBizHub",
    "laundromat expert advice",
    "trusted laundromat resource",
    "WashBizHub founders",
    "laundromat software company",
    "laundromat business intelligence",
    "laundromat industry experts",
    "laundromat consulting platform",
    "laundromat SaaS platform",
    "laundromat technology company",
    "coin laundry software provider",
    "laundromat IoT company",
    "laundromat POS provider",
    "laundromat industry leader",
    "laundromat resource hub"
  ];

  const aboutFaqs = [
    {
      question: "Who created WashBizHub?",
      answer: "WashBizHub was founded in 2024 by laundromat industry veterans and technology entrepreneurs who saw the need for enterprise-grade tools in the fragmented $40B laundromat industry. Our team combines decades of hands-on laundromat experience with cutting-edge software development expertise to create the #1 resource hub serving 72,000+ professionals worldwide."
    },
    {
      question: "Is WashBizHub a trusted laundromat resource?",
      answer: "Yes, WashBizHub is the most trusted laundromat resource with 72,000+ community members in 220+ countries. We provide verified tools, calculators, and resources backed by real industry data. Our CLEANBI scoring system uses Google data for unbiased location analysis, and our platform is recommended by industry associations and top laundromat operators."
    },
    {
      question: "What expert advice does WashBizHub offer?",
      answer: "WashBizHub provides expert laundromat advice through: AI-powered consulting (ServiceGuy AI), professional courses certified by industry experts, 50+ specialized calculators, 2,200+ equipment diagnostic codes, community forums with experienced operators, and exclusive content from successful multi-site owners and industry consultants."
    },
    {
      question: "What is WashBizHub's mission?",
      answer: "WashBizHub's mission is to modernize the $40B laundromat industry by providing enterprise-grade tools to every operator regardless of size. We democratize access to sophisticated software, analytics, and business intelligence that was previously only available to large chains, helping independent owners compete and thrive."
    },
    {
      question: "How many laundromat professionals use WashBizHub?",
      answer: "WashBizHub serves over 72,000 laundromat professionals worldwide, including owners, operators, investors, vendors, and service technicians. Our community spans 220+ countries, making us the largest global laundromat resource hub with the most comprehensive database of industry tools and resources."
    },
    {
      question: "What technology does WashBizHub provide?",
      answer: "WashBizHub provides comprehensive laundromat technology including: WashBizPOS point-of-sale system, IoT machine monitoring with predictive maintenance, CLEANBI location intelligence, route optimization for pickup/delivery, AI consulting, analytics dashboards, website builder with SEO, and 50+ business calculators."
    },
    {
      question: "Can WashBizHub help new laundromat investors?",
      answer: "Absolutely. WashBizHub specializes in helping new laundromat investors through: free CLEANBI scores for location analysis, ROI and valuation calculators, due diligence checklists, professional courses, AI consulting, and access to our marketplace for buying businesses and equipment. Our tools reduce the learning curve and investment risk."
    },
    {
      question: "How is WashBizHub different from competitors?",
      answer: "WashBizHub is the only all-in-one platform combining: location intelligence (CLEANBI), POS system, IoT monitoring, AI consulting, marketplace, and professional tools. Unlike fragmented point solutions, we provide a unified ecosystem backed by 72,000+ community members and continuous industry-specific innovation."
    }
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "CLEANBI"],
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource hub serving 72,000+ industry professionals worldwide with enterprise-grade software, tools, and business intelligence.",
    "foundingDate": "2024",
    "foundingLocation": { "@type": "Place", "name": "United States" },
    "numberOfEmployees": { "@type": "QuantitativeValue", "value": "10-50" },
    "slogan": "The #1 Laundromat Resource Hub",
    "knowsAbout": [
      "laundromat business operations",
      "coin laundry management",
      "laundromat investment analysis",
      "commercial laundry equipment",
      "laundromat valuation",
      "IoT machine monitoring",
      "laundromat POS systems"
    ],
    "areaServed": { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates" }, "geoRadius": "global" },
    "sameAs": [
      "https://www.facebook.com/washbizhub1",
      "https://twitter.com/washbizhub",
      "https://www.linkedin.com/company/washbizhub"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@washbizhub.com",
      "availableLanguage": "English"
    }
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WashBizHub Platform",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web-based",
    "description": "All-in-one laundromat management platform with POS, IoT monitoring, analytics, and business intelligence.",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "997",
      "priceCurrency": "USD",
      "offerCount": "4"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "72000"
    }
  };

  const structuredData = [organizationSchema, softwareAppSchema];

  return (
    <>
      <SEO
        title="About WashBizHub | #1 Trusted Laundromat Expert Resource Since 2024"
        description="Discover WashBizHub, the trusted laundromat resource serving 72,000+ professionals. Expert advice, enterprise software, and industry-leading tools."
        canonicalUrl="/about-us"
        keywords={aboutKeywords}
        structuredData={structuredData}
        faqs={aboutFaqs}
        speakableSelectors={["h1", "h2", ".mission-statement"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about-us" }
        ]}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary/5 py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl font-bold mb-4 text-foreground">About WashBizHub</h1>
            <p className="text-xl text-muted-foreground">
              The #1 Laundromat Resource Hub. We're modernizing the $40B laundromat industry through enterprise software, IoT integration, and business intelligence.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                To empower laundromat operators with enterprise-grade tools that drive profitability, optimize operations, and transform the industry.
              </p>
              <p className="text-muted-foreground mb-6">
                Founded on the principle that laundromats deserve the same level of sophistication as any other business, WashBizHub combines cutting-edge technology with deep industry expertise.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Enterprise-grade SaaS platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground">72,000+ laundromat owners served</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Global reach, local expertise</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-12 aspect-square flex items-center justify-center border border-border">
              <div className="text-center">
                <Zap className="w-24 h-24 mx-auto text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Transforming the laundromat industry</p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-foreground">Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We deliver enterprise-grade quality in everything we build. No shortcuts, maximum ambition.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We succeed when our customers succeed. Building a thriving ecosystem of laundromat operators.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Innovation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Continuously pushing boundaries with AI, IoT, and advanced analytics to drive industry transformation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Platform Features */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-foreground">Platform Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">POS System</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Per-pound pricing, real-time settlements, scale integration, multi-location support with Stripe integration.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">IoT & Diagnostics</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Real-time machine monitoring, predictive maintenance, sensor alerts, and 2,200+ diagnostic codes.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Route Optimization</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Pickup/delivery logistics with Google Maps integration, GPS tracking, and multi-stop optimization.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Consultant</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Multi-model AI (OpenAI, Anthropic, Gemini), trained on industry data, 24/7 expert guidance.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Professional D3.js visualizations, materialized views, revenue analytics, performance tracking.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Website Builder</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  WYSIWYG editor, SEO automation, Google Search Console integration, custom domains.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 py-12 border-t border-b border-border">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">72K+</div>
              <p className="text-muted-foreground">Community Members</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">220+</div>
              <p className="text-muted-foreground">Countries Covered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">80+</div>
              <p className="text-muted-foreground">Calculators & Tools</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,200+</div>
              <p className="text-muted-foreground">Error Codes Database</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-muted/30 rounded-lg p-12 text-center border border-border">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Get In Touch</h2>
            <p className="mb-6 text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/consultant-inquiry">
                <Button data-testid="button-contact">
                  Contact Us
                </Button>
              </Link>
              <a href="mailto:info@washbizhub.com">
                <Button variant="outline" data-testid="button-email">
                  Send Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
