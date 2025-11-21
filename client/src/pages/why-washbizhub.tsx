import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  ArrowRight, TrendingUp, Users, Shield, Zap, Globe, Award, 
  BarChart3, Cpu, Heart
} from "lucide-react";
import coupleImg from "@assets/IMG_5789_1763738809544.jpeg";
import vintageNumberedImg from "@assets/IMG_5790_1763738809544.jpeg";
import tealMachinesImg from "@assets/IMG_5791_1763738809544.jpeg";
import blueTintedImg from "@assets/IMG_5794_1763738809544.jpeg";
import blueDepthImg from "@assets/IMG_0090_1763738907609.webp";
import stackedModernImg from "@assets/IMG_0092_1763738907609.webp";
import turquoiseLaundryImg from "@assets/IMG_0093_1763738907609.webp";
import tealPerspectiveImg from "@assets/IMG_0094_1763738907609.jpeg";
import bwVintageImg from "@assets/IMG_0095_1763738907609.jpeg";
import chromeMachinesImg from "@assets/IMG_0096_1763738907609.jpeg";
import industrialAisleImg from "@assets/IMG_0097_1763738907609.jpeg";
import brightModernImg from "@assets/IMG_0098_1763738907609.jpeg";
import whiteTopLoadersImg from "@assets/IMG_0099_1763738907609.jpeg";
import premiumBlackImg from "@assets/IMG_0100_1763738907609.jpeg";
import symmetricalWhiteImg from "@assets/IMG_0101_1763738907609.jpeg";

export default function WhyWashBizHub() {
  return (
    <>
      <SEO
        title="Why WashBizHub - The Bloomberg of Laundromats"
        description="Discover why 72,000+ laundromat owners trust WashBizHub for enterprise-grade POS, IoT monitoring, AI consulting, and industry resources. The most comprehensive platform for professional laundry business management."
        canonicalUrl="/why-washbizhub"
        keywords={[
          "laundromat platform",
          "why washbizhub",
          "laundromat management software",
          "commercial laundry solutions",
          "laundromat technology"
        ]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black py-24">
          <div className="absolute inset-0 z-0">
            <img 
              src={blueDepthImg} 
              alt="Futuristic blue-lit commercial laundromat with modern front-load washers - advanced coin-operated laundry equipment with LED lighting and professional design"
              className="w-full h-full object-cover opacity-30"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900/90" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 mx-auto">
              <Globe className="w-3 h-3 mr-1" />
              North America's Leading Platform
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Why 72,000+ Owners Choose WashBizHub
            </h1>
            <p className="text-xl text-white/70 mb-10 leading-relaxed">
              From corner laundromats to multi-location enterprises, we're modernizing the industry 
              through IoT, AI, and Bloomberg-grade business intelligence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/cleanbi">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                  data-testid="button-try-cleanbi"
                >
                  Try CLEANBI™ Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/book">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover-elevate active-elevate-2"
                  data-testid="button-get-book"
                >
                  Get The Ultimate Guide
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1: Customer-Focused Operations */}
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={coupleImg} 
                  alt="Young couple using self-service laundromat together - happy customers enjoying modern coin laundry experience with quality washers and dryers in clean facility"
                  className="w-full h-[450px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              </div>
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  <Heart className="w-3 h-3 mr-1" />
                  Customer Experience
                </Badge>
                <h2 className="text-4xl font-bold text-foreground mb-6 uppercase tracking-tight">
                  Your Customers Are The Priority
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Every feature we build starts with one question: "How does this help laundromat owners 
                  serve their customers better?" From per-pound pricing accuracy to pickup/delivery route 
                  optimization, we obsess over the details that matter.
                </p>
                <ul className="space-y-3 text-foreground/90">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Real-time order tracking and SMS notifications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Precision scales for fair per-pound pricing ($1.25-$2.25/lb)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Multi-tenant household accounts for repeat customers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Heritage Meets Innovation */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  <Award className="w-3 h-3 mr-1" />
                  Industry Heritage
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                  Decades Of Expertise, Cutting-Edge Technology
                </h2>
                <p className="text-lg text-white/70 mb-6 leading-relaxed">
                  We didn't just build software—we digitized an entire industry's collective wisdom. 
                  From vintage coin-op machines to AI-powered diagnostics, we honor the craft while 
                  embracing the future.
                </p>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>The Laundromat Bible: 400+ pages of industry knowledge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>72,000-member Facebook community insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>AI trained on 2,800+ equipment diagnostic codes</span>
                  </li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-lg order-1 lg:order-2">
                <img 
                  src={vintageNumberedImg} 
                  alt="Retro numbered commercial laundromat machines from classic era - vintage coin-operated washer and dryer equipment showing industry heritage and traditional laundry business operations"
                  className="w-full h-[450px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/30 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Modern Infrastructure */}
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={stackedModernImg} 
                  alt="Stacked commercial laundry equipment in modern facility - double-deck industrial washers and dryers maximizing space efficiency for high-volume laundromat operations"
                  className="w-full h-[450px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
              </div>
              <div>
                <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                  <Cpu className="w-3 h-3 mr-1" />
                  Modern Infrastructure
                </Badge>
                <h2 className="text-4xl font-bold text-foreground mb-6 uppercase tracking-tight">
                  Enterprise-Grade Technology Stack
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Built on the same technology powering Fortune 500 companies. Real-time data pipelines, 
                  multi-tenant architecture, and 99.9% uptime SLAs. Your business deserves professional tools.
                </p>
                <ul className="space-y-3 text-foreground/90">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2" />
                    <span>PostgreSQL database with automated backups</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2" />
                    <span>Redis pub/sub for real-time updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2" />
                    <span>MQTT broker for IoT sensor ingestion</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: IoT & Predictive Maintenance */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Smart Operations
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                  Stop Breakdowns Before They Happen
                </h2>
                <p className="text-lg text-white/70 mb-6 leading-relaxed">
                  IoT sensors monitor temperature, vibration, water flow, and energy consumption across 
                  all machines. Machine learning algorithms predict failures weeks in advance, reducing 
                  downtime by 40% and extending equipment life by years.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { value: "40%", label: "Downtime Reduced" },
                    { value: "$1.2M+", label: "Repairs Saved" },
                    { value: "2,800+", label: "Diagnostic Codes" },
                    { value: "24/7", label: "Monitoring" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur rounded-lg p-4 border border-white/10">
                      <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-white/60 uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg order-1 lg:order-2">
                <img 
                  src={industrialAisleImg} 
                  alt="Industrial laundromat aisle perspective with rolling carts - commercial self-service laundry facility showing professional equipment layout and customer workflow design"
                  className="w-full h-[450px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/30 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Data-Driven Decisions */}
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={premiumBlackImg} 
                  alt="Premium black commercial washers in upscale laundromat - luxury coin-operated laundry equipment with modern aesthetics and professional-grade performance for high-end facilities"
                  className="w-full h-[450px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              </div>
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Business Intelligence
                </Badge>
                <h2 className="text-4xl font-bold text-foreground mb-6 uppercase tracking-tight">
                  Bloomberg-Grade Analytics
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  CLEANBI™ 17-factor scoring system analyzes customer experience, location quality, 
                  equipment grade, adaptability, financials, intelligence, and brand strength. Make 
                  acquisition decisions with confidence backed by real data.
                </p>
                <ul className="space-y-3 text-foreground/90">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Daily revenue fact tables with drill-down analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Machine turn rate optimization reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Customer lifetime value cohort analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Scale & Precision */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Operational Excellence
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                  From Single Store To Multi-Location Empire
                </h2>
                <p className="text-lg text-white/70 mb-6 leading-relaxed">
                  Whether you're running one laundromat or managing a portfolio, WashBizHub scales with 
                  your ambitions. Multi-tenant architecture, role-based access control, and location-based 
                  data partitioning ensure security and performance at any scale.
                </p>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Unlimited locations, users, and transactions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Role-based dashboards (owner/manager/attendant/driver)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    <span>Consolidated reporting across all properties</span>
                  </li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-lg order-1 lg:order-2">
                <img 
                  src={symmetricalWhiteImg} 
                  alt="Perfectly aligned row of white commercial laundromat machines - symmetrical professional laundry equipment installation demonstrating organizational excellence and modern design"
                  className="w-full h-[450px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/30 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Image Grid Showcase */}
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4 uppercase tracking-tight">
                Serving Every Segment Of The Industry
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From boutique urban laundromats to high-volume industrial facilities, 
                we support the full spectrum of commercial laundry operations.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { img: tealMachinesImg, label: "Modern Retail", alt: "Modern retail laundromat with teal-colored commercial front-load washers - contemporary coin-operated equipment for boutique urban laundry facilities" },
                { img: blueTintedImg, label: "High-Volume Processing", alt: "High-volume industrial laundromat with blue ambient lighting - commercial-scale washing machines for large-capacity processing operations" },
                { img: turquoiseLaundryImg, label: "Customer-First Design", alt: "Customer-friendly laundromat interior with turquoise machines - inviting self-service laundry environment prioritizing user experience and comfort" },
                { img: tealPerspectiveImg, label: "Enterprise Scale", alt: "Enterprise-scale commercial laundry facility perspective view - professional industrial equipment layout for high-throughput business operations" },
                { img: chromeMachinesImg, label: "Premium Equipment", alt: "Premium chrome-finished commercial laundromat machines - luxury stainless steel washers and dryers for upscale coin-operated facilities" },
                { img: brightModernImg, label: "Welcoming Spaces", alt: "Bright welcoming modern laundromat interior - clean well-lit self-service laundry space with contemporary design and customer comfort focus" },
                { img: whiteTopLoadersImg, label: "Equipment Diversity", alt: "Diverse white top-loading commercial washers - variety of laundromat equipment options for different customer needs and preferences" },
                { img: bwVintageImg, label: "Industry Heritage", alt: "Classic black and white vintage laundromat photograph - historical coin-operated laundry industry heritage showcasing decades of service tradition" },
              ].map((item, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-lg group">
                  <img 
                    src={item.img} 
                    alt={item.alt}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex items-end p-4">
                    <span className="text-white font-semibold uppercase tracking-wide text-sm">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 uppercase tracking-tight">
              Join 72,000+ Industry Leaders
            </h2>
            <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              Stop managing with spreadsheets. Start operating like an enterprise. 
              WashBizHub brings Bloomberg-grade intelligence to the laundromat industry.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/cleanbi">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                  data-testid="button-cta-cleanbi"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover-elevate active-elevate-2"
                  data-testid="button-cta-consultation"
                >
                  Book Expert Consultation
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/50 mt-8">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
