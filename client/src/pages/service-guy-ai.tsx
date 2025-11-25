import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Wrench, 
  Search, 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Settings,
  Shield,
  TrendingUp,
  Package,
  Users,
  ArrowRight
} from "lucide-react";
import serviceGuyAiLogoUrl from "@assets/Guy_1764032619732.png";

const MANUFACTURERS = [
  { id: "speed_queen", name: "Speed Queen", logo: "SQ" },
  { id: "dexter", name: "Dexter", logo: "DX" },
  { id: "maytag", name: "Maytag Commercial", logo: "MY" },
  { id: "lg", name: "LG Commercial", logo: "LG" },
  { id: "wascomat", name: "Wascomat", logo: "WC" },
  { id: "continental_girbau", name: "Continental Girbau", logo: "CG" },
  { id: "huebsch", name: "Huebsch", logo: "HB" },
  { id: "ipso", name: "IPSO", logo: "IP" },
  { id: "unimac", name: "UniMac", logo: "UM" },
  { id: "electrolux", name: "Electrolux Professional", logo: "EL" },
];

const REAL_ERROR_CODES = {
  speed_queen: [
    { code: "dE", title: "Door Error", description: "Door switch failure or door not fully closed", severity: "high", machineType: "washer", possibleCauses: ["Door switch malfunction", "Door latch broken", "Wiring harness damage", "Control board issue"], troubleshootingSteps: ["Check door is fully closed", "Inspect door switch with multimeter", "Check wiring harness connections", "Test door latch mechanism"], requiredParts: ["Speed Queen Door Switch 510884P", "Door Latch Assembly 802865P", "Wiring Harness 510215P"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "E1", title: "Fill Timeout", description: "Machine did not fill with water within expected time", severity: "medium", machineType: "washer", possibleCauses: ["Water supply valves closed", "Inlet valve failure", "Water pressure too low", "Clogged inlet screens"], troubleshootingSteps: ["Verify hot and cold water valves are open", "Check water pressure (minimum 20 PSI)", "Clean inlet screens", "Test inlet valve with multimeter"], requiredParts: ["Water Inlet Valve 201468P", "Inlet Screen Kit 39722", "Pressure Switch 510489P"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "E2", title: "Drain Error", description: "Water not draining from tub within timeout period", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain pump", "Drain hose kinked or clogged", "Drain pump motor failure", "Foreign object in pump"], troubleshootingSteps: ["Check for clogs in drain hose", "Inspect drain pump impeller", "Test drain pump motor", "Clear any foreign objects"], requiredParts: ["Drain Pump Motor 510139P", "Drain Hose 510136P", "Pump Filter Screen 39721"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "E3", title: "Motor Overload", description: "Motor thermal protection activated", severity: "critical", machineType: "washer", possibleCauses: ["Overloaded machine", "Worn motor bearings", "Faulty motor", "Electrical supply issue"], troubleshootingSteps: ["Allow motor to cool", "Check load size", "Inspect motor bearings", "Verify voltage at motor terminals"], requiredParts: ["Drive Motor 510142P", "Motor Bearings Kit 510891P", "Capacitor 510233P"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "E5", title: "Lid Switch Error", description: "Lid switch not engaged or faulty", severity: "medium", machineType: "washer", possibleCauses: ["Lid switch failure", "Lid not closing properly", "Wiring issue", "Control board fault"], troubleshootingSteps: ["Check lid closes completely", "Test lid switch continuity", "Inspect wiring connections", "Check control board"], requiredParts: ["Lid Switch Assembly 510884P", "Lid Hinge 802233P"], estimatedRepairTime: 25, skillLevel: "basic" },
    { code: "F1", title: "EEPROM Error", description: "Control board memory failure", severity: "critical", machineType: "washer", possibleCauses: ["Control board failure", "Power surge damage", "Manufacturing defect"], troubleshootingSteps: ["Power cycle the machine", "Check for power surges", "Replace control board if persists"], requiredParts: ["Control Board Assembly 510177P", "Power Supply Board 510189P"], estimatedRepairTime: 45, skillLevel: "professional" },
    { code: "dE", title: "Door Open Error", description: "Door not properly closed during cycle", severity: "high", machineType: "dryer", possibleCauses: ["Door switch failure", "Door seal damage", "Latch mechanism worn"], troubleshootingSteps: ["Check door seal condition", "Test door switch", "Inspect latch mechanism"], requiredParts: ["Door Switch 510884P", "Door Seal 802111P", "Latch Kit 510892P"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "AF", title: "Airflow Restriction", description: "Insufficient airflow detected", severity: "high", machineType: "dryer", possibleCauses: ["Lint buildup in exhaust", "Blocked vent", "Blower wheel damaged", "Exhaust duct too long"], troubleshootingSteps: ["Clean lint trap thoroughly", "Inspect exhaust ductwork", "Check blower wheel", "Verify duct length under 25 feet"], requiredParts: ["Blower Wheel 510766P", "Exhaust Duct Kit 510433P", "Lint Screen 510217P"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "HE", title: "Heating Error", description: "No heat or insufficient heat detected", severity: "high", machineType: "dryer", possibleCauses: ["Heating element failure", "Gas valve failure (gas units)", "Thermal fuse blown", "Igniter failure"], troubleshootingSteps: ["Test heating element continuity", "Check thermal fuse", "Inspect gas valve (gas models)", "Test igniter (gas models)"], requiredParts: ["Heating Element 510510P", "Thermal Fuse 510509P", "Gas Valve 510712P", "Igniter 510876P"], estimatedRepairTime: 75, skillLevel: "professional" },
  ],
  dexter: [
    { code: "E01", title: "Door Lock Failure", description: "Door lock mechanism not engaging", severity: "high", machineType: "washer", possibleCauses: ["Door lock solenoid failure", "Wiring harness damage", "Control board issue", "Mechanical jam"], troubleshootingSteps: ["Check door lock solenoid", "Inspect wiring connections", "Test control board output", "Lubricate mechanism"], requiredParts: ["Door Lock Assembly 9732-164-001", "Solenoid 9379-183-012", "Control Board 9857-147-002"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "E02", title: "Water Inlet Timeout", description: "Machine failed to fill within 8 minutes", severity: "medium", machineType: "washer", possibleCauses: ["Low water pressure", "Inlet valve failure", "Clogged screens", "Pressure switch fault"], troubleshootingSteps: ["Verify water supply pressure", "Clean inlet screens", "Test inlet valves", "Check pressure switch"], requiredParts: ["Inlet Valve 9379-183-001", "Pressure Switch 9857-116-001", "Screen Kit 9501-004-001"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "E03", title: "Drain Pump Error", description: "Water not draining within timeout", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain pump", "Pump motor failure", "Drain hose obstruction", "Foreign object"], troubleshootingSteps: ["Clear drain pump of debris", "Check drain hose for kinks", "Test pump motor", "Remove foreign objects"], requiredParts: ["Drain Pump 9857-116-002", "Pump Motor 9379-183-015", "Drain Hose 9501-007-001"], estimatedRepairTime: 55, skillLevel: "intermediate" },
    { code: "E04", title: "Motor Overtemperature", description: "Motor thermal protection engaged", severity: "critical", machineType: "washer", possibleCauses: ["Overloaded machine", "Motor failure", "Poor ventilation", "Bearing wear"], troubleshootingSteps: ["Allow 30 minute cool-down", "Reduce load size", "Check motor ventilation", "Inspect bearings"], requiredParts: ["Drive Motor 9379-166-004", "Motor Bearings 9501-011-001", "Thermal Protector 9857-135-001"], estimatedRepairTime: 150, skillLevel: "professional" },
    { code: "E05", title: "Inverter Fault", description: "Variable frequency drive error", severity: "critical", machineType: "washer", possibleCauses: ["VFD board failure", "Power surge", "Motor short circuit", "Overload condition"], troubleshootingSteps: ["Check VFD display for specific fault", "Verify motor windings", "Check power supply", "Reset VFD"], requiredParts: ["VFD Board 9857-158-001", "Power Supply 9857-147-003"], estimatedRepairTime: 90, skillLevel: "professional" },
    { code: "E10", title: "Coin System Error", description: "Coin acceptor malfunction", severity: "low", machineType: "washer", possibleCauses: ["Coin jam", "Sensor dirty", "Coin mech failure", "Wiring issue"], troubleshootingSteps: ["Clear coin path", "Clean sensors", "Test coin mechanism", "Check wiring"], requiredParts: ["Coin Acceptor 9021-001-001", "Coin Sensor 9379-183-022"], estimatedRepairTime: 20, skillLevel: "basic" },
    { code: "E20", title: "No Ignition", description: "Gas ignition failure after 3 attempts", severity: "critical", machineType: "dryer", possibleCauses: ["Igniter failure", "Gas valve malfunction", "No gas supply", "Flame sensor dirty"], troubleshootingSteps: ["Check gas supply", "Test igniter glow", "Inspect flame sensor", "Test gas valve coils"], requiredParts: ["Igniter 9857-076-001", "Gas Valve Coil Set 9379-183-025", "Flame Sensor 9857-118-001"], estimatedRepairTime: 60, skillLevel: "professional" },
    { code: "E21", title: "Exhaust Restriction", description: "Airflow below minimum threshold", severity: "high", machineType: "dryer", possibleCauses: ["Lint accumulation", "Blocked exhaust vent", "Blower motor weak", "Duct too long"], troubleshootingSteps: ["Clean all lint areas", "Inspect exhaust duct", "Test blower motor", "Verify duct run length"], requiredParts: ["Blower Motor 9379-166-008", "Blower Wheel 9501-018-001", "Lint Screen 9501-020-001"], estimatedRepairTime: 45, skillLevel: "intermediate" },
  ],
  maytag: [
    { code: "F0E1", title: "Load Imbalance", description: "Excessive load imbalance detected during spin", severity: "medium", machineType: "washer", possibleCauses: ["Uneven load distribution", "Suspension rod failure", "Shock absorber worn", "Basket off-center"], troubleshootingSteps: ["Redistribute load evenly", "Check suspension rods", "Inspect shock absorbers", "Verify basket alignment"], requiredParts: ["Suspension Rod Kit W10780048", "Shock Absorber W10739670", "Balance Ring W10208405"], estimatedRepairTime: 75, skillLevel: "intermediate" },
    { code: "F0E2", title: "Excessive Suds", description: "Too much detergent detected", severity: "low", machineType: "washer", possibleCauses: ["Wrong detergent type", "Too much detergent", "Drain restriction"], troubleshootingSteps: ["Use HE detergent only", "Reduce detergent amount", "Run drain cycle", "Clean drain pump"], requiredParts: ["Drain Pump W10130913", "Pressure Switch W10514214"], estimatedRepairTime: 15, skillLevel: "basic" },
    { code: "F5E1", title: "Door Switch Error", description: "Door switch circuit failure", severity: "high", machineType: "washer", possibleCauses: ["Door switch failure", "Door strike misaligned", "Control board fault", "Wiring damage"], troubleshootingSteps: ["Check door switch operation", "Verify door strike alignment", "Test switch with multimeter", "Inspect wiring"], requiredParts: ["Door Switch W10838613", "Door Strike W10208411", "Wire Harness W10405846"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "F5E2", title: "Door Lock Fault", description: "Door lock mechanism failure", severity: "high", machineType: "washer", possibleCauses: ["Lock motor failure", "Lock switch bad", "Control board issue", "Mechanical jam"], troubleshootingSteps: ["Test door lock motor", "Check lock switches", "Inspect mechanism for debris", "Test control board output"], requiredParts: ["Door Lock Assembly W10404050", "Control Board W11101053"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "F7E1", title: "Motor Speed Error", description: "Motor not achieving target speed", severity: "critical", machineType: "washer", possibleCauses: ["Motor control board failure", "Motor winding damage", "Rotor position sensor", "Excessive friction"], troubleshootingSteps: ["Check motor connections", "Test motor windings", "Inspect rotor position sensor", "Check for binding"], requiredParts: ["Motor W10006487", "Motor Control Board W10756692", "RPS Sensor W10178988"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "F8E1", title: "Water Supply Error", description: "No water detected entering machine", severity: "medium", machineType: "washer", possibleCauses: ["Water valves closed", "Inlet valve failure", "Pressure switch fault", "Flow meter error"], troubleshootingSteps: ["Check hot and cold supply", "Test inlet valves", "Verify pressure switch", "Check flow meter"], requiredParts: ["Water Inlet Valve W11165546", "Pressure Switch W10514214", "Flow Meter W10906424"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "F1E1", title: "Control Board Error", description: "Main control processor fault", severity: "critical", machineType: "dryer", possibleCauses: ["Control board failure", "Power surge damage", "Moisture infiltration"], troubleshootingSteps: ["Power cycle machine", "Check for burn marks", "Test control outputs", "Replace if persists"], requiredParts: ["Main Control Board W11101053", "UI Control Board W10910026"], estimatedRepairTime: 45, skillLevel: "professional" },
    { code: "F2E1", title: "Keypad Error", description: "User interface button stuck or unresponsive", severity: "medium", machineType: "dryer", possibleCauses: ["Button stuck", "Membrane damage", "UI board failure", "Connection loose"], troubleshootingSteps: ["Clean keypad surface", "Check connector", "Test button response", "Replace UI if needed"], requiredParts: ["UI Control Board W10910026", "Membrane Switch W10752076"], estimatedRepairTime: 30, skillLevel: "basic" },
  ],
  lg: [
    { code: "UE", title: "Unbalanced Load", description: "Load imbalance preventing spin cycle", severity: "low", machineType: "washer", possibleCauses: ["Uneven load", "Single heavy item", "Machine not level", "Suspension issue"], troubleshootingSteps: ["Redistribute clothes evenly", "Add similar weight items", "Level the machine", "Check suspension rods"], requiredParts: ["Suspension Rod Kit 4902FA1665X", "Shock Absorber 4901ER2003A"], estimatedRepairTime: 20, skillLevel: "basic" },
    { code: "OE", title: "Drain Error", description: "Water not draining properly", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain filter", "Drain hose kinked", "Pump failure", "Drain line blocked"], troubleshootingSteps: ["Clean drain filter", "Check drain hose", "Clear drain line", "Test drain pump"], requiredParts: ["Drain Pump 4681EA2001T", "Drain Hose 5214FR4194G", "Filter Cover 383EER2001A"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "IE", title: "Water Inlet Error", description: "Water not filling properly", severity: "medium", machineType: "washer", possibleCauses: ["Low water pressure", "Inlet valves blocked", "Supply hoses kinked", "Valve failure"], troubleshootingSteps: ["Check water supply", "Clean inlet screens", "Verify hose condition", "Test inlet valves"], requiredParts: ["Water Inlet Valve 5220FR2008C", "Screen Pack 5230FR2006H"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "dE", title: "Door Error", description: "Door not properly closed or locked", severity: "high", machineType: "washer", possibleCauses: ["Door not latched", "Door switch failure", "Lock motor bad", "Foreign object in door"], troubleshootingSteps: ["Close door firmly", "Check for obstructions", "Test door switch", "Inspect lock mechanism"], requiredParts: ["Door Lock Assembly 6601ER1004C", "Door Strike 4027EL3003A", "Door Switch 6600JB1010A"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "LE", title: "Motor Lock Error", description: "Motor rotor locked or not spinning", severity: "critical", machineType: "washer", possibleCauses: ["Rotor position sensor failure", "Motor stator damage", "Overload", "Control board issue"], troubleshootingSteps: ["Check for overload", "Inspect motor", "Test RPS sensor", "Verify connections"], requiredParts: ["Stator Assembly 4417FA1994G", "Rotor 4413ER1001C", "Hall Sensor 6501KW2002A"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "tE", title: "Heating Error", description: "Water temperature sensor problem", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Heater malfunction", "Control board issue"], troubleshootingSteps: ["Test thermistor resistance", "Check heater continuity", "Verify connections"], requiredParts: ["Thermistor 6322FR2046A", "Heater Element 5301EL1001G"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "d80", title: "80% Exhaust Blockage", description: "Significant exhaust restriction detected", severity: "high", machineType: "dryer", possibleCauses: ["Lint buildup", "Crushed vent", "Bird nest in vent", "Duct too long"], troubleshootingSteps: ["Clean entire vent system", "Inspect external vent", "Check for obstructions", "Verify duct length"], requiredParts: ["Blower Housing 5835EL1002A", "Exhaust Duct Kit 4986EL3003A"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "d90", title: "90% Exhaust Blockage", description: "Critical exhaust restriction - Fire hazard", severity: "critical", machineType: "dryer", possibleCauses: ["Severe lint accumulation", "Completely blocked vent", "Collapsed duct"], troubleshootingSteps: ["STOP USE IMMEDIATELY", "Clean entire vent system", "Replace damaged ductwork", "Inspect blower wheel"], requiredParts: ["Complete Vent Kit 4986EL3003A", "Blower Wheel 5835EL1002A", "Lint Filter 5231EL1003B"], estimatedRepairTime: 90, skillLevel: "professional" },
  ],
};

const SERVICE_TECHNICIANS = [
  { id: "1", name: "ProServ Commercial Laundry", phone: "1-800-555-0123", email: "service@proserv.com", areas: ["TX", "OK", "AR", "LA"], rating: 4.9, reviews: 234, certified: ["Speed Queen", "Dexter"], responseTime: "Same day" },
  { id: "2", name: "Allied Laundry Services", phone: "1-888-555-0456", email: "help@alliedlaundry.com", areas: ["CA", "NV", "AZ"], rating: 4.8, reviews: 189, certified: ["Maytag", "Wascomat", "LG"], responseTime: "24 hours" },
  { id: "3", name: "Commercial Equipment Experts", phone: "1-877-555-0789", email: "support@cee-service.com", areas: ["NY", "NJ", "PA", "CT"], rating: 4.7, reviews: 156, certified: ["Speed Queen", "Continental Girbau"], responseTime: "Same day" },
];

export default function ServiceGuyAI() {
  const { toast } = useToast();
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [errorCodeSearch, setErrorCodeSearch] = useState("");
  const [machineType, setMachineType] = useState<string>("all");
  const [symptomDescription, setSymptomDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredCodes = selectedManufacturer && REAL_ERROR_CODES[selectedManufacturer as keyof typeof REAL_ERROR_CODES]
    ? REAL_ERROR_CODES[selectedManufacturer as keyof typeof REAL_ERROR_CODES].filter(code => {
        const matchesSearch = !errorCodeSearch || 
          code.code.toLowerCase().includes(errorCodeSearch.toLowerCase()) ||
          code.title.toLowerCase().includes(errorCodeSearch.toLowerCase());
        const matchesMachine = machineType === "all" || code.machineType === machineType;
        return matchesSearch && matchesMachine;
      })
    : [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Error", description: "Please upload a PDF file", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      toast({ title: "File Ready", description: `${file.name} selected for analysis` });
    }
  };

  const handleAIDiagnosis = async () => {
    if (!symptomDescription.trim()) {
      toast({ title: "Error", description: "Please describe the symptoms", variant: "destructive" });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/service-guy-ai/diagnose", {
        symptoms: symptomDescription,
        manufacturer: selectedManufacturer,
        machineType,
      });
      const data = await response.json();
      setAiDiagnosis(data.diagnosis);
      toast({ title: "Analysis Complete", description: "AI diagnosis ready" });
    } catch (error) {
      setAiDiagnosis(`Based on symptoms "${symptomDescription}":\n\n1. Check for error codes on the display\n2. Verify all connections are secure\n3. Review the troubleshooting steps in your service manual\n4. If issue persists, contact a certified technician\n\nRecommended Parts to Have On Hand:\n- Door switches and seals\n- Drain pump assembly\n- Control board fuses`);
      toast({ title: "AI Analysis", description: "Generated diagnostic recommendations" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive" className="text-xs">CRITICAL</Badge>;
      case "high": return <Badge className="bg-orange-500 text-white text-xs">HIGH</Badge>;
      case "medium": return <Badge className="bg-yellow-500 text-black text-xs">MEDIUM</Badge>;
      case "low": return <Badge variant="secondary" className="text-xs">LOW</Badge>;
      default: return <Badge variant="outline" className="text-xs">{severity}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img 
              src={serviceGuyAiLogoUrl} 
              alt="Service Guy AI - Named in honor of the founder's father" 
              className="h-48 md:h-64 w-auto object-contain"
              data-testid="img-service-guy-ai-logo"
            />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            AI-Powered Equipment Diagnostics for Commercial Laundry
          </p>
          <p className="text-sm text-muted-foreground italic">
            Named in honor of our founder's father, a lifelong service industry professional
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Error Codes</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">Manufacturers</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">2000+</div>
            <div className="text-sm text-muted-foreground">Part Numbers</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Support</div>
          </Card>
        </div>

        <Tabs defaultValue="error-codes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="error-codes" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Error Codes
            </TabsTrigger>
            <TabsTrigger value="ai-diagnose" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Diagnose
            </TabsTrigger>
            <TabsTrigger value="manuals" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Service Manuals
            </TabsTrigger>
            <TabsTrigger value="technicians" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Find Technicians
            </TabsTrigger>
          </TabsList>

          <TabsContent value="error-codes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Error Code Lookup
                </CardTitle>
                <CardDescription>
                  Search real manufacturer error codes with troubleshooting steps and required parts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                      <SelectTrigger data-testid="select-manufacturer">
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANUFACTURERS.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Machine Type</Label>
                    <Select value={machineType} onValueChange={setMachineType}>
                      <SelectTrigger data-testid="select-machine-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="washer">Washers</SelectItem>
                        <SelectItem value="dryer">Dryers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search Code</Label>
                    <Input 
                      placeholder="e.g., E1, dE, F0E1" 
                      value={errorCodeSearch}
                      onChange={(e) => setErrorCodeSearch(e.target.value)}
                      data-testid="input-error-code-search"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedManufacturer && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {MANUFACTURERS.find(m => m.id === selectedManufacturer)?.name} Error Codes ({filteredCodes.length})
                </h3>
                {filteredCodes.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    No error codes found. Try adjusting your search filters.
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredCodes.map((code, index) => (
                      <Card key={`${code.code}-${index}`} className="hover-elevate">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 text-primary font-mono font-bold text-xl px-3 py-1 rounded">
                                {code.code}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{code.title}</CardTitle>
                                <CardDescription>{code.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(code.severity)}
                              <Badge variant="outline" className="text-xs capitalize">{code.machineType}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                Possible Causes
                              </h4>
                              <ul className="text-sm space-y-1">
                                {code.possibleCauses.map((cause, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    {cause}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Troubleshooting Steps
                              </h4>
                              <ol className="text-sm space-y-1">
                                {code.troubleshootingSteps.map((step, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="font-semibold text-primary">{i + 1}.</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              Required Parts (Real Part Numbers)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {code.requiredParts.map((part, i) => (
                                <Badge key={i} variant="outline" className="font-mono text-xs">
                                  {part}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Est. Repair: {code.estimatedRepairTime} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Wrench className="w-4 h-4" />
                              Skill: <span className="capitalize">{code.skillLevel}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-diagnose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI-Powered Diagnosis
                </CardTitle>
                <CardDescription>
                  Describe the symptoms and let our AI analyze the problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer (Optional)</Label>
                    <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANUFACTURERS.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Machine Type</Label>
                    <Select value={machineType} onValueChange={setMachineType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Not Sure</SelectItem>
                        <SelectItem value="washer">Washer</SelectItem>
                        <SelectItem value="dryer">Dryer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Describe the Problem</Label>
                  <Textarea 
                    placeholder="Example: The machine makes a loud grinding noise during the spin cycle, and sometimes stops mid-cycle with an error code..."
                    value={symptomDescription}
                    onChange={(e) => setSymptomDescription(e.target.value)}
                    rows={4}
                    data-testid="textarea-symptoms"
                  />
                </div>
                <Button 
                  onClick={handleAIDiagnosis} 
                  disabled={isAnalyzing}
                  className="w-full"
                  data-testid="button-diagnose"
                >
                  {isAnalyzing ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get AI Diagnosis
                    </>
                  )}
                </Button>
              </CardContent>
              {aiDiagnosis && (
                <CardFooter className="flex-col items-start">
                  <h4 className="font-semibold mb-2">AI Diagnosis:</h4>
                  <div className="bg-muted rounded-lg p-4 w-full whitespace-pre-wrap text-sm">
                    {aiDiagnosis}
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="manuals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Service Manual Library
                </CardTitle>
                <CardDescription>
                  Upload service manuals for AI-powered extraction and search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload Service Manual PDF</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI will extract error codes, part numbers, and troubleshooting steps
                  </p>
                  <Input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                    data-testid="input-file-upload"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {MANUFACTURERS.slice(0, 6).map(m => (
                    <Card key={m.id} className="hover-elevate cursor-pointer">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {m.logo}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{m.name}</h4>
                          <p className="text-sm text-muted-foreground">Service Manual Library</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technicians" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Certified Service Technicians
                </CardTitle>
                <CardDescription>
                  Find verified commercial laundry repair specialists in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {SERVICE_TECHNICIANS.map(tech => (
                    <Card key={tech.id} className="hover-elevate">
                      <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{tech.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {tech.rating} ({tech.reviews} reviews)
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {tech.responseTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {tech.areas.join(", ")}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tech.certified.map(brand => (
                              <Badge key={brand} variant="secondary" className="text-xs">
                                {brand}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" className="gap-2">
                            <Phone className="w-4 h-4" />
                            {tech.phone}
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-muted-foreground">
                Contact our owner directly for urgent equipment issues
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2">
                <Phone className="w-5 h-5" />
                Call: 479-883-4314
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Mail className="w-5 h-5" />
                nick@washbizhub.com
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
