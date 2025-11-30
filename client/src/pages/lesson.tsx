import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  BookOpen, CheckCircle, ArrowLeft, ArrowRight, 
  Clock, Award, PlayCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: any; // JSON with text, video, quiz
  order: number;
  duration: number;
  videoUrl: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Enrollment {
  id: string;
  progress: number;
  currentLessonId: string | null;
  completedLessons: string[] | null;
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { toast } = useToast();
  const userId = "temp-user-id"; // TODO: Get from auth

  const { data: course } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery<Enrollment>({
    queryKey: [`/api/enrollments?userId=${userId}&courseId=${courseId}`],
    enabled: !!userId && !!courseId,
  });

  const currentLesson = lessons.find(l => l.id === lessonId);
  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const completeLessonMutation = useMutation({
    mutationFn: async ({ score, total }: { score: number; total: number }) => {
      if (!enrollment || !currentLesson) return;

      const completedLessons = enrollment.completedLessons || [];
      const isAlreadyCompleted = completedLessons.includes(currentLesson.id);

      if (!isAlreadyCompleted) {
        completedLessons.push(currentLesson.id);
      }

      const progress = (completedLessons.length / lessons.length) * 100;

      await apiRequest("PUT", `/api/enrollments/${enrollment.id}/progress`, {
        progress,
        currentLessonId: nextLesson?.id || currentLesson.id,
        completedLessons,
      });

      return { score, total, passed: (score / total) >= 0.7 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      
      if (data?.passed) {
        toast({
          title: "Lesson Complete!",
          description: `You scored ${data.score}/${data.total}. Great work!`,
        });
      }
    },
  });

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Lesson not found</h3>
            <p className="text-muted-foreground">This lesson may have been removed</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lessonContent = currentLesson.content;
  const isCompleted = enrollment?.completedLessons?.includes(currentLesson.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Progress Header */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">{course.title}</h2>
                <h3 className="text-lg font-bold">{currentLesson.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                <Badge variant="outline">
                  Lesson {currentIndex + 1} of {lessons.length}
                </Badge>
              </div>
            </div>
            {enrollment && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-semibold">{Math.round(enrollment.progress)}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Player */}
        {lessonContent.video && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Video content for this lesson</p>
                  <p className="text-sm text-muted-foreground mt-2">Duration: {currentLesson.duration} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        {lessonContent.text && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Lesson Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-h2:text-2xl prose-h2:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-strong:text-primary prose-p:text-muted-foreground prose-hr:border-border prose-hr:my-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {lessonContent.text}
              </ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {/* Interactive Quiz */}
        {lessonContent.quiz && (
          <div className="mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Knowledge Check</h2>
              <p className="text-muted-foreground">Test your understanding with this interactive quiz</p>
            </div>
            <InteractiveQuiz
              title={currentLesson.title}
              description="Complete the quiz to progress to the next lesson"
              questions={lessonContent.quiz.questions}
              lessonId={currentLesson.id}
              onComplete={(score, total) => {
                completeLessonMutation.mutate({ score, total });
              }}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mt-8">
          {previousLesson ? (
            <Button
              variant="outline"
              onClick={() => window.location.href = `/courses/${courseId}/lessons/${previousLesson.id}`}
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Lesson
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => window.location.href = `/courses`}
              data-testid="button-back-to-courses"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          )}

          {nextLesson ? (
            <Button
              onClick={() => window.location.href = `/courses/${courseId}/lessons/${nextLesson.id}`}
              data-testid="button-next"
            >
              Next Lesson
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = `/courses/${courseId}`}
              className="bg-accent"
              data-testid="button-complete-course"
            >
              <Award className="w-4 h-4 mr-2" />
              Complete Course
            </Button>
          )}
        </div>

        {/* Course Statistics */}
        {enrollment && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {enrollment.completedLessons?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Lessons Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {lessons.length - (enrollment.completedLessons?.length || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Lessons Remaining</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {Math.round(enrollment.progress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
