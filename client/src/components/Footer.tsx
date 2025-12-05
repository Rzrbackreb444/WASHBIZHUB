import { Link } from "wouter";
import { ExternalLink, Facebook, Mail, Package, ShoppingCart, BookOpen, CreditCard, Sparkles, Wrench, Calculator, DollarSign, MapPin, Palette, GraduationCap, HelpCircle, Phone, Building2 } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LazyImage } from "@/components/LazyImage";
import logoUrl from "@assets/6_1764040628012.png";
import cityBgImage from "@assets/stock_images/modern_city_skyline__f719cb12.jpg";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "consult@washbizhub.com";
const CONTACT_PHONE = "(479) 883-4314";

const productsLinks = [
  { href: "/cleanbi-explorer", label: "CLEANBI™ Explorer", testId: "link-footer-cleanbi-explorer", icon: MapPin, featured: true },
  { href: "/valuation-calculator", label: "Valuation Suite", testId: "link-footer-valuation-suite", icon: Calculator },
  { href: "/design-studio-pro", label: "Design Studio", testId: "link-footer-design-studio", icon: Palette },
  { href: "/service-guy-ai", label: "Service Guy AI", testId: "link-footer-service-guy-ai", icon: Wrench },
];

const marketplaceLinks = [
  { href: "/laundromat-listings", label: "Buy/Sell Laundromats", testId: "link-footer-buy-sell-laundromats" },
  { href: "/equipment-marketplace", label: "Equipment Marketplace", testId: "link-footer-equipment-marketplace" },
  { href: "/directory", label: "Vendor Directory", testId: "link-footer-vendor-directory" },
  { href: "/sell", label: "Sell Your Business", testId: "link-footer-sell-business" },
];

const resourcesLinks = [
  { href: "/courses", label: "Premium Courses", testId: "link-footer-premium-courses", icon: GraduationCap },
  { href: "/book", label: "The Laundromat Bible", testId: "link-footer-laundromat-bible", icon: BookOpen },
  { href: "/blog", label: "Industry Blog", testId: "link-footer-industry-blog" },
  { href: "/resources", label: "Resource Hub", testId: "link-footer-resource-hub" },
  { href: "/help-center", label: "Help Center", testId: "link-footer-help-center", icon: HelpCircle },
];

const pricingLinks = [
  { href: "/pricing", label: "View Plans", testId: "link-footer-pricing" },
  { href: "/pricing#compare", label: "Compare Features", testId: "link-footer-compare-features" },
  { href: "/referral-program", label: "Referral Program", testId: "link-footer-referral-program", icon: DollarSign },
  { href: "/funding-matcher", label: "Funding Matcher", testId: "link-footer-funding-matcher" },
];

export function Footer() {
  return (
    <footer className="relative py-12 border-t border-[hsl(45,38%,59%)/30]" data-testid="footer-main">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${cityBgImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#152238] to-[#0f1d30]" aria-hidden="true" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 10% 90%, rgba(200, 166, 97, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 90% 70%, rgba(184, 134, 11, 0.1) 0%, transparent 50%)
          `
        }}
        aria-hidden="true"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        
        {/* Logo & Tagline Section */}
        <div className="text-center mb-10 pb-8 border-b border-white/10">
          <LazyImage 
            src={logoUrl} 
            alt="WashBizHub - The #1 Laundromat Resource" 
            className="h-20 sm:h-24 w-auto mx-auto mb-4" 
            width={200}
            height={96}
            data-testid="img-footer-logo"
          />
          <p className="text-[hsl(45,38%,59%)] text-sm font-medium tracking-wider mb-2">
            LISTINGS · EQUIPMENT · EDUCATION · VALUATIONS
          </p>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            The #1 resource for laundromat owners, operators, and investors in a booming $5B industry.
          </p>
          <p className="text-teal-400/80 text-xs mt-2 font-medium">
            Everyone wants to own a laundromat. We help you find the right one.
          </p>
        </div>

        {/* Trust Stats - Eastern Funding Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 pb-8 border-b border-white/10">
          <div className="text-center p-4" data-testid="stat-community">
            <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">72K+</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Community Members</div>
          </div>
          <div className="text-center p-4" data-testid="stat-analyses">
            <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">50K+</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">CLEANBI Analyses</div>
          </div>
          <div className="text-center p-4" data-testid="stat-funding">
            <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">$500M+</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Funding Facilitated</div>
          </div>
          <div className="text-center p-4" data-testid="stat-industry">
            <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">50+ Yrs</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Industry Experience</div>
          </div>
        </div>

        {/* Main Navigation Grid - 4 columns matching nav pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Products
            </h3>
            <ul className="space-y-2">
              {productsLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span 
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer text-sm ${
                        link.featured 
                          ? "text-[hsl(45,38%,59%)] font-medium" 
                          : "text-white/70 hover:text-[hsl(45,38%,59%)]"
                      }`}
                      data-testid={link.testId}
                    >
                      {link.icon && <link.icon className="h-3 w-3" />}
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Marketplace
            </h3>
            <ul className="space-y-2">
              {marketplaceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span 
                      className="text-white/70 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer text-sm block"
                      data-testid={link.testId}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Resources
            </h3>
            <ul className="space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span 
                      className="flex items-center gap-1.5 text-white/70 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer text-sm"
                      data-testid={link.testId}
                    >
                      {link.icon && <link.icon className="h-3 w-3" />}
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Pricing
            </h3>
            <ul className="space-y-2">
              {pricingLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span 
                      className="flex items-center gap-1.5 text-white/70 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer text-sm"
                      data-testid={link.testId}
                    >
                      {link.icon && <link.icon className="h-3 w-3" />}
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact, Social & Newsletter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-8 border-b border-white/10">
          
          {/* Contact */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Contact
            </h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/70 hover:text-[hsl(45,38%,59%)] transition-colors text-sm"
              data-testid="link-footer-email"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Community
            </h3>
            <a
              href="https://facebook.com/groups/thelaundromat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/70 hover:text-[hsl(45,38%,59%)] transition-colors text-sm"
              data-testid="link-footer-facebook-social"
            >
              <Facebook className="h-4 w-4" />
              Join 72K+ Owners
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Newsletter
            </h3>
            <div className="w-full max-w-xs">
              <NewsletterSignup variant="compact" source="footer" />
            </div>
          </div>
        </div>

        {/* Legal Links Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 text-sm">
          <Link href="/privacy">
            <span className="text-white/50 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-privacy">
              Privacy Policy
            </span>
          </Link>
          <span className="text-white/20">·</span>
          <Link href="/terms">
            <span className="text-white/50 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-terms">
              Terms of Service
            </span>
          </Link>
          <span className="text-white/20">·</span>
          <Link href="/about-us">
            <span className="text-white/50 hover:text-[hsl(45,38%,59%)] transition-colors cursor-pointer" data-testid="link-footer-accessibility">
              Accessibility
            </span>
          </Link>
          <span className="text-white/20">·</span>
          <a 
            href="/sitemap.xml"
            className="text-white/50 hover:text-[hsl(45,38%,59%)] transition-colors"
            data-testid="link-footer-sitemap"
          >
            Sitemap
          </a>
        </div>

        {/* Funding Link (Less Prominent) */}
        <div className="text-center mb-6">
          <a 
            href="https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-[hsl(45,38%,59%)] transition-colors text-xs"
            data-testid="link-footer-startup-funding"
          >
            <DollarSign className="h-3 w-3" />
            Startup Funding Available — Up to $500K
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-white/40 text-xs">
            © 2025 WashBizHub.com · All Rights Reserved
          </p>
          <p className="text-white/30 text-xs mt-1">
            WashBizHub™ and CLEANBI™ are trademarks of WashBizHub, LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
