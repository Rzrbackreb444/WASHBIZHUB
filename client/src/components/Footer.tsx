import { Link } from "wouter";
import { ExternalLink, Facebook, Mail, Calculator, ShoppingCart, GraduationCap, BarChart3, Layout, BookOpen, Wrench, DollarSign } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LazyImage } from "@/components/LazyImage";
import logoUrl from "@assets/6_1764040628012.png";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "consult@washbizhub.com";

const platformLinks = [
  { href: "/cleanbi-explorer", label: "CLEANBI™ Explorer", testId: "link-footer-cleanbi-explorer" },
  { href: "/cleanbi-auto", label: "Quick Score", testId: "link-footer-cleanbi-auto" },
  { href: "/score-history", label: "Score History", testId: "link-footer-score-history" },
  { href: "/design-studio-pro", label: "Design Studio", testId: "link-footer-design-studio" },
  { href: "/service-guy-ai", label: "Service Guy AI", testId: "link-footer-service-guy-ai", icon: Wrench },
  { href: "/calculators", label: "All Calculators", testId: "link-footer-all-calculators", icon: Calculator },
  { href: "/referral-program", label: "Referral Program", testId: "link-footer-referral-program", icon: DollarSign },
];

const marketplaceLinks = [
  { href: "/laundromat-listings", label: "Buy/Sell Laundromats", testId: "link-footer-buy-sell-laundromats" },
  { href: "/equipment-marketplace", label: "Equipment Marketplace", testId: "link-footer-equipment-marketplace" },
  { href: "/directory", label: "Vendor Directory", testId: "link-footer-vendor-directory" },
  { href: "/sell", label: "Sell Your Business", testId: "link-footer-sell-business" },
];

const analyticsLinks = [
  { href: "/valuation-calculator", label: "Valuation Calculator", testId: "link-footer-valuation-calculator" },
  { href: "/roi-calculator", label: "ROI Calculator", testId: "link-footer-roi-calculator" },
  { href: "/calculator", label: "Revenue Calculator", testId: "link-footer-revenue-calculator" },
  { href: "/funding-matcher", label: "Funding Matcher", testId: "link-footer-funding-matcher" },
];

const educationLinks = [
  { href: "/courses", label: "Premium Courses", testId: "link-footer-premium-courses" },
  { href: "/book", label: "The Laundromat Bible", testId: "link-footer-laundromat-bible", icon: BookOpen },
  { href: "/blog", label: "Industry Blog", testId: "link-footer-industry-blog" },
  { href: "/resources", label: "Resource Hub", testId: "link-footer-resource-hub" },
  { href: "/help-center", label: "Help Center", testId: "link-footer-help-center" },
];

export function Footer() {
  return (
    <footer className="bg-[hsl(215,25%,16%)] py-12 border-t border-[hsl(45,38%,59%)/30]" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4">
        
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

        {/* Main Navigation Grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          {/* Platform Tools */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layout className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Platform
            </h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
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

          {/* Analytics */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Analytics
            </h3>
            <ul className="space-y-2">
              {analyticsLinks.map((link) => (
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

          {/* Education */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[hsl(45,38%,59%)]" />
              Education
            </h3>
            <ul className="space-y-2">
              {educationLinks.map((link) => (
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
