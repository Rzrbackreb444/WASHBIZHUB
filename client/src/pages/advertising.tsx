import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { SEO } from '@/components/SEO';

const AD_PACKAGES = [
  {
    id: 'banner-starter',
    name: 'Banner - Starter',
    type: 'Homepage Banner',
    placement: 'Top of homepage',
    duration: 'Monthly',
    price: 299,
    impressions: '50K+',
    ctr: '2.5%',
    features: ['Static banner', 'Homepage placement', 'Basic analytics', 'Monthly billing'],
  },
  {
    id: 'banner-premium',
    name: 'Banner - Premium',
    type: 'Homepage Banner',
    placement: 'Above the fold',
    duration: 'Monthly',
    price: 599,
    impressions: '100K+',
    ctr: '3.8%',
    features: ['Animated banner', 'Premium above-fold placement', 'Advanced analytics', 'Monthly billing'],
    popular: true,
  },
  {
    id: 'logo-marketplace',
    name: 'Logo - Marketplace Featured',
    type: 'Vendor Logo',
    placement: 'Vendor directory',
    duration: 'Quarterly',
    price: 449,
    impressions: '25K+',
    ctr: '4.2%',
    features: ['Featured vendor logo', 'Directory placement', 'Click tracking', '3-month commitment'],
  },
  {
    id: 'logo-homepage',
    name: 'Logo - Homepage Partner',
    type: 'Vendor Logo',
    placement: 'Homepage partners section',
    duration: 'Quarterly',
    price: 799,
    impressions: '75K+',
    ctr: '5.1%',
    features: ['Homepage partner logo', 'Premium visibility', 'Full analytics', '3-month minimum'],
    popular: true,
  },
  {
    id: 'calculator-sponsored',
    name: 'Sponsored Calculator',
    type: 'Calculator Sponsorship',
    placement: 'Calculator results page',
    duration: 'Monthly',
    price: 899,
    impressions: '30K+',
    ctr: '6.2%',
    features: ['Calculator tool sponsorship', 'Results page placement', 'Conversion tracking', 'Monthly billing'],
  },
  {
    id: 'course-featured',
    name: 'Course - Featured Ad',
    type: 'Course Promotion',
    placement: 'Courses hub',
    duration: 'Quarterly',
    price: 1199,
    impressions: '40K+',
    ctr: '7.1%',
    features: ['Featured course card', 'Homepage course section', 'Enrollment tracking', '3-month commitment'],
  },
];

export default function Advertising() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  return (
    <>
      <SEO
        title="Advertise on WashBizHub | Reach Laundromat Owners | Ad Packages"
        description="Connect with 72,000+ laundromat owners, operators, and investors. Banner ads, logo placements, calculator sponsorships, and more."
        canonicalUrl="/advertising"
        keywords={['advertise laundromat', 'ad placement', 'vendor marketing', 'laundry industry ads', 'B2B advertising']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Revenue Opportunity
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Advertise Your Brand
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              Reach 72,000+ laundromat owners, operators, investors, and industry professionals on WashBizHub.
            </p>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">72K+</div>
                  <div className="text-sm text-white/70">Monthly Visitors</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">$50M+</div>
                  <div className="text-sm text-white/70">Total Platform Value</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">3.2%</div>
                  <div className="text-sm text-white/70">Average CTR</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Packages */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-3xl font-bold mb-2">Ad Packages</h2>
          <p className="text-muted-foreground mb-8">
            Choose the right package to reach your target audience
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AD_PACKAGES.map(pkg => (
              <Card
                key={pkg.id}
                className={`hover-elevate flex flex-col cursor-pointer transition-all ${
                  selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
                } ${pkg.popular ? 'md:ring-2 md:ring-primary' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
                data-testid={`card-package-${pkg.id}`}
              >
                {pkg.popular && (
                  <div className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold text-center">
                    POPULAR
                  </div>
                )}
                <CardHeader className="flex-1">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Placement</div>
                    <div className="text-sm font-medium">{pkg.placement}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Monthly Impressions</div>
                      <div className="font-semibold">{pkg.impressions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Avg CTR</div>
                      <div className="font-semibold">{pkg.ctr}</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-4 mt-4">
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-2xl font-bold">${pkg.price}</div>
                    <div className="text-xs text-muted-foreground">{pkg.duration}</div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-select-${pkg.id}`}>
                    Select Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
