import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
  BookOpen, Clock, Award, CheckCircle2, Shield, GraduationCap,
  PlayCircle, ArrowLeft, Loader2
} from "lucide-react";

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
  certificateEnabled?: boolean;
  certificateTitle?: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  duration: number;
  isFree: boolean;
}

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };
  return colors[level.toLowerCase()] || '#8b5cf6';
};

export default function CourseDetail() {
  const { courseId } = useParams();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  if (courseLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-4">This course may have been moved or is no longer available.</p>
            <Link href="/courses">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalHours = Math.round(course.duration / 60);
  const totalMinutes = course.duration % 60;
  const firstLesson = lessons.find(l => l.isFree) || lessons[0];
  const freeLessons = lessons.filter(l => l.isFree);
  const isFree = course.isFree || parseFloat(course.price) === 0;

  return (
    <>
      <SEO 
        title={`${course.title} | WashBizHub Academy`}
        description={course.description}
        canonicalUrl={`/courses/${courseId}`}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-6xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Academy", url: "/courses" },
              { name: course.title, url: `/courses/${courseId}` }
            ]} />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#001F3F] to-[#002B5C] py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge 
                    style={{ backgroundColor: getLevelColor(course.level) }}
                    className="text-white"
                  >
                    {course.level}
                  </Badge>
                  {course.featured && (
                    <Badge className="bg-amber-500 text-black">Featured</Badge>
                  )}
                  {isFree && (
                    <Badge className="bg-green-500 text-white">Free Course</Badge>
                  )}
                  {course.certificateEnabled && (
                    <Badge variant="outline" className="border-white/30 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" 
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    data-testid="text-course-title">
                  {course.title}
                </h1>

                <p className="text-lg sm:text-xl text-white/80 mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-4 sm:gap-6 text-white/70 text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes > 0 ? `${totalMinutes}m` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>{course.instructorName}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card className="shadow-xl">
                  <CardHeader className="text-center pb-2">
                    {isFree ? (
                      <div className="text-3xl font-bold text-green-600">Free</div>
                    ) : (
                      <div className="text-4xl font-bold text-foreground" data-testid="text-course-price">
                        ${parseFloat(course.price).toFixed(0)}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isFree ? 'Start learning today' : 'One-time payment • Lifetime access'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {firstLesson ? (
                      <Link href={`/courses/${courseId}/lessons/${firstLesson.id}`}>
                        <Button 
                          className="w-full h-12 text-base font-semibold bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F]"
                          data-testid="button-start-course"
                        >
                          <PlayCircle className="w-5 h-5 mr-2" />
                          {isFree ? 'Start Course' : 'Enroll & Start'}
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full h-12">
                        Coming Soon
                      </Button>
                    )}

                    {freeLessons.length > 0 && !isFree && (
                      <p className="text-center text-sm text-muted-foreground">
                        {freeLessons.length} lesson{freeLessons.length > 1 ? 's' : ''} available for free preview
                      </p>
                    )}

                    {course.certificateEnabled && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Earn: {course.certificateTitle || 'Certificate of Completion'}</span>
                      </div>
                    )}

                    {!isFree && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 pt-2">
                        <Shield className="w-4 h-4" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Course Curriculum
            </h2>
            
            {lessons.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Lessons are being prepared. Check back soon!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <Card key={lesson.id} className="overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-foreground truncate">{lesson.title}</h3>
                          {lesson.isFree && (
                            <Badge variant="secondary" className="text-xs">Free Preview</Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-muted-foreground">
                          {lesson.duration} min
                        </span>
                        {lesson.isFree || isFree ? (
                          <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                            <Button size="sm" variant="outline" data-testid={`button-lesson-${idx}`}>
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="ghost" disabled className="text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="bg-muted/50 rounded-xl p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {isFree 
                ? 'This course is completely free. Start learning professional laundromat skills today.'
                : 'Invest in your professional development with lifetime access to this course.'}
            </p>
            {firstLesson && (
              <Link href={`/courses/${courseId}/lessons/${firstLesson.id}`}>
                <Button 
                  size="lg"
                  className="bg-[#001F3F] hover:bg-[#002B5C] text-white"
                  data-testid="button-enroll-bottom"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {isFree ? 'Start Learning' : 'Enroll Now'}
                </Button>
              </Link>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
