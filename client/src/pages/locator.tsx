import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Phone, Clock, CheckCircle, ChevronRight, Home } from "lucide-react";
import { Star } from "@/lib/icon-registry";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

const locatorSeoKeywords = [
  "laundromat near me",
  "coin laundry locator",
  "find laundromat",
  "laundromat directory",
  "laundromats near me open now",
  "24 hour laundromat",
  "self service laundry",
  "washateria near me",
  "laundry services near me",
  "coin operated laundry",
  "laundromat finder",
  "local laundromat",
  "best laundromat near me",
  "laundromat hours",
  "laundromat locations"
];

const locatorFaqs = [
  {
    question: "How do I find the nearest laundromat?",
    answer: "Enter your city, state, or ZIP code in our search bar to instantly find laundromats near you. Results show distance, hours, contact info, and customer ratings to help you choose the best option."
  },
  {
    question: "Are there 24-hour laundromats near me?",
    answer: "Many laundromats operate 24/7. Use our locator and filter by hours of operation to find late-night or round-the-clock laundry facilities in your area. Operating hours are clearly displayed for each listing."
  },
  {
    question: "How do I list my laundromat in the directory?",
    answer: "Business owners can add their laundromat for free. Featured listings receive priority placement, enhanced visibility, and more customer inquiries. Click 'List Your Business' to get started with your free listing."
  },
  {
    question: "What information is included in laundromat listings?",
    answer: "Each listing includes business name, full address, phone number, hours of operation, distance from your location, and verification status. Featured listings may include photos, amenities, and special services offered."
  },
  {
    question: "How can I verify a laundromat's hours before visiting?",
    answer: "All listings display current hours of operation. We recommend calling ahead for holiday hours or special closures. Verified listings with the checkmark badge have confirmed their business information."
  },
  {
    question: "What amenities should I look for in a laundromat?",
    answer: "Consider factors like machine sizes, payment options (coin vs card), folding tables, seating, WiFi, attendant presence, parking, and cleanliness. Our detailed listings help you find facilities that match your needs."
  }
];

const locatorBreadcrumbs = [
  { name: "Home", url: "/" },
  { name: "Laundromat Locator", url: "/locator" }
];

export default function Locator() {
  const [searchQuery, setSearchQuery] = useState("");

  const sampleLaundromats = [
    {
      id: "1",
      name: "Clean & Fresh Laundromat",
      address: "123 Main Street",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      phone: "(206) 555-0123",
      hours: "6:00 AM - 10:00 PM",
      featured: true,
      verified: true,
      distance: 0.8,
    },
    {
      id: "2",
      name: "SpinCycle Express",
      address: "456 Oak Avenue",
      city: "Seattle",
      state: "WA",
      zipCode: "98102",
      phone: "(206) 555-0456",
      hours: "24/7",
      featured: false,
      verified: true,
      distance: 1.2,
    },
    {
      id: "3",
      name: "Suds & Bubbles",
      address: "789 Pine Street",
      city: "Seattle",
      state: "WA",
      zipCode: "98103",
      phone: "(206) 555-0789",
      hours: "7:00 AM - 9:00 PM",
      featured: true,
      verified: false,
      distance: 2.5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <SEO
        title="Find Laundromats Near Me | Coin Laundry Locator"
        description="Find laundromats near you with hours, contact info & directions. Search by city or ZIP. List your laundromat for free to reach thousands of customers."
        canonicalUrl="/locator"
        keywords={locatorSeoKeywords}
        breadcrumbs={locatorBreadcrumbs}
        faqs={locatorFaqs}
        ogType="website"
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-white/60 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium">Laundromat Locator</span>
        </nav>

        <div className="text-center mb-12">
          <MapPin className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-locator-title">
            Laundromat Locator
          </h1>
          <p className="text-xl text-white/70" data-testid="text-locator-subtitle">
            Find and list laundromats nationwide
          </p>
        </div>

        {/* Search */}
        <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  type="search"
                  placeholder="Enter city, state, or ZIP code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                  data-testid="input-search-location"
                />
              </div>
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8"
                data-testid="button-search"
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {sampleLaundromats.map((laundromat) => (
            <Card 
              key={laundromat.id} 
              className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2"
              data-testid={`card-laundromat-${laundromat.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-white text-xl">{laundromat.name}</CardTitle>
                    {laundromat.verified && (
                      <CheckCircle className="h-5 w-5 text-accent" data-testid={`verified-${laundromat.id}`} />
                    )}
                  </div>
                  {laundromat.featured && (
                    <Badge className="bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-white/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {laundromat.address}, {laundromat.city}, {laundromat.state} {laundromat.zipCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{laundromat.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{laundromat.hours}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {laundromat.distance} mi away
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                      data-testid={`button-directions-${laundromat.id}`}
                    >
                      Get Directions
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      data-testid={`button-details-${laundromat.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* List Your Laundromat CTA */}
        <Card className="bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur border-accent/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-black text-white mb-4">List Your Laundromat</h2>
            <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto">
              Get discovered by thousands of customers. Featured listings receive priority placement 
              and enhanced visibility in search results.
            </p>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 text-lg"
              data-testid="button-list-business"
            >
              List Your Business
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
