import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const ADVERTISING_FAQS = [
  {
    question: "How to advertise my laundromat?",
    answer: "Advertise your laundromat effectively through multiple channels: 1) Digital advertising on platforms like WashBizHub that target laundromat owners directly, 2) Google Ads targeting local 'laundromat near me' searches, 3) Social media ads on Facebook and Instagram, 4) Local SEO optimization for Google Business Profile, 5) Community partnerships and flyer distribution. WashBizHub offers specialized B2B advertising packages starting at $299/month to reach 72,000+ industry professionals."
  },
  {
    question: "What are the best laundromat marketing ideas?",
    answer: "Top laundromat marketing ideas include: loyalty programs with punch cards or apps, referral bonuses for new customers, partnering with apartment complexes, offering wash-dry-fold services, hosting community events, creating a strong social media presence with before/after photos, optimizing your Google Business Profile with photos and reviews, email marketing campaigns, and advertising on industry platforms like WashBizHub to reach other operators and investors."
  },
  {
    question: "Are Google Ads effective for laundromats?",
    answer: "Yes, Google Ads can be highly effective for laundromats when targeting local search terms like 'laundromat near me,' 'coin laundry [city],' or 'wash and fold service.' Local service ads and location-based targeting help capture customers actively searching for laundry services. Typical cost-per-click ranges from $1-5, with conversion rates of 5-15% for well-optimized campaigns. Combine with Google Business Profile optimization for best results."
  },
  {
    question: "How much should I budget for laundromat advertising?",
    answer: "A typical laundromat should budget 3-5% of gross revenue for marketing. For a store grossing $15,000/month, that's $450-750/month. Allocate this across: Google Ads ($100-300), social media ads ($50-150), local print/flyers ($50-100), and B2B advertising on industry platforms ($299+) if targeting investors or expanding. Track ROI and adjust based on what channels drive the most new customers."
  },
  {
    question: "How do I advertise laundromat equipment for sale?",
    answer: "Advertise used laundromat equipment through: 1) Industry platforms like WashBizHub marketplace reaching active buyers, 2) Facebook groups dedicated to laundromat owners, 3) Distributor networks who may have buyers, 4) Craigslist and Facebook Marketplace for local buyers, 5) Industry trade publications and newsletters. Include detailed photos, model numbers, age, condition, and pricing. Equipment typically sells for 30-50% of new cost."
  },
  {
    question: "What is the ROI of advertising on WashBizHub?",
    answer: "WashBizHub advertising delivers strong ROI through targeted reach: 72,000+ monthly visitors who are laundromat owners, operators, investors, and industry vendors. Average click-through rates of 2.5-7.1% far exceed industry averages of 0.5-1%. With packages starting at $299/month and reaching 50,000+ impressions, you're connecting with qualified decision-makers actively researching equipment, services, and business opportunities."
  },
  {
    question: "How can I promote my laundromat vendor services?",
    answer: "Promote vendor services by: advertising on industry platforms like WashBizHub, attending laundromat trade shows (CLA, TCATA), joining distributor networks, creating educational content about your products, offering free trials or demos, building case studies from successful installations, partnering with laundromat brokers, and running targeted LinkedIn and Facebook campaigns to laundromat business owners."
  },
  {
    question: "What digital marketing strategies work for laundromats?",
    answer: "Effective digital marketing for laundromats includes: 1) Local SEO and Google Business Profile optimization, 2) Pay-per-click advertising on Google and Bing, 3) Social media marketing on Facebook, Instagram, and TikTok, 4) Email marketing to existing customers, 5) Content marketing through blogs and videos, 6) Online review management, 7) B2B advertising on industry platforms for vendors and investors. Focus on mobile optimization as most laundromat searches happen on smartphones."
  }
];

const ADVERTISING_HOWTO = {
  name: "How to Advertise Your Laundromat Business",
  description: "Complete step-by-step guide to creating an effective laundromat advertising strategy that drives customer acquisition and grows your business.",
  steps: [
    {
      name: "Define Your Target Audience",
      text: "Identify whether you're targeting consumers (local residents needing laundry services) or B2B (other operators, investors, vendors). For consumer marketing, focus on proximity and convenience. For B2B, target industry platforms like WashBizHub."
    },
    {
      name: "Set Your Advertising Budget",
      text: "Allocate 3-5% of gross monthly revenue for marketing. A $15,000/month store should budget $450-750/month across various channels. Track spending and ROI for each channel."
    },
    {
      name: "Optimize Your Google Business Profile",
      text: "Claim and optimize your Google Business Profile with accurate hours, services, photos, and actively manage reviews. This is free and drives significant local traffic."
    },
    {
      name: "Launch Google Ads Campaigns",
      text: "Create Google Ads campaigns targeting local search terms like 'laundromat near me' and 'coin laundry [city]'. Set location targeting to a 3-5 mile radius of your store."
    },
    {
      name: "Build Social Media Presence",
      text: "Create business pages on Facebook and Instagram. Share before/after photos, promotions, and community content. Run targeted ads to reach local residents."
    },
    {
      name: "Implement B2B Advertising",
      text: "For vendors, brokers, or investors, advertise on industry platforms like WashBizHub with banner ads, logo placements, or sponsored content to reach 72,000+ industry professionals."
    },
    {
      name: "Track and Optimize",
      text: "Monitor key metrics like impressions, clicks, conversions, and cost-per-acquisition. Use tracking codes and ask new customers how they found you. Double down on high-performing channels."
    }
  ],
  totalTime: "PT4H"
};

export default function Advertising() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  return (
    <>
      <SEO
        title="Advertise on WashBizHub | Laundromat Marketing & Advertising Solutions"
        description="Reach 72,000+ laundromat owners, operators, and investors with targeted advertising. Banner ads, logo placements, calculator sponsorships. Learn how to advertise your laundromat effectively."
        canonicalUrl="/advertising"
        keywords={[
          'how to advertise my laundromat',
          'laundromat marketing ideas',
          'google ads for laundromat',
          'laundromat advertising',
          'advertise laundry business',
          'laundromat promotion ideas',
          'digital marketing laundromat',
          'B2B laundry advertising',
          'vendor marketing laundromat industry',
          'laundromat SEO marketing',
          'coin laundry advertising',
          'laundromat social media marketing',
          'laundry equipment advertising',
          'laundromat industry marketing',
          'commercial laundry advertising'
        ]}
        faqs={ADVERTISING_FAQS}
        howTo={ADVERTISING_HOWTO}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Advertising", url: "/advertising" }
        ]}
        author={{
          name: "WashBizHub Marketing Team",
          expertise: "Laundromat Industry Marketing Specialists",
          credentials: "Over 10 years experience in laundromat industry advertising and B2B marketing"
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "Advertising", url: "/advertising" }
            ]} />
          </div>
        </div>

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
                        <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
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

        <section className="bg-muted/30 border-t">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {ADVERTISING_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </>
  );
}
