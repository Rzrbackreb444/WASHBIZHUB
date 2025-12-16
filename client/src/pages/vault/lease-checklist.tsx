import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  AlertTriangle, FileText, Download, Lock, Crown, 
  CheckCircle, XCircle, ArrowLeft, ArrowRight, Shield,
  Zap, Clock, DollarSign, Building2, FileSignature, Scale
} from "lucide-react";

interface TrapAlert {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  isPremium: boolean;
  checked?: boolean;
}

const FREE_TRAP_ALERTS: TrapAlert[] = [
  {
    id: "1",
    category: "Rent & Financials",
    title: "Triple Net (NNN) Escalation Clause",
    description: "Watch for uncapped CAM charges and property tax increases that can erode your profit margins significantly.",
    severity: "critical",
    isPremium: false,
  },
  {
    id: "2",
    category: "Term & Renewal",
    title: "Personal Guarantee Requirements",
    description: "Landlords may require personal guarantees that put your personal assets at risk if the business fails.",
    severity: "critical",
    isPremium: false,
  },
  {
    id: "3",
    category: "Utilities",
    title: "Utility Sub-Metering Charges",
    description: "Some landlords charge marked-up utility rates through sub-metering. Always negotiate direct utility access.",
    severity: "high",
    isPremium: false,
  },
  {
    id: "4",
    category: "Exclusivity",
    title: "Exclusive Use Clause Missing",
    description: "Without an exclusive use clause, the landlord could lease to a competitor in the same shopping center.",
    severity: "critical",
    isPremium: false,
  },
  {
    id: "5",
    category: "Assignment",
    title: "Assignment Restrictions",
    description: "Restrictive assignment clauses can make it nearly impossible to sell your laundromat business.",
    severity: "high",
    isPremium: false,
  },
  {
    id: "6",
    category: "Improvements",
    title: "Tenant Improvement Ownership",
    description: "Clarify who owns equipment and improvements at lease end. Some leases claim all tenant improvements.",
    severity: "high",
    isPremium: false,
  },
  {
    id: "7",
    category: "Term & Renewal",
    title: "Renewal Option Terms",
    description: "Ensure renewal options specify rent increase caps. 'Fair market value' can mean significant increases.",
    severity: "critical",
    isPremium: false,
  },
];

const PREMIUM_TRAP_ALERTS: TrapAlert[] = [
  {
    id: "8",
    category: "Insurance",
    title: "Excessive Insurance Requirements",
    description: "Some leases require $5M+ liability coverage. Negotiate reasonable limits based on industry standards.",
    severity: "high",
    isPremium: true,
  },
  {
    id: "9",
    category: "Operations",
    title: "Operating Hours Restrictions",
    description: "24-hour operations may be restricted by lease terms. Verify your business model is permitted.",
    severity: "medium",
    isPremium: true,
  },
  {
    id: "10",
    category: "Rent & Financials",
    title: "Percentage Rent Clause",
    description: "Some leases require additional rent based on gross sales. This can significantly impact profitability.",
    severity: "high",
    isPremium: true,
  },
  {
    id: "11",
    category: "Maintenance",
    title: "HVAC Maintenance Responsibility",
    description: "HVAC systems are expensive. Clarify maintenance and replacement responsibilities upfront.",
    severity: "medium",
    isPremium: true,
  },
  {
    id: "12",
    category: "Signage",
    title: "Signage Rights",
    description: "Ensure you have the right to install adequate signage. Some centers restrict sign size and placement.",
    severity: "medium",
    isPremium: true,
  },
  // Add more premium trap alerts...
];

const CATEGORIES = [
  { name: "Rent & Financials", icon: DollarSign, color: "text-red-500" },
  { name: "Term & Renewal", icon: Clock, color: "text-amber-500" },
  { name: "Utilities", icon: Zap, color: "text-blue-500" },
  { name: "Exclusivity", icon: Shield, color: "text-purple-500" },
  { name: "Assignment", icon: FileSignature, color: "text-green-500" },
  { name: "Improvements", icon: Building2, color: "text-indigo-500" },
  { name: "Insurance", icon: Scale, color: "text-pink-500" },
];

export default function LeaseChecklist() {
  const { user } = useAuth();
  const { canAccessTier } = useSubscription();
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const hasPremiumAccess = canAccessTier("pro");
  const allAlerts = [...FREE_TRAP_ALERTS, ...PREMIUM_TRAP_ALERTS];
  const visibleAlerts = hasPremiumAccess ? allAlerts : FREE_TRAP_ALERTS;

  const progress = (checkedItems.size / visibleAlerts.length) * 100;

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
    
    // Save to localStorage
    localStorage.setItem("lease_checklist_progress", JSON.stringify(Array.from(newChecked)));
  };

  // Load saved progress
  useState(() => {
    const saved = localStorage.getItem("lease_checklist_progress");
    if (saved) {
      try {
        setCheckedItems(new Set(JSON.parse(saved)));
      } catch (e) {}
    }
  });

  const handleDownload = () => {
    if (!hasPremiumAccess) {
      toast({
        title: "Pro Access Required",
        description: "Upgrade to Pro to download the full checklist with all 50+ trap alerts.",
      });
      return;
    }
    
    toast({
      title: "Download Starting",
      description: "Your Lease Red Flag Checklist is being prepared.",
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-500 text-white">Critical</Badge>;
      case "high":
        return <Badge className="bg-amber-500 text-white">High</Badge>;
      default:
        return <Badge variant="secondary">Medium</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Lease Red Flag Checklist - Larry Larsen's 50+ Trap Alerts | WashBizHub</title>
        <meta 
          name="description" 
          content="Larry Larsen's comprehensive lease negotiation checklist with 50+ trap alerts. Avoid deal-killing clauses and protect your laundromat investment." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600/10 via-amber-500/5 to-background border-b">
          <div className="container mx-auto px-4 py-8">
            <Link href="/template-vault">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Template Vault
              </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold" data-testid="text-page-title">
                        Lease Red Flag Checklist
                      </h1>
                      <Badge className="bg-green-500">New</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Larry Larsen's 50+ years of due diligence expertise
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleDownload} 
                  className="gap-2"
                  disabled={!hasPremiumAccess}
                  data-testid="button-download"
                >
                  {hasPremiumAccess ? (
                    <>
                      <Download className="w-4 h-4" />
                      Download Full PDF
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Unlock with Pro
                    </>
                  )}
                </Button>
                {!hasPremiumAccess && (
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Crown className="w-3 h-3" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 max-w-md">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Your Progress</span>
                <span className="font-medium">{checkedItems.size} / {visibleAlerts.length} Reviewed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const count = allAlerts.filter(a => a.category === cat.name).length;
                    return (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${cat.color}`} />
                          <span>{cat.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <div className="text-center w-full">
                    <p className="text-2xl font-bold text-primary">50+</p>
                    <p className="text-xs text-muted-foreground">Trap Alerts</p>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Main Content - Checklist */}
            <div className="lg:col-span-3 space-y-6">
              {/* Free Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Free Critical Alerts
                      </CardTitle>
                      <CardDescription>
                        7 essential red flags every buyer should check
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Free Access
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {FREE_TRAP_ALERTS.map(alert => (
                      <AccordionItem key={alert.id} value={alert.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3 text-left">
                            <Checkbox
                              checked={checkedItems.has(alert.id)}
                              onCheckedChange={() => toggleCheck(alert.id)}
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`checkbox-alert-${alert.id}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{alert.title}</span>
                                {getSeverityBadge(alert.severity)}
                              </div>
                              <span className="text-xs text-muted-foreground">{alert.category}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pl-10">
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Premium Section */}
              <Card className={!hasPremiumAccess ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Larry's Complete Trap Alerts
                      </CardTitle>
                      <CardDescription>
                        43 additional expert insights from 50+ years of experience
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500 text-white">
                      Pro Required
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasPremiumAccess ? (
                    <Accordion type="multiple" className="space-y-2">
                      {PREMIUM_TRAP_ALERTS.map(alert => (
                        <AccordionItem key={alert.id} value={alert.id} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-3 text-left">
                              <Checkbox
                                checked={checkedItems.has(alert.id)}
                                onCheckedChange={() => toggleCheck(alert.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{alert.title}</span>
                                  {getSeverityBadge(alert.severity)}
                                </div>
                                <span className="text-xs text-muted-foreground">{alert.category}</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 pl-10">
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto p-4 rounded-full bg-amber-500/10 w-fit mb-4">
                        <Lock className="w-8 h-8 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Unlock 43 More Trap Alerts
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Get Larry Larsen's complete collection of lease red flags, negotiation scripts, and legal templates.
                      </p>
                      <Link href="/pricing">
                        <Button className="gap-2">
                          <Crown className="w-4 h-4" />
                          Upgrade to Pro
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Larry's Quote */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="py-6">
                  <blockquote className="text-lg italic text-center">
                    "In 50 years, I've seen more deals killed by lease clauses than by bad locations. 
                    Review every line like your investment depends on it—because it does."
                  </blockquote>
                  <p className="text-center text-muted-foreground mt-3">
                    — Larry Larsen, The Laundromat Whisperer
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
