import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { 
  Award, Users, BookOpen, Target, CheckCircle2, ArrowRight,
  Star, Calendar, Handshake, TrendingUp, Building2, Wrench,
  GraduationCap, Scale, ShieldCheck, MapPin, Clock, Quote,
  Facebook, Crown, Sparkles, Heart, Zap, Globe, FileSearch
} from "lucide-react";

// Comprehensive keyword-rich content for SEO
const larryCredentials = [
  "50+ years laundromat industry experience",
  "Owned & operated 50+ coin laundries",
  "Designed & built 135+ laundromat locations",
  "Brokered 300+ laundromat transactions",
  "Licensed California Real Estate Broker (DRE)",
  "Licensed Insurance Agent - Laundromat Specialist",
  "Expert witness in 40+ laundromat lawsuits",
  "60+ professional laundromat appraisals",
  "International speaker: Rome, London, Chicago",
  "Former Learning Annex instructor (1992-1998)",
  "BBA American University",
  "Graduate studies Fuller Theological Seminary"
];

const nickCredentials = [
  "Third-generation laundromat operator",
  "Service-side industry veteran",
  "Founder of 72,000+ member Facebook community",
  "Creator of CLEANBI™ scoring algorithm",
  "Author of proprietary valuation formulas",
  "Developer of WashBizHub platform",
  "Stroke survivor & entrepreneur",
  "Multi-state laundromat consultant",
  "Equipment diagnostic specialist",
  "Dexter & Speed Queen certified technician"
];

const partnershipBenefits = [
  {
    title: "Combined 60+ Years Experience",
    description: "Larry's five decades plus Nick's generational expertise creates unmatched industry knowledge for laundromat buyers, sellers, and operators.",
    icon: Clock
  },
  {
    title: "Coast-to-Coast Coverage",
    description: "From Larry's California stronghold to Nick's Arkansas roots, our partnership covers laundromat markets nationwide.",
    icon: Globe
  },
  {
    title: "Technology Meets Tradition",
    description: "Nick's CLEANBI™ algorithm and AI tools paired with Larry's proven due diligence methods deliver modern solutions backed by decades of wisdom.",
    icon: Zap
  },
  {
    title: "72,000+ Community Members",
    description: "Access to the largest laundromat buying/selling community on Facebook - now WashBizHub: Laundromats for Sale.",
    icon: Users
  }
];

const servicesOffered = [
  {
    title: "Pre-Purchase Due Diligence",
    description: "Comprehensive laundromat analysis including lease review, demographic study, equipment inspection, and financial verification before you buy.",
    keywords: "laundromat due diligence, coin laundry inspection, laundromat analysis"
  },
  {
    title: "CLEANBI™ Location Scoring",
    description: "Proprietary 6-factor algorithm analyzing demographics, competition, traffic, accessibility, economics, and location quality for any laundromat site.",
    keywords: "laundromat location analysis, coin laundry site selection, laundromat demographics"
  },
  {
    title: "Laundromat Valuations & Appraisals",
    description: "Professional business valuations using industry-standard multiples, cash flow analysis, and equipment depreciation methodologies.",
    keywords: "laundromat valuation, coin laundry appraisal, laundromat business value"
  },
  {
    title: "Expert Witness Services",
    description: "Professional testimony for laundromat-related litigation, disputes, and legal matters with 40+ case experience.",
    keywords: "laundromat expert witness, coin laundry litigation, laundromat legal expert"
  },
  {
    title: "Store Design & Development",
    description: "Full-service laundromat design from layout optimization to equipment selection, buildout management, and grand opening strategy.",
    keywords: "laundromat design, coin laundry construction, laundromat buildout"
  },
  {
    title: "Brokerage & Acquisition Support",
    description: "Whether buying or selling a laundromat, our combined network and negotiation expertise ensures optimal outcomes.",
    keywords: "laundromat broker, buy laundromat, sell laundromat, coin laundry for sale"
  }
];

const faqItems = [
  {
    question: "How did Nick and Larry meet?",
    answer: "Nick founded the largest laundromat buying and selling community on Facebook, which has grown to over 72,000 members. Larry, with his 50+ years of industry expertise, joined the community and immediately became a trusted voice. Their shared passion for helping laundromat investors avoid costly mistakes and build successful businesses led to a natural partnership. Today, they co-author industry guides and provide joint consulting services through WashBizHub."
  },
  {
    question: "What makes this partnership unique in the laundromat industry?",
    answer: "This partnership combines Larry's half-century of hands-on laundromat experience—having owned 50+ stores, built 135+ locations, and brokered 300+ transactions—with Nick's third-generation family legacy, modern technology solutions like the CLEANBI™ algorithm, and access to a 72,000+ member community. No other consultancy offers this blend of traditional expertise and cutting-edge tools."
  },
  {
    question: "What is CLEANBI™ and how does it help laundromat buyers?",
    answer: "CLEANBI™ is a proprietary location intelligence scoring system developed by Nick that analyzes six critical factors: Competition density, Location quality, Economic indicators, Accessibility, Neighborhood demographics, and Business Infrastructure. Each factor is weighted and scored to provide buyers with an objective assessment of any laundromat opportunity before investing."
  },
  {
    question: "Do you help with laundromat financing and SBA loans?",
    answer: "Yes. Through our Funding Partners Hub, we connect buyers with SBA lenders, equipment financing specialists, and alternative funding sources experienced in laundromat transactions. We also offer an SBA Loan Readiness Checker and AI Business Plan Generator to help buyers prepare strong loan applications."
  },
  {
    question: "Can you help me sell my laundromat?",
    answer: "Absolutely. With Larry's 300+ brokered transactions and our 72,000+ member community of active laundromat buyers, we can help you sell your coin laundry quickly and at the right price. Our seller services include professional valuations, marketing support, and buyer qualification."
  },
  {
    question: "What geographic areas do you serve?",
    answer: "While Larry specializes in California laundromats (particularly Orange County, Los Angeles, and San Diego), and Nick brings expertise from Arkansas and the broader Midwest, our consulting services are available nationwide. The WashBizHub platform and CLEANBI™ system work for any U.S. location."
  }
];

export default function OurPartnership() {
  return (
    <>
      <SEO
        title="Nick Kremers & Larry Larsen Partnership | Laundromat Industry Experts | WashBizHub"
        description="Meet the powerhouse partnership behind WashBizHub: Nick Kremers (third-generation operator, CLEANBI™ creator, 72k+ Facebook community founder) and Larry 'Laundromat Larry' Larsen (50+ years experience, 135+ stores built, 300+ deals brokered). Expert laundromat consulting, valuations, and due diligence."
        canonicalUrl="/our-partnership"
        keywords={[
          "laundromat consultant",
          "laundromat expert",
          "buy laundromat",
          "sell laundromat",
          "laundromat due diligence",
          "coin laundry expert",
          "laundromat valuation",
          "laundromat broker",
          "laundromat investment",
          "coin laundry business",
          "laundromat for sale",
          "laundromat appraisal",
          "laundromat industry expert",
          "Larry Larsen laundromat",
          "Nick Kremers WashBizHub",
          "CLEANBI laundromat",
          "laundromat location analysis",
          "coin laundry consulting",
          "laundromat acquisition",
          "laundromat expert witness",
          "laundromat financing",
          "SBA loan laundromat",
          "laundromat equipment",
          "coin laundry valuation",
          "laundromat business broker"
        ]}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section - Partnership Story */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-amber-500/5 to-background" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-amber-500/10 text-amber-600 border-amber-500/30 px-4 py-1.5">
                <Handshake className="w-4 h-4 mr-2" />
                Industry-Leading Partnership
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Two Generations of Expertise.<br />
                <span className="text-amber-500">One Powerful Partnership.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                When a third-generation laundromat operator with a 72,000-member community meets a 50-year industry veteran who's built 135+ stores — magic happens.
              </p>
            </div>

            {/* Partner Avatars */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-12">
              {/* Nick */}
              <div className="text-center group">
                <Avatar className="w-36 h-36 md:w-44 md:h-44 mx-auto shadow-2xl shadow-primary/20 border-4 border-primary/30 group-hover:border-primary/50 transition-colors">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-5xl md:text-6xl font-bold text-white">
                    NK
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl md:text-2xl font-bold text-foreground">Nick Kremers</h2>
                <p className="text-amber-500 font-medium">"The Stroked-Out Sasquatch"</p>
                <p className="text-sm text-muted-foreground mt-1">Founder & Chief Technology Officer</p>
              </div>

              {/* Partnership Icon */}
              <div className="hidden md:flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Handshake className="w-10 h-10 text-white" />
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-primary/50 via-amber-500 to-amber-500/50 mt-4 rounded-full" />
              </div>

              {/* Larry */}
              <div className="text-center group">
                <Avatar className="w-36 h-36 md:w-44 md:h-44 mx-auto shadow-2xl shadow-amber-500/20 border-4 border-amber-500/30 group-hover:border-amber-500/50 transition-colors">
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-5xl md:text-6xl font-bold text-white">
                    LL
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl md:text-2xl font-bold text-foreground">Larry Larsen</h2>
                <p className="text-amber-500 font-medium">"Laundromat Larry"</p>
                <p className="text-sm text-muted-foreground mt-1">Chief Consultant & Industry Advisor</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
              <Card className="p-4 text-center border-border bg-card/50 backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold text-primary">60+</div>
                <div className="text-sm text-muted-foreground">Years Combined</div>
              </Card>
              <Card className="p-4 text-center border-border bg-card/50 backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold text-amber-500">135+</div>
                <div className="text-sm text-muted-foreground">Stores Built</div>
              </Card>
              <Card className="p-4 text-center border-border bg-card/50 backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold text-green-500">72K+</div>
                <div className="text-sm text-muted-foreground">Community Members</div>
              </Card>
              <Card className="p-4 text-center border-border bg-card/50 backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold text-blue-500">300+</div>
                <div className="text-sm text-muted-foreground">Deals Brokered</div>
              </Card>
            </div>
          </div>
        </section>

        {/* The Story Section */}
        <section className="py-20 bg-muted/30" data-testid="section-story">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <BookOpen className="w-3 h-3 mr-1.5" />
                  Our Story
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  How a Facebook Group Changed Everything
                </h2>
              </div>

              <Card className="p-8 md:p-12 border-border">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Facebook className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mt-0 mb-2">The Birth of a Community</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Nick Kremers didn't set out to build the largest laundromat buying and selling community on Facebook. 
                        It started simply—a place for laundromat owners, buyers, and industry professionals to share knowledge, 
                        post listings, and help each other avoid costly mistakes. What began as a small group exploded into a 
                        <strong className="text-foreground"> 72,000+ member community</strong> now being renamed 
                        <strong className="text-amber-500"> "WashBizHub: Laundromats for Sale."</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mt-0 mb-2">Enter Laundromat Larry</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        When Larry Larsen—a man who had already spent <strong className="text-foreground">50 years</strong> in the 
                        laundromat industry, owned <strong className="text-foreground">50+ stores</strong>, built 
                        <strong className="text-foreground"> 135+ locations</strong>, and brokered 
                        <strong className="text-foreground"> 300+ transactions</strong>—joined the group, his expertise was immediately 
                        recognized. Members flooded him with questions about due diligence, valuations, equipment selection, and lease 
                        negotiations. Larry's willingness to share hard-won wisdom made him the group's most trusted voice.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mt-0 mb-2">A Partnership Forged in Purpose</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Nick saw an opportunity to formalize what was already happening organically. With his third-generation 
                        laundromat background, technology skills, and the <strong className="text-foreground">CLEANBI™ scoring 
                        algorithm</strong> he developed, combined with Larry's unmatched industry credentials, they launched 
                        <strong className="text-amber-500"> WashBizHub</strong>—the definitive platform for laundromat investors, 
                        operators, and industry professionals. Together, they co-authored 
                        <em className="text-foreground"> "WashBizHub: The Ultimate Laundromat Guidebook,"</em> bringing their combined 
                        expertise to a wider audience.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mt-0 mb-2">The Sasquatch's Comeback</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Nick's journey wasn't without challenges. At 36, he suffered a stroke that could have ended his career. 
                        But the same grit inherited from <strong className="text-foreground">Grandpa Jerry</strong>—who hauled 
                        coins across Arkansas backroads—and <strong className="text-foreground">his father</strong>—who kept 
                        Dexter machines running through power outages—fueled Nick's recovery. Today, as the 
                        <em className="text-foreground"> "Stroked-Out Sasquatch,"</em> he channels that resilience into helping 
                        others build wealth through laundromat ownership.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Meet the Partners - Detailed Bios */}
        <section className="py-20" data-testid="section-bios">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Users className="w-3 h-3 mr-1.5" />
                Meet the Experts
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                E-E-A-T: Experience, Expertise, Authority, Trust
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                When it comes to laundromat consulting, our credentials speak for themselves.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Larry's Bio */}
              <Card className="p-8 border-amber-500/20 hover:border-amber-500/40 transition-colors" data-testid="card-larry-bio">
                <div className="flex items-start gap-6 mb-6">
                  <Avatar className="w-20 h-20 shadow-lg shadow-amber-500/20 border-2 border-amber-500/30">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-bold text-white">
                      LL
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Lawrence "Laundromat Larry" Larsen</h3>
                    <p className="text-amber-500 font-medium">Chief Consultant & Industry Advisor</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Orange County, California</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Larry Larsen is the most experienced laundromat consultant in America. With over 
                  <strong className="text-foreground"> five decades</strong> in the coin laundry industry, he has personally 
                  owned and operated <strong className="text-foreground">50+ laundromats</strong>, designed and built 
                  <strong className="text-foreground"> 135+ stores</strong>, and successfully brokered 
                  <strong className="text-foreground"> 300+ laundromat transactions</strong>. He has served as an 
                  <strong className="text-foreground"> expert witness in 40+ laundromat lawsuits</strong> and prepared 
                  <strong className="text-foreground"> 60+ professional appraisals</strong>.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-500" />
                    Education & Credentials
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Bachelor of Business Administration, American University
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Master's Graduate Studies, Fuller Theological Seminary
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Licensed California Real Estate Broker (30+ years)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Licensed California Insurance Agent - Laundromat Specialist
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Career Highlights
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {larryCredentials.slice(0, 8).map((cred, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Nick's Bio */}
              <Card className="p-8 border-primary/20 hover:border-primary/40 transition-colors" data-testid="card-nick-bio">
                <div className="flex items-start gap-6 mb-6">
                  <Avatar className="w-20 h-20 shadow-lg shadow-primary/20 border-2 border-primary/30">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
                      NK
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Nicholas "Stroked-Out Sasquatch" Kremers</h3>
                    <p className="text-primary font-medium">Founder & Chief Technology Officer</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Arkansas / Nationwide</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Nick Kremers represents the <strong className="text-foreground">third generation</strong> of the Kremers 
                  laundromat legacy. His grandfather <strong className="text-foreground">Jerry</strong> pioneered coin-op 
                  routes across Arkansas backroads, while his father mastered <strong className="text-foreground">Dexter 
                  equipment repairs</strong> and operations. Nick grew up learning the business from the ground up—from 
                  coin hauling to machine diagnostics. After surviving a <strong className="text-foreground">stroke at age 
                  36</strong>, he channeled his recovery into building <strong className="text-foreground">WashBizHub</strong> 
                  and creating the industry's most advanced location intelligence tools.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Innovations & Contributions
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Created CLEANBI™ location intelligence scoring algorithm
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Built 72,000+ member Facebook community (largest in industry)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Developed proprietary laundromat valuation formulas
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Launched AI Consultation Council for expert guidance
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    Technical Expertise
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {nickCredentials.slice(0, 8).map((cred, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="py-20 bg-muted/30" data-testid="section-benefits">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
                <TrendingUp className="w-3 h-3 mr-1.5" />
                Why Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                The Power of Partnership
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                What makes our collaboration the gold standard in laundromat consulting
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {partnershipBenefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <Card key={idx} className="p-6 border-border hover:border-primary/30 transition-colors" data-testid={`card-benefit-${idx}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Grid - SEO Rich */}
        <section className="py-20" data-testid="section-services">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">
                <FileSearch className="w-3 h-3 mr-1.5" />
                Expert Services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Comprehensive Laundromat Consulting Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From first-time buyers to multi-store operators, we provide the guidance you need 
                to make informed decisions in the coin laundry industry.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesOffered.map((service, idx) => (
                <Card key={idx} className="p-6 border-border hover:border-amber-500/30 transition-colors" data-testid={`card-service-${idx}`}>
                  <h3 className="text-lg font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.keywords.split(", ").map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-muted-foreground">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The Book Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-amber-500/5 to-background" data-testid="section-book">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <BookOpen className="w-3 h-3 mr-1.5" />
                  Now Available
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  WashBizHub: The Ultimate Laundromat Guidebook
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Co-authored by Nick and Larry, this comprehensive guide combines three generations of 
                  Kremers determination with Larry's 50+ years of industry wisdom. From the CLEANBI™ 
                  scoring system to equipment selection, from SBA financing to exit strategies—everything 
                  you need to succeed in the laundromat business.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">14 chapters covering every aspect of laundromat ownership</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">9 detailed appendices including checklists and formulas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">Proprietary doctrines: C.L.E.A.N., W.A.S.H., S.O.A.P., D.R.Y.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">Access to exclusive WashBizHub.com tools and resources</span>
                  </div>
                </div>

                <blockquote className="border-l-4 border-amber-500 pl-4 italic text-muted-foreground mb-8">
                  "Apply this, wash away the BS, build wealth."
                  <footer className="mt-2 text-sm not-italic text-foreground">— Book Tagline</footer>
                </blockquote>

                <Link href="/consultation">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold" data-testid="button-book-consultation">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a Consultation
                  </Button>
                </Link>
              </div>

              <Card className="p-8 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                <h3 className="text-xl font-bold text-foreground mb-6 text-center">What's Inside</h3>
                <div className="space-y-3">
                  {[
                    "Part I: Foundations of a Laundry Empire",
                    "Part II: Building the Machine",
                    "Part III: Scaling and Legacy",
                    "Part IV: Future of Laundromats",
                    "Appendix: CLEANBI Formulas & Valuations",
                    "Appendix: Due Diligence Checklist",
                    "Appendix: Funding & Lender Index",
                    "Appendix: Equipment Specs & Distributors"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500">
                        {idx + 1}
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section - SEO/AEO Optimized */}
        <section className="py-20" data-testid="section-faq">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Quote className="w-3 h-3 mr-1.5" />
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Common questions about our partnership and laundromat consulting services
              </p>
            </div>

            <div className="space-y-6">
              {faqItems.map((faq, idx) => (
                <Card key={idx} className="p-6 border-border" data-testid={`card-faq-${idx}`}>
                  <h3 className="text-lg font-bold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Facebook Community CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800" data-testid="section-community">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Facebook className="w-8 h-8 text-white" />
                  <span className="text-white/80 text-sm font-medium">72,000+ Members</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Join WashBizHub: Laundromats for Sale
                </h2>
                <p className="text-white/80 max-w-xl">
                  The largest laundromat buying and selling community on Facebook. 
                  Connect with buyers, sellers, and industry experts.
                </p>
              </div>
              <a 
                href="https://facebook.com/groups/thelaundromat" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="secondary" className="font-bold" data-testid="button-join-facebook">
                  <Facebook className="w-5 h-5 mr-2" />
                  Join the Community
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Seller CTA - Help Selling */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700" data-testid="section-seller-cta">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <span className="text-white/80 text-sm font-medium">300+ Deals Brokered</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Need Help Selling Your Laundromat?
                </h2>
                <p className="text-white/80 max-w-xl">
                  With Larry's 50+ years of brokerage experience and access to 72,000+ qualified buyers, 
                  we'll help you sell your laundromat quickly and at the right price.
                </p>
              </div>
              <a href="mailto:consult@washbizhub.com?subject=I%20Want%20to%20Sell%20My%20Laundromat">
                <Button size="lg" className="bg-white text-green-700 hover:bg-white/90 font-bold" data-testid="button-sell-contact">
                  <Building2 className="w-5 h-5 mr-2" />
                  Contact Us to Sell
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20" data-testid="section-final-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Work With the Industry's Best?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're buying your first laundromat, selling an existing store, or scaling a portfolio—
              get expert guidance from the most experienced partnership in the industry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold px-8" data-testid="button-schedule-consultation">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Consultation — $397
                </Button>
              </Link>
              <Link href="/ai-consultation-council">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" data-testid="button-ai-council">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Consultation — From $49
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              All consultation leads: <a href="mailto:consult@washbizhub.com" className="text-primary hover:underline">consult@washbizhub.com</a>
            </p>
          </div>
        </section>

        {/* Schema.org Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "WashBizHub",
              "description": "The #1 laundromat resource and educational hub, founded by Nick Kremers and Larry Larsen",
              "url": "https://washbizhub.com",
              "founders": [
                {
                  "@type": "Person",
                  "name": "Nicholas Kremers",
                  "jobTitle": "Founder & Chief Technology Officer",
                  "description": "Third-generation laundromat operator, creator of CLEANBI scoring system, founder of 72,000+ member laundromat community"
                },
                {
                  "@type": "Person",
                  "name": "Lawrence Larsen",
                  "jobTitle": "Chief Consultant & Industry Advisor",
                  "description": "50+ year laundromat industry veteran, owned 50+ stores, built 135+ locations, brokered 300+ transactions"
                }
              ],
              "sameAs": [
                "https://facebook.com/groups/thelaundromat"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "consult@washbizhub.com",
                "contactType": "sales"
              }
            })
          }}
        />

        {/* FAQ Schema for AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqItems.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
      </div>
    </>
  );
}
