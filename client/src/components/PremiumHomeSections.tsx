import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
import twinCitiesInterior from "@assets/Twin_Cities_Laundromat_1764705357211.jpg";
import consultingImage from "@assets/laundromat_consulting_1764705500502.png";
import aerialViewHD from "@assets/laundromat_aerial_view_hd_1764705500502.jpg";
import aerialView from "@assets/laundromat_aerial_view_1764705500503.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

function GoldDivider() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="h-px bg-gradient-to-r from-transparent via-[#b8860b]/40 to-transparent" />
    </div>
  );
}

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
    image: aerialViewHD
  },
  {
    title: "Full-Service Laundromat with Wash & Fold",
    location: "Portland, OR",
    price: "$650K",
    revenue: "$295K/yr",
    cashFlow: "$145K/yr",
    built: "2015",
    isFeatured: false,
    image: aerialView
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
  { icon: Phone, title: "Consultations", description: "One-on-one guidance on acquisitions, operations, and growth strategy", cta: "Book a Call", link: "/consultation", isHighlighted: true, image: consultingImage }
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {FEATURES.map((feature) => (
              <motion.div 
                key={feature.title} 
                variants={cardItem}
                className="text-center p-8"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-[#b8860b]/10 to-[#1e3a5f]/10">
                  <feature.icon className="w-7 h-7 text-[#b8860b]" />
                </div>
                <h3 
                  className="text-xl font-bold tracking-tight text-[#1e3a5f] uppercase mb-3"
                  style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px' }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function TemplatesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-gray-900 uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Start with Proven Templates & Guides
            </h2>
            <p className="text-gray-600 text-lg">Professional resources to launch and grow your business</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {TEMPLATES.map((template) => (
              <motion.div key={template.title} variants={cardItem}>
                <Card className="overflow-hidden border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="relative h-48">
                    <img src={template.image} alt={template.title} className="w-full h-full object-cover" />
                    <Badge 
                      className={`absolute top-4 right-4 ${template.isPremium ? 'bg-[#b8860b] text-white' : 'bg-[#1e3a5f] text-white'}`}
                    >
                      {template.isPremium ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                  <div className="p-8">
                    <Badge variant="outline" className="mb-3 text-xs">{template.category}</Badge>
                    <h3 
                      className="text-lg font-bold text-[#1e3a5f] uppercase mb-2"
                      style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                    >
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">{template.price}</span>
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
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Link href="/templates">
              <Button variant="outline" className="border-gray-300 hover:border-gray-400 px-8 py-3" data-testid="button-see-all-templates">
                See All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function MarketplaceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-gray-900 uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Explore the Marketplace
            </h2>
            <p className="text-gray-600 text-lg">Featured and standard listings</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {LISTINGS.map((listing) => (
                <motion.div key={listing.title} variants={cardItem}>
                  <Card className={`overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-white ${listing.isFeatured ? 'border-2 border-[#b8860b]/40' : 'border border-gray-200'}`}>
                    <div className="relative h-48">
                      <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                      {listing.isFeatured && (
                        <Badge className="absolute top-4 left-4 bg-[#b8860b] text-white shadow-lg">
                          <Star className="w-3 h-3 mr-1" /> Featured (Paid)
                        </Badge>
                      )}
                      <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                        {listing.price}
                      </span>
                    </div>
                    <div className="p-8">
                      <h3 
                        className="text-lg font-bold text-[#1e3a5f] uppercase mb-3"
                        style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                      >
                        {listing.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#b8860b]" /> {listing.location}</div>
                        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#b8860b]" /> Revenue: {listing.revenue}</div>
                        <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#b8860b]" /> Cash Flow: {listing.cashFlow}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#b8860b]" /> Built: {listing.built}</div>
                      </div>
                      <Button variant="outline" className="w-full border-gray-300 hover:border-[#1e3a5f] hover:text-[#1e3a5f]" data-testid={`button-listing-details-${listing.isFeatured ? 'featured' : 'standard'}`}>View Details</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <motion.div variants={cardItem} className="space-y-8">
              <Card className="p-8 border border-gray-200 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase mb-6">Vendor Spotlight (Paid)</p>
                <div className="border-b border-gray-100 pb-6 mb-6">
                  <h3 
                    className="text-lg font-bold text-[#1e3a5f] uppercase"
                    style={{ fontFamily: 'var(--font-bebas)' }}
                  >
                    Speed Queen
                  </h3>
                  <Badge variant="outline" className="mt-3 text-xs">Equipment</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">Commercial laundry equipment - washers, dryers, and parts</p>
                <Button variant="outline" className="w-full border-gray-300 hover:border-[#1e3a5f]" data-testid="button-vendor-spotlight-visit">
                  Visit Store <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Link href="/laundromat-listings">
              <Button variant="outline" className="border-gray-300 hover:border-gray-400 px-8 py-3" data-testid="button-browse-all-listings">
                Browse All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function FeaturedVendorBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden border-2 border-[#b8860b]/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="grid md:grid-cols-3 gap-0">
                <motion.div 
                  className="relative h-56 md:h-auto"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <img 
                    src={twinCitiesInterior} 
                    alt="Modern laundromat interior" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90 md:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent md:hidden" />
                </motion.div>
                <div className="md:col-span-2 p-8 bg-gradient-to-r from-white to-[#b8860b]/5">
                  <div className="flex flex-col h-full justify-center">
                    <Badge className="bg-[#b8860b] text-white w-fit mb-6 shadow-lg">
                      <Star className="w-3 h-3 mr-1" /> Featured Vendor
                    </Badge>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                      <div className="w-28 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-400 shrink-0 shadow-inner">
                        PAYRANGE
                      </div>
                      <div className="flex-1">
                        <h3 
                          className="text-xl font-bold text-[#1e3a5f] uppercase"
                          style={{ fontFamily: 'var(--font-bebas)' }}
                        >
                          PayRange
                        </h3>
                        <p className="text-gray-800 font-medium text-lg">Mobile Payment Solutions</p>
                        <p className="text-sm text-gray-600 mt-1">Contactless payment systems for modern laundromats</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">Mobile Payment Readers</Badge>
                          <Badge variant="outline" className="text-xs">App Integration</Badge>
                        </div>
                      </div>
                      <Link href="/vendors">
                        <Button className="bg-[#b8860b] hover:bg-[#9a7209] text-white shrink-0 shadow-lg px-6 py-3" data-testid="button-featured-vendor-storefront">
                          Visit Storefront <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function FinancingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-gray-900 uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Secure Financing for Your Laundromat
            </h2>
            <p className="text-gray-600 text-lg">Explore financing options and get funded faster</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          >
            {FINANCING_OPTIONS.map((option) => (
              <motion.div key={option.title} variants={cardItem}>
                <Card className="p-8 border border-gray-200 bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#b8860b]/20 to-[#1e3a5f]/10 flex items-center justify-center mb-6">
                    <option.icon className="w-7 h-7 text-[#b8860b]" />
                  </div>
                  <h3 
                    className="text-lg font-bold text-[#1e3a5f] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                  >
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center space-y-4"
          >
            <Link href="/funding">
              <Button variant="outline" className="border-gray-300 hover:border-gray-400 px-8 py-3" data-testid="button-start-funding-application">
                Start Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              <Link href="/consultation" className="text-[#1e3a5f] hover:underline font-medium" data-testid="link-funding-consultation">Book a Funding Consultation</Link>
            </p>
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function CalculatorHighlight() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-2 border-[#1e3a5f]/20 p-8 flex flex-col md:flex-row items-center gap-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b8860b]/20 to-[#b8860b]/5 flex items-center justify-center shrink-0">
                <TrendingUp className="w-8 h-8 text-[#b8860b]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 
                  className="text-xl font-bold text-[#1e3a5f] uppercase"
                  style={{ fontFamily: 'var(--font-bebas)' }}
                >
                  ROI Calculator
                </h3>
                <p className="text-gray-600 text-lg">ROI Calculator powered by Dexter Laundry</p>
              </div>
              <Link href="/roi-calculator">
                <Button className="bg-[#b8860b] hover:bg-[#9a7209] text-white shrink-0 shadow-lg px-8 py-3" data-testid="button-try-roi-calculator">
                  Try Calculator
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function AnalyzeLocationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-gray-900 uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Analyze Any Location
            </h2>
            <p className="text-gray-600 text-lg">Data-driven tools to make smarter decisions</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {CALCULATORS.map((calc) => (
              <motion.div key={calc.title} variants={cardItem}>
                <Card className={`p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ${calc.isPremium ? 'border-2 border-[#b8860b]/40 bg-gradient-to-br from-white to-[#b8860b]/5' : 'border border-gray-200 bg-white'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${calc.isPremium ? 'bg-gradient-to-br from-[#b8860b] to-[#9a7209]' : 'bg-gradient-to-br from-[#1e3a5f]/10 to-[#b8860b]/10'}`}>
                    <calc.icon className={`w-7 h-7 ${calc.isPremium ? 'text-white' : 'text-[#b8860b]'}`} />
                  </div>
                  <h3 
                    className="text-lg font-bold text-[#1e3a5f] uppercase mb-3"
                    style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                  >
                    {calc.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">{calc.description}</p>
                  <Link href={calc.link}>
                    <Button 
                      variant={calc.isPremium ? "default" : "outline"} 
                      className={`w-full ${calc.isPremium ? 'bg-[#b8860b] hover:bg-[#9a7209] text-white shadow-lg' : 'border-gray-300 hover:border-[#1e3a5f]'}`}
                      data-testid={`button-calculator-${calc.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {calc.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function EducationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-gray-900 uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Learn from the Experts
            </h2>
            <p className="text-gray-600 text-lg">Comprehensive education and guidance for every stage</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {EDUCATION.map((item) => (
              <motion.div key={item.title} variants={cardItem}>
                <Card 
                  className={`overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ${item.isHighlighted ? 'border-2 border-[#b8860b] bg-white' : 'border border-gray-200 bg-white'}`}
                >
                  {item.image ? (
                    <div className="relative h-48">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/90 via-[#1e3a5f]/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 
                          className="text-lg font-bold text-white uppercase"
                          style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                        >
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 pb-0 text-center">
                      <div className={`w-18 h-18 mx-auto rounded-2xl flex items-center justify-center mb-6 ${item.isHighlighted ? 'bg-gradient-to-br from-[#b8860b] to-[#9a7209]' : 'bg-gradient-to-br from-gray-100 to-gray-50'}`} style={{ width: '72px', height: '72px' }}>
                        <item.icon className={`w-9 h-9 ${item.isHighlighted ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <h3 
                        className="text-lg font-bold text-[#1e3a5f] uppercase mb-3"
                        style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                      >
                        {item.title}
                      </h3>
                    </div>
                  )}
                  <div className={`p-8 ${item.image ? 'pt-6' : 'pt-0'} text-center`}>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                    <Link href={item.link}>
                      <Button 
                        variant={item.isHighlighted ? "default" : "outline"} 
                        className={`w-full ${item.isHighlighted ? 'bg-[#1e3a5f] hover:bg-[#2a4a73] shadow-lg' : 'border-gray-300 hover:border-[#1e3a5f]'}`}
                        data-testid={`button-education-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.cta}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function ShopSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-gray-900 uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Shop Operator Essentials
            </h2>
            <p className="text-gray-600 text-lg">Hand-picked tools and supplies trusted by operators nationwide</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {PRODUCTS.map((product, idx) => (
              <motion.div key={product.title} variants={cardItem}>
                <Card className="overflow-hidden border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 bg-white">
                  <div className="relative h-56">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    {idx < 2 && (
                      <Badge className="absolute top-4 left-4 bg-[#b8860b] text-white shadow-lg">
                        <Star className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="p-8">
                    <Badge variant="outline" className="mb-3 text-xs">{product.category}</Badge>
                    <h3 
                      className="text-lg font-bold text-[#1e3a5f] uppercase mb-2"
                      style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                    >
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-6">{product.price}</p>
                    <div className="space-y-3">
                      <Button variant="default" className="w-full bg-[#FF9900] hover:bg-[#E88B00] text-white shadow-md" data-testid={`button-product-amazon-${idx}`}>
                        Buy on Amazon <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="w-full border-gray-300 hover:border-[#1e3a5f]" data-testid={`button-product-details-${idx}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Link href="/products">
              <Button variant="outline" className="border-gray-300 hover:border-gray-400 px-8 py-3" data-testid="button-browse-shop">
                Browse Shop
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function CommunitySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <>
      <section className="py-24 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h2 
              className="text-5xl font-bold tracking-tight text-white uppercase mb-4"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
            >
              Join the WashBizHub Community
            </h2>
            <p className="text-white/70 text-lg">Access resources, get answers, and connect with peers</p>
          </motion.div>
          
          <motion.div 
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {COMMUNITY_LINKS.map((item) => (
              <motion.div key={item.title} variants={cardItem}>
                <Link href={item.link} data-testid={`link-community-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="p-8 border border-white/20 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#b8860b]/20 flex items-center justify-center">
                        <item.icon className="w-7 h-7 text-[#b8860b]" />
                      </div>
                      <span 
                        className="text-lg font-bold text-white uppercase"
                        style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                      >
                        {item.title}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <GoldDivider />
    </>
  );
}

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 uppercase mb-12"
            style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px' }}
          >
            Ready to Build a Stronger Laundry Business?
          </h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-wrap justify-center gap-6"
          >
            <motion.div variants={cardItem}>
              <Link href="/templates">
                <Button variant="outline" size="lg" className="h-14 px-10 border-gray-300 hover:border-[#1e3a5f] text-lg" data-testid="button-cta-templates">
                  Get Free Templates
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={cardItem}>
              <Link href="/consultation">
                <Button size="lg" className="h-14 px-10 bg-[#b8860b] hover:bg-[#9a7209] text-white shadow-lg text-lg" data-testid="button-cta-consultation">
                  Book a Consultation
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function PremiumFooter() {
  return (
    <footer className="bg-[#1e3a5f] text-white" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <h3 
              className="text-lg font-bold tracking-wide text-[#b8860b] uppercase mb-6"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              WashBizHub
            </h3>
            <p className="text-sm text-white/60 mb-3">Strategy • Funding • Growth</p>
            <p className="text-xs text-white/40 leading-relaxed">The all-in-one platform for laundromat owners, buyers, and vendors.</p>
          </div>
          
          {[
            { title: "Resources", links: ["Templates & Guides", "Business Plans", "Financial Models", "Marketing Kits"] },
            { title: "Marketplace", links: ["Listings", "Vendors", "List Your Business"] },
            { title: "Funding", links: ["Loan Types", "Application", "Funding Reports"] },
            { title: "Authority", links: ["The Handbook", "Online Courses", "Consultations"] }
          ].map((section) => (
            <div key={section.title}>
              <h3 
                className="text-sm font-bold tracking-wide text-[#b8860b] uppercase mb-6"
                style={{ fontFamily: 'var(--font-bebas)' }}
              >
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h3 
              className="text-sm font-bold tracking-wide text-[#b8860b] uppercase mb-6"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              Shop
            </h3>
            <ul className="space-y-3">
              {["Equipment", "Supplies", "Marketing Kits"].map((link) => (
                <li key={link}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 
              className="text-sm font-bold tracking-wide text-[#b8860b] uppercase mb-6"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              Community
            </h3>
            <ul className="space-y-3">
              {["Error Codes", "FAQs", "Feedback"].map((link) => (
                <li key={link}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-white/40">© 2025 WashBizHub. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Design System</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
