import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, XCircle, ArrowRight, RotateCcw, Award, 
  Lightbulb, TrendingUp, Target, Trophy
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "scenario";
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  hint?: string;
}

interface QuizProps {
  title: string;
  description: string;
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

export function InteractiveQuiz({ title, description, questions, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length) * 100;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const handleAnswerSelect = (index: number) => {
    if (!showAnswer) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowAnswer(true);
    
    if (isCorrect) {
      setScore(score + currentQuestion.points);
    }
    
    setAnswers([...answers, isCorrect]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setShowHint(false);
    } else {
      // Calculate final score from the score state (which already includes all answered questions)
      // The score was updated in handleSubmit when the answer was submitted
      const calculatedScore = score;
      setFinalScore(calculatedScore);
      setIsComplete(true);
      onComplete(calculatedScore, totalPoints);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowHint(false);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
    setFinalScore(0);
  };

  if (isComplete) {
    const percentage = (finalScore / totalPoints) * 100;
    const passed = percentage >= 70;

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
            You scored {finalScore} out of {totalPoints} points
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
                {answers.filter(a => a).length}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {answers.filter(a => !a).length}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {questions.length}
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
              <span>Score: {score}/{totalPoints} points</span>
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
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrectness = showAnswer;

              let buttonVariant: "outline" | "default" | "secondary" = "outline";
              let borderColor = "";
              let icon = null;

              if (showCorrectness) {
                if (isCorrect) {
                  borderColor = "border-green-500 bg-green-50 dark:bg-green-950";
                  icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                } else if (isSelected && !isCorrect) {
                  borderColor = "border-red-500 bg-red-50 dark:bg-red-950";
                  icon = <XCircle className="w-5 h-5 text-red-600" />;
                }
              } else if (isSelected) {
                buttonVariant = "default";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrectness ? borderColor : ""
                  } ${
                    isSelected && !showCorrectness ? "border-accent bg-accent/10" : ""
                  } ${
                    !showAnswer ? "hover-elevate active-elevate-2 cursor-pointer" : "cursor-default"
                  }`}
                  data-testid={`answer-option-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected && !showCorrectness ? "border-accent bg-accent text-accent-foreground" : ""
                      } ${
                        showCorrectness && isCorrect ? "border-green-600 bg-green-600 text-white" : ""
                      } ${
                        showCorrectness && isSelected && !isCorrect ? "border-red-600 bg-red-600 text-white" : ""
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                    {showCorrectness && icon}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          {currentQuestion.hint && !showAnswer && (
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

          {/* Explanation */}
          {showAnswer && (
            <div className={`p-4 rounded-lg border-2 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? "bg-green-50 dark:bg-green-950 border-green-500"
                : "bg-blue-50 dark:bg-blue-950 border-blue-500"
            }`}>
              <div className="flex items-start gap-2">
                <TrendingUp className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  selectedAnswer === currentQuestion.correctAnswer ? "text-green-600" : "text-blue-600"
                }`} />
                <div>
                  <p className={`font-semibold text-sm mb-1 ${
                    selectedAnswer === currentQuestion.correctAnswer ? "text-green-600" : "text-blue-600"
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Learn More"}
                  </p>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {!showAnswer ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="ml-auto"
              data-testid="button-submit-answer"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="ml-auto"
              data-testid="button-next-question"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Quiz"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
