import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Phone,
  Shirt,
  Scale,
  Users,
  Shield,
  Timer,
  ChevronRight,
  Play,
  Quote,
  TrendingUp,
  DollarSign,
  Calendar,
  Package
} from "lucide-react";

// This is a DEMO of what a user's Londr-style business would look like
// When hosted on WashBizHub, all these values come from their Business Builder config

const DEMO_BUSINESS = {
  name: "Fresh & Clean Laundry",
  tagline: "LA's #1 Laundry Pickup & Delivery Service",
  primaryColor: "#00A699",
  secondaryColor: "#F59E0B",
  pricePerPound: 1.75,
  minimumOrder: 10,
  freeDeliveryThreshold: 30,
  turnaroundHours: 24,
  zones: ["Downtown LA", "Hollywood", "Westside", "Santa Monica", "Beverly Hills", "Culver City"],
  stats: {
    orders: "50,000+",
    customers: "15,000+",
    rating: 4.9,
    years: 5,
  },
};

const SERVICES = [
  {
    name: "Wash & Fold",
    price: "$1.75/lb",
    description: "Professional washing, drying, and neatly folded",
    icon: Shirt,
    color: "#00A699",
  },
  {
    name: "Pickup & Delivery",
    price: "FREE",
    description: "We pick up and deliver to your door",
    icon: Truck,
    color: "#3B82F6",
  },
  {
    name: "Express Service",
    price: "+$10",
    description: "Same-day turnaround when you need it fast",
    icon: Zap,
    color: "#F59E0B",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Schedule Pickup",
    description: "Book a convenient time slot online. We'll be there!",
    icon: Calendar,
  },
  {
    step: 2,
    title: "We Collect",
    description: "Our driver picks up your laundry from your door",
    icon: Package,
  },
  {
    step: 3,
    title: "Expert Care",
    description: "We wash, dry, and fold with care using premium products",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "Delivered Clean",
    description: "Fresh, clean laundry delivered back to you",
    icon: Truck,
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Busy Mom",
    text: "Fresh & Clean has been a lifesaver! With three kids, laundry was taking over my weekends. Now I just schedule a pickup and it comes back perfectly folded. Worth every penny!",
    rating: 5,
  },
  {
    name: "Mike T.",
    role: "Tech Professional",
    text: "I work 60+ hours a week. This service gives me my weekends back. The app is easy to use and my clothes always come back smelling amazing.",
    rating: 5,
  },
  {
    name: "Lisa R.",
    role: "Apartment Dweller",
    text: "No washer in my building and the laundromat is a pain. Fresh & Clean is cheaper than the coin machines and I don't have to do anything!",
    rating: 5,
  },
];

const PRICING_TIERS = [
  {
    name: "Pay As You Go",
    price: "$1.75",
    unit: "/lb",
    description: "Perfect for occasional users",
    features: ["No commitment", "Pay per order", "Free delivery over $30", "24-hour turnaround"],
    color: "#00A699",
  },
  {
    name: "Weekly Plan",
    price: "$69",
    unit: "/month",
    description: "1 pickup per week (up to 20 lbs)",
    features: ["Save 20%", "Priority scheduling", "Free express once/month", "Loyalty rewards"],
    popular: true,
    color: "#3B82F6",
  },
  {
    name: "Unlimited",
    price: "$149",
    unit: "/month",
    description: "For busy households & families",
    features: ["Unlimited pickups", "Up to 100 lbs/month", "Always free delivery", "VIP support"],
    color: "#8B5CF6",
  },
];

export default function LondrDemoPage() {
  const [, setLocation] = useLocation();
  const [zipCode, setZipCode] = useState('');

  return (
    <>
      <Helmet>
        <title>{DEMO_BUSINESS.name} | Professional Laundry Pickup & Delivery</title>
        <meta name="description" content={`${DEMO_BUSINESS.tagline}. Professional wash & fold service starting at just $${DEMO_BUSINESS.pricePerPound}/lb with free pickup and delivery.`} />
      </Helmet>

      <div className="min-h-screen">
        {/* Navigation */}
        <nav 
          className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${DEMO_BUSINESS.primaryColor}15` }}
                >
                  <Sparkles className="h-6 w-6" style={{ color: DEMO_BUSINESS.primaryColor }} />
                </div>
                <span className="font-bold text-xl">{DEMO_BUSINESS.name}</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <a href="#services" className="text-sm hover:text-primary transition-colors">Services</a>
                <a href="#how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</a>
                <a href="#pricing" className="text-sm hover:text-primary transition-colors">Pricing</a>
                <a href="#reviews" className="text-sm hover:text-primary transition-colors">Reviews</a>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">Login</Button>
                <Button 
                  size="sm"
                  style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}
                  onClick={() => setLocation('/order')}
                  data-testid="button-order-now-nav"
                >
                  Order Now
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section 
          className="relative py-20 overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${DEMO_BUSINESS.primaryColor}10 0%, ${DEMO_BUSINESS.secondaryColor}10 100%)` 
          }}
        >
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-8">
                <Badge 
                  className="text-sm px-4 py-2"
                  style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}
                >
                  {DEMO_BUSINESS.tagline}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Laundry Done.
                  <br />
                  <span style={{ color: DEMO_BUSINESS.primaryColor }}>Life Simplified.</span>
                </h1>
                
                <p className="text-xl text-muted-foreground">
                  Professional wash & fold service with free pickup and delivery. 
                  Spend your time on what matters - we'll handle the laundry.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex">
                      <Input 
                        placeholder="Enter your ZIP code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="rounded-r-none"
                        data-testid="input-zip-hero"
                      />
                      <Button 
                        className="rounded-l-none gap-2"
                        style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}
                        onClick={() => setLocation('/order')}
                        data-testid="button-get-started"
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-medium">{DEMO_BUSINESS.stats.rating} stars</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>{DEMO_BUSINESS.stats.customers} happy customers</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Visual */}
              <div className="relative">
                <div 
                  className="aspect-square rounded-3xl p-8 flex items-center justify-center"
                  style={{ backgroundColor: `${DEMO_BUSINESS.primaryColor}15` }}
                >
                  <div className="text-center space-y-6">
                    <div 
                      className="inline-flex p-6 rounded-full"
                      style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}
                    >
                      <Shirt className="h-20 w-20 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-5xl font-bold" style={{ color: DEMO_BUSINESS.primaryColor }}>
                        ${DEMO_BUSINESS.pricePerPound}
                      </div>
                      <div className="text-xl text-muted-foreground">per pound</div>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {DEMO_BUSINESS.turnaroundHours}-hour turnaround
                    </Badge>
                  </div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-background rounded-xl shadow-lg p-4 border">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="font-medium">Free Pickup</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-background rounded-xl shadow-lg p-4 border">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-medium">100% Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-8 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold" style={{ color: DEMO_BUSINESS.primaryColor }}>
                  {DEMO_BUSINESS.stats.orders}
                </div>
                <div className="text-sm text-muted-foreground">Orders Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: DEMO_BUSINESS.primaryColor }}>
                  {DEMO_BUSINESS.stats.customers}
                </div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: DEMO_BUSINESS.primaryColor }}>
                  {DEMO_BUSINESS.stats.rating}★
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: DEMO_BUSINESS.primaryColor }}>
                  {DEMO_BUSINESS.stats.years}+ Years
                </div>
                <div className="text-sm text-muted-foreground">Serving LA</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4" style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}>Our Services</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Professional Laundry Care</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                We handle everything from everyday clothes to delicates with the same level of care and attention
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {SERVICES.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div 
                      className="absolute top-0 left-0 w-full h-1"
                      style={{ backgroundColor: service.color }}
                    />
                    <CardHeader>
                      <div 
                        className="p-3 rounded-xl w-fit mb-4"
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: service.color }} />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        {service.name}
                        <Badge variant="outline" style={{ borderColor: service.color, color: service.color }}>
                          {service.price}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4" style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}>How It Works</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Easy as 1-2-3-4</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Getting your laundry done has never been simpler
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-4">
              {HOW_IT_WORKS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center relative">
                    {index < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-1/2 w-full">
                        <ChevronRight className="h-8 w-8 text-muted-foreground/30 ml-auto mr-0" />
                      </div>
                    )}
                    <div 
                      className="inline-flex p-4 rounded-2xl mb-4"
                      style={{ backgroundColor: `${DEMO_BUSINESS.primaryColor}15` }}
                    >
                      <Icon className="h-8 w-8" style={{ color: DEMO_BUSINESS.primaryColor }} />
                    </div>
                    <div 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm mb-3"
                      style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}
                    >
                      {step.step}
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4" style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}>Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                No hidden fees. No surprises. Just clean laundry.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {PRICING_TIERS.map((tier, index) => (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden ${tier.popular ? 'border-2 scale-105' : ''}`}
                  style={tier.popular ? { borderColor: tier.color } : {}}
                >
                  {tier.popular && (
                    <div 
                      className="absolute top-0 right-0 px-4 py-1 text-white text-sm font-medium"
                      style={{ backgroundColor: tier.color }}
                    >
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="flex items-baseline gap-1 pt-4">
                      <span className="text-4xl font-bold" style={{ color: tier.color }}>
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">{tier.unit}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      style={tier.popular ? { backgroundColor: tier.color } : {}}
                      onClick={() => setLocation('/order')}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4" style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}>Reviews</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-muted-foreground/20 mb-2" />
                    <p className="text-muted-foreground mb-4">{testimonial.text}</p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}
                      >
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4" style={{ backgroundColor: DEMO_BUSINESS.primaryColor }}>Service Areas</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">We Deliver To</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {DEMO_BUSINESS.zones.map((zone, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-lg px-4 py-2"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-20"
          style={{ 
            background: `linear-gradient(135deg, ${DEMO_BUSINESS.primaryColor} 0%, ${DEMO_BUSINESS.secondaryColor} 100%)` 
          }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Schedule your first pickup today and get 20% off your order!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2"
                onClick={() => setLocation('/order')}
                data-testid="button-schedule-pickup"
              >
                Schedule Pickup
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 gap-2"
              >
                <Phone className="h-5 w-5" />
                Call Us
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${DEMO_BUSINESS.primaryColor}15` }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: DEMO_BUSINESS.primaryColor }} />
                </div>
                <span className="font-bold">{DEMO_BUSINESS.name}</span>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Powered by <span className="font-medium text-primary">WashBizHub</span> | 
                The #1 Laundry Business Platform
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
