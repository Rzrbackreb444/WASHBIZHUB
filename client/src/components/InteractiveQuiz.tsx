import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CheckCircle2, XCircle, Award, Lightbulb, TrendingUp, Target, Trophy,
  Zap, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface InteractiveQuizProps {
  title: string;
  description: string;
  questions: QuizQuestion[];
  lessonId: string;
  onComplete: (score: number, passed: boolean) => void;
  passingScore?: number;
}

export function InteractiveQuiz({ 
  title, 
  description, 
  questions, 
  lessonId, 
  onComplete,
  passingScore = 70
}: InteractiveQuizProps) {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    // Store the answer
    const updatedAnswers = { ...userAnswers, [currentQuestion.id]: selectedAnswer };
    setUserAnswers(updatedAnswers);

    // If more questions, move to next
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowHint(false);
    } else {
      // Last question - submit for grading
      setIsSubmitting(true);
      try {
        const response = await apiRequest("POST", `/api/lessons/${lessonId}/grade`, { answers: updatedAnswers });
        const results = await response.json();
        setGradingResults(results);
        setIsComplete(true);
        onComplete(results.score, results.total);
      } catch (error) {
        console.error("Failed to grade quiz:", error);
        alert("Failed to submit quiz. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setUserAnswers({});
    setIsComplete(false);
    setGradingResults(null);
  };

  if (isComplete && gradingResults) {
    const percentage = (gradingResults.score / gradingResults.total) * 100;
    const passed = gradingResults.passed;

    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
            {passed ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Target className="w-10 h-10 text-white" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {passed ? "Congratulations!" : "Good Effort!"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            You scored {gradingResults.score} out of {gradingResults.total} correct
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Score</span>
              <span className="text-2xl font-bold text-accent">{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {gradingResults.score}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {gradingResults.total - gradingResults.score}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {gradingResults.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          {passed && (
            <div className="p-4 bg-accent/10 border border-accent rounded-lg text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="font-semibold text-accent">Achievement Unlocked!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You've mastered this lesson with a passing score
              </p>
            </div>
          )}

          {!passed && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Keep practicing! You need 70% to pass. Review the explanations and try again.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={handleRestart} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          {passed && (
            <Button className="flex-1">
              Next Lesson
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Quiz Progress</span>
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Answered: {Object.keys(userAnswers).length}/{questions.length}</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {currentQuestion.type === "multiple_choice" && "Multiple Choice"}
                {currentQuestion.type === "true_false" && "True/False"}
                {currentQuestion.type === "scenario" && "Scenario"}
              </Badge>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </div>
            <Badge className="bg-accent text-accent-foreground">
              {currentQuestion.points} pts
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected ? "border-accent bg-accent/10" : ""
                  } hover-elevate active-elevate-2 cursor-pointer`}
                  data-testid={`answer-option-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-accent bg-accent text-accent-foreground" : ""
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {currentQuestion.hint && (
            <div className="pt-2">
              {!showHint ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-accent"
                  data-testid="button-show-hint"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Show Hint
                </Button>
              ) : (
                <div className="p-3 bg-accent/10 border border-accent rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-accent mb-1">Hint</p>
                      <p className="text-sm">{currentQuestion.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null || isSubmitting}
            className="ml-auto"
            data-testid="button-next-question"
          >
            {isSubmitting ? "Submitting..." : (
              currentQuestionIndex < questions.length - 1 ? (
                <>Next Question<ArrowRight className="w-4 h-4 ml-2" /></>
              ) : (
                <>Submit Quiz<ArrowRight className="w-4 h-4 ml-2" /></>
              )
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
