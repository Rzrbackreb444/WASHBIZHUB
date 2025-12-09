import { useState } from "react";
import { format, subDays, startOfYear, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
  preset?: string;
}

type PresetKey = "today" | "7d" | "30d" | "90d" | "ytd" | "custom";

interface Preset {
  key: PresetKey;
  label: string;
  getRange: () => { from: Date; to: Date };
}

const presets: Preset[] = [
  {
    key: "today",
    label: "Today",
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: "7d",
    label: "Last 7 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: "30d",
    label: "Last 30 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: "90d",
    label: "Last 90 days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
    }),
  },
  {
    key: "ytd",
    label: "This Year",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfDay(new Date()),
    }),
  },
];

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({});
  const [activePreset, setActivePreset] = useState<PresetKey | null>(
    (value?.preset as PresetKey) || "30d"
  );

  const handlePresetClick = (preset: Preset) => {
    const range = preset.getRange();
    setActivePreset(preset.key);
    setTempRange({});
    onChange({ ...range, preset: preset.key });
    setOpen(false);
  };

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    setTempRange(range);
    setActivePreset("custom");

    if (range.from && range.to) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
        preset: "custom",
      });
    }
  };

  const displayValue = value
    ? value.preset && value.preset !== "custom"
      ? presets.find((p) => p.key === value.preset)?.label || "Select range"
      : `${format(value.from, "MMM d")} - ${format(value.to, "MMM d, yyyy")}`
    : "Select range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-9 px-3 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white",
            className
          )}
          data-testid="button-date-range-picker"
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          <span className="truncate text-sm">{displayValue}</span>
          <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-2 space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.key}
                variant={activePreset === preset.key ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handlePresetClick(preset)}
                data-testid={`button-preset-${preset.key}`}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant={activePreset === "custom" ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => setActivePreset("custom")}
              data-testid="button-preset-custom"
            >
              Custom
            </Button>
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={
                tempRange.from
                  ? { from: tempRange.from, to: tempRange.to }
                  : value
                  ? { from: value.from, to: value.to }
                  : undefined
              }
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              data-testid="calendar-date-range"
            />
            {activePreset === "custom" && tempRange.from && tempRange.to && (
              <div className="flex justify-end pt-2 border-t mt-2">
                <Button
                  size="sm"
                  onClick={() => setOpen(false)}
                  data-testid="button-apply-date-range"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface DateRangeDisplayProps {
  range: DateRange;
  className?: string;
}

export function DateRangeDisplay({ range, className }: DateRangeDisplayProps) {
  const presetLabel = range.preset
    ? presets.find((p) => p.key === range.preset)?.label
    : null;

  return (
    <div
      className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}
      data-testid="text-date-range-display"
    >
      <CalendarIcon className="h-3.5 w-3.5" />
      <span>
        {presetLabel || `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`}
      </span>
    </div>
  );
}
