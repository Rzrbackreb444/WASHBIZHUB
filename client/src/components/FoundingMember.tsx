/**
 * FOUNDING MEMBER - Exclusive Status Badge & Perks
 * Creates FOMO and rewards early adopters
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface FoundingMemberPerks {
  lifetimeDiscount: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
  exclusiveBadge: boolean;
  specialTitle: string;
}

const FOUNDING_PERKS: FoundingMemberPerks = {
  lifetimeDiscount: 0.20,
  prioritySupport: true,
  earlyAccess: true,
  exclusiveBadge: true,
  specialTitle: "Founding Pioneer",
};

export function FoundingMemberBadge({ memberNumber }: { memberNumber?: number }) {
  if (!memberNumber) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/30"
    >
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">F</span>
      </div>
      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
        Founding Member #{memberNumber}
      </span>
    </motion.div>
  );
}

export function FoundingMemberCard({ memberNumber = 47 }: { memberNumber?: number }) {
  const [showPerks, setShowPerks] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-yellow-500/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent" />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 mb-2">
                Founding Member
              </Badge>
              <h3 className="text-lg font-semibold" data-testid="text-member-number">Member #{memberNumber}</h3>
              <p className="text-sm text-muted-foreground">Joined in the first 100</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-amber-600">20%</div>
              <div className="text-xs text-muted-foreground">Lifetime Discount</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-lg font-bold text-amber-600">VIP</div>
              <div className="text-xs text-muted-foreground">Priority Support</div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-amber-500/30 hover:bg-amber-500/10"
            onClick={() => setShowPerks(true)}
            data-testid="button-view-perks"
          >
            View All Perks
          </Button>
        </div>
      </Card>

      <FoundingMemberPerksModal open={showPerks} onClose={() => setShowPerks(false)} />
    </>
  );
}

function FoundingMemberPerksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">F</span>
            Founding Member Perks
          </DialogTitle>
          <DialogDescription>
            Exclusive benefits for our earliest supporters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {[
            { icon: "💰", title: "20% Lifetime Discount", description: "On all subscriptions, forever. Never expires." },
            { icon: "⚡", title: "Priority Support", description: "Jump to the front of the support queue." },
            { icon: "🚀", title: "Early Access", description: "Be first to try new features before anyone else." },
            { icon: "🏆", title: "Exclusive Badge", description: "Display your founding member status proudly." },
            { icon: "📞", title: "Direct Line", description: "Access to founder's calendar for 1-on-1 calls." },
            { icon: "🎁", title: "Bonus Credits", description: "500 free CLEANBI analyses per month." },
          ].map((perk, index) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <span className="text-xl">{perk.icon}</span>
              <div>
                <h4 className="font-medium text-sm">{perk.title}</h4>
                <p className="text-xs text-muted-foreground">{perk.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-center text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Only 53 spots remaining</span> for founding member status
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FoundingMemberBanner() {
  const [spotsLeft, setSpotsLeft] = useState(53);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSpotsLeft(prev => Math.max(47, prev - Math.floor(Math.random() * 2)));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-4 text-sm">
        <span className="font-medium">
          Become a Founding Member - <span className="font-bold">Only {spotsLeft} spots left!</span>
        </span>
        <Button 
          size="sm" 
          variant="secondary"
          className="h-7 bg-white text-amber-700 hover:bg-white/90"
          data-testid="button-claim-founding"
        >
          Claim Your Spot
        </Button>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
