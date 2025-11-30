import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ShoppingBag, Award, Shield, TrendingUp } from "lucide-react";

interface TestimonialProps {
  name: string;
  role: string;
  company?: string;
  rating: number;
  text: string;
  image?: string;
}

export function Testimonial({ name, role, company, rating, text, image }: TestimonialProps) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
            />
          ))}
        </div>
        <p className="text-muted-foreground mb-4 italic">"{text}"</p>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <span className="font-semibold text-primary">{name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{role}{company ? ` at ${company}` : ''}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg">
        <Shield className="h-8 w-8 text-primary mb-2" />
        <p className="font-semibold text-sm">Secure Checkout</p>
        <p className="text-xs text-muted-foreground">Protected payments</p>
      </div>
      <div className="flex flex-col items-center text-center p-4 bg-accent/5 rounded-lg">
        <Award className="h-8 w-8 text-accent mb-2" />
        <p className="font-semibold text-sm">Certified Partners</p>
        <p className="text-xs text-muted-foreground">Authorized Dealers</p>
      </div>
      <div className="flex flex-col items-center text-center p-4 bg-green-500/5 rounded-lg">
        <ShoppingBag className="h-8 w-8 text-green-600 mb-2" />
        <p className="font-semibold text-sm">Free Shipping</p>
        <p className="text-xs text-muted-foreground">Orders $500+</p>
      </div>
      <div className="flex flex-col items-center text-center p-4 bg-blue-500/5 rounded-lg">
        <Star className="h-8 w-8 text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Expert Support</p>
        <p className="text-xs text-muted-foreground">24/7 Available</p>
      </div>
    </div>
  );
}

export function SocialProofStats() {
  const stats = [
    { icon: Users, value: "15,000+", label: "Customers Served", color: "text-primary" },
    { icon: ShoppingBag, value: "$50M+", label: "Equipment Sold", color: "text-accent" },
    { icon: Star, value: "4.9/5", label: "Average Rating", color: "text-yellow-500" },
    { icon: TrendingUp, value: "98%", label: "Customer Satisfaction", color: "text-green-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="text-center p-4 bg-card border rounded-lg">
            <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export const TESTIMONIALS: TestimonialProps[] = [
  {
    name: "Sarah Johnson",
    role: "Owner",
    company: "Clean Sweep Laundromat",
    rating: 5,
    text: "WashBizHub helped me find the perfect equipment package. The ROI calculator was spot-on, and I recouped my investment in just 18 months!"
  },
  {
    name: "Mike Rodriguez",
    role: "Multi-Location Operator",
    company: "Rodriguez Laundry Centers",
    rating: 5,
    text: "The buyer's guides saved me thousands. I compared 10+ washers and chose the most efficient option. My utility costs are down 30%."
  },
  {
    name: "Lisa Chen",
    role: "New Owner",
    company: "Fresh Start Laundromat",
    rating: 5,
    text: "As a first-time owner, the startup guide was invaluable. Step-by-step instructions made the entire process smooth and stress-free."
  },
  {
    name: "David Thompson",
    role: "Equipment Manager",
    company: "QuickWash Express",
    rating: 5,
    text: "The equipment comparison tool helped me justify the Speed Queen purchase to my investors. We're seeing 40% better reliability than our old machines."
  },
  {
    name: "Jennifer Martinez",
    role: "Owner",
    company: "Sparkling Clean Laundry",
    rating: 5,
    text: "Amazon affiliate links made ordering parts so easy! One-click ordering with tracking. My downtime is cut in half."
  },
  {
    name: "Robert Kim",
    role: "Franchise Owner",
    rating: 5,
    text: "The financing guide connected me with an SBA lender who approved my $500K loan. Without WashBizHub, I'd still be searching for funding."
  }
];

export function SuccessStories() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">Success Stories</Badge>
        <h2 className="text-3xl font-bold mb-3">Real Results from Real Owners</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of successful laundromat owners who trust WashBizHub for equipment decisions
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, idx) => (
          <Testimonial key={idx} {...testimonial} />
        ))}
      </div>
    </div>
  );
}
