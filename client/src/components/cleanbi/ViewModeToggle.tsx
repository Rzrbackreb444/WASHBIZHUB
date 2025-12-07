import { Map, BarChart3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
  mode: 'map' | 'charts';
  onModeChange: (mode: 'map' | 'charts') => void;
  className?: string;
}

export function ViewModeToggle({ mode, onModeChange, className }: ViewModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => {
        if (value) onModeChange(value as 'map' | 'charts');
      }}
      className={cn(
        "bg-muted/50 p-1 rounded-lg border border-border",
        className
      )}
      data-testid="view-mode-toggle"
    >
      <ToggleGroupItem
        value="map"
        aria-label="Map View"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          "data-[state=on]:bg-[#0A1628] data-[state=on]:text-white",
          "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
        )}
        data-testid="toggle-map-view"
      >
        <Map className="h-4 w-4" />
        <span className="hidden sm:inline">Map</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="charts"
        aria-label="Charts View"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          "data-[state=on]:bg-[#0A1628] data-[state=on]:text-white",
          "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
        )}
        data-testid="toggle-charts-view"
      >
        <BarChart3 className="h-4 w-4" />
        <span className="hidden sm:inline">Charts</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
