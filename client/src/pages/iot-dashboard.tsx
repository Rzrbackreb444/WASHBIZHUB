import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Droplets,
  Gauge,
  Power,
  RefreshCcw,
  Settings,
  Thermometer,
  TrendingUp,
  Wrench,
  Zap,
  Calendar,
  CloudRain,
  Sun,
  Moon,
  BarChart3,
  AlertCircle,
  XCircle,
  Loader2,
  Play,
  Pause,
  Timer,
  ChevronRight,
  Eye,
  History,
  Flag
} from "lucide-react";
import type { MachineAsset, MachineTelemetry, PricingRule, MachineAlert } from "@shared/schema";

interface SimulatedMachine {
  id: string;
  machineNumber: string;
  machineName: string;
  machineType: "washer" | "dryer";
  manufacturer: string;
  model: string;
  capacity: number;
  status: "available" | "running" | "error" | "offline" | "maintenance";
  cycleProgress: number;
  cycleType: string | null;
  cycleStartTime: Date | null;
  estimatedEndTime: Date | null;
  temperature: number;
  waterLevel: number;
  errorCode: string | null;
  errorMessage: string | null;
  turnsPerDay: number;
  revenueToday: number;
  healthScore: number;
  lastHeartbeat: Date;
}

function generateSimulatedMachines(): SimulatedMachine[] {
  const statuses: Array<"available" | "running" | "error" | "offline" | "maintenance"> = ["available", "running", "error", "offline", "maintenance"];
  const cycleTypes = ["Normal", "Heavy Duty", "Delicate", "Quick Wash", "Sanitize"];
  const manufacturers = ["Speed Queen", "Dexter", "Maytag", "Huebsch"];
  
  const machines: SimulatedMachine[] = [];
  
  for (let i = 1; i <= 8; i++) {
    const isWasher = i <= 5;
    const status = statuses[Math.floor(Math.random() * 100) % 5];
    const cycleProgress = status === "running" ? Math.floor(Math.random() * 100) : 0;
    
    machines.push({
      id: `machine-${i}`,
      machineNumber: isWasher ? `W-${i}` : `D-${i - 5}`,
      machineName: isWasher ? `Washer ${i}` : `Dryer ${i - 5}`,
      machineType: isWasher ? "washer" : "dryer",
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      model: isWasher ? "SC40" : "DX50",
      capacity: isWasher ? 40 : 55,
      status,
      cycleProgress,
      cycleType: status === "running" ? cycleTypes[Math.floor(Math.random() * cycleTypes.length)] : null,
      cycleStartTime: status === "running" ? new Date(Date.now() - (cycleProgress / 100) * 45 * 60000) : null,
      estimatedEndTime: status === "running" ? new Date(Date.now() + ((100 - cycleProgress) / 100) * 45 * 60000) : null,
      temperature: isWasher ? 35 + Math.random() * 25 : 60 + Math.random() * 30,
      waterLevel: isWasher ? Math.random() * 100 : 0,
      errorCode: status === "error" ? "E" + Math.floor(Math.random() * 20 + 1).toString().padStart(2, "0") : null,
      errorMessage: status === "error" ? "Sensor malfunction detected" : null,
      turnsPerDay: 4 + Math.random() * 8,
      revenueToday: 20 + Math.random() * 80,
      healthScore: status === "error" ? 40 + Math.floor(Math.random() * 30) : 80 + Math.floor(Math.random() * 20),
      lastHeartbeat: new Date(Date.now() - Math.random() * 60000),
    });
  }
  
  return machines;
}

function generateSimulatedAlerts(): MachineAlert[] {
  return [
    {
      id: "alert-1",
      machineId: "machine-3",
      laundromatId: null,
      alertType: "error",
      message: "Washer 3 - Door lock sensor malfunction (E05)",
      severity: "error",
      errorCode: "E05",
      errorDescription: "Door lock sensor failed to engage",
      isResolved: false,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null,
      notificationSent: true,
      notifiedAt: new Date(Date.now() - 3600000),
      metadata: null,
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      id: "alert-2",
      machineId: "machine-6",
      laundromatId: null,
      alertType: "maintenance_due",
      message: "Dryer 1 - Scheduled maintenance due in 3 days",
      severity: "warning",
      errorCode: null,
      errorDescription: null,
      isResolved: false,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null,
      notificationSent: true,
      notifiedAt: new Date(Date.now() - 86400000),
      metadata: null,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: "alert-3",
      machineId: "machine-2",
      laundromatId: null,
      alertType: "temperature_warning",
      message: "Washer 2 - Temperature running 10°F above normal",
      severity: "warning",
      errorCode: null,
      errorDescription: null,
      isResolved: false,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null,
      notificationSent: false,
      notifiedAt: null,
      metadata: null,
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(Date.now() - 1800000),
    },
  ] as any;
}

function generateSimulatedPricingRules(): PricingRule[] {
  return [
    {
      id: "rule-1",
      userId: null,
      locationId: "loc-1",
      name: "Peak Evening Hours",
      ruleType: "time_of_day",
      active: true,
      priority: 1,
      conditions: { timeStart: "17:00", timeEnd: "21:00" },
      adjustmentType: "percentage",
      adjustmentValue: "1.25",
      minPrice: null,
      maxPrice: null,
      aiSuggested: false,
      estimatedRevenueImpact: "150.00",
      totalApplications: 245,
      revenueGenerated: "612.50",
      createdAt: new Date(),
    },
    {
      id: "rule-2",
      userId: null,
      locationId: "loc-1",
      name: "Weekend Premium",
      ruleType: "day_of_week",
      active: true,
      priority: 2,
      conditions: { daysOfWeek: [0, 6] },
      adjustmentType: "percentage",
      adjustmentValue: "1.15",
      minPrice: null,
      maxPrice: null,
      aiSuggested: true,
      estimatedRevenueImpact: "200.00",
      totalApplications: 89,
      revenueGenerated: "356.00",
      createdAt: new Date(),
    },
    {
      id: "rule-3",
      userId: null,
      locationId: "loc-1",
      name: "Rainy Day Surge",
      ruleType: "surge",
      active: true,
      priority: 3,
      conditions: { weather: "rain" },
      adjustmentType: "percentage",
      adjustmentValue: "1.20",
      minPrice: null,
      maxPrice: null,
      aiSuggested: true,
      estimatedRevenueImpact: "75.00",
      totalApplications: 12,
      revenueGenerated: "48.00",
      createdAt: new Date(),
    },
    {
      id: "rule-4",
      userId: null,
      locationId: "loc-1",
      name: "Off-Peak Discount",
      ruleType: "time_of_day",
      active: true,
      priority: 4,
      conditions: { timeStart: "06:00", timeEnd: "09:00" },
      adjustmentType: "percentage",
      adjustmentValue: "0.85",
      minPrice: null,
      maxPrice: null,
      aiSuggested: false,
      estimatedRevenueImpact: "-50.00",
      totalApplications: 156,
      revenueGenerated: "-78.00",
      createdAt: new Date(),
    },
  ] as any;
}

function MachineStatusCard({ machine, onReportIssue, onViewHistory }: { 
  machine: SimulatedMachine; 
  onReportIssue: (machine: SimulatedMachine) => void;
  onViewHistory: (machine: SimulatedMachine) => void;
}) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    if (machine.status === "running" && machine.estimatedEndTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = machine.estimatedEndTime!.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeRemaining("Complete");
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${mins}:${secs.toString().padStart(2, "0")}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [machine.status, machine.estimatedEndTime]);
  
  const statusConfig = {
    available: { color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50 dark:bg-green-500/10", label: "Available", icon: CheckCircle2 },
    running: { color: "bg-blue-500", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-500/10", label: "Running", icon: Play },
    error: { color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50 dark:bg-red-500/10", label: "Error", icon: XCircle },
    offline: { color: "bg-gray-500", textColor: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-500/10", label: "Offline", icon: Power },
    maintenance: { color: "bg-orange-500", textColor: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-500/10", label: "Maintenance", icon: Wrench },
  };
  
  const config = statusConfig[machine.status];
  const StatusIcon = config.icon;
  
  return (
    <Card 
      className={`relative overflow-hidden transition-all hover:shadow-md ${config.bgColor}`}
      data-testid={`card-machine-${machine.id}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.color}`} />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config.color}`}>
              {machine.machineType === "washer" ? (
                <Droplets className="h-4 w-4 text-white" />
              ) : (
                <Thermometer className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground" data-testid={`text-machine-number-${machine.id}`}>
                {machine.machineNumber}
              </h3>
              <p className="text-xs text-muted-foreground">{machine.manufacturer} {machine.model}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${config.textColor} border-current`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        
        {machine.status === "running" && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{machine.cycleType}</span>
              <span className="text-xs font-medium text-blue-600" data-testid={`text-time-remaining-${machine.id}`}>
                <Timer className="h-3 w-3 inline mr-1" />
                {timeRemaining}
              </span>
            </div>
            <Progress value={machine.cycleProgress} className="h-2" data-testid={`progress-cycle-${machine.id}`} />
          </div>
        )}
        
        {machine.status === "error" && machine.errorCode && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600" data-testid={`text-error-code-${machine.id}`}>
                Error: {machine.errorCode}
              </span>
            </div>
            <p className="text-xs text-red-500 mt-1">{machine.errorMessage}</p>
            <Link href={`/service-guy-ai?code=${machine.errorCode}&manufacturer=${machine.manufacturer}`}>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs text-red-600 mt-1" data-testid={`link-service-guy-${machine.id}`}>
                Get AI Fix Suggestions <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Thermometer className="h-3 w-3" />
              Temp
            </div>
            <span className="text-sm font-medium" data-testid={`text-temperature-${machine.id}`}>
              {machine.temperature.toFixed(1)}°F
            </span>
          </div>
          {machine.machineType === "washer" && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Droplets className="h-3 w-3" />
                Water
              </div>
              <span className="text-sm font-medium" data-testid={`text-water-level-${machine.id}`}>
                {machine.waterLevel.toFixed(0)}%
              </span>
            </div>
          )}
          {machine.machineType === "dryer" && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Health
              </div>
              <span className="text-sm font-medium" data-testid={`text-health-score-${machine.id}`}>
                {machine.healthScore}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span data-testid={`text-turns-${machine.id}`}>{machine.turnsPerDay.toFixed(1)} turns/day</span>
          <span className="text-[#C8A661] font-medium" data-testid={`text-revenue-${machine.id}`}>
            ${machine.revenueToday.toFixed(2)} today
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onReportIssue(machine)}
            data-testid={`button-report-issue-${machine.id}`}
          >
            <Flag className="h-3 w-3 mr-1" />
            Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewHistory(machine)}
            data-testid={`button-view-history-${machine.id}`}
          >
            <History className="h-3 w-3 mr-1" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ alert, onResolve }: { alert: MachineAlert; onResolve: (id: string) => void }) {
  const severityConfig = {
    info: { color: "bg-blue-500", icon: AlertCircle, bgColor: "bg-blue-50 dark:bg-blue-500/10" },
    warning: { color: "bg-orange-500", icon: AlertTriangle, bgColor: "bg-orange-50 dark:bg-orange-500/10" },
    error: { color: "bg-red-500", icon: XCircle, bgColor: "bg-red-50 dark:bg-red-500/10" },
    critical: { color: "bg-red-700", icon: XCircle, bgColor: "bg-red-100 dark:bg-red-500/20" },
  };
  
  const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.warning;
  const AlertIcon = config.icon;
  
  return (
    <Card className={`${config.bgColor} border-l-4 ${config.color.replace("bg-", "border-")}`} data-testid={`card-alert-${alert.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <AlertIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-foreground" data-testid={`text-alert-message-${alert.id}`}>{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {!alert.isResolved && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onResolve(alert.id)}
              data-testid={`button-resolve-alert-${alert.id}`}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PricingRuleCard({ rule, onToggle, onEdit }: { 
  rule: PricingRule; 
  onToggle: (id: string, active: boolean) => void;
  onEdit: (rule: PricingRule) => void;
}) {
  const ruleTypeConfig = {
    time_of_day: { icon: Clock, label: "Time-based" },
    day_of_week: { icon: Calendar, label: "Day-based" },
    surge: { icon: TrendingUp, label: "Surge" },
    demand: { icon: Activity, label: "Demand" },
    competition: { icon: BarChart3, label: "Competition" },
  };
  
  const config = ruleTypeConfig[rule.ruleType as keyof typeof ruleTypeConfig] || ruleTypeConfig.time_of_day;
  const RuleIcon = config.icon;
  
  const multiplier = parseFloat(rule.adjustmentValue);
  const isIncrease = multiplier > 1;
  const percentChange = ((multiplier - 1) * 100).toFixed(0);
  
  return (
    <Card className="overflow-hidden" data-testid={`card-pricing-rule-${rule.id}`}>
      <div className={`h-1 ${isIncrease ? "bg-green-500" : "bg-blue-500"}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <RuleIcon className="h-5 w-5 text-[#C8A661]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground" data-testid={`text-rule-name-${rule.id}`}>{rule.name}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                {rule.aiSuggested && (
                  <Badge variant="outline" className="text-xs border-[#C8A661] text-[#C8A661]">
                    <Zap className="h-3 w-3 mr-1" />
                    AI Suggested
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Switch 
            checked={rule.active} 
            onCheckedChange={(checked) => onToggle(rule.id, checked)}
            data-testid={`switch-rule-active-${rule.id}`}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <span className={`text-lg font-bold ${isIncrease ? "text-green-600" : "text-blue-600"}`} data-testid={`text-price-change-${rule.id}`}>
              {isIncrease ? "+" : ""}{percentChange}%
            </span>
            <p className="text-xs text-muted-foreground">Price Adjustment</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <span className="text-lg font-bold text-[#C8A661]" data-testid={`text-revenue-generated-${rule.id}`}>
              ${parseFloat(rule.revenueGenerated).toFixed(0)}
            </span>
            <p className="text-xs text-muted-foreground">Revenue Impact</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Applied {rule.totalApplications} times</span>
          <Button variant="ghost" size="sm" onClick={() => onEdit(rule)} data-testid={`button-edit-rule-${rule.id}`}>
            <Settings className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <Card className="overflow-hidden" data-testid={`card-kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-[#C8A661]">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#C8A661]" />
          </div>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend === "down" ? "rotate-180" : ""}`} />
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IoTDashboard() {
  const { toast } = useToast();
  const [machines, setMachines] = useState<SimulatedMachine[]>([]);
  const [alerts, setAlerts] = useState<MachineAlert[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<SimulatedMachine | null>(null);
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    ruleType: "time_of_day",
    timeStart: "17:00",
    timeEnd: "21:00",
    adjustmentValue: "1.20",
    daysOfWeek: [] as number[],
  });
  
  useEffect(() => {
    const loadData = () => {
      setMachines(generateSimulatedMachines());
      setAlerts(generateSimulatedAlerts());
      setPricingRules(generateSimulatedPricingRules());
      setIsLoading(false);
    };
    
    loadData();
    
    const interval = setInterval(() => {
      setMachines(prev => prev.map(m => ({
        ...m,
        cycleProgress: m.status === "running" ? Math.min(100, m.cycleProgress + 1) : m.cycleProgress,
        temperature: m.temperature + (Math.random() - 0.5) * 2,
        waterLevel: m.machineType === "washer" ? Math.max(0, Math.min(100, m.waterLevel + (Math.random() - 0.5) * 5)) : 0,
        lastHeartbeat: new Date(),
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleReportIssue = (machine: SimulatedMachine) => {
    toast({
      title: "Report Issue",
      description: `Opening issue report for ${machine.machineNumber}`,
    });
  };
  
  const handleViewHistory = (machine: SimulatedMachine) => {
    setSelectedMachine(machine);
  };
  
  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast({
      title: "Alert Resolved",
      description: "The alert has been marked as resolved.",
    });
  };
  
  const handleTogglePricingRule = (ruleId: string, active: boolean) => {
    setPricingRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, active } : r
    ));
    toast({
      title: active ? "Rule Activated" : "Rule Deactivated",
      description: `Pricing rule has been ${active ? "activated" : "deactivated"}.`,
    });
  };
  
  const handleEditPricingRule = (rule: PricingRule) => {
    toast({
      title: "Edit Rule",
      description: `Opening editor for ${rule.name}`,
    });
  };
  
  const handleAddPricingRule = () => {
    const newPricingRule: PricingRule = {
      id: `rule-${Date.now()}`,
      userId: null,
      locationId: "loc-1",
      name: newRule.name,
      ruleType: newRule.ruleType,
      active: true,
      priority: pricingRules.length + 1,
      conditions: newRule.ruleType === "time_of_day" 
        ? { timeStart: newRule.timeStart, timeEnd: newRule.timeEnd }
        : { daysOfWeek: newRule.daysOfWeek },
      adjustmentType: "percentage",
      adjustmentValue: newRule.adjustmentValue,
      minPrice: null,
      maxPrice: null,
      aiSuggested: false,
      estimatedRevenueImpact: "0.00",
      totalApplications: 0,
      revenueGenerated: "0.00",
      createdAt: new Date(),
    } as any;
    
    setPricingRules(prev => [...prev, newPricingRule]);
    setShowAddRuleDialog(false);
    setNewRule({
      name: "",
      ruleType: "time_of_day",
      timeStart: "17:00",
      timeEnd: "21:00",
      adjustmentValue: "1.20",
      daysOfWeek: [],
    });
    
    toast({
      title: "Rule Created",
      description: `${newRule.name} has been added to your pricing rules.`,
    });
  };
  
  const machineStats = {
    available: machines.filter(m => m.status === "available").length,
    running: machines.filter(m => m.status === "running").length,
    error: machines.filter(m => m.status === "error").length,
    offline: machines.filter(m => m.status === "offline").length,
  };
  
  const totalRevenue = machines.reduce((sum, m) => sum + m.revenueToday, 0);
  const avgUtilization = machines.length > 0 
    ? (machineStats.running / machines.length * 100).toFixed(0)
    : "0";
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <SEO
        title="IoT Dashboard - Machine Monitoring & Dynamic Pricing | WashBizHub"
        description="Real-time IoT monitoring dashboard for laundromat machines. Track machine status, cycle progress, and configure dynamic pricing rules."
      />
      
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                IoT Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time machine monitoring and dynamic pricing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Live
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Machines Available"
              value={`${machineStats.available}/${machines.length}`}
              subtitle="Ready for customers"
              icon={CheckCircle2}
              trend="up"
              trendValue="+2 from yesterday"
            />
            <KPICard
              title="Utilization Rate"
              value={`${avgUtilization}%`}
              subtitle="Machines in use"
              icon={Activity}
              trend="up"
              trendValue="+5% this hour"
            />
            <KPICard
              title="Revenue Today"
              value={`$${totalRevenue.toFixed(2)}`}
              subtitle="All machines combined"
              icon={DollarSign}
              trend="up"
              trendValue="+12% vs yesterday"
            />
            <KPICard
              title="Active Alerts"
              value={alerts.filter(a => !a.isResolved).length.toString()}
              subtitle={`${alerts.filter(a => a.severity === "error" || a.severity === "critical").length} critical`}
              icon={Bell}
              trend={alerts.length > 0 ? "down" : "neutral"}
              trendValue={alerts.length > 0 ? "Needs attention" : "All clear"}
            />
          </div>
          
          <Tabs defaultValue="machines" className="space-y-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-grid">
              <TabsTrigger value="machines" data-testid="tab-machines">
                <Gauge className="h-4 w-4 mr-2" />
                Machines
              </TabsTrigger>
              <TabsTrigger value="alerts" data-testid="tab-alerts">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
                {alerts.filter(a => !a.isResolved).length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0">
                    {alerts.filter(a => !a.isResolved).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pricing" data-testid="tab-pricing">
                <DollarSign className="h-4 w-4 mr-2" />
                Pricing
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="machines" className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={machineStats.available > 0 ? "default" : "secondary"} className="bg-green-500">
                  {machineStats.available} Available
                </Badge>
                <Badge variant={machineStats.running > 0 ? "default" : "secondary"} className="bg-blue-500">
                  {machineStats.running} Running
                </Badge>
                <Badge variant={machineStats.error > 0 ? "destructive" : "secondary"}>
                  {machineStats.error} Error
                </Badge>
                <Badge variant={machineStats.offline > 0 ? "secondary" : "secondary"} className="bg-gray-500 text-white">
                  {machineStats.offline} Offline
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {machines.map(machine => (
                  <MachineStatusCard
                    key={machine.id}
                    machine={machine}
                    onReportIssue={handleReportIssue}
                    onViewHistory={handleViewHistory}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Active Alerts</h2>
                <Button variant="outline" size="sm" data-testid="button-clear-all-alerts">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolve All
                </Button>
              </div>
              
              {alerts.filter(a => !a.isResolved).length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active alerts at this time.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {alerts.filter(a => !a.isResolved).map(alert => (
                    <AlertCard key={alert.id} alert={alert} onResolve={handleResolveAlert} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Dynamic Pricing Rules</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure pricing rules based on time, demand, and conditions
                  </p>
                </div>
                <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0A1628] hover:bg-[#1a3a5c]" data-testid="button-add-pricing-rule">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Pricing Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Pricing Rule</DialogTitle>
                      <DialogDescription>
                        Set up a new dynamic pricing rule for your machines.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          placeholder="e.g., Peak Evening Hours"
                          value={newRule.name}
                          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                          data-testid="input-rule-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rule-type">Rule Type</Label>
                        <Select
                          value={newRule.ruleType}
                          onValueChange={(value) => setNewRule({ ...newRule, ruleType: value })}
                        >
                          <SelectTrigger data-testid="select-rule-type">
                            <SelectValue placeholder="Select rule type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time_of_day">Time of Day</SelectItem>
                            <SelectItem value="day_of_week">Day of Week</SelectItem>
                            <SelectItem value="surge">Surge Pricing</SelectItem>
                            <SelectItem value="demand">Demand-Based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newRule.ruleType === "time_of_day" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="time-start">Start Time</Label>
                            <Input
                              id="time-start"
                              type="time"
                              value={newRule.timeStart}
                              onChange={(e) => setNewRule({ ...newRule, timeStart: e.target.value })}
                              data-testid="input-time-start"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time-end">End Time</Label>
                            <Input
                              id="time-end"
                              type="time"
                              value={newRule.timeEnd}
                              onChange={(e) => setNewRule({ ...newRule, timeEnd: e.target.value })}
                              data-testid="input-time-end"
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="adjustment">Price Multiplier</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="adjustment"
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="2.0"
                            value={newRule.adjustmentValue}
                            onChange={(e) => setNewRule({ ...newRule, adjustmentValue: e.target.value })}
                            data-testid="input-adjustment"
                          />
                          <span className="text-sm text-muted-foreground">
                            ({((parseFloat(newRule.adjustmentValue) - 1) * 100).toFixed(0)}% {parseFloat(newRule.adjustmentValue) > 1 ? "increase" : "discount"})
                          </span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddRuleDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddPricingRule}
                        disabled={!newRule.name}
                        className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                        data-testid="button-save-rule"
                      >
                        Create Rule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5">
                  <div className="flex items-center gap-3">
                    <Sun className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Conditions</p>
                      <p className="font-semibold">Sunny, 72°F</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Demand</p>
                      <p className="font-semibold">Moderate (65%)</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-r from-[#C8A661]/10 to-[#C8A661]/5">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-[#C8A661]" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Modifier</p>
                      <p className="font-semibold">+15% (Peak Hours)</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricingRules.map(rule => (
                  <PricingRuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleTogglePricingRule}
                    onEdit={handleEditPricingRule}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Machine History - {selectedMachine?.machineNumber}</DialogTitle>
            <DialogDescription>
              Performance and usage history for {selectedMachine?.machineName}
            </DialogDescription>
          </DialogHeader>
          {selectedMachine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total Cycles Today</p>
                  <p className="text-2xl font-bold text-[#C8A661]">{Math.floor(selectedMachine.turnsPerDay * 24 / 12)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Revenue This Week</p>
                  <p className="text-2xl font-bold text-[#C8A661]">${(selectedMachine.revenueToday * 7).toFixed(2)}</p>
                </Card>
              </div>
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span>Heavy Duty cycle completed</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Normal cycle completed</span>
                    <span className="text-muted-foreground">3 hours ago</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Quick Wash cycle completed</span>
                    <span className="text-muted-foreground">5 hours ago</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
