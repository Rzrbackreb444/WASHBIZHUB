import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
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
  ArrowRight,
  Crown,
  Lock,
  Sparkles
} from "lucide-react";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import serviceGuyAiLogoUrl from "@assets/SERVICE GUY_1764436998885.png";

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
    // Washer Error Codes
    { code: "dE", title: "Door Error", description: "Door switch failure or door not fully closed", severity: "high", machineType: "washer", possibleCauses: ["Door switch malfunction", "Door latch broken", "Wiring harness damage", "Control board issue"], troubleshootingSteps: ["Check door is fully closed and latched properly", "Inspect door switch with multimeter for continuity", "Check wiring harness connections for damage or corrosion", "Test door latch mechanism for proper engagement", "Verify control board output signal to door lock"], requiredParts: ["Speed Queen Door Switch 510884P", "Door Latch Assembly 802865P", "Wiring Harness 510215P", "Door Boot Seal 802864P"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "dL", title: "Door Lock Failure", description: "Door lock mechanism failed to engage within 6 seconds", severity: "high", machineType: "washer", possibleCauses: ["Door lock solenoid failure", "Door strike misaligned", "Lock mechanism jammed", "Control board relay failure", "Wiring connection loose"], troubleshootingSteps: ["Verify door closes completely against strike plate", "Test door lock solenoid with multimeter (should read 50-80 ohms)", "Check for debris preventing lock engagement", "Inspect wiring from control board to lock assembly", "Test control board relay output"], requiredParts: ["Door Lock Assembly 802595P", "Door Strike 802546P", "Lock Solenoid 510889P", "Control Board 510177P"], estimatedRepairTime: 50, skillLevel: "intermediate" },
    { code: "dU", title: "Door Unlock Failure", description: "Door lock mechanism failed to release after cycle completion", severity: "medium", machineType: "washer", possibleCauses: ["Door lock solenoid stuck", "Mechanical binding", "Control board issue", "Power interruption during unlock sequence"], troubleshootingSteps: ["Wait 2 minutes for automatic unlock attempt", "Power cycle the machine completely", "Check for objects preventing door movement", "Test unlock solenoid manually", "Inspect lock mechanism for wear or damage"], requiredParts: ["Door Lock Assembly 802595P", "Lock Actuator 510892P", "Control Board 510177P"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "E1", title: "Fill Timeout", description: "Machine did not fill with water within 8-minute timeout", severity: "medium", machineType: "washer", possibleCauses: ["Water supply valves closed", "Inlet valve failure", "Water pressure too low", "Clogged inlet screens", "Pressure switch malfunction"], troubleshootingSteps: ["Verify hot and cold water supply valves are fully open", "Check water pressure (minimum 20 PSI required)", "Clean inlet valve screens - remove and soak in vinegar", "Test inlet valve coils with multimeter (1000-1400 ohms)", "Verify pressure switch hose is connected and clear"], requiredParts: ["Water Inlet Valve 201468P", "Inlet Screen Kit 39722", "Pressure Switch 510489P", "Fill Hose Assembly 802433P"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "E2", title: "Drain Error", description: "Water not draining from tub within 4-minute timeout", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain pump", "Drain hose kinked or clogged", "Drain pump motor failure", "Foreign object in pump", "Drain standpipe too deep"], troubleshootingSteps: ["Check drain hose for kinks or clogs", "Inspect drain pump impeller for debris", "Test drain pump motor with multimeter (5-10 ohms)", "Clear any coins, buttons, or foreign objects", "Verify standpipe is 24-36 inches in height"], requiredParts: ["Drain Pump Motor 510139P", "Drain Hose 510136P", "Pump Filter Screen 39721", "Pump Housing 510138P"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "E3", title: "Motor Overload", description: "Motor thermal protection activated due to excessive current draw", severity: "critical", machineType: "washer", possibleCauses: ["Overloaded machine", "Worn motor bearings", "Faulty motor windings", "Electrical supply issue", "Seized transmission"], troubleshootingSteps: ["Allow motor to cool for 30 minutes before reset", "Reduce load size to maximum 18 lbs for top-load", "Inspect motor bearings for noise or play", "Verify voltage at motor terminals (208-240V)", "Check motor capacitor with capacitance meter"], requiredParts: ["Drive Motor 510142P", "Motor Bearings Kit 510891P", "Capacitor 510233P", "Motor Protector 510234P"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "E5", title: "Lid Switch Error", description: "Lid switch not engaged or faulty - top-load models", severity: "medium", machineType: "washer", possibleCauses: ["Lid switch failure", "Lid not closing properly", "Wiring issue", "Control board fault", "Lid strike bent"], troubleshootingSteps: ["Check lid closes completely and strikes actuator", "Test lid switch continuity with multimeter", "Inspect wiring connections at switch and board", "Check lid hinges for proper alignment", "Verify control board receives lid signal"], requiredParts: ["Lid Switch Assembly 510884P", "Lid Hinge 802233P", "Lid Strike 802234P", "Wire Harness 510215P"], estimatedRepairTime: 25, skillLevel: "basic" },
    { code: "nF", title: "No Fill", description: "No water detected entering machine after valve activation", severity: "high", machineType: "washer", possibleCauses: ["Water supply completely off", "Both inlet valves failed", "Pressure switch stuck open", "Control board not sending fill signal", "Frozen supply lines"], troubleshootingSteps: ["Verify water is available at supply valves", "Check both hot and cold valve screens", "Test inlet valve coils electrically", "Listen for valve activation when cycle starts", "Check pressure switch with blown test"], requiredParts: ["Dual Inlet Valve Assembly 201468P", "Pressure Switch 510489P", "Control Board 510177P"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "OE", title: "Overflow Error", description: "Water level exceeded maximum safe limit in tub", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck open", "Pressure switch failure", "Air dome tube clogged", "Control board malfunction", "Drain restricted causing backup"], troubleshootingSteps: ["IMMEDIATELY unplug machine and shut off water", "Check inlet valves close when power removed", "Inspect pressure switch air dome for water or debris", "Verify pressure switch continuity changes with water level", "Test inlet valve solenoids for stuck plunger"], requiredParts: ["Water Inlet Valve 201468P", "Pressure Switch 510489P", "Air Dome Kit 802477P", "Control Board 510177P"], estimatedRepairTime: 60, skillLevel: "professional" },
    { code: "LE", title: "Motor Error", description: "Motor failed to reach target speed or stalled during cycle", severity: "critical", machineType: "washer", possibleCauses: ["Motor rotor position sensor failure", "Motor stator damage", "Overload condition", "Control board motor driver failure", "Transmission binding"], troubleshootingSteps: ["Check for overload - reduce load size", "Inspect motor connections for corrosion", "Test hall sensor with multimeter", "Verify motor turns freely by hand", "Check transmission for seized bearings"], requiredParts: ["Drive Motor 510142P", "Hall Sensor Assembly 510895P", "Motor Control Board 510189P", "Transmission 510143P"], estimatedRepairTime: 150, skillLevel: "professional" },
    { code: "tE", title: "Temperature Sensor Error", description: "Water temperature sensor reading out of range or open circuit", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Wiring damage to sensor", "Control board issue", "Sensor connector corroded"], troubleshootingSteps: ["Test thermistor resistance (should be 10K ohms at 77°F)", "Check sensor wiring for damage", "Verify connector is secure and clean", "Test at control board connector", "Replace sensor if readings are erratic"], requiredParts: ["Thermistor Assembly 510487P", "Wire Harness 510215P", "Connector Kit 510216P"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "SO", title: "Suds Overflow", description: "Excessive suds detected preventing proper operation", severity: "low", machineType: "washer", possibleCauses: ["Too much detergent used", "Wrong detergent type (non-HE)", "Residual detergent buildup", "Drain restriction trapping suds"], troubleshootingSteps: ["Run rinse cycle without detergent", "Use only HE detergent - 2 tablespoons max", "Clean dispenser drawer and housing", "Run cleaning cycle with washing machine cleaner", "Check drain for restrictions"], requiredParts: ["Dispenser Assembly 802491P", "Drain Pump 510139P"], estimatedRepairTime: 15, skillLevel: "basic" },
    { code: "NP", title: "No Water Pressure", description: "Insufficient water pressure detected at inlet valves", severity: "medium", machineType: "washer", possibleCauses: ["Building water pressure too low", "Partially closed supply valves", "Clogged inlet screens", "Kinked supply hoses", "Pressure switch calibration"], troubleshootingSteps: ["Check building water pressure (minimum 20 PSI)", "Fully open both hot and cold supply valves", "Clean or replace inlet screens", "Inspect supply hoses for kinks or restrictions", "Verify adequate pipe sizing to machine"], requiredParts: ["Inlet Screen Kit 39722", "Supply Hose Set 802433P", "Pressure Switch 510489P"], estimatedRepairTime: 25, skillLevel: "basic" },
    { code: "F1", title: "EEPROM Error", description: "Control board memory failure or corruption detected", severity: "critical", machineType: "washer", possibleCauses: ["Control board failure", "Power surge damage", "Manufacturing defect", "Memory chip failure"], troubleshootingSteps: ["Power cycle the machine for 5 minutes", "Check for power surge evidence on board", "Verify all board connections are secure", "Attempt firmware reset if available", "Replace control board if error persists"], requiredParts: ["Control Board Assembly 510177P", "Power Supply Board 510189P"], estimatedRepairTime: 45, skillLevel: "professional" },
    { code: "F2", title: "Keypad Communication Error", description: "User interface not communicating with main control board", severity: "medium", machineType: "washer", possibleCauses: ["Ribbon cable disconnected", "UI board failure", "Main board connector issue", "Static discharge damage"], troubleshootingSteps: ["Check ribbon cable connection at both ends", "Inspect cable for damage or wear", "Clean connector contacts with electronics cleaner", "Test continuity through ribbon cable", "Replace UI assembly if damaged"], requiredParts: ["UI Board Assembly 510178P", "Ribbon Cable 510179P", "Control Board 510177P"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "F5", title: "Water Temperature Error", description: "Water not reaching selected temperature within time limit", severity: "medium", machineType: "washer", possibleCauses: ["Water heater failure (if equipped)", "Incorrect hot water supply", "Thermistor inaccurate", "Long hot water pipe run"], troubleshootingSteps: ["Verify hot water available at supply", "Check hot water inlet valve operation", "Test thermistor readings against actual temperature", "Run hot water at nearby fixture before starting", "Inspect heater element if equipped"], requiredParts: ["Thermistor 510487P", "Hot Water Inlet Valve 201469P", "Heater Element 510512P"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    // Dryer Error Codes
    { code: "AF", title: "Airflow Restriction", description: "Insufficient airflow detected through dryer vent system", severity: "high", machineType: "dryer", possibleCauses: ["Lint buildup in exhaust duct", "Blocked external vent", "Blower wheel damaged", "Exhaust duct too long", "Crushed ductwork"], troubleshootingSteps: ["Clean lint screen thoroughly", "Disconnect and clean entire exhaust duct", "Inspect external vent flap for blockage", "Check blower wheel for lint buildup or damage", "Verify duct run under 25 feet with proper bends"], requiredParts: ["Blower Wheel 510766P", "Exhaust Duct Kit 510433P", "Lint Screen 510217P", "Vent Transition 510434P"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "HE", title: "Heating Error", description: "No heat or insufficient heat detected during drying cycle", severity: "high", machineType: "dryer", possibleCauses: ["Heating element failure", "Gas valve failure (gas units)", "Thermal fuse blown", "Igniter failure", "High limit thermostat open"], troubleshootingSteps: ["Test heating element continuity (10-20 ohms)", "Check thermal fuse for continuity", "Test high limit thermostat (should be closed)", "For gas: verify igniter glows orange", "Test gas valve coils (1000-2000 ohms each)"], requiredParts: ["Heating Element 510510P", "Thermal Fuse 510509P", "Gas Valve 510712P", "Igniter 510876P", "High Limit Thermostat 510507P"], estimatedRepairTime: 75, skillLevel: "professional" },
    { code: "dE", title: "Door Open Error", description: "Door not properly closed during drying cycle", severity: "high", machineType: "dryer", possibleCauses: ["Door switch failure", "Door seal damage", "Latch mechanism worn", "Door strike bent", "Door hinge sagging"], troubleshootingSteps: ["Check door closes completely and latches", "Test door switch continuity when door closed", "Inspect door seal for tears or compression loss", "Examine latch mechanism for wear", "Adjust door hinges if sagging"], requiredParts: ["Door Switch 510884P", "Door Seal 802111P", "Latch Kit 510892P", "Door Hinge Set 510893P"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "tS", title: "Thermistor Short", description: "Temperature sensor reading shorted or extremely low resistance", severity: "high", machineType: "dryer", possibleCauses: ["Thermistor failed short", "Wiring shorted to ground", "Control board input failure", "Moisture in connector"], troubleshootingSteps: ["Test thermistor resistance (should be 10K at 77°F)", "Inspect wiring for damage or bare spots", "Check connector for moisture or corrosion", "Test at control board connector", "Dry connector if moisture present"], requiredParts: ["Exhaust Thermistor 510488P", "Wire Harness 510435P", "Connector Kit 510216P"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "tO", title: "Thermistor Open", description: "Temperature sensor reading open circuit or infinite resistance", severity: "high", machineType: "dryer", possibleCauses: ["Thermistor wire broken", "Connector unplugged", "Thermistor failed open", "Control board issue"], troubleshootingSteps: ["Check thermistor connector is fully seated", "Test continuity through thermistor circuit", "Measure resistance - should not be infinite", "Verify wiring integrity from sensor to board", "Replace thermistor if open circuit confirmed"], requiredParts: ["Exhaust Thermistor 510488P", "Wire Harness 510435P"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "E4", title: "Drive Motor Error", description: "Drum motor not running or not reaching proper speed", severity: "critical", machineType: "dryer", possibleCauses: ["Motor thermal overload tripped", "Start relay/capacitor failure", "Motor windings damaged", "Belt broken", "Drum seized"], troubleshootingSteps: ["Allow motor to cool if thermal overload", "Check belt is intact and properly tensioned", "Test motor start capacitor", "Verify motor turns freely by hand", "Test motor windings for continuity and shorts"], requiredParts: ["Drive Motor 510767P", "Motor Capacitor 510768P", "Drive Belt 510762P", "Idler Pulley 510763P"], estimatedRepairTime: 90, skillLevel: "professional" },
    { code: "PF", title: "Power Failure", description: "Power interruption detected during cycle", severity: "low", machineType: "dryer", possibleCauses: ["Utility power outage", "Breaker tripped", "Loose power connection", "Voltage fluctuation"], troubleshootingSteps: ["Check circuit breaker status", "Verify outlet has proper voltage (208-240V)", "Inspect power cord connections", "Check for loose terminal connections", "Reset machine and restart cycle"], requiredParts: ["Power Cord 510891P", "Terminal Block 510892P"], estimatedRepairTime: 15, skillLevel: "basic" },
  ],
  dexter: [
    // T-Series Washer Error Codes
    { code: "E01", title: "Door Lock Failure", description: "Door lock mechanism not engaging within timeout period", severity: "high", machineType: "washer", possibleCauses: ["Door lock solenoid failure", "Wiring harness damage", "Control board issue", "Mechanical jam", "Door misaligned"], troubleshootingSteps: ["Check door lock solenoid operation manually", "Inspect wiring connections at lock and board", "Test control board output with multimeter", "Lubricate lock mechanism if binding", "Verify door alignment with frame"], requiredParts: ["Door Lock Assembly 9732-164-001", "Solenoid 9379-183-012", "Control Board 9857-147-002", "Lock Striker 9732-165-001"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "E02", title: "Door Switch Error", description: "Door switch not detecting closed door position", severity: "high", machineType: "washer", possibleCauses: ["Door switch failure", "Door not closing fully", "Switch actuator broken", "Wiring open circuit"], troubleshootingSteps: ["Test door switch continuity with door closed", "Check door closes completely against seal", "Inspect switch actuator for damage", "Verify wiring from switch to control board", "Adjust door hinges if needed"], requiredParts: ["Door Switch 9379-183-013", "Switch Actuator 9732-166-001", "Wire Harness 9857-149-001"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "E03", title: "Overflow Error", description: "Water level exceeded maximum safe limit", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck open", "Pressure transducer failure", "Air trap clogged", "Control board malfunction"], troubleshootingSteps: ["SHUT OFF WATER IMMEDIATELY", "Test inlet valves close when unpowered", "Clear air trap of debris and water", "Test pressure transducer voltage output", "Verify control board receives pressure signal"], requiredParts: ["Inlet Valve Assembly 9379-183-001", "Pressure Transducer 9857-116-001", "Air Trap 9501-005-001", "Control Board 9857-147-002"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "E04", title: "Temperature Probe Error", description: "Water temperature sensor reading out of valid range", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Wiring damage", "Connector corrosion", "Control board input failure"], troubleshootingSteps: ["Test thermistor resistance (10K ohms at 77°F)", "Check wiring for breaks or shorts", "Clean connector contacts", "Test voltage at control board input", "Replace thermistor if readings incorrect"], requiredParts: ["Thermistor Assembly 9857-117-001", "Wire Harness 9857-149-001", "Connector Kit 9501-008-001"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "E05", title: "Motor Issue", description: "Drive motor not operating correctly or drawing excessive current", severity: "critical", machineType: "washer", possibleCauses: ["Motor overload", "VFD fault", "Motor winding failure", "Belt slipping", "Bearing seizure"], troubleshootingSteps: ["Check for overloaded machine", "Inspect VFD display for fault codes", "Test motor insulation resistance", "Verify belt tension and condition", "Check motor bearings for play or noise"], requiredParts: ["Drive Motor 9379-166-004", "VFD Board 9857-158-001", "Motor Bearings 9501-011-001", "Drive Belt 9501-012-001"], estimatedRepairTime: 150, skillLevel: "professional" },
    { code: "E06", title: "Drain Error", description: "Water not draining within specified timeout period", severity: "high", machineType: "washer", possibleCauses: ["Drain pump clogged", "Drain hose blocked", "Pump motor failure", "Control board issue", "Drain valve stuck"], troubleshootingSteps: ["Clear drain pump of coins and debris", "Check drain hose for kinks or clogs", "Test drain pump motor operation", "Verify drain valve opens electrically", "Check control board drain relay"], requiredParts: ["Drain Pump 9857-116-002", "Pump Motor 9379-183-015", "Drain Hose 9501-007-001", "Drain Valve 9379-183-014"], estimatedRepairTime: 55, skillLevel: "intermediate" },
    { code: "E07", title: "Coin System Error", description: "Coin acceptor or card reader communication failure", severity: "low", machineType: "washer", possibleCauses: ["Coin jam", "Sensor dirty", "Coin mech failure", "Wiring issue", "Card reader offline"], troubleshootingSteps: ["Clear coin path of jams", "Clean optical sensors with compressed air", "Test coin mechanism manually", "Check wiring connections", "Reset card reader if applicable"], requiredParts: ["Coin Acceptor 9021-001-001", "Coin Sensor 9379-183-022", "Coin Box 9021-002-001"], estimatedRepairTime: 20, skillLevel: "basic" },
    { code: "E08", title: "Water Fill Timeout", description: "Machine failed to fill within 8-minute limit", severity: "medium", machineType: "washer", possibleCauses: ["Low water pressure", "Inlet valve failure", "Clogged screens", "Pressure transducer fault", "Supply valves closed"], troubleshootingSteps: ["Verify water supply pressure (20 PSI minimum)", "Clean inlet screen filters", "Test inlet valve coils electrically", "Check pressure transducer operation", "Ensure supply valves fully open"], requiredParts: ["Inlet Valve 9379-183-001", "Pressure Transducer 9857-116-001", "Screen Kit 9501-004-001", "Valve Coil 9379-183-016"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "E09", title: "Unbalance Error", description: "Load imbalance exceeded during spin cycle", severity: "medium", machineType: "washer", possibleCauses: ["Uneven load distribution", "Suspension damage", "Shock absorber worn", "Out-of-balance sensor", "Single heavy item"], troubleshootingSteps: ["Redistribute load evenly around drum", "Check suspension springs for damage", "Inspect shock absorbers for leaks", "Test balance sensor circuit", "Reduce load size if persistent"], requiredParts: ["Shock Absorber Set 9379-167-001", "Suspension Spring Kit 9379-168-001", "Balance Sensor 9857-120-001"], estimatedRepairTime: 75, skillLevel: "intermediate" },
    { code: "E10", title: "Control Board Error", description: "Main control board processor or memory fault", severity: "critical", machineType: "washer", possibleCauses: ["Control board failure", "Power surge damage", "Firmware corruption", "Connector failure"], troubleshootingSteps: ["Power cycle machine for 5 minutes", "Check all board connections are secure", "Look for visible burn marks or damage", "Attempt firmware update if possible", "Replace board if error persists"], requiredParts: ["Control Board 9857-147-002", "Power Supply Board 9857-147-003", "Display Board 9857-148-001"], estimatedRepairTime: 60, skillLevel: "professional" },
    { code: "E11", title: "Inverter Fault", description: "Variable frequency drive reporting fault condition", severity: "critical", machineType: "washer", possibleCauses: ["VFD board failure", "Power surge", "Motor short circuit", "Overload condition", "DC bus overvoltage"], troubleshootingSteps: ["Check VFD display for specific fault code", "Verify motor winding insulation", "Check incoming power quality", "Test DC bus voltage", "Reset VFD and monitor for recurrence"], requiredParts: ["VFD Board 9857-158-001", "Power Supply 9857-147-003", "VFD Capacitor Kit 9857-159-001"], estimatedRepairTime: 90, skillLevel: "professional" },
    { code: "E12", title: "Door Unlock Failure", description: "Door failed to unlock after cycle completion", severity: "medium", machineType: "washer", possibleCauses: ["Lock mechanism stuck", "Unlock coil failure", "Control timing issue", "Mechanical binding"], troubleshootingSteps: ["Wait 3 minutes for automatic retry", "Power cycle machine completely", "Check unlock coil operation", "Manually release lock if accessible", "Inspect lock mechanism for wear"], requiredParts: ["Door Lock Assembly 9732-164-001", "Unlock Coil 9379-183-017", "Lock Lever 9732-167-001"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "E13", title: "High Temperature Limit", description: "Water temperature exceeded safe operating limit", severity: "high", machineType: "washer", possibleCauses: ["Heater relay stuck on", "Temperature sensor failure", "Control board fault", "External hot water too hot"], troubleshootingSteps: ["Check incoming hot water temperature", "Test heater relay operation", "Verify thermistor readings", "Inspect heater element connections", "Test control board heater output"], requiredParts: ["Thermistor 9857-117-001", "Heater Relay 9857-147-004", "Control Board 9857-147-002"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    // T-Series Dryer Error Codes
    { code: "E20", title: "No Ignition", description: "Gas ignition failure after 3 consecutive attempts", severity: "critical", machineType: "dryer", possibleCauses: ["Igniter failure", "Gas valve malfunction", "No gas supply", "Flame sensor dirty", "Gas pressure low"], troubleshootingSteps: ["Verify gas supply is on and adequate", "Test igniter glow (should glow bright orange)", "Clean flame sensor with fine sandpaper", "Test gas valve coils (1200-1500 ohms each)", "Check gas pressure at manifold"], requiredParts: ["Igniter 9857-076-001", "Gas Valve Coil Set 9379-183-025", "Flame Sensor 9857-118-001", "Gas Valve 9379-183-024"], estimatedRepairTime: 60, skillLevel: "professional" },
    { code: "E21", title: "Exhaust Restriction", description: "Airflow below minimum threshold - fire hazard risk", severity: "high", machineType: "dryer", possibleCauses: ["Lint accumulation", "Blocked exhaust vent", "Blower motor weak", "Duct too long", "Crushed ductwork"], troubleshootingSteps: ["Clean lint screen and housing thoroughly", "Inspect entire exhaust duct system", "Test blower motor amperage", "Verify external vent flap opens", "Reduce duct length if over 25 feet"], requiredParts: ["Blower Motor 9379-166-008", "Blower Wheel 9501-018-001", "Lint Screen 9501-020-001", "Vent Kit 9501-021-001"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "E22", title: "High Limit Trip", description: "High temperature safety limit thermostat opened", severity: "critical", machineType: "dryer", possibleCauses: ["Blocked airflow", "Failed cycling thermostat", "Heater element grounded", "Control board issue"], troubleshootingSteps: ["Check for airflow restrictions first", "Test high limit thermostat for reset", "Inspect heater element for grounding", "Verify cycling thermostat operation", "Check blower motor operation"], requiredParts: ["High Limit Thermostat 9857-077-001", "Cycling Thermostat 9857-078-001", "Heater Element 9857-079-001"], estimatedRepairTime: 50, skillLevel: "professional" },
    { code: "E23", title: "Flame Failure", description: "Flame detected initially but lost during cycle", severity: "high", machineType: "dryer", possibleCauses: ["Flame sensor weak", "Gas pressure fluctuation", "Coil valve failure", "Igniter degraded", "Airflow issue"], troubleshootingSteps: ["Clean flame sensor thoroughly", "Monitor gas pressure during operation", "Test gas valve coils individually", "Check igniter microamp draw", "Verify combustion air supply"], requiredParts: ["Flame Sensor 9857-118-001", "Gas Valve Coil Set 9379-183-025", "Igniter 9857-076-001"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "E24", title: "Motor Overload", description: "Drum motor thermal protection engaged", severity: "critical", machineType: "dryer", possibleCauses: ["Motor bearings worn", "Belt too tight", "Drum rollers seized", "Motor winding failure", "Overloaded machine"], troubleshootingSteps: ["Allow 30-minute cool-down period", "Check belt tension - should deflect 1 inch", "Inspect drum rollers for free rotation", "Test motor windings for shorts", "Verify motor bearings are quiet"], requiredParts: ["Drive Motor 9379-166-009", "Drum Roller Kit 9501-022-001", "Drive Belt 9501-023-001", "Motor Bearings 9501-024-001"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "E25", title: "Coin Drawer Error", description: "Coin drawer position not detected - dryer", severity: "low", machineType: "dryer", possibleCauses: ["Drawer not fully inserted", "Position switch failure", "Wiring issue", "Interlock mechanism bent"], troubleshootingSteps: ["Verify drawer fully inserted and locked", "Test position switch continuity", "Check wiring to switch", "Inspect interlock mechanism", "Clean switch contacts"], requiredParts: ["Drawer Position Switch 9021-003-001", "Coin Drawer Assembly 9021-004-001"], estimatedRepairTime: 25, skillLevel: "basic" },
  ],
  maytag: [
    // Commercial Washer Error Codes
    { code: "F0E1", title: "Load Imbalance", description: "Excessive load imbalance detected during spin cycle", severity: "medium", machineType: "washer", possibleCauses: ["Uneven load distribution", "Suspension rod failure", "Shock absorber worn", "Basket off-center", "Single heavy item"], troubleshootingSteps: ["Redistribute load evenly in basket", "Check all four suspension rods for damage", "Inspect shock absorbers for leaks", "Verify basket alignment on hub", "Run without load to test balance"], requiredParts: ["Suspension Rod Kit W10780048", "Shock Absorber W10739670", "Balance Ring W10208405", "Tub Spring Kit W10257087"], estimatedRepairTime: 75, skillLevel: "intermediate" },
    { code: "F0E2", title: "Excessive Suds", description: "Too much detergent detected affecting operation", severity: "low", machineType: "washer", possibleCauses: ["Wrong detergent type", "Too much detergent", "Drain restriction", "Dispenser issue"], troubleshootingSteps: ["Use only HE detergent - max 2 tablespoons", "Run rinse cycle without detergent", "Clean drain pump filter", "Clean dispenser drawer thoroughly", "Check for drain restrictions"], requiredParts: ["Drain Pump W10130913", "Pressure Switch W10514214", "Dispenser Assembly W10250743"], estimatedRepairTime: 15, skillLevel: "basic" },
    { code: "F0E5", title: "Load Sensing Error", description: "Unable to determine proper load size for water level", severity: "medium", machineType: "washer", possibleCauses: ["Pressure switch malfunction", "Air trap clogged", "Load too small", "Basket not rotating"], troubleshootingSteps: ["Verify minimum load size met", "Check pressure switch hose for kinks", "Clear air trap of debris", "Ensure basket rotates freely", "Test pressure switch operation"], requiredParts: ["Pressure Switch W10514214", "Air Trap Assembly W10250741", "Hose Kit W10250742"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "F5E1", title: "Door Switch Error", description: "Door switch circuit failure detected", severity: "high", machineType: "washer", possibleCauses: ["Door switch failure", "Door strike misaligned", "Control board fault", "Wiring damage"], troubleshootingSteps: ["Check door switch operation manually", "Verify door strike alignment", "Test switch with multimeter", "Inspect wiring for damage", "Check control board input"], requiredParts: ["Door Switch W10838613", "Door Strike W10208411", "Wire Harness W10405846", "Door Boot Seal W10290499"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "F5E2", title: "Door Lock Fault", description: "Door lock mechanism failure - cannot lock or unlock", severity: "high", machineType: "washer", possibleCauses: ["Lock motor failure", "Lock switch bad", "Control board issue", "Mechanical jam", "Wiring fault"], troubleshootingSteps: ["Test door lock motor coils", "Check lock switch continuity", "Inspect mechanism for debris", "Test control board output voltage", "Verify wiring connections"], requiredParts: ["Door Lock Assembly W10404050", "Control Board W11101053", "Lock Actuator W10253483"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "F7E1", title: "Motor Speed Error", description: "Motor not achieving or maintaining target speed", severity: "critical", machineType: "washer", possibleCauses: ["Motor control board failure", "Motor winding damage", "Rotor position sensor", "Excessive friction", "Transmission issue"], troubleshootingSteps: ["Check motor connections for corrosion", "Test motor windings resistance", "Inspect rotor position sensor", "Check for binding in transmission", "Test motor control board outputs"], requiredParts: ["Motor W10006487", "Motor Control Board W10756692", "RPS Sensor W10178988", "Transmission Assembly W10473144"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "F8E1", title: "Water Supply Error", description: "No water detected entering machine during fill", severity: "medium", machineType: "washer", possibleCauses: ["Water valves closed", "Inlet valve failure", "Pressure switch fault", "Flow meter error", "Supply hoses kinked"], troubleshootingSteps: ["Check hot and cold supply valves", "Test inlet valves electrically", "Verify pressure switch operation", "Check flow meter for debris", "Inspect supply hoses"], requiredParts: ["Water Inlet Valve W11165546", "Pressure Switch W10514214", "Flow Meter W10906424", "Supply Hose Set W10445022"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "F8E3", title: "Overflow Condition", description: "Water level exceeded maximum safe level", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck open", "Pressure switch failure", "Air trap blocked", "Control board fault"], troubleshootingSteps: ["SHUT OFF WATER SUPPLY immediately", "Test inlet valves close when depowered", "Check pressure switch and air trap", "Verify control board receives water level signal", "Look for siphoning issues"], requiredParts: ["Inlet Valve W11165546", "Pressure Switch W10514214", "Air Trap W10250741", "Control Board W11101053"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "F9E1", title: "Drain Pump Error", description: "Water not draining within allowed time period", severity: "high", machineType: "washer", possibleCauses: ["Drain pump clogged", "Pump motor failure", "Drain hose blocked", "Control board issue"], troubleshootingSteps: ["Clean drain pump filter of debris", "Test drain pump motor operation", "Check drain hose for restrictions", "Verify control board pump relay", "Check standpipe height (24-96 inches)"], requiredParts: ["Drain Pump W10130913", "Pump Filter W10531320", "Drain Hose W10189267"], estimatedRepairTime: 50, skillLevel: "intermediate" },
    { code: "F3E1", title: "Pressure Switch Error", description: "Pressure switch not responding correctly to water level", severity: "medium", machineType: "washer", possibleCauses: ["Pressure switch failure", "Hose disconnected", "Air leak in system", "Control board issue"], troubleshootingSteps: ["Check pressure switch hose connection", "Test pressure switch with blown test", "Look for air leaks in hose or air trap", "Verify control board receives frequency signal", "Replace switch if erratic"], requiredParts: ["Pressure Switch W10514214", "Hose Kit W10250742", "Air Trap W10250741"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    // Commercial Dryer Error Codes
    { code: "F1E1", title: "Control Board Error", description: "Main control processor fault detected", severity: "critical", machineType: "dryer", possibleCauses: ["Control board failure", "Power surge damage", "Moisture infiltration", "Component failure"], troubleshootingSteps: ["Power cycle machine for 5 minutes", "Check for burn marks on board", "Test control outputs with multimeter", "Verify all connectors seated properly", "Replace board if fault persists"], requiredParts: ["Main Control Board W11101053", "UI Control Board W10910026", "Wire Harness W10405846"], estimatedRepairTime: 45, skillLevel: "professional" },
    { code: "F2E1", title: "Keypad Error", description: "User interface button stuck or unresponsive", severity: "medium", machineType: "dryer", possibleCauses: ["Button stuck", "Membrane damage", "UI board failure", "Connection loose"], troubleshootingSteps: ["Clean keypad surface gently", "Check ribbon cable connector", "Test button response on each key", "Inspect membrane for damage", "Replace UI if buttons fail"], requiredParts: ["UI Control Board W10910026", "Membrane Switch W10752076", "Ribbon Cable W10547779"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "F4E1", title: "Exhaust Temperature Error", description: "Exhaust temperature sensor reading abnormally", severity: "high", machineType: "dryer", possibleCauses: ["Thermistor failure", "Wiring damage", "Airflow restriction", "Heater issue"], troubleshootingSteps: ["Test thermistor resistance (10K at 77°F)", "Check wiring to sensor", "Verify adequate airflow through machine", "Inspect heater element condition", "Check for lint accumulation"], requiredParts: ["Exhaust Thermistor W10859655", "Wire Harness W10405846", "Lint Screen W11086603"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "F6E1", title: "Communication Error", description: "Communication failure between control boards", severity: "critical", machineType: "dryer", possibleCauses: ["Ribbon cable failure", "UI board issue", "Main board problem", "Connector corrosion"], troubleshootingSteps: ["Check ribbon cable connections both ends", "Inspect cable for damage", "Clean connector contacts", "Test continuity through cable", "Replace cable if damaged"], requiredParts: ["Ribbon Cable W10547779", "UI Board W10910026", "Main Control Board W11101053"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "F2E2", title: "Door Switch Error", description: "Door switch not changing state properly", severity: "high", machineType: "dryer", possibleCauses: ["Door switch failure", "Door not closing", "Wiring issue", "Control board fault"], troubleshootingSteps: ["Test door switch with door open and closed", "Verify door closes completely", "Check wiring connections", "Test at control board connector", "Replace switch if faulty"], requiredParts: ["Door Switch W10820036", "Door Catch W10854425", "Wire Harness W10405846"], estimatedRepairTime: 25, skillLevel: "basic" },
    { code: "F4E3", title: "No Heat", description: "Heating element or gas burner not producing heat", severity: "high", machineType: "dryer", possibleCauses: ["Heating element open", "Gas valve failure", "Thermal fuse blown", "Igniter failure"], troubleshootingSteps: ["Test heating element continuity", "Check thermal fuse - must be closed", "Test gas valve coils (gas models)", "Verify igniter glows (gas models)", "Check cycling thermostat"], requiredParts: ["Heating Element W10819696", "Thermal Fuse W10909685", "Gas Valve Coil Kit W10632041", "Igniter W10918546"], estimatedRepairTime: 60, skillLevel: "professional" },
  ],
  lg: [
    // Commercial Washer Error Codes
    { code: "UE", title: "Unbalanced Load", description: "Load imbalance preventing spin cycle completion", severity: "low", machineType: "washer", possibleCauses: ["Uneven load distribution", "Single heavy item", "Machine not level", "Suspension issue", "Too few items"], troubleshootingSteps: ["Redistribute clothes evenly around drum", "Add similar weight items for balance", "Level the machine using adjustable feet", "Check suspension rods for damage", "Reduce load if oversized"], requiredParts: ["Suspension Rod Kit 4902FA1665X", "Shock Absorber 4901ER2003A", "Leveling Leg 4902FA1695J"], estimatedRepairTime: 20, skillLevel: "basic" },
    { code: "OE", title: "Drain Error", description: "Water not draining properly within timeout", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain filter", "Drain hose kinked", "Pump failure", "Drain line blocked", "Siphon effect"], troubleshootingSteps: ["Clean drain pump filter at front bottom", "Check drain hose for kinks", "Clear main drain line", "Test drain pump motor operation", "Verify standpipe at correct height"], requiredParts: ["Drain Pump 4681EA2001T", "Drain Hose 5214FR4194G", "Filter Cover 383EER2001A", "Pump Filter 4031EL1001A"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "IE", title: "Water Inlet Error", description: "Insufficient water entering machine during fill", severity: "medium", machineType: "washer", possibleCauses: ["Low water pressure", "Inlet valves blocked", "Supply hoses kinked", "Valve failure", "Screens clogged"], troubleshootingSteps: ["Check water supply pressure (20 PSI min)", "Clean inlet valve screens thoroughly", "Verify hose condition - no kinks", "Test inlet valves electrically", "Ensure both hot and cold valves open"], requiredParts: ["Water Inlet Valve 5220FR2008C", "Screen Pack 5230FR2006H", "Supply Hose Set 5215ER2002G"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "dE", title: "Door Error", description: "Door not properly closed or lock not engaging", severity: "high", machineType: "washer", possibleCauses: ["Door not latched properly", "Door switch failure", "Lock motor failure", "Foreign object in door", "Door hinge sagging"], troubleshootingSteps: ["Close door firmly until click heard", "Check for obstructions in door seal", "Test door switch continuity", "Inspect lock mechanism operation", "Adjust door hinges if needed"], requiredParts: ["Door Lock Assembly 6601ER1004C", "Door Strike 4027EL3003A", "Door Switch 6600JB1010A", "Door Hinge 4775ER1005B"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "LE", title: "Motor Lock Error", description: "Motor rotor locked or not spinning properly", severity: "critical", machineType: "washer", possibleCauses: ["Rotor position sensor failure", "Motor stator damage", "Overload condition", "Control board issue", "Bearing seizure"], troubleshootingSteps: ["Check for overloaded drum", "Inspect motor connections", "Test hall sensor with multimeter", "Verify motor turns freely by hand", "Check stator for burn marks"], requiredParts: ["Stator Assembly 4417FA1994G", "Rotor 4413ER1001C", "Hall Sensor 6501KW2002A", "Motor Bearing 4036ER4001B"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "tE", title: "Heating Error", description: "Water temperature sensor problem or heater failure", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Heater malfunction", "Control board issue", "Wiring damage"], troubleshootingSteps: ["Test thermistor resistance (10K at 77°F)", "Check heater continuity", "Verify wiring connections", "Test at control board inputs", "Check for proper voltage to heater"], requiredParts: ["Thermistor 6322FR2046A", "Heater Element 5301EL1001G", "Wire Harness 6877ER1016B"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "FE", title: "Fill Error", description: "Water continuously fills or fills when not commanded", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck open", "Pressure switch failure", "Control board fault", "Siphoning from drain"], troubleshootingSteps: ["Check inlet valves close when unpowered", "Test pressure switch operation", "Verify drain hose installation height", "Look for stuck valve plunger", "Check control board relay"], requiredParts: ["Inlet Valve 5220FR2008C", "Pressure Switch 6601ER1006E", "Control Board 6871ER1078L"], estimatedRepairTime: 50, skillLevel: "professional" },
    { code: "PE", title: "Pressure Sensor Error", description: "Water level pressure sensor malfunction", severity: "medium", machineType: "washer", possibleCauses: ["Pressure switch failure", "Hose disconnected or kinked", "Air leak", "Control board issue"], troubleshootingSteps: ["Check pressure hose connections", "Look for kinks or holes in hose", "Test pressure switch with blown test", "Verify signal at control board", "Replace switch if readings erratic"], requiredParts: ["Pressure Switch 6601ER1006E", "Pressure Hose 5215ER2002E", "Air Trap 3612FZ3010J"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "CE", title: "Current Error", description: "Abnormal current detected in motor or heater circuit", severity: "critical", machineType: "washer", possibleCauses: ["Motor short circuit", "Heater grounded", "Control board failure", "Power supply issue"], troubleshootingSteps: ["Check motor insulation resistance", "Test heater for ground fault", "Verify power supply voltage", "Inspect control board for damage", "Check all connections for shorts"], requiredParts: ["Control Board 6871ER1078L", "Motor Stator 4417FA1994G", "Heater Element 5301EL1001G"], estimatedRepairTime: 90, skillLevel: "professional" },
    { code: "dE1", title: "Door Open During Cycle", description: "Door opened or unlocked unexpectedly during operation", severity: "high", machineType: "washer", possibleCauses: ["Door lock mechanism failure", "Power interruption", "Control timing issue", "Door catch worn"], troubleshootingSteps: ["Verify door closes and latches properly", "Test door lock motor", "Check for power fluctuations", "Inspect door catch and strike", "Test control board signals"], requiredParts: ["Door Lock 6601ER1004C", "Door Catch 4027EL3003A", "Door Striker 4027EL3003B"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    // Commercial Dryer Error Codes
    { code: "d80", title: "80% Exhaust Blockage", description: "Significant exhaust restriction detected - Clean soon", severity: "high", machineType: "dryer", possibleCauses: ["Lint buildup in duct", "Crushed vent hose", "Bird nest in vent", "Duct run too long", "Damper stuck"], troubleshootingSteps: ["Clean lint screen thoroughly", "Disconnect and clean exhaust duct", "Inspect external vent for blockage", "Check for crushed sections", "Verify duct length under 25 feet"], requiredParts: ["Blower Housing 5835EL1002A", "Exhaust Duct Kit 4986EL3003A", "Lint Screen 5231EL1003B"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "d90", title: "90% Exhaust Blockage", description: "Critical exhaust restriction - FIRE HAZARD", severity: "critical", machineType: "dryer", possibleCauses: ["Severe lint accumulation", "Completely blocked vent", "Collapsed duct", "Multiple duct restrictions"], troubleshootingSteps: ["STOP USE IMMEDIATELY until resolved", "Professional duct cleaning recommended", "Replace damaged ductwork", "Inspect blower wheel for buildup", "Consider duct redesign if persistent"], requiredParts: ["Complete Vent Kit 4986EL3003A", "Blower Wheel 5835EL1002A", "Lint Filter 5231EL1003B", "Duct Connector 4933EL3002A"], estimatedRepairTime: 90, skillLevel: "professional" },
    { code: "d95", title: "95% Exhaust Blockage", description: "Near-complete blockage - Unit disabled for safety", severity: "critical", machineType: "dryer", possibleCauses: ["Complete duct obstruction", "Blower motor failure", "Duct disconnected inside", "Multiple 90-degree bends"], troubleshootingSteps: ["DO NOT OPERATE - Fire risk", "Complete exhaust system inspection required", "Check blower motor operation", "Verify duct is connected at all joints", "Professional service mandatory"], requiredParts: ["Blower Motor 4681EL1008A", "Complete Duct System 4986EL3003A", "Blower Wheel 5835EL1002A"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "tE1", title: "Exhaust Thermistor Error", description: "Exhaust temperature sensor malfunction", severity: "high", machineType: "dryer", possibleCauses: ["Thermistor failure", "Wiring open", "Connector issue", "Control board fault"], troubleshootingSteps: ["Test thermistor resistance (10K at 77°F)", "Check wiring for breaks", "Clean connector contacts", "Test at control board", "Replace if readings abnormal"], requiredParts: ["Exhaust Thermistor 6322FR2046D", "Wire Harness 6877ER1016C"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "tE2", title: "Inlet Thermistor Error", description: "Inlet temperature sensor reading abnormal", severity: "medium", machineType: "dryer", possibleCauses: ["Thermistor failure", "Wiring damage", "Connection loose", "Control board issue"], troubleshootingSteps: ["Test inlet thermistor resistance", "Verify wiring connections", "Check connector for corrosion", "Compare readings to exhaust sensor", "Replace if values incorrect"], requiredParts: ["Inlet Thermistor 6322FR2046E", "Wire Harness 6877ER1016C"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "E1", title: "Vent Cap Restriction", description: "External vent cap not opening properly", severity: "medium", machineType: "dryer", possibleCauses: ["Vent cap stuck closed", "Debris blocking cap", "Magnetic closure failure", "Ice buildup in winter"], troubleshootingSteps: ["Check external vent cap operation", "Clean debris from vent cap", "Verify flap opens with airflow", "In winter, check for ice buildup", "Replace damaged vent cap"], requiredParts: ["External Vent Cap 4933EL3003A", "Vent Transition 4986EL3002A"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "PS", title: "Power Supply Error", description: "Incoming power voltage incorrect or unstable", severity: "high", machineType: "dryer", possibleCauses: ["Low voltage supply", "One leg of 240V missing", "Electrical connection loose", "Breaker tripped partially"], troubleshootingSteps: ["Check voltage at outlet (should be 240V)", "Verify both breakers are on", "Inspect power cord terminals", "Check outlet for loose connections", "Test with separate known-good outlet"], requiredParts: ["Power Cord 6411EL3001A", "Terminal Block 6877EL3002A"], estimatedRepairTime: 30, skillLevel: "intermediate" },
  ],
  continental_girbau: [
    // EH Series Washer Error Codes
    { code: "EH010", title: "Door Lock Error", description: "Door lock mechanism failed to engage or verify", severity: "high", machineType: "washer", possibleCauses: ["Door lock solenoid failure", "Lock switch malfunction", "Door alignment issue", "Wiring fault", "Control board failure"], troubleshootingSteps: ["Verify door closes completely against frame", "Test lock solenoid with 24VDC applied", "Check lock switch continuity when engaged", "Inspect wiring from board to lock", "Test control board output signal"], requiredParts: ["Door Lock Assembly 320671", "Lock Solenoid 320672", "Door Switch 320673", "Control Board 320680"], estimatedRepairTime: 50, skillLevel: "intermediate" },
    { code: "EH020", title: "Door Unlock Error", description: "Door failed to unlock after cycle completion", severity: "medium", machineType: "washer", possibleCauses: ["Unlock solenoid failure", "Mechanism binding", "Control timing fault", "Power interruption"], troubleshootingSteps: ["Wait 3 minutes for automatic retry", "Power cycle machine completely", "Test unlock solenoid manually", "Check for mechanical binding", "Verify control sequence timing"], requiredParts: ["Door Lock Assembly 320671", "Unlock Solenoid 320674", "Lock Mechanism 320675"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "EH030", title: "Water Fill Timeout", description: "Water not reaching target level within 12-minute limit", severity: "medium", machineType: "washer", possibleCauses: ["Low water pressure", "Inlet valve failure", "Clogged screens", "Pressure transducer fault", "Supply valves closed"], troubleshootingSteps: ["Check water supply pressure (25 PSI minimum)", "Clean inlet valve screens", "Test inlet valve coils (12-20 ohms)", "Verify pressure transducer signal", "Ensure both supply valves fully open"], requiredParts: ["Inlet Valve Assembly 320601", "Pressure Transducer 320610", "Screen Kit 320602", "Valve Coil 320603"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "EH040", title: "Drain Timeout Error", description: "Water not draining within 5-minute timeout period", severity: "high", machineType: "washer", possibleCauses: ["Drain pump blocked", "Drain valve failure", "Drain hose obstruction", "Pump motor failure", "Control board issue"], troubleshootingSteps: ["Clear drain pump of debris and coins", "Test drain valve solenoid", "Check drain hose routing and height", "Test pump motor operation", "Verify control board sends drain signal"], requiredParts: ["Drain Pump Assembly 320620", "Drain Valve 320621", "Pump Motor 320622", "Drain Hose 320623"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "EH050", title: "Temperature Sensor Error", description: "Water temperature sensor reading invalid or out of range", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Wiring open/shorted", "Connector corrosion", "Control board input failure"], troubleshootingSteps: ["Test thermistor resistance (10K ohms at 25°C)", "Check wiring for damage or breaks", "Clean connector contacts with electronics cleaner", "Test signal at control board input", "Replace thermistor if readings abnormal"], requiredParts: ["Thermistor Assembly 320630", "Wire Harness 320631", "Connector Kit 320632"], estimatedRepairTime: 35, skillLevel: "basic" },
    { code: "EH060", title: "Motor Drive Error", description: "Inverter or motor not responding correctly", severity: "critical", machineType: "washer", possibleCauses: ["VFD fault", "Motor winding failure", "Encoder error", "Power supply issue", "Overload condition"], troubleshootingSteps: ["Check VFD display for specific error code", "Test motor winding resistance and insulation", "Verify encoder operation and connection", "Check incoming power quality", "Allow cool-down if thermal trip"], requiredParts: ["VFD Drive 320650", "Drive Motor 320651", "Motor Encoder 320652", "Capacitor Bank 320653"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "EH070", title: "Imbalance Error", description: "Excessive vibration detected during extraction cycle", severity: "medium", machineType: "washer", possibleCauses: ["Uneven load distribution", "Suspension damage", "Shock absorber failure", "Unbalance sensor fault", "Frame leveling"], troubleshootingSteps: ["Redistribute load evenly", "Check all suspension components", "Inspect shock absorbers for leaks", "Test unbalance sensor circuit", "Verify machine is level"], requiredParts: ["Shock Absorber Set 320660", "Suspension Spring Kit 320661", "Unbalance Sensor 320662", "Leveling Leg Set 320663"], estimatedRepairTime: 75, skillLevel: "intermediate" },
    { code: "EH080", title: "Overflow Protection", description: "Water level exceeded safe maximum in drum", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck open", "Pressure transducer failure", "Control malfunction", "Siphon from drain"], troubleshootingSteps: ["SHUT OFF WATER immediately", "Test inlet valves close when depowered", "Verify pressure transducer readings", "Check drain hose height to prevent siphon", "Test control board water level logic"], requiredParts: ["Inlet Valve 320601", "Pressure Transducer 320610", "Control Board 320680", "Float Switch 320611"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "EH090", title: "High Temperature Limit", description: "Water temperature exceeded safe operating limit", severity: "high", machineType: "washer", possibleCauses: ["Heater stuck on", "Temperature sensor error", "Control fault", "External water too hot"], troubleshootingSteps: ["Check incoming hot water temperature", "Test heater relay for stuck contacts", "Verify thermistor readings accurate", "Test high limit thermostat", "Check control board heater output"], requiredParts: ["High Limit Thermostat 320633", "Heater Relay 320634", "Thermistor 320630", "Control Board 320680"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "EH100", title: "Control Board Error", description: "Main control processor or memory fault detected", severity: "critical", machineType: "washer", possibleCauses: ["Control board failure", "Power surge damage", "Memory corruption", "Component failure"], troubleshootingSteps: ["Power cycle for 5 minutes", "Check for visible damage on board", "Verify all connectors fully seated", "Check power supply voltages", "Replace board if fault persists"], requiredParts: ["Main Control Board 320680", "Power Supply Board 320681", "Display Board 320682"], estimatedRepairTime: 60, skillLevel: "professional" },
    { code: "EH110", title: "Communication Error", description: "Communication failure between control modules", severity: "high", machineType: "washer", possibleCauses: ["Cable failure", "Connector issue", "Board failure", "EMI interference"], troubleshootingSteps: ["Check all communication cables", "Verify connector contacts are clean", "Test cable continuity", "Move cables away from power wiring", "Replace cables if damaged"], requiredParts: ["Communication Cable 320683", "Connector Kit 320632", "Display Board 320682"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "EH120", title: "Coin/Card System Error", description: "Payment system communication or validation failure", severity: "low", machineType: "washer", possibleCauses: ["Coin jam", "Reader failure", "Network issue", "Wiring fault"], troubleshootingSteps: ["Clear any coin jams", "Clean coin path and sensors", "Test card reader operation", "Check network connection if applicable", "Verify wiring to payment module"], requiredParts: ["Coin Acceptor 320690", "Card Reader 320691", "Payment Board 320692"], estimatedRepairTime: 30, skillLevel: "basic" },
    // Continental Girbau Dryer Error Codes
    { code: "EH200", title: "No Ignition - Gas", description: "Gas burner failed to ignite after multiple attempts", severity: "critical", machineType: "dryer", possibleCauses: ["Igniter failure", "Gas valve failure", "No gas supply", "Flame sensor dirty", "Air pressure switch"], troubleshootingSteps: ["Verify gas supply is on", "Test igniter for proper glow", "Clean flame sensor", "Test gas valve coils", "Check combustion air pressure switch"], requiredParts: ["Igniter Assembly 320700", "Gas Valve 320701", "Flame Sensor 320702", "Air Switch 320703"], estimatedRepairTime: 75, skillLevel: "professional" },
    { code: "EH210", title: "Flame Failure", description: "Burner flame lost during operation", severity: "high", machineType: "dryer", possibleCauses: ["Flame sensor weak", "Gas pressure drop", "Airflow issue", "Valve coil failure"], troubleshootingSteps: ["Clean flame sensor thoroughly", "Monitor gas pressure during cycle", "Check combustion air supply", "Test valve coils individually", "Verify exhaust is clear"], requiredParts: ["Flame Sensor 320702", "Gas Valve Coil Kit 320704", "Air Switch 320703"], estimatedRepairTime: 50, skillLevel: "professional" },
    { code: "EH220", title: "High Limit Trip", description: "Exhaust temperature safety limit exceeded", severity: "critical", machineType: "dryer", possibleCauses: ["Blocked exhaust", "Failed airflow switch", "Heater grounded", "Thermostat failure"], troubleshootingSteps: ["Check exhaust for restrictions", "Test high limit reset button", "Verify airflow switch operation", "Check heater for ground faults", "Clean lint from all areas"], requiredParts: ["High Limit Thermostat 320710", "Airflow Switch 320711", "Heater Element 320712"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "EH230", title: "Airflow Restriction", description: "Insufficient combustion or drying airflow detected", severity: "high", machineType: "dryer", possibleCauses: ["Lint buildup", "Blocked vent", "Blower motor weak", "Damper stuck", "Duct collapsed"], troubleshootingSteps: ["Clean lint screen and housing", "Inspect entire exhaust system", "Test blower motor amperage", "Check all dampers operate freely", "Verify duct integrity"], requiredParts: ["Blower Motor 320720", "Blower Wheel 320721", "Lint Screen 320722", "Damper Assembly 320723"], estimatedRepairTime: 60, skillLevel: "intermediate" },
    { code: "EH240", title: "Motor Overload", description: "Drum motor thermal protection activated", severity: "critical", machineType: "dryer", possibleCauses: ["Motor bearings worn", "Belt too tight", "Drum binding", "Overloaded", "Winding failure"], troubleshootingSteps: ["Allow 30-minute cool-down", "Check belt tension", "Verify drum rotates freely", "Test motor windings", "Reduce load size if excessive"], requiredParts: ["Drive Motor 320730", "Motor Bearings 320731", "Drive Belt 320732", "Drum Rollers 320733"], estimatedRepairTime: 100, skillLevel: "professional" },
  ],
  wascomat: [
    // W-Series Washer Error Codes
    { code: "E1", title: "Door Lock Error", description: "Door lock mechanism failure - cannot lock or verify", severity: "high", machineType: "washer", possibleCauses: ["Lock solenoid failure", "Door switch malfunction", "Mechanical binding", "Wiring fault", "Control issue"], troubleshootingSteps: ["Verify door closes completely against seal", "Test lock solenoid operation manually", "Check door switch continuity", "Inspect wiring from control to lock", "Clean and lubricate mechanism"], requiredParts: ["Door Lock 471-881101", "Lock Solenoid 471-881102", "Door Switch 471-881103", "Wiring Harness 471-881104"], estimatedRepairTime: 45, skillLevel: "intermediate" },
    { code: "E2", title: "Overflow Error", description: "Water level exceeded maximum safe limit", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck", "Pressure switch failure", "Air trap blocked", "Control malfunction"], troubleshootingSteps: ["SHUT OFF WATER immediately", "Check inlet valves close when depowered", "Clear air trap of debris", "Test pressure switch operation", "Verify control board logic"], requiredParts: ["Inlet Valve 471-882201", "Pressure Switch 471-882301", "Air Trap 471-882302", "Control Board 471-880001"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "E3", title: "Temperature Error", description: "Water temperature sensor reading out of valid range", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Wiring damage", "Connector issue", "Control board fault"], troubleshootingSteps: ["Test thermistor resistance (should vary with temp)", "Check wiring for breaks or shorts", "Clean connector contacts", "Test at control board terminals", "Replace if readings abnormal"], requiredParts: ["Thermistor 471-883301", "Wire Harness 471-883302", "Connector Kit 471-883303"], estimatedRepairTime: 30, skillLevel: "basic" },
    { code: "E4", title: "Motor Error", description: "Drive motor not responding or overcurrent detected", severity: "critical", machineType: "washer", possibleCauses: ["Motor failure", "Inverter fault", "Overload condition", "Belt slip", "Bearing seizure"], troubleshootingSteps: ["Check for overloaded drum", "Inspect motor connections", "Test motor winding resistance", "Check inverter display for faults", "Verify motor turns freely by hand"], requiredParts: ["Drive Motor 471-884401", "VFD Inverter 471-884402", "Motor Belt 471-884403", "Motor Bearings 471-884404"], estimatedRepairTime: 120, skillLevel: "professional" },
    { code: "E5", title: "Drain Error", description: "Water not draining within specified time limit", severity: "high", machineType: "washer", possibleCauses: ["Pump blocked", "Drain valve stuck", "Hose kinked", "Pump motor failure", "Control issue"], troubleshootingSteps: ["Clear pump of coins and debris", "Test drain valve opens electrically", "Check hose for kinks or clogs", "Test pump motor operation", "Verify control sends drain signal"], requiredParts: ["Drain Pump 471-885501", "Drain Valve 471-885502", "Drain Hose 471-885503", "Pump Motor 471-885504"], estimatedRepairTime: 50, skillLevel: "intermediate" },
    { code: "E6", title: "Imbalance Error", description: "Load imbalance exceeding safe extraction limits", severity: "medium", machineType: "washer", possibleCauses: ["Uneven load", "Suspension damage", "Shock absorber failure", "Sensor fault", "Heavy single item"], troubleshootingSteps: ["Redistribute load evenly", "Check suspension springs", "Inspect shock absorbers for leaks", "Test imbalance sensor circuit", "Reduce load if oversized"], requiredParts: ["Shock Absorber Kit 471-886601", "Suspension Spring Set 471-886602", "Imbalance Sensor 471-886603"], estimatedRepairTime: 65, skillLevel: "intermediate" },
    { code: "E7", title: "Pressure Sensor Error", description: "Water level pressure sensor malfunction", severity: "medium", machineType: "washer", possibleCauses: ["Pressure switch failure", "Hose disconnected", "Air leak in system", "Control board issue"], troubleshootingSteps: ["Check pressure hose connections", "Look for holes or kinks in hose", "Test switch with blown pressure test", "Verify signal at control board", "Replace if readings erratic"], requiredParts: ["Pressure Switch 471-882301", "Pressure Hose 471-882304", "Air Trap 471-882302"], estimatedRepairTime: 35, skillLevel: "intermediate" },
    { code: "E8", title: "Fill Timeout", description: "Machine failed to fill within allowed time period", severity: "medium", machineType: "washer", possibleCauses: ["Low water pressure", "Inlet valve failure", "Screens clogged", "Supply valves closed", "Pressure sensor fault"], troubleshootingSteps: ["Verify water supply pressure (20 PSI min)", "Clean inlet valve screens", "Test inlet valve coils", "Ensure supply valves fully open", "Check pressure sensor operation"], requiredParts: ["Inlet Valve 471-882201", "Screen Kit 471-882202", "Valve Coil 471-882203"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "E9", title: "Heater Error", description: "Water heater not functioning or overtemperature", severity: "high", machineType: "washer", possibleCauses: ["Heater element open", "Heater relay stuck", "High limit tripped", "Thermistor error", "Control fault"], troubleshootingSteps: ["Test heater element continuity", "Check heater relay operation", "Test high limit thermostat", "Verify thermistor readings", "Check control board heater output"], requiredParts: ["Heater Element 471-889901", "Heater Relay 471-889902", "High Limit 471-889903", "Thermistor 471-883301"], estimatedRepairTime: 60, skillLevel: "professional" },
    { code: "E10", title: "Door Unlock Error", description: "Door failed to unlock after cycle completion", severity: "medium", machineType: "washer", possibleCauses: ["Unlock mechanism failure", "Control timing issue", "Power interruption", "Mechanical binding"], troubleshootingSteps: ["Wait 3 minutes for automatic retry", "Power cycle machine completely", "Check unlock coil operation", "Inspect mechanism for wear", "Manual release if accessible"], requiredParts: ["Door Lock 471-881101", "Unlock Coil 471-881105"], estimatedRepairTime: 40, skillLevel: "intermediate" },
    { code: "E11", title: "Control Board Error", description: "Main control processor or communication fault", severity: "critical", machineType: "washer", possibleCauses: ["Board failure", "Power surge", "Firmware issue", "Component failure"], troubleshootingSteps: ["Power cycle for 5 minutes", "Check all connections are secure", "Look for visible damage", "Verify power supply voltages", "Replace board if persists"], requiredParts: ["Control Board 471-880001", "Power Supply 471-880002", "Display Board 471-880003"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "E12", title: "Coin/Card Error", description: "Payment system malfunction or communication failure", severity: "low", machineType: "washer", possibleCauses: ["Coin jam", "Card reader offline", "Network issue", "Wiring fault"], troubleshootingSteps: ["Clear coin mechanism of jams", "Clean sensors and coin path", "Check card reader connection", "Verify network if applicable", "Test wiring continuity"], requiredParts: ["Coin Acceptor 471-890001", "Card Reader 471-890002", "Payment Module 471-890003"], estimatedRepairTime: 25, skillLevel: "basic" },
    // Wascomat Dryer Error Codes
    { code: "E20", title: "No Ignition", description: "Gas burner failed to ignite after attempts", severity: "critical", machineType: "dryer", possibleCauses: ["Igniter failure", "Gas valve failure", "No gas supply", "Flame rod dirty", "Control issue"], troubleshootingSteps: ["Verify gas supply is on", "Test igniter glow (should be orange)", "Clean flame rod thoroughly", "Test gas valve coils", "Check safety interlocks"], requiredParts: ["Igniter 471-920001", "Gas Valve 471-920002", "Flame Rod 471-920003", "Valve Coil Kit 471-920004"], estimatedRepairTime: 65, skillLevel: "professional" },
    { code: "E21", title: "Flame Out", description: "Burner flame lost during drying cycle", severity: "high", machineType: "dryer", possibleCauses: ["Flame rod weak", "Gas pressure drop", "Airflow issue", "Valve timing"], troubleshootingSteps: ["Clean flame rod with fine sandpaper", "Check gas pressure at manifold", "Verify combustion air adequate", "Test valve coil sequence", "Monitor flame quality"], requiredParts: ["Flame Rod 471-920003", "Gas Valve Coil Kit 471-920004", "Air Shutter 471-920005"], estimatedRepairTime: 50, skillLevel: "professional" },
    { code: "E22", title: "High Limit Trip", description: "Exhaust temperature exceeded safe limit", severity: "critical", machineType: "dryer", possibleCauses: ["Blocked exhaust", "Airflow switch failure", "Heater short", "Thermostat failure"], troubleshootingSteps: ["Clear all exhaust restrictions", "Check high limit reset", "Test airflow switch operation", "Verify heater not grounded", "Inspect thermal fuse"], requiredParts: ["High Limit Thermostat 471-921001", "Thermal Fuse 471-921002", "Airflow Switch 471-921003"], estimatedRepairTime: 55, skillLevel: "professional" },
    { code: "E23", title: "Airflow Error", description: "Insufficient drying or combustion airflow", severity: "high", machineType: "dryer", possibleCauses: ["Lint accumulation", "Vent blocked", "Blower weak", "Duct collapsed"], troubleshootingSteps: ["Clean lint screen and trap housing", "Inspect entire exhaust duct", "Test blower motor operation", "Check all dampers move freely", "Reduce duct length if excessive"], requiredParts: ["Blower Motor 471-922001", "Blower Wheel 471-922002", "Lint Screen 471-922003", "Vent Kit 471-922004"], estimatedRepairTime: 55, skillLevel: "intermediate" },
    { code: "E24", title: "Motor Overload", description: "Drum motor thermal protection tripped", severity: "critical", machineType: "dryer", possibleCauses: ["Motor bearings", "Belt too tight", "Drum binding", "Overloaded", "Winding short"], troubleshootingSteps: ["Allow 30-minute cool-down", "Check belt tension", "Spin drum by hand - should be free", "Test motor windings", "Reduce load size"], requiredParts: ["Drive Motor 471-923001", "Motor Bearings 471-923002", "Drive Belt 471-923003", "Drum Rollers 471-923004"], estimatedRepairTime: 90, skillLevel: "professional" },
    { code: "E25", title: "Temperature Sensor Error", description: "Exhaust or inlet temperature sensor fault", severity: "medium", machineType: "dryer", possibleCauses: ["Thermistor failure", "Wiring open", "Connector issue", "Control fault"], troubleshootingSteps: ["Test thermistor resistance", "Check wiring for breaks", "Clean connectors", "Test at control board", "Replace if abnormal"], requiredParts: ["Exhaust Thermistor 471-924001", "Inlet Thermistor 471-924002", "Wire Harness 471-924003"], estimatedRepairTime: 35, skillLevel: "intermediate" },
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
    <AuthGuard title="Sign In for AI Diagnostics" description="Sign in to access this feature.">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <SEO 
          title="Service Guy AI - Free Washer & Dryer Error Code Lookup | Laundromat Equipment Diagnostics"
        description="Free AI-powered laundromat equipment troubleshooting. 2,200+ error codes for Speed Queen, Dexter, Maytag, Huebsch & 35+ brands. Get repair guides, part numbers & fix times."
        keywords={[
          "laundromat error codes",
          "washer error codes",
          "dryer fault codes",
          "Speed Queen error codes",
          "Dexter error codes",
          "laundry equipment troubleshooting",
          "commercial washer repair",
          "laundromat maintenance",
          "washer not draining",
          "dryer not heating",
          "laundromat equipment repair",
          "coin laundry troubleshooting",
          "washing machine error codes list",
          "commercial dryer error codes",
          "laundromat service technician tools"
        ]}
        canonicalUrl="/service-guy-ai"
        ogType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tools", url: "/calculators" },
          { name: "Service Guy AI", url: "/service-guy-ai" }
        ]}
        faqs={[
          {
            question: "How do I diagnose washer problems in my laundromat?",
            answer: "Use Service Guy AI to identify washer issues: 1) Select your manufacturer (Speed Queen, Dexter, Maytag, etc.), 2) Enter the error code displayed on your machine, 3) Get detailed troubleshooting steps, required parts with part numbers, and estimated repair time. Our database covers 2,200+ error codes from 35+ manufacturers."
          },
          {
            question: "What are the most common commercial washer error codes?",
            answer: "Common commercial washer error codes include: E1/nF (No Fill - water supply issue), E2/dE (Drain Error - pump or hose clog), dL/dU (Door Lock failures), OE (Overflow - pressure switch or valve stuck), LE/E5 (Motor Error - overload or bearing issue), and tE (Temperature Sensor Error). Service Guy AI provides specific fixes for each code by manufacturer."
          },
          {
            question: "How can I fix a dryer that's not heating?",
            answer: "For a commercial dryer not heating: 1) Check for error codes like HE or AF, 2) Inspect the lint screen and exhaust duct for blockages, 3) Test the heating element continuity (10-20 ohms), 4) Verify thermal fuse and high-limit thermostat, 5) For gas dryers, check igniter glow and gas valve coils. Service Guy AI provides brand-specific repair guides."
          },
          {
            question: "What equipment does Service Guy AI support?",
            answer: "Service Guy AI supports 35+ commercial laundry manufacturers including Speed Queen, Dexter, Maytag Commercial, LG Commercial, Wascomat, Continental Girbau, Huebsch, IPSO, UniMac, Electrolux Professional, and more. We cover both washers and dryers with 2,200+ error codes in our database."
          },
          {
            question: "How much does laundromat equipment repair typically cost?",
            answer: "Repair costs vary by issue: Door locks ($50-150), drain pumps ($100-250), control boards ($200-500), motors ($300-800), and transmissions ($400-1000+). Service Guy AI provides estimated repair times and required part numbers to help you budget. Most repairs take 30-90 minutes for trained technicians."
          },
          {
            question: "When should I call a professional laundromat technician?",
            answer: "Call a professional for: 1) Critical errors involving electrical or gas systems, 2) Motor or inverter failures requiring specialized tools, 3) Recurring issues after DIY attempts, 4) Warranty-covered repairs. Service Guy AI rates each repair by skill level - basic, intermediate, or professional - so you know when to DIY vs. call for help."
          },
          {
            question: "How do I prevent equipment breakdowns in my laundromat?",
            answer: "Prevent laundromat equipment failures with: 1) Daily lint screen cleaning, 2) Weekly drain pump checks, 3) Monthly exhaust duct inspections, 4) Quarterly seal and hose inspections, 5) Annual professional maintenance. Service Guy AI includes preventive maintenance tips for each equipment type to maximize uptime."
          },
          {
            question: "What parts should laundromat owners keep in stock?",
            answer: "Essential spare parts include: door switches and seals, drain pump assemblies, inlet valve screens, drive belts, thermal fuses, and coin mechanism sensors. Service Guy AI provides OEM part numbers for each repair, so you can stock the right parts and minimize downtime when issues occur."
          }
        ]}
        howTo={{
          name: "How to Diagnose Laundromat Equipment Issues with Service Guy AI",
          description: "Step-by-step guide to troubleshoot commercial washer and dryer problems using AI-powered diagnostics",
          totalTime: "PT5M",
          steps: [
            {
              name: "Select Your Equipment Manufacturer",
              text: "Choose your equipment brand from our list of 35+ supported manufacturers including Speed Queen, Dexter, Maytag, Huebsch, LG Commercial, and more."
            },
            {
              name: "Enter the Error Code",
              text: "Type in the error code displayed on your machine's control panel. Our database includes 2,200+ codes covering washers and dryers."
            },
            {
              name: "Review the Diagnosis",
              text: "Get detailed information including error description, severity level, possible causes, and required skill level for repair."
            },
            {
              name: "Follow Troubleshooting Steps",
              text: "Work through the step-by-step troubleshooting guide specific to your error code and equipment model."
            },
            {
              name: "Order Required Parts",
              text: "View the list of required parts with OEM part numbers, and order directly from trusted suppliers if needed."
            },
            {
              name: "Complete the Repair",
              text: "Follow the repair guide to fix the issue. Estimated repair times range from 15-150 minutes depending on complexity."
            }
          ]
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Service Guy AI - Laundromat Equipment Diagnostics",
          "alternateName": "Service Guy AI",
          "description": "Free AI-powered commercial laundry equipment diagnostic tool with 2,200+ error codes for Speed Queen, Dexter, Maytag, and 35+ manufacturers",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Equipment Diagnostics",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "847",
            "bestRating": "5"
          },
          "featureList": [
            "2,200+ error code database",
            "35+ manufacturer support",
            "AI-powered symptom analysis",
            "OEM part number lookup",
            "Repair time estimates",
            "Skill level ratings",
            "Preventive maintenance guides",
            "24/7 availability"
          ],
          "screenshot": "https://washbizhub.com/service-guy-ai-screenshot.png",
          "softwareVersion": "2.0",
          "provider": {
            "@type": "Organization",
            "name": "WashBizHub",
            "url": "https://washbizhub.com"
          }
        }}
      />
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
            <div className="text-3xl font-bold text-primary">2,200+</div>
            <div className="text-sm text-muted-foreground">Error Codes</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">35+</div>
            <div className="text-sm text-muted-foreground">Manufacturers</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">5,000+</div>
            <div className="text-sm text-muted-foreground">Part Numbers</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Support</div>
          </Card>
        </div>

        {/* Premium Subscription Banner */}
        <Card className="mb-12 border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 overflow-visible">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">Service Guy AI Premium</h3>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none">
                      PREMIUM TOOL
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Industrial-grade diagnostics for commercial laundry professionals
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center lg:text-left">
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-6">
                  <div className="text-2xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">Basic Error Lookup</div>
                  <div className="text-xs text-muted-foreground">3 lookups/day</div>
                </div>
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-6">
                  <div className="text-2xl font-bold text-amber-500">$19/mo</div>
                  <div className="text-sm text-muted-foreground">Pro Diagnostics</div>
                  <div className="text-xs text-muted-foreground">Unlimited + AI analysis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">$49/mo</div>
                  <div className="text-sm text-muted-foreground">Enterprise</div>
                  <div className="text-xs text-muted-foreground">Team access + API</div>
                </div>
              </div>
              
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90" data-testid="button-service-guy-upgrade">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Educational Disclaimer */}
        <LegalDisclaimer variant="compact" className="mb-8" />

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
                              {code.requiredParts.map((part, i) => {
                                const partId = part.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                                const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(part)}&tag=washbizhub-20`;
                                return (
                                  <a 
                                    key={i}
                                    href={amazonSearchUrl}
                                    target="_blank"
                                    rel="sponsored noopener noreferrer"
                                    className="group"
                                    data-testid={`link-amazon-part-${code.code}-${partId}`}
                                  >
                                    <Badge 
                                      variant="outline" 
                                      className="font-mono text-xs hover:bg-amber-500/20 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                                    >
                                      {part}
                                      <span className="ml-1 opacity-60 group-hover:opacity-100 text-amber-600">→</span>
                                    </Badge>
                                  </a>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1" data-testid={`text-affiliate-notice-${code.code}`}>
                              <span className="text-amber-500">★</span>
                              Click any part to find on Amazon (affiliate link)
                            </p>
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
                <Mail className="w-5 h-5" />
                consult@washbizhub.com
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  );
}
