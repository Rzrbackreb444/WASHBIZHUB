import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Book, Lock, CheckCircle, ChevronRight, Calculator, Star, Shield, Zap, Award } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookChapter {
  id: string;
  title: string;
  chapterNumber: number;
  content: string;
  summary: string;
  isFree: boolean;
}

interface BookAccess {
  id: string;
  userId: string;
  purchasedAt: string;
}

export default function BookPage() {
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<BookChapter | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const userId = "user-123";

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<BookChapter[]>({
    queryKey: ["/api/book/chapters"],
  });

  const { data: bookAccess } = useQuery<BookAccess | null>({
    queryKey: ["/api/book/access", userId],
    enabled: !!userId,
  });

  const hasAccess = !!bookAccess;

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/book/purchase", { userId });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Checkout URL not available",
          variant: "destructive",
        });
      }
      setIsPurchasing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsPurchasing(false);
    },
  });

  const handlePurchase = () => {
    setIsPurchasing(true);
    purchaseMutation.mutate();
  };

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  const canReadChapter = (chapter: BookChapter) => {
    return chapter.isFree || hasAccess;
  };

  if (chaptersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="loading-state">
        <div className="flex flex-col items-center gap-3">
          <Book className="w-8 h-8 text-muted-foreground animate-pulse" />
          <span className="text-muted-foreground">Loading chapters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Book className="w-6 h-6 text-primary" />
                <Badge variant="secondary" className="text-xs">Premium Guide</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight" data-testid="text-book-title">
                The Laundromat Bible
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl" data-testid="text-book-subtitle">
                The complete guide to building a profitable laundromat business. Three generations of proven strategies, 
                financial models, and insider knowledge.
              </p>
            </div>
            {hasAccess && (
              <Badge variant="default" className="h-fit gap-1.5" data-testid="badge-full-access">
                <CheckCircle className="w-3.5 h-3.5" />
                Full Access Unlocked
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <div className="sticky top-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Chapters</CardTitle>
                  <CardDescription className="text-sm">
                    {sortedChapters.length} chapters
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-2">
                      {sortedChapters.map((chapter) => {
                        const canRead = canReadChapter(chapter);
                        const isSelected = selectedChapter?.id === chapter.id;

                        return (
                          <button
                            key={chapter.id}
                            onClick={() => canRead && setSelectedChapter(chapter)}
                            disabled={!canRead}
                            className={`w-full text-left p-3 rounded-md transition-all mb-1 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : canRead
                                ? "hover:bg-muted"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            data-testid={`button-chapter-${chapter.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium leading-tight ${isSelected ? "" : "text-foreground"}`}>
                                  <span className="font-semibold">{chapter.chapterNumber}.</span> {chapter.title}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {chapter.isFree ? (
                                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                                    Free
                                  </Badge>
                                ) : !hasAccess ? (
                                  <Lock className="w-3.5 h-3.5 text-muted-foreground" data-testid={`icon-lock-${chapter.id}`} />
                                ) : (
                                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {!hasAccess && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-price">$47</div>
                      <div className="text-sm text-muted-foreground">One-time purchase</div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>All {sortedChapters.length} chapters</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>Lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>Free updates</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isPurchasing || purchaseMutation.isPending}
                      data-testid="button-purchase-book"
                    >
                      {isPurchasing ? "Processing..." : "Unlock Full Access"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-9">
            {selectedChapter ? (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-primary mb-1" data-testid="text-chapter-number">
                        Chapter {selectedChapter.chapterNumber}
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-chapter-title">
                        {selectedChapter.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base" data-testid="text-chapter-summary">
                        {selectedChapter.summary}
                      </CardDescription>
                    </div>
                    {selectedChapter.isFree && (
                      <Badge variant="secondary">Free Preview</Badge>
                    )}
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <article className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed" data-testid="text-chapter-content">
                      {selectedChapter.content}
                    </div>
                  </article>

                  {selectedChapter.title.toLowerCase().includes("roi") && (
                    <div className="mt-8 p-6 bg-muted rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Interactive ROI Calculator</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Calculate your potential return on investment based on this chapter's concepts.
                      </p>
                      <Button asChild>
                        <a href="/roi-calculator" data-testid="link-roi-calculator">
                          Open ROI Calculator
                        </a>
                      </Button>
                    </div>
                  )}

                  {!hasAccess && !selectedChapter.isFree && (
                    <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-dashed text-center">
                      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">This chapter is locked</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Purchase full access to unlock all chapters and continue reading.
                      </p>
                      <Button onClick={handlePurchase} disabled={isPurchasing} data-testid="button-unlock-chapter">
                        {isPurchasing ? "Processing..." : "Unlock for $47"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                      <Book className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-select-chapter">
                      Select a Chapter to Begin
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Choose a chapter from the sidebar to start reading. Free chapters are marked and available to everyone.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <Star className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="text-sm font-medium text-foreground">Expert Content</div>
                        <div className="text-xs text-muted-foreground">3 generations of knowledge</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="text-sm font-medium text-foreground">Actionable</div>
                        <div className="text-xs text-muted-foreground">Ready-to-use strategies</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="text-sm font-medium text-foreground">Proven Results</div>
                        <div className="text-xs text-muted-foreground">Real-world tested</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <Award className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="text-sm font-medium text-foreground">Complete Guide</div>
                        <div className="text-xs text-muted-foreground">{sortedChapters.length} in-depth chapters</div>
                      </div>
                    </div>

                    {!hasAccess && (
                      <Button
                        size="lg"
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        data-testid="button-purchase-cta"
                      >
                        {isPurchasing ? "Processing..." : "Get Full Access - $47"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
