import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Shield, DollarSign, ExternalLink, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const INSURANCE_PARTNERS = [
  {
    name: 'Larry Larsen — WashBizHub Featured Consultant',
    category: 'California Insurance Specialist',
    description: 'Direct partnership with Larry "Laundromat Larry" Larsen, 50+ year industry veteran and California-based laundromat insurance expert. Currently serving California operators only. Specializes in CA regulations, equipment protection, and multi-location coverage.',
    commission: 'Direct referral partnership',
    commissionType: 'Revenue share arrangement',
    features: [
      'California-only coverage (for now)',
      'CA-specific regulations expertise',
      'Commercial property & liability',
      'Equipment breakdown protection',
      'Multi-location support in CA',
      '50+ years industry experience'
    ],
    links: [
      { title: 'Book Consultation', url: '/consultation' }
    ],
    badge: 'Featured Partner',
    bestFor: 'California laundromat operators'
  },
  {
    name: 'Tivly',
    category: 'Multi-Carrier Insurance Platform',
    description: 'Multi-carrier platform connecting laundromat owners with Hartford, Allstate, Nationwide, Liberty Mutual, Travelers, and more.',
    commission: 'Varies by campaign',
    commissionType: 'Premium revenue share',
    features: [
      'Access to 6+ major carriers',
      'Property, liability, workers comp',
      'Commercial auto coverage',
      'Equipment breakdown protection',
      'Fast quote generation'
    ],
    links: [
      { title: 'Join Tivly Affiliate Program', url: 'https://tivly.com/affiliates' }
    ],
    badge: 'Best Multi-Carrier',
    bestFor: 'Brokers wanting multi-carrier reach'
  },
  {
    name: 'Next Insurance',
    category: 'Direct Online Insurance',
    description: 'Small business insurance platform specializing in commercial property and liability for laundromats and service businesses.',
    commission: '$25 per sale or qualified quote',
    commissionType: 'Per policy acquisition',
    features: [
      'General liability coverage',
      'Property insurance',
      'Workers compensation',
      'Commercial auto',
      'Equipment protection',
      'Instant quotes online'
    ],
    links: [
      { title: 'Next Insurance Affiliate Program', url: 'https://www.nextinsurance.com/become-a-next-insurance-affiliate/' }
    ],
    badge: 'High Commission',
    bestFor: 'Platform referrals and lead generation'
  },
  {
    name: 'Hiscox',
    category: 'Specialty Business Insurance',
    description: 'Specialty underwriter focused on small business and commercial property coverage with competitive rates for laundromats.',
    commission: '$25 per completed quote (45-day cookie)',
    commissionType: 'Per quote completion',
    features: [
      'Commercial property coverage',
      'General liability',
      'Business interruption',
      'Employee benefits',
      'Fleet/auto insurance',
      'Professional support'
    ],
    links: [
      { title: 'Hiscox Affiliate Program (CJ)', url: 'https://www.cjaffiliates.com' }
    ],
    badge: 'Longest Cookie',
    bestFor: 'Building customer relationships over time'
  },
  {
    name: 'General Liability Insure',
    category: 'Lead Generation Platform',
    description: 'Quick-form business insurance lead platform connecting laundromat owners with multiple carriers.',
    commission: '$10 per qualified lead',
    commissionType: 'Per lead submission',
    features: [
      '30-second form completion',
      'No volume minimums',
      'Dedicated tracking numbers',
      'No-scrub policy',
      'Multiple carrier matching',
      'Same-day quotes'
    ],
    links: [
      { title: 'General Liability Insure Affiliate', url: 'https://generalliabilityinsure.com/affiliate-business-insurance-program.html' }
    ],
    badge: 'Fastest Setup',
    bestFor: 'High-volume lead generation'
  },
  {
    name: 'CommercialInsurance.net',
    category: 'Business Insurance Marketplace',
    description: 'Commercial insurance marketplace with fast-track policies for small businesses including laundromats.',
    commission: 'Up to $20 CPA (30-day cookie)',
    commissionType: 'Per completed action',
    features: [
      'Same-day policy issuance',
      'Instant certificates',
      'Property & liability bundles',
      'Equipment coverage',
      'Flexible deductibles',
      'Multi-location support'
    ],
    links: [
      { title: 'CommercialInsurance.net Affiliate', url: 'https://www.commercialinsurance.net' }
    ],
    badge: 'Fastest Policies',
    bestFor: 'Operators needing immediate coverage'
  },
  {
    name: 'Hartford Business Insurance',
    category: 'Established Carrier',
    description: 'One of America\'s oldest insurance companies with dedicated laundromat coverage programs and risk management support.',
    commission: 'Affiliate partnership (referral based)',
    commissionType: 'Revenue share',
    features: [
      'Specialized laundromat programs',
      'Loss prevention resources',
      'Claims support 24/7',
      'Custom risk assessments',
      'Equipment breakdown',
      'Cyber liability options'
    ],
    links: [
      { title: 'Hartford Laundromat Insurance', url: 'https://www.thehartford.com/business-insurance/laundromat-insurance' }
    ],
    badge: 'Enterprise Support',
    bestFor: 'Multi-location owners and brokers'
  }
];

const COVERAGE_TYPES = [
  {
    name: 'General Liability',
    description: 'Bodily injury, property damage, and personal injury liability coverage',
    typical: '$1M-$2M limits'
  },
  {
    name: 'Commercial Property',
    description: 'Building, equipment, and inventory coverage including water damage and theft',
    typical: '$50K-$500K+ coverage'
  },
  {
    name: 'Workers Compensation',
    description: 'Employee injury and illness coverage if you have staff',
    typical: 'State-mandated minimums'
  },
  {
    name: 'Equipment Breakdown',
    description: 'Protection for washers, dryers, card systems, and control boards from mechanical failure',
    typical: '$10K-$100K per item'
  },
  {
    name: 'Commercial Auto',
    description: 'Fleet coverage for delivery vehicles, service trucks, and route vehicles',
    typical: '$100K+ liability per vehicle'
  },
  {
    name: 'Business Interruption',
    description: 'Lost revenue coverage if your laundromat closes due to covered disaster',
    typical: '50-100% of monthly revenue'
  }
];

export default function InsurancePartners() {
  return (
    <>
      <SEO
        title="Laundromat Business Insurance Partners | California & Nationwide"
        description="Insurance for laundromat owners. California coverage via Larry Larsen. Multi-carrier platforms for all states. $10-$25+ per referral."
        canonicalUrl="/insurance-partners"
        keywords={['laundromat insurance', 'california laundromat insurance', 'business insurance affiliate', 'commercial property insurance']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-12 border-b border-purple-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Laundromat Insurance Partners</h1>
            </div>
            <p className="text-purple-200">California coverage via Larry Larsen. Multi-carrier platforms for all states. Affiliate revenue: $10-$25+ per referral.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Commission Range</p>
                    <p className="text-xl font-bold">$10 - $25+ per referral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Active Partners</p>
                    <p className="text-xl font-bold">6 platforms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Coverage Types</p>
                    <p className="text-xl font-bold">6+ options</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="partners" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="partners">Insurance Partners</TabsTrigger>
              <TabsTrigger value="coverage">Coverage Types</TabsTrigger>
            </TabsList>

            {/* Partners Tab */}
            <TabsContent value="partners" className="space-y-6 mt-6">
              <div className="space-y-6">
                {INSURANCE_PARTNERS.map((partner, idx) => (
                  <Card key={idx} className="hover-elevate" data-testid={`card-partner-${idx}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {partner.name}
                            {partner.badge && (
                              <Badge variant="secondary" data-testid={`badge-${idx}`}>{partner.badge}</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{partner.category}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Commission</p>
                          <p className="text-lg font-bold text-green-600">{partner.commission}</p>
                          <p className="text-xs text-muted-foreground">{partner.commissionType}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{partner.description}</p>
                      
                      <div>
                        <p className="text-sm font-semibold mb-2">Key Features:</p>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {partner.features.map((feature, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        {partner.links.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" data-testid={`button-${idx}-apply`}>
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
            </TabsContent>

            {/* Coverage Types Tab */}
            <TabsContent value="coverage" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {COVERAGE_TYPES.map((coverage, idx) => (
                  <Card key={idx} data-testid={`card-coverage-${idx}`}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        {coverage.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{coverage.description}</p>
                      <div className="bg-muted/50 p-3 rounded">
                        <p className="text-xs text-muted-foreground">Typical Coverage</p>
                        <p className="font-semibold">{coverage.typical}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Getting Started */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>Getting Started with Insurance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Badge className="mt-1">1</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Assess Your Coverage Needs</p>
                    <p className="text-sm text-muted-foreground">Evaluate location (urban vs. rural), equipment value, employees, and local liability risks</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Badge className="mt-1">2</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Choose Your Platform</p>
                    <p className="text-sm text-muted-foreground">Tivly for multi-carrier reach, Next Insurance for quick online quotes, Hartford for enterprise support</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Badge className="mt-1">3</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Get Quotes</p>
                    <p className="text-sm text-muted-foreground">Compare rates across carriers. Most provide instant quotes and 24-48 hour binding</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Badge className="mt-1">4</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Enroll & Earn</p>
                    <p className="text-sm text-muted-foreground">If you're an affiliate partner, track your referrals and earn $10-$25+ per policy placement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affiliate Opportunity */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-400">Affiliate Revenue Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                If you're a broker, consultant, or platform (like WashBizHub), you can earn affiliate commissions by referring laundromat owners to these insurance partners:
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded space-y-2">
                <p className="font-semibold text-sm">Commission Structure by Platform:</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Tivly</strong>: Varies by campaign (negotiable)</li>
                  <li>• <strong>Next Insurance</strong>: $25 per policy sold</li>
                  <li>• <strong>Hiscox</strong>: $25 per completed quote (45-day tracking)</li>
                  <li>• <strong>General Liability Insure</strong>: $10 per lead submitted</li>
                  <li>• <strong>CommercialInsurance.net</strong>: Up to $20 per action</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Interested in becoming an insurance affiliate partner?</p>
                <a href="mailto:insurance@washbizhub.com" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700" data-testid="button-partner-inquiry">
                    Contact Partner Program
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
          {/* Insurance Lead Capture */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Get Personalized Insurance Quote
              </CardTitle>
              <CardDescription>Connect with our insurance specialists for a free quote</CardDescription>
            </CardHeader>
            <CardContent>
              <InsuranceLeadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function InsuranceLeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    businessType: 'laundromat',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/insurance-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to submit');
      toast({ title: 'Success!', description: "We'll contact you soon with a quote." });
      setFormData({ name: '', email: '', phone: '', location: '', businessType: 'laundromat', message: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border rounded-md text-sm" data-testid="input-name" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border rounded-md text-sm" data-testid="input-email" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border rounded-md text-sm" data-testid="input-phone" />
        </div>
        <div>
          <label className="text-sm font-medium">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" data-testid="input-location" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Additional Details</label>
        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Describe your insurance needs..." className="w-full mt-1 px-3 py-2 border rounded-md text-sm" rows={3} data-testid="textarea-message" />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-submit-lead">
        {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
      </Button>
    </form>
  );
}
