import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Zap, Users, Target, Globe } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function AboutUs() {
  return (
    <>
      <SEO
        title="About WashBizHub | Modernizing the Laundromat Industry"
        description="WashBizHub is the #1 laundromat resource hub. Complete SaaS platform for POS, IoT, analytics, and business intelligence."
        canonicalUrl="/about-us"
        keywords={['laundromat software', 'business intelligence', 'POS system', 'IoT monitoring', 'industry platform']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary/5 py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl font-bold mb-4 text-foreground">About WashBizHub</h1>
            <p className="text-xl text-muted-foreground">
              The #1 Laundromat Resource Hub. We're modernizing the $40B laundromat industry through enterprise software, IoT integration, and business intelligence.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                To empower laundromat operators with enterprise-grade tools that drive profitability, optimize operations, and transform the industry.
              </p>
              <p className="text-muted-foreground mb-6">
                Founded on the principle that laundromats deserve the same level of sophistication as any other business, WashBizHub combines cutting-edge technology with deep industry expertise.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Enterprise-grade SaaS platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground">72,000+ laundromat owners served</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Global reach, local expertise</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-12 aspect-square flex items-center justify-center border border-border">
              <div className="text-center">
                <Zap className="w-24 h-24 mx-auto text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Transforming the laundromat industry</p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-foreground">Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We deliver enterprise-grade quality in everything we build. No shortcuts, maximum ambition.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We succeed when our customers succeed. Building a thriving ecosystem of laundromat operators.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Innovation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Continuously pushing boundaries with AI, IoT, and advanced analytics to drive industry transformation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Platform Features */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-foreground">Platform Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">POS System</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Per-pound pricing, real-time settlements, scale integration, multi-location support with Stripe integration.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">IoT & Diagnostics</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Real-time machine monitoring, predictive maintenance, sensor alerts, and 2,100+ diagnostic codes.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Route Optimization</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Pickup/delivery logistics with Google Maps integration, GPS tracking, and multi-stop optimization.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Consultant</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Multi-model AI (OpenAI, Anthropic, Gemini), trained on industry data, 24/7 expert guidance.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Professional D3.js visualizations, materialized views, revenue analytics, performance tracking.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Website Builder</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  WYSIWYG editor, SEO automation, Google Search Console integration, custom domains.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 py-12 border-t border-b border-border">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">72K+</div>
              <p className="text-muted-foreground">Laundromat Owners</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Business Listings</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$2B+</div>
              <p className="text-muted-foreground">Facilitated Volume</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Interactive Calculators</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-muted/30 rounded-lg p-12 text-center border border-border">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Get In Touch</h2>
            <p className="mb-6 text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/consultant-inquiry">
                <Button data-testid="button-contact">
                  Contact Us
                </Button>
              </Link>
              <a href="mailto:info@washbizhub.com">
                <Button variant="outline" data-testid="button-email">
                  Send Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
