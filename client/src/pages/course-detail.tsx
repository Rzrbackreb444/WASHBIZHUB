import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Clock, Award, CheckCircle2, Lock, Shield,
  TrendingUp, Users, Star, PlayCircle, Download
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Course not found</h3>
            <Link href="/courses">
              <Button variant="outline">Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalHours = Math.floor(course.duration / 60);
  const firstLesson = lessons[0];

  // Group lessons by module (every 5-7 lessons is a module based on our data)
  const modules = [
    { name: "Module 1: Find Your $10K/Month Deal", lessons: lessons.slice(0, 5) },
    { name: "Module 2: Buy at 60¢ on the Dollar", lessons: lessons.slice(5, 11) },
    { name: "Module 3: Operate on Autopilot", lessons: lessons.slice(11, 17) },
    { name: "Module 4: Scale to 3+ Stores", lessons: lessons.slice(17) },
  ];

  const bonuses = [
    { name: "Private Slack Community", value: "Lifetime Access", icon: Users },
    { name: "Monthly Group Coaching Call", value: "12 Months", icon: Users },
    { name: "CLEANBI™ Pro Spreadsheet", value: "$497 Value", icon: TrendingUp },
    { name: "Equipment Buying Checklist PDF", value: "Included", icon: Download },
    { name: "1-Hour Deal Review with Nick", value: "Priceless", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {course.featured && (
                <Badge className="mb-4 bg-accent text-accent-foreground">
                  🔥 FEATURED COURSE
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-course-title">
                {course.title}
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-6">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <Clock className="w-5 h-5" />
                  <span>{totalHours} hours</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <BookOpen className="w-5 h-5" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <Award className="w-5 h-5" />
                  <span className="capitalize">{course.level}</span>
                </div>
              </div>
              <div className="text-sm text-primary-foreground/70 mb-8">
                Instructor: <span className="font-semibold text-primary-foreground">{course.instructorName}</span>
              </div>
            </div>

            {/* Price Card */}
            <Card className="bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <div className="text-center">
                  <div className="text-5xl font-bold text-accent mb-2" data-testid="text-course-price">
                    ${parseFloat(course.price).toFixed(0)}
                  </div>
                  <p className="text-muted-foreground">One-time payment • Lifetime access</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/courses/${courseId}/lessons/${firstLesson?.id}`}>
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6"
                    disabled={!firstLesson}
                    data-testid="button-enroll-now"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Enroll Now – 50 Spots Only
                  </Button>
                </Link>
                {firstLesson?.isFree && (
                  <Link href={`/courses/${courseId}/lessons/${firstLesson.id}`}>
                    <Button variant="outline" className="w-full" data-testid="button-preview-free">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Preview First Lesson Free
                    </Button>
                  </Link>
                )}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                    <Shield className="w-4 h-4" />
                    <span>100% Money-Back Guarantee</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete Module 1. If you don't find a deal worth analyzing in 30 days, get a full refund.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What You'll Build */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            What You'll Build
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map((module, idx) => (
              <Card key={idx} className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    <div className="bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <span>{module.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bonuses */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Exclusive Bonuses
          </h2>
          <p className="text-center text-blue-200 mb-8 text-lg">
            $2,997 Value Included Free
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonuses.map((bonus, idx) => {
              const Icon = bonus.icon;
              return (
                <Card key={idx} className="hover-elevate text-center">
                  <CardContent className="pt-6">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                    <h3 className="font-bold mb-2">{bonus.name}</h3>
                    <p className="text-sm text-muted-foreground">{bonus.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Money-Back Guarantee */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Shield className="w-8 h-8 text-green-500" />
                100% Money-Back Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-foreground/90">
                Complete Module 1. If you don't find a deal worth analyzing in 30 days, 
                get a full refund. No questions asked.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-primary/50 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your $10K/Month Laundromat Empire?
            </h2>
            <p className="text-xl text-blue-200 mb-6">
              Only 50 spots available. Doors close in 3 days.
            </p>
            <Link href={`/courses/${courseId}/lessons/${firstLesson?.id}`}>
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xl px-12 py-7"
                disabled={!firstLesson}
                data-testid="button-enroll-bottom"
              >
                YES! I WANT IN – SECURE MY SPOT
              </Button>
            </Link>
            <p className="text-sm text-blue-200/70 mt-4">
              🔒 Secure checkout • Lifetime access • 30-day guarantee
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
