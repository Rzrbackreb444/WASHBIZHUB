import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { GamifiedLearningDashboard } from "@/components/GamifiedLearningDashboard";
import { InteractiveGuides } from "@/components/InteractiveGuides";
import { SEO } from "@/components/SEO";

const learningFaqs = [
  {
    question: "What courses are available for laundromat owners?",
    answer: "WashBizHub offers comprehensive courses covering laundromat operations, equipment maintenance, business management, marketing strategies, financial planning, and customer service. Courses range from beginner guides for new owners to advanced strategies for multi-location operators."
  },
  {
    question: "How do I track my learning progress?",
    answer: "The Learning Hub dashboard tracks your course completions, quiz scores, and skill development over time. You earn achievements and badges as you complete modules, and can see your overall progress toward mastering laundromat business fundamentals."
  },
  {
    question: "Are the laundromat courses free or paid?",
    answer: "WashBizHub offers both free foundational content and premium courses. Free members can access introductory guides and basic training. Premium subscribers unlock advanced courses, interactive simulations, and expert-led workshops."
  },
  {
    question: "Can I get certified through WashBizHub courses?",
    answer: "Yes! Completing certain course tracks earns you WashBizHub certifications that demonstrate your expertise. These certificates can be displayed on your business profiles and shared with lenders, partners, or customers."
  },
  {
    question: "What makes WashBizHub's training different from other resources?",
    answer: "Our courses are created by experienced laundromat owners and industry professionals with real-world operational experience. Content is regularly updated to reflect current industry trends, equipment innovations, and proven business strategies."
  }
];

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      <SEO
        title="Laundromat Training & Courses - Learning Hub"
        description="Master laundromat operations with expert courses, guides, and certifications. Track progress, earn achievements, and grow your laundry business."
        canonicalUrl="/learning"
        ogType="course"
        keywords={[
          "laundromat training courses",
          "laundry business education",
          "coin laundry courses",
          "laundromat owner training",
          "laundry management courses",
          "laundromat operations guide",
          "laundry business certification",
          "laundromat learning hub",
          "coin laundry education",
          "laundromat business skills",
          "laundry industry training",
          "laundromat beginner course",
          "laundry business mastery"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Education", url: "/courses" },
          { name: "Learning Hub", url: "/learning" }
        ]}
        faqs={learningFaqs}
      />
    <div className="min-h-screen bg-background py-8" data-testid="page-learning">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-learning-title">
            Your Learning Journey
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-learning-subtitle">
            Track progress, unlock achievements, and master the laundromat business
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-learning-nav">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="guides" data-testid="tab-guides">
              Guides
            </TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6" data-testid="tabcontent-dashboard">
            <GamifiedLearningDashboard />
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6 mt-6" data-testid="tabcontent-guides">
            <InteractiveGuides />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6 mt-6" data-testid="tabcontent-progress">
            <Card className="p-6">
              <div className="text-center py-8" data-testid="text-progress-placeholder">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Progress Analytics</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Track your learning milestones, course completions, and skill development over time.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
