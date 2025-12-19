import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Download,
  TrendingUp,
  Calculator
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LearnPage() {
  const learningPaths = [
    {
      icon: GraduationCap,
      title: "Laundromat Fundamentals",
      description: "Master the basics of laundromat ownership, operations, and profitability",
      link: "/courses",
      cta: "Start Learning"
    },
    {
      icon: Calculator,
      title: "Financial Mastery",
      description: "Learn to analyze deals, calculate ROI, and project cash flow like a pro",
      link: "/calculators",
      cta: "Try Calculators"
    },
    {
      icon: Video,
      title: "Video Training",
      description: "Watch step-by-step tutorials from industry experts and successful owners",
      link: "/courses",
      cta: "Watch Now"
    },
    {
      icon: FileText,
      title: "Templates & Guides",
      description: "Download business plans, checklists, and operational documents",
      link: "/template-vault",
      cta: "Get Templates"
    }
  ];

  const featuredResources = [
    { title: "Due Diligence Checklist", type: "Template", downloads: "2,400+" },
    { title: "SBA Loan Readiness Guide", type: "Guide", downloads: "1,800+" },
    { title: "Laundromat Valuation Course", type: "Course", downloads: "950+" },
    { title: "Equipment ROI Calculator", type: "Tool", downloads: "3,200+" }
  ];

  const stats = [
    { value: "73,000+", label: "Community Members" },
    { value: "50+", label: "Professional Calculators" },
    { value: "25+", label: "Course Modules" },
    { value: "100+", label: "Templates & Guides" }
  ];

  return (
    <>
      <Helmet>
        <title>Learn About Laundromats | Education & Training | WashBizHub</title>
        <meta 
          name="description" 
          content="Free laundromat education, courses, calculators, and templates. Learn how to buy, operate, and grow a profitable laundromat business from industry experts." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-[#0A1628] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1e3a5f] to-[#0A1628] opacity-80" />
          
          <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge 
                variant="outline" 
                className="mb-6 border-[#C8A661]/40 text-[#C8A661] bg-[#C8A661]/10"
              >
                <GraduationCap className="w-3 h-3 mr-1.5" />
                Education Hub
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Learn Everything About
                <span className="block text-[#C8A661]">Laundromat Success</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Free courses, calculators, templates, and expert guides to help you 
                buy, operate, and grow a profitable laundromat business.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/courses">
                  <Button 
                    size="lg"
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold"
                    data-testid="button-start-courses"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Free Courses
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    data-testid="button-try-calculators"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Try Calculators
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-[#C8A661]">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Learning Paths */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <BookOpen className="w-3 h-3 mr-1.5" />
                Learning Paths
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Choose Your Learning Path
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you're researching your first laundromat or optimizing an existing operation, 
                we have resources tailored to your journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden h-full hover-elevate">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                          <path.icon className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2">{path.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{path.description}</p>
                          <Link href={path.link}>
                            <Button size="sm" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                              {path.cta}
                              <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Resources */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
                <TrendingUp className="w-3 h-3 mr-1.5" />
                Most Popular
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Top Resources This Month
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredResources.map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card border shadow-sm h-full">
                    <CardContent className="p-4 text-center">
                      <Badge variant="secondary" className="mb-3">{resource.type}</Badge>
                      <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Download className="w-3 h-3" />
                        {resource.downloads} downloads
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#0A1628]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Users className="w-12 h-12 text-[#C8A661] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join 73,000+ Industry Professionals
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Get access to our complete library of courses, calculators, templates, and expert community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/pricing">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold">
                  View Pricing Plans
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Browse Free Content
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
