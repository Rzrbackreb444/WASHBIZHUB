import { useState } from "react";
import { useQuery, useMutation } from "@tantml:parameter>
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Book, Lock, CheckCircle, ChevronRight, Calculator } from "lucide-react";

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
  });

  const hasAccess = !!bookAccess;

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/book/purchase", {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapter Navigation */}
          <Card className="lg:col-span-1 h-fit sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Chapters
                </CardTitle>
                {hasAccess && (
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Full Access
                  </Badge>
                )}
              </div>
              <CardDescription>
                The Complete Laundromat Business Guide
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-4">
                  {sortedChapters.map((chapter) => {
                    const canRead = canReadChapter(chapter);
                    const isSelected = selectedChapter?.id === chapter.id;

                    return (
                      <button
                        key={chapter.id}
                        onClick={() => canRead && setSelectedChapter(chapter)}
                        disabled={!canRead}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : canRead
                            ? "hover-elevate"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        data-testid={`button-chapter-${chapter.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium mb-1 line-clamp-2">
                              {chapter.chapterNumber}. {chapter.title}
                            </div>
                            <div className="text-xs opacity-80 line-clamp-1">
                              {chapter.summary}
                            </div>
                          </div>
                          {chapter.isFree ? (
                            <Badge variant="secondary" className="flex-shrink-0 text-xs">
                              Free
                            </Badge>
                          ) : !hasAccess ? (
                            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>

            {!hasAccess && (
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={isPurchasing || purchaseMutation.isPending}
                  data-testid="button-purchase-book"
                >
                  {isPurchasing ? "Processing..." : "Unlock Full Book - $47"}
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Chapter Content */}
          <div className="lg:col-span-2">
            {selectedChapter ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Chapter {selectedChapter.chapterNumber}
                      </div>
                      <CardTitle className="text-2xl">{selectedChapter.title}</CardTitle>
                    </div>
                    {selectedChapter.isFree && (
                      <Badge variant="secondary">Free Preview</Badge>
                    )}
                  </div>
                  <CardDescription>{selectedChapter.summary}</CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">{selectedChapter.content}</div>
                  </div>

                  {/* Embedded Calculator Example */}
                  {selectedChapter.title.toLowerCase().includes("roi") && (
                    <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-4">
                        <Calculator className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Interactive ROI Calculator</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Calculate your potential return on investment based on this chapter's concepts
                      </p>
                      <Button asChild>
                        <a href="/roi-calculator" data-testid="link-roi-calculator">
                          Open ROI Calculator
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Book className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Chapter</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a chapter from the left sidebar to start reading. Free chapters are
                    available to everyone, while premium chapters require full book access.
                  </p>
                  {!hasAccess && (
                    <Button
                      className="mt-6"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      data-testid="button-purchase-cta"
                    >
                      Unlock Full Book - $47
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
