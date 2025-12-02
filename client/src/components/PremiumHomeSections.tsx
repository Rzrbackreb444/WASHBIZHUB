import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Sparkles, Shield, TrendingUp, Users, 
  Download, Lock, MapPin, DollarSign, Calendar, Building2,
  Calculator, Target, BookOpen, GraduationCap, Phone,
  Search, MessageSquare, QrCode, Star, ExternalLink
} from "lucide-react";

import equipmentImage from "@assets/AdobeStock_507641449_1764704943942.jpeg";
import washerDetailImage from "@assets/AdobeStock_711286802_1764704943943.jpeg";
import laundromatImage from "@assets/Dexter_Laundromat_Stock_photo_1764704943945.jpg";
import neonSignImage from "@assets/AdobeStock_111864759_1764704943941.jpeg";

const FEATURES = [
  {
    icon: Sparkles,
    title: "CLEAN",
    description: "Polished templates and reports that build trust."
  },
  {
    icon: Shield,
    title: "RELIABLE", 
    description: "Data-driven valuations and error-proof workflows."
  },
  {
    icon: TrendingUp,
    title: "PROFITABLE",
    description: "Monetization hooks built into every asset."
  },
  {
    icon: Users,
    title: "COMMUNITY",
    description: "A hub for operators, vendors, and buyers."
  }
];

const TEMPLATES = [
  {
    title: "Business Plan Template",
    category: "Business",
    description: "Comprehensive business plan for laundromat startups and acquisitions",
    price: "FREE",
    isPremium: false,
    image: laundromatImage
  },
  {
    title: "Financial Model Pro",
    category: "Finance",
    description: "Advanced Excel model with 5-year projections, sensitivity analysis",
    price: "$49",
    isPremium: true,
    image: equipmentImage
  },
  {
    title: "Operations Checklist",
    category: "Operations",
    description: "Daily, weekly, and monthly operational checklists for staff",
    price: "FREE",
    isPremium: false,
    image: washerDetailImage
  },
  {
    title: "Employee Handbook",
    category: "HR",
    description: "Customizable employee handbook with policies and procedures",
    price: "$29",
    isPremium: true,
    image: laundromatImage
  }
];

const LISTINGS = [
  {
    title: "Coin Laundry - Prime Downtown Location",
    location: "Seattle, WA",
    price: "$425K",
    revenue: "$185K/yr",
    cashFlow: "$92K/yr",
    built: "2018",
    isFeatured: true,
    image: laundromatImage
  },
  {
    title: "Full-Service Laundromat with Wash & Fold",
    location: "Portland, OR",
    price: "$650K",
    revenue: "$295K/yr",
    cashFlow: "$145K/yr",
    built: "2015",
    isFeatured: false,
    image: equipmentImage
  }
];

const FINANCING_OPTIONS = [
  { icon: Building2, title: "SBA 7(a) Loan", description: "Government-backed financing with favorable terms" },
  { icon: Building2, title: "Commercial Real Estate", description: "Traditional commercial property financing" },
  { icon: Target, title: "Equipment Financing", description: "Loans specifically for laundry equipment" },
  { icon: TrendingUp, title: "Startup Financing", description: "Funding packages for new laundromat builds" }
];

const CALCULATORS = [
  { icon: TrendingUp, title: "ROI Calculator", description: "Calculate return on investment for any laundromat location", cta: "Try Free Version", link: "/roi-calculator" },
  { icon: DollarSign, title: "Loan Calculator", description: "Estimate monthly payments and total interest costs", cta: "Try Free Version", link: "/loan-calculator" },
  { icon: Target, title: "Exit Strategy Calculator", description: "Project future sale value and return multiples", cta: "Unlock Premium - $29", link: "/valuation-calculator", isPremium: true }
];

const EDUCATION = [
  { icon: BookOpen, title: "The Ultimate Laundromat Guidebook", description: "The definitive guide to buying, operating, and scaling profitable laundromats", cta: "Get the Book", link: "/book" },
  { icon: GraduationCap, title: "Online Courses", description: "Self-paced courses to master every aspect of the laundromat business", cta: "Enroll Now", link: "/courses" },
  { icon: Phone, title: "Consultations", description: "One-on-one guidance on acquisitions, operations, and growth strategy", cta: "Book a Call", link: "/consultation", isHighlighted: true }
];

const PRODUCTS = [
  { title: "Heavy-Duty Laundry Cart - 6 Bushel Capacity", category: "Equipment Accessories", description: "Durable 6-bushel commercial laundry cart", price: "$89.99", image: equipmentImage },
  { title: "Coin & Card Vending Machine Combo", category: "Equipment Accessories", description: "Dual-payment vending machine", price: "$1499.99", image: washerDetailImage },
  { title: "LED Safety & Rules Signage Set", category: "Supplies", description: "LED safety signage - 8 piece set", price: "$49.99", image: laundromatImage }
];

const COMMUNITY_LINKS = [
  { icon: Search, title: "Error Codes DB", link: "/error-codes" },
  { icon: MessageSquare, title: "FAQs", link: "/help-center" },
  { icon: QrCode, title: "QR Feedback", link: "/forum" }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-gray-600">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 
                className="text-sm font-bold tracking-[0.15em] text-[#1e3a5f] uppercase mb-2"
                style={{ fontFamily: 'var(--font-bebas)' }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TemplatesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Start with Proven Templates & Guides
          </h2>
          <p className="text-gray-600">Professional resources to launch and grow your business</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((template) => (
            <Card key={template.title} className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="relative h-40">
                <img src={template.image} alt={template.title} className="w-full h-full object-cover" />
                <Badge 
                  className={`absolute top-3 right-3 ${template.isPremium ? 'bg-[#b8860b] text-white' : 'bg-[#1e3a5f] text-white'}`}
                >
                  {template.isPremium ? 'Premium' : 'Free'}
                </Badge>
              </div>
              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">{template.category}</Badge>
                <h3 
                  className="text-sm font-bold text-[#1e3a5f] uppercase mb-1"
                  style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                >
                  {template.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{template.price}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-[#1e3a5f]"
                    data-testid={`button-template-${template.isPremium ? 'purchase' : 'download'}-${template.category.toLowerCase()}`}
                  >
                    {template.isPremium ? <Lock className="w-4 h-4 mr-1" /> : <Download className="w-4 h-4 mr-1" />}
                    {template.isPremium ? 'Purchase' : 'Download'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/templates">
            <Button variant="outline" className="border-gray-300 hover:border-gray-400" data-testid="button-see-all-templates">
              See All Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketplaceSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Explore the Marketplace
          </h2>
          <p className="text-gray-600">Featured and standard listings</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {LISTINGS.map((listing) => (
              <Card key={listing.title} className="overflow-hidden border border-gray-200 bg-white">
                <div className="relative h-48">
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                  {listing.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-[#b8860b] text-white">
                      <Star className="w-3 h-3 mr-1" /> Featured (Paid)
                    </Badge>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 text-gray-900 px-2 py-1 rounded text-sm font-bold">
                    {listing.price}
                  </span>
                </div>
                <div className="p-4">
                  <h3 
                    className="text-sm font-bold text-[#1e3a5f] uppercase mb-2"
                    style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                  >
                    {listing.title}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {listing.location}</div>
                    <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Revenue: {listing.revenue}</div>
                    <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Cash Flow: {listing.cashFlow}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Built: {listing.built}</div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-300" data-testid={`button-listing-details-${listing.isFeatured ? 'featured' : 'standard'}`}>View Details</Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 border border-gray-200 bg-white">
              <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase mb-4">Vendor Spotlight (Paid)</p>
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 
                  className="text-sm font-bold text-[#1e3a5f] uppercase"
                  style={{ fontFamily: 'var(--font-bebas)' }}
                >
                  Speed Queen
                </h3>
                <Badge variant="outline" className="mt-2 text-xs">Equipment</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">Commercial laundry equipment - washers, dryers, and parts</p>
              <Button variant="outline" className="w-full border-gray-300" data-testid="button-vendor-spotlight-visit">
                Visit Store <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/laundromat-listings">
            <Button variant="outline" className="border-gray-300 hover:border-gray-400" data-testid="button-browse-all-listings">
              Browse All Listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FeaturedVendorBanner() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Card className="border-2 border-[#b8860b]/30 bg-gradient-to-r from-[#b8860b]/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Badge className="bg-[#b8860b] text-white shrink-0">
              <Star className="w-3 h-3 mr-1" /> Featured Vendor
            </Badge>
            <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center text-sm font-bold text-gray-400">
                PAYRANGE
              </div>
              <div className="text-center md:text-left">
                <h3 
                  className="text-sm font-bold text-[#1e3a5f] uppercase"
                  style={{ fontFamily: 'var(--font-bebas)' }}
                >
                  PayRange
                </h3>
                <p className="text-gray-800 font-medium">Mobile Payment Solutions</p>
                <p className="text-sm text-gray-600">Contactless payment systems for modern laundromats</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">Mobile Payment Readers</Badge>
                  <Badge variant="outline" className="text-xs">App Integration</Badge>
                </div>
              </div>
            </div>
            <Link href="/vendors">
              <Button className="bg-[#b8860b] hover:bg-[#9a7209] text-white shrink-0" data-testid="button-featured-vendor-storefront">
                Visit Storefront <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function FinancingSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Secure Financing for Your Laundromat
          </h2>
          <p className="text-gray-600">Explore financing options and get funded faster</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {FINANCING_OPTIONS.map((option) => (
            <Card key={option.title} className="p-6 border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <option.icon className="w-8 h-8 text-gray-600 mb-4" />
              <h3 
                className="text-sm font-bold text-[#1e3a5f] uppercase mb-2"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
              >
                {option.title}
              </h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="text-center space-y-3">
          <Link href="/funding">
            <Button variant="outline" className="border-gray-300 hover:border-gray-400" data-testid="button-start-funding-application">
              Start Application <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            <Link href="/consultation" className="text-[#1e3a5f] hover:underline" data-testid="link-funding-consultation">Book a Funding Consultation</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export function CalculatorHighlight() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Card className="border border-[#1e3a5f]/20 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-[#b8860b]/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7 text-[#b8860b]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 
              className="text-sm font-bold text-[#1e3a5f] uppercase"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              ROI Calculator
            </h3>
            <p className="text-gray-600">ROI Calculator powered by Dexter Laundry</p>
          </div>
          <Link href="/roi-calculator">
            <Button className="bg-[#b8860b] hover:bg-[#9a7209] text-white shrink-0" data-testid="button-try-roi-calculator">
              Try Calculator
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}

export function AnalyzeLocationSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Analyze Any Location
          </h2>
          <p className="text-gray-600">Data-driven tools to make smarter decisions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CALCULATORS.map((calc) => (
            <Card key={calc.title} className="p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <calc.icon className="w-8 h-8 text-gray-600 mb-4" />
              <h3 
                className="text-sm font-bold text-[#1e3a5f] uppercase mb-2"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
              >
                {calc.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{calc.description}</p>
              <Link href={calc.link}>
                <Button variant="outline" className="w-full border-gray-300" data-testid={`button-calculator-${calc.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {calc.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EducationSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Learn from the Experts
          </h2>
          <p className="text-gray-600">Comprehensive education and guidance for every stage</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EDUCATION.map((item) => (
            <Card 
              key={item.title} 
              className={`p-6 border text-center ${item.isHighlighted ? 'border-[#b8860b] bg-white' : 'border-gray-200 bg-white'}`}
            >
              <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${item.isHighlighted ? 'bg-[#b8860b]' : 'bg-gray-100'}`}>
                <item.icon className={`w-8 h-8 ${item.isHighlighted ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <h3 
                className="text-sm font-bold text-[#1e3a5f] uppercase mb-2"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <Link href={item.link}>
                <Button 
                  variant={item.isHighlighted ? "default" : "outline"} 
                  className={`w-full ${item.isHighlighted ? 'bg-[#1e3a5f] hover:bg-[#2a4a73]' : 'border-gray-300'}`}
                  data-testid={`button-education-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShopSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Shop Operator Essentials
          </h2>
          <p className="text-gray-600">Hand-picked tools and supplies trusted by operators nationwide</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((product, idx) => (
            <Card key={product.title} className="overflow-hidden border border-gray-200">
              <div className="relative h-48">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                {idx < 2 && (
                  <Badge className="absolute top-3 left-3 bg-[#b8860b] text-white">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">{product.category}</Badge>
                <h3 
                  className="text-sm font-bold text-[#1e3a5f] uppercase mb-1"
                  style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                >
                  {product.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3">{product.description}</p>
                <p className="text-lg font-bold text-gray-900 mb-3">{product.price}</p>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-[#1e3a5f]" data-testid={`button-product-amazon-${idx}`}>
                    Buy on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-gray-300" data-testid={`button-product-details-${idx}`}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/products">
            <Button variant="outline" className="border-gray-300 hover:border-gray-400" data-testid="button-browse-shop">
              Browse Shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-2"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Join the WashBizHub Community
          </h2>
          <p className="text-gray-600">Access resources, get answers, and connect with peers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMUNITY_LINKS.map((item) => (
            <Link key={item.title} href={item.link} data-testid={`link-community-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <Card className="p-6 border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <item.icon className="w-6 h-6 text-gray-600" />
                  <span 
                    className="text-sm font-bold text-[#1e3a5f] uppercase"
                    style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                  >
                    {item.title}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 
          className="text-2xl md:text-3xl font-bold tracking-wide text-gray-900 uppercase mb-10"
          style={{ fontFamily: 'var(--font-bebas)' }}
        >
          Ready to Build a Stronger Laundry Business?
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/templates">
            <Button variant="outline" size="lg" className="h-12 px-8 border-gray-300 hover:border-gray-400" data-testid="button-cta-templates">
              Get Free Templates
            </Button>
          </Link>
          <Link href="/consultation">
            <Button variant="outline" size="lg" className="h-12 px-8 border-gray-300 hover:border-gray-400" data-testid="button-cta-consultation">
              Book a Consultation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PremiumFooter() {
  return (
    <footer className="bg-[#1e3a5f] text-white" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 
              className="text-sm font-bold tracking-wide text-[#b8860b] uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              WashBizHub
            </h3>
            <p className="text-sm text-white/60 mb-2">Strategy • Funding • Growth</p>
            <p className="text-xs text-white/40">The all-in-one platform for laundromat owners, buyers, and vendors.</p>
          </div>
          
          {[
            { title: "Resources", links: ["Templates & Guides", "Business Plans", "Financial Models", "Marketing Kits"] },
            { title: "Marketplace", links: ["Listings", "Vendors", "List Your Business"] },
            { title: "Funding", links: ["Loan Types", "Application", "Funding Reports"] },
            { title: "Authority", links: ["The Handbook", "Online Courses", "Consultations"] }
          ].map((section) => (
            <div key={section.title}>
              <h3 
                className="text-xs font-bold tracking-wide text-[#b8860b] uppercase mb-4"
                style={{ fontFamily: 'var(--font-bebas)' }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 
              className="text-xs font-bold tracking-wide text-[#b8860b] uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              Shop
            </h3>
            <ul className="space-y-2">
              {["Equipment", "Supplies", "Marketing Kits"].map((link) => (
                <li key={link}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 
              className="text-xs font-bold tracking-wide text-[#b8860b] uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              Community
            </h3>
            <ul className="space-y-2">
              {["Error Codes", "FAQs", "Feedback"].map((link) => (
                <li key={link}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">© 2025 WashBizHub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Design System</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
