import { Link } from "wouter";
import { ExternalLink, Facebook, MessageCircle, Phone, Mail, Wrench, AlertTriangle, Settings, Shield, DollarSign, BarChart3, Calculator, ShoppingCart, GraduationCap, Briefcase, Bot, Layout, BookOpen, FileText, Globe, Monitor, Zap, Lock, CheckCircle, Users, Award, Trophy, Star, MapPin, Clock, Accessibility, Cookie, FileCheck, Building2, Scale, Map, Store } from "lucide-react";
import { Advertisement } from "@/components/Advertisement";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/LazyImage";
import logoUrl from "@assets/6_1764040628012.png";
import serviceGuyAiLogoUrl from "@assets/SERVICE GUY_1764436998885.png";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "consult@washbizhub.com";

const trustBadges = [
  { icon: Lock, label: "256-bit SSL", description: "Secure encryption" },
  { icon: Shield, label: "Stripe Payments", description: "PCI compliant processing" },
  { icon: Users, label: "72,000+ Community", description: "Facebook group members" },
];

export function Footer() {
  const handleResourceClick = (resourceName: string, url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'footer_resource_click', {
        event_category: 'Footer Navigation',
        event_label: resourceName,
        value: url
      });
    }
  };

  return (
    <footer className="bg-[hsl(215,25%,16%)] py-16 border-t-2 border-[hsl(45,38%,59%)]" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Trust Badges Section */}
        <div className="mb-12 pb-8 border-b border-white/10">
          <div className="text-center mb-6">
            <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-2" data-testid="text-trust-heading">
              Security & Community
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {trustBadges.map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 hover:border-[hsl(45,38%,59%)]/30 transition-all duration-300"
                data-testid={`badge-trust-${index}`}
              >
                <div className="bg-[hsl(45,38%,59%)]/20 p-2 rounded-lg">
                  <badge.icon className="h-4 w-4 text-[hsl(45,38%,59%)]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{badge.label}</p>
                  <p className="text-white/50 text-xs">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large Logo Hero Section */}
        <div className="text-center mb-12 pb-12 border-b border-white/10">
          <LazyImage 
            src={logoUrl} 
            alt="WashBizHub - The #1 Laundromat Resource" 
            className="h-40 sm:h-48 md:h-56 lg:h-60 w-auto mx-auto mb-6" 
            data-testid="img-footer-logo"
          />
          <p className="text-[hsl(45,38%,59%)] text-lg sm:text-xl font-semibold tracking-wider">
            LISTINGS · EQUIPMENT · EDUCATION · VALUATIONS
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-3">
            The #1 Laundromat Resource & Educational Hub
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed mb-3">
            For owners, operators, brokers, investors, buyers, sellers, vendors — anyone in the industry. US & Global listings.
          </p>
          <p className="text-white/60 text-xs sm:text-sm max-w-2xl mx-auto mb-4">
            CLEANBI™ analyzer · Valuations · Competition · Courses · Calculators · Funding · Vendors
          </p>
          <a 
            href="https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[hsl(45,38%,42%)] hover:bg-[hsl(45,38%,35%)] text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg border border-[hsl(45,38%,50%)]"
            data-testid="link-footer-startup-funding"
            aria-label="Apply for startup funding - personal credit $5K to $150K"
          >
            <DollarSign className="h-5 w-5" />
            <span>Get Startup Funding — $5K-$150K Personal Credit</span>
          </a>
        </div>

        {/* Main Footer Grid - 6 columns on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Contact & Business Services Column - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              Contact Us
            </h3>
            
            {/* Contact - Email Only */}
            <div className="space-y-3 mb-6">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center border border-accent/30"
                data-testid="link-footer-email"
              >
                <Mail className="h-4 w-4" />
                <span className="font-semibold">{CONTACT_EMAIL}</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              <a
                href="https://facebook.com/groups/thelaundromat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleResourceClick('Facebook Group', 'https://facebook.com/groups/thelaundromat')}
                className="bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors"
                data-testid="link-footer-facebook-social"
                aria-label="Join our Facebook Group"
              >
                <Facebook className="h-5 w-5 text-accent" />
              </a>
            </div>

            {/* Business Services Sub-section */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                Business Services
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Link href="/website-builder">
                  <span className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-website-hosting">
                    <Globe className="h-3 w-3" />
                    Website Builder
                  </span>
                </Link>
                <Link href="/pos">
                  <span className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-pos-system">
                    <Monitor className="h-3 w-3" />
                    POS System
                  </span>
                </Link>
                <Link href="/consultation">
                  <span className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-consultation">
                    <Phone className="h-3 w-3" />
                    Book Consultation
                  </span>
                </Link>
                <Link href="/consultation-landing">
                  <span className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-expert-services">
                    <Zap className="h-3 w-3" />
                    Expert Services
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Platform Tools Column */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layout className="h-4 w-4 text-accent" />
              Platform Tools
            </h3>
            <div className="space-y-2">
              <Link href="/cleanbi">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-cleanbi-analysis">
                  CLEANBI™ Analysis
                </span>
              </Link>
              <Link href="/design-studio">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-design-studio">
                  Design Studio 2D/3D
                </span>
              </Link>
              <button
                onClick={() => {
                  const chatWidget = document.querySelector('[data-testid="ai-chat-trigger"]');
                  if (chatWidget) (chatWidget as HTMLButtonElement).click();
                }}
                className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm text-left w-full"
                data-testid="link-footer-ai-consultant"
              >
                <span className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  WashBizHub Consultant
                </span>
              </button>
              <Link href="/service-guy-ai">
                <span className="flex items-center gap-1 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-service-guy-ai">
                  <Wrench className="h-3 w-3" />
                  Service Guy AI
                </span>
              </Link>
            </div>
          </div>

          {/* Analytics & Calculators Column */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              Analytics
            </h3>
            <div className="space-y-2">
              <Link href="/valuation-calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-valuation-calculator">
                  Valuation Calculator
                </span>
              </Link>
              <Link href="/roi-calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-roi-calculator">
                  ROI Calculator
                </span>
              </Link>
              <Link href="/calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-revenue-calculator">
                  Revenue Calculator
                </span>
              </Link>
              <Link href="/funding-matcher">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-funding-matcher">
                  Funding Matcher
                </span>
              </Link>
              <Link href="/calculators">
                <span className="flex items-center gap-1 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm font-semibold" data-testid="link-footer-all-calculators">
                  <Calculator className="h-3 w-3" />
                  All 50+ Tools
                </span>
              </Link>
            </div>
          </div>

          {/* Marketplace Column */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-accent" />
              Marketplace
            </h3>
            <div className="space-y-2">
              <Link href="/superstore">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-superstore">
                  Equipment Superstore
                </span>
              </Link>
              <Link href="/parts">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-parts-marketplace">
                  Parts Marketplace
                </span>
              </Link>
              <Link href="/listings">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-buy-sell-laundromats">
                  Buy/Sell Laundromats
                </span>
              </Link>
              <Link href="/add-listing">
                <span className="flex items-center gap-1 text-accent hover:text-[hsl(45,38%,70%)] transition-colors cursor-pointer text-sm font-semibold" data-testid="link-footer-add-listing">
                  <Store className="h-3 w-3" />
                  Add a Listing
                </span>
              </Link>
              <Link href="/vendors">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-vendor-directory">
                  Vendor Directory
                </span>
              </Link>
            </div>
          </div>

          {/* Education Column */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-accent" />
              Education
            </h3>
            <div className="space-y-2">
              <Link href="/courses">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-premium-courses">
                  Premium Courses
                </span>
              </Link>
              <Link href="/book">
                <span className="flex items-center gap-1 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-laundromat-bible">
                  <BookOpen className="h-3 w-3" />
                  The Laundromat Bible
                </span>
              </Link>
              <Link href="/templates">
                <span className="flex items-center gap-1 text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-templates-guides">
                  <FileText className="h-3 w-3" />
                  Templates & Guides
                </span>
              </Link>
              <Link href="/blog">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-industry-blog">
                  Industry Blog
                </span>
              </Link>
              <Link href="/resources">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-resource-hub">
                  Resource Hub
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recommended Partners Section */}
        <div className="border-t border-primary/20 pt-8 mb-8">
          <h3 className="text-white font-bold text-lg mb-6 text-center">
            Recommended Industry Partners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Facebook Group Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[hsl(45,38%,59%)]/50 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-[hsl(45,38%,59%)]/20 p-3 rounded-lg">
                  <Facebook className="h-6 w-6 text-[hsl(45,38%,59%)]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">The Laundromat Facebook Group</h4>
                  <p className="text-white/70 text-sm mb-3">
                    Join 10,000+ laundromat owners sharing strategies, solving problems, and growing together.
                  </p>
                  <a
                    href="https://facebook.com/groups/thelaundromat"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleResourceClick('Facebook Group Card', 'https://facebook.com/groups/thelaundromat')}
                    className="inline-flex items-center gap-2 text-[hsl(45,38%,59%)] hover:text-[hsl(45,38%,70%)] font-semibold text-sm transition-colors"
                    data-testid="link-footer-facebook-card"
                  >
                    Join the Community
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* ATM Depot Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[hsl(45,38%,59%)]/50 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-[hsl(45,38%,59%)]/20 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-[hsl(45,38%,59%)]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">ATM Depot - Passive Income</h4>
                  <p className="text-white/70 text-sm mb-3">
                    Add $200-$800/month passive revenue with free ATM installation and zero upfront costs.
                  </p>
                  <a
                    href="https://atmdepot.com/laundromat"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleResourceClick('ATM Depot Card', 'https://atmdepot.com/laundromat')}
                    className="inline-flex items-center gap-2 text-[hsl(45,38%,59%)] hover:text-[hsl(45,38%,70%)] font-semibold text-sm transition-colors"
                    data-testid="link-footer-atm-card"
                  >
                    Get Free Installation
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Guy AI Premium Section - SEO Optimized */}
        <div className="border-t border-primary/20 pt-8 mb-8">
          <div className="bg-gradient-to-r from-white/5 to-[hsl(45,38%,59%)]/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 hover:border-[hsl(45,38%,59%)]/30 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Link href="/service-guy-ai">
                  <LazyImage 
                    src={serviceGuyAiLogoUrl} 
                    alt="Service Guy AI - Premium Commercial Laundry Equipment Diagnostics" 
                    className="h-24 md:h-32 w-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                    data-testid="img-footer-service-guy-ai"
                  />
                </Link>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-white font-bold text-xl">Service Guy AI</h3>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none">
                    PREMIUM
                  </Badge>
                </div>
                <p className="text-white/80 text-sm mb-3">
                  Industrial-grade diagnostic intelligence for commercial laundry equipment. 
                  Named in honor of our founder's father, a lifelong service professional.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/70 mb-4">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    2,200+ Error Codes
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings className="h-4 w-4 text-primary" />
                    5,000+ Part Numbers
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    Step-by-Step Guides
                  </span>
                </div>
                <Link href="/service-guy-ai">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90" data-testid="button-footer-service-guy-ai">
                    <Wrench className="h-4 w-4 mr-2" />
                    Access Diagnostic Tools
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-xs text-white/50 mb-1">Service Directory Partner:</p>
                <p className="text-sm text-white/80 font-semibold">Kremers Laundry Equipment Co, Inc</p>
                <p className="text-xs text-white/60">Fort Smith, AR · (479) 629-0484</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advertisement & Newsletter Section */}
        <div className="border-t border-primary/20 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Newsletter */}
            <div>
              <NewsletterSignup variant="compact" source="footer" />
            </div>
            
            {/* Advertisement */}
            <div>
              <Advertisement placement="footer" />
            </div>
          </div>
        </div>

        {/* Company Info Section */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info */}
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[hsl(45,38%,59%)]" />
                  Company Information
                </h4>
                <div className="text-white/60 text-xs space-y-1">
                  <p>WashBizHub</p>
                  <p>Fort Smith, AR 72901</p>
                </div>
              </div>
              
              {/* Security */}
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[hsl(45,38%,59%)]" />
                  Platform Security
                </h4>
                <div className="text-white/60 text-xs space-y-1">
                  <p className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-blue-400" />
                    256-bit SSL Encryption
                  </p>
                  <p className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-blue-400" />
                    Stripe PCI-Compliant Payments
                  </p>
                  <p className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-blue-400" />
                    Secure Cloud Hosting (Replit)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Intellectual Property Notice */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-[hsl(45,38%,59%)]/20 to-primary/20 p-2 rounded-lg">
                    <Scale className="h-5 w-5 text-[hsl(45,38%,59%)]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">CLEANBI™ Proprietary Technology</p>
                    <p className="text-white/50 text-xs">Trade Secret Protected · All Rights Reserved</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Trade Secret
                  </Badge>
                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs">
                    <FileCheck className="h-3 w-3 mr-1" />
                    Copyright © 2025
                  </Badge>
                  <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    17-Factor Algorithm
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          {/* Primary Links Row */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 text-sm">
            <Link href="/privacy">
              <span className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-privacy">
                <Shield className="h-3 w-3" />
                Privacy Policy
              </span>
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/terms">
              <span className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-terms">
                <FileText className="h-3 w-3" />
                Terms of Service
              </span>
            </Link>
            <span className="text-white/20">|</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).showCookiePreferences) {
                  (window as any).showCookiePreferences();
                }
              }}
              className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer"
              data-testid="link-footer-cookie-settings"
            >
              <Cookie className="h-3 w-3" />
              Cookie Settings
            </button>
            <span className="text-white/20">|</span>
            <Link href="/about-us">
              <span className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-accessibility">
                <Accessibility className="h-3 w-3" />
                Accessibility
              </span>
            </Link>
            <span className="text-white/20">|</span>
            <a 
              href="/sitemap.xml"
              className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors"
              data-testid="link-footer-sitemap"
            >
              <Map className="h-3 w-3" />
              Sitemap
            </a>
          </div>

          {/* Secondary Links Row */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 text-sm">
            <Link href="/pricing">
              <span className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer font-semibold" data-testid="link-footer-pricing">
                <DollarSign className="h-3 w-3" />
                View Pricing
              </span>
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/about-us">
              <span className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-about">
                <Users className="h-3 w-3" />
                About Us
              </span>
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/consultation">
              <span className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-free-consultation">
                <Phone className="h-3 w-3" />
                Free Consultation
              </span>
            </Link>
            <span className="text-white/20">|</span>
            <a 
              href="mailto:support@washbizhub.com" 
              className="flex items-center gap-1 text-white/60 hover:text-[hsl(45,38%,59%)] transition-colors" 
              data-testid="link-footer-support"
            >
              <Mail className="h-3 w-3" />
              Support
            </a>
          </div>

          {/* Copyright & Legal */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">
              © 2025 WashBizHub.com • The #1 Laundromat Resource Hub
              <span className="hidden md:inline"> • </span>
              <br className="md:hidden" />
              <span className="text-[hsl(45,38%,59%)] font-semibold">STRATEGY • FUNDING • GROWTH • AUTOMATION</span>
            </p>
            <p className="text-white/40 text-xs max-w-3xl mx-auto leading-relaxed mb-2">
              WashBizHub™ and CLEANBI™ are trademarks of WashBizHub, LLC. The CLEANBI™ scoring system, including its 17-factor weighted algorithm, 
              valuation methodologies, and proprietary formulas, constitutes trade secret information protected under the Defend Trade Secrets Act (18 U.S.C. § 1836) 
              and applicable state trade secret laws. Unauthorized access, reverse engineering, or misappropriation is strictly prohibited.
            </p>
            <p className="text-white/40 text-xs max-w-3xl mx-auto leading-relaxed">
              All company, product, and service names used on this website are for identification purposes only. 
              Information provided is for educational and informational purposes only and should not be construed as professional financial, legal, or business advice.
              By using this platform, you agree to our <Link href="/terms"><span className="text-[hsl(45,38%,59%)] hover:underline cursor-pointer">Terms of Service</span></Link> and <Link href="/privacy"><span className="text-[hsl(45,38%,59%)] hover:underline cursor-pointer">Privacy Policy</span></Link>.
            </p>
            <p className="text-white/30 text-xs mt-3 flex items-center justify-center gap-2">
              <Clock className="h-3 w-3" />
              Last updated: November 2025 • Made with dedication in Fort Smith, AR
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
