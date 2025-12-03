/**
 * LAUNDROMAT JOURNEY - Progress Tracker
 * Gamified journey from curious to owner
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  milestones: { id: string; name: string; completed: boolean; action: string }[];
  progress: number;
  unlocked: boolean;
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "exploring",
    name: "Exploring",
    description: "Learning about the laundromat industry",
    progress: 75,
    unlocked: true,
    milestones: [
      { id: "first_visit", name: "First Visit", completed: true, action: "/" },
      { id: "read_blog", name: "Read an Article", completed: true, action: "/blog" },
      { id: "use_calculator", name: "Use a Calculator", completed: true, action: "/calculators" },
      { id: "cleanbi_score", name: "Run CLEANBI Analysis", completed: false, action: "/cleanbi-explorer" },
    ],
  },
  {
    id: "researching",
    name: "Researching",
    description: "Deep dive into opportunities",
    progress: 0,
    unlocked: false,
    milestones: [
      { id: "save_listing", name: "Save a Listing", completed: false, action: "/listings" },
      { id: "compare_3", name: "Compare 3+ Properties", completed: false, action: "/listings" },
      { id: "create_profile", name: "Complete Your Profile", completed: false, action: "/settings" },
      { id: "set_alerts", name: "Set Up Deal Alerts", completed: false, action: "/deal-scout" },
    ],
  },
  {
    id: "evaluating",
    name: "Evaluating",
    description: "Analyzing specific deals",
    progress: 0,
    unlocked: false,
    milestones: [
      { id: "detailed_report", name: "Generate Full Report", completed: false, action: "/cleanbi-explorer" },
      { id: "valuation", name: "Run Valuation", completed: false, action: "/valuation-calculator" },
      { id: "roi_analysis", name: "Complete ROI Analysis", completed: false, action: "/roi-calculator" },
      { id: "due_diligence", name: "Review Due Diligence", completed: false, action: "/resources" },
    ],
  },
  {
    id: "acquiring",
    name: "Acquiring",
    description: "Making your move",
    progress: 0,
    unlocked: false,
    milestones: [
      { id: "business_plan", name: "Create Business Plan", completed: false, action: "/business-plan-generator" },
      { id: "funding_check", name: "Check Funding Options", completed: false, action: "/funding-matcher" },
      { id: "sba_ready", name: "Pass SBA Readiness", completed: false, action: "/sba-readiness" },
      { id: "consultation", name: "Book Expert Call", completed: false, action: "/consultation" },
    ],
  },
  {
    id: "operating",
    name: "Operating",
    description: "Running your business",
    progress: 0,
    unlocked: false,
    milestones: [
      { id: "setup_pos", name: "Set Up POS System", completed: false, action: "/pos" },
      { id: "design_layout", name: "Design Your Layout", completed: false, action: "/design-studio-pro" },
      { id: "connect_iot", name: "Connect Machines", completed: false, action: "/pos" },
      { id: "first_month", name: "Complete First Month", completed: false, action: "/pos" },
    ],
  },
];

interface JourneyProgressProps {
  compact?: boolean;
}

export function JourneyProgress({ compact = false }: JourneyProgressProps) {
  const [stages] = useState<JourneyStage[]>(JOURNEY_STAGES);
  const [expandedStage, setExpandedStage] = useState<string | null>("exploring");

  const currentStage = stages.find(s => s.unlocked && s.progress < 100) || stages[0];
  const totalPoints = stages.reduce((sum, s) => sum + (s.progress / 100) * s.milestones.length * 25, 0);
  const completedMilestones = stages.reduce((sum, s) => sum + s.milestones.filter(m => m.completed).length, 0);
  const totalMilestones = stages.reduce((sum, s) => sum + s.milestones.length, 0);

  if (compact) {
    return (
      <Card className="p-4 border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">Your Journey</h4>
            <p className="text-xs text-muted-foreground">{currentStage.name}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {Math.round(totalPoints)} pts
          </Badge>
        </div>
        <Progress value={currentStage.progress} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedMilestones}/{totalMilestones} milestones</span>
          <Link href="/journey">
            <span className="text-primary hover:underline cursor-pointer">View all</span>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1" data-testid="text-journey-title">Your Laundromat Journey</h3>
            <p className="text-sm text-muted-foreground">
              Complete milestones to unlock your path to ownership
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" data-testid="text-total-points">{Math.round(totalPoints)}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex-1 flex items-center">
              <div 
                className={`w-full h-2 rounded-full ${
                  stage.unlocked 
                    ? stage.progress === 100 
                      ? 'bg-primary' 
                      : 'bg-primary/30' 
                    : 'bg-muted'
                }`}
              >
                {stage.unlocked && stage.progress > 0 && stage.progress < 100 && (
                  <div 
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${stage.progress}%` }}
                  />
                )}
              </div>
              {index < stages.length - 1 && (
                <div className={`w-3 h-3 mx-1 rounded-full shrink-0 ${
                  stages[index + 1].unlocked ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {stages.map((stage) => (
          <div key={stage.id}>
            <button
              onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                stage.unlocked 
                  ? 'hover:bg-muted cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              } ${expandedStage === stage.id ? 'bg-muted' : ''}`}
              disabled={!stage.unlocked}
              data-testid={`button-stage-${stage.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  stage.progress === 100 
                    ? 'bg-primary text-primary-foreground' 
                    : stage.unlocked 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {stage.progress === 100 ? '✓' : stages.indexOf(stage) + 1}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{stage.name}</div>
                  <div className="text-xs text-muted-foreground">{stage.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stage.progress}%</span>
                <span className="text-muted-foreground text-lg">
                  {expandedStage === stage.id ? '−' : '+'}
                </span>
              </div>
            </button>

            {expandedStage === stage.id && stage.unlocked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-14 pr-4 pb-2 space-y-1"
              >
                {stage.milestones.map((milestone) => (
                  <Link key={milestone.id} href={milestone.action}>
                    <div 
                      className={`flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-colors ${
                        milestone.completed 
                          ? 'text-muted-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                      data-testid={`milestone-${milestone.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          milestone.completed 
                            ? 'bg-primary text-primary-foreground' 
                            : 'border border-border'
                        }`}>
                          {milestone.completed && '✓'}
                        </div>
                        <span className={milestone.completed ? 'line-through' : ''}>
                          {milestone.name}
                        </span>
                      </div>
                      {!milestone.completed && (
                        <Badge variant="outline" className="text-xs">+25 pts</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{completedMilestones}</span> of {totalMilestones} milestones completed
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/journey">View Full Journey</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function JourneyBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
        75
      </div>
      <span className="text-xs font-medium">Exploring Stage</span>
    </div>
  );
}
