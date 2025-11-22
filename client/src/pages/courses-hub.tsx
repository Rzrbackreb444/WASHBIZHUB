import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { BookOpen, Users, BarChart3, Trophy } from 'lucide-react';
import { SEO } from '@/components/SEO';

const COURSES = [
  {
    id: 'laundromat-101',
    title: 'Laundromat 101: The Fundamentals',
    description: 'Everything you need to know to start your laundromat business - from site selection to operations.',
    instructor: 'WashBizHub Academy',
    level: 'Beginner',
    duration: '8 weeks',
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
    students: 520,
    rating: 4.8,
    modules: 8,
    lessons: 28,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
];

export default function CoursesHub() {
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredCourses = selectedLevel === 'all' 
    ? COURSES 
    : COURSES.filter(c => c.level === selectedLevel);

  return (
    <>
      <SEO
        title="Learn Laundromat Business | Courses & Training | WashBizHub"
        description="Industry-leading courses taught by experienced operators and executives. Master laundromat operations, financials, marketing, and scaling."
        canonicalUrl="/courses"
        keywords={['laundromat courses', 'business training', 'laundry industry education', 'operations management', 'financial planning']}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              <BookOpen className="w-3 h-3 mr-1" />
              Professional Education
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 uppercase tracking-tight">
              Master Your Business
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              Industry-leading courses taught by experienced operators. From fundamentals to advanced scaling strategies.
            </p>
            
            {/* Filters */}
            <div className="flex justify-center gap-2 flex-wrap">
              <Button 
                variant={selectedLevel === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('all')}
                data-testid="button-filter-all"
              >
                All Levels
              </Button>
              <Button 
                variant={selectedLevel === 'Beginner' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('Beginner')}
                data-testid="button-filter-beginner"
              >
                Beginner
              </Button>
              <Button 
                variant={selectedLevel === 'Intermediate' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('Intermediate')}
                data-testid="button-filter-intermediate"
              >
                Intermediate
              </Button>
              <Button 
                variant={selectedLevel === 'Advanced' ? 'default' : 'outline'}
                onClick={() => setSelectedLevel('Advanced')}
                data-testid="button-filter-advanced"
              >
                Advanced
              </Button>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <Card key={course.id} className="hover-elevate overflow-hidden flex flex-col" data-testid={`card-course-${course.id}`}>
                <div 
                  className="h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.thumbnail})` }}
                />
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <Badge variant="outline" className="flex-shrink-0">
                      {course.level}
                    </Badge>
                  </div>
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
                        <Trophy className="w-4 h-4" />
                        {course.rating} rating
                      </span>
                    </div>
                  </div>
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full hover-elevate active-elevate-2" data-testid={`button-enroll-${course.id}`}>
                      Enroll Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
