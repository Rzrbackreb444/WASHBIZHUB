import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle, Lock, PlayCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: number;
  level: string;
  tags: string[];
  thumbnailUrl: string | null;
  isPublished: boolean;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
}

export default function Courses() {
  const { toast } = useToast();
  const [purchasingCourseId, setPurchasingCourseId] = useState<string | null>(null);

  // Fetch published courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch user enrollments (mock userId for now)
  const userId = "user-123";
  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", userId],
  });

  // Purchase course mutation
  const purchaseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest(`/api/courses/${courseId}/purchase`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      return response.json();
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: "Error",
          description: "Payment system not available",
          variant: "destructive",
        });
        return;
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
      setPurchasingCourseId(null);
    },
  });

  const handlePurchase = (courseId: string) => {
    setPurchasingCourseId(courseId);
    purchaseMutation.mutate(courseId);
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };

  const publishedCourses = courses.filter(c => c.isPublished);

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4" data-testid="text-page-title">
            Professional Courses
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Master laundromat business operations with expert-led courses designed for success
          </p>
        </div>

        {publishedCourses.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No courses available yet</h3>
              <p className="text-muted-foreground">Check back soon for new course offerings</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => {
              const enrolled = isEnrolled(course.id);
              const progress = getEnrollmentProgress(course.id);
              const isPurchasing = purchasingCourseId === course.id;

              return (
                <Card key={course.id} className="flex flex-col hover-elevate" data-testid={`card-course-${course.id}`}>
                  {course.thumbnailUrl && (
                    <div className="h-48 overflow-hidden rounded-t-md">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-none">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg" data-testid={`text-course-title-${course.id}`}>
                        {course.title}
                      </CardTitle>
                      {enrolled && (
                        <Badge variant="default" className="flex-shrink-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enrolled
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}h</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Instructor: <span className="font-medium text-foreground">{course.instructor}</span>
                    </div>

                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {enrolled && progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex-none flex items-center justify-between gap-2">
                    {enrolled ? (
                      <>
                        <Button className="flex-1" data-testid={`button-continue-${course.id}`}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-primary">
                          ${course.price}
                        </div>
                        <Button
                          onClick={() => handlePurchase(course.id)}
                          disabled={isPurchasing || purchaseMutation.isPending}
                          className="flex-1"
                          data-testid={`button-purchase-${course.id}`}
                        >
                          {isPurchasing ? (
                            "Processing..."
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </Button>
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
  );
}
