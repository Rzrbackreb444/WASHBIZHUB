import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

export function Footer() {
  const handleResourceClick = (resourceName: string, url: string) => {
    window.gtag?.('event', 'footer_resource_click', {
      event_category: 'Footer Navigation',
      event_label: resourceName,
      value: url
    });
  };

  return (
    <footer className="bg-black py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoUrl} alt="WashBizHub" className="h-12" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              The Bloomberg of Laundromats. Enterprise-grade platform for owners, investors, and operators.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link href="/design-studio">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-design-studio">
                  Design Studio
                </span>
              </Link>
              <Link href="/cleanbi">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-cleanbi">
                  CLEANBI™ Analysis
                </span>
              </Link>
              <Link href="/marketplace">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-marketplace">
                  Marketplace
                </span>
              </Link>
              <Link href="/courses">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-courses">
                  Courses
                </span>
              </Link>
              <Link href="/blog">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-blog">
                  Blog
                </span>
              </Link>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-bold mb-4">Tools</h3>
            <div className="space-y-2">
              <Link href="/roi-calculator">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-roi-calculator">
                  ROI Calculator
                </span>
              </Link>
              <Link href="/funding-matcher">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-funding-matcher">
                  Funding Matcher
                </span>
              </Link>
              <Link href="/locator">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-locator">
                  Laundromat Locator
                </span>
              </Link>
              <Link href="/superstore">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-superstore">
                  Equipment Superstore
                </span>
              </Link>
            </div>
          </div>

          {/* Recommended Resources */}
          <div>
            <h3 className="text-white font-bold mb-4">Recommended Resources</h3>
            <div className="space-y-2">
              <Link href="/facebook-group">
                <span className="flex items-center gap-1 text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-facebook-group">
                  Join Facebook Group
                  <ExternalLink className="h-3 w-3" />
                </span>
              </Link>
              <Link href="/atm-services">
                <span className="flex items-center gap-1 text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-atm-services">
                  ATM Services
                  <ExternalLink className="h-3 w-3" />
                </span>
              </Link>
              <Link href="/distributor-locator">
                <span className="block text-white/60 hover:text-accent transition-colors cursor-pointer text-sm" data-testid="link-footer-distributor-locator">
                  Find Distributors
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-sm">
              © 2024 WashBizHub.com • STRATEGY • FUNDING • GROWTH
            </div>
            <div className="flex gap-6 text-white/60 text-sm">
              <Link href="/subscribe">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-pro">
                  Go Pro
                </span>
              </Link>
              <a 
                href="https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleResourceClick('Facebook Group Direct', 'https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry')}
                className="hover:text-accent transition-colors"
                data-testid="link-footer-facebook-direct"
              >
                Community
              </a>
              <a
                href="https://atmdepot.com/laundromat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleResourceClick('ATM Depot Direct', 'https://atmdepot.com/laundromat')}
                className="hover:text-accent transition-colors"
                data-testid="link-footer-atm-direct"
              >
                ATM Solutions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
