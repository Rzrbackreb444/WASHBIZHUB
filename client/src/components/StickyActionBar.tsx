import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Monitor, Users, X, ChevronDown, Sparkles,
  ArrowRight, Zap, ExternalLink, Store, TrendingUp
} from "lucide-react";
import { SiFacebook } from "react-icons/si";

const FB_GROUP_URL = "https://facebook.com/groups/thelaundromat";

export function StickyActionBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300 && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300"
      data-testid="sticky-action-bar"
    >
      <div className="bg-gradient-to-r from-[#001F3F] via-[#002B5C] to-[#001F3F] border-b border-[#39CCCC]/30 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-[#39CCCC]/20 text-[#39CCCC] border-[#39CCCC]/30 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                73K+ Professionals
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 sm:flex-none">
              <Link href="/cleanbi-explorer">
                <Button 
                  size="sm" 
                  className="bg-[#39CCCC] text-[#001F3F] hover:bg-[#2db8b8] font-semibold text-xs sm:text-sm"
                  data-testid="button-sticky-cleanbi"
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Free</span> CLEANBI
                </Button>
              </Link>
              
              <Link href="/listing-form">
                <Button 
                  size="sm" 
                  className="bg-green-500 text-white hover:bg-green-600 font-semibold text-xs sm:text-sm"
                  data-testid="button-sticky-list"
                >
                  <Store className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  List <span className="hidden sm:inline">FREE</span>
                </Button>
              </Link>
              
              <Link href="/advertise">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-orange-400/50 text-orange-400 hover:bg-orange-500/20 text-xs sm:text-sm"
                  data-testid="button-sticky-advertise"
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Advertise</span>
                </Button>
              </Link>
              
              <a href={FB_GROUP_URL} target="_blank" rel="noopener noreferrer" className="hidden md:block">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-400/50 text-blue-400 hover:bg-blue-500/20 text-xs sm:text-sm"
                  data-testid="button-sticky-facebook"
                >
                  <SiFacebook className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Group
                </Button>
              </a>
            </div>

            <button 
              onClick={() => setIsDismissed(true)}
              className="text-white/60 hover:text-white p-1"
              aria-label="Dismiss action bar"
              data-testid="button-dismiss-sticky"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloatingCTAButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      data-testid="floating-cta"
    >
      {isExpanded && (
        <div className="absolute bottom-16 right-0 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border p-3 space-y-2 min-w-[220px]">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </div>
            <Link href="/cleanbi-explorer">
              <Button 
                size="sm" 
                className="w-full justify-start bg-[#39CCCC] text-[#001F3F] hover:bg-[#2db8b8]"
                onClick={() => setIsExpanded(false)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Run CLEANBI Score
              </Button>
            </Link>
            <Link href="/ai-consultation">
              <Button 
                size="sm" 
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsExpanded(false)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Consultation
              </Button>
            </Link>
            
            <div className="border-t my-2" />
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Sell & Advertise
            </div>
            <Link href="/listing-form">
              <Button 
                size="sm" 
                className="w-full justify-start bg-green-500 text-white hover:bg-green-600"
                onClick={() => setIsExpanded(false)}
              >
                <Store className="w-4 h-4 mr-2" />
                List Laundromat FREE
              </Button>
            </Link>
            <Link href="/list-equipment">
              <Button 
                size="sm" 
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsExpanded(false)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Sell Equipment
              </Button>
            </Link>
            <Link href="/advertise">
              <Button 
                size="sm" 
                variant="outline"
                className="w-full justify-start text-orange-600"
                onClick={() => setIsExpanded(false)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Advertise With Us
              </Button>
            </Link>
            
            <div className="border-t my-2" />
            <a href={FB_GROUP_URL} target="_blank" rel="noopener noreferrer">
              <Button 
                size="sm" 
                variant="outline"
                className="w-full justify-start text-blue-600"
                onClick={() => setIsExpanded(false)}
              >
                <SiFacebook className="w-4 h-4 mr-2" />
                Join 73K+ Community
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </a>
          </div>
        </div>
      )}
      
      <Button
        size="lg"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          h-14 w-14 rounded-full shadow-xl transition-all duration-300
          ${isExpanded 
            ? 'bg-gray-600 hover:bg-gray-700 rotate-45' 
            : 'bg-gradient-to-r from-[#39CCCC] to-[#2db8b8] hover:from-[#2db8b8] hover:to-[#39CCCC] animate-pulse'
          }
        `}
        data-testid="button-floating-cta"
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Zap className="w-6 h-6 text-[#001F3F]" />
        )}
      </Button>
    </div>
  );
}
