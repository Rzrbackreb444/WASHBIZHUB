import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { GamifiedLearningDashboard } from "@/components/GamifiedLearningDashboard";
import { InteractiveGuides } from "@/components/InteractiveGuides";
import { BarChart3, BookOpen, Trophy } from "lucide-react";

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold">Your Learning Journey</h1>
          <p className="text-muted-foreground text-lg">
            Track progress, unlock achievements, and master the laundromat business
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="gap-2">
              <Trophy className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="guides" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <GamifiedLearningDashboard />
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <InteractiveGuides />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <p className="text-muted-foreground text-center py-12">
                Detailed progress analytics coming soon
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
