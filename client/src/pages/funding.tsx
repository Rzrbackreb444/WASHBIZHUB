import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Building2, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { SEO } from '@/components/SEO';

const FUNDING_PARTNERS = [
  {
    name: 'MyPartner.io',
    category: 'Business Financing',
    description: 'Quick funding for laundromat equipment, buildouts, and expansion. Fast approval, flexible terms.',
    links: [
      {
        title: 'Business Financing',
        url: 'https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1',
        lang: 'English'
      },
      {
        title: 'Business Financing (Spanish)',
        url: 'https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1&lang=es',
        lang: 'Español'
      },
      {
        title: 'Referral Partner Program',
        url: 'https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1',
        lang: 'English'
      },
      {
        title: 'Referral Partner (Spanish)',
        url: 'https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1&lang=es',
        lang: 'Español'
      }
    ],
    badge: 'Featured Partner'
  },
  {
    name: 'South End Capital',
    category: 'Commercial Real Estate Financing',
    description: 'Specialized financing for commercial real estate, equipment purchases, and working capital.',
    links: [
      {
        title: 'Funding Options',
        url: 'https://southendcapital.com/?rp=RP020811&sub_id=Laundromat',
        lang: 'English'
      },
      {
        title: 'Partner Network',
        url: 'https://southendcapital.com/partners/?rp=RP020811&sub_id=Laundromat',
        lang: 'English'
      }
    ],
    badge: 'Top Lender'
  },
  {
    name: 'Preferred Funding Group',
    category: 'Equipment & Expansion Funding',
    description: 'Streamlined funding process for equipment purchases, renovations, and business expansion.',
    links: [
      {
        title: 'Application Portal',
        url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/',
        lang: 'English'
      }
    ],
    badge: 'Quick Approval'
  },
  {
    name: 'Advance Funds Network',
    category: 'Business Financing',
    description: 'Revenue-based financing for laundromat operations, equipment, and growth initiatives.',
    links: [
      {
        title: 'Application',
        url: 'https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3',
        lang: 'English'
      },
      {
        title: 'Partner Program',
        url: 'https://app.advancefundsnetwork.com/partner-landing/OEO602XAIiZkhill7WmMwJ7NEfB3',
        lang: 'English'
      }
    ],
    badge: 'Revenue-Based'
  },
  {
    name: 'David Allen Capital',
    category: 'Commercial Financing',
    description: 'Comprehensive financing solutions for established laundromat operators and multi-unit owners.',
    links: [
      {
        title: 'Partner Access',
        url: 'https://davidallewncapital.com/nicholaskremers',
        lang: 'English'
      }
    ],
    badge: 'Enterprise Financing'
  }
];

const REQUIREMENTS = [
  {
    category: 'Business Requirements',
    items: [
      'Active business license and proof of operation (last 2 years)',
      'Business formation documents (LLC, Corp, Sole Prop)',
      'Owner identification and personal credit check (680+ FICO)',
      'Proof of ownership/management of laundromat(s)'
    ]
  },
  {
    category: 'Financial Requirements',
    items: [
      'Last 2 years of business tax returns (personal & business)',
      'Last 6 months of bank statements',
      'Profit & Loss statements from last 24 months',
      'Personal financial statement (net worth > $50K typically required)',
      'Minimum monthly revenue: $5,000+ (varies by lender)'
    ]
  },
  {
    category: 'Equipment & Real Estate (if included)',
    items: [
      'Equipment list with serial numbers and condition',
      'Property lease or deed (if owned)',
      'Proof of insurance on existing equipment',
      'Recent photos of laundromat facility'
    ]
  },
  {
    category: 'Affiliate Requirements',
    items: [
      'Active WashBizHub account (free tier available)',
      'Verified business information and CLEANBI score',
      'Active participation in marketplace (min. 1 listing or product)',
      'Commitment to refer qualified applicants to partners',
      'Compliance with all partner program guidelines'
    ]
  }
];

export default function Funding() {
  return (
    <>
      <SEO
        title="Laundromat Funding & Business Financing | Commercial Real Estate Loans"
        description="Access to $5M+ in funding through our network of specialized lenders. Equipment financing, commercial real estate loans, and working capital for laundromat owners."
        canonicalUrl="/funding"
        keywords={['laundromat financing', 'business loans', 'equipment financing', 'commercial real estate', 'funding options', 'SBA loans', 'business capital']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16 border-b border-blue-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Funding & Financing</h1>
            </div>
            <p className="text-xl text-blue-200">
              Access $5M+ in funding through our network of specialized lenders. Equipment, real estate, and working capital financing for laundromat operators.
            </p>
            <Badge className="mt-6 bg-blue-500/30 text-blue-100 border-blue-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Affiliate Lender Network
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* Quick Links */}
          <div className="grid md:grid-cols-5 gap-4 mb-12">
            <Link href="/startup-funding">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-quick-startup">
                <CardHeader>
                  <CardTitle className="text-base">Startup Funding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">Launch first laundromat.</p>
                  <Badge className="bg-orange-500/20 text-orange-600 text-xs">$5K-$250K</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/equipment-financing">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-quick-equipment">
                <CardHeader>
                  <CardTitle className="text-base">Equipment Financing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">Finance washers, dryers, systems.</p>
                  <Badge className="bg-blue-500/20 text-blue-600 text-xs">$5K-$500K</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/real-estate-financing">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-quick-realtor">
                <CardHeader>
                  <CardTitle className="text-base">Real Estate Financing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">Purchase or refinance property.</p>
                  <Badge className="bg-emerald-500/20 text-emerald-600 text-xs">$50K-$2M+</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/working-capital-financing">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-quick-working">
                <CardHeader>
                  <CardTitle className="text-base">Working Capital</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">Fund operations and growth.</p>
                  <Badge className="bg-purple-500/20 text-purple-600 text-xs">$10K-$500K</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/acquisitions-funding">
              <Card className="hover-elevate cursor-pointer h-full" data-testid="card-quick-acquisitions">
                <CardHeader>
                  <CardTitle className="text-base">Acquisitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">Multi-unit expansion.</p>
                  <Badge className="bg-slate-500/20 text-slate-600 text-xs">$100K-$5M+</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Featured Partners */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Featured Funding Partners</h2>
            <div className="space-y-4">
              {FUNDING_PARTNERS.map((partner, idx) => (
                <Card key={idx} className="hover-elevate" data-testid={`card-partner-${idx}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl">{partner.name}</CardTitle>
                        <CardDescription>{partner.category}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/20 text-green-600">
                        {partner.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{partner.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {partner.links.map((link, linkIdx) => (
                        <a key={linkIdx} href={link.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full" data-testid={`button-partner-link-${idx}-${linkIdx}`}>
                            {link.title}
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: 1, title: 'Apply', desc: 'Submit application through partner portal (5-10 min)' },
                { step: 2, title: 'Verify', desc: 'Our partners verify business & financial documents' },
                { step: 3, title: 'Approve', desc: 'Receive funding decision (24-72 hours typically)' },
                { step: 4, title: 'Fund', desc: 'Receive funds via ACH or wire transfer' }
              ].map(item => (
                <Card key={item.step}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Funding Tabs */}
          <div>
            <h2 className="text-3xl font-bold mb-8">What Can Be Financed</h2>
            <Tabs defaultValue="equipment" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
                <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
              </TabsList>

              <TabsContent value="equipment" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Financing</CardTitle>
                    <CardDescription>NEW & USED EQUIPMENT PURCHASES</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Commercial washers & dryers (Speed Queen, Huebsch, Dexter)',
                      'Coin and card payment systems',
                      'Folding tables, carts, and fixtures',
                      'Dog wash stations and grooming equipment',
                      'Laundry soap/detergent dispensers',
                      'IoT sensors and smart monitoring systems'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="real-estate" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Commercial Real Estate Financing</CardTitle>
                    <CardDescription>PROPERTY ACQUISITION & RENOVATION</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Purchase existing laundromat businesses',
                      'Lease-to-own arrangements',
                      'Commercial property buildout & renovation',
                      'Real estate refinancing',
                      'Multi-unit portfolio expansion',
                      'Build-out financing for new locations'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="working-capital" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Working Capital & Operations</CardTitle>
                    <CardDescription>BUSINESS GROWTH & OPERATIONS FUNDING</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      'Inventory & supply purchases',
                      'Marketing & customer acquisition',
                      'Staffing & payroll funding',
                      'Utility & operational expenses',
                      'Technology & software subscriptions',
                      'Maintenance & preventive upgrades'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Requirements */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Minimum Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {REQUIREMENTS.map((req, idx) => (
                <Card key={idx} data-testid={`card-requirement-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{req.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {req.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex gap-2 text-sm">
                          <span className="text-primary font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-900 to-emerald-900 text-white rounded-lg p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Grow?</h2>
            <p className="mb-6 text-lg max-w-2xl mx-auto">
              Start with one location or build a multi-unit empire. Our funding partners are ready to support your growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {FUNDING_PARTNERS.slice(0, 2).map((partner, idx) => (
                <a key={idx} href={partner.links[0].url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-green-900 hover:bg-green-50" data-testid={`button-apply-${idx}`}>
                    Apply with {partner.name.split(' ')[0]}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
