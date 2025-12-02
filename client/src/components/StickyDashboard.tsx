/**
 * STICKY DASHBOARD - Combined engagement widgets
 * Sidebar dashboard with all sticky features
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { IndustryPulseMini } from "./IndustryPulse";

interface UserStats {
  journeyStage: string;
  journeyProgress: number;
  totalPoints: number;
  streak: number;
  savedListings: number;
  recentAchievement?: string;
  dealAlerts: number;
  isFoundingMember: boolean;
  memberNumber?: number;
}

const DEFAULT_STATS: UserStats = {
  journeyStage: "Exploring",
  journeyProgress: 75,
  totalPoints: 150,
  streak: 3,
  savedListings: 2,
  recentAchievement: "Calculator Pro",
  dealAlerts: 3,
  isFoundingMember: false,
};

export function StickyDashboard({ stats = DEFAULT_STATS }: { stats?: UserStats }) {
  return (
    <div className="space-y-4">
      {/* Journey Progress Mini */}
      <Card className="p-4 border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">Your Journey</h4>
            <p className="text-xs text-muted-foreground">{stats.journeyStage}</p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {stats.totalPoints} pts
          </Badge>
        </div>
        <Progress value={stats.journeyProgress} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {stats.streak > 0 && (
              <span className="text-orange-500 font-medium">{stats.streak} day streak 🔥</span>
            )}
          </span>
          <Link href="/journey">
            <span className="text-primary hover:underline cursor-pointer">View Journey</span>
          </Link>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4 border-border/50">
        <h4 className="font-semibold text-sm mb-3">Your Activity</h4>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/saved">
            <div className="p-3 rounded-lg bg-muted/50 text-center hover:bg-muted/70 transition-colors cursor-pointer">
              <div className="text-xl font-bold">{stats.savedListings}</div>
              <div className="text-xs text-muted-foreground">Saved</div>
            </div>
          </Link>
          <Link href="/deal-scout">
            <div className="p-3 rounded-lg bg-muted/50 text-center hover:bg-muted/70 transition-colors cursor-pointer relative">
              <div className="text-xl font-bold">{stats.dealAlerts}</div>
              <div className="text-xs text-muted-foreground">Alerts</div>
              {stats.dealAlerts > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {stats.dealAlerts}
                </div>
              )}
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Achievement */}
      {stats.recentAchievement && (
        <Card className="p-4 border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Latest Achievement</p>
              <p className="font-semibold text-sm">{stats.recentAchievement}</p>
            </div>
            <Badge variant="secondary" className="text-xs">+25</Badge>
          </div>
        </Card>
      )}

      {/* Deal Alerts Preview */}
      <Card className="p-4 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">Deal Scout</h4>
          <Badge className="bg-amber-500/20 text-amber-600 border-0 text-xs">AI</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {stats.dealAlerts} opportunities match your criteria
        </p>
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
          <Link href="/deal-scout">View Opportunities</Link>
        </Button>
      </Card>

      {/* Founding Member CTA */}
      {!stats.isFoundingMember && (
        <Card className="p-4 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-yellow-500/10">
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 mb-2">
              Limited Offer
            </Badge>
            <h4 className="font-semibold text-sm mb-1">Become a Founding Member</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Only <span className="font-bold text-amber-600">53 spots</span> remaining
            </p>
            <Button size="sm" className="w-full h-8 text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
              Claim 20% Lifetime Discount
            </Button>
          </div>
        </Card>
      )}

      {/* Industry Pulse Mini */}
      <div className="text-center">
        <IndustryPulseMini />
      </div>
    </div>
  );
}

export function EngagementFloater() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <Card className="p-3 shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold">
            75
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Journey Progress</p>
            <p className="text-sm font-semibold">Exploring Stage</p>
          </div>
          <Button size="sm" variant="ghost" className="h-8" asChild>
            <Link href="/journey">Continue</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
