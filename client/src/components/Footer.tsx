import { Link } from "wouter";
import { ExternalLink, Facebook, Linkedin, Twitter } from "lucide-react";
import { Advertisement } from "@/components/Advertisement";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

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
    <footer className="bg-[hsl(215,25%,16%)] py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Column - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoUrl} alt="WashBizHub" className="h-14" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              The Bloomberg of Laundromats
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Enterprise-grade platform combining business intelligence, marketplace, IoT POS, AI pricing, predictive maintenance, SEO powerhouse, and comprehensive education for the global laundry industry.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
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
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Calculators</h3>
            <div className="space-y-2">
              <Link href="/roi-calculator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-roi-calculator">
                  ROI Calculator
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
              <Link href="/locator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-locator">
                  Laundromat Locator
                </span>
              </Link>
              <Link href="/distributor-locator">
                <span className="block text-white/70 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-distributor-locator">
                  Distributor Locator
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
              © 2024 WashBizHub.com • The Bloomberg of Laundromats<br className="md:hidden" />
              <span className="hidden md:inline"> • </span>
              <span className="text-accent font-semibold">STRATEGY • FUNDING • GROWTH • AUTOMATION</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-white/60 text-sm">
              <Link href="/subscribe">
                <span className="hover:text-accent transition-colors cursor-pointer font-semibold" data-testid="link-footer-subscribe">
                  Go Pro $97/mo
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/facebook-group">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-community-page">
                  Community
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <Link href="/atm-services">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-atm-page">
                  ATM Solutions
                </span>
              </Link>
              <span className="text-white/30">|</span>
              <a href="mailto:support@washbizhub.com" className="hover:text-accent transition-colors" data-testid="link-footer-support">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
