import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  WIDGET_CATALOG,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  getWidgetsByCategory,
  getAllCategories,
  type WidgetCategory,
  type WidgetDefinition,
} from "@/lib/widget-catalog";
import { Search, Plus, Crown, Sparkles } from "lucide-react";

interface WidgetLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string) => void;
  usedWidgets?: string[];
}

export function WidgetLibraryPanel({
  isOpen,
  onClose,
  onAddWidget,
  usedWidgets = [],
}: WidgetLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<WidgetCategory | "all">("all");

  const categories = getAllCategories();

  const filteredWidgets = useMemo(() => {
    const allWidgets = Object.values(WIDGET_CATALOG);
    
    return allWidgets.filter((widget) => {
      const matchesSearch =
        searchQuery === "" ||
        widget.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "all" || widget.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const groupedWidgets = useMemo(() => {
    if (activeCategory !== "all") {
      return { [activeCategory]: filteredWidgets };
    }

    return filteredWidgets.reduce((acc, widget) => {
      if (!acc[widget.category]) {
        acc[widget.category] = [];
      }
      acc[widget.category].push(widget);
      return acc;
    }, {} as Record<WidgetCategory, WidgetDefinition[]>);
  }, [filteredWidgets, activeCategory]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C8A661]" />
            Widget Library
          </SheetTitle>
          <SheetDescription>
            Add widgets to customize your dashboard
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-widget-search"
            />
          </div>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as WidgetCategory | "all")}
          className="flex flex-col h-[calc(100vh-200px)]"
        >
          <TabsList className="mx-4 mt-2 flex flex-wrap h-auto gap-1 bg-transparent justify-start">
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-[#C8A661]/10 data-[state=active]:text-[#C8A661]"
            >
              All
            </TabsTrigger>
            {categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category];
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs gap-1 data-[state=active]:bg-[#C8A661]/10 data-[state=active]:text-[#C8A661]"
                >
                  <CategoryIcon className="h-3 w-3" />
                  {CATEGORY_LABELS[category].split(" ")[0]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <ScrollArea className="flex-1 px-4 py-4">
            <TabsContent value={activeCategory} className="m-0 space-y-6">
              {Object.entries(groupedWidgets).map(([category, widgets]) => (
                <div key={category}>
                  {activeCategory === "all" && (
                    <div className="flex items-center gap-2 mb-3">
                      {(() => {
                        const CategoryIcon = CATEGORY_ICONS[category as WidgetCategory];
                        return <CategoryIcon className="h-4 w-4 text-muted-foreground" />;
                      })()}
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {CATEGORY_LABELS[category as WidgetCategory]}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-2">
                    {widgets.map((widget) => (
                      <WidgetCard
                        key={widget.id}
                        widget={widget}
                        isUsed={usedWidgets.includes(widget.id)}
                        onAdd={() => onAddWidget(widget.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {filteredWidgets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No widgets found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

interface WidgetCardProps {
  widget: WidgetDefinition;
  isUsed: boolean;
  onAdd: () => void;
}

function WidgetCard({ widget, isUsed, onAdd }: WidgetCardProps) {
  const Icon = widget.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isUsed
          ? "bg-muted/50 border-muted opacity-60"
          : "bg-card hover:border-[#C8A661]/50 hover:shadow-sm cursor-pointer"
      )}
      onClick={isUsed ? undefined : onAdd}
      data-testid={`widget-card-${widget.id}`}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
          widget.isPremium ? "bg-[#C8A661]/10" : "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            widget.isPremium ? "text-[#C8A661]" : "text-primary"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{widget.label}</span>
          {widget.isPremium && (
            <Crown className="h-3 w-3 text-[#C8A661] flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {widget.description}
        </p>
      </div>

      <Button
        variant={isUsed ? "ghost" : "outline"}
        size="icon"
        className={cn(
          "h-8 w-8 flex-shrink-0",
          !isUsed && "hover:bg-[#C8A661]/10 hover:text-[#C8A661] hover:border-[#C8A661]/50"
        )}
        disabled={isUsed}
        onClick={(e) => {
          e.stopPropagation();
          if (!isUsed) onAdd();
        }}
        data-testid={`button-add-widget-${widget.id}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default WidgetLibraryPanel;
