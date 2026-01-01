import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StickyConsultationBarProps {
  context?: "cleanbi" | "wdf" | "calculator" | "general";
}

export function StickyConsultationBar({ context = "general" }: StickyConsultationBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 400 && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const getMessage = () => {
    switch (context) {
      case "cleanbi":
        return "Need an expert to review your CLEANBI analysis?";
      case "wdf":
        return "Need an expert to review these margins?";
      case "calculator":
        return "Want a professional to validate these numbers?";
      default:
        return "Need expert guidance on this opportunity?";
    }
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f] border-t border-[#C8A661]/30 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#C8A661]/20 items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[#C8A661]" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base truncate">
                  {getMessage()}
                </p>
                <p className="text-white/60 text-xs sm:text-sm hidden sm:block">
                  Talk to Larry Larsen - 50+ years of laundromat expertise
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/larry-larsen">
                <Button 
                  size="sm"
                  className="bg-[#C8A661] hover:bg-[#9a7209] text-white font-semibold shadow-lg whitespace-nowrap"
                  data-testid="button-sticky-talk-larry"
                >
                  <span className="hidden sm:inline">Talk to Larry</span>
                  <span className="sm:hidden">Consult</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
                data-testid="button-dismiss-consultation-bar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
