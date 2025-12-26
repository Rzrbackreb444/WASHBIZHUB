import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { BookOpen, Users, Clock, GraduationCap, Filter, Award, CheckCircle, Loader2 } from 'lucide-react';
import { Star } from "@/lib/icon-registry";
import { SEO } from '@/components/SEO';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  StatCard, DashboardGrid, DonutChart
} from '@/components/dashboard/DashboardComponents';

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
  isFree?: boolean;
  tierLevel?: number;
  certificateEnabled?: boolean;
}

const COURSE_LEVELS = [
  { id: 'all', name: 'All Levels', color: '#8b5cf6' },
  { id: 'beginner', name: 'Beginner', color: '#10b981' },
  { id: 'intermediate', name: 'Intermediate', color: '#f59e0b' },
  { id: 'advanced', name: 'Advanced', color: '#ef4444' },
];

const getLevelColor = (level: string) => {
  const found = COURSE_LEVELS.find(l => l.id === level.toLowerCase());
  return found?.color || '#8b5cf6';
};

const getCourseThumbnail = (course: Course) => {
  if (course.thumbnailUrl) return course.thumbnailUrl;
  const thumbnails = [
    'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-adf4e5a0a1b2?w=400&h=300&fit=crop',
  ];
  return thumbnails[Math.abs(course.title.charCodeAt(0)) % thumbnails.length];
};

export default function CoursesHub() {
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const publishedCourses = courses.filter(c => c.published);
  
  const filteredCourses = selectedLevel === 'all' 
    ? publishedCourses 
    : publishedCourses.filter(c => c.level.toLowerCase() === selectedLevel);

  const totalHours = Math.round(publishedCourses.reduce((acc, c) => acc + (c.duration || 0), 0) / 60);

  const levelData = COURSE_LEVELS.slice(1).map(level => ({
    label: level.name,
    value: publishedCourses.filter(c => c.level.toLowerCase() === level.id).length,
    color: level.color,
  }));

  if (isLoading) {
    return (
      <>
        <SEO
          title="WashBizHub Academy | Professional Laundromat Training"
          description="Industry-leading courses taught by experienced operators. Master laundromat operations, equipment diagnostics, and business management."
          canonicalUrl="/courses"
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="WashBizHub Academy | Professional Laundromat Training"
        description="Industry-leading courses taught by experienced operators. Master laundromat operations, equipment diagnostics, and business management."
        canonicalUrl="/courses"
        keywords={['laundromat courses', 'equipment training', 'laundry industry education', 'operations management']}
      />
      
      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Academy", url: "/courses" }]} />
          </div>
        </div>

        <section className="bg-gradient-to-b from-[#001F3F] to-[#002B5C] text-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-xl">
                <GraduationCap className="w-8 h-8 text-[#39CCCC]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-courses-title" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  WashBizHub Academy
                </h1>
                <p className="text-white/70" data-testid="text-courses-subtitle">
                  Professional training for laundromat operators
                </p>
              </div>
            </div>

            <DashboardGrid cols={4}>
              <StatCard
                title="Total Courses"
                value={publishedCourses.length}
                subtitle="Expert-led programs"
                icon={BookOpen}
                variant="blue"
              />
              <StatCard
                title="Learning Hours"
                value={totalHours}
                subtitle="Of training content"
                icon={Clock}
                variant="purple"
              />
              <StatCard
                title="Free Courses"
                value={publishedCourses.filter(c => c.isFree).length}
                subtitle="No cost to start"
                icon={CheckCircle}
                variant="green"
              />
              <StatCard
                title="Certifications"
                value={publishedCourses.filter(c => c.certificateEnabled).length}
                subtitle="Earn credentials"
                icon={Award}
                variant="pink"
              />
            </DashboardGrid>
          </div>
        </section>

        {/* Featured: Forensic Investor Academy */}
        <section className="py-8 bg-gradient-to-r from-[#1a2e4a] to-[#0f1d30]">
          <div className="mx-auto max-w-7xl px-6">
            <Card className="bg-white/5 backdrop-blur-sm border-[#C8A661]/30 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="p-4 bg-[#C8A661]/20 rounded-xl shrink-0">
                    <Award className="w-10 h-10 text-[#C8A661]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#C8A661] text-white text-xs px-2 py-1 rounded font-medium">FEATURED</span>
                      <span className="text-white/60 text-sm">Professional Certification</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      WBH Forensic Investor Academy
                    </h2>
                    <p className="text-white/70 mb-4 max-w-2xl">
                      Master Larry Larsen's proven forensic due diligence framework. 15+ hours of training, 
                      access to 400+ exclusive articles in the Laundromat Larry Vault, and earn your WBH certification.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 15+ Hours
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> 6 Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" /> Certification
                      </span>
                    </div>
                  </div>
                  <Link href="/forensic-academy">
                    <Button 
                      size="lg" 
                      className="bg-[#C8A661] hover:bg-[#b89551] text-white shrink-0"
                      data-testid="button-forensic-academy"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary" />
                      Filter by Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
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

                    {publishedCourses.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3">Course Distribution</h4>
                        <DonutChart
                          data={levelData}
                          size={120}
                          thickness={16}
                          centerValue={publishedCourses.length}
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
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" data-testid="text-courses-count">{filteredCourses.length}</span>
                    <span className="text-muted-foreground">course{filteredCourses.length !== 1 ? 's' : ''} available</span>
                  </div>
                </div>

                {filteredCourses.length === 0 ? (
                  <Card className="p-12 text-center">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-4">Try selecting a different filter level</p>
                    <Button variant="outline" onClick={() => setSelectedLevel('all')}>
                      View All Courses
                    </Button>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredCourses.map(course => (
                      <Card key={course.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow" data-testid={`card-course-${course.id}`}>
                        <div 
                          className="h-40 bg-cover bg-center relative"
                          style={{ backgroundImage: `url(${getCourseThumbnail(course)})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            {course.featured && (
                              <Badge className="bg-amber-500 text-black">Featured</Badge>
                            )}
                            {course.isFree && (
                              <Badge className="bg-green-500 text-white">Free</Badge>
                            )}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <Badge 
                              variant="secondary"
                              className="text-white border-white/20"
                              style={{ backgroundColor: getLevelColor(course.level) }}
                            >
                              {course.level}
                            </Badge>
                            {course.certificateEnabled && (
                              <div className="flex items-center gap-1 text-white text-xs bg-black/40 px-2 py-1 rounded">
                                <Award className="w-3 h-3" />
                                Certificate
                              </div>
                            )}
                          </div>
                        </div>
                        <CardHeader className="flex-1">
                          <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {Math.round(course.duration / 60)} hours
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.instructorName}
                              </span>
                            </div>
                            <div className="text-sm">
                              {course.isFree ? (
                                <span className="text-green-600 font-semibold">Free Course</span>
                              ) : (
                                <span className="font-semibold">${parseFloat(course.price).toFixed(0)}</span>
                              )}
                            </div>
                          </div>
                          <Link href={`/courses/${course.id}`}>
                            <Button className="w-full" data-testid={`button-view-${course.id}`}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              {course.isFree ? 'Start Learning' : 'View Course'}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
