import { Link } from "wouter";
import { ExternalLink, Facebook, Linkedin, Twitter, MessageCircle, Phone, Mail, Tag, Wrench, AlertTriangle, Settings, Shield } from "lucide-react";
import { Advertisement } from "@/components/Advertisement";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/6_1763855398994.png";
import serviceGuyAiLogoUrl from "@assets/service guy ai_1764034013003.png";

// Contact info - Kremers Laundry Equipment Co, Inc (Dad's number for customer communications)
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || "1-479-629-0484";
const CONTACT_PHONE_DIGITS = import.meta.env.VITE_CONTACT_PHONE_DIGITS || "14796290484";
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "consult@washbizhub.com";

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
    <footer className="bg-[hsl(215,25%,16%)] py-16 border-t-2 border-[hsl(45,38%,59%)]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Large Logo Hero Section */}
        <div className="text-center mb-12 pb-12 border-b border-white/10">
          <img 
            src={logoUrl} 
            alt="WashBizHub - The Bloomberg of Laundromats" 
            className="h-40 sm:h-48 md:h-56 lg:h-60 w-auto mx-auto mb-6" 
            data-testid="img-footer-logo"
          />
          <p className="text-[hsl(45,38%,59%)] text-lg sm:text-xl font-semibold tracking-wider">
            STRATEGY · FUNDING · GROWTH
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-3">
            The Bloomberg of Laundromats
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade platform combining business intelligence, marketplace, IoT POS, AI pricing, predictive maintenance, SEO powerhouse, and comprehensive education for the global laundry industry.
          </p>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Contact Column - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact Us</h3>
            
            {/* Contact Buttons - WhatsApp & SMS */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/${CONTACT_PHONE_DIGITS}?text=Hi%2C%20I%27m%20interested%20in%20learning%20more%20about%20WashBizHub`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center"
                data-testid="link-footer-whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-semibold">WhatsApp</span>
              </a>
              <a
                href={`sms:+${CONTACT_PHONE_DIGITS}`}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center border border-primary/30"
                data-testid="link-footer-sms"
              >
                <Phone className="h-4 w-4" />
                <span className="font-semibold">SMS</span>
              </a>
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
            <div className="flex gap-3 mt-4">
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
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors"
                data-testid="link-footer-linkedin"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-accent" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/10 hover:bg-primary/20 p-2 rounded-lg transition-colors"
                data-testid="link-footer-twitter"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5 text-accent" />
              </a>
            </div>
          </div>

          {/* Platform Features */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Platform</h3>
            <div className="space-y-2">
              <Link href="/design-studio">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-design-studio">
                  Design Studio 2D/3D
                </span>
              </Link>
              <Link href="/cleanbi">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-cleanbi">
                  CLEANBI™ Analysis
                </span>
              </Link>
              <Link href="/marketplace">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-marketplace">
                  Global Marketplace
                </span>
              </Link>
              <Link href="/ai-blogging">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-ai-blogging">
                  AI Blogging Suite
                </span>
              </Link>
              <Link href="/seo-optimizer">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-seo-optimizer">
                  SEO Optimizer
                </span>
              </Link>
            </div>
          </div>

          {/* Calculators & Tools */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Analytics</h3>
            <div className="space-y-2">
              <Link href="/equipment-diagnostics">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-diagnostics">
                  Equipment Diagnostics
                </span>
              </Link>
              <Link href="/valuation-calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-valuation">
                  Valuation Tool
                </span>
              </Link>
              <Link href="/roi-calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-roi-calculator">
                  ROI Calculator
                </span>
              </Link>
              <Link href="/cleanbi">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-cleanbi-footer">
                  CLEANBI Analysis
                </span>
              </Link>
              <Link href="/calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-calculator">
                  Revenue Calculator
                </span>
              </Link>
              <Link href="/funding-matcher">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-funding-matcher">
                  Funding Matcher
                </span>
              </Link>
              <Link href="/calculators">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-all-calculators">
                  All 50+ Tools
                </span>
              </Link>
            </div>
          </div>

          {/* Marketplace & Shopping */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Shop</h3>
            <div className="space-y-2">
              <Link href="/superstore">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-superstore">
                  Equipment Superstore
                </span>
              </Link>
              <Link href="/parts">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-parts">
                  Parts Marketplace
                </span>
              </Link>
              <Link href="/listings">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-listings">
                  Buy/Sell Laundromats
                </span>
              </Link>
              <Link href="/consultation">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-consultation">
                  Book Consultation
                </span>
              </Link>
              <Link href="/consultation-landing">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-consultation-services">
                  Expert Services
                </span>
              </Link>
            </div>
          </div>

          {/* Learning & Resources */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Learn</h3>
            <div className="space-y-2">
              <Link href="/courses">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-courses">
                  Premium Courses
                </span>
              </Link>
              <Link href="/book">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-book">
                  The Laundromat Bible
                </span>
              </Link>
              <Link href="/blog">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-blog">
                  Industry Blog
                </span>
              </Link>
              <Link href="/affiliate-blogs">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-financing-guides">
                  Financing Guides
                </span>
              </Link>
              <Link href="/resources">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-resources">
                  Resource Hub
                </span>
              </Link>
              <a
                href="https://facebook.com/groups/thelaundromat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleResourceClick('Facebook Community', 'https://facebook.com/groups/thelaundromat')}
                className="flex items-center gap-1 text-white/70 hover:text-accent transition-colors text-sm"
                data-testid="link-footer-facebook-group"
              >
                Facebook Community
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Recommended Partners Section */}
        <div className="border-t border-primary/20 pt-8 mb-8">
          <h3 className="text-white font-bold text-lg mb-6 text-center">
            🌟 Recommended Industry Partners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Facebook Group Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Facebook className="h-6 w-6 text-accent" />
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
                    className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold text-sm transition-colors"
                    data-testid="link-footer-facebook-card"
                  >
                    Join the Community
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* ATM Depot Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <ExternalLink className="h-6 w-6 text-accent" />
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
                    className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold text-sm transition-colors"
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
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Link href="/service-guy-ai">
                  <img 
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
                    2,800+ Error Codes
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

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-sm text-center md:text-left">
              © 2025 WashBizHub.com • The Bloomberg of Laundromats<br className="md:hidden" />
              <span className="hidden md:inline"> • </span>
              <span className="text-accent font-semibold">STRATEGY • FUNDING • GROWTH • AUTOMATION</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-white/60 text-sm">
              <Link href="/privacy">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-privacy">
                  Privacy Policy
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/terms">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-terms">
                  Terms of Service
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/pricing">
                <span className="hover:text-accent transition-colors cursor-pointer font-semibold" data-testid="link-footer-pricing">
                  View Pricing
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/about">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-about">
                  About Us
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/consultation">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-consultation">
                  Free Consultation
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <a href="mailto:info@washbizhub.com" className="hover:text-accent transition-colors" data-testid="link-footer-support">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
