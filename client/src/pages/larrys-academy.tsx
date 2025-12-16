import { useState } from "react";
import { Link } from "wouter";
import { 
  GraduationCap, Award, BookOpen, Clock, CheckCircle2, Star, Users, 
  ChevronRight, Play, Lock, FileText, DollarSign, Shield, Crown,
  Briefcase, Building2, Scale, Wrench, Target, TrendingUp, Lightbulb,
  Brain, MapPin, Phone, Mail, ArrowRight, Sparkles, Trophy, Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { bibleChapters, bibleAppendices, bibleMetadata } from "@/data/laundromat-bible";
import larryLarsenPhoto from "@assets/image_1765341641648.png";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  isFree: boolean;
  isAvailable: boolean;
}

const education101: CourseModule[] = [
  { id: "101-1", title: "Industry Fundamentals", description: "Understanding the laundromat business model and market dynamics", duration: "45 min", lessons: 4, isFree: true, isAvailable: true },
  { id: "101-2", title: "Location Analysis Basics", description: "What makes a great laundromat location", duration: "60 min", lessons: 5, isFree: true, isAvailable: true },
  { id: "101-3", title: "Equipment Fundamentals", description: "Types of commercial laundry equipment and their purposes", duration: "50 min", lessons: 4, isFree: true, isAvailable: true },
  { id: "101-4", title: "Basic Financial Concepts", description: "Revenue models, expenses, and profit margins", duration: "55 min", lessons: 5, isFree: true, isAvailable: true },
  { id: "101-5", title: "Customer Demographics", description: "Understanding your target market and customer behavior", duration: "40 min", lessons: 3, isFree: false, isAvailable: true },
  { id: "101-6", title: "Lease Terms 101", description: "Essential lease provisions for laundromats", duration: "45 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "101-7", title: "Insurance Basics", description: "Types of coverage every laundromat needs", duration: "35 min", lessons: 3, isFree: false, isAvailable: true },
  { id: "101-8", title: "Utility Management", description: "Water, gas, electric - understanding your operating costs", duration: "50 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "101-9", title: "Staffing Considerations", description: "Attendant vs. unattended models", duration: "40 min", lessons: 3, isFree: false, isAvailable: true },
  { id: "101-10", title: "Marketing Fundamentals", description: "Getting customers through your door", duration: "45 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "101-11", title: "Safety & Compliance", description: "ADA, fire codes, and regulatory requirements", duration: "35 min", lessons: 3, isFree: false, isAvailable: true },
  { id: "101-12", title: "Payment Systems", description: "Coin, card, app - choosing the right payment mix", duration: "40 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "101-13", title: "Store Hours Strategy", description: "Optimizing operating hours for your market", duration: "30 min", lessons: 2, isFree: false, isAvailable: true },
  { id: "101-14", title: "Maintenance Basics", description: "Preventive maintenance for non-technicians", duration: "45 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "101-15", title: "Competition Analysis", description: "Evaluating your competitive landscape", duration: "40 min", lessons: 3, isFree: false, isAvailable: true },
  { id: "101-16", title: "First-Year Survival Guide", description: "Common mistakes and how to avoid them", duration: "55 min", lessons: 5, isFree: false, isAvailable: true },
];

const education201: CourseModule[] = [
  { id: "201-1", title: "Due Diligence Deep Dive", description: "Comprehensive evaluation of laundromat opportunities", duration: "90 min", lessons: 8, isFree: false, isAvailable: true },
  { id: "201-2", title: "Financial Analysis", description: "Understanding P&L, cash flow, and valuation methods", duration: "75 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "201-3", title: "Lease Negotiation Tactics", description: "Getting favorable terms for long-term success", duration: "60 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "201-4", title: "Equipment Mix Optimization", description: "Right-sizing your equipment for maximum turns", duration: "70 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "201-5", title: "Store Design & Layout", description: "Customer flow, equipment placement, and efficiency", duration: "80 min", lessons: 7, isFree: false, isAvailable: true },
  { id: "201-6", title: "SBA Loan Process", description: "Navigating the SBA 7(a) loan application", duration: "65 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "201-7", title: "Seller Financing Strategies", description: "Structuring deals with seller notes", duration: "55 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "201-8", title: "Multi-Store Operations", description: "Managing multiple locations efficiently", duration: "70 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "201-9", title: "Employee Management", description: "Hiring, training, and retaining quality staff", duration: "50 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "201-10", title: "WDF/Drop-off Services", description: "Adding wash-dry-fold to increase revenue", duration: "60 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "201-11", title: "Technology Integration", description: "POS systems, remote monitoring, and automation", duration: "55 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "201-12", title: "Retooling & Renovation", description: "Upgrading an existing store for growth", duration: "75 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "201-13", title: "Insurance Deep Dive", description: "Coverage types, claims process, and risk management", duration: "50 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "201-14", title: "Exit Strategies", description: "Planning your eventual sale or transition", duration: "45 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "201-15", title: "Broker vs. FSBO", description: "Selling with or without a broker", duration: "40 min", lessons: 3, isFree: false, isAvailable: true },
];

const education301: CourseModule[] = [
  { id: "301-1", title: "Advanced Valuation Methods", description: "Cap rates, multiples, and DCF analysis", duration: "90 min", lessons: 8, isFree: false, isAvailable: true },
  { id: "301-2", title: "New Build Development", description: "Site selection to grand opening", duration: "120 min", lessons: 10, isFree: false, isAvailable: true },
  { id: "301-3", title: "Commercial Real Estate", description: "Buying vs. leasing your building", duration: "80 min", lessons: 7, isFree: false, isAvailable: true },
  { id: "301-4", title: "Portfolio Management", description: "Building and managing a laundromat portfolio", duration: "95 min", lessons: 8, isFree: false, isAvailable: true },
  { id: "301-5", title: "Partnership Structures", description: "LLC, LP, and syndication strategies", duration: "70 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "301-6", title: "Franchise Considerations", description: "Evaluating franchise opportunities", duration: "55 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "301-7", title: "Tax Optimization", description: "Depreciation, 1031 exchanges, and entity planning", duration: "85 min", lessons: 7, isFree: false, isAvailable: true },
  { id: "301-8", title: "Distressed Acquisitions", description: "Finding and turning around struggling stores", duration: "75 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "301-9", title: "Industry Trends & Future", description: "Where the laundromat industry is heading", duration: "50 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "301-10", title: "Legal Issues & Disputes", description: "Common legal challenges and prevention", duration: "65 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "301-11", title: "Environmental Compliance", description: "Water discharge, chemical storage, and regulations", duration: "45 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "301-12", title: "Equipment Financing", description: "Lease vs. buy, vendor financing, and terms", duration: "55 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "301-13", title: "Marketing Mastery", description: "Advanced marketing strategies and ROI tracking", duration: "70 min", lessons: 6, isFree: false, isAvailable: true },
  { id: "301-14", title: "Consulting Others", description: "Sharing your expertise professionally", duration: "60 min", lessons: 5, isFree: false, isAvailable: true },
  { id: "301-15", title: "Expert Witness Preparation", description: "Legal testimony and documentation", duration: "50 min", lessons: 4, isFree: false, isAvailable: true },
  { id: "301-16", title: "Legacy Planning", description: "Family succession and business continuity", duration: "55 min", lessons: 4, isFree: false, isAvailable: true },
];

const insuranceGuides = [
  { id: "ins-1", title: "Property Insurance Essentials", description: "Protecting your building and equipment" },
  { id: "ins-2", title: "Liability Coverage Guide", description: "Customer injuries and slip-and-fall prevention" },
  { id: "ins-3", title: "Business Interruption Insurance", description: "Income protection during closures" },
  { id: "ins-4", title: "Equipment Breakdown Coverage", description: "Mechanical failure protection" },
  { id: "ins-5", title: "Workers' Compensation", description: "Employee injury coverage requirements" },
  { id: "ins-6", title: "Cyber Liability", description: "Protecting customer data and payment systems" },
];

const certificationLevels = [
  { 
    level: "Bronze", 
    name: "Industry Newcomer", 
    requirement: "Complete Education 101", 
    color: "from-amber-600 to-amber-700",
    icon: BookOpen,
    benefits: ["Certificate of Completion", "Access to Community Forum", "Monthly Newsletter"]
  },
  { 
    level: "Silver", 
    name: "Industry Professional", 
    requirement: "Complete Education 201", 
    color: "from-gray-400 to-gray-500",
    icon: Briefcase,
    benefits: ["All Bronze benefits", "1-on-1 Q&A Session with Larry", "Priority Email Support"]
  },
  { 
    level: "Gold", 
    name: "Industry Expert", 
    requirement: "Complete Education 301", 
    color: "from-amber-400 to-amber-500",
    icon: Crown,
    benefits: ["All Silver benefits", "WashBizHub Verified Expert Badge", "Referral Commission Program"]
  },
];

export default function LarrysAcademy() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("101");

  const renderCourseCard = (course: CourseModule) => (
    <Card key={course.id} className="bg-card border hover:border-[#C8A661]/50 transition-colors" data-testid={`card-course-${course.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge className={course.isFree ? "bg-emerald-500 text-white" : "bg-[#C8A661] text-[#0A1628]"}>
            {course.isFree ? "Free" : "Pro"}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            {course.duration}
          </div>
        </div>
        <CardTitle className="text-base mt-2">{course.title}</CardTitle>
        <CardDescription className="text-sm">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{course.lessons} lessons</span>
          {course.isFree ? (
            <Button size="sm" variant="outline" className="h-8 text-xs" data-testid={`button-start-${course.id}`}>
              <Play className="h-3 w-3 mr-1" />
              Start Free
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" data-testid={`button-unlock-${course.id}`}>
              <Lock className="h-3 w-3 mr-1" />
              Unlock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEO
        title="Larry's Academy - Laundromat Education by Larry Larsen | WashBizHub"
        description="Learn the laundromat business from 50+ year industry veteran Larry Larsen. Comprehensive education from fundamentals (101) to advanced strategies (301). Certification program included."
        canonicalUrl="/larrys-academy"
        keywords={[
          "laundromat education",
          "laundromat training",
          "Larry Larsen courses",
          "laundromat business course",
          "laundromat due diligence training",
          "how to buy a laundromat"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Larry's Academy", url: "/larrys-academy" }
        ]}
      />

      <div className="min-h-screen bg-background" data-testid="page-larrys-academy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: "Home", href: "/" },
              { label: "Larry's Academy", href: "/larrys-academy" }
            ]} 
          />

          {/* Hero Section */}
          <section className="mt-8 mb-12">
            <div className="bg-gradient-to-r from-[#0A1628] to-[#0d1c33] rounded-2xl p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0 text-center">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 mx-auto shadow-2xl shadow-[#C8A661]/20 border-4 border-[#C8A661]/30">
                    <AvatarImage src={larryLarsenPhoto} alt="Larry 'Laundromat Larry' Larsen" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-[#C8A661] to-[#B8964F] text-5xl font-bold text-white">
                      LL
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="mt-4 bg-[#C8A661] text-[#0A1628] px-3 py-1">
                    <Award className="w-3 h-3 mr-1" />
                    50+ Years Experience
                  </Badge>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <Badge variant="outline" className="mb-4 border-[#C8A661]/30 text-[#C8A661]">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    WashBizHub Academy
                  </Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                    Larry's Academy
                  </h1>
                  <p className="text-xl text-gray-300 font-medium mb-4">
                    Laundromat Education from the Industry's Most Experienced Expert
                  </p>
                  <p className="text-gray-400 mb-6 max-w-2xl">
                    Larry Larsen has owned 50+ laundromats, designed 135+ stores, and spent over five decades 
                    mastering every aspect of this industry. Now he's sharing that knowledge with you.
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <BookOpen className="w-4 h-4 text-[#C8A661]" />
                      <span className="text-sm">47 Courses</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-[#C8A661]" />
                      <span className="text-sm">40+ Hours Content</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Award className="w-4 h-4 text-[#C8A661]" />
                      <span className="text-sm">3 Certification Levels</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4 text-[#C8A661]" />
                      <span className="text-sm">500+ Graduates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Paths */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30" variant="outline">
                <Target className="w-3 h-3 mr-1" />
                Learning Paths
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Choose Your Path</h2>
              <p className="text-muted-foreground mt-2">From complete beginner to industry expert in 3 levels</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { level: "101", name: "Fundamentals", count: 16, icon: BookOpen, color: "emerald", desc: "For newcomers to the industry" },
                { level: "201", name: "Professional", count: 15, icon: Briefcase, color: "blue", desc: "For active or prospective owners" },
                { level: "301", name: "Expert", count: 16, icon: Crown, color: "purple", desc: "For multi-store operators & investors" },
              ].map((path) => (
                <Card 
                  key={path.level} 
                  className={`bg-card border cursor-pointer hover:border-${path.color}-500/50 transition-colors`}
                  onClick={() => setActiveTab(path.level)}
                  data-testid={`card-path-${path.level}`}
                >
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-14 h-14 rounded-full bg-${path.color}-500/10 flex items-center justify-center mb-2`}>
                      <path.icon className={`h-7 w-7 text-${path.color}-500`} />
                    </div>
                    <Badge className={`bg-${path.color}-500 text-white mx-auto`}>
                      Education {path.level}
                    </Badge>
                    <CardTitle className="mt-2">{path.name}</CardTitle>
                    <CardDescription>{path.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-2xl font-bold">{path.count}</p>
                    <p className="text-sm text-muted-foreground">Courses</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Course Catalog */}
          <section className="mb-12">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="101" data-testid="tab-101">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Education</span> 101
                </TabsTrigger>
                <TabsTrigger value="201" data-testid="tab-201">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Education</span> 201
                </TabsTrigger>
                <TabsTrigger value="301" data-testid="tab-301">
                  <Crown className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Education</span> 301
                </TabsTrigger>
                <TabsTrigger value="bible" data-testid="tab-bible">
                  <Book className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">The Bible</span>
                </TabsTrigger>
                <TabsTrigger value="insurance" data-testid="tab-insurance">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Insurance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="101">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Education 101: Industry Fundamentals</h3>
                  <p className="text-muted-foreground">
                    Start your laundromat journey with essential knowledge. Perfect for newcomers exploring 
                    the industry or considering their first purchase.
                  </p>
                  <Badge className="mt-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
                    4 Free Courses Included
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {education101.map(renderCourseCard)}
                </div>
              </TabsContent>

              <TabsContent value="201">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Education 201: Professional Development</h3>
                  <p className="text-muted-foreground">
                    Deep-dive into acquisition, financing, and operations. For those actively buying, 
                    selling, or optimizing laundromat investments.
                  </p>
                  <Badge className="mt-3 bg-blue-500/10 text-blue-600 border-blue-500/30" variant="outline">
                    Prerequisite: Education 101
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {education201.map(renderCourseCard)}
                </div>
              </TabsContent>

              <TabsContent value="301">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Education 301: Expert Strategies</h3>
                  <p className="text-muted-foreground">
                    Advanced topics for experienced operators, investors, and those building portfolios. 
                    Larry's most valuable insights from 50+ years of experience.
                  </p>
                  <Badge className="mt-3 bg-purple-500/10 text-purple-600 border-purple-500/30" variant="outline">
                    Prerequisite: Education 201
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {education301.map(renderCourseCard)}
                </div>
              </TabsContent>

              <TabsContent value="bible">
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] rounded-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                      <div className="w-32 h-44 bg-[#C8A661] rounded-lg shadow-xl flex items-center justify-center transform rotate-3 shrink-0">
                        <div className="text-center text-[#0A1628] p-3">
                          <Book className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-bold text-xs leading-tight">THE LAUNDROMAT BIBLE</p>
                        </div>
                      </div>
                      <div className="text-center lg:text-left">
                        <Badge className="bg-[#C8A661] text-[#0A1628] mb-2">Premium Content</Badge>
                        <h3 className="text-2xl font-bold text-white mb-2">{bibleMetadata.title}</h3>
                        <p className="text-[#C8A661] font-medium mb-2">{bibleMetadata.subtitle}</p>
                        <p className="text-gray-300 text-sm max-w-2xl">
                          {bibleMetadata.tagline} Co-authored by Nick Kremers with Larry Larsen's 50+ years of wisdom. 
                          14 chapters + 8 appendices covering everything from acquisition to exit strategy.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                          <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661]">14 Chapters</Badge>
                          <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661]">8 Appendices</Badge>
                          <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661]">CLEANBI Formula</Badge>
                          <Badge variant="outline" className="border-[#C8A661]/50 text-[#C8A661]">Equipment Guide</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bible Parts and Chapters */}
                {[1, 2, 3, 4].map((partNum) => {
                  const partChapters = bibleChapters.filter(ch => ch.part === partNum);
                  if (partChapters.length === 0) return null;
                  const partTitle = partChapters[0].partTitle;
                  
                  return (
                    <div key={partNum} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center font-bold text-sm">
                          {partNum}
                        </div>
                        <h4 className="text-lg font-bold">Part {partNum}: {partTitle}</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {partChapters.map((chapter) => (
                          <Card 
                            key={chapter.id} 
                            className="bg-card border hover:border-[#C8A661]/50 transition-colors"
                            data-testid={`card-chapter-${chapter.id}`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  Ch. {chapter.chapterNumber}
                                </Badge>
                                {chapter.isPremium ? (
                                  <Lock className="h-3 w-3 text-[#C8A661]" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                )}
                              </div>
                              <CardTitle className="text-sm leading-tight">{chapter.title}</CardTitle>
                              <CardDescription className="text-xs">{chapter.subtitle}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {chapter.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {chapter.keyTopics.slice(0, 2).map((topic) => (
                                  <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {topic}
                                  </Badge>
                                ))}
                                {chapter.keyTopics.length > 2 && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    +{chapter.keyTopics.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {chapter.estimatedReadTime}
                                </div>
                                <Button 
                                  variant={chapter.isPremium ? "outline" : "default"} 
                                  size="sm"
                                  className="h-7 text-xs"
                                  data-testid={`button-read-${chapter.id}`}
                                >
                                  {chapter.isPremium ? "Unlock" : "Read"}
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Appendices */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#C8A661]" />
                    Appendices & Resources
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {bibleAppendices.map((appendix) => (
                      <Card 
                        key={appendix.id} 
                        className="bg-card border hover:border-[#C8A661]/30 transition-colors"
                        data-testid={`card-appendix-${appendix.id}`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded bg-[#C8A661]/10 flex items-center justify-center shrink-0">
                              <span className="text-[#C8A661] font-bold text-sm">{appendix.letter}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{appendix.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{appendix.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insurance">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Insurance Guides</h3>
                  <p className="text-muted-foreground">
                    Comprehensive insurance education to protect your investment. Larry has seen every 
                    type of claim and knows exactly what coverage you need.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insuranceGuides.map((guide) => (
                    <Card key={guide.id} className="bg-card border hover:border-[#C8A661]/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C8A661]/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-[#C8A661]" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{guide.title}</CardTitle>
                            <CardDescription className="text-sm">{guide.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" data-testid={`button-read-${guide.id}`}>
                          <FileText className="h-3 w-3 mr-1" />
                          Read Guide
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Certification Levels */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30" variant="outline">
                <Trophy className="w-3 h-3 mr-1" />
                Certification Program
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Earn Your Certification</h2>
              <p className="text-muted-foreground mt-2">Demonstrate your expertise with WashBizHub credentials</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {certificationLevels.map((cert) => (
                <Card key={cert.level} className="bg-card border overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${cert.color}`} />
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${cert.color} flex items-center justify-center mb-2`}>
                      <cert.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{cert.level}</CardTitle>
                    <p className="text-[#C8A661] font-medium">{cert.name}</p>
                    <CardDescription>{cert.requirement}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cert.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-[#0A1628] to-[#0d1c33] border-[#C8A661]/30">
              <CardContent className="p-8 md:p-12 text-center">
                <Badge className="mb-4 bg-[#C8A661] text-[#0A1628]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Limited Time Offer
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Get All 47 Courses for One Price
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Access the complete Larry's Academy curriculum including all three education levels, 
                  insurance guides, and bonus content. Plus lifetime updates and priority support.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-gray-400 line-through text-lg">$1,499</p>
                    <p className="text-3xl font-bold text-white">$497</p>
                    <p className="text-[#C8A661] text-sm">One-time payment</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] px-8" data-testid="button-enroll-all">
                    Enroll in Full Academy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/larry-larsen">
                    <Button size="lg" variant="outline" className="border-[#C8A661]/50 text-[#C8A661] hover:bg-[#C8A661]/10" data-testid="button-consult-larry">
                      <Phone className="mr-2 h-4 w-4" />
                      Book 1-on-1 Consultation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* About Larry */}
          <section>
            <Card className="bg-muted/30 border">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <Avatar className="w-24 h-24 shadow-lg border-2 border-[#C8A661]/30 flex-shrink-0">
                    <AvatarImage src={larryLarsenPhoto} alt="Larry Larsen" className="object-cover" />
                    <AvatarFallback className="bg-[#C8A661] text-white text-2xl font-bold">LL</AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">About Your Instructor</h3>
                    <p className="text-muted-foreground mb-4">
                      Larry "Laundromat Larry" Larsen has been in the laundromat industry since the 1970s. 
                      He's owned over 50 laundromats, designed 135+ stores, holds California DRE License #49460, 
                      and serves as an expert witness in legal matters. His practical, no-nonsense teaching 
                      style comes from real-world experience—not textbooks.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <Badge variant="outline" className="text-[#C8A661] border-[#C8A661]/30">
                        <MapPin className="w-3 h-3 mr-1" />
                        Orange County, CA
                      </Badge>
                      <Badge variant="outline" className="text-[#C8A661] border-[#C8A661]/30">
                        <Award className="w-3 h-3 mr-1" />
                        DRE #49460
                      </Badge>
                      <Badge variant="outline" className="text-[#C8A661] border-[#C8A661]/30">
                        <Building2 className="w-3 h-3 mr-1" />
                        135+ Stores Designed
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
