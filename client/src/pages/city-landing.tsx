import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Search,
  BarChart3,
  Star,
  ArrowRight,
  CheckCircle,
  Target,
  Sparkles,
  Home,
  Briefcase,
  ChevronRight
} from "lucide-react";

interface CityData {
  city: string;
  state: string;
  stateCode: string;
  slug: string;
  population: number;
  medianIncome: number;
  renterPercentage: number;
  populationDensity: number;
  listingsCount: number;
  avgCleanbiScore: number;
  opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated";
  competitorCount: number;
  coordinates: { lat: number; lng: number };
  marketHighlights: string[];
  nearbyAreas: string[];
}

const OPPORTUNITY_CONFIG = {
  goldmine: { label: "Gold Mine Zone", color: "text-yellow-400", bg: "bg-yellow-400/20", description: "Extremely underserved market with high demand" },
  promising: { label: "High Opportunity", color: "text-green-400", bg: "bg-green-400/20", description: "Strong growth potential with limited competition" },
  moderate: { label: "Good Potential", color: "text-blue-400", bg: "bg-blue-400/20", description: "Balanced market with room for quality operators" },
  saturated: { label: "Competitive Market", color: "text-orange-400", bg: "bg-orange-400/20", description: "Established market requiring differentiation" }
};

const STATE_NAMES: Record<string, string> = {
  "CA": "California",
  "NY": "New York", 
  "IL": "Illinois",
  "TX": "Texas",
  "AZ": "Arizona",
  "PA": "Pennsylvania",
  "FL": "Florida",
  "OH": "Ohio",
  "NC": "North Carolina",
  "IN": "Indiana",
  "WA": "Washington",
  "CO": "Colorado",
  "MA": "Massachusetts",
  "TN": "Tennessee",
  "GA": "Georgia",
  "MI": "Michigan",
  "NJ": "New Jersey",
  "VA": "Virginia",
  "MD": "Maryland",
  "NV": "Nevada"
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toString();
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

function slugToTitle(slug: string): string {
  return slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default function CityLanding() {
  const [matchMarketplace, paramsMarketplace] = useRoute("/laundromats-for-sale/:state/:city");
  const [matchCleanbi, paramsCleanbi] = useRoute("/cleanbi/:state/:city");
  
  const params = matchMarketplace ? paramsMarketplace : paramsCleanbi;
  const pageType = matchMarketplace ? "marketplace" : "cleanbi";
  
  const stateSlug = params?.state || "";
  const citySlug = params?.city || "";
  
  const { data: cityData, isLoading, error } = useQuery<CityData>({
    queryKey: ["/api/city-data", stateSlug, citySlug],
    enabled: !!(stateSlug && citySlug)
  });
  
  if (isLoading) {
    return <CityLandingLoading />;
  }
  
  if (error || !cityData) {
    return <CityNotFound stateSlug={stateSlug} citySlug={citySlug} />;
  }
  
  const cityTitle = `${cityData.city}, ${cityData.stateCode}`;
  const fullStateName = STATE_NAMES[cityData.stateCode] || cityData.state;
  const opportunityConfig = OPPORTUNITY_CONFIG[cityData.opportunityLevel];
  
  const pageTitle = pageType === "marketplace" 
    ? `Laundromats for Sale in ${cityTitle} | WashBizHub`
    : `CLEANBI Analysis: ${cityTitle} Laundromat Market | WashBizHub`;
    
  const pageDescription = pageType === "marketplace"
    ? `Find laundromats for sale in ${cityData.city}, ${fullStateName}. ${cityData.listingsCount}+ active listings, CLEANBI market score ${cityData.avgCleanbiScore}/100. Population ${formatNumber(cityData.population)}, ${cityData.renterPercentage}% renters. Expert analysis and investment opportunities.`
    : `CLEANBI market analysis for ${cityData.city}, ${fullStateName}. Market score: ${cityData.avgCleanbiScore}/100 (${opportunityConfig.label}). Demographics, competition data, and investment opportunities for laundromat buyers.`;
  
  const canonicalUrl = pageType === "marketplace" 
    ? `/laundromats-for-sale/${stateSlug}/${citySlug}`
    : `/cleanbi/${stateSlug}/${citySlug}`;
  
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Laundromats in ${cityData.city}`,
    "description": `Find laundromats for sale and investment opportunities in ${cityTitle}`,
    "areaServed": {
      "@type": "City",
      "name": cityData.city,
      "containedInPlace": {
        "@type": "State",
        "name": fullStateName
      }
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": cityData.coordinates.lat,
      "longitude": cityData.coordinates.lng
    },
    "url": `https://washbizhub.com${canonicalUrl}`
  };
  
  const geoSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": cityTitle,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": cityData.coordinates.lat,
      "longitude": cityData.coordinates.lng
    },
    "containedInPlace": {
      "@type": "State",
      "name": fullStateName,
      "containedInPlace": {
        "@type": "Country",
        "name": "United States"
      }
    }
  };
  
  const breadcrumbItems = pageType === "marketplace" 
    ? [
        { name: "Home", url: "/" },
        { name: "Marketplace", url: "/marketplace" },
        { name: fullStateName, url: `/laundromats-for-sale/${stateSlug}` },
        { name: cityData.city, url: canonicalUrl }
      ]
    : [
        { name: "Home", url: "/" },
        { name: "CLEANBI", url: "/cleanbi" },
        { name: fullStateName, url: `/cleanbi/${stateSlug}` },
        { name: cityData.city, url: canonicalUrl }
      ];
  
  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        keywords={[
          `laundromats for sale ${cityData.city}`,
          `laundromat investment ${cityData.city}`,
          `coin laundry ${cityData.city} ${cityData.stateCode}`,
          `laundromat business ${cityData.city}`,
          `buy laundromat ${fullStateName}`,
          `laundromat market ${cityData.city}`,
          `CLEANBI ${cityData.city}`,
          `laundromat opportunity ${cityTitle}`
        ]}
        structuredData={[localBusinessSchema, geoSchema]}
        breadcrumbs={breadcrumbItems}
        faqs={[
          {
            question: `How many laundromats are for sale in ${cityData.city}?`,
            answer: `Currently there are ${cityData.listingsCount}+ laundromat listings in the ${cityTitle} area. The market has a CLEANBI score of ${cityData.avgCleanbiScore}/100, rated as "${opportunityConfig.label}".`
          },
          {
            question: `Is ${cityData.city} a good place to buy a laundromat?`,
            answer: `${cityData.city} has a ${cityData.renterPercentage}% renter population and median income of ${formatCurrency(cityData.medianIncome)}. With ${cityData.competitorCount} existing laundromats, the market is rated "${opportunityConfig.label}" with a CLEANBI score of ${cityData.avgCleanbiScore}/100.`
          },
          {
            question: `What is the average laundromat investment in ${cityData.city}?`,
            answer: `Laundromat investments in ${cityTitle} typically range from $150,000 to $500,000+ depending on size, location, and equipment. Use our CLEANBI Explorer to analyze specific opportunities.`
          }
        ]}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
          
          <div className="relative max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
              {breadcrumbItems.map((item, index) => (
                <span key={item.url} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="text-white">{item.name}</span>
                  ) : (
                    <Link href={item.url} className="hover:text-accent transition-colors">
                      {item.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1">
                <Badge className={`${opportunityConfig.bg} ${opportunityConfig.color} border-0 mb-4`}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {opportunityConfig.label}
                </Badge>
                
                <h1 className="font-bebas text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-wide" data-testid="text-city-heading">
                  {pageType === "marketplace" ? (
                    <>Laundromats for Sale in <span className="text-accent">{cityTitle}</span></>
                  ) : (
                    <><span className="text-accent">{cityTitle}</span> Laundromat Market Analysis</>
                  )}
                </h1>
                
                <p className="text-xl text-white/80 mb-8 max-w-2xl">
                  {opportunityConfig.description}. Explore {cityData.listingsCount}+ listings and investment opportunities in the {cityData.city} metropolitan area.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold" data-testid="button-explore-cleanbi">
                    <Link href={`/cleanbi-explorer?city=${encodeURIComponent(cityData.city)}&state=${cityData.stateCode}`}>
                      <Search className="w-5 h-5 mr-2" />
                      Explore with CLEANBI
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/20 hover:bg-white/10" data-testid="button-view-listings">
                    <Link href={`/listings?city=${encodeURIComponent(cityData.city)}&state=${cityData.stateCode}`}>
                      <Building2 className="w-5 h-5 mr-2" />
                      View {cityData.listingsCount} Listings
                    </Link>
                  </Button>
                </div>
              </div>
              
              <Card className="bg-white/10 backdrop-blur border-white/10 w-full lg:w-80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    CLEANBI Market Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-6xl font-black text-accent" data-testid="text-cleanbi-score">
                      {cityData.avgCleanbiScore}
                    </div>
                    <div className="text-sm text-white/60">out of 100</div>
                  </div>
                  <Progress value={cityData.avgCleanbiScore} className="h-3 mb-4" />
                  <p className="text-sm text-white/80 text-center">
                    {cityData.city} ranks in the <span className="font-bold text-accent">top {100 - cityData.avgCleanbiScore}%</span> of U.S. markets for laundromat investment potential.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-bebas text-3xl font-black mb-8 text-center tracking-wide">
              {cityData.city} Market Demographics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Population"
                value={formatNumber(cityData.population)}
                subtext="Metro Area"
                testId="stat-population"
              />
              <StatCard
                icon={<DollarSign className="w-6 h-6" />}
                label="Median Income"
                value={formatCurrency(cityData.medianIncome)}
                subtext="Household"
                testId="stat-income"
              />
              <StatCard
                icon={<Home className="w-6 h-6" />}
                label="Renter Rate"
                value={`${cityData.renterPercentage}%`}
                subtext="Of Households"
                testId="stat-renters"
              />
              <StatCard
                icon={<Target className="w-6 h-6" />}
                label="Pop. Density"
                value={formatNumber(cityData.populationDensity)}
                subtext="Per Sq Mile"
                testId="stat-density"
              />
            </div>
          </div>
        </section>
        
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Market Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80">Active Listings</span>
                    <span className="font-bold text-accent" data-testid="text-listings-count">{cityData.listingsCount}+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80">Existing Laundromats</span>
                    <span className="font-bold text-white">{cityData.competitorCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80">Laundromats per 10K Pop</span>
                    <span className="font-bold text-white">
                      {((cityData.competitorCount / cityData.population) * 10000).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80">Opportunity Level</span>
                    <Badge className={`${opportunityConfig.bg} ${opportunityConfig.color} border-0`}>
                      {opportunityConfig.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-accent" />
                    Why Invest in {cityData.city}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {cityData.marketHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-white/80">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-bebas text-3xl font-black mb-4 text-center tracking-wide">
              Ready to Find Your {cityData.city} Laundromat?
            </h2>
            <p className="text-white/70 text-center mb-8 max-w-2xl mx-auto">
              Use CLEANBI to analyze any address in {cityData.city} and get instant market intelligence, competition mapping, and investment scores.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <ActionCard
                icon={<Search className="w-8 h-8" />}
                title="CLEANBI Explorer"
                description={`Analyze any ${cityData.city} address with our AI-powered location scoring tool`}
                href={`/cleanbi-explorer?city=${encodeURIComponent(cityData.city)}&state=${cityData.stateCode}`}
                buttonText="Start Analysis"
                testId="card-cleanbi-explorer"
              />
              <ActionCard
                icon={<Building2 className="w-8 h-8" />}
                title="Browse Listings"
                description={`View ${cityData.listingsCount}+ laundromats for sale in ${cityTitle}`}
                href={`/listings?city=${encodeURIComponent(cityData.city)}&state=${cityData.stateCode}`}
                buttonText="View Listings"
                testId="card-browse-listings"
              />
              <ActionCard
                icon={<Briefcase className="w-8 h-8" />}
                title="Investment Calculator"
                description="Calculate ROI and valuation for laundromat investments"
                href="/calculators"
                buttonText="Use Calculator"
                testId="card-calculator"
              />
            </div>
          </div>
        </section>
        
        {cityData.nearbyAreas.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="font-bebas text-3xl font-black mb-8 text-center tracking-wide">
                Explore Nearby Markets
              </h2>
              
              <div className="flex flex-wrap justify-center gap-3">
                {cityData.nearbyAreas.map((area) => {
                  const [areaCity, areaState] = area.split(", ");
                  const areaSlug = areaCity.toLowerCase().replace(/\s+/g, "-");
                  const stateSlug = areaState?.toLowerCase() || stateSlug;
                  return (
                    <Button 
                      key={area} 
                      variant="outline" 
                      className="border-white/20 hover:bg-white/10"
                      asChild
                    >
                      <Link href={`/laundromats-for-sale/${stateSlug}/${areaSlug}`}>
                        <MapPin className="w-4 h-4 mr-2" />
                        {area}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext,
  testId 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtext: string;
  testId: string;
}) {
  return (
    <Card className="bg-white/10 backdrop-blur border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-accent/20 rounded-lg text-accent">
            {icon}
          </div>
          <span className="text-sm text-white/60">{label}</span>
        </div>
        <div className="text-3xl font-black text-white" data-testid={testId}>{value}</div>
        <div className="text-sm text-white/50">{subtext}</div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ 
  icon, 
  title, 
  description, 
  href, 
  buttonText,
  testId 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string; 
  buttonText: string;
  testId: string;
}) {
  return (
    <Card className="bg-white/10 backdrop-blur border-white/10 hover:bg-white/15 transition-colors" data-testid={testId}>
      <CardContent className="pt-6 text-center">
        <div className="inline-flex p-4 bg-accent/20 rounded-xl text-accent mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/70 mb-4">{description}</p>
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-primary font-bold">
          <Link href={href}>
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CityLandingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-8 w-48 bg-white/10 mb-4" />
        <Skeleton className="h-16 w-3/4 bg-white/10 mb-4" />
        <Skeleton className="h-6 w-2/3 bg-white/10 mb-8" />
        <div className="flex gap-4 mb-12">
          <Skeleton className="h-12 w-48 bg-white/10" />
          <Skeleton className="h-12 w-48 bg-white/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CityNotFound({ stateSlug, citySlug }: { stateSlug: string; citySlug: string }) {
  const cityName = slugToTitle(citySlug);
  const stateName = slugToTitle(stateSlug);
  
  return (
    <>
      <SEO
        title={`Laundromats in ${cityName}, ${stateName} | WashBizHub`}
        description={`Explore laundromat investment opportunities in ${cityName}, ${stateName}. Use CLEANBI to analyze any location.`}
        canonicalUrl={`/laundromats-for-sale/${stateSlug}/${citySlug}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MapPin className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="font-bebas text-4xl font-black mb-4 tracking-wide">
            Explore {cityName}, {stateName}
          </h1>
          <p className="text-xl text-white/70 mb-8">
            We're still building data for this location. Use CLEANBI Explorer to analyze any address in {cityName}.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold">
              <Link href="/cleanbi-explorer">
                <Search className="w-5 h-5 mr-2" />
                Analyze Any Address
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 hover:bg-white/10">
              <Link href="/marketplace">
                <Building2 className="w-5 h-5 mr-2" />
                Browse All Listings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
