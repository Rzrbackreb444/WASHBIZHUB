import { useState, useMemo } from "react";
import { ClipboardCheck, CheckCircle, Circle, AlertTriangle, Clock, FileText, Download, Info, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DueDiligenceChecklistProps {
  cleanbiScore: number;
  grade: string;
  address?: string;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedTime?: string;
  linkedFactors?: string[];
}

interface ChecklistCategory {
  name: string;
  icon: React.ElementType;
  items: ChecklistItem[];
}

const CHECKLIST_DATA: ChecklistCategory[] = [
  {
    name: "Financial Verification",
    icon: FileText,
    items: [
      { id: "fin-1", label: "Request 3 years of tax returns", priority: "critical", estimatedTime: "1-2 weeks", linkedFactors: ["Profit Margin", "Revenue per Machine"] },
      { id: "fin-2", label: "Verify gross revenue with POS/coin records", priority: "critical", estimatedTime: "1 week", linkedFactors: ["Revenue per Machine", "Turns Per Day"] },
      { id: "fin-3", label: "Obtain 12 months of utility bills", priority: "critical", estimatedTime: "1 week", linkedFactors: ["Utility Cost Efficiency"] },
      { id: "fin-4", label: "Review rent roll and lease payments", priority: "critical", estimatedTime: "3 days", linkedFactors: ["Rent-to-Revenue Ratio"] },
      { id: "fin-5", label: "Analyze profit & loss statements", priority: "high", estimatedTime: "3 days" },
      { id: "fin-6", label: "Verify accounts receivable/payable", priority: "medium", estimatedTime: "1 week" },
      { id: "fin-7", label: "Review bank statements", priority: "high", estimatedTime: "1 week" },
      { id: "fin-8", label: "Calculate actual EBITDA", priority: "critical", estimatedTime: "2 days", linkedFactors: ["NOI Multiple"] }
    ]
  },
  {
    name: "Lease & Property",
    icon: FileText,
    items: [
      { id: "lease-1", label: "Review current lease agreement", priority: "critical", estimatedTime: "1 week", linkedFactors: ["Lease Years Remaining", "Annual Escalation Rate"] },
      { id: "lease-2", label: "Verify lease assignment rights", priority: "critical", estimatedTime: "3 days" },
      { id: "lease-3", label: "Check for exclusive use clause", priority: "high", estimatedTime: "1 day", linkedFactors: ["Exclusive Use Clause"] },
      { id: "lease-4", label: "Review renewal options", priority: "high", estimatedTime: "1 day", linkedFactors: ["Renewal Options"] },
      { id: "lease-5", label: "Understand CAM charges and escalations", priority: "high", estimatedTime: "2 days", linkedFactors: ["NNN Terms"] },
      { id: "lease-6", label: "Contact landlord about assignment", priority: "critical", estimatedTime: "1-2 weeks", linkedFactors: ["Landlord Relationship"] },
      { id: "lease-7", label: "Order property inspection", priority: "high", estimatedTime: "1-2 weeks" },
      { id: "lease-8", label: "Check zoning and permits", priority: "medium", estimatedTime: "1 week" }
    ]
  },
  {
    name: "Equipment",
    icon: ClipboardCheck,
    items: [
      { id: "equip-1", label: "Obtain complete equipment manifest", priority: "critical", estimatedTime: "3 days", linkedFactors: ["Average Equipment Age", "Machine Mix"] },
      { id: "equip-2", label: "Verify equipment ownership (no liens)", priority: "critical", estimatedTime: "1 week" },
      { id: "equip-3", label: "Review maintenance records", priority: "high", estimatedTime: "3 days", linkedFactors: ["Maintenance History"] },
      { id: "equip-4", label: "Test all machines during site visit", priority: "high", estimatedTime: "4 hours" },
      { id: "equip-5", label: "Assess vend prices vs. market", priority: "medium", estimatedTime: "1 day" },
      { id: "equip-6", label: "Check payment system condition", priority: "medium", estimatedTime: "2 hours", linkedFactors: ["Smart Payment Systems"] },
      { id: "equip-7", label: "Verify water heater capacity", priority: "medium", estimatedTime: "1 hour" },
      { id: "equip-8", label: "Inspect HVAC and lighting", priority: "low", estimatedTime: "1 hour" }
    ]
  },
  {
    name: "Operations",
    icon: ClipboardCheck,
    items: [
      { id: "ops-1", label: "Review employee contracts/payroll", priority: "high", estimatedTime: "3 days", linkedFactors: ["Staffing Level", "Labor Cost Efficiency"] },
      { id: "ops-2", label: "Analyze customer traffic patterns", priority: "medium", estimatedTime: "3 days", linkedFactors: ["Turns Per Day"] },
      { id: "ops-3", label: "Review vendor agreements", priority: "medium", estimatedTime: "2 days" },
      { id: "ops-4", label: "Check insurance coverage", priority: "high", estimatedTime: "2 days" },
      { id: "ops-5", label: "Review any franchise agreements", priority: "high", estimatedTime: "1 week" },
      { id: "ops-6", label: "Assess WDF operation if applicable", priority: "medium", estimatedTime: "2 days", linkedFactors: ["WDF Services"] },
      { id: "ops-7", label: "Review online presence/reviews", priority: "low", estimatedTime: "2 hours", linkedFactors: ["Online Presence", "Customer Satisfaction"] }
    ]
  },
  {
    name: "Legal & Compliance",
    icon: AlertTriangle,
    items: [
      { id: "legal-1", label: "Order title search on business", priority: "critical", estimatedTime: "1-2 weeks" },
      { id: "legal-2", label: "Check for any pending litigation", priority: "critical", estimatedTime: "1 week" },
      { id: "legal-3", label: "Verify business licenses are current", priority: "high", estimatedTime: "3 days" },
      { id: "legal-4", label: "Review ADA compliance", priority: "high", estimatedTime: "1 day", linkedFactors: ["ADA Accessibility"] },
      { id: "legal-5", label: "Check environmental compliance", priority: "medium", estimatedTime: "1-2 weeks" },
      { id: "legal-6", label: "Review any non-compete agreements", priority: "medium", estimatedTime: "2 days" }
    ]
  },
  {
    name: "Market Analysis",
    icon: FileText,
    items: [
      { id: "market-1", label: "Verify competitor count and locations", priority: "high", estimatedTime: "1 day", linkedFactors: ["Competition Density", "Market Saturation"] },
      { id: "market-2", label: "Conduct traffic study", priority: "medium", estimatedTime: "3 days", linkedFactors: ["Traffic Volume", "Foot Traffic"] },
      { id: "market-3", label: "Analyze demographic trends", priority: "medium", estimatedTime: "2 days", linkedFactors: ["Population Density", "Renter Percentage"] },
      { id: "market-4", label: "Research local development plans", priority: "medium", estimatedTime: "2 days", linkedFactors: ["Growth Potential", "New Construction"] }
    ]
  }
];

export function DueDiligenceChecklist({ cleanbiScore, grade, address, isSubscriber = false, onUpgradeClick }: DueDiligenceChecklistProps) {
  const { toast } = useToast();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const totalItems = CHECKLIST_DATA.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercent = (completedCount / totalItems) * 100;
  
  const criticalItems = CHECKLIST_DATA.flatMap(cat => cat.items).filter(item => item.priority === "critical");
  const completedCritical = criticalItems.filter(item => completedItems.has(item.id)).length;
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Starter Feature</h3>
            <p className="text-muted-foreground mb-4">
              Due diligence checklists require a Starter subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Starter
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-500" />
            Due Diligence Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  const toggleItem = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };
  
  const exportChecklist = () => {
    const lines = [
      `DUE DILIGENCE CHECKLIST`,
      `Location: ${address || "Not specified"}`,
      `CLEANBI Grade: ${grade} (${cleanbiScore.toFixed(1)}/100)`,
      `Progress: ${completedCount}/${totalItems} (${progressPercent.toFixed(0)}%)`,
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "---",
      ""
    ];
    
    CHECKLIST_DATA.forEach(category => {
      lines.push(`## ${category.name}`);
      lines.push("");
      category.items.forEach(item => {
        const status = completedItems.has(item.id) ? "[x]" : "[ ]";
        const priorityTag = item.priority === "critical" ? " ⚠️ CRITICAL" : "";
        lines.push(`${status} ${item.label}${priorityTag}`);
        if (item.estimatedTime) {
          lines.push(`    Est. Time: ${item.estimatedTime}`);
        }
      });
      lines.push("");
    });
    
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `due-diligence-checklist-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Checklist Exported",
      description: "Due diligence checklist saved as Markdown file."
    });
  };
  
  const priorityColors = {
    critical: "text-red-600 bg-red-500/10",
    high: "text-amber-600 bg-amber-500/10",
    medium: "text-blue-600 bg-blue-500/10",
    low: "text-gray-600 bg-gray-500/10"
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-500" />
              Due Diligence Checklist
            </CardTitle>
            <CardDescription>
              {totalItems} items linked to CLEANBI factors
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportChecklist}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{completedCount}/{totalItems} ({progressPercent.toFixed(0)}%)</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "p-3 rounded-lg text-center",
            completedCritical === criticalItems.length ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <p className="text-xs text-muted-foreground">Critical Items</p>
            <p className={cn(
              "text-lg font-bold",
              completedCritical === criticalItems.length ? "text-green-600" : "text-red-600"
            )}>
              {completedCritical}/{criticalItems.length}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Est. Total Time</p>
            <p className="text-lg font-bold">4-6 weeks</p>
          </div>
        </div>
        
        <Accordion 
          type="multiple" 
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="space-y-2"
        >
          {CHECKLIST_DATA.map((category) => {
            const categoryCompleted = category.items.filter(item => completedItems.has(item.id)).length;
            const categoryPercent = (categoryCompleted / category.items.length) * 100;
            const CategoryIcon = category.icon;
            
            return (
              <AccordionItem 
                key={category.name} 
                value={category.name}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left flex-1">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={categoryPercent} className="h-1.5 w-20" />
                        <span className="text-xs text-muted-foreground">
                          {categoryCompleted}/{category.items.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pb-4">
                  {category.items.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        completedItems.has(item.id) ? "bg-green-500/5 border-green-200" : "bg-muted/30"
                      )}
                    >
                      <Checkbox
                        id={item.id}
                        checked={completedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={item.id} 
                          className={cn(
                            "cursor-pointer",
                            completedItems.has(item.id) && "line-through text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </Label>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className={cn("text-xs", priorityColors[item.priority])}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </Badge>
                          {item.estimatedTime && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Clock className="h-3 w-3" />
                              {item.estimatedTime}
                            </Badge>
                          )}
                          {item.linkedFactors && item.linkedFactors.map((factor, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Checklist items are linked to CLEANBI factors. Complete critical items before making an offer.
        </p>
      </CardContent>
    </Card>
  );
}

export default DueDiligenceChecklist;
