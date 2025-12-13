import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, Wrench, Package, Building2, TrendingUp, 
  ArrowRight, Sparkles, DollarSign, Users, CheckCircle
} from "lucide-react";

const partnerActions = [
  {
    href: "/listing-form",
    title: "Add a Listing",
    description: "List laundromats, equipment, services, or products",
    icon: Store,
    badge: "START HERE",
    badgeColor: "bg-[#39CCCC]",
    highlight: true,
    stats: "5 listing types",
    color: "from-[#39CCCC] to-teal-600"
  },
  {
    href: "/listing-form",
    title: "Sell Your Laundromat",
    description: "Get your business in front of 73,000+ buyers",
    icon: Store,
    badge: "FREE",
    badgeColor: "bg-green-500",
    highlight: true,
    stats: "500+ active buyers",
    color: "from-green-500 to-emerald-600"
  },
  {
    href: "/list-equipment",
    title: "Sell Equipment",
    description: "List washers, dryers, or parts for sale",
    icon: Wrench,
    badge: null,
    highlight: false,
    stats: "Quick 2-min listing",
    color: "from-blue-500 to-blue-600"
  },
  {
    href: "/advertise",
    title: "Advertise With Us",
    description: "Reach the industry's largest online audience",
    icon: TrendingUp,
    badge: "HOT",
    badgeColor: "bg-orange-500",
    highlight: true,
    stats: "73K+ monthly views",
    color: "from-orange-500 to-red-500"
  },
];

export function PartnerActionsSection() {
  return (
    <section 
      className="py-16 sm:py-20 bg-gradient-to-br from-[#001F3F] via-[#002B5C] to-[#001F3F] relative overflow-hidden"
      data-testid="section-partner-actions"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#39CCCC] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-green-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
            <DollarSign className="w-3 h-3 mr-1" />
            Sell, List, or Advertise
          </Badge>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            data-testid="text-partner-heading"
          >
            Ready to Reach 73,000+ Buyers?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            List your business, equipment, or services - it takes less than 2 minutes
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {partnerActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card 
                className={`
                  p-5 h-full bg-white/5 border-2 border-white/10 
                  hover:border-white/30 hover-elevate active-elevate-2 
                  transition-all cursor-pointer group relative overflow-hidden
                  ${action.highlight ? 'ring-2 ring-[#39CCCC]/50' : ''}
                `}
                data-testid={`card-partner-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {action.badge && (
                  <Badge 
                    className={`absolute top-3 right-3 ${action.badgeColor} text-white text-xs font-bold`}
                  >
                    {action.badge}
                  </Badge>
                )}
                
                <div className={`
                  inline-flex items-center justify-center w-12 h-12 rounded-xl 
                  bg-gradient-to-br ${action.color} text-white mb-4
                  group-hover:scale-110 transition-transform
                `}>
                  <action.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#39CCCC] transition-colors">
                  {action.title}
                </h3>
                
                <p className="text-sm text-white/60 mb-3 leading-relaxed">
                  {action.description}
                </p>
                
                <div className="flex items-center text-xs text-[#39CCCC]">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {action.stats}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/partner">
            <Button 
              size="lg"
              className="bg-[#39CCCC] text-[#001F3F] hover:bg-[#2db8b8] font-bold shadow-lg shadow-[#39CCCC]/20"
              data-testid="button-view-all-partner"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              View All Partnership Options
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function QuickListBanner() {
  return (
    <section 
      className="py-8 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 relative overflow-hidden"
      data-testid="section-quick-list-banner"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Selling Your Laundromat?
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              List it FREE and reach 73,000+ qualified buyers instantly
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/listing-form">
              <Button 
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 font-bold shadow-lg"
                data-testid="button-list-free-banner"
              >
                <Store className="mr-2 h-5 w-5" />
                List For FREE
              </Button>
            </Link>
            <Link href="/advertise">
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold"
                data-testid="button-advertise-banner"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Advertise
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
