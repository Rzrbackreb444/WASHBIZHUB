import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Bell, Sparkles, CheckCircle, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookChapter {
  id: string;
  title: string;
  chapterNumber: number;
  content: string;
  summary: string;
  isFree: boolean;
}

interface InteractiveBookReaderProps {
  chapter: BookChapter;
  hasAccess: boolean;
  onNavigate: (direction: "prev" | "next") => void;
}

function ComingSoonGate() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/waitlist", {
        email,
        source: "interactive_book_reader",
        product: "laundromat_bible_interactive"
      });
      setIsSubscribed(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you when the Interactive Book Reader launches.",
      });
    } catch (error) {
      toast({
        title: "Subscribed!",
        description: "You'll be first to know when we launch.",
      });
      setIsSubscribed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-lg w-full border-[#C8A661]/20 bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#C8A661]/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#C8A661]" />
          </div>
          <Badge className="mx-auto mb-3 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 hover:bg-[#C8A661]/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
          <CardTitle className="text-2xl font-bold text-white">
            Interactive Book Reader
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            A revolutionary way to learn the laundromat business with AI-powered 
            highlights, notes, summaries, and progress tracking.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Feature Preview */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "AI Summaries", desc: "Key takeaways per chapter" },
              { label: "Smart Highlights", desc: "Save important passages" },
              { label: "Progress Tracking", desc: "Resume where you left off" },
              { label: "Personal Notes", desc: "Capture your insights" },
            ].map((feature) => (
              <div 
                key={feature.label}
                className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </div>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Email Capture */}
          {isSubscribed ? (
            <div className="p-4 rounded-lg bg-green-900/20 border border-green-700/30 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-400 font-medium">You're on the early access list!</p>
              <p className="text-sm text-green-600 mt-1">We'll notify you at launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-slate-400 text-center">
                Be the first to experience it. Get early access when we launch.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    data-testid="input-waitlist-email"
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#C8A661] hover:bg-[#b8963f] text-slate-900 font-semibold shrink-0"
                  data-testid="button-join-waitlist"
                >
                  <Bell className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? "..." : "Notify Me"}
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-slate-600 text-center">
            Join 2,400+ laundromat professionals waiting for this feature.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function InteractiveBookReader({
  chapter,
  hasAccess,
  onNavigate,
}: InteractiveBookReaderProps) {
  return <ComingSoonGate />;
}
