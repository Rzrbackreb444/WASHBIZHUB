import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Shield, Zap, Users, CheckCircle, ExternalLink } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function AtmServices() {

  const handleLearnMoreClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'outbound_click', {
        event_category: 'External Resource',
        event_label: 'ATM Depot - Laundromat Services',
        value: 'atm_services'
      });
    }
    window.open('https://atmdepot.com/laundromat', '_blank', 'noopener,noreferrer');
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Passive Revenue Stream",
      description: "Earn surcharge income on every ATM transaction without any operational effort. Most laundromat ATMs generate $200-$800+ in monthly surcharge revenue, providing consistent passive income."
    },
    {
      icon: TrendingUp,
      title: "Increase Customer Spending",
      description: "Customers with easy cash access spend 20-40% more on average. ATM availability removes a major barrier to using your wash-and-fold, vending machines, and premium services."
    },
    {
      icon: Shield,
      title: "Zero Risk, Zero Investment",
      description: "ATM Depot provides free ATM placement, installation, maintenance, and cash management. You earn revenue without purchasing equipment, managing cash, or handling maintenance."
    },
    {
      icon: Zap,
      title: "Professional Installation & Maintenance",
      description: "Expert technicians handle installation, cash replenishment, software updates, and 24/7 monitoring. If issues arise, ATM Depot resolves them quickly—you never lift a finger."
    },
    {
      icon: Users,
      title: "Enhanced Customer Convenience",
      description: "Customers appreciate on-site ATM access, especially in self-service environments. This convenience improves customer satisfaction and increases repeat visits to your location."
    },
    {
      icon: CheckCircle,
      title: "Proven Laundromat Solution",
      description: "ATM Depot specializes in laundromat ATM placements with hundreds of successful installations nationwide. They understand your industry's unique needs and foot traffic patterns."
    }
  ];

  const features = [
    "Free ATM equipment and installation",
    "No upfront costs or monthly fees",
    "Cash management and replenishment handled",
    "24/7 technical support and monitoring",
    "Surcharge revenue paid monthly",
    "Compliance with all banking regulations",
    "Vandalism and theft insurance coverage",
    "Remote diagnostics and software updates"
  ];

  const faq = [
    {
      question: "How much revenue can I expect from an ATM?",
      answer: "Laundromat ATMs typically generate $200-$800+ in monthly surcharge revenue, depending on foot traffic and location. Most operators set surcharges between $2.50-$3.50 per transaction. High-traffic locations with wash-and-fold services or commercial accounts often see higher transaction volumes."
    },
    {
      question: "Do I need to invest any money upfront?",
      answer: "No! ATM Depot provides the ATM equipment, installation, and all ongoing maintenance at no cost to you. You simply provide floor or wall space and electrical access. There are no upfront fees, equipment purchases, or monthly charges."
    },
    {
      question: "Who handles cash management and refills?",
      answer: "ATM Depot manages all cash logistics. Their armored car service replenishes cash before the machine runs low, ensuring 24/7 availability for your customers. You never touch cash or manage the ATM's money supply."
    },
    {
      question: "What if the ATM breaks down or has technical issues?",
      answer: "ATM Depot provides 24/7 monitoring and support. If technical issues arise, their team diagnoses problems remotely and dispatches technicians for on-site repairs if needed. Maintenance, repairs, and parts are covered at no cost to you."
    },
    {
      question: "How long is the commitment, and can I cancel?",
      answer: "ATM Depot typically requires a multi-year placement agreement (terms vary). This protects their investment in equipment and installation. However, if the ATM underperforms or you're unsatisfied, they work with you to find solutions. Contact them to discuss specific contract terms."
    },
    {
      question: "Will the ATM take up valuable space in my laundromat?",
      answer: "ATMs have a small footprint—typically 2-3 square feet. Most laundromats place them near entrances or waiting areas where they're highly visible but don't interfere with washing/folding operations. The revenue potential far exceeds the opportunity cost of the space."
    }
  ];

  const seoFaqs = [
    {
      question: "How much revenue can I expect from an ATM?",
      answer: "Laundromat ATMs typically generate $200-$800+ in monthly surcharge revenue, depending on foot traffic and location. Most operators set surcharges between $2.50-$3.50 per transaction. High-traffic locations often see higher transaction volumes."
    },
    {
      question: "Do I need to invest any money upfront?",
      answer: "No! ATM Depot provides the ATM equipment, installation, and all ongoing maintenance at no cost to you. You simply provide floor or wall space and electrical access. There are no upfront fees, equipment purchases, or monthly charges."
    },
    {
      question: "Who handles cash management and refills?",
      answer: "ATM Depot manages all cash logistics. Their armored car service replenishes cash before the machine runs low, ensuring 24/7 availability for your customers. You never touch cash or manage the ATM's money supply."
    },
    {
      question: "What if the ATM breaks down or has technical issues?",
      answer: "ATM Depot provides 24/7 monitoring and support. If technical issues arise, their team diagnoses problems remotely and dispatches technicians for on-site repairs if needed. Maintenance, repairs, and parts are covered at no cost to you."
    },
    {
      question: "Will the ATM increase my laundromat revenue?",
      answer: "Yes! Customers with easy cash access spend 20-40% more on average. ATM availability removes barriers to using wash-and-fold, vending machines, and premium services, increasing overall per-customer spending."
    }
  ];

  return (
    <>
      <SEO
        title="ATM Services for Laundromats - Free Installation"
        description="Add $200-$800/month passive income with free ATM installation. Zero upfront cost, full maintenance included. Boost customer spending 20-40%."
        canonicalUrl="/atm-services"
        keywords={[
          "laundromat ATM services",
          "ATM for laundromat",
          "free ATM installation",
          "laundry ATM revenue",
          "coin laundry ATM",
          "passive income laundromat",
          "ATM placement laundromat",
          "ATM Depot laundromat",
          "laundromat cash services",
          "ATM surcharge revenue",
          "laundromat business income",
          "commercial laundry ATM",
          "laundromat customer convenience"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/resources" },
          { name: "ATM Services", url: "/atm-services" }
        ]}
        faqs={seoFaqs}
      />
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-50"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Add Passive Income to Your Laundromat with Professional ATM Services
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Partner with ATM Depot to install a free ATM in your laundromat. Earn surcharge revenue, increase customer spending, and boost cash flow—with zero upfront investment or ongoing management.
            </p>
            <Button
              onClick={handleLearnMoreClick}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full"
              data-testid="button-learn-more-atm"
            >
              Get Free ATM Installation
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4 bg-card/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Add an ATM to Your Laundromat?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20" data-testid={`card-benefit-${index}`}>
                  <CardHeader>
                    <Icon className="h-12 w-12 text-accent mb-4" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            What's Included with ATM Depot Services
          </h2>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3" data-testid={`feature-${index}`}>
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <span className="text-white/90 text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Business Case */}
      <section className="py-16 px-4 bg-card/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            The Smart Business Case for Laundromat ATMs
          </h2>
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Increase Overall Revenue Per Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-lg leading-relaxed">
                  When customers have easy access to cash at your laundromat, they're significantly more likely to use premium services, purchase laundry supplies from vending machines, and utilize wash-and-fold services. Studies show ATM availability increases per-customer spending by 20-40% on average. The ATM becomes a revenue multiplier for your entire operation—not just through surcharge fees, but by removing friction from higher-margin service purchases.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">True Passive Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-lg leading-relaxed">
                  Unlike most revenue strategies that require additional labor, inventory, or operational complexity, an ATM generates income while you sleep. ATM Depot handles installation, cash management, compliance, maintenance, and technical support. You receive monthly surcharge revenue deposits with zero operational involvement. For busy laundromat owners juggling multiple responsibilities, this hands-off income stream is invaluable.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Competitive Advantage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-lg leading-relaxed">
                  In competitive markets, customer convenience differentiates your laundromat from competitors. An on-site ATM signals professionalism and customer-first thinking. Customers remember which locations make their lives easier—and they return to those locations consistently. This small amenity can be the deciding factor when customers choose between your location and a competitor's, especially for wash-and-fold customers who may need cash for tipping.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faq.map((item, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20" data-testid={`card-faq-${index}`}>
                <CardHeader>
                  <CardTitle className="text-xl text-white">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 leading-relaxed">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Add Passive Income to Your Laundromat?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Contact ATM Depot today to schedule a free consultation and site evaluation. Their laundromat specialists will assess your location's potential and design a custom ATM solution—at no cost to you.
          </p>
          <Button
            onClick={handleLearnMoreClick}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full"
            data-testid="button-contact-footer"
          >
            Get Free ATM Installation
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-white/60 mt-4 text-sm">
            No upfront costs • Free installation • Monthly revenue payments
          </p>
        </div>
      </section>

    </div>
    </>
  );
}
