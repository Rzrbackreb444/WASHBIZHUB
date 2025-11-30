import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StatCard, MetricCard, Gauge, ProgressBar, DonutChart, MiniBarChart,
  DashboardGrid, SectionHeader
} from "@/components/dashboard/DashboardComponents";
import {
  BookOpen, Clock, CheckCircle, PlayCircle, GraduationCap, Users,
  Award, TrendingUp, Star, Trophy, Target, Zap, Video, FileText,
  BarChart3, Filter, ArrowRight
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";

interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  price: string;
  duration: number;
  level: string;
  category: string;
  thumbnailUrl: string | null;
  published: boolean;
  featured: boolean;
  stripePriceId: string | null;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
}

const COURSE_LEVELS = [
  { id: 'all', name: 'All Levels', color: '#8b5cf6' },
  { id: 'beginner', name: 'Beginner', color: '#10b981' },
  { id: 'intermediate', name: 'Intermediate', color: '#f59e0b' },
  { id: 'advanced', name: 'Advanced', color: '#ef4444' },
];

const COURSE_CATEGORIES = [
  { id: 'operations', name: 'Operations', icon: Zap, color: '#3b82f6' },
  { id: 'finance', name: 'Finance', icon: TrendingUp, color: '#10b981' },
  { id: 'marketing', name: 'Marketing', icon: Target, color: '#ec4899' },
  { id: 'management', name: 'Management', icon: Users, color: '#8b5cf6' },
];

export default function Courses() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const userId = "user-123";
  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", userId],
  });

  const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);
  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };

  const publishedCourses = courses.filter(c => c.published);
  const featuredCourses = publishedCourses.filter(c => c.featured);
  const enrolledCourses = publishedCourses.filter(c => isEnrolled(c.id));
  
  const filteredCourses = publishedCourses.filter(c => {
    const matchesLevel = selectedLevel === 'all' || c.level.toLowerCase() === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || c.category.toLowerCase() === selectedCategory;
    return matchesLevel && matchesCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const levelData = COURSE_LEVELS.slice(1).map(level => ({
    label: level.name,
    value: publishedCourses.filter(c => c.level.toLowerCase() === level.id).length,
    color: level.color,
  }));

  const getLevelColor = (level: string) => {
    const found = COURSE_LEVELS.find(l => l.id === level.toLowerCase());
    return found?.color || '#8b5cf6';
  };

  const totalHours = Math.round(publishedCourses.reduce((acc, c) => acc + c.duration, 0) / 60);

  if (coursesLoading) {
    return (
      <>
        <SEO title="WashBizHub Academy | Professional Laundromat Courses" description="Master laundromat operations with expert-led courses." canonicalUrl="/courses" />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Laundromat Business Courses & Training | Learn How to Run a Laundromat | WashBizHub Academy" 
        description="Master laundromat operations with expert-led courses. Learn business management, maximize profits, and grow your laundry business. Self-paced training with certification." 
        canonicalUrl="/courses"
        ogType="website"
        keywords={[
          "laundromat business course",
          "how to run a laundromat",
          "laundromat training program",
          "laundry business management",
          "laundromat owner education",
          "coin laundry business course",
          "laundromat profit training",
          "laundry industry certification",
          "laundromat operations course",
          "how to start a laundromat",
          "laundromat management training",
          "commercial laundry education",
          "laundromat business plan course",
          "laundry business success training",
          "self-service laundry course"
        ]}
        faqs={[
          {
            question: "What courses are available for laundromat owners?",
            answer: "WashBizHub Academy offers courses in Operations (day-to-day management), Finance (profitability, pricing, bookkeeping), Marketing (customer acquisition, retention), and Management (hiring, training, multi-location expansion). Courses range from beginner fundamentals to advanced strategies."
          },
          {
            question: "Are the laundromat courses self-paced?",
            answer: "Yes, all WashBizHub Academy courses are 100% self-paced. Learn on your schedule from any device. Video lessons, downloadable resources, and quizzes are available 24/7. Most courses include lifetime access after purchase."
          },
          {
            question: "Do I get a certificate after completing a course?",
            answer: "Yes, upon successful completion of any course, you receive a WashBizHub Academy Certificate of Completion. This certificate demonstrates your expertise to lenders, partners, and customers. Display it in your store or on your website."
          },
          {
            question: "How long does it take to complete a laundromat course?",
            answer: "Course length varies: Beginner courses take 4-6 hours, Intermediate courses 6-8 hours, and Advanced courses 8-12 hours. Most students complete courses within 1-2 weeks studying 30-60 minutes daily."
          },
          {
            question: "Are these courses good for first-time laundromat buyers?",
            answer: "Absolutely! Our Beginner courses cover laundromat fundamentals from scratch: industry overview, location analysis, equipment selection, financing, and operations setup. Perfect preparation before buying your first laundromat."
          },
          {
            question: "What topics are covered in laundromat business courses?",
            answer: "Topics include store operations, equipment maintenance, pricing strategies, customer service, marketing, financial management, employee training, multi-location expansion, technology adoption, and industry trends. Each course focuses on specific skills."
          },
          {
            question: "How much do laundromat training courses cost?",
            answer: "Individual courses range from $147-$497 depending on depth and content. Bundle packages offer significant savings. WashBizHub Pro subscribers get access to select courses included with their subscription."
          },
          {
            question: "Can I access courses on mobile devices?",
            answer: "Yes, all courses are mobile-responsive. Watch video lessons, complete quizzes, and download resources from your smartphone or tablet. The learning platform works on iOS, Android, and all web browsers."
          }
        ]}
        howTo={{
          name: "How to Start Learning Laundromat Operations on WashBizHub",
          description: "Step-by-step guide to enrolling in WashBizHub Academy courses and mastering laundromat business skills.",
          steps: [
            {
              name: "Browse Available Courses",
              text: "Explore our course catalog organized by category (Operations, Finance, Marketing, Management) and skill level (Beginner, Intermediate, Advanced). Read course descriptions and preview content."
            },
            {
              name: "Select Your Learning Path",
              text: "Choose courses that match your goals. New owners should start with beginner courses covering fundamentals. Experienced operators can skip to intermediate or advanced courses for specific skills."
            },
            {
              name: "Enroll and Create Your Account",
              text: "Click 'Enroll' on your chosen course. Create a free WashBizHub account if you haven't already. Complete payment securely through Stripe. Access your course immediately after purchase."
            },
            {
              name: "Complete Lessons at Your Pace",
              text: "Watch video lessons, read materials, and complete knowledge checks. Track your progress through the dashboard. Take notes and download resources for future reference."
            },
            {
              name: "Earn Your Certificate",
              text: "After completing all lessons and passing the final assessment, receive your WashBizHub Academy Certificate. Share your achievement and apply your new skills to grow your business."
            }
          ],
          totalTime: "P14D"
        }}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Laundromat Business Fundamentals",
            "description": "Complete guide to starting and running a profitable laundromat business",
            "provider": {
              "@type": "Organization",
              "name": "WashBizHub Academy",
              "url": "https://washbizhub.com"
            },
            "educationalLevel": "Beginner",
            "courseMode": "online",
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "online",
              "courseWorkload": "PT8H"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "WashBizHub Academy Course Catalog",
            "description": "Professional laundromat business courses for owners and operators",
            "url": "https://washbizhub.com/courses",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Course",
                  "name": "Laundromat Operations 101",
                  "description": "Learn fundamentals of running a successful laundromat",
                  "provider": { "@type": "Organization", "name": "WashBizHub Academy" }
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "Course",
                  "name": "Financial Management for Laundromats",
                  "description": "Master profit margins, pricing, and cash flow management",
                  "provider": { "@type": "Organization", "name": "WashBizHub Academy" }
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "Course",
                  "name": "Laundromat Marketing Mastery",
                  "description": "Attract and retain customers effectively",
                  "provider": { "@type": "Organization", "name": "WashBizHub Academy" }
                }
              }
            ]
          }
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/courses" }
        ]}
        speakableSelectors={["h1", "h2", ".speakable"]}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Academy", url: "/courses" }]} />
          </div>
        </div>

        {/* Dashboard Header */}
        <section className="bg-primary/5 border-b">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">WashBizHub Academy</h1>
                <p className="text-muted-foreground">Master laundromat operations with expert-led courses</p>
              </div>
            </div>

            <DashboardGrid cols={4}>
              <StatCard
                title="Total Courses"
                value={coursesLoading ? "..." : publishedCourses.length}
                subtitle="Expert-led programs"
                icon={BookOpen}
                variant="blue"
              />
              <StatCard
                title="Learning Hours"
                value={coursesLoading ? "..." : totalHours}
                subtitle="Of video content"
                icon={Clock}
                variant="purple"
              />
              <StatCard
                title="Students Enrolled"
                value="2.4K+"
                subtitle="Active learners"
                icon={Users}
                variant="pink"
              />
              <StatCard
                title="Completion Rate"
                value="89%"
                subtitle="Industry leading"
                icon={Trophy}
                variant="green"
              />
            </DashboardGrid>
          </div>
        </section>

        {/* My Learning Progress (if enrolled) */}
        {enrolledCourses.length > 0 && (
          <section className="py-8 border-b bg-muted/30">
            <div className="mx-auto max-w-7xl px-6">
              <SectionHeader
                title="My Learning"
                subtitle="Continue where you left off"
                icon={PlayCircle}
                color="#10b981"
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.slice(0, 3).map(course => {
                  const progress = getEnrollmentProgress(course.id);
                  return (
                    <Card key={course.id} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {Math.floor(course.duration / 60)}h total
                            </p>
                            <div className="mt-2">
                              <ProgressBar
                                value={progress}
                                label=""
                                showValue={true}
                                color="green"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-4">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Left Sidebar - Filters */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-500" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Level Filter */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Difficulty Level</h4>
                      <div className="space-y-2">
                        {COURSE_LEVELS.map(level => (
                          <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level.id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all text-sm ${
                              selectedLevel === level.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            data-testid={`filter-level-${level.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: level.color }}
                              />
                              <span>{level.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Category</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-all text-sm ${
                            selectedCategory === 'all'
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>All Categories</span>
                        </button>
                        {COURSE_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-all text-sm ${
                              selectedCategory === cat.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <cat.icon className="w-4 h-4" style={{ color: selectedCategory === cat.id ? 'currentColor' : cat.color }} />
                            <span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Level Distribution */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Course Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart
                      data={levelData.length > 0 ? levelData : [
                        { label: 'Beginner', value: 0, color: '#10b981' },
                        { label: 'Intermediate', value: 0, color: '#f59e0b' },
                        { label: 'Advanced', value: 0, color: '#ef4444' },
                      ]}
                      size={120}
                      thickness={16}
                      centerValue={publishedCourses.length}
                      centerLabel="Courses"
                      showLegend={false}
                    />
                    <div className="mt-4 space-y-2">
                      {(levelData.length > 0 ? levelData : [
                        { label: 'Beginner', value: 0, color: '#10b981' },
                        { label: 'Intermediate', value: 0, color: '#f59e0b' },
                        { label: 'Advanced', value: 0, color: '#ef4444' },
                      ]).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Featured Courses */}
                {(featuredCourses.length > 0 || publishedCourses.length === 0) && selectedLevel === 'all' && selectedCategory === 'all' && (
                  <div className="mb-8">
                    <SectionHeader
                      title="Featured Courses"
                      subtitle="Our most popular programs"
                      icon={Star}
                      color="#f59e0b"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      {(featuredCourses.length > 0 ? featuredCourses : [
                        { id: '1', title: 'Laundromat Business Fundamentals', description: 'Complete guide to starting and running a profitable laundromat', instructorName: 'Nick Hodge', price: '297', duration: 480, level: 'Beginner', category: 'Operations', featured: true },
                        { id: '2', title: 'Advanced Financial Management', description: 'Master the financial aspects of laundromat ownership', instructorName: 'Nick Hodge', price: '497', duration: 360, level: 'Advanced', category: 'Finance', featured: true },
                      ]).slice(0, 2).map((course: any) => (
                        <Card key={course.id} className="hover-elevate border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <Trophy className="w-10 h-10 text-white" />
                              </div>
                              <div className="flex-1">
                                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 mb-2">
                                  <Star className="w-3 h-3 mr-1" /> Featured
                                </Badge>
                                <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(course.duration / 60)}h
                                  </span>
                                  <Badge variant="outline" style={{ borderColor: getLevelColor(course.level), color: getLevelColor(course.level) }}>
                                    {course.level}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                              <span className="text-2xl font-black text-primary">${parseFloat(course.price).toFixed(0)}</span>
                              <Link href={`/courses/${course.id}`}>
                                <Button>
                                  View Course <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{sortedCourses.length}</span>
                    <span className="text-muted-foreground">course{sortedCourses.length !== 1 ? 's' : ''} available</span>
                  </div>
                </div>

                {/* Course Grid */}
                {sortedCourses.length === 0 && publishedCourses.length === 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: '1', title: 'Laundromat Operations 101', desc: 'Learn the fundamentals of running a successful laundromat', level: 'Beginner', hours: 6, price: 197 },
                      { id: '2', title: 'Financial Management', desc: 'Master profit margins, pricing, and cash flow', level: 'Intermediate', hours: 8, price: 297 },
                      { id: '3', title: 'Marketing Mastery', desc: 'Attract and retain customers effectively', level: 'Intermediate', hours: 5, price: 247 },
                      { id: '4', title: 'Equipment Maintenance', desc: 'Extend machine life and reduce downtime', level: 'Beginner', hours: 4, price: 147 },
                      { id: '5', title: 'Multi-Location Management', desc: 'Scale your laundromat empire', level: 'Advanced', hours: 10, price: 497 },
                      { id: '6', title: 'Employee Training System', desc: 'Build a high-performing team', level: 'Intermediate', hours: 6, price: 297 },
                    ].map(course => (
                      <Card key={course.id} className="hover-elevate group">
                        <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/80" />
                        </div>
                        <CardContent className="p-4">
                          <Badge
                            className="mb-2"
                            style={{
                              backgroundColor: `${getLevelColor(course.level)}20`,
                              color: getLevelColor(course.level),
                              borderColor: `${getLevelColor(course.level)}30`,
                            }}
                          >
                            {course.level}
                          </Badge>
                          <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.desc}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {course.hours}h
                            </span>
                            <span className="text-lg font-black text-primary">${course.price}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button size="sm" className="w-full">
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Course
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedCourses.map((course) => {
                      const enrolled = isEnrolled(course.id);
                      const progress = getEnrollmentProgress(course.id);
                      const levelColor = getLevelColor(course.level);

                      return (
                        <Card key={course.id} className="hover-elevate group overflow-hidden" data-testid={`card-course-${course.id}`}>
                          {course.thumbnailUrl ? (
                            <div className="h-32 overflow-hidden">
                              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-white/80" />
                            </div>
                          )}

                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                style={{
                                  backgroundColor: `${levelColor}20`,
                                  color: levelColor,
                                  borderColor: `${levelColor}30`,
                                }}
                              >
                                {course.level}
                              </Badge>
                              {enrolled && (
                                <Badge variant="default">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Enrolled
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {course.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(course.duration / 60)}h
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {course.instructorName}
                              </span>
                            </div>

                            {enrolled && progress > 0 && (
                              <ProgressBar value={progress} color="green" size="sm" />
                            )}
                          </CardContent>

                          <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
                            {enrolled ? (
                              <Button className="w-full">
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Continue
                              </Button>
                            ) : (
                              <>
                                <span className="text-xl font-black text-primary">
                                  ${parseFloat(course.price).toFixed(0)}
                                </span>
                                <Link href={`/courses/${course.id}`}>
                                  <Button>
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    View Course
                                  </Button>
                                </Link>
                              </>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-muted/50 py-16 border-t">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Become a Certified Laundromat Professional
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Complete our flagship program and earn your industry certification.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500">
                <GraduationCap className="w-4 h-4 mr-2" />
                View Certification Program
              </Button>
              <Button size="lg" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Download Catalog
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
