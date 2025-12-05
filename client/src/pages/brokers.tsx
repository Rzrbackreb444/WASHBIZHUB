import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Link } from "wouter";
import { 
  Users, MapPin, Phone, Mail, ExternalLink, Star, Award,
  Building2, CheckCircle, Clock, TrendingUp, ChevronRight
} from "lucide-react";

const CONSULT_EMAIL = "consult@washbizhub.com";

const featuredBrokers = [
  {
    id: "laundromat-larry",
    name: "Lawrence Larsen",
    nickname: "Laundromat Larry",
    company: "Laundromat123.com",
    phone: "714-390-9969",
    email: "larry@laundromat123.com",
    website: "https://laundromat123.com",
    licenseNumber: "DRE 49460",
    insuranceLicense: "DOI: 0553938",
    bio: "Lawrence Larsen has owned and operated over fifty laundromats, designed and built more than 135 stores, and has over fifty years of experience in millions of dollars of equipment distribution throughout the country.",
    specializations: ["Laundromat Sales", "Store Design", "Due Diligence", "Equipment Distribution", "Expert Witness"],
    yearsExperience: 50,
    regions: ["Southern California", "Orange County", "Los Angeles"],
    totalListings: 12,
    activeListings: 3,
    soldListings: 47,
    verified: true,
    featured: true,
    image: null
  },
];

const directoryBrokers = [
  {
    id: "placeholder-1",
    name: "Become a Listed Broker",
    company: "Your Brokerage Here",
    bio: "Join our verified broker network and get access to thousands of qualified laundromat buyers. Premium placement, lead generation, and industry exposure.",
    specializations: ["Join Our Network"],
    regions: ["Nationwide"],
    verified: false,
    featured: false,
    placeholder: true
  }
];

function BrokerCard({ broker, featured = false }: { broker: any; featured?: boolean }) {
  const handleContact = () => {
    if (broker.placeholder) {
      window.location.href = `mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Broker Directory Listing Inquiry")}&body=${encodeURIComponent("Hi,\n\nI'm interested in being listed in the WashBizHub Broker Directory.\n\nBrokerage Name: \nLicense Number: \nService Areas: \n\nPlease send me more information about listing options and pricing.\n\nThank you!")}`;
      return;
    }
    const subject = encodeURIComponent(`Inquiry for ${broker.name}`);
    const body = encodeURIComponent(`Hi ${broker.name},\n\nI found your profile on WashBizHub and I'm interested in discussing laundromat opportunities.\n\nPlease contact me at your earliest convenience.\n\nThank you!`);
    window.location.href = `mailto:${broker.email || CONSULT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <Card 
      className={`overflow-hidden hover-elevate transition-all duration-300 ${
        featured ? 'border-accent/50 bg-gradient-to-br from-accent/5 to-transparent' : ''
      } ${broker.placeholder ? 'border-dashed' : ''}`}
      data-testid={`card-broker-${broker.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              featured ? 'bg-accent/20' : 'bg-muted'
            }`}>
              {broker.image ? (
                <img src={broker.image} alt={broker.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className={`w-8 h-8 ${featured ? 'text-accent' : 'text-muted-foreground'}`} />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {broker.name}
                {broker.verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </CardTitle>
              {broker.nickname && (
                <p className="text-sm text-accent font-medium">"{broker.nickname}"</p>
              )}
              <p className="text-sm text-muted-foreground">{broker.company}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {featured && (
              <Badge className="bg-accent text-accent-foreground">
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
            {broker.insuranceLicense && (
              <Badge variant="outline">{broker.insuranceLicense}</Badge>
            )}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-3">
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
        
        {broker.regions && !broker.placeholder && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{broker.regions.join(", ")}</span>
          </div>
        )}
        
        {!broker.placeholder && (
          <div className="grid grid-cols-3 gap-4 py-3 border-y border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{broker.yearsExperience || 0}+</div>
              <div className="text-xs text-muted-foreground">Years Exp.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{broker.activeListings || 0}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{broker.soldListings || 0}</div>
              <div className="text-xs text-muted-foreground">Sold</div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            className="flex-1"
            variant={broker.placeholder ? "outline" : "default"}
            onClick={handleContact}
            data-testid={`button-contact-${broker.id}`}
          >
            <Mail className="w-4 h-4 mr-2" />
            {broker.placeholder ? "Join Directory" : "Contact"}
          </Button>
          
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
              onClick={() => window.open(broker.website, '_blank')}
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

export default function BrokerDirectory() {
  return (
    <>
      <SEO 
        title="Laundromat Brokers Directory | Find Verified Business Brokers | WashBizHub"
        description="Connect with verified laundromat brokers and business intermediaries. Expert guidance for buying or selling laundromats. Licensed professionals with proven track records."
        canonicalUrl="/brokers"
        ogType="website"
        keywords={[
          "laundromat broker",
          "business broker laundromat",
          "laundromat for sale broker",
          "coin laundry broker",
          "laundromat business intermediary",
          "sell laundromat broker"
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Laundromat Broker Directory",
          "description": "Verified laundromat business brokers and intermediaries",
          "url": "https://washbizhub.com/brokers",
          "numberOfItems": featuredBrokers.length + directoryBrokers.length
        }}
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
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold">Featured Brokers</h2>
            </div>
            <p className="text-muted-foreground">
              Premium brokers with extensive industry experience and proven track records.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6 mb-12">
            {featuredBrokers.map(broker => (
              <BrokerCard key={broker.id} broker={broker} featured />
            ))}
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">All Brokers</h2>
            <p className="text-muted-foreground">
              Browse our complete directory of verified laundromat business brokers.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {directoryBrokers.map(broker => (
              <BrokerCard key={broker.id} broker={broker} />
            ))}
          </div>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-3">Are You a Laundromat Broker?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join our verified broker network and get access to thousands of qualified buyers. 
                    Premium listings, lead generation, and industry exposure for your business.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Featured placement in directory
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Direct lead notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Link listings to your profile
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Access to 72,000+ member network
                    </li>
                  </ul>
                  <Button 
                    size="lg"
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
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-accent">72K+</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-accent">$50M+</div>
                    <div className="text-sm text-muted-foreground">Deals Facilitated</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-accent">220+</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-3xl font-bold text-accent">24/7</div>
                    <div className="text-sm text-muted-foreground">Lead Delivery</div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
