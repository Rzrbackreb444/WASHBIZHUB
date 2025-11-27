import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { BookOpen, Users, BarChart3, Trophy, Clock, GraduationCap, Filter, Award, Star } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  StatCard, DashboardGrid, DonutChart
} from '@/components/dashboard/DashboardComponents';

const COURSES = [
  {
    id: 'laundromat-101',
    title: 'Laundromat 101: The Fundamentals',
    description: 'Everything you need to know to start your laundromat business - from site selection to operations.',
    instructor: 'WashBizHub Academy',
    level: 'Beginner',
    duration: '8 weeks',
    durationHours: 24,
    students: 1250,
    rating: 4.9,
    modules: 12,
    lessons: 48,
    thumbnail: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop',
  },
  {
    id: 'advanced-ops',
    title: 'Advanced Operations & Scaling',
    description: 'Master the operational excellence frameworks used by top-tier laundromat operators managing 20+ locations.',
    instructor: 'Operations Director at WashBizHub',
    level: 'Advanced',
    duration: '6 weeks',
    durationHours: 18,
    students: 420,
    rating: 4.8,
    modules: 10,
    lessons: 35,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: 'financial-mastery',
    title: 'Financial Mastery for Laundromat Owners',
    description: 'Deep dive into pricing strategies, cost optimization, profitability analysis, and financial forecasting.',
    instructor: 'CFO of WashBizHub',
    level: 'Intermediate',
    duration: '5 weeks',
    durationHours: 15,
    students: 680,
    rating: 4.9,
    modules: 9,
    lessons: 32,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-adf4e5a0a1b2?w=400&h=300&fit=crop',
  },
  {
    id: 'marketing-growth',
    title: 'Marketing & Customer Acquisition',
    description: 'Learn proven marketing strategies to acquire and retain customers - from local SEO to loyalty programs.',
    instructor: 'CMO of WashBizHub',
    level: 'Intermediate',
    duration: '4 weeks',
    durationHours: 12,
    students: 520,
    rating: 4.8,
    modules: 8,
    lessons: 28,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
];

const COURSE_LEVELS = [
  { id: 'all', name: 'All Levels', color: '#8b5cf6' },
  { id: 'Beginner', name: 'Beginner', color: '#10b981' },
  { id: 'Intermediate', name: 'Intermediate', color: '#f59e0b' },
  { id: 'Advanced', name: 'Advanced', color: '#ef4444' },
];

export default function CoursesHub() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCourses = selectedLevel === 'all' 
    ? COURSES 
    : COURSES.filter(c => c.level === selectedLevel);

  const totalHours = COURSES.reduce((acc, c) => acc + c.durationHours, 0);
  const totalStudents = COURSES.reduce((acc, c) => acc + c.students, 0);

  const levelData = COURSE_LEVELS.slice(1).map(level => ({
    label: level.name,
    value: COURSES.filter(c => c.level === level.id).length,
    color: level.color,
  }));

  return (
    <>
      <SEO
        title="Learn Laundromat Business | Courses & Training | WashBizHub"
        description="Industry-leading courses taught by experienced operators and executives. Master laundromat operations, financials, marketing, and scaling."
        canonicalUrl="/courses"
        keywords={['laundromat courses', 'business training', 'laundry industry education', 'operations management', 'financial planning']}
      />
      
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Academy", url: "/courses" }]} />
          </div>
        </div>

        {/* Dashboard Header */}
        <section className="bg-background border-b">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <GraduationCap className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-courses-title">WashBizHub Academy</h1>
                <p className="text-muted-foreground" data-testid="text-courses-subtitle">Master laundromat operations with expert-led courses</p>
              </div>
            </div>

            <DashboardGrid cols={4}>
              <StatCard
                title="Total Courses"
                value={COURSES.length}
                subtitle="Expert-led programs"
                icon={BookOpen}
                variant="blue"
              />
              <StatCard
                title="Learning Hours"
                value={totalHours}
                subtitle="Of video content"
                icon={Clock}
                variant="purple"
              />
              <StatCard
                title="Students Enrolled"
                value={`${(totalStudents / 1000).toFixed(1)}K+`}
                subtitle="Active learners"
                icon={Users}
                variant="pink"
              />
              <StatCard
                title="Avg. Rating"
                value="4.85"
                subtitle="Industry leading"
                icon={Star}
                variant="green"
              />
            </DashboardGrid>
          </div>
        </section>

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
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedLevel === level.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            data-testid={`button-filter-${level.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: level.color }} 
                              />
                              {level.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Course Levels Chart */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Course Distribution</h4>
                      <DonutChart
                        data={levelData}
                        size={120}
                        thickness={16}
                        centerValue={COURSES.length}
                        centerLabel="Courses"
                        showLegend={false}
                      />
                      <div className="mt-4 space-y-2">
                        {levelData.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-muted-foreground">{item.label}</span>
                            </div>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content - Courses Grid */}
              <div className="lg:col-span-3">
                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" data-testid="text-courses-count">{filteredCourses.length}</span>
                    <span className="text-muted-foreground">course{filteredCourses.length !== 1 ? 's' : ''} available</span>
                  </div>
                </div>

                {/* Courses Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredCourses.map(course => (
                    <Card key={course.id} className="hover-elevate overflow-hidden flex flex-col" data-testid={`card-course-${course.id}`}>
                      <div 
                        className="h-40 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${course.thumbnail})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <Badge 
                            variant="secondary"
                            className="text-white border-white/20"
                            style={{ backgroundColor: COURSE_LEVELS.find(l => l.id === course.level)?.color }}
                          >
                            {course.level}
                          </Badge>
                          <div className="flex items-center gap-1 text-white text-sm">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </div>
                        </div>
                      </div>
                      <CardHeader className="flex-1">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {course.modules} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {course.lessons} lessons
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.students.toLocaleString()} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </span>
                          </div>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-enroll-${course.id}`}>
                            <Award className="w-4 h-4 mr-2" />
                            Enroll Now
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
