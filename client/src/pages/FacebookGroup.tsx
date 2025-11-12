import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, TrendingUp, BookOpen, Award, ExternalLink } from "lucide-react";

export default function FacebookGroup() {
  useEffect(() => {
    document.title = "Join the #1 Laundromat Owners Facebook Group | WashBizHub Community";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect with 10,000+ laundromat owners, operators, and investors in the most active Facebook community. Get real-time advice, industry insights, equipment recommendations, and business strategies from experienced professionals.');
    }
  }, []);

  const handleJoinClick = () => {
    window.gtag?.('event', 'outbound_click', {
      event_category: 'External Resource',
      event_label: 'Facebook Group - AAdvantage Laundry',
      value: 'facebook_group'
    });
    window.open('https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry', '_blank', 'noopener,noreferrer');
  };

  const benefits = [
    {
      icon: Users,
      title: "10,000+ Active Members",
      description: "Join the largest community of laundromat owners, operators, investors, and industry professionals sharing real-world experiences and proven strategies."
    },
    {
      icon: MessageCircle,
      title: "Real-Time Support & Advice",
      description: "Get instant answers to your questions from experienced operators who've faced the same challenges. From equipment breakdowns to pricing strategies, the community has your back."
    },
    {
      icon: TrendingUp,
      title: "Business Growth Strategies",
      description: "Learn proven tactics to increase revenue, reduce costs, and optimize operations. Members share successful marketing campaigns, route efficiency tips, and expansion strategies."
    },
    {
      icon: BookOpen,
      title: "Industry News & Trends",
      description: "Stay ahead with the latest equipment innovations, regulatory changes, technology integrations, and market trends affecting the laundry industry."
    },
    {
      icon: Award,
      title: "Vendor & Equipment Reviews",
      description: "Make informed purchasing decisions with honest reviews and recommendations from members who've tested equipment, services, and technologies in real-world conditions."
    }
  ];

  const faq = [
    {
      question: "Who should join this Facebook group?",
      answer: "This group is perfect for laundromat owners, operators, prospective investors, brokers, equipment vendors, and anyone interested in the coin laundry industry. Whether you're running a single location or managing a multi-unit operation, you'll find valuable insights."
    },
    {
      question: "Is this group only for experienced owners?",
      answer: "Absolutely not! The group welcomes everyone from first-time investors researching their first purchase to seasoned operators with decades of experience. New members often receive the warmest welcomes and most detailed advice."
    },
    {
      question: "What kind of topics are discussed?",
      answer: "Members discuss equipment maintenance, pricing strategies, marketing tactics, pickup & delivery services, competitor analysis, financial modeling, lease negotiations, employee management, technology integration, and much more. If it relates to running a successful laundry business, it's discussed here."
    },
    {
      question: "How active is the community?",
      answer: "Extremely active! New posts appear daily, with dozens of comments and discussions. Most questions receive multiple responses within hours. The group maintains a helpful, professional atmosphere focused on mutual success."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-50"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Join the #1 Laundromat Owners Facebook Community
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Connect with 10,000+ laundromat owners, operators, and industry experts. Get real-time advice, proven strategies, and insider knowledge to grow your laundry business.
            </p>
            <Button
              onClick={handleJoinClick}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full"
              data-testid="button-join-facebook-group"
            >
              Join the Community Now
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4 bg-card/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Join the AAdvantage Laundry Community?
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

      {/* What Members Say */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            What Makes This Community Different?
          </h2>
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="pt-6">
                <p className="text-white/90 text-lg leading-relaxed mb-4">
                  Unlike generic business forums, the AAdvantage Laundry Facebook Group is 100% focused on the coin laundry industry. Every member understands the unique challenges of running laundromats—from dealing with equipment breakdowns at 2 AM to optimizing route efficiency for pickup and delivery services.
                </p>
                <p className="text-white/90 text-lg leading-relaxed mb-4">
                  The community culture emphasizes collaboration over competition. Members freely share their revenue numbers, equipment costs, marketing results, and operational strategies. This transparency creates an environment where everyone learns faster and makes better decisions.
                </p>
                <p className="text-white/90 text-lg leading-relaxed">
                  Whether you're evaluating your first laundromat purchase, scaling to multiple locations, or exploring innovative services like wash-and-fold or commercial accounts, you'll find members who've successfully navigated the same path and are eager to help you succeed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-card/5">
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Level Up Your Laundromat Business?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of successful operators who are already sharing insights, solving problems together, and growing their businesses faster in the AAdvantage Laundry community.
          </p>
          <Button
            onClick={handleJoinClick}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full"
            data-testid="button-join-footer"
          >
            Join the Community Now
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-white/60 mt-4 text-sm">
            Free to join • 10,000+ active members • Daily discussions
          </p>
        </div>
      </section>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Join the #1 Laundromat Owners Facebook Group",
          "description": "Connect with 10,000+ laundromat owners, operators, and investors in the most active Facebook community for the coin laundry industry.",
          "url": "https://washbizhub.com/facebook-group",
          "mainEntity": {
            "@type": "Organization",
            "name": "AAdvantage Laundry Facebook Group",
            "url": "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry",
            "sameAs": "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry"
          }
        })
      }} />
    </div>
  );
}
