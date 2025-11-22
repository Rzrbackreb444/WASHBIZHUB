import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PartsOrderWidget } from "@/components/PartsOrderWidget";
import {
  Search,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  Video,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import serviceGuyAILogo from "@assets/service guy ai_1763780009739.png";

interface DiagnosticCode {
  id: string;
  code: string;
  manufacturer?: string;
  machineType?: string;
  title: string;
  description: string;
  possibleCauses?: string[];
  troubleshootingSteps?: string[];
  requiredParts?: string[];
  estimatedRepairTime?: number;
  skillLevel?: string;
  severity?: string;
  manualReference?: string;
  videoUrl?: string;
}

export default function RepairGuide() {
  const [searchCode, setSearchCode] = useState("");
  const [selectedCode, setSelectedCode] = useState<DiagnosticCode | null>(null);
  const [manufacturer, setManufacturer] = useState("");

  const { data: codes = [] } = useQuery<DiagnosticCode[]>({
    queryKey: ["/api/diagnostic-codes", manufacturer],
  });

  const filteredCodes = searchCode
    ? codes.filter(
        code =>
          code.code.toLowerCase().includes(searchCode.toLowerCase()) ||
          code.title.toLowerCase().includes(searchCode.toLowerCase())
      )
    : codes.slice(0, 20);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSkillBadge = (level?: string) => {
    switch (level) {
      case "professional":
        return <Badge variant="destructive" data-testid={`badge-skill-${level}`}>Professional Required</Badge>;
      case "intermediate":
        return <Badge variant="default" data-testid={`badge-skill-${level}`}>Intermediate</Badge>;
      case "basic":
        return <Badge variant="secondary" data-testid={`badge-skill-${level}`}>Basic</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Service Guy AI Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <img 
              src={serviceGuyAILogo} 
              alt="Service Guy AI - AI-Powered Repair Diagnostics honoring Guy Kremers"
              className="h-20 w-auto"
              data-testid="img-service-guy-logo"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Service Guy AI
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-3">
            2,800+ diagnostic codes with step-by-step repair instructions, safety warnings, and one-click parts ordering
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 italic">
            <AlertTriangle className="w-4 h-4" />
            <span>For educational purposes only. Always consult a certified professional technician.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search & Browse */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Error Code
                </CardTitle>
                <CardDescription>Search by code or description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter error code (e.g., E01, F12)"
                    value={searchCode}
                    onChange={e => setSearchCode(e.target.value)}
                    data-testid="input-code-search"
                  />
                </div>

                {/* Code List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredCodes.map(code => (
                    <Card
                      key={code.id}
                      className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                      onClick={() => setSelectedCode(code)}
                      data-testid={`card-code-${code.code}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                              {code.code}
                            </div>
                            {code.manufacturer && (
                              <div className="text-xs text-slate-500">{code.manufacturer}</div>
                            )}
                          </div>
                          <Badge variant={getSeverityColor(code.severity)} data-testid={`badge-severity-${code.severity}`}>
                            {code.severity || "medium"}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          {code.title}
                        </div>
                        {code.estimatedRepairTime && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {code.estimatedRepairTime} min repair
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredCodes.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No codes found. Try a different search term.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Instructions */}
          <div className="lg:col-span-2">
            {selectedCode ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="troubleshoot" data-testid="tab-troubleshoot">Troubleshoot</TabsTrigger>
                  <TabsTrigger value="parts" data-testid="tab-parts">Parts</TabsTrigger>
                  <TabsTrigger value="safety" data-testid="tab-safety">Safety</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl font-mono text-blue-600 dark:text-blue-400 mb-2">
                            Error Code: {selectedCode.code}
                          </CardTitle>
                          <CardDescription className="text-base">{selectedCode.title}</CardDescription>
                        </div>
                        {getSkillBadge(selectedCode.skillLevel)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Description
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">{selectedCode.description}</p>
                      </div>

                      {/* Machine Info */}
                      {(selectedCode.manufacturer || selectedCode.machineType) && (
                        <div className="grid grid-cols-2 gap-4">
                          {selectedCode.manufacturer && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Manufacturer</div>
                              <div className="font-medium">{selectedCode.manufacturer}</div>
                            </div>
                          )}
                          {selectedCode.machineType && (
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Machine Type</div>
                              <div className="font-medium capitalize">{selectedCode.machineType}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Possible Causes */}
                      {selectedCode.possibleCauses && selectedCode.possibleCauses.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Possible Causes
                          </h3>
                          <ul className="space-y-2">
                            {selectedCode.possibleCauses.map((cause, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span className="text-slate-600 dark:text-slate-400">{cause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Video Guide */}
                      {selectedCode.videoUrl && (
                        <Button variant="outline" className="w-full" data-testid="button-watch-video">
                          <Video className="w-4 h-4 mr-2" />
                          Watch Repair Video
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Troubleshooting Steps */}
                <TabsContent value="troubleshoot">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Step-by-Step Troubleshooting
                      </CardTitle>
                      {selectedCode.estimatedRepairTime && (
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Estimated Time: {selectedCode.estimatedRepairTime} minutes
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedCode.troubleshootingSteps && selectedCode.troubleshootingSteps.length > 0 ? (
                        <ol className="space-y-4">
                          {selectedCode.troubleshootingSteps.map((step, i) => (
                            <li key={i} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                {i + 1}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className="text-slate-700 dark:text-slate-300">{step}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-slate-500">No troubleshooting steps available for this code.</p>
                      )}

                      {selectedCode.manualReference && (
                        <Alert className="mt-6">
                          <TrendingUp className="w-4 h-4" />
                          <AlertDescription>
                            <strong>Manual Reference:</strong> {selectedCode.manualReference}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Parts Ordering */}
                <TabsContent value="parts">
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>Required Parts</CardTitle>
                      <CardDescription>Order genuine replacement parts from Amazon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedCode.requiredParts && selectedCode.requiredParts.length > 0 ? (
                        <ul className="space-y-2 mb-4">
                          {selectedCode.requiredParts.map((part, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{part}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 mb-4">No specific parts listed for this repair.</p>
                      )}

                      {/* Amazon Parts Widget */}
                      <PartsOrderWidget
                        defaultSearch={selectedCode.requiredParts?.[0] || `${selectedCode.manufacturer} ${selectedCode.machineType} parts`}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Safety Warnings */}
                <TabsContent value="safety">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                        Safety Warnings & Disclaimers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="font-semibold">
                          ELECTRICAL HAZARD: Always disconnect power before servicing equipment
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">General Safety:</h4>
                          <ul className="space-y-1 list-disc list-inside">
                            <li>Turn off and unplug machine before any repairs</li>
                            <li>Wear appropriate safety equipment (gloves, eye protection)</li>
                            <li>Use properly rated tools for electrical work</li>
                            <li>Follow manufacturer lockout/tagout procedures</li>
                            <li>Ensure proper ventilation when working with chemicals</li>
                          </ul>
                        </div>

                        {selectedCode.skillLevel === "professional" && (
                          <Alert>
                            <AlertDescription>
                              <strong>Professional Service Required:</strong> This repair requires specialized training
                              and tools. Contact a certified technician for assistance.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Important Disclaimer:</h4>
                          <p className="text-xs leading-relaxed">
                            <strong>Service Guy AI</strong> provides this information <strong>for educational purposes only</strong>. 
                            <strong> Always consult a certified professional technician</strong> before attempting any repairs. 
                            This content is not a substitute for professional service. Always refer to manufacturer documentation, 
                            safety guidelines, and local electrical codes. Repairs should only be performed by qualified, 
                            licensed technicians with proper training and equipment. WashBizHub and Service Guy AI are not 
                            responsible for damages, injuries, or warranty voidance resulting from repair attempts. 
                            <strong> When in doubt, call a professional.</strong>
                          </p>
                          <p className="text-xs mt-2 italic text-slate-500">
                            Service Guy AI honors Guy Kremers - a lifetime of service excellence.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Search className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select an Error Code
                  </h3>
                  <p className="text-slate-500">
                    Search for a diagnostic code or browse the list to view detailed repair instructions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
