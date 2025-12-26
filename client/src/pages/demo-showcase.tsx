import { useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Sparkles, Cpu, Activity, Database, Video, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const LazyParticleField = lazy(() => 
  import("@/components/experience").then(mod => ({ default: mod.ParticleField }))
);

const LazyScene3D = lazy(() => 
  import("@/components/experience").then(mod => ({ default: mod.Scene3D }))
);

const LazyAIOrchestrationPanel = lazy(() => 
  import("@/components/experience").then(mod => ({ default: mod.AIOrchestrationPanel }))
);

const LazyDataStream = lazy(() => 
  import("@/components/experience").then(mod => ({ default: mod.DataStream }))
);

const LazyVideoBackdrop = lazy(() => 
  import("@/components/experience").then(mod => ({ default: mod.VideoBackdrop }))
);

function EffectSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`${height} w-full rounded-lg overflow-hidden`}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

function EffectCard({
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
  testId,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Sparkles;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-card border shadow-sm overflow-hidden">
      <div className="h-1 bg-[#C8A661]" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Icon className="h-5 w-5 text-[#C8A661]" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={testId} className="text-sm text-muted-foreground">
              {enabled ? "On" : "Off"}
            </Label>
            <Switch
              id={testId}
              checked={enabled}
              onCheckedChange={onToggle}
              data-testid={testId}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative bg-[#0A1628] rounded-lg overflow-hidden min-h-[200px]">
          {enabled ? children : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <span>Effect disabled</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DemoShowcase() {
  const [effects, setEffects] = useState({
    particleField: true,
    scene3D: false,
    aiOrchestration: true,
    dataStream: true,
    videoBackdrop: false,
  });

  const toggleEffect = (key: keyof typeof effects) => (value: boolean) => {
    setEffects(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Platform Technology Demo | WashBizHub</title>
        <meta name="description" content="Explore the advanced visual effects and technology powering WashBizHub's platform." />
      </Helmet>

      <div className="min-h-screen bg-background" data-testid="page-demo-showcase">
        <section className="py-16 bg-[#0A1628]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
              <Layers className="w-3 h-3 mr-1.5" />
              Technology Preview
            </Badge>
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
              data-testid="text-page-title"
            >
              Platform Technology Demo
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Experience the advanced visual effects and interactive components that power WashBizHub. 
              Toggle each effect to see it in action.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid gap-8">
              <EffectCard
                title="Particle Field"
                description="Animated floating particles with customizable colors and density"
                icon={Sparkles}
                enabled={effects.particleField}
                onToggle={toggleEffect("particleField")}
                testId="switch-particle-field"
              >
                <Suspense fallback={<EffectSkeleton />}>
                  <div className="h-[200px] relative">
                    <LazyParticleField 
                      count={60} 
                      color="#C8A661" 
                      speed={1.2}
                      size={3}
                    />
                  </div>
                </Suspense>
              </EffectCard>

              <EffectCard
                title="3D Scene"
                description="Interactive Three.js 3D environment with floating orbs and data cubes"
                icon={Cpu}
                enabled={effects.scene3D}
                onToggle={toggleEffect("scene3D")}
                testId="switch-scene-3d"
              >
                <Suspense fallback={<EffectSkeleton />}>
                  <div className="h-[200px] relative">
                    <LazyScene3D 
                      variant="orbs"
                      primaryColor="#C8A661"
                      secondaryColor="#0A1628"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                      3D Scene (disabled by default for performance)
                    </div>
                  </div>
                </Suspense>
              </EffectCard>

              <EffectCard
                title="AI Orchestration Panel"
                description="Real-time AI model status and orchestration visualization"
                icon={Activity}
                enabled={effects.aiOrchestration}
                onToggle={toggleEffect("aiOrchestration")}
                testId="switch-ai-orchestration"
              >
                <Suspense fallback={<EffectSkeleton />}>
                  <div className="h-[200px] p-4 flex items-center justify-center">
                    <LazyAIOrchestrationPanel 
                      activeModels={["openai", "anthropic"]}
                      currentModel="openai"
                      className="w-full max-w-md"
                    />
                  </div>
                </Suspense>
              </EffectCard>

              <EffectCard
                title="Data Stream"
                description="Animated data flow visualization with directional movement"
                icon={Database}
                enabled={effects.dataStream}
                onToggle={toggleEffect("dataStream")}
                testId="switch-data-stream"
              >
                <Suspense fallback={<EffectSkeleton />}>
                  <div className="h-[200px] relative">
                    <LazyDataStream 
                      direction="up"
                      color="#C8A661"
                      className="inset-0 w-full h-full"
                    />
                    <LazyDataStream 
                      direction="right"
                      color="#C8A661"
                      className="inset-0 w-full h-full"
                    />
                  </div>
                </Suspense>
              </EffectCard>

              <EffectCard
                title="Video Backdrop"
                description="Full-screen video background with overlay effects"
                icon={Video}
                enabled={effects.videoBackdrop}
                onToggle={toggleEffect("videoBackdrop")}
                testId="switch-video-backdrop"
              >
                <Suspense fallback={<EffectSkeleton />}>
                  <div className="h-[200px] relative">
                    {effects.videoBackdrop ? (
                      <>
                        <LazyVideoBackdrop
                          src=""
                          overlay={true}
                          overlayOpacity={0.6}
                          overlayColor="#0A1628"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                          Video backdrop active (no video source configured)
                        </div>
                      </>
                    ) : null}
                  </div>
                </Suspense>
              </EffectCard>
            </div>

            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-card border shadow-sm inline-block">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span data-testid="text-active-count">
                        {Object.values(effects).filter(Boolean).length} Active
                      </span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-muted" />
                      <span data-testid="text-inactive-count">
                        {Object.values(effects).filter(v => !v).length} Inactive
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
