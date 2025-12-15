import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  MapPin, TrendingUp, Users, Building2, DollarSign, Search, BarChart3,
  Star, ArrowRight, CheckCircle, Target, Sparkles, Home, ChevronRight,
  Calculator, FileText, Phone, Mail
} from "lucide-react";
import { STATE_DATA, type StateData } from "@/data/state-laundromat-data";

interface StateLandingProps {
  stateSlug: string;
}

export default function StateLanding({ stateSlug }: StateLandingProps) {
  const stateData = STATE_DATA[stateSlug];
  
  if (!stateData) {
    return <StateNotFound slug={stateSlug} />;
  }

  const pageTitle = `Laundromats for Sale in ${stateData.name} (${stateData.abbr}) | WashBizHub`;
  const pageDescription = `Find ${stateData.laundromatCount} laundromats for sale in ${stateData.name}. Average price ${stateData.avgSalePrice}, ${stateData.marketGrowth} market growth. Free CLEANBI scores, valuation tools, and expert guidance. Top cities: ${stateData.topCities.slice(0, 3).join(", ")}.`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
      { "@type": "ListItem", "position": 2, "name": "Laundromats for Sale", "item": "https://washbizhub.com/laundromats-for-sale" },
      { "@type": "ListItem", "position": 3, "name": stateData.name, "item": `https://washbizhub.com/laundromats-for-sale/${stateSlug}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": stateData.faq.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Laundromats for Sale in ${stateData.name}`,
    "description": pageDescription,
    "numberOfItems": parseInt(stateData.laundromatCount.replace(/\D/g, '')),
    "itemListElement": stateData.recentSales.map((sale, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": `Laundromat in ${sale.city}, ${stateData.abbr}`,
        "address": { "@type": "PostalAddress", "addressLocality": sale.city, "addressRegion": stateData.abbr },
        "priceRange": sale.price
      }
    }))
  };

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={`https://washbizhub.com/laundromats-for-sale/${stateSlug}`}
        keywords={[
          `laundromats for sale ${stateData.name}`,
          `buy laundromat ${stateData.abbr}`,
          `coin laundry for sale ${stateData.name}`,
          `${stateData.name} laundromat investment`,
          ...stateData.topCities.map(c => `laundromat for sale ${c} ${stateData.abbr}`)
        ]}
      />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <div className="min-h-screen bg-background">
        <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10" aria-label="Breadcrumb">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <ChevronRight className="w-4 h-4" />
              <li><Link href="/laundromats-for-sale" className="hover:text-primary">Laundromats for Sale</Link></li>
              <ChevronRight className="w-4 h-4" />
              <li className="text-foreground font-medium">{stateData.name}</li>
            </ol>
          </div>
        </nav>

        <header className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <MapPin className="w-3 h-3 mr-1" /> {stateData.laundromatCount} Laundromats Available
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Laundromats for Sale in {stateData.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover coin laundry investment opportunities across {stateData.name}. 
                Average sale price {stateData.avgSalePrice} with {stateData.marketGrowth} market growth.
                Population {stateData.population} with {stateData.demographics.renterPercentage} renters.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild data-testid="button-browse-listings">
                  <Link href={`/laundromat-listings?state=${stateData.abbr}`}>
                    <Search className="w-5 h-5 mr-2" /> Browse {stateData.abbr} Listings
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-cleanbi-analysis">
                  <Link href="/cleanbi-auto">
                    <Sparkles className="w-5 h-5 mr-2" /> Free CLEANBI Analysis
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="py-12 container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card">
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-10 h-10 mx-auto mb-3 text-green-500" />
                <div className="text-3xl font-bold mb-1">{stateData.avgSalePrice}</div>
                <div className="text-sm text-muted-foreground">Avg. Sale Price</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                <div className="text-3xl font-bold mb-1">{stateData.avgRevenue}</div>
                <div className="text-sm text-muted-foreground">Avg. Revenue</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">{stateData.marketGrowth}</div>
                <div className="text-sm text-muted-foreground">Market Growth</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-purple-500" />
                <div className="text-3xl font-bold mb-1">{stateData.demographics.renterPercentage}</div>
                <div className="text-sm text-muted-foreground">Renter Population</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {stateData.name} Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {stateData.marketInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Recent {stateData.name} Laundromat Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stateData.recentSales.map((sale, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-semibold">{sale.city}, {stateData.abbr}</div>
                          <div className="text-sm text-muted-foreground">
                            {sale.sqft} sq ft • {sale.machines} machines • {sale.daysOnMarket} days on market
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-500">{sale.price}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Expert Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
                    "{stateData.expertQuote.text}"
                  </blockquote>
                  <div className="mt-4 text-sm text-muted-foreground">
                    — {stateData.expertQuote.author}, {stateData.expertQuote.title}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {stateData.faq.map((item, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent>{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Top Cities in {stateData.abbr}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stateData.topCities.map((city, i) => (
                      <Link
                        key={i}
                        href={`/laundromats-for-sale/${stateSlug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        data-testid={`link-city-${city.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span>{city}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Free Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/cleanbi-auto">
                      <Sparkles className="w-4 h-4 mr-2" /> CLEANBI Location Score
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/valuation-calculator">
                      <DollarSign className="w-4 h-4 mr-2" /> Valuation Calculator
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/roi-calculator">
                      <TrendingUp className="w-4 h-4 mr-2" /> ROI Calculator
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/loan-calculator">
                      <FileText className="w-4 h-4 mr-2" /> Loan Calculator
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seller Tips for {stateData.abbr}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {stateData.sellerTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Need Expert Help?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Get personalized guidance on buying or selling a {stateData.name} laundromat
                  </p>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/consultation">
                      <Phone className="w-4 h-4 mr-2" /> Schedule Consultation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Explore All States
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(STATE_DATA).slice(0, 24).map(([slug, data]) => (
                <Link
                  key={slug}
                  href={`/laundromats-for-sale/${slug}`}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    slug === stateSlug 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  <div className="font-medium">{data.abbr}</div>
                  <div className="text-xs text-muted-foreground">{data.laundromatCount}</div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" asChild>
                <Link href="/laundromats-for-sale">View All 50 States</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function StateNotFound({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">State Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find laundromat data for "{slug}"
        </p>
        <Button asChild>
          <Link href="/laundromats-for-sale">Browse All States</Link>
        </Button>
      </div>
    </div>
  );
}
