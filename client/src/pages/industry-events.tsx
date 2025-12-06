import { Link, useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, MapPin, Users, ExternalLink, ArrowRight, ArrowLeft, 
  Building2, Star, Clock, CheckCircle2, Sparkles 
} from "lucide-react";
import { 
  industryEvents, 
  getEventBySlug, 
  getHighlightEvents, 
  getUpcomingEvents,
  formatEventDate,
  eventImages,
  AFFILIATE_LINK 
} from "@/data/industry-events";

// Events Hub Page
export function IndustryEventsHub() {
  const highlightEvents = getHighlightEvents();
  const upcomingEvents = getUpcomingEvents();
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromat Industry Events 2025",
    "description": "Complete calendar of commercial laundry trade shows, conferences, and networking events across the United States",
    "numberOfItems": industryEvents.length,
    "itemListElement": industryEvents.map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.name,
        "description": event.tagline,
        "startDate": event.startDate,
        "endDate": event.endDate,
        "location": {
          "@type": "Place",
          "name": event.venue,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": event.city,
            "addressRegion": event.state,
            "addressCountry": "US"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": event.organizer
        },
        "url": `${baseUrl}/events/${event.slug}`
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Laundromat Industry Events 2025-2027 | Trade Shows & Conferences | WashBizHub</title>
        <meta name="description" content="Complete guide to laundromat industry events: Clean Show 2025, CLA Excellence, regional trade shows. Network, compare equipment, get exclusive deals." />
        <meta property="og:title" content="Laundromat Industry Events 2025-2027 | WashBizHub" />
        <meta property="og:description" content="Complete calendar of commercial laundry trade shows, conferences, and networking events across the United States." />
        <meta property="og:image" content={eventImages.tradeShowFloor} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${baseUrl}/events`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={eventImages.tradeShowFloor} 
              alt="Commercial laundry trade show exhibition floor"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/85 to-[#0A1628]/70" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-[#C8A661] text-[#0A1628]">
                2025-2027 Event Calendar
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Laundromat Industry Events
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Trade shows, conferences, and networking events for laundromat owners, 
                investors, and commercial laundry professionals across the United States.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                  <a href="#upcoming-events" data-testid="button-view-upcoming">
                    View Upcoming Events <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" data-testid="link-get-quote">
                    Get Equipment Quote <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[#0A1628] py-8 border-y border-[#C8A661]/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#C8A661]">{industryEvents.length}</div>
                <div className="text-white/70">Major Events</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#C8A661]">12+</div>
                <div className="text-white/70">Cities Nationwide</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#C8A661]">25,000+</div>
                <div className="text-white/70">Annual Attendees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#C8A661]">500+</div>
                <div className="text-white/70">Equipment Exhibitors</div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlight Events */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="secondary">
                <Star className="w-3 h-3 mr-1" /> Must-Attend Events
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Trade Shows</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The largest and most impactful events in the laundromat industry. 
                Don't miss these opportunities to see equipment live and network with industry leaders.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {highlightEvents.map((event, index) => (
                <Card 
                  key={event.slug} 
                  className="overflow-hidden hover-elevate border-2 hover:border-[#C8A661]/50"
                  data-testid={`card-highlight-event-${index}`}
                >
                  <div className="relative h-48">
                    <img 
                      src={event.featuredImage} 
                      alt={`${event.name} - ${event.city}, ${event.state}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-[#C8A661] text-[#0A1628]">
                      <Star className="w-3 h-3 mr-1" /> Featured
                    </Badge>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {event.city}, {event.state}
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <Link 
                        href={`/events/${event.slug}`}
                        className="hover:text-[#C8A661] transition-colors"
                        data-testid={`link-event-${index}`}
                      >
                        {event.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{event.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatEventDate(event.startDate, event.endDate)}
                      </span>
                      {event.expectedAttendance && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.expectedAttendance}
                        </span>
                      )}
                    </div>
                    <Button asChild className="w-full bg-[#0A1628] hover:bg-[#1a3a5c]">
                      <Link href={`/events/${event.slug}`} data-testid={`button-event-details-${index}`}>
                        View Event Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events Timeline */}
        <section id="upcoming-events" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events Calendar</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete schedule of laundromat industry events across the United States
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {upcomingEvents.map((event, index) => (
                <Card 
                  key={event.slug} 
                  className="hover-elevate overflow-hidden"
                  data-testid={`card-upcoming-event-${index}`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-32 md:h-auto relative">
                      <img 
                        src={event.featuredImage} 
                        alt={`${event.name} venue`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {event.isHighlight && (
                        <Badge className="absolute top-2 left-2 bg-[#C8A661] text-[#0A1628] text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            <Link 
                              href={`/events/${event.slug}`}
                              className="hover:text-[#C8A661] transition-colors"
                            >
                              {event.name}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">{event.tagline}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatEventDate(event.startDate, event.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.city}, {event.state}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {event.venue}
                            </span>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/events/${event.slug}`}>
                            Details <ArrowRight className="ml-1 w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#0A1628] to-[#1a3a5c]">
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-12 h-12 text-[#C8A661] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Can't Wait for the Next Trade Show?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get competitive equipment quotes now from authorized Dexter and Continental Girbau dealers. 
              Same brands, same quality—no need to wait for a show.
            </p>
            <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
              <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" data-testid="link-get-quote-cta">
                Get Your Free Quote <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2>Why Attend Laundromat Industry Events?</h2>
              <p>
                Trade shows and conferences are essential for laundromat owners and investors. 
                These events provide opportunities to:
              </p>
              <ul>
                <li><strong>Compare equipment side-by-side:</strong> See Dexter, Continental Girbau, Speed Queen, and other brands operating live</li>
                <li><strong>Get exclusive show pricing:</strong> Many manufacturers offer 10-15% discounts on show orders</li>
                <li><strong>Network with successful operators:</strong> Learn from multi-store owners and industry veterans</li>
                <li><strong>Stay current on technology:</strong> Discover payment systems, IoT monitoring, and automation innovations</li>
                <li><strong>Access financing specials:</strong> Equipment financing companies offer exclusive show rates</li>
              </ul>
              
              <h2>Major Laundromat Trade Shows</h2>
              <p>
                The <strong>Clean Show</strong> is the world's largest textile care exhibition, 
                held every two years with 400+ exhibitors and 12,000+ attendees. The 2025 show 
                in New Orleans is a must-attend for anyone in the laundromat industry.
              </p>
              <p>
                The <strong>Coin Laundry Association's Excellence in Laundry Conference</strong> 
                provides focused education specifically for laundromat owners, with sessions on 
                profitability, operations, and growth strategies.
              </p>
              <p>
                Regional events like the <strong>Western States Laundry Expo</strong> and 
                <strong>Clean Classic</strong> offer more accessible options for operators 
                who can't travel to major national shows.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Individual Event Detail Page
export function IndustryEventDetail() {
  const params = useParams<{ slug: string }>();
  const event = getEventBySlug(params.slug || "");
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been moved.
            </p>
            <Button asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "image": event.featuredImage,
    "location": {
      "@type": "Place",
      "name": event.venue,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.city,
        "addressRegion": event.state,
        "addressCountry": "US"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer,
      "url": event.website || baseUrl
    },
    "offers": {
      "@type": "Offer",
      "url": AFFILIATE_LINK,
      "description": "Get equipment quotes from exhibitors"
    }
  };

  return (
    <>
      <Helmet>
        <title>{event.metaTitle}</title>
        <meta name="description" content={event.metaDescription} />
        <meta name="keywords" content={event.focusKeyphrases.join(", ")} />
        <meta property="og:title" content={event.name} />
        <meta property="og:description" content={event.metaDescription} />
        <meta property="og:image" content={event.featuredImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${baseUrl}/events/${event.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/events" data-testid="link-back-to-events">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Events
                </Link>
              </Button>
              <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                  <li>/</li>
                  <li><Link href="/events" className="hover:text-foreground">Events</Link></li>
                  <li>/</li>
                  <li className="text-foreground font-medium truncate max-w-[200px]">{event.name}</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Hero */}
        <header className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={event.featuredImage} 
              alt={`${event.name} - ${event.venue}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/80 to-[#0A1628]/60" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              {event.isHighlight && (
                <Badge className="mb-4 bg-[#C8A661] text-[#0A1628]">
                  <Star className="w-3 h-3 mr-1" /> Featured Event
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-event-title">
                {event.name}
              </h1>
              <p className="text-xl text-gray-300 mb-6">{event.tagline}</p>
              
              <div className="flex flex-wrap gap-6 text-white/80 mb-8">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C8A661]" />
                  {formatEventDate(event.startDate, event.endDate)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C8A661]" />
                  {event.city}, {event.state}
                </span>
                <span className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#C8A661]" />
                  {event.venue}
                </span>
                {event.expectedAttendance && (
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C8A661]" />
                    {event.expectedAttendance} Expected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                {event.website && (
                  <Button asChild size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                    <a href={event.website} target="_blank" rel="noopener noreferrer" data-testid="link-event-website">
                      Official Website <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" data-testid="link-get-quote">
                    Get Equipment Quote <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none mb-12">
                <h2>About {event.name}</h2>
                {event.description.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Highlights */}
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#C8A661]" />
                    Event Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {event.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Equipment Brands */}
              {event.equipmentBrands && event.equipmentBrands.length > 0 && (
                <Card className="mb-12">
                  <CardHeader>
                    <CardTitle>Featured Equipment Brands</CardTitle>
                    <CardDescription>
                      Major manufacturers exhibiting at {event.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {event.equipmentBrands.map((brand, i) => (
                        <Badge key={i} variant="secondary" className="text-base py-2 px-4">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-[#0A1628]/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Can't wait for the show? Get competitive quotes now from authorized dealers.
                      </p>
                      <Button asChild size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                        <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                          Request Free Quote <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#C8A661] mt-0.5" />
                      <div>
                        <div className="font-medium">Dates</div>
                        <div className="text-sm text-muted-foreground">
                          {formatEventDate(event.startDate, event.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#C8A661] mt-0.5" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">
                          {event.venue}<br />
                          {event.city}, {event.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-[#C8A661] mt-0.5" />
                      <div>
                        <div className="font-medium">Organizer</div>
                        <div className="text-sm text-muted-foreground">{event.organizer}</div>
                      </div>
                    </div>
                    {event.expectedAttendance && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-[#C8A661] mt-0.5" />
                        <div>
                          <div className="font-medium">Expected Attendance</div>
                          <div className="text-sm text-muted-foreground">{event.expectedAttendance}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Audience Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Who Should Attend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.audienceType.map((audience, i) => (
                        <Badge key={i} variant="outline">{audience}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Card */}
                <Card className="bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] text-white">
                  <CardContent className="pt-6">
                    <Sparkles className="w-8 h-8 text-[#C8A661] mb-4" />
                    <h3 className="text-lg font-bold mb-2">Need Equipment Now?</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Get competitive quotes from authorized Dexter and Continental Girbau dealers.
                    </p>
                    <Button asChild className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                      <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer">
                        Get Free Quote <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IndustryEventsHub;
