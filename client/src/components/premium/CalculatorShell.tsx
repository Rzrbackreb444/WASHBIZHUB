import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LucideIcon,
  Calculator,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Share2,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export interface CalculatorMetric {
  id: string;
  label: string;
  value: string | number;
  format?: "currency" | "percentage" | "number" | "text";
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  highlight?: boolean;
  icon?: LucideIcon;
}

export interface CalculatorInputField {
  id: string;
  label: string;
  type: "number" | "currency" | "percentage" | "slider" | "toggle" | "text";
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helpText?: string;
  disabled?: boolean;
}

export interface CalculatorInputGroup {
  id: string;
  title?: string;
  description?: string;
  fields: CalculatorInputField[];
}

export interface InsightItem {
  id: string;
  type: "positive" | "negative" | "neutral" | "info";
  title: string;
  description: string;
}

export interface BenchmarkItem {
  id: string;
  label: string;
  yourValue: number;
  industryAvg: number;
  format?: "currency" | "percentage" | "number";
}

export interface RelatedCalculator {
  id: string;
  name: string;
  description: string;
  href: string;
  icon?: LucideIcon;
}

export interface CalculatorShellProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  category?: string;
  showMeshGradient?: boolean;
  primaryResult?: CalculatorMetric;
  secondaryMetrics?: CalculatorMetric[];
  inputGroups?: CalculatorInputGroup[];
  methodology?: string;
  insights?: InsightItem[];
  benchmarks?: BenchmarkItem[];
  relatedCalculators?: RelatedCalculator[];
  loading?: boolean;
  calculated?: boolean;
  onCalculate?: () => void;
  onReset?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onExportToSheets?: () => void;
  calculateButtonText?: string;
  children?: ReactNode;
  className?: string;
  testId?: string;
}

function CalculatorShellSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-8", className)}
      data-testid="calculator-shell-skeleton"
    >
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-96 animate-pulse rounded bg-muted" />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 space-y-4">
        <div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-card-border bg-card p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-card-border bg-card p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({
  value,
  format = "number",
  className,
  testId,
}: {
  value: number | string;
  format?: "currency" | "percentage" | "number" | "text";
  className?: string;
  testId?: string;
}) {
  const formatValue = (val: number | string): string => {
    if (typeof val === "string") return val;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
        return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
      default:
        return String(val);
    }
  };

  return (
    <motion.span
      key={String(value)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
      data-testid={testId}
    >
      {formatValue(value)}
    </motion.span>
  );
}

function ResultSummaryPanel({
  primaryResult,
  secondaryMetrics,
  onExportToSheets,
  loading,
  testId,
}: {
  primaryResult?: CalculatorMetric;
  secondaryMetrics?: CalculatorMetric[];
  onExportToSheets?: () => void;
  loading?: boolean;
  testId?: string;
}) {
  if (loading) {
    return (
      <div
        className="rounded-xl border border-card-border bg-card p-6 space-y-4"
        data-testid={`${testId}-skeleton`}
      >
        <div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!primaryResult) return null;

  const TrendIcon =
    primaryResult.trend?.direction === "up"
      ? TrendingUp
      : primaryResult.trend?.direction === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    primaryResult.trend?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : primaryResult.trend?.direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-card-border bg-card overflow-hidden"
      data-testid={testId || "result-summary-panel"}
    >
      <div className="relative bg-gradient-to-br from-accent/5 via-card to-accent/10 p-6 md:p-8">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {primaryResult.icon && (
                <primaryResult.icon className="h-5 w-5 text-accent" />
              )}
              <span
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                data-testid={`${testId}-primary-label`}
              >
                {primaryResult.label}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <AnimatedNumber
                value={primaryResult.value}
                format={primaryResult.format}
                className="text-4xl md:text-5xl font-bold tracking-tight text-accent"
                testId={`${testId}-primary-value`}
              />
              {primaryResult.trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-semibold",
                    trendColor
                  )}
                  data-testid={`${testId}-primary-trend`}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span>
                    {primaryResult.trend.value > 0 ? "+" : ""}
                    {primaryResult.trend.value}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {onExportToSheets && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportToSheets}
              className="self-start md:self-center gap-2"
              data-testid="button-export-sheets"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export to Sheets
            </Button>
          )}
        </div>
      </div>

      {secondaryMetrics && secondaryMetrics.length > 0 && (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border"
          data-testid={`${testId}-secondary-metrics`}
        >
          {secondaryMetrics.map((metric, index) => {
            const MetricTrendIcon =
              metric.trend?.direction === "up"
                ? TrendingUp
                : metric.trend?.direction === "down"
                  ? TrendingDown
                  : Minus;

            const metricTrendColor =
              metric.trend?.direction === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : metric.trend?.direction === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground";

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.1 + index * 0.05,
                  ease: "easeOut",
                }}
                className={cn(
                  "bg-card p-4 md:p-5",
                  metric.highlight && "bg-accent/5"
                )}
                data-testid={`${testId}-metric-${metric.id}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {metric.icon && (
                      <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
                      {metric.label}
                    </span>
                  </div>
                  <AnimatedNumber
                    value={metric.value}
                    format={metric.format}
                    className={cn(
                      "text-xl md:text-2xl font-bold tracking-tight",
                      metric.highlight ? "text-accent" : "text-foreground"
                    )}
                    testId={`${testId}-metric-value-${metric.id}`}
                  />
                  {metric.trend && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs font-semibold",
                        metricTrendColor
                      )}
                    >
                      <MetricTrendIcon className="h-3 w-3" />
                      <span>
                        {metric.trend.value > 0 ? "+" : ""}
                        {metric.trend.value}%
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function InputField({ field, testId }: { field: CalculatorInputField; testId?: string }) {
  const baseTestId = testId || `input-${field.id}`;

  switch (field.type) {
    case "slider":
      return (
        <div className="space-y-3" data-testid={baseTestId}>
          <div className="flex items-center justify-between">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
            </Label>
            <span className="text-sm font-semibold text-accent">
              {field.prefix}
              {typeof field.value === "number" ? field.value.toLocaleString() : field.value}
              {field.suffix}
            </span>
          </div>
          <Slider
            id={field.id}
            value={[typeof field.value === "number" ? field.value : 0]}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            onValueChange={([val]) => field.onChange(val)}
            disabled={field.disabled}
            className="w-full"
            data-testid={`${baseTestId}-slider`}
          />
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
        </div>
      );

    case "toggle":
      return (
        <div
          className="flex items-center justify-between gap-4 py-2"
          data-testid={baseTestId}
        >
          <div className="space-y-0.5">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              {field.label}
            </Label>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
          <Switch
            id={field.id}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            disabled={field.disabled}
            data-testid={`${baseTestId}-switch`}
          />
        </div>
      );

    case "currency":
    case "percentage":
    case "number":
      return (
        <div className="space-y-2" data-testid={baseTestId}>
          <Label
            htmlFor={field.id}
            className="text-sm font-medium text-foreground"
          >
            {field.label}
          </Label>
          <div className="relative">
            {field.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {field.prefix}
              </span>
            )}
            <Input
              id={field.id}
              type="number"
              value={String(field.value)}
              onChange={(e) => field.onChange(e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step ?? 0.01}
              disabled={field.disabled}
              className={cn(
                "w-full",
                field.prefix && "pl-8",
                field.suffix && "pr-10"
              )}
              data-testid={`${baseTestId}-input`}
            />
            {field.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {field.suffix}
              </span>
            )}
          </div>
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2" data-testid={baseTestId}>
          <Label
            htmlFor={field.id}
            className="text-sm font-medium text-foreground"
          >
            {field.label}
          </Label>
          <Input
            id={field.id}
            type="text"
            value={String(field.value)}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={field.disabled}
            className="w-full"
            data-testid={`${baseTestId}-input`}
          />
          {field.helpText && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}
        </div>
      );
  }
}

function InputSection({
  inputGroups,
  testId,
}: {
  inputGroups?: CalculatorInputGroup[];
  testId?: string;
}) {
  if (!inputGroups || inputGroups.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
      className="rounded-xl border border-card-border bg-card p-6"
      data-testid={testId || "calculator-input-section"}
    >
      <div className="space-y-6">
        {inputGroups.map((group, groupIndex) => (
          <div key={group.id} className="space-y-4">
            {group.title && (
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {group.title}
                </h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-4">
              {group.fields.map((field) => (
                <InputField
                  key={field.id}
                  field={field}
                  testId={`${testId}-field-${field.id}`}
                />
              ))}
            </div>
            {groupIndex < inputGroups.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function InsightsPanel({
  methodology,
  insights,
  benchmarks,
  relatedCalculators,
  testId,
}: {
  methodology?: string;
  insights?: InsightItem[];
  benchmarks?: BenchmarkItem[];
  relatedCalculators?: RelatedCalculator[];
  testId?: string;
}) {
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const hasContent = methodology || insights?.length || benchmarks?.length || relatedCalculators?.length;
  if (!hasContent) return null;

  const insightTypeStyles = {
    positive: {
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: TrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    negative: {
      bg: "bg-red-50 dark:bg-red-950/50",
      border: "border-red-200 dark:border-red-800",
      icon: TrendingDown,
      iconColor: "text-red-600 dark:text-red-400",
    },
    neutral: {
      bg: "bg-muted",
      border: "border-border",
      icon: Minus,
      iconColor: "text-muted-foreground",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "border-blue-200 dark:border-blue-800",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
      className="rounded-xl border border-card-border bg-card p-6 space-y-6"
      data-testid={testId || "calculator-insights-panel"}
    >
      {methodology && (
        <Collapsible
          open={methodologyOpen}
          onOpenChange={setMethodologyOpen}
          className="space-y-3"
        >
          <CollapsibleTrigger
            className="flex w-full items-center justify-between gap-2 text-left"
            data-testid={`${testId}-methodology-trigger`}
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Methodology
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                methodologyOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              data-testid={`${testId}-methodology-content`}
            >
              {methodology}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}

      {insights && insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold text-foreground">
              AI-Powered Insights
            </h4>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <div className="space-y-2">
            {insights.map((insight) => {
              const styles = insightTypeStyles[insight.type];
              const InsightIcon = styles.icon;
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "rounded-lg border p-3",
                    styles.bg,
                    styles.border
                  )}
                  data-testid={`${testId}-insight-${insight.id}`}
                >
                  <div className="flex items-start gap-2.5">
                    <InsightIcon className={cn("h-4 w-4 mt-0.5", styles.iconColor)} />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {insight.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {benchmarks && benchmarks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Industry Benchmarks
          </h4>
          <div className="space-y-3">
            {benchmarks.map((benchmark) => {
              const yourPercent =
                benchmark.industryAvg > 0
                  ? (benchmark.yourValue / benchmark.industryAvg) * 100
                  : 100;
              const isAboveAvg = benchmark.yourValue > benchmark.industryAvg;

              const formatBenchmarkValue = (val: number) => {
                switch (benchmark.format) {
                  case "currency":
                    return new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(val);
                  case "percentage":
                    return `${val.toFixed(1)}%`;
                  default:
                    return val.toLocaleString();
                }
              };

              return (
                <div
                  key={benchmark.id}
                  className="space-y-2"
                  data-testid={`${testId}-benchmark-${benchmark.id}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{benchmark.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {formatBenchmarkValue(benchmark.yourValue)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs {formatBenchmarkValue(benchmark.industryAvg)} avg
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(yourPercent, 150)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full",
                        isAboveAvg ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                    <div
                      className="absolute top-0 h-full w-px bg-foreground/50"
                      style={{ left: "100%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {relatedCalculators && relatedCalculators.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Related Calculators
          </h4>
          <div className="grid gap-2">
            {relatedCalculators.map((calc) => {
              const CalcIcon = calc.icon || Calculator;
              return (
                <a
                  key={calc.id}
                  href={calc.href}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover-elevate transition-all duration-200"
                  data-testid={`${testId}-related-${calc.id}`}
                >
                  <div className="flex-shrink-0 p-2 rounded-md bg-accent/10 text-accent">
                    <CalcIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {calc.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {calc.description}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ActionFooter({
  calculated,
  calculateButtonText = "Calculate",
  onCalculate,
  onReset,
  onShare,
  onSave,
  testId,
}: {
  calculated?: boolean;
  calculateButtonText?: string;
  onCalculate?: () => void;
  onReset?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  testId?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
      className="rounded-xl border border-card-border bg-card p-4"
      data-testid={testId || "calculator-action-footer"}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          onClick={onCalculate}
          className="flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2"
          data-testid="button-calculate"
        >
          <Calculator className="h-4 w-4" />
          {calculated ? "Recalculate" : calculateButtonText}
        </Button>

        {onReset && (
          <Button
            variant="outline"
            onClick={onReset}
            className="gap-2"
            data-testid="button-reset"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {onShare && (
            <Button
              variant="outline"
              size="icon"
              onClick={onShare}
              className="flex-shrink-0"
              data-testid="button-share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {onSave && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSave}
              className="flex-shrink-0"
              data-testid="button-save"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          {(onShare || onSave) && (
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              data-testid="button-download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const CalculatorShell = forwardRef<HTMLDivElement, CalculatorShellProps>(
  (
    {
      title,
      subtitle,
      description,
      icon: Icon = Calculator,
      category,
      showMeshGradient = true,
      primaryResult,
      secondaryMetrics,
      inputGroups,
      methodology,
      insights,
      benchmarks,
      relatedCalculators,
      loading = false,
      calculated = false,
      onCalculate,
      onReset,
      onShare,
      onSave,
      onExportToSheets,
      calculateButtonText = "Calculate",
      children,
      className,
      testId,
    },
    ref
  ) => {
    if (loading) {
      return <CalculatorShellSkeleton className={className} />;
    }

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        data-testid={testId || "calculator-shell"}
      >
        {showMeshGradient && (
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          </div>
        )}

        <div className="space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4"
            data-testid={`${testId}-hero`}
          >
            {category && (
              <Badge
                variant="secondary"
                className="text-xs font-semibold uppercase tracking-wider"
                data-testid={`${testId}-category`}
              >
                {category}
              </Badge>
            )}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-accent/10 text-accent">
                <Icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="space-y-2 min-w-0">
                <h1
                  className="text-2xl md:text-4xl font-bold tracking-tight text-foreground"
                  data-testid={`${testId}-title`}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p
                    className="text-lg md:text-xl font-medium text-accent"
                    data-testid={`${testId}-subtitle`}
                  >
                    {subtitle}
                  </p>
                )}
                {description && (
                  <p
                    className="text-sm md:text-base text-muted-foreground max-w-2xl"
                    data-testid={`${testId}-description`}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {calculated && primaryResult && (
              <ResultSummaryPanel
                primaryResult={primaryResult}
                secondaryMetrics={secondaryMetrics}
                onExportToSheets={onExportToSheets}
                testId={`${testId}-results`}
              />
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-2 gap-6">
            <InputSection
              inputGroups={inputGroups}
              testId={`${testId}-inputs`}
            />
            <InsightsPanel
              methodology={methodology}
              insights={insights}
              benchmarks={benchmarks}
              relatedCalculators={relatedCalculators}
              testId={`${testId}-insights`}
            />
          </div>

          {children}

          <ActionFooter
            calculated={calculated}
            calculateButtonText={calculateButtonText}
            onCalculate={onCalculate}
            onReset={onReset}
            onShare={onShare}
            onSave={onSave}
            testId={`${testId}-actions`}
          />
        </div>
      </div>
    );
  }
);

CalculatorShell.displayName = "CalculatorShell";

export {
  CalculatorShell,
  CalculatorShellSkeleton,
  ResultSummaryPanel,
  InputSection,
  InsightsPanel,
  ActionFooter,
  AnimatedNumber,
  InputField,
};
