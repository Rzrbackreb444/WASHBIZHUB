import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Link } from "wouter";
import { 
  Users, MapPin, Phone, Mail, ExternalLink, Star, Award,
  Building2, CheckCircle, Clock, TrendingUp, ChevronRight, Search,
  Filter, SlidersHorizontal
} from "lucide-react";
import type { BrokerProfile } from "@shared/schema";

const CONSULT_EMAIL = "consult@washbizhub.com";
const BASE_URL = "https://washbizhub.com";

const featuredBrokers: (Partial<BrokerProfile> & { placeholder?: boolean })[] = [
  {
    id: "laundromat-larry",
    slug: "laundromat-larry",
    companyName: "Laundromat123.com",
    nickname: "Laundromat Larry",
    phone: "714-390-9969",
    email: "larry@laundromat123.com",
    website: "https://laundromat123.com",
    licenseNumber: "DRE 49460",
    bio: "Lawrence Larsen has owned and operated over fifty laundromats, designed and built more than 135 stores, and has over fifty years of experience in millions of dollars of equipment distribution throughout the country.",
    specializations: ["Laundromat Sales", "Store Design", "Due Diligence", "Equipment Distribution", "Expert Witness"],
    yearsExperience: 50,
    regions: ["Southern California", "Orange County", "Los Angeles"],
    totalListings: 12,
    activeListings: 3,
    soldListings: 47,
    verified: true,
    profileImageUrl: null
  },
];

const directoryBrokers: (Partial<BrokerProfile> & { placeholder?: boolean })[] = [
  {
    id: "placeholder-1",
    slug: "join-directory",
    companyName: "Your Brokerage Here",
    bio: "Join our verified broker network and get access to thousands of qualified laundromat buyers. Premium placement, lead generation, and industry exposure.",
    specializations: ["Join Our Network"],
    regions: ["Nationwide"],
    verified: false,
    placeholder: true
  }
];

const ALL_REGIONS = [
  "All Regions",
  "Southern California",
  "Northern California",
  "Orange County",
  "Los Angeles",
  "Texas",
  "Florida",
  "New York",
  "Nationwide"
];

const ALL_SPECIALTIES = [
  "All Specialties",
  "Laundromat Sales",
  "Store Design",
  "Due Diligence",
  "Equipment Distribution",
  "Business Valuation",
  "Acquisitions"
];

function BrokerCard({ broker, featured = false }: { broker: Partial<BrokerProfile> & { placeholder?: boolean }; featured?: boolean }) {
  const handleContact = () => {
    if (broker.placeholder) {
      window.location.href = `mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Broker Directory Listing Inquiry")}&body=${encodeURIComponent("Hi,\n\nI'm interested in being listed in the WashBizHub Broker Directory.\n\nBrokerage Name: \nLicense Number: \nService Areas: \n\nPlease send me more information about listing options and pricing.\n\nThank you!")}`;
      return;
    }
    const subject = encodeURIComponent(`Inquiry for ${broker.companyName || broker.nickname || 'Broker'}`);
    const body = encodeURIComponent(`Hi,\n\nI found your profile on WashBizHub and I'm interested in discussing laundromat opportunities.\n\nPlease contact me at your earliest convenience.\n\nThank you!`);
    window.location.href = `mailto:${broker.email || CONSULT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const brokerName = broker.companyName || broker.nickname || "Broker";

  return (
    <Card 
      className={`overflow-hidden hover-elevate transition-all duration-300 ${
        featured ? 'border-[#C8A661]/50 bg-gradient-to-br from-[#C8A661]/5 to-transparent' : ''
      } ${broker.placeholder ? 'border-dashed' : ''}`}
      data-testid={`card-broker-${broker.id}`}
    >
      <div className={`h-1 ${featured ? 'bg-[#C8A661]' : 'bg-muted'}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              featured ? 'bg-[#0A1628]' : 'bg-muted'
            }`}>
              {broker.profileImageUrl ? (
                <img src={broker.profileImageUrl} alt={brokerName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className={`w-8 h-8 ${featured ? 'text-[#C8A661]' : 'text-muted-foreground'}`} />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2" data-testid={`text-broker-name-${broker.id}`}>
                {brokerName}
                {broker.verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </CardTitle>
              {broker.nickname && broker.companyName && (
                <p className="text-sm text-[#C8A661] font-medium">"{broker.nickname}"</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {featured && (
              <Badge className="bg-[#C8A661] text-[#0A1628] no-default-hover-elevate">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {broker.verified && !broker.placeholder && (
              <Badge variant="secondary" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {broker.licenseNumber && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{broker.licenseNumber}</Badge>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-broker-bio-${broker.id}`}>
          {broker.bio}
        </p>
        
        {broker.specializations && broker.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {broker.specializations.slice(0, 4).map((spec: string) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {broker.specializations.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{broker.specializations.length - 4} more
              </Badge>
            )}
          </div>
        )}
        
        {broker.regions && !broker.placeholder && broker.regions.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{broker.regions.join(", ")}</span>
          </div>
        )}
        
        {!broker.placeholder && (
          <div className="grid grid-cols-3 gap-4 py-3 border-y border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-[#C8A661]" data-testid={`text-years-${broker.id}`}>
                {broker.yearsExperience || 0}+
              </div>
              <div className="text-xs text-muted-foreground">Years Exp.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground" data-testid={`text-active-${broker.id}`}>
                {broker.activeListings || 0}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500" data-testid={`text-sold-${broker.id}`}>
                {broker.soldListings || 0}
              </div>
              <div className="text-xs text-muted-foreground">Sold</div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {!broker.placeholder && (
            <Link href={`/broker/${broker.slug || broker.id}`} className="flex-1">
              <Button 
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                data-testid={`button-view-storefront-${broker.id}`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                View Storefront
              </Button>
            </Link>
          )}
          
          {broker.placeholder && (
            <Button 
              className="flex-1"
              variant="outline"
              onClick={handleContact}
              data-testid={`button-contact-${broker.id}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Join Directory
            </Button>
          )}
          
          {broker.phone && !broker.placeholder && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.href = `tel:${broker.phone}`}
              data-testid={`button-call-${broker.id}`}
            >
              <Phone className="w-4 h-4" />
            </Button>
          )}
          
          {broker.website && !broker.placeholder && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(broker.website || '', '_blank')}
              data-testid={`button-website-${broker.id}`}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BrokerCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-muted" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="grid grid-cols-3 gap-4 py-3 border-y">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function BrokerDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

  const { data: apiBrokers, isLoading } = useQuery<BrokerProfile[]>({
    queryKey: ["/api/brokers"],
  });

  const allBrokers = useMemo(() => {
    const combined = [...featuredBrokers, ...(apiBrokers || []), ...directoryBrokers];
    return combined.filter((broker, index, self) => 
      index === self.findIndex(b => b.id === broker.id)
    );
  }, [apiBrokers]);

  const filteredBrokers = useMemo(() => {
    return allBrokers.filter(broker => {
      if (broker.placeholder) return true;
      
      const matchesSearch = !searchQuery || 
        (broker.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         broker.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         broker.bio?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRegion = selectedRegion === "All Regions" || 
        broker.regions?.some(r => r.toLowerCase().includes(selectedRegion.toLowerCase()));
      
      const matchesSpecialty = selectedSpecialty === "All Specialties" ||
        broker.specializations?.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
      
      return matchesSearch && matchesRegion && matchesSpecialty;
    });
  }, [allBrokers, searchQuery, selectedRegion, selectedSpecialty]);

  const featured = filteredBrokers.filter(b => featuredBrokers.some(fb => fb.id === b.id) && !b.placeholder);
  const regular = filteredBrokers.filter(b => !featuredBrokers.some(fb => fb.id === b.id) || b.placeholder);

  const itemListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromat Broker Directory",
    "description": "Find verified laundromat business brokers and intermediaries across the United States",
    "url": `${BASE_URL}/brokers`,
    "numberOfItems": allBrokers.filter(b => !b.placeholder).length,
    "itemListElement": allBrokers
      .filter(b => !b.placeholder && b.id)
      .map((broker, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "RealEstateAgent",
          "name": broker.companyName || broker.nickname || "Broker",
          "url": `${BASE_URL}/broker/${broker.slug || broker.id}`,
          "description": broker.bio,
          "areaServed": broker.regions?.map(r => ({ "@type": "State", "name": r })),
          "knowsAbout": broker.specializations
        }
      }))
  };

  return (
    <>
      <SEO 
        title="Laundromat Brokers Directory | Find Verified Business Brokers"
        description="Connect with verified laundromat brokers and business intermediaries. Expert guidance for buying or selling laundromats. Licensed professionals with proven track records serving all US regions."
        canonicalUrl="/brokers"
        ogType="website"
        keywords={[
          "laundromat broker",
          "laundromat business broker",
          "laundromat for sale broker",
          "coin laundry broker",
          "laundromat business intermediary",
          "sell laundromat broker",
          "buy laundromat broker",
          "laundromat real estate agent",
          "commercial laundry broker"
        ]}
        structuredData={itemListStructuredData}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Broker Directory", url: "/brokers" }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <PageHero
          title="Broker Directory"
          subtitle="Verified Professionals"
          variant="business"
          overlay="mesh"
          size="md"
          align="center"
          showBadge
          badgeText="Trusted Partners"
        >
          <p>
            Connect with industry-leading laundromat brokers. Licensed, experienced, and ready to help you buy or sell.
          </p>
        </PageHero>
        
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <Card className="mb-8 bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search brokers by name or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-brokers"
                  />
                </div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-region">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-specialty">
                    <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_SPECIALTIES.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {featured.length > 0 && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[#C8A661]" />
                  <h2 className="text-xl font-bold">Featured Brokers</h2>
                </div>
                <p className="text-muted-foreground">
                  Premium brokers with extensive industry experience and proven track records.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6 mb-12">
                {isLoading ? (
                  <BrokerCardSkeleton />
                ) : (
                  featured.map(broker => (
                    <BrokerCard key={broker.id} broker={broker} featured />
                  ))
                )}
              </div>
            </>
          )}
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">All Brokers</h2>
            <p className="text-muted-foreground">
              Browse our complete directory of verified laundromat business brokers.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {isLoading ? (
              <>
                <BrokerCardSkeleton />
                <BrokerCardSkeleton />
                <BrokerCardSkeleton />
              </>
            ) : regular.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Brokers Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search filters or browse all brokers.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRegion("All Regions");
                      setSelectedSpecialty("All Specialties");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              regular.map(broker => (
                <BrokerCard key={broker.id} broker={broker} />
              ))
            )}
          </div>
          
          <Card className="bg-[#0A1628] border-none overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Are You a Laundromat Broker?</h3>
                  <p className="text-gray-300 mb-6">
                    Join our verified broker network and get access to thousands of qualified buyers. 
                    Premium listings, lead generation, and industry exposure for your business.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Featured placement in directory
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Direct lead notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Link listings to your profile
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Access to 72,000+ member network
                    </li>
                  </ul>
                  <Button 
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                    onClick={() => {
                      window.location.href = `mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Broker Directory Listing Application")}&body=${encodeURIComponent("Hi,\n\nI would like to apply for a listing in the WashBizHub Broker Directory.\n\nBrokerage Name: \nLicense Number: \nYears of Experience: \nService Areas: \nWebsite: \n\nPlease send me information about listing options and pricing.\n\nThank you!")}`;
                    }}
                    data-testid="button-apply-broker"
                  >
                    Apply to Join Directory
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">72K+</div>
                    <div className="text-sm text-gray-300">Active Members</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">$50M+</div>
                    <div className="text-sm text-gray-300">Deals Facilitated</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">220+</div>
                    <div className="text-sm text-gray-300">Countries</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#C8A661]">24/7</div>
                    <div className="text-sm text-gray-300">Lead Delivery</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
