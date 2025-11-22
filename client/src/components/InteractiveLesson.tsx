import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, Award, BookmarkIcon, Lightbulb, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InteractiveLessonProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  content: string;
  estimatedTime: number;
  keyPoints: string[];
  onComplete: (passed: boolean) => void;
}

export function InteractiveLesson({
  courseId,
  lessonId,
  lessonTitle,
  content,
  estimatedTime,
  keyPoints,
  onComplete,
}: InteractiveLessonProps) {
  const { toast } = useToast();
  const [readingProgress, setReadingProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [startTime] = useState(Date.now());

  const completeLesson = useMutation({
    mutationFn: async () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
      await apiRequest("POST", `/api/lessons/${lessonId}/complete`, {
        score: 100,
        timeSpent,
      });
    },
    onSuccess: () => {
      toast({
        title: "Lesson Mastered!",
        description: "Ready for the quiz? Take it to lock in your knowledge.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/progress`] });
      onComplete(true);
    },
  });

  const saveNote = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/annotations", {
        chapterId: lessonId,
        type: "note",
        position: readingProgress,
        noteContent: notes,
      });
      toast({ title: "Note saved", description: "Your learning note has been saved." });
      setNotes("");
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Lesson Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{lessonTitle}</h1>
            <div className="flex gap-3 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime} min
              </Badge>
              <Badge variant="outline">
                {readingProgress}% completed
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Lightbulb className="w-3 h-3" />
                {keyPoints.length} key points
              </Badge>
            </div>
          </div>
          <Button
            variant={bookmarked ? "default" : "outline"}
            size="sm"
            onClick={() => setBookmarked(!bookmarked)}
            data-testid="button-bookmark"
          >
            <BookmarkIcon className="w-4 h-4 mr-2" />
            {bookmarked ? "Saved" : "Save"}
          </Button>
        </div>
        <Progress value={readingProgress} className="h-2" />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Lesson</TabsTrigger>
          <TabsTrigger value="keypoints">Key Points</TabsTrigger>
          <TabsTrigger value="notes">My Notes</TabsTrigger>
          <TabsTrigger value="guide">Study Guide</TabsTrigger>
        </TabsList>

        {/* Lesson Content */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardContent className="prose prose-invert max-w-none p-8 leading-relaxed text-base">
              <p className="whitespace-pre-wrap">{content}</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button
              onClick={() => setReadingProgress(Math.min(100, readingProgress + 20))}
              size="sm"
              data-testid="button-mark-progress"
            >
              Mark as Read
            </Button>
            <Button
              variant="outline"
              onClick={() => completeLesson.mutate()}
              disabled={readingProgress < 80}
              className="flex-1"
              data-testid="button-lesson-complete"
            >
              {readingProgress < 80 ? "Read more to continue" : "Complete Lesson →"}
            </Button>
          </div>
        </TabsContent>

        {/* Key Points */}
        <TabsContent value="keypoints" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Key Takeaways
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {keyPoints.map((point, i) => (
                <div key={i} className="flex gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-primary font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-primary/20">
                    {i + 1}
                  </span>
                  <p className="text-sm">{point}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capture Your Learnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write down what you've learned, questions you have, or how you'll apply this..."
                className="w-full h-32 p-4 bg-muted border rounded-md text-sm"
                data-testid="textarea-lesson-notes"
              />
              <Button
                onClick={() => saveNote.mutate()}
                disabled={saveNote.isPending || !notes.trim()}
                size="sm"
                className="w-full"
              >
                Save Learning Note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Guide */}
        <TabsContent value="guide" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Study Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                  <h4 className="font-semibold text-sm mb-2">💡 Before the Quiz</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Review all key points above</li>
                    <li>✓ Make sure you completed the lesson reading</li>
                    <li>✓ Take notes on areas you find challenging</li>
                  </ul>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <h4 className="font-semibold text-sm mb-2">🎯 During the Quiz</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Answer all questions carefully</li>
                    <li>✓ You have unlimited time per question</li>
                    <li>✓ 70% required to pass and move forward</li>
                  </ul>
                </div>
                <Button
                  className="w-full gap-2"
                  data-testid="button-start-quiz-guide"
                  onClick={() => window.location.hash = "#quiz"}
                >
                  <Award className="w-4 h-4" />
                  Ready for Quiz? Take It Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
