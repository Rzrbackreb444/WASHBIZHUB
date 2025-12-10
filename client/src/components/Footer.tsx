import { Link } from "wouter";
import { ExternalLink, Facebook, Twitter, MapPin, Building2 } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LazyImage } from "@/components/LazyImage";
import logoUrl from "@assets/6_1764040628012.png";
import nycSkyline from "@assets/City_Lights_54_1765330986805.png";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "consult@washbizhub.com";

const productsLinks = [
  { href: "/cleanbi-explorer", label: "CLEANBI™ Explorer", testId: "link-footer-cleanbi-explorer", featured: true },
  { href: "/design-studio-pro", label: "Design Studio", testId: "link-footer-design-studio" },
  { href: "/service-guy-ai", label: "Service Guy AI", testId: "link-footer-service-guy-ai" },
];

const calculatorLinks = [
  { href: "/calculators", label: "Calculator Suite", testId: "link-footer-calculators", featured: true },
  { href: "/valuation-calculator", label: "Valuation Calculator", testId: "link-footer-valuation" },
  { href: "/roi-calculator", label: "ROI Calculator", testId: "link-footer-roi" },
  { href: "/loan-calculator", label: "Loan Calculator", testId: "link-footer-loan" },
  { href: "/utility-calculator", label: "Utility Costs", testId: "link-footer-utility" },
];

const marketplaceLinks = [
  { href: "/equipment", label: "Equipment Hub", testId: "link-footer-equipment-hub", featured: true },
  { href: "/buy-laundromat", label: "Buy a Laundromat", testId: "link-footer-buy-laundromat" },
  { href: "/sell-your-laundromat", label: "Sell Your Business", testId: "link-footer-sell-business" },
  { href: "/equipment-financing", label: "Equipment Financing", testId: "link-footer-equipment-financing" },
  { href: "/directory", label: "Vendor Directory", testId: "link-footer-vendor-directory" },
];

const resourcesLinks = [
  { href: "/forum", label: "Community Forum", testId: "link-footer-forum", featured: true },
  { href: "/blog", label: "Blog", testId: "link-footer-blog" },
  { href: "/courses", label: "Courses", testId: "link-footer-courses" },
  { href: "/book", label: "The Laundromat Bible", testId: "link-footer-laundromat-bible" },
];

const companyLinks = [
  { href: "/larry-larsen", label: "Consult with Larry", testId: "link-footer-larry", featured: true },
  { href: "/pricing", label: "Pricing", testId: "link-footer-pricing" },
  { href: "/brokers", label: "Brokers", testId: "link-footer-brokers" },
  { href: "/our-partnership", label: "About Us", testId: "link-footer-about" },
  { href: "/feedback", label: "Feedback & Suggestions", testId: "link-footer-feedback" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border" data-testid="footer-main">
      {/* Navy gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e4a] to-[#0f1d30]" aria-hidden="true" />
      
      <div className="relative z-10">
        {/* Trust Stats Bar */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div data-testid="stat-community">
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">72K+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Community</div>
              </div>
              <div data-testid="stat-analyses">
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">50K+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Analyses</div>
              </div>
              <div data-testid="stat-funding">
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">$500M+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Funding</div>
              </div>
              <div data-testid="stat-experience">
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">50+ Yrs</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <LazyImage 
                src={logoUrl} 
                alt="WashBizHub" 
                className="h-12 w-auto mb-4" 
                width={120}
                height={48}
                data-testid="img-footer-logo"
              />
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                The #1 resource for laundromat owners and investors.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://facebook.com/groups/thelaundromat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/60 hover:text-[#C8A661] transition-colors text-sm"
                  data-testid="link-footer-facebook-group"
                >
                  <Facebook className="h-4 w-4" />
                  Join 72K+ Community
                </a>
                <div className="flex items-center gap-3">
                  <a
                    href="https://facebook.com/washbizhub1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white/60 hover:text-[#C8A661] transition-colors"
                    data-testid="link-footer-facebook-page"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href="https://twitter.com/washbizhub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white/60 hover:text-[#C8A661] transition-colors"
                    data-testid="link-footer-twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Products</h3>
              <ul className="space-y-2.5">
                {productsLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span 
                        className={`text-sm cursor-pointer transition-colors ${
                          link.featured 
                            ? "text-[#C8A661] hover:text-[#d4a030]" 
                            : "text-white/60 hover:text-white"
                        }`}
                        data-testid={link.testId}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calculators */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Calculators</h3>
              <ul className="space-y-2.5">
                {calculatorLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span 
                        className={`text-sm cursor-pointer transition-colors ${
                          link.featured 
                            ? "text-[#C8A661] hover:text-[#d4a030]" 
                            : "text-white/60 hover:text-white"
                        }`}
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
              <h3 className="text-white font-semibold text-sm mb-4">Marketplace</h3>
              <ul className="space-y-2.5">
                {marketplaceLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span 
                        className={`text-sm cursor-pointer transition-colors ${
                          link.featured 
                            ? "text-[#C8A661] hover:text-[#d4a030]" 
                            : "text-white/60 hover:text-white"
                        }`}
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
              <h3 className="text-white font-semibold text-sm mb-4">Resources</h3>
              <ul className="space-y-2.5">
                {resourcesLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span 
                        className={`text-sm cursor-pointer transition-colors ${
                          link.featured 
                            ? "text-[#C8A661] hover:text-[#d4a030]" 
                            : "text-white/60 hover:text-white"
                        }`}
                        data-testid={link.testId}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span 
                        className={`text-sm cursor-pointer transition-colors ${
                          link.featured 
                            ? "text-[#C8A661] hover:text-[#d4a030]" 
                            : "text-white/60 hover:text-white"
                        }`}
                        data-testid={link.testId}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Row */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Stay Updated</h3>
                <p className="text-white/50 text-sm">Get industry insights and deals.</p>
              </div>
              <div className="w-full md:w-auto md:min-w-[320px]">
                <NewsletterSignup variant="compact" source="footer" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/50 hover:text-[#C8A661] transition-colors text-sm"
              data-testid="link-footer-email"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/privacy">
                <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer" data-testid="link-footer-privacy">
                  Privacy
                </span>
              </Link>
              <Link href="/terms">
                <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer" data-testid="link-footer-terms">
                  Terms
                </span>
              </Link>
              <Link href="/legal-disclaimer">
                <span className="text-white/40 hover:text-white/70 transition-colors cursor-pointer" data-testid="link-footer-legal-disclaimer">
                  Legal Disclaimer
                </span>
              </Link>
              <a 
                href="/sitemap.xml"
                className="text-white/40 hover:text-white/70 transition-colors"
                data-testid="link-footer-sitemap"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>

        {/* NYC Skyline Enterprise Banner */}
        <div className="relative h-32 md:h-40 overflow-hidden border-t border-white/10">
          <img 
            src={nycSkyline} 
            alt="Nationwide coverage across major cities" 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1d30]/95 via-[#0f1d30]/80 to-[#0f1d30]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d30] via-transparent to-[#0f1d30]/90" />
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-[#C8A661]" />
                <span className="text-[#C8A661] font-semibold tracking-wide text-sm uppercase">Enterprise Coverage</span>
                <Building2 className="h-5 w-5 text-[#C8A661]" />
              </div>
              <p className="text-white/70 text-sm max-w-xl">
                Serving <span className="text-[#C8A661] font-bold">72,000+</span> laundromat professionals across{" "}
                <span className="text-[#C8A661] font-bold">220+ countries</span> with enterprise-grade tools
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-white/40 text-xs leading-relaxed" data-testid="text-legal-disclaimer">
                <strong className="text-white/50">Disclaimer:</strong> All calculators, valuation tools, CLEANBI scores, 
                and business analysis provided on WashBizHub are for informational and educational purposes only. 
                They do not constitute financial, legal, or professional advice. Results are estimates based on 
                user inputs and publicly available data. Always consult qualified professionals (accountants, attorneys, 
                business brokers, and appraisers) before making business decisions. WashBizHub makes no guarantees 
                regarding accuracy, completeness, or suitability for any purpose. Use at your own risk.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-white/30 text-xs">
              © 2025 WashBizHub. All rights reserved. WashBizHub™ and CLEANBI™ are trademarks.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
