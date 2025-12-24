import { useParams } from "wouter";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { getStateData, getAllStates, type StateData } from "@/data/state-laundromat-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, TrendingUp, DollarSign, Users, Building2, Clock, 
  ArrowRight, Star, CheckCircle, Phone, Mail, Shield, 
  ChevronDown, ChevronUp, BarChart3, Target, FileText,
  Award, Briefcase, Calendar, Quote, ExternalLink
} from "lucide-react";
import { useState } from "react";

const CONSULT_EMAIL = "consult@washbizhub.com";
const OWNER_PHONE = "479-883-4314";

function NotFoundState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>State Not Found</CardTitle>
          <CardDescription>We couldn't find information for this state.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/sell-your-laundromat">
            <Button>View All States</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatePageProps {
  stateData: StateData;
}

function StatePage({ stateData }: StatePageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const allStates = getAllStates();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": `Sell Your Laundromat in ${stateData.name} - Complete Seller's Guide 2024`,
        "description": `Everything you need to know about selling a laundromat in ${stateData.name}. Market data, valuations, buyer demand, and expert tips for ${stateData.name} laundromat sellers.`,
        "author": {
          "@type": "Organization",
          "name": "WashBizHub",
          "url": "https://washbizhub.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "WashBizHub",
          "logo": {
            "@type": "ImageObject",
            "url": "https://washbizhub.com/logo.png"
          }
        },
        "datePublished": "2024-01-15",
        "dateModified": new Date().toISOString().split('T')[0],
        "mainEntityOfPage": `https://washbizhub.com/sell-laundromat/${stateData.slug}`
      },
      {
        "@type": "FAQPage",
        "mainEntity": stateData.faq.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      },
      {
        "@type": "LocalBusiness",
        "name": "WashBizHub",
        "description": `Laundromat marketplace and business intelligence platform serving ${stateData.name}`,
        "areaServed": {
          "@type": "State",
          "name": stateData.name
        },
        "priceRange": "$$$",
        "telephone": OWNER_PHONE,
        "email": CONSULT_EMAIL
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
          { "@type": "ListItem", "position": 2, "name": "Sell Your Laundromat", "item": "https://washbizhub.com/sell-your-laundromat" },
          { "@type": "ListItem", "position": 3, "name": stateData.name, "item": `https://washbizhub.com/sell-laundromat/${stateData.slug}` }
        ]
      }
    ]
  };

  return (
    <>
      <SEOHead
        title={`Sell Your Laundromat in ${stateData.name} | ${stateData.avgSalePrice} Avg Sale | WashBizHub`}
        description={`List your ${stateData.name} laundromat for sale. ${stateData.laundromatCount} laundromats, ${stateData.avgSalePrice} average sale price, ${stateData.marketGrowth} market growth. Free listing, 120+ active buyers.`}
        keywords={[
          `sell laundromat ${stateData.name}`,
          `${stateData.name} laundromat for sale`,
          `sell coin laundry ${stateData.name}`,
          `laundromat broker ${stateData.name}`,
          `${stateData.abbr} laundromat value`,
          `sell wash and fold ${stateData.name}`,
          ...stateData.topCities.map(city => `sell laundromat ${city} ${stateData.abbr}`)
        ]}
        canonical={`https://washbizhub.com/sell-laundromat/${stateData.slug}`}
        structuredData={structuredData}
        ogType="article"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/sell-your-laundromat" className="hover:text-foreground">Sell Your Laundromat</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{stateData.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge className="bg-accent/10 text-accent border-accent/30 px-4 py-1.5">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {stateData.name} Market
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    Sell Your Laundromat in <span className="text-accent">{stateData.name}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                    Join {stateData.laundromatCount} laundromat owners in {stateData.name}. 
                    Average sale price: <strong className="text-foreground">{stateData.avgSalePrice}</strong>. 
                    Market growth: <strong className="text-accent">{stateData.marketGrowth}</strong>.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/sell-your-laundromat#listing-form">
                    <Button size="lg" className="btn-premium-gold text-white font-semibold h-14 px-8 group w-full sm:w-auto" data-testid="button-list-now">
                      <FileText className="w-5 h-5 mr-2" />
                      List Your {stateData.abbr} Laundromat Free
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <a href={`tel:${OWNER_PHONE}`}>
                    <Button size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto" data-testid="button-call-now">
                      <Phone className="w-5 h-5 mr-2" />
                      Call {OWNER_PHONE}
                    </Button>
                  </a>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">120+ Active Buyers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">NDA Protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">List in 5 Minutes</span>
                  </div>
                </div>
              </div>

              {/* Market Stats Card */}
              <Card className="border-accent/20 shadow-xl bg-card/95 backdrop-blur">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-4 rounded-full bg-accent/10 w-fit mb-4">
                    <BarChart3 className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">{stateData.name} Market Overview</CardTitle>
                  <CardDescription>Current laundromat market statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Laundromats</p>
                      <p className="text-2xl font-bold text-foreground">{stateData.laundromatCount}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Avg Sale Price</p>
                      <p className="text-2xl font-bold text-accent">{stateData.avgSalePrice}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Avg Revenue</p>
                      <p className="text-2xl font-bold text-foreground">{stateData.avgRevenue}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Market Growth</p>
                      <p className="text-2xl font-bold text-green-600">{stateData.marketGrowth}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Top Markets in {stateData.name}:</p>
                    <div className="flex flex-wrap gap-2">
                      {stateData.topCities.map((city, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demographics Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Why {stateData.name} Laundromats Are In Demand
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-accent mb-2">{stateData.demographics.renterPercentage}</div>
                  <p className="text-muted-foreground">Renter Population</p>
                  <p className="text-xs text-muted-foreground mt-1">Key demand driver</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-foreground mb-2">{stateData.demographics.medianIncome}</div>
                  <p className="text-muted-foreground">Median Income</p>
                  <p className="text-xs text-muted-foreground mt-1">Customer purchasing power</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-foreground mb-2">{stateData.population}</div>
                  <p className="text-muted-foreground">State Population</p>
                  <p className="text-xs text-muted-foreground mt-1">Total addressable market</p>
                </CardContent>
              </Card>
            </div>

            {/* Market Insights */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  {stateData.name} Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-4">
                  {stateData.marketInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Expert Quote - EEAT Signal */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-8 pb-8">
                <Quote className="w-12 h-12 text-accent/50 mb-4" />
                <blockquote className="text-xl md:text-2xl text-foreground italic mb-6">
                  "{stateData.expertQuote.text}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{stateData.expertQuote.author}</p>
                    <p className="text-sm text-muted-foreground">{stateData.expertQuote.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Sales */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Recent {stateData.name} Laundromat Sales
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {stateData.recentSales.map((sale, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{sale.city}, {stateData.abbr}</h3>
                        <p className="text-sm text-muted-foreground">{sale.sqft} sq ft • {sale.machines} machines</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        SOLD
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sale Price</p>
                        <p className="text-xl font-bold text-accent">{sale.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Days on Market</p>
                        <p className="text-xl font-bold text-foreground">{sale.daysOnMarket} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link href="/sell-your-laundromat#listing-form">
                <Button size="lg" className="btn-premium-gold text-white" data-testid="button-list-yours">
                  List Your Laundromat Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seller Tips */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Tips for {stateData.name} Laundromat Sellers
            </h2>
            
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {stateData.sellerTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-accent/10 flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {stateData.faq.map((faq, idx) => (
                <Card 
                  key={idx} 
                  className={`border-border/50 cursor-pointer transition-all ${expandedFaq === idx ? 'border-accent/50' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base font-medium text-left">{faq.q}</CardTitle>
                      {expandedFaq === idx ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedFaq === idx && (
                    <CardContent className="pt-0 pb-4">
                      <p className="text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Sell Your {stateData.name} Laundromat?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 120+ active buyers searching for {stateData.name} laundromats. 
              Free listing, NDA protection, and expert support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sell-your-laundromat#listing-form">
                <Button size="lg" className="btn-premium-gold text-white font-semibold h-14 px-10 group" data-testid="button-final-cta">
                  <FileText className="w-5 h-5 mr-2" />
                  List Your Laundromat Free
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href={`mailto:${CONSULT_EMAIL}`}>
                <Button size="lg" variant="outline" className="h-14 px-8" data-testid="button-email">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Other States Navigation */}
        <section className="py-12 border-t">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Sell Your Laundromat in Other States</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {allStates
                .filter(s => s.slug !== stateData.slug)
                .slice(0, 20)
                .map(state => (
                  <Link key={state.slug} href={`/sell-laundromat/${state.slug}`}>
                    <Badge variant="outline" className="hover:bg-accent/10 cursor-pointer">
                      {state.name}
                    </Badge>
                  </Link>
                ))}
              {allStates.length > 21 && (
                <Link href="/sell-your-laundromat">
                  <Badge variant="outline" className="hover:bg-accent/10 cursor-pointer">
                    View All States
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Author/Trust Footer - EEAT Signal */}
        <section className="py-8 border-t bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-accent/10">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">WashBizHub Market Research</p>
                  <p>Data updated monthly from verified transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-muted">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function SellLaundromatStatePage() {
  const params = useParams();
  const stateSlug = params.state as string;
  const stateData = getStateData(stateSlug);

  if (!stateData) {
    return <NotFoundState />;
  }

  return <StatePage stateData={stateData} />;
}
