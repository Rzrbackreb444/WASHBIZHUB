import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  TrendingUp, 
  MessageSquare,
  Phone,
  Mail,
  Linkedin,
  Globe,
  CheckCircle2,
  Star,
  Users,
  Building2,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function AboutUsPage() {
  const teamMembers = [
    {
      name: "Nick",
      title: "Founder & Chief Innovation Officer",
      subtitle: "Creator of the Laundromat Bible",
      image: null, // Placeholder - user can add photo later
      bio: "Nick is the visionary founder behind WashBizHub and the author of the industry-defining Laundromat Bible. With over a decade of experience in laundromat operations, business intelligence, and software development, Nick has revolutionized how laundromat owners approach their businesses through data-driven insights and cutting-edge technology.",
      expertise: [
        "Laundromat Operations & Optimization",
        "Business Intelligence & Analytics",
        "IoT & Machine Learning Integration",
        "Financial Modeling & Valuation",
        "Strategic Growth Planning"
      ],
      credentials: [
        "Author: The Laundromat Bible (2,800+ diagnostic codes)",
        "Developer: CLEANBI™ 17-Factor Scoring System",
        "Creator: 50+ Industry Calculators & Templates",
        "Pioneer: AI-Powered Laundromat Consulting",
        "Innovator: Bloomberg-Grade Visualization for Laundromats"
      ],
      contact: {
        phone: import.meta.env.VITE_CONTACT_PHONE || "1-479-883-4314",
        phoneDigits: import.meta.env.VITE_CONTACT_PHONE_DIGITS || "14798834314",
        email: "nick@washbizhub.com"
      },
      color: "from-accent/20 to-yellow-500/20",
      borderColor: "border-accent/30"
    },
    {
      name: '"Laundromat" Larry Larsen',
      title: "Senior Industry Advisor",
      subtitle: "50+ Years of Laundromat Expertise",
      image: null,
      bio: '"Laundromat" Larry Larsen is a legendary figure in the laundromat industry with over five decades of hands-on experience. As a sought-after consultant, Larry has personally evaluated hundreds of laundromat businesses and guided countless entrepreneurs to success. His practical wisdom and deep industry knowledge form the foundation of WashBizHub\'s due diligence framework.',
      expertise: [
        "Laundromat Acquisition Due Diligence",
        "Equipment Evaluation & Maintenance",
        "Real Estate & Location Analysis",
        "Operational Excellence & Efficiency",
        "Seller/Buyer Negotiation Strategy"
      ],
      credentials: [
        "50+ Years Laundromat Industry Experience",
        "Evaluated 500+ Laundromat Transactions",
        "Equipment Expert: Dexter, Speed Queen, Huebsch, Maytag",
        "Author: Larry Larsen Due Diligence Suite"
      ],
      contact: {
        email: "consult@washbizhub.com"
      },
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30"
    }
  ];

  const companyStats = [
    { icon: Users, label: "Potential Customers", value: "72,000+", description: "Laundromats in the US" },
    { icon: BookOpen, label: "Diagnostic Codes", value: "2,800+", description: "In the Laundromat Bible" },
    { icon: Award, label: "Calculators & Tools", value: "50+", description: "Professional templates" },
    { icon: Building2, label: "Equipment Brands", value: "100+", description: "In our marketplace" },
  ];

  const missionValues = [
    {
      icon: Sparkles,
      title: "Innovation First",
      description: "Bringing Bloomberg-grade technology to the laundromat industry through AI, IoT, and advanced analytics."
    },
    {
      icon: CheckCircle2,
      title: "Practical Excellence",
      description: "Combining 50+ years of real-world expertise with cutting-edge software to deliver actionable insights."
    },
    {
      icon: TrendingUp,
      title: "Data-Driven Success",
      description: "Empowering owners with the same tools and intelligence used by Fortune 500 companies."
    },
    {
      icon: Star,
      title: "Industry Leadership",
      description: "Setting new standards for professionalism, transparency, and success in laundromat ownership."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - Meet the Team | WashBizHub</title>
        <meta name="description" content="Meet Nick (Laundromat Bible creator) and Larry Larsen (50+ years experience) - the industry experts behind WashBizHub, The Bloomberg of Laundromats." />
        <meta property="og:title" content="About Us - Industry Experts | WashBizHub" />
        <meta property="og:description" content="Learn about the team behind WashBizHub: Nick's Laundromat Bible and Larry Larsen's 50+ years of industry expertise powering the most advanced laundromat platform." />
        <meta name="author" content="Nick, Laundromat Bible" />
        <meta name="author" content="Larry Larsen, Laundromat123.com" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2a4a6f] to-[#1a2332] text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30" data-testid="badge-industry-experts">
              Industry-Leading Expertise
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6" data-testid="text-page-title">
              Meet the Team Behind
              <span className="block text-accent mt-2">The Bloomberg of Laundromats</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed" data-testid="text-hero-description">
              Combining decades of real-world laundromat expertise with cutting-edge technology 
              to transform the industry's most overlooked businesses into data-driven success stories.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyStats.map((stat, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-stat-${idx}`}>
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                  <div className="text-3xl font-black text-foreground mb-1" data-testid={`text-stat-value-${idx}`}>
                    {stat.value}
                  </div>
                  <div className="font-semibold text-foreground mb-1" data-testid={`text-stat-label-${idx}`}>
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid={`text-stat-description-${idx}`}>
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4" data-testid="text-team-section-title">
              Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Industry pioneers combining practical expertise with technological innovation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, idx) => (
              <Card 
                key={idx} 
                className={`bg-gradient-to-br ${member.color} border ${member.borderColor} hover-elevate`}
                data-testid={`card-team-member-${idx}`}
              >
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/30 flex items-center justify-center flex-shrink-0">
                      <Users className="h-10 w-10 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-foreground mb-1" data-testid={`text-member-name-${idx}`}>
                        {member.name}
                      </h3>
                      <p className="text-accent font-semibold mb-1" data-testid={`text-member-title-${idx}`}>
                        {member.title}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-member-subtitle-${idx}`}>
                        {member.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-foreground/90 leading-relaxed mb-6" data-testid={`text-member-bio-${idx}`}>
                    {member.bio}
                  </p>

                  {/* Expertise */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-accent" />
                      Areas of Expertise
                    </h4>
                    <div className="space-y-2">
                      {member.expertise.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-accent" />
                      Key Credentials
                    </h4>
                    <div className="space-y-2">
                      {member.credentials.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {member.contact.email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        data-testid={`button-email-${idx}`}
                      >
                        <a href={`mailto:${member.contact.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    )}
                    {member.contact.phone && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        data-testid={`button-phone-${idx}`}
                      >
                        <a href={`tel:+${member.contact.phoneDigits}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    {member.contact.phoneDigits && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        data-testid={`button-whatsapp-${idx}`}
                      >
                        <a 
                          href={`https://wa.me/${member.contact.phoneDigits}?text=Hi%20${member.name}!%20I'd%20like%20to%20learn%20more%20about%20WashBizHub.`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    {member.contact.website && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        data-testid={`button-website-${idx}`}
                      >
                        <a href={`https://${member.contact.website}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4" data-testid="text-mission-section-title">
              Our Mission & Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transforming the laundromat industry through innovation, expertise, and unwavering commitment to success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {missionValues.map((value, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-value-${idx}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <value.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`text-value-title-${idx}`}>
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground" data-testid={`text-value-description-${idx}`}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6" data-testid="text-cta-title">
            Ready to Transform Your Laundromat Business?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of laundromat owners who trust WashBizHub for world-class analytics, 
            expert guidance, and industry-leading tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-get-started">
              <Link href="/seo-command-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-contact-us">
              <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'consult@washbizhub.com'}`}>
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
