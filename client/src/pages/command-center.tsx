import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal, useUpgradeModal } from "@/components/UpgradeModal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DashboardShell,
  WidgetCanvas,
  WidgetLibraryPanel,
  createWidget,
} from "@/components/dashboard";
import { DashboardSkeleton } from "@/components/premium";
import { WIDGET_TYPES } from "@shared/schema";
import {
  Plus,
  Settings,
  Save,
  RotateCcw,
  Pencil,
  Eye,
  LayoutGrid,
  Sparkles,
  Check,
  Crown,
  Lock,
  Zap,
  Globe,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutItem {
  id: string;
  widgetType: string;
  title?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  settings?: Record<string, any>;
  showHeader?: boolean;
  showBorder?: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  layout: LayoutItem[];
  isDefault: boolean;
}

const DEFAULT_WIDGETS: LayoutItem[] = [
  { id: "w1", widgetType: WIDGET_TYPES.QUICK_ACTIONS, x: 0, y: 0, w: 4, h: 2 },
  { id: "w2", widgetType: WIDGET_TYPES.POS_REVENUE_CARD, x: 4, y: 0, w: 4, h: 2 },
  { id: "w3", widgetType: WIDGET_TYPES.POS_ORDERS_TODAY, x: 8, y: 0, w: 4, h: 2 },
  { id: "w4", widgetType: WIDGET_TYPES.CLEANBI_RECENT_SCORES, x: 0, y: 2, w: 6, h: 3 },
  { id: "w5", widgetType: WIDGET_TYPES.ACTIVITY_FEED, x: 6, y: 2, w: 6, h: 3 },
  { id: "w6", widgetType: WIDGET_TYPES.POS_MACHINE_STATUS, x: 0, y: 5, w: 4, h: 3 },
  { id: "w7", widgetType: WIDGET_TYPES.NOTIFICATIONS, x: 4, y: 5, w: 4, h: 3 },
  { id: "w8", widgetType: WIDGET_TYPES.CLEANBI_QUOTA_STATUS, x: 8, y: 5, w: 4, h: 2 },
];

export default function CommandCenter() {
  const { user, isLoading: authLoading } = useAuth();
  const { isPro, isBusiness, tier } = useSubscription();
  const { toast } = useToast();
  const { isOpen: isUpgradeOpen, openUpgradeModal, closeUpgradeModal, UpgradeModalComponent } = useUpgradeModal();
  
  const [widgets, setWidgets] = useState<LayoutItem[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isDemo = !isBusiness;
  const canSaveLayouts = isBusiness;

  const { data: savedLayout, isLoading: layoutLoading } = useQuery<DashboardLayout>({
    queryKey: ["/api/dashboard/layouts/default"],
    enabled: !!user && canSaveLayouts,
  });

  useEffect(() => {
    if (savedLayout?.layout && savedLayout.layout.length > 0) {
      setWidgets(savedLayout.layout);
    }
  }, [savedLayout]);

  const saveLayoutMutation = useMutation({
    mutationFn: async (layout: LayoutItem[]) => {
      await apiRequest("POST", "/api/dashboard/layouts", {
        name: "My Dashboard",
        layout,
        isDefault: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/layouts"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Dashboard saved",
        description: "Your layout has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Could not save your dashboard layout.",
        variant: "destructive",
      });
    },
  });

  const handleLayoutChange = useCallback((newWidgets: LayoutItem[]) => {
    setWidgets(newWidgets);
    setHasUnsavedChanges(true);
  }, []);

  const handleAddWidget = useCallback((widgetType: string) => {
    const newWidget = createWidget(widgetType);
    setWidgets((prev) => [...prev, newWidget]);
    setHasUnsavedChanges(true);
    setIsLibraryOpen(false);
    toast({
      title: "Widget added",
      description: "Drag to reposition or resize.",
    });
  }, [toast]);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  const handleResetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    setHasUnsavedChanges(true);
    toast({
      title: "Layout reset",
      description: "Your dashboard has been reset to defaults.",
    });
  }, [toast]);

  const handleSave = useCallback(() => {
    if (!canSaveLayouts) {
      openUpgradeModal({
        feature: "command-center",
        title: "Save Your Dashboard Layout",
        description: "Upgrade to Pro to save your custom dashboard layouts and access your personalized command center from any device.",
      });
      return;
    }
    saveLayoutMutation.mutate(widgets);
  }, [widgets, saveLayoutMutation, canSaveLayouts, openUpgradeModal]);

  const toggleEditMode = useCallback(() => {
    if (isEditing && hasUnsavedChanges && canSaveLayouts) {
      handleSave();
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, hasUnsavedChanges, handleSave, canSaveLayouts]);

  const usedWidgetTypes = widgets.map((w) => w.widgetType);

  if (authLoading || layoutLoading) {
    return (
      <DashboardShell
        title="Command Center"
        showDatePicker={false}
        showExportButtons={false}
      >
        <DashboardSkeleton
          kpiCount={4}
          showChart={true}
          showActivityList={true}
          showCardGrid={true}
          cardCount={6}
          testId="command-center-loading"
        />
      </DashboardShell>
    );
  }

  return (
    <AuthGuard
      title="Sign In to Access Command Center"
      description="Sign in to access your customizable dashboard."
    >
      <SEO
        title="Command Center | WashBizHub"
        description="Your customizable command center dashboard. Drag and drop widgets to create your perfect laundromat management experience."
      />

      <DashboardShell
        title="Command Center"
        subtitle={isDemo ? "Demo Mode - Try it out!" : "Your customizable dashboard"}
        showDatePicker={false}
        showExportButtons={false}
        headerActions={
          <div className="flex items-center gap-2">
            {isDemo && (
              <Badge 
                className="gap-1.5 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30"
                data-testid="badge-demo-mode"
              >
                <Eye className="h-3 w-3" />
                Demo
              </Badge>
            )}
            
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsLibraryOpen(true)}
              data-testid="button-add-widget"
            >
              <Plus className="h-4 w-4" />
              Add Widget
            </Button>

            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-1.5",
                isEditing && "bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]"
              )}
              onClick={toggleEditMode}
              data-testid="button-toggle-edit"
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4" />
                  Done
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>

            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleResetLayout}
                  data-testid="button-reset-layout"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleSave}
                  disabled={saveLayoutMutation.isPending}
                  data-testid="button-save-layout"
                >
                  {isDemo ? <Lock className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {isDemo ? "Save (Pro)" : "Save"}
                </Button>
              </>
            )}

            {isDemo && (
              <Button
                size="sm"
                className="gap-1.5 bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]"
                onClick={() => openUpgradeModal({
                  feature: "command-center",
                  title: "Unlock Command Center",
                  description: "Save your layouts, access real-time data, and build your perfect dashboard.",
                })}
                data-testid="button-upgrade-cta"
              >
                <Crown className="h-4 w-4" />
                Upgrade
              </Button>
            )}
          </div>
        }
      >
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border border-[#C8A661]/30 bg-[#C8A661]/5"
            data-testid="demo-banner"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#C8A661]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Try the Command Center</h3>
                  <p className="text-sm text-muted-foreground">
                    Add widgets, rearrange them, and explore. Upgrade to save your layout.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link href="/website-builder">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-[#C8A661]/30 text-muted-foreground hover:text-foreground"
                    data-testid="link-website-builder"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website Builder
                  </Button>
                </Link>
                <Link href="/cleanbi-explorer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-[#C8A661]/30 text-muted-foreground hover:text-foreground"
                    data-testid="link-cleanbi-explorer"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    CLEANBI
                  </Button>
                </Link>
                <Button
                  className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628] gap-2"
                  onClick={() => openUpgradeModal({
                    feature: "command-center",
                    title: "Unlock Command Center",
                    description: "Save your layouts, access real-time data, and build your perfect dashboard.",
                  })}
                  data-testid="button-demo-upgrade"
                >
                  <Crown className="h-4 w-4" />
                  Unlock Full Access
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="command-center-page"
        >
          {widgets.length === 0 ? (
            <EmptyDashboard onAddWidget={() => setIsLibraryOpen(true)} />
          ) : (
            <WidgetCanvas
              widgets={widgets}
              isEditing={isEditing}
              columns={12}
              rowHeight={80}
              gap={16}
              onLayoutChange={handleLayoutChange}
              onWidgetRemove={handleRemoveWidget}
              onWidgetSettings={(id) => {
                toast({
                  title: "Widget settings",
                  description: "Widget configuration coming soon.",
                });
              }}
            />
          )}
        </motion.div>

        <WidgetLibraryPanel
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onAddWidget={handleAddWidget}
          usedWidgets={usedWidgetTypes}
        />
      </DashboardShell>

      <UpgradeModalComponent />
    </AuthGuard>
  );
}

function EmptyDashboard({ onAddWidget }: { onAddWidget: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="h-20 w-20 rounded-2xl bg-[#C8A661]/10 flex items-center justify-center mb-6">
        <LayoutGrid className="h-10 w-10 text-[#C8A661]" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Welcome to Your Command Center
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Create your perfect dashboard by adding widgets. Drag and drop to arrange them exactly how you want.
      </p>
      <Button
        size="lg"
        className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628] gap-2"
        onClick={onAddWidget}
        data-testid="button-empty-add-widget"
      >
        <Sparkles className="h-5 w-5" />
        Add Your First Widget
      </Button>
    </div>
  );
}
