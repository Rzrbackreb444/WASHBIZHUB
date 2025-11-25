import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  GraduationCap, 
  Users, 
  Heart, 
  Target, 
  Dumbbell, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  BookOpen, 
  MessageCircle,
  Bot,
  ShoppingBag,
  Calendar,
  Star,
  Play,
  Pill,
  PenTool,
  HandHeart,
  CheckCircle2,
  ExternalLink,
  Activity,
  Clock,
  Crown,
  Shield,
  Gift,
  DollarSign
} from "lucide-react";
import sosLogo from "@assets/sos logo_1764087549375.png";
import togetherFist from "@assets/Together Fist_1764087270080.png";

const featureCards = [
  {
    id: 1,
    title: "Recovery Tracker",
    description: "Track medications, appointments, and exercises. Monitor your daily progress with comprehensive logging.",
    icon: Activity,
    badge: "Essential"
  },
  {
    id: 2,
    title: "AI Recovery Companion",
    description: "24/7 personalized coaching based on Nick's wisdom. Get guidance whenever you need it most.",
    icon: Bot,
    badge: "AI-Powered"
  },
  {
    id: 3,
    title: "Recovery University",
    description: "33 comprehensive chapters from The Ultimate Stroke Recovery Bible. Master every phase of recovery.",
    icon: GraduationCap,
    badge: "33 Chapters"
  },
  {
    id: 4,
    title: "Ghostwriting Suite",
    description: "Write and publish your stroke recovery story. KDP formatted for easy self-publishing.",
    icon: PenTool,
    badge: "Publish Ready"
  },
  {
    id: 5,
    title: "Recovery Store",
    description: "Flint Rehab products, custom apparel, and Amazon affiliate products curated for survivors.",
    icon: ShoppingBag,
    badge: "Curated"
  },
  {
    id: 6,
    title: "Warrior Community",
    description: "Peer support, forums, and shared victories. Connect with 10,000+ fellow survivors.",
    icon: Users,
    badge: "10K+ Members"
  }
];

const flintRehabProducts = [
  {
    id: 1,
    title: "MusicGlove Hand Therapy",
    description: "Clinically proven to improve hand function in 2 weeks with just 6 hours use. Music-based rehabilitation that makes therapy engaging.",
    price: "$349 - $549",
    badge: "Clinically Proven",
    features: ["Improves hand function in 2 weeks", "Gaming + music therapy", "Works with tablet or PC"],
    affiliateLink: "https://www.flintrehab.com/product/musicglove-hand-therapy/"
  },
  {
    id: 2,
    title: "FitMi Full-Body Rehab",
    description: "Award-winning FDA-listed device. Improves mobility 3x faster than traditional therapy with adaptive exercises.",
    price: "$299+",
    badge: "FDA Listed",
    features: ["3x faster than traditional therapy", "Full body exercises", "Adaptive difficulty"],
    affiliateLink: "https://www.flintrehab.com/product/fitmi/"
  },
  {
    id: 3,
    title: "FitMi + MusicGlove Bundle",
    description: "Complete stroke recovery package combining full-body and hand therapy. The ultimate recovery toolkit.",
    price: "Save $50",
    badge: "Best Value",
    features: ["Full body + hand therapy", "Includes tablet", "Free shipping"],
    affiliateLink: "https://www.flintrehab.com/bundle/"
  }
];

const pricingTiers = [
  {
    id: 1,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start your recovery journey",
    features: ["Basic recovery tracking", "3 AI chats/month", "Community access (read-only)"],
    cta: "Get Started Free",
    highlighted: false
  },
  {
    id: 2,
    name: "Warrior",
    price: "$29",
    period: "/month",
    description: "Full recovery toolkit",
    features: ["Full recovery tracking", "Unlimited AI coaching", "Community access & posting", "Progress analytics"],
    cta: "Become a Warrior",
    highlighted: false
  },
  {
    id: 3,
    name: "Champion",
    price: "$79",
    period: "/month",
    description: "Complete recovery education",
    features: ["Everything in Warrior", "All 33 course chapters", "Ghostwriting tools", "Priority support"],
    cta: "Become a Champion",
    highlighted: true
  },
  {
    id: 4,
    name: "Legend",
    price: "$149",
    period: "/month",
    description: "Premium coaching experience",
    features: ["Everything in Champion", "1-on-1 coaching sessions", "Direct access to Nick's team", "VIP community status"],
    cta: "Become a Legend",
    highlighted: false
  }
];

export default function SRAHome() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Stroke Recovery Academy",
    "alternateName": "SRA",
    "url": typeof window !== 'undefined' ? `${window.location.origin}/sra` : "https://strokerecoveryacademy.com",
    "logo": sosLogo,
    "description": "Your Ph.D. in Proving the Impossible Possible. Comprehensive stroke recovery education, AI coaching, and community support from Nicholas 'Stroked Out Sasquatch' Kremers - a stroke survivor who achieved 90% recovery.",
    "founder": {
      "@type": "Person",
      "name": "Nicholas Kremers",
      "alternateName": "Stroked Out Sasquatch",
      "description": "Stroke survivor who achieved 90% recovery after hemorrhagic stroke at age 36. Doctors said he would never walk normally again - he proved them wrong."
    },
    "slogan": "REBUILD. REWIRE. RISE.",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Basic recovery tracking and 3 AI chats per month"
      },
      {
        "@type": "Offer",
        "name": "Warrior Plan",
        "price": "29",
        "priceCurrency": "USD",
        "description": "Full tracking, unlimited AI coaching, and community access"
      },
      {
        "@type": "Offer",
        "name": "Champion Plan",
        "price": "79",
        "priceCurrency": "USD",
        "description": "All courses, ghostwriting tools, and priority support"
      },
      {
        "@type": "Offer",
        "name": "Legend Plan",
        "price": "149",
        "priceCurrency": "USD",
        "description": "1-on-1 coaching with Nick's team"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Stroke Recovery Academy | REBUILD. REWIRE. RISE. | Your Ph.D. in Proving the Impossible Possible</title>
        <meta name="description" content="Join 10,000+ stroke warriors at Stroke Recovery Academy. Nicholas 'Stroked Out Sasquatch' Kremers went from hemorrhagic stroke to 90% recovery. Get AI coaching, courses, community support, and The Ultimate Stroke Recovery Bible." />
        <meta name="keywords" content="stroke recovery, stroke rehabilitation, stroke survivor, Nicholas Kremers, Stroked Out Sasquatch, neuroplasticity, stroke exercises, stroke recovery program, brain recovery, hemorrhagic stroke, stroke survivor community, stroke recovery app" />
        <meta property="og:title" content="Stroke Recovery Academy | REBUILD. REWIRE. RISE." />
        <meta property="og:description" content="Your Ph.D. in Proving the Impossible Possible. From 0% function to 90% recovery - comprehensive stroke education from someone who beat the odds. Join 10,000+ warriors." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={sosLogo} />
        <meta property="og:url" content={typeof window !== 'undefined' ? `${window.location.origin}/sra` : "https://strokerecoveryacademy.com"} />
        <meta property="og:site_name" content="Stroke Recovery Academy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stroke Recovery Academy | REBUILD. REWIRE. RISE." />
        <meta name="twitter:description" content="Your Ph.D. in Proving the Impossible Possible. Join Nicholas Kremers and 10,000+ stroke survivors in the ultimate recovery community." />
        <meta name="twitter:image" content={sosLogo} />
        <meta name="author" content="Nicholas 'Stroked Out Sasquatch' Kremers" />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/sra` : "https://strokerecoveryacademy.com"} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF6600]/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <img 
              src={sosLogo} 
              alt="Stroked Out Sasquatch - Stroke Recovery Academy Logo" 
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain mb-8"
              data-testid="img-sra-hero-logo"
            />
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-hero-title"
            >
              Stroke Recovery Academy
            </h1>
            
            <p 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#FF6600] uppercase tracking-widest mb-6"
              data-testid="text-hero-tagline"
            >
              REBUILD. REWIRE. RISE.
            </p>
            
            <p 
              className="text-lg md:text-xl text-white/80 max-w-2xl mb-10"
              data-testid="text-hero-subtitle"
            >
              Your Ph.D. in Proving the Impossible Possible
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8 py-6 text-lg font-bold uppercase tracking-wide"
                data-testid="button-start-recovery"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Your Recovery
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10 px-8 py-6 text-lg font-bold uppercase tracking-wide"
                data-testid="button-join-warriors"
              >
                <Users className="mr-2 h-5 w-5" />
                Join 10,000+ Warriors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nicholas's Story Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
                <Heart className="w-3 h-3 mr-1" />
                Survivor Story
              </Badge>
              
              <h2 
                className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-6"
                data-testid="text-story-title"
              >
                From 0% Function to 90% Recovery
              </h2>
              
              <div className="space-y-4 text-white/80 text-lg">
                <p className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#FF6600] mt-1 shrink-0" />
                  <span><strong className="text-white">December 3, 2018</strong> — Hemorrhagic stroke at age 36</span>
                </p>
                
                <div className="space-y-3 text-white/70">
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6600] mt-1 shrink-0" />
                    <span>50 staples, left-side paralysis, ICU hallucinations</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6600] mt-1 shrink-0" />
                    <span>From wheelchair to walking without AFO brace</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6600] mt-1 shrink-0" />
                    <span>TikTok recovery journey inspiring 1M+ followers</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6600] mt-1 shrink-0" />
                    <span>Founded StrokeLyfe.org nonprofit for survivors</span>
                  </p>
                </div>
                
                <p 
                  className="text-xl text-white/90 italic border-l-4 border-[#FF6600] pl-4 my-6"
                  data-testid="text-nick-quote"
                >
                  "Doctors said 'never walk again' — I proved them wrong."
                </p>
                
                <p>
                  Nicholas "Stroked Out Sasquatch" Kremers didn't just survive — he thrived. 
                  Now he's sharing everything he learned in his journey from complete 
                  paralysis to living life on his own terms.
                </p>
              </div>
              
              <Button 
                size="lg"
                variant="outline"
                className="mt-8 border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10"
                data-testid="button-read-full-story"
              >
                Read Nicholas's Full Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Card className="bg-[#111] border-[#222] p-8">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-black text-[#FF6600]" data-testid="stat-recovery-percent">90%</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide mt-1">Recovery</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-[#FF6600]" data-testid="stat-years-fighting">6+</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide mt-1">Years Fighting</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-[#FF6600]" data-testid="stat-tiktok-followers">1M+</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide mt-1">TikTok Followers</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-3 bg-[#FF6600]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#FF6600]" data-testid="stat-staples">50</div>
                    <div className="text-xs text-white/60 uppercase">Staples</div>
                  </div>
                  <div className="text-center p-3 bg-[#FF6600]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#FF6600]" data-testid="stat-chapters">33</div>
                    <div className="text-xs text-white/60 uppercase">Chapters</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <Zap className="w-3 h-3 mr-1" />
              Platform Features
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-features-title"
            >
              Your Complete Recovery Toolkit
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Everything you need to rebuild your life after stroke, all in one place.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.id}
                  className="bg-[#111] border-[#222] hover-elevate transition-all group"
                  data-testid={`card-feature-${feature.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="p-3 rounded-lg bg-[#FF6600]/20">
                        <IconComponent className="w-6 h-6 text-[#FF6600]" />
                      </div>
                      <Badge variant="outline" className="border-[#FF6600]/30 text-[#FF6600] text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8"
              data-testid="button-explore-features"
            >
              Explore All Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* AI Recovery Companion Section */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Card className="bg-[#111] border-[#222] p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#FF6600]/20 shrink-0">
                      <Bot className="w-5 h-5 text-[#FF6600]" />
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 text-white/90">
                      <p className="text-sm">Hi! I'm your Recovery Coach, trained on The Ultimate Stroke Recovery Bible and Nick's wisdom. How can I help you today?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-[#FF6600]/20 rounded-lg p-4 text-white/90">
                      <p className="text-sm">I'm struggling with my balance exercises. Any tips?</p>
                    </div>
                    <div className="p-2 rounded-full bg-[#222] shrink-0">
                      <Users className="w-5 h-5 text-white/60" />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#FF6600]/20 shrink-0">
                      <Bot className="w-5 h-5 text-[#FF6600]" />
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 text-white/90">
                      <p className="text-sm">Great question! Nick covers this in Part III of the Recovery Bible. Start with supported standing near a wall, focus on 3-second holds, and gradually increase. Remember: progress over perfection!</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Support
              </Badge>
              
              <h2 
                className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-6"
                data-testid="text-ai-coach-title"
              >
                AI Recovery Companion
              </h2>
              
              <div className="space-y-4 text-white/80">
                <p className="text-lg">
                  24/7 personalized coaching based on Nick's wisdom and The Ultimate Stroke Recovery Bible. 
                  Get answers, motivation, and guidance whenever you need it.
                </p>
                
                <ul className="space-y-3">
                  {[
                    "Motivation when you need it most",
                    "Exercise guidance and modifications",
                    "Progress tracking and celebrations",
                    "Answers based on proven recovery methods"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                size="lg"
                className="mt-8 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8"
                data-testid="button-try-ai-coach"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Try AI Coach Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recovery University Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <GraduationCap className="w-3 h-3 mr-1" />
              Recovery University
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-university-title"
            >
              33 Chapters of Recovery Wisdom
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              The complete curriculum from The Ultimate Stroke Recovery Bible. 
              Master every phase of your recovery journey with Nick's proven methods.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { part: 1, title: "Understanding Your Journey", chapters: "1-4", icon: BookOpen },
              { part: 2, title: "Brain Science", chapters: "5-8", icon: Brain },
              { part: 3, title: "Physical Training", chapters: "9-14", icon: Dumbbell },
              { part: 4, title: "Mental Mastery", chapters: "15-19", icon: Target },
              { part: 5, title: "Advanced Techniques", chapters: "20-24", icon: Sparkles },
              { part: 6, title: "Daily Living", chapters: "25-29", icon: Heart },
              { part: 7, title: "Complete Mastery", chapters: "30-33", icon: Trophy },
              { part: 8, title: "Bonus Content", chapters: "Extras", icon: Gift }
            ].map((course) => {
              const IconComponent = course.icon;
              return (
                <Card 
                  key={course.part}
                  className="bg-[#111] border-[#222] hover-elevate transition-all"
                  data-testid={`card-course-part-${course.part}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-[#FF6600]/20">
                        <IconComponent className="w-5 h-5 text-[#FF6600]" />
                      </div>
                      <Badge variant="outline" className="border-[#FF6600]/30 text-[#FF6600] text-xs">
                        Part {course.part}
                      </Badge>
                    </div>
                    <h3 className="text-white font-bold mb-1">{course.title}</h3>
                    <p className="text-white/50 text-sm">Chapters {course.chapters}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8"
              data-testid="button-start-learning"
            >
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Flint Rehab Products Section */}
      <section className="py-20 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <ShoppingBag className="w-3 h-3 mr-1" />
              Recovery Gear
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-products-title"
            >
              Flint Rehab Products
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Clinically proven rehabilitation devices that Nick uses and recommends. 
              These tools accelerate recovery with engaging, effective therapy.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {flintRehabProducts.map((product) => (
              <Card 
                key={product.id}
                className={`bg-[#111] border-[#222] hover-elevate transition-all overflow-hidden ${
                  product.badge === "Best Value" ? "ring-2 ring-[#FF6600]" : ""
                }`}
                data-testid={`card-product-${product.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge 
                      className={`${
                        product.badge === "Best Value" 
                          ? "bg-[#FF6600] text-white" 
                          : "bg-[#FF6600]/20 text-[#FF6600]"
                      }`}
                    >
                      {product.badge}
                    </Badge>
                    <span className="text-xl font-black text-[#FF6600]">{product.price}</span>
                  </div>
                  <CardTitle className="text-white text-xl">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/70 text-sm">
                    {product.description}
                  </p>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6600] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white"
                    data-testid={`button-view-product-${product.id}`}
                    asChild
                  >
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                      View Product
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Warrior Community Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <Users className="w-3 h-3 mr-1" />
              Warrior Community
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-community-title"
            >
              Join 10,000+ Stroke Warriors
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              You're not alone in this journey. Connect with a supportive community 
              of stroke survivors and caregivers who truly understand.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-[#111] border-[#222] p-8 text-center hover-elevate">
              <div className="p-4 rounded-full bg-[#FF6600]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-[#FF6600]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Peer Support</h3>
              <p className="text-white/70">
                Share experiences, ask questions, and celebrate victories with fellow survivors.
              </p>
            </Card>
            
            <Card className="bg-[#111] border-[#222] p-8 text-center hover-elevate">
              <div className="p-4 rounded-full bg-[#FF6600]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#FF6600]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Active Forums</h3>
              <p className="text-white/70">
                Dedicated forums for exercises, nutrition, mental health, and caregiver support.
              </p>
            </Card>
            
            <Card className="bg-[#111] border-[#222] p-8 text-center hover-elevate">
              <div className="p-4 rounded-full bg-[#FF6600]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-[#FF6600]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Shared Victories</h3>
              <p className="text-white/70">
                Celebrate milestones together. Every step forward deserves recognition.
              </p>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8"
              data-testid="button-join-community-cta"
            >
              <Users className="mr-2 h-4 w-4" />
              Join the Community
            </Button>
          </div>
        </div>
      </section>

      {/* StrokeLyfe.org Nonprofit Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center lg:justify-start">
              <img 
                src={togetherFist} 
                alt="Together We Recover - StrokeLyfe.org Nonprofit Logo" 
                className="w-64 h-64 md:w-80 md:h-80 object-contain"
                data-testid="img-strokelyfe-logo"
              />
            </div>
            
            <div>
              <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/30">
                <HandHeart className="w-3 h-3 mr-1" />
                501(c)(3) Nonprofit
              </Badge>
              
              <h2 
                className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
                data-testid="text-nonprofit-title"
              >
                StrokeLyfe.org
              </h2>
              
              <p 
                className="text-2xl font-bold text-red-400 uppercase tracking-widest mb-6"
                data-testid="text-nonprofit-tagline"
              >
                TOGETHER WE RECOVER
              </p>
              
              <div className="space-y-4 text-white/80">
                <p className="text-lg">
                  Nick founded StrokeLyfe Inc. to provide real financial support for stroke survivors 
                  who can't afford the resources they need.
                </p>
                
                <ul className="space-y-3">
                  {[
                    "Financial aid for therapy equipment",
                    "Vehicle modification grants",
                    "Home accessibility improvements",
                    "Emergency survivor assistance"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <p className="text-white/60 text-sm italic">
                  100% of donations go directly to helping stroke survivors in need.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white px-8"
                  data-testid="button-donate-strokelyfe"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Donate Now
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-500/10"
                  data-testid="button-learn-more-strokelyfe"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <Crown className="w-3 h-3 mr-1" />
              Membership Plans
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-pricing-title"
            >
              Choose Your Recovery Path
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              From free basic access to premium 1-on-1 coaching. Start where you are and upgrade as you grow.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`bg-[#111] border-[#222] hover-elevate transition-all ${
                  tier.highlighted ? "ring-2 ring-[#FF6600] scale-105" : ""
                }`}
                data-testid={`card-pricing-${tier.id}`}
              >
                <CardHeader className="text-center pb-2">
                  {tier.highlighted && (
                    <Badge className="bg-[#FF6600] text-white mx-auto mb-2">
                      Most Popular
                    </Badge>
                  )}
                  <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-black text-[#FF6600]">{tier.price}</span>
                    <span className="text-white/50">{tier.period}</span>
                  </div>
                  <CardDescription className="text-white/60 mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      tier.highlighted 
                        ? "bg-[#FF6600] hover:bg-[#FF6600]/90 text-white" 
                        : "bg-[#222] hover:bg-[#333] text-white"
                    }`}
                    data-testid={`button-pricing-${tier.id}`}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              variant="outline"
              className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10 px-8"
              data-testid="button-view-all-plans"
            >
              View All Plans & Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <img 
            src={sosLogo} 
            alt="Stroked Out Sasquatch Logo" 
            className="w-32 h-32 mx-auto mb-8 object-contain"
            data-testid="img-final-cta-logo"
          />
          
          <h2 
            className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
            data-testid="text-final-cta-title"
          >
            Ready to Prove the Impossible Possible?
          </h2>
          
          <p className="text-xl text-[#FF6600] font-bold uppercase tracking-widest mb-6">
            REBUILD. REWIRE. RISE.
          </p>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Join Nicholas and 10,000+ stroke warriors who are rebuilding their lives one day at a time. 
            Your recovery story starts now.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-[#FF6600] px-8 py-6 text-lg font-bold uppercase tracking-wide"
              data-testid="button-final-start-recovery"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Recovery
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/10 px-8 py-6 text-lg font-bold uppercase tracking-wide"
              data-testid="button-final-join-warriors"
            >
              <Users className="mr-2 h-5 w-5" />
              Join 10,000+ Warriors
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
