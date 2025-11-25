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
  ExternalLink
} from "lucide-react";
import sraLogo from "@assets/Untitled design (25)_1764086011344.png";
import sosLogo from "@assets/sos logo_1764087549375.png";
import togetherFist from "@assets/Together Fist_1764087270080.png";

const courseParts = [
  {
    id: 1,
    title: "Understanding Your Journey",
    chapters: "Chapters 1-4",
    description: "Foundation concepts and the roadmap to your recovery",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Brain Science for Recovery",
    chapters: "Chapters 5-8",
    description: "Neuroplasticity, rewiring pathways, and healing mechanisms",
    icon: Brain,
  },
  {
    id: 3,
    title: "Physical Training",
    chapters: "Chapters 9-14",
    description: "Movement recovery, strength building, and coordination",
    icon: Dumbbell,
  },
  {
    id: 4,
    title: "Mental Mastery",
    chapters: "Chapters 15-19",
    description: "Mindset, motivation, and overcoming mental barriers",
    icon: Target,
  },
  {
    id: 5,
    title: "Advanced Techniques",
    chapters: "Chapters 20-24",
    description: "Cutting-edge recovery methods and optimization",
    icon: Sparkles,
  },
  {
    id: 6,
    title: "Living Your Recovery",
    chapters: "Chapters 25-29",
    description: "Daily life integration and sustainable habits",
    icon: Heart,
  },
  {
    id: 7,
    title: "Mastery",
    chapters: "Chapters 30-33",
    description: "Achieving excellence and helping others",
    icon: Trophy,
  },
];

const flintRehabProducts = [
  {
    id: 1,
    title: "MusicGlove Hand Therapy",
    description: "Clinically proven to improve hand function in 2 weeks with just 6 hours use. Music-based rehabilitation.",
    price: "$349 - $549",
    badge: "Clinical Proven",
    features: ["Improves finger coordination", "Gaming + music therapy", "Works with tablet or PC"],
    affiliateLink: "https://www.flintrehab.com/product/musicglove-hand-therapy/"
  },
  {
    id: 2,
    title: "FitMi Full-Body Rehab",
    description: "Award-winning FDA-listed device. Improves mobility 3x faster than traditional therapy.",
    price: "$299+",
    badge: "FDA Listed",
    features: ["Full body exercises", "Adaptive difficulty", "Track progress"],
    affiliateLink: "https://www.flintrehab.com/product/fitmi/"
  },
  {
    id: 3,
    title: "FitMi + MusicGlove Bundle",
    description: "Complete stroke recovery package. Save $50 when you bundle.",
    price: "Save $50",
    badge: "Best Value",
    features: ["Full body + hand therapy", "Includes tablet", "Free shipping"],
    affiliateLink: "https://www.flintrehab.com/bundle/"
  }
];

export default function SRAHome() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Stroke Recovery Academy",
    "alternateName": "SRA",
    "url": typeof window !== 'undefined' ? `${window.location.origin}/sra` : "https://strokerecoveryacademy.com",
    "description": "Your Ph.D. in Proving the Impossible Possible. Comprehensive stroke recovery education, AI coaching, and community support from Nicholas 'Stroked Out Sasquatch' Kremers.",
    "founder": {
      "@type": "Person",
      "name": "Nicholas Kremers",
      "alternateName": "Stroked Out Sasquatch",
      "description": "Stroke survivor who achieved 90% recovery after being told he would never walk normally again."
    },
    "slogan": "REBUILD. REWIRE. RISE.",
    "offers": {
      "@type": "Offer",
      "category": "Stroke Recovery Education",
      "description": "Courses, AI coaching, and community support for stroke survivors"
    }
  };

  return (
    <div className="sra-theme min-h-screen bg-background">
      <Helmet>
        <title>Stroke Recovery Academy | REBUILD. REWIRE. RISE. | Your Ph.D. in Proving the Impossible Possible</title>
        <meta name="description" content="Join Nicholas 'Stroked Out Sasquatch' Kremers at Stroke Recovery Academy. From 0% function to 90% recovery - get the complete stroke recovery education with AI coaching, courses, and community support." />
        <meta name="keywords" content="stroke recovery, stroke rehabilitation, stroke survivor, Nicholas Kremers, Stroked Out Sasquatch, neuroplasticity, stroke exercises, stroke recovery program, brain recovery" />
        <meta property="og:title" content="Stroke Recovery Academy | REBUILD. REWIRE. RISE." />
        <meta property="og:description" content="Your Ph.D. in Proving the Impossible Possible. Comprehensive stroke recovery education from someone who beat the odds." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={sraLogo} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stroke Recovery Academy | REBUILD. REWIRE. RISE." />
        <meta name="twitter:description" content="Your Ph.D. in Proving the Impossible Possible. Join Nicholas Kremers and thousands of stroke survivors." />
        <meta name="author" content="Nicholas 'Stroked Out Sasquatch' Kremers" />
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
              data-testid="img-sra-logo"
            />
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-hero-title"
            >
              Stroke Recovery Academy
            </h1>
            
            <p 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#FF6600] uppercase tracking-widest mb-6"
              data-testid="text-tagline"
            >
              REBUILD. REWIRE. RISE.
            </p>
            
            <p 
              className="text-lg md:text-xl text-white/80 max-w-2xl mb-10"
              data-testid="text-subtitle"
            >
              Your Ph.D. in Proving the Impossible Possible
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-[#FF6600] text-white border-[#FF6600] px-8 py-6 text-lg font-bold uppercase tracking-wide"
                data-testid="button-start-journey"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-[#FF6600] text-[#FF6600] px-8 py-6 text-lg font-bold uppercase tracking-wide"
                data-testid="button-join-community"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
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
                    <span>Left side paralysis, craniotomy surgery with 50 staples</span>
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
                    <span>Created StrokeLyfe Inc. nonprofit for survivors</span>
                  </p>
                </div>
                
                <p 
                  className="text-xl text-white/90 italic border-l-4 border-[#FF6600] pl-4 my-6"
                  data-testid="text-quote"
                >
                  "Doctors said 'never walk normally again' — I proved them wrong."
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
                className="mt-8 border-[#FF6600] text-[#FF6600]"
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
                    <div className="text-4xl font-black text-[#FF6600]" data-testid="stat-recovery">90%</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide mt-1">Recovery</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-[#FF6600]" data-testid="stat-years">6+</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide mt-1">Years Journey</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-[#FF6600]" data-testid="stat-chapters">33</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide mt-1">Chapters</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-3 bg-[#FF6600]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#FF6600]" data-testid="stat-staples">50</div>
                    <div className="text-xs text-white/60 uppercase">Staples</div>
                  </div>
                  <div className="text-center p-3 bg-[#FF6600]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#FF6600]" data-testid="stat-followers">1M+</div>
                    <div className="text-xs text-white/60 uppercase">Followers</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recovery University Section */}
      <section className="py-20 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <GraduationCap className="w-3 h-3 mr-1" />
              Recovery University
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-courses-title"
            >
              The Complete Recovery Curriculum
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              7 comprehensive parts from The Ultimate Stroke Recovery Bible. 
              Master each phase of your recovery journey.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courseParts.map((course) => {
              const IconComponent = course.icon;
              return (
                <Card 
                  key={course.id}
                  className="bg-[#111] border-[#222] hover-elevate transition-all group"
                  data-testid={`card-course-${course.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#FF6600]/20">
                        <IconComponent className="w-5 h-5 text-[#FF6600]" />
                      </div>
                      <Badge variant="outline" className="border-[#FF6600]/30 text-[#FF6600] text-xs">
                        Part {course.id}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-white/50 text-sm">
                      {course.chapters}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 text-sm">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-[#FF6600] text-white border-[#FF6600] px-8"
              data-testid="button-explore-courses"
            >
              Explore All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* AI Coach Preview Section */}
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
                      <p className="text-sm">Hi! I'm your Recovery Coach, trained on The Ultimate Stroke Recovery Bible. How can I help you today?</p>
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
                      <p className="text-sm">Great question! Nicholas covers this in Part III. Start with supported standing near a wall, focus on 3-second holds, and gradually increase...</p>
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
                Meet Your Recovery Companion
              </h2>
              
              <div className="space-y-4 text-white/80">
                <p className="text-lg">
                  24/7 AI support based on The Ultimate Stroke Recovery Bible. 
                  Get personalized guidance whenever you need it.
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
                className="mt-8 bg-[#FF6600] text-white border-[#FF6600] px-8"
                data-testid="button-start-free-trial"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30">
              <Users className="w-3 h-3 mr-1" />
              Community
            </Badge>
            
            <h2 
              className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4"
              data-testid="text-community-title"
            >
              Join Fellow Survivors
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              You're not alone in this journey. Connect with a supportive community 
              of stroke survivors and caregivers who understand.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-[#111] border-[#222] p-8 text-center">
              <div className="p-4 rounded-full bg-[#FF6600]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-[#FF6600]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Peer Support</h3>
              <p className="text-white/70">
                Share experiences, ask questions, and celebrate victories with others on the same path.
              </p>
            </Card>
            
            <Card className="bg-[#111] border-[#222] p-8 text-center">
              <div className="p-4 rounded-full bg-[#FF6600]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-[#FF6600]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Shared Experiences</h3>
              <p className="text-white/70">
                Learn from real stories of recovery, setbacks, and breakthroughs from fellow survivors.
              </p>
            </Card>
            
            <Card className="bg-[#111] border-[#222] p-8 text-center">
              <div className="p-4 rounded-full bg-[#FF6600]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-[#FF6600]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Expert Guidance</h3>
              <p className="text-white/70">
                Direct access to Nicholas and trained coaches who've been where you are.
              </p>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-[#FF6600] text-white border-[#FF6600] px-8"
              data-testid="button-join-community-cta"
            >
              <Users className="mr-2 h-4 w-4" />
              Join the Community
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
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
              Featured Products
            </h2>
            
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Equipment recommendations and Nicholas's custom apparel line 
              to support your recovery journey.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <Card 
                key={product.id}
                className="bg-[#111] border-[#222] overflow-hidden hover-elevate transition-all"
                data-testid={`card-product-${product.id}`}
              >
                <div className="h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-[#FF6600]/30" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      className={`${product.badge === 'Coming Soon' ? 'bg-white/10 text-white/70' : 'bg-[#FF6600]/20 text-[#FF6600]'} border-0`}
                    >
                      {product.badge}
                    </Badge>
                    <span className="text-xl font-bold text-[#FF6600]">{product.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{product.description}</p>
                  <Button 
                    variant={product.badge === 'Coming Soon' ? 'outline' : 'default'}
                    className={product.badge === 'Coming Soon' 
                      ? 'border-white/20 text-white/60 w-full' 
                      : 'bg-[#FF6600] text-white border-[#FF6600] w-full'
                    }
                    disabled={product.badge === 'Coming Soon'}
                    data-testid={`button-product-${product.id}`}
                  >
                    {product.badge === 'Coming Soon' ? 'Coming Soon' : 'View Product'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-t from-[#0a0a0a] to-black">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <img 
            src={sraLogo} 
            alt="Stroke Recovery Academy Logo" 
            className="w-32 h-32 object-contain mx-auto mb-8"
          />
          
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
            Ready to Start Your Recovery?
          </h2>
          
          <p className="text-xl text-[#FF6600] font-bold uppercase tracking-widest mb-4">
            REBUILD. REWIRE. RISE.
          </p>
          
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Join thousands of stroke survivors who are taking control of their recovery. 
            Your journey to proving the impossible possible starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#FF6600] text-white border-[#FF6600] px-10 py-6 text-lg font-bold uppercase"
              data-testid="button-get-started"
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#FF6600] text-[#FF6600] px-10 py-6 text-lg font-bold uppercase"
              data-testid="button-learn-more"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <p className="mt-10 text-white/50 text-sm">
            Created by Nicholas "Stroked Out Sasquatch" Kremers
          </p>
        </div>
      </section>
    </div>
  );
}
