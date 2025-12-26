import { SeoHead } from "@/components/SeoHead";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Store,
  BookOpen,
  GraduationCap,
  Calculator,
  Zap,
  BarChart3,
  MessageSquare,
  Wrench,
  TrendingUp,
} from "lucide-react";

interface LandingItem {
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
}

const LANDING_PAGES: LandingItem[] = [
  {
    title: "Laundromat Marketplace",
    description: "Buy & sell verified, profitable laundromats with CLEANBI scoring",
    icon: Store,
    path: "/marketplace-landing",
    color: "primary",
  },
  {
    title: "POS System",
    description: "Modern cloud-based POS with per-pound pricing & IoT integration",
    icon: Zap,
    path: "/pos-landing",
    color: "accent",
  },
  {
    title: "Premium Courses",
    description: "Interactive learning with certificates and lifetime access",
    icon: GraduationCap,
    path: "/courses-landing",
    color: "green",
  },
  {
    title: "The Laundromat Bible",
    description: "13 chapters of proven strategies and operational playbooks",
    icon: BookOpen,
    path: "/book",
    color: "purple",
  },
  {
    title: "CLEANBI Calculator",
    description: "17-factor scoring system for laundromat viability",
    icon: Calculator,
    path: "/cleanbi",
    color: "blue",
  },
  {
    title: "TPD Calculator",
    description: "Turns per day analysis with Monte Carlo simulation",
    icon: BarChart3,
    path: "/calculators",
    color: "indigo",
  },
  {
    title: "ROI Calculator",
    description: "Multi-year financial projections and sensitivity analysis",
    icon: TrendingUp,
    path: "/roi-calculator",
    color: "cyan",
  },
  {
    title: "Equipment Marketplace",
    description: "Buy and sell new/used commercial laundromat equipment",
    icon: Wrench,
    path: "/equipment",
    color: "orange",
  },
  {
    title: "AI Consultant",
    description: "Chat with AI trained on laundromat expertise and diagnostics",
    icon: MessageSquare,
    path: "/",
    color: "pink",
  },
];

export default function LandingsHub() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WashBizHub Landing Pages",
    description: "SEO-optimized landing pages for every aspect of the laundromat business",
    url: "https://washbizhub.com/landings",
  };

  return (
    <>
      <SeoHead
        title="Landing Pages - WashBizHub Platform"
        description="Explore all SEO-optimized landing pages: marketplace, POS system, courses, calculators, equipment, and AI consultant. Everything you need for laundromat success."
        keywords={[
          "laundromat landing pages",
          "SEO optimized pages",
          "laundromat tools",
          "business resources",
        ]}
        canonical="https://washbizhub.com/landings"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 py-12">
            <h1 className="text-5xl md:text-6xl font-bold">
              Landing Pages Directory
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every tool, feature, and resource on WashBizHub has its own SEO-optimized landing page
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_PAGES.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.path} href={page.path}>
                  <Card className="hover-elevate h-full cursor-pointer transition-all">
                    <CardHeader>
                      <Icon className="w-8 h-8 text-primary mb-2" />
                      <CardTitle>{page.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {page.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* SEO Info */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-bold">SEO-Optimized for Every Topic</h2>
            <p className="text-muted-foreground">
              All landing pages are fully SEO-optimized with:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-sm">
              <li>✓ Unique meta tags and descriptions</li>
              <li>✓ Structured data (Schema.org markup)</li>
              <li>✓ Open Graph tags for social sharing</li>
              <li>✓ Keyword optimization</li>
              <li>✓ Internal linking strategy</li>
              <li>✓ Mobile-responsive design</li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">{LANDING_PAGES.length}</p>
                <p className="text-muted-foreground mt-2">Landing Pages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">100%</p>
                <p className="text-muted-foreground mt-2">SEO Optimized</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">∞</p>
                <p className="text-muted-foreground mt-2">Scalable</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
