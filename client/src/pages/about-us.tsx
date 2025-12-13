import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Zap, Users, Target, Globe, Building2, Award, TrendingUp, Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { FAQSection } from '@/components/SuperSEOWrapper';
import { motion } from 'framer-motion';
import neonSignImage from "@assets/AdobeStock_111864759_1765330581864.jpeg";
import modernInteriorImage from "@assets/AdobeStock_832897447_1765330812967.jpeg";

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
      answer: "WashBizHub was founded in 2024 by laundromat industry veterans and technology entrepreneurs who saw the need for enterprise-grade tools in the fragmented $40B laundromat industry. Our team combines decades of hands-on laundromat experience with cutting-edge software development expertise to create the #1 resource hub serving 73,000+ professionals worldwide."
    },
    {
      question: "Is WashBizHub a trusted laundromat resource?",
      answer: "Yes, WashBizHub is the most trusted laundromat resource with 73,000+ community members in 220+ countries. We provide verified tools, calculators, and resources backed by real industry data. Our CLEANBI scoring system uses Google data for unbiased location analysis, and our platform is recommended by industry associations and top laundromat operators."
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
      answer: "WashBizHub serves over 73,000 laundromat professionals worldwide, including owners, operators, investors, vendors, and service technicians. Our community spans 220+ countries, making us the largest global laundromat resource hub with the most comprehensive database of industry tools and resources."
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
      answer: "WashBizHub is the only all-in-one platform combining: location intelligence (CLEANBI), POS system, IoT monitoring, AI consulting, marketplace, and professional tools. Unlike fragmented point solutions, we provide a unified ecosystem backed by 73,000+ community members and continuous industry-specific innovation."
    }
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "alternateName": ["The Laundromat Bible", "CLEANBI"],
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The #1 laundromat resource hub serving 73,000+ industry professionals worldwide with enterprise-grade software, tools, and business intelligence.",
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
      "reviewCount": "73000"
    }
  };

  const structuredData = [organizationSchema, softwareAppSchema];

  return (
    <>
      <SEO
        title="About WashBizHub | #1 Trusted Laundromat Expert Resource Since 2024"
        description="Discover WashBizHub, the trusted laundromat resource serving 73,000+ professionals. Expert advice, enterprise software, and industry-leading tools."
        canonicalUrl="/about-us"
        keywords={aboutKeywords}
        structuredData={structuredData}
        speakableSelectors={["h1", "h2", ".mission-statement"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about-us" }
        ]}
      />

      <div className="min-h-screen bg-background">
        {/* Premium Hero Section with Neon Sign */}
        <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${neonSignImage})` }}
          />
          
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/90 via-[#0A1628]/80 to-[#0A1628]/95" />
          
          {/* Vignette Effect */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/40 px-4 py-2">
                <Building2 className="w-4 h-4 mr-2" />
                Est. 2024 • Trusted by 73,000+ Professionals
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              About WashBizHub
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-[#C8A661] font-semibold mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              The #1 Laundromat Resource Hub
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Modernizing the $40B laundromat industry through enterprise software, 
              IoT integration, and business intelligence.
            </motion.p>
            
            {/* Stats Badges */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 md:gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-4 text-center">
                <div className="text-3xl font-bold text-[#C8A661]">73K+</div>
                <div className="text-sm text-gray-300">Community Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-4 text-center">
                <div className="text-3xl font-bold text-[#C8A661]">220+</div>
                <div className="text-sm text-gray-300">Countries</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-4 text-center">
                <div className="text-3xl font-bold text-[#C8A661]">80+</div>
                <div className="text-sm text-gray-300">Tools & Calculators</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-4 text-center">
                <div className="text-3xl font-bold text-[#C8A661]">2,200+</div>
                <div className="text-sm text-gray-300">Error Codes</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision/Mission Section with Modern Interior Image */}
        <section className="relative w-full py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image Side */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={modernInteriorImage} 
                    alt="Modern laundromat interior showcasing our vision" 
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                  {/* Subtle overlay for premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/40 to-transparent" />
                </div>
                {/* Floating accent badge */}
                <div className="absolute -bottom-6 -right-6 bg-[#C8A661] text-[#0A1628] rounded-xl px-6 py-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    <div>
                      <div className="font-bold text-lg">Industry Leader</div>
                      <div className="text-sm opacity-80">Since 2024</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Content Side */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                  <Lightbulb className="w-3 h-3 mr-1.5" />
                  Our Vision
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Empowering the Future of Laundromats
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  To empower laundromat operators with enterprise-grade tools that drive profitability, 
                  optimize operations, and transform the industry.
                </p>
                <p className="text-muted-foreground mb-8">
                  Founded on the principle that laundromats deserve the same level of sophistication 
                  as any other business, WashBizHub combines cutting-edge technology with deep industry expertise.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                      <Zap className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Enterprise-grade SaaS Platform</div>
                      <div className="text-sm text-muted-foreground">Professional tools for every operator</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">73,000+ Laundromat Owners Served</div>
                      <div className="text-sm text-muted-foreground">The largest industry community</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                      <Globe className="h-6 w-6 text-[#C8A661]" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Global Reach, Local Expertise</div>
                      <div className="text-sm text-muted-foreground">Supporting operators in 220+ countries</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

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

          {/* FAQ Section */}
          <FAQSection faqs={aboutFaqs} className="mt-12 max-w-4xl mx-auto" />

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
