import { db } from "./db";
import { diagnosticCodes } from "@shared/schema";

interface PartWithPricing {
  partNumber: string;
  name: string;
  price: number;
  supplier: string;
}

interface DetailedErrorCode {
  code: string;
  manufacturer: string;
  machineType: string;
  title: string;
  description: string;
  severity: string;
  skillLevel: string;
  estimatedRepairTime: number;
  possibleCauses: string[];
  troubleshootingSteps: string[];
  partsWithPricing: PartWithPricing[];
  quickFix: string;
  testModeEntry: string;
  eraCompatibility: string;
  modelSeries?: string;
}

const DETAILED_ERROR_CODES: DetailedErrorCode[] = [
  // ═══════════════════════════════════════════════════════════════════
  // SPEED QUEEN / ALLIANCE FAMILY - WASHERS
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "Er_dL",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Door Lock Failure",
    description: "Door lock mechanism failed to engage or disengage properly. Machine cannot start or complete cycle.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 20,
    possibleCauses: [
      "Door lock solenoid failure",
      "Door strike misaligned or worn",
      "Wiring harness damage between lock and control board",
      "Control board output failure",
      "Debris in lock mechanism"
    ],
    troubleshootingSteps: [
      "Power cycle machine - unplug for 60 seconds (clears 40% of codes)",
      "Spray WD-40 on door strike and latch mechanism",
      "Check door closes completely and strike aligns with lock",
      "Inspect wiring from lock to J4 connector on control board",
      "Test door lock solenoid with multimeter (should show 20-40 ohms)",
      "If lock clicks but doesn't engage, replace lock assembly"
    ],
    partsWithPricing: [
      { partNumber: "F808214P", name: "Door Lock Solenoid Assembly", price: 65, supplier: "Alliance Parts" },
      { partNumber: "F808215P", name: "Door Strike Kit", price: 25, supplier: "Alliance Parts" },
      { partNumber: "200305P", name: "Lock Wiring Harness", price: 35, supplier: "Alliance Parts" }
    ],
    quickFix: "Spray WD-40 on strike & latch first - works 50% of the time. If lock clicks but doesn't engage, replace the $65 lock assembly.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "2000-2025",
    modelSeries: "Quantum Gold, Quantum Touch, SC/SW Series"
  },
  {
    code: "Er_dr",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Drain Error",
    description: "Water not draining from tub within the allowed time (typically 4-8 minutes).",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Clogged drain pump filter/coin trap",
      "Kinked or blocked drain hose",
      "Drain pump motor failure",
      "Debris blocking pump impeller",
      "Drain valve stuck closed"
    ],
    troubleshootingSteps: [
      "Locate and clean pump filter/coin trap (front panel, lower right) - 70% fix",
      "Check drain hose is not kinked and height does not exceed 8 feet",
      "Run test cycle empty - listen for pump hum",
      "If humming but no drain, debris is blocking impeller - clean or replace pump",
      "If silent, check wiring or triac on control board"
    ],
    partsWithPricing: [
      { partNumber: "F802118P", name: "Drain Pump Assembly", price: 89, supplier: "Alliance Parts" },
      { partNumber: "F803506", name: "Pump Filter Screen", price: 12, supplier: "Alliance Parts" },
      { partNumber: "F8534401P", name: "Drain Hose Kit", price: 28, supplier: "Alliance Parts" }
    ],
    quickFix: "Clean the pump filter/coin trap - this fixes 70% of drain errors in under 2 minutes.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "1990-2025",
    modelSeries: "All Speed Queen commercial washers"
  },
  {
    code: "Er_FL",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Fill Error",
    description: "Machine did not fill with water within timeout period (typically 8-15 minutes).",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply valves closed",
      "Clogged inlet valve screens (most common)",
      "Inlet valve failure",
      "Water pressure too low (under 20 PSI)",
      "Kinked supply hoses"
    ],
    troubleshootingSteps: [
      "Verify both hot and cold water supply valves are fully open",
      "Turn off water, disconnect hoses, pull inlet screens with needle-nose pliers",
      "Clean screens with toothbrush and vinegar - 85% fix rate",
      "Check water pressure with gauge (need 20-120 PSI)",
      "Test inlet valve coils with multimeter (should show 500-1500 ohms)",
      "Swap hot/cold hoses to identify which valve is faulty"
    ],
    partsWithPricing: [
      { partNumber: "F808213P", name: "Water Inlet Valve (Dual)", price: 55, supplier: "Alliance Parts" },
      { partNumber: "F8546201", name: "Inlet Screen Kit (Set of 4)", price: 8, supplier: "Alliance Parts" },
      { partNumber: "F381721P", name: "Fill Hose Set", price: 32, supplier: "Alliance Parts" }
    ],
    quickFix: "Pull and clean inlet screens with a toothbrush - this fixes 85% of fill errors.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "1990-2025",
    modelSeries: "All Speed Queen commercial washers"
  },
  {
    code: "Er_Ub",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Unbalance Error",
    description: "Load is unbalanced during spin cycle. Machine stops to prevent damage.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 20,
    possibleCauses: [
      "Uneven load distribution (single heavy item)",
      "Overloaded machine",
      "Worn or broken shock absorbers",
      "Damaged suspension springs",
      "Out-of-level machine installation"
    ],
    troubleshootingSteps: [
      "Redistribute load evenly - add similar weight items",
      "Reduce load size if overloaded (check capacity rating)",
      "Check all 4 shock absorbers for leaks or damage - replace all if one bad",
      "Verify machine is level using spirit level",
      "Check suspension springs for cracks or disconnection"
    ],
    partsWithPricing: [
      { partNumber: "F8534701P", name: "Shock Absorber Kit (Set of 4)", price: 120, supplier: "Alliance Parts" },
      { partNumber: "F8413401", name: "Suspension Spring Set", price: 85, supplier: "Alliance Parts" }
    ],
    quickFix: "Redistribute the load first. If error persists on empty test cycle, check shocks for leaks.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "1990-2025",
    modelSeries: "All Speed Queen front-load washers"
  },
  {
    code: "Er_dF",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Drive Failure / Communication Error",
    description: "Control board cannot communicate with motor inverter. Motor will not run.",
    severity: "critical",
    skillLevel: "professional",
    estimatedRepairTime: 45,
    possibleCauses: [
      "Loose communication cable (J6 connector)",
      "Failed inverter board",
      "Control board failure",
      "Motor winding failure",
      "Power surge damage"
    ],
    troubleshootingSteps: [
      "Check and reseat the comm cable at J6 - 80% of 'bad boards' are loose cables",
      "Try the $15 comm cable replacement first (F808227P)",
      "Verify 240V at power input terminals",
      "Check motor resistance between phases (should be balanced, 2-5 ohms each)",
      "Test inverter output with multimeter",
      "If inverter shows fault LED, replace inverter board"
    ],
    partsWithPricing: [
      { partNumber: "F808227P", name: "Communication Cable", price: 15, supplier: "Alliance Parts" },
      { partNumber: "F8597101P", name: "Inverter Control Board", price: 385, supplier: "Alliance Parts" },
      { partNumber: "F8597001P", name: "Main Control Board", price: 295, supplier: "Alliance Parts" }
    ],
    quickFix: "9 out of 10 times this is just the $15 comm cable (F808227P). Reseat J6 connector first.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "2005-2025",
    modelSeries: "Quantum Gold, Quantum Touch with inverter drive"
  },
  {
    code: "Er_Ht",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Heater Error",
    description: "Water not reaching target temperature within time limit.",
    severity: "medium",
    skillLevel: "intermediate",
    estimatedRepairTime: 30,
    possibleCauses: [
      "Heater element failure (open circuit)",
      "Thermistor failure",
      "Triac failure on control board",
      "Incoming water too cold",
      "Heater relay stuck open"
    ],
    troubleshootingSteps: [
      "Check incoming hot water supply temperature",
      "Test heater element with multimeter (should show 10-30 ohms)",
      "Test thermistor resistance (should change with temperature)",
      "Verify 240V to heater terminals when heat is called",
      "If no voltage, check control board triac or relay"
    ],
    partsWithPricing: [
      { partNumber: "F8532701P", name: "Heater Element 4500W", price: 95, supplier: "Alliance Parts" },
      { partNumber: "F8523501", name: "Thermistor NTC", price: 28, supplier: "Alliance Parts" }
    ],
    quickFix: "Check if hot water supply is actually hot. Then test heater element for continuity.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "1995-2025",
    modelSeries: "Speed Queen heated models"
  },
  {
    code: "PF",
    manufacturer: "Speed Queen",
    machineType: "washer",
    title: "Power Failure",
    description: "Power interruption detected during cycle.",
    severity: "low",
    skillLevel: "basic",
    estimatedRepairTime: 5,
    possibleCauses: [
      "Power outage during cycle",
      "Loose power connection",
      "Tripped circuit breaker",
      "Faulty outlet or plug",
      "Voltage fluctuation"
    ],
    troubleshootingSteps: [
      "Reset circuit breaker or replace fuse ($12)",
      "Check power cord and outlet connections",
      "Verify 240V at outlet (both legs)",
      "Press start to resume or cancel cycle",
      "If recurring, have electrician check circuit"
    ],
    partsWithPricing: [
      { partNumber: "F8535401", name: "Power Cord Assembly", price: 45, supplier: "Alliance Parts" }
    ],
    quickFix: "Just press Start to resume the cycle, or Cancel to reset. Check breaker if it happens often.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously to enter test mode",
    eraCompatibility: "1990-2025",
    modelSeries: "All Speed Queen equipment"
  },

  // ═══════════════════════════════════════════════════════════════════
  // SPEED QUEEN DRYERS
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "E:AF",
    manufacturer: "Speed Queen",
    machineType: "dryer",
    title: "Airflow Restriction",
    description: "Insufficient airflow through exhaust system detected. Dryer will not heat or cycle will be extended.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 30,
    possibleCauses: [
      "Lint buildup in exhaust duct",
      "Blocked external vent flap",
      "Crushed or kinked duct run",
      "Duct run too long (over 25 feet equivalent)",
      "Sail switch failure"
    ],
    troubleshootingSteps: [
      "Clean lint screen thoroughly - this fixes 60% of airflow codes",
      "Disconnect exhaust duct and run dryer - if error clears, duct is blocked",
      "Clean entire duct run with brush or leaf blower",
      "Check external vent flap opens freely",
      "Test sail switch with multimeter (should close when airflow present)"
    ],
    partsWithPricing: [
      { partNumber: "F8424501", name: "Sail Switch", price: 35, supplier: "Alliance Parts" },
      { partNumber: "F8424101", name: "Lint Screen", price: 22, supplier: "Alliance Parts" }
    ],
    quickFix: "Clean lint screen + exhaust duct. This clears 60% of airflow codes in 30 minutes.",
    testModeEntry: "Hold 'High Temp + Start' for 5 seconds to enter test mode",
    eraCompatibility: "2000-2025",
    modelSeries: "ADE, ADG, ST, HT Series"
  },
  {
    code: "E:HC",
    manufacturer: "Speed Queen",
    machineType: "dryer",
    title: "Heater Circuit Error",
    description: "No heat or heating element has failed. Clothes remain damp.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 45,
    possibleCauses: [
      "Heating element open circuit",
      "Thermal fuse blown",
      "High-limit thermostat tripped",
      "Gas valve coils failed (gas models)",
      "Igniter failure (gas models)"
    ],
    troubleshootingSteps: [
      "Clean lint + check exhaust vent first (overheating causes thermal fuse to blow)",
      "For ELECTRIC: Test element continuity (should show 8-15 ohms)",
      "Check thermal fuse and hi-limits for continuity",
      "For GAS: Check if igniter glows - if yes but no flame, replace coils",
      "If igniter glows weak/red, replace igniter",
      "If no glow, check thermal fuse & hi-limits first"
    ],
    partsWithPricing: [
      { partNumber: "F8534901P", name: "Heating Element 5400W", price: 85, supplier: "Alliance Parts" },
      { partNumber: "F8234101", name: "Thermal Fuse Kit", price: 18, supplier: "Alliance Parts" },
      { partNumber: "F8429501", name: "High Limit Thermostat", price: 25, supplier: "Alliance Parts" },
      { partNumber: "279834", name: "Gas Valve Coil Kit", price: 25, supplier: "Whirlpool" },
      { partNumber: "F8428401", name: "Hot Surface Igniter", price: 55, supplier: "Alliance Parts" }
    ],
    quickFix: "GAS: If igniter glows but no flame, it's the $25 gas coils 90% of the time. ELECTRIC: Check thermal fuse first ($18).",
    testModeEntry: "Hold 'High Temp + Start' for 5 seconds to enter test mode",
    eraCompatibility: "1990-2025",
    modelSeries: "All Speed Queen dryers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // HUEBSCH (Alliance Family)
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "E_FL",
    manufacturer: "Huebsch",
    machineType: "washer",
    title: "Fill Error",
    description: "Machine did not fill with water within timeout period.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply valves closed",
      "Clogged inlet valve screens",
      "Inlet valve failure",
      "Low water pressure"
    ],
    troubleshootingSteps: [
      "Verify water supply valves are open",
      "Pull and clean inlet screens with toothbrush - 85% fix",
      "Check water pressure (need 20-120 PSI)",
      "Test inlet valve coils (500-1500 ohms)"
    ],
    partsWithPricing: [
      { partNumber: "F808213P", name: "Water Inlet Valve", price: 55, supplier: "Alliance Parts" },
      { partNumber: "F8546201", name: "Inlet Screen Kit", price: 8, supplier: "Alliance Parts" }
    ],
    quickFix: "Pull and clean inlet screens - fixes 85% of fill errors.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously",
    eraCompatibility: "2000-2025",
    modelSeries: "HC/HW Series"
  },
  {
    code: "E_DR",
    manufacturer: "Huebsch",
    machineType: "washer",
    title: "Drain Error",
    description: "Water not draining from tub within allowed time.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Clogged pump filter/coin trap",
      "Kinked drain hose",
      "Drain pump failure",
      "Debris blocking impeller"
    ],
    troubleshootingSteps: [
      "Clean pump filter/coin trap - 70% fix",
      "Check drain hose not kinked or too high",
      "Listen for pump hum - if humming, impeller blocked",
      "If silent, check pump motor or control board"
    ],
    partsWithPricing: [
      { partNumber: "F802118P", name: "Drain Pump Assembly", price: 89, supplier: "Alliance Parts" },
      { partNumber: "F803506", name: "Pump Filter Screen", price: 12, supplier: "Alliance Parts" }
    ],
    quickFix: "Clean the pump filter/coin trap first - fixes 70% of drain errors.",
    testModeEntry: "Press 'Delicates + Cold' buttons simultaneously",
    eraCompatibility: "2000-2025",
    modelSeries: "HC/HW Series"
  },

  // ═══════════════════════════════════════════════════════════════════
  // DEXTER
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "D001",
    manufacturer: "Dexter",
    machineType: "washer",
    title: "Door Lock Error",
    description: "Door lock did not engage within the allowed time.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 20,
    possibleCauses: [
      "Door lock solenoid failure",
      "Door not fully closed",
      "Wiring harness issue",
      "Control board output failure"
    ],
    troubleshootingSteps: [
      "Check door closes completely and latches",
      "Inspect door lock wiring at P-15 connector",
      "Test door lock solenoid with multimeter",
      "Replace lock assembly if solenoid tests bad"
    ],
    partsWithPricing: [
      { partNumber: "9857-116-001", name: "Door Lock Assembly", price: 85, supplier: "Dexter Parts" },
      { partNumber: "9857-117-001", name: "Door Strike", price: 28, supplier: "Dexter Parts" }
    ],
    quickFix: "Check door strike alignment first. Clean latch with WD-40.",
    testModeEntry: "Hold 'Medium + Start' for 5 seconds",
    eraCompatibility: "2000-2025",
    modelSeries: "T-300, T-400, T-600, T-900, T-1200"
  },
  {
    code: "D013",
    manufacturer: "Dexter",
    machineType: "washer",
    title: "Inverter Over-Current",
    description: "Motor inverter detected over-current condition.",
    severity: "critical",
    skillLevel: "professional",
    estimatedRepairTime: 30,
    possibleCauses: [
      "Inverter fuse blown",
      "Motor overload",
      "Inverter board failure",
      "Motor winding short"
    ],
    troubleshootingSteps: [
      "Check inverter fuse first - 95% of the time it's the $10 fuse",
      "Verify no mechanical binding in drum",
      "Test motor resistance between phases",
      "If fuse keeps blowing, replace inverter board"
    ],
    partsWithPricing: [
      { partNumber: "9857-134-001", name: "Inverter Fuse 15A", price: 10, supplier: "Dexter Parts" },
      { partNumber: "9857-140-001", name: "Inverter Control Board", price: 425, supplier: "Dexter Parts" }
    ],
    quickFix: "95% chance it's just the $10 fuse on the inverter. Check that first before replacing expensive parts.",
    testModeEntry: "Hold 'Medium + Start' for 5 seconds",
    eraCompatibility: "2005-2025",
    modelSeries: "C-Series with VFD"
  },
  {
    code: "DF08",
    manufacturer: "Dexter",
    machineType: "dryer",
    title: "Rotation Fault",
    description: "Drum not rotating or rotation sensor failure.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 40,
    possibleCauses: [
      "Broken drive belt",
      "Seized drum bearings",
      "Motor failure",
      "Rotation sensor failure"
    ],
    troubleshootingSteps: [
      "Open door, spin drum by hand - should rotate freely",
      "Check belt for cracks or breakage",
      "Test motor with direct power",
      "Check rotation sensor at PCB"
    ],
    partsWithPricing: [
      { partNumber: "9857-072-001", name: "Drive Belt", price: 28, supplier: "Dexter Parts" },
      { partNumber: "9857-075-001", name: "Drum Bearing Kit", price: 145, supplier: "Dexter Parts" }
    ],
    quickFix: "Spin drum by hand first. If it won't turn, check belt. If grinding noise, bearings are bad.",
    testModeEntry: "Hold 'Medium + Start' for 5 seconds",
    eraCompatibility: "1995-2025",
    modelSeries: "All Dexter commercial dryers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADC (American Dryer Corp)
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "SAIL_OPEN",
    manufacturer: "ADC",
    machineType: "dryer",
    title: "Sail Switch Open",
    description: "Airflow sensor (sail switch) not detecting adequate airflow.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Lint blockage in exhaust",
      "Sail switch arm bent",
      "External vent blocked",
      "Sail switch failure"
    ],
    troubleshootingSteps: [
      "Clean lint screen and exhaust duct",
      "Locate sail switch - gently bend arm 1/8 inch toward airflow",
      "Check external vent flap opens freely",
      "Test sail switch with multimeter if needed"
    ],
    partsWithPricing: [
      { partNumber: "ADC-881210", name: "Sail Switch", price: 35, supplier: "ADC Parts" }
    ],
    quickFix: "Bend the sail switch arm 1/8 inch - saves buying a $35 part. This works most of the time.",
    testModeEntry: "Hold 'High Temp + Start' for 5 seconds",
    eraCompatibility: "1990-2025",
    modelSeries: "AD-15 through AD-200, Phase 5-7"
  },
  {
    code: "IGNITION",
    manufacturer: "ADC",
    machineType: "dryer",
    title: "Ignition Failure",
    description: "Gas igniter did not light or flame not detected.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 30,
    possibleCauses: [
      "Failed igniter",
      "Gas valve coils failure",
      "Flame sensor dirty/failed",
      "No gas supply",
      "Thermal fuse open"
    ],
    troubleshootingSteps: [
      "Watch igniter during start - should glow orange/white",
      "If glows but no flame, replace gas coils ($25)",
      "If weak glow, replace igniter ($45)",
      "If no glow, check thermal fuse and hi-limits",
      "Clean flame sensor with fine steel wool"
    ],
    partsWithPricing: [
      { partNumber: "279834", name: "Gas Valve Coil Kit", price: 25, supplier: "Whirlpool" },
      { partNumber: "ADC-128927", name: "Hot Surface Igniter", price: 45, supplier: "ADC Parts" },
      { partNumber: "ADC-129278", name: "Flame Sensor", price: 25, supplier: "ADC Parts" }
    ],
    quickFix: "If igniter glows but no flame = bad coils ($25). If weak glow = bad igniter ($45). 90% success rate.",
    testModeEntry: "Hold 'High Temp + Start' for 5 seconds",
    eraCompatibility: "1990-2025",
    modelSeries: "All ADC gas dryers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // LG COMMERCIAL
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "OE",
    manufacturer: "LG",
    machineType: "washer",
    title: "Drain Error",
    description: "Water not draining from drum within allowed time.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Clogged drain filter (coin trap)",
      "Kinked drain hose",
      "Drain pump failure",
      "Debris in pump impeller"
    ],
    troubleshootingSteps: [
      "Locate drain filter on LEFT side (not right like home units)",
      "Place towel and shallow pan under filter",
      "Unscrew filter and remove debris - 85% fix",
      "Check drain hose for kinks",
      "Test pump motor if filter is clear"
    ],
    partsWithPricing: [
      { partNumber: "5859EA1004G", name: "Drain Pump Assembly", price: 95, supplier: "LG Parts" },
      { partNumber: "5006EA2001A", name: "Drain Filter Housing", price: 35, supplier: "LG Parts" }
    ],
    quickFix: "LG coin trap is on the LEFT side, not right like home units. Clean it for 85% fix rate.",
    testModeEntry: "Hold 'Rinse+Spin + Power' for 3 seconds",
    eraCompatibility: "2005-2025",
    modelSeries: "Giant-C, Titan-C"
  },
  {
    code: "IE",
    manufacturer: "LG",
    machineType: "washer",
    title: "Inlet Error",
    description: "No water entering machine or fill timeout.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply off",
      "Clogged inlet screens",
      "Inlet valve failure",
      "Low water pressure"
    ],
    troubleshootingSteps: [
      "Verify water supply valves are open",
      "Clean inlet screens at hose connections",
      "Check water pressure (need 20+ PSI)",
      "Test inlet valve with multimeter"
    ],
    partsWithPricing: [
      { partNumber: "5220FR2006H", name: "Water Inlet Valve", price: 65, supplier: "LG Parts" },
      { partNumber: "5231FA2006K", name: "Inlet Screen Set", price: 8, supplier: "LG Parts" }
    ],
    quickFix: "Clean inlet screens at hose connections - 85% fix rate.",
    testModeEntry: "Hold 'Rinse+Spin + Power' for 3 seconds",
    eraCompatibility: "2005-2025",
    modelSeries: "Giant-C, Titan-C"
  },
  {
    code: "UE",
    manufacturer: "LG",
    machineType: "washer",
    title: "Unbalance Error",
    description: "Load is unbalanced during spin cycle.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 10,
    possibleCauses: [
      "Uneven load distribution",
      "Single heavy item",
      "Worn shock absorbers",
      "Machine not level"
    ],
    troubleshootingSteps: [
      "Redistribute load evenly",
      "Add similar items for balance",
      "Check machine is level",
      "Inspect shock absorbers for leaks"
    ],
    partsWithPricing: [
      { partNumber: "4901FA1775A", name: "Shock Absorber Set", price: 95, supplier: "LG Parts" }
    ],
    quickFix: "Redistribute load or add items for balance. Check shocks if error happens on empty cycle.",
    testModeEntry: "Hold 'Rinse+Spin + Power' for 3 seconds",
    eraCompatibility: "2005-2025",
    modelSeries: "Giant-C, Titan-C"
  },
  {
    code: "dE",
    manufacturer: "LG",
    machineType: "washer",
    title: "Door Error",
    description: "Door not properly closed or door lock failure.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 20,
    possibleCauses: [
      "Door not fully closed",
      "Door lock switch failure",
      "Door strike misaligned",
      "Wiring issue"
    ],
    troubleshootingSteps: [
      "Push door firmly to ensure full closure",
      "Clean door strike and latch",
      "Test door lock switch",
      "Check wiring harness to lock"
    ],
    partsWithPricing: [
      { partNumber: "6601ER1004E", name: "Door Lock Assembly", price: 75, supplier: "LG Parts" },
      { partNumber: "MDP62619301", name: "Door Strike", price: 18, supplier: "LG Parts" }
    ],
    quickFix: "Push door firmly shut. Clean latch with WD-40. Replace lock if switch tests bad.",
    testModeEntry: "Hold 'Rinse+Spin + Power' for 3 seconds",
    eraCompatibility: "2005-2025",
    modelSeries: "Giant-C, Titan-C"
  },

  // ═══════════════════════════════════════════════════════════════════
  // ELECTROLUX PROFESSIONAL
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "E21",
    manufacturer: "Electrolux",
    machineType: "washer",
    title: "Drain Timeout",
    description: "Water did not drain within allowed time.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Clogged pump filter",
      "Kinked drain hose",
      "Pump impeller blocked",
      "Drain pump failure"
    ],
    troubleshootingSteps: [
      "Locate and clean pump filter (front lower right)",
      "This is ALWAYS the $12 pump filter - never the pump",
      "Check drain hose routing",
      "Test pump motor only if filter is clear"
    ],
    partsWithPricing: [
      { partNumber: "131102800", name: "Pump Filter", price: 12, supplier: "Electrolux Parts" },
      { partNumber: "137108100", name: "Drain Pump", price: 85, supplier: "Electrolux Parts" }
    ],
    quickFix: "Electrolux E21 is ALWAYS the $12 pump filter - never the pump. Clean it and you're done.",
    testModeEntry: "Hold '90°C + Start' buttons",
    eraCompatibility: "2000-2025",
    modelSeries: "W-Series, WH6"
  },
  {
    code: "E10",
    manufacturer: "Electrolux",
    machineType: "washer",
    title: "Fill Timeout",
    description: "Machine did not fill with water in time.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply off",
      "Clogged inlet screens",
      "Inlet valve failure",
      "Low water pressure"
    ],
    troubleshootingSteps: [
      "Verify water supply is on",
      "Clean inlet screens with toothbrush",
      "Swap hot/cold hoses to test (HO_SE = hose swap error)",
      "Test inlet valve"
    ],
    partsWithPricing: [
      { partNumber: "134190200", name: "Water Inlet Valve", price: 55, supplier: "Electrolux Parts" },
      { partNumber: "131063500", name: "Inlet Screen Kit", price: 8, supplier: "Electrolux Parts" }
    ],
    quickFix: "Clean inlet screens first - 85% fix. If HO_SE error appears, hoses are swapped hot/cold.",
    testModeEntry: "Hold '90°C + Start' buttons",
    eraCompatibility: "2000-2025",
    modelSeries: "W-Series, WH6"
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAYTAG COMMERCIAL
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "F21",
    manufacturer: "Maytag",
    machineType: "washer",
    title: "Long Drain",
    description: "Drain cycle exceeded 8 minutes.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Coin/debris in drain boot hose",
      "Clogged pump filter",
      "Kinked drain hose",
      "Pump failure"
    ],
    troubleshootingSteps: [
      "Check rubber boot hose for coins - shake it out",
      "Clean pump filter",
      "Check drain hose for kinks",
      "Test pump motor"
    ],
    partsWithPricing: [
      { partNumber: "W10130913", name: "Drain Pump", price: 75, supplier: "Whirlpool Parts" },
      { partNumber: "W10340443", name: "Drain Boot Hose", price: 35, supplier: "Whirlpool Parts" }
    ],
    quickFix: "Maytag F21: Coin in the rubber boot hose - shake it out. This is the fix 90% of the time.",
    testModeEntry: "Press 'Soil + Spin' 3 times fast",
    eraCompatibility: "2005-2025",
    modelSeries: "MHN, MFR Series"
  },
  {
    code: "F20",
    manufacturer: "Maytag",
    machineType: "washer",
    title: "No Water Detected",
    description: "No water entering machine during fill.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply off",
      "Clogged inlet screens",
      "Inlet valve failure",
      "Pressure switch issue"
    ],
    troubleshootingSteps: [
      "Verify water supply valves are open",
      "Clean inlet screens",
      "Test inlet valve",
      "Check pressure switch hose for clog"
    ],
    partsWithPricing: [
      { partNumber: "W10276398", name: "Water Inlet Valve", price: 55, supplier: "Whirlpool Parts" },
      { partNumber: "W10304342", name: "Pressure Switch", price: 45, supplier: "Whirlpool Parts" }
    ],
    quickFix: "Clean inlet screens first - they get clogged with sediment from water supply.",
    testModeEntry: "Press 'Soil + Spin' 3 times fast",
    eraCompatibility: "2005-2025",
    modelSeries: "MHN, MFR Series"
  },

  // ═══════════════════════════════════════════════════════════════════
  // CONTINENTAL GIRBAU
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "Alm-A",
    manufacturer: "Continental Girbau",
    machineType: "washer",
    title: "Water Level Alarm",
    description: "Water level sensor detecting abnormal level.",
    severity: "medium",
    skillLevel: "intermediate",
    estimatedRepairTime: 25,
    possibleCauses: [
      "Pressure sensor failure",
      "Air trap clogged",
      "Pressure hose disconnected",
      "Control board issue"
    ],
    troubleshootingSteps: [
      "Check pressure hose connection to sensor",
      "Clear air trap of debris",
      "Test pressure sensor",
      "Verify sensor input at control board"
    ],
    partsWithPricing: [
      { partNumber: "CG-181420", name: "Pressure Sensor", price: 65, supplier: "CG Parts" },
      { partNumber: "CG-181421", name: "Pressure Hose Kit", price: 18, supplier: "CG Parts" }
    ],
    quickFix: "Check pressure hose is connected and not kinked. Clear air trap if present.",
    testModeEntry: "Press and hold first 2 buttons on control panel",
    eraCompatibility: "2000-2025",
    modelSeries: "HS, GFlex Series"
  },

  // ═══════════════════════════════════════════════════════════════════
  // MIELE PROFESSIONAL
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "F10",
    manufacturer: "Miele",
    machineType: "washer",
    title: "Water Intake Fault",
    description: "Insufficient water intake detected.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply closed",
      "Inlet screens clogged",
      "Inlet valve failure",
      "Low water pressure"
    ],
    troubleshootingSteps: [
      "Check water supply is on",
      "Clean inlet screens",
      "Verify adequate water pressure",
      "Test inlet valve"
    ],
    partsWithPricing: [
      { partNumber: "4308411", name: "Inlet Valve", price: 85, supplier: "Miele Parts" },
      { partNumber: "3017611", name: "Inlet Screen Set", price: 15, supplier: "Miele Parts" }
    ],
    quickFix: "Clean inlet screens - same fix as most brands.",
    testModeEntry: "Hold 'Cotton + Start' for 6 seconds",
    eraCompatibility: "2000-2025",
    modelSeries: "PW Series"
  },

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENT SYSTEMS - GREENWALD
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "EC_01",
    manufacturer: "Greenwald",
    machineType: "payment",
    title: "Communication Error",
    description: "Card reader cannot communicate with machine control board.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Loose communication cable",
      "Antenna coil disconnected",
      "Reader board failure",
      "Machine control board issue"
    ],
    troubleshootingSteps: [
      "Check 6-flash LED pattern = reseat white ID chip on reader",
      "Verify all cable connections",
      "Reboot reader - power cycle at breaker",
      "Test with known-good reader if available"
    ],
    partsWithPricing: [
      { partNumber: "GW-81041", name: "Antenna Coil", price: 30, supplier: "Greenwald" },
      { partNumber: "GW-72500", name: "Card Reader Assembly", price: 185, supplier: "Greenwald" }
    ],
    quickFix: "6-flash LED pattern: Just reseat the white ID chip on the reader - takes 30 seconds.",
    testModeEntry: "Hold Reader Reset Button for 5 seconds",
    eraCompatibility: "2010-2025",
    modelSeries: "M-Series, V-Series"
  },
  {
    code: "OFFLINE",
    manufacturer: "Greenwald",
    machineType: "payment",
    title: "Network Offline",
    description: "Card reader lost network connection.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 10,
    possibleCauses: [
      "WiFi signal weak",
      "Antenna disconnected",
      "Router issue",
      "Server outage"
    ],
    troubleshootingSteps: [
      "Power cycle at machine breaker - 90% fix",
      "Check WiFi signal strength",
      "Verify antenna is connected",
      "Test network connectivity"
    ],
    partsWithPricing: [
      { partNumber: "GW-81041", name: "Antenna Coil", price: 30, supplier: "Greenwald" }
    ],
    quickFix: "Cycle the breaker on the machine - 90% of offline issues are fixed instantly.",
    testModeEntry: "Hold Reader Reset Button for 5 seconds",
    eraCompatibility: "2010-2025",
    modelSeries: "M-Series, V-Series"
  },

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENT SYSTEMS - NAYAX
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "OFFLINE",
    manufacturer: "Nayax",
    machineType: "payment",
    title: "Network Offline",
    description: "VPOS reader lost cellular or WiFi connection.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 10,
    possibleCauses: [
      "Weak cellular signal",
      "Antenna issue",
      "SIM card problem",
      "Server outage"
    ],
    troubleshootingSteps: [
      "Power cycle at machine breaker - 90% fixed",
      "Check antenna is properly connected",
      "Verify cellular signal strength on display",
      "Contact Nayax if persistent"
    ],
    partsWithPricing: [
      { partNumber: "NAY-ANT-01", name: "External Antenna", price: 35, supplier: "Nayax" }
    ],
    quickFix: "Cycle the breaker on the machine - antenna is usually fine, just needs a reboot.",
    testModeEntry: "Access through VPOS menu system",
    eraCompatibility: "2015-2025",
    modelSeries: "VPOS Touch, VPOS Fusion"
  },

  // ═══════════════════════════════════════════════════════════════════
  // PAYMENT SYSTEMS - PAYRANGE
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "OFFLINE",
    manufacturer: "PayRange",
    machineType: "payment",
    title: "Bluetooth Offline",
    description: "PayRange BluKey not connecting to network.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 10,
    possibleCauses: [
      "Weak cellular signal",
      "Power issue",
      "Firmware needs update",
      "Hardware failure"
    ],
    troubleshootingSteps: [
      "Power cycle at machine breaker",
      "Check LED indicators on BluKey",
      "Verify power connection",
      "Contact PayRange if persistent"
    ],
    partsWithPricing: [
      { partNumber: "PR-BLUKEY2", name: "BluKey Gen2", price: 95, supplier: "PayRange" }
    ],
    quickFix: "Power cycle at the machine breaker. Check that the BluKey LED is solid blue.",
    testModeEntry: "Use PayRange Pro app for diagnostics",
    eraCompatibility: "2015-2025",
    modelSeries: "BluKey, BluKey Gen2"
  },

  // ═══════════════════════════════════════════════════════════════════
  // WASCOMAT
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "W001",
    manufacturer: "Wascomat",
    machineType: "washer",
    title: "Door Lock Error",
    description: "Door lock did not engage properly.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 20,
    possibleCauses: [
      "Door lock failure",
      "Door not closing fully",
      "Wiring issue",
      "Control board output"
    ],
    troubleshootingSteps: [
      "Check door closes completely",
      "Clean door strike",
      "Test door lock mechanism",
      "Check wiring to lock"
    ],
    partsWithPricing: [
      { partNumber: "WC-471881", name: "Door Lock Assembly", price: 95, supplier: "Wascomat Parts" }
    ],
    quickFix: "Clean door strike with WD-40 first. Check door alignment if still not locking.",
    testModeEntry: "Hold key 1 + key 6 on keypad",
    eraCompatibility: "2000-2025",
    modelSeries: "SU, EX, Selecta Series"
  },

  // ═══════════════════════════════════════════════════════════════════
  // MILNOR
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "E1",
    manufacturer: "Milnor",
    machineType: "washer",
    title: "Fill Timeout",
    description: "Machine did not fill within allowed time.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply closed",
      "Inlet valve failure",
      "Clogged screens",
      "Low pressure"
    ],
    troubleshootingSteps: [
      "Check water supply valves",
      "Clean inlet screens",
      "Test inlet valve",
      "Verify water pressure"
    ],
    partsWithPricing: [
      { partNumber: "MIL-54081Z", name: "Inlet Valve", price: 75, supplier: "Milnor Parts" }
    ],
    quickFix: "Check water supply and clean inlet screens - same as most brands.",
    testModeEntry: "Consult service manual for specific model",
    eraCompatibility: "1995-2025",
    modelSeries: "All Milnor washer-extractors"
  },

  // ═══════════════════════════════════════════════════════════════════
  // CISSELL
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "E:HT",
    manufacturer: "Cissell",
    machineType: "dryer",
    title: "Heating Error",
    description: "Dryer not reaching target temperature.",
    severity: "high",
    skillLevel: "intermediate",
    estimatedRepairTime: 30,
    possibleCauses: [
      "Gas coils failure",
      "Igniter failure",
      "Thermal fuse open",
      "Flame sensor dirty"
    ],
    troubleshootingSteps: [
      "Clean exhaust and lint system first",
      "Check if igniter glows",
      "If glows but no flame = coils",
      "If no glow = thermal fuse or igniter"
    ],
    partsWithPricing: [
      { partNumber: "279834", name: "Gas Coil Kit", price: 25, supplier: "Whirlpool" },
      { partNumber: "CIS-70587401", name: "Igniter", price: 55, supplier: "Cissell Parts" }
    ],
    quickFix: "Same as Speed Queen dryers - check coils and igniter. Clean exhaust first.",
    testModeEntry: "Hold first 2 buttons on control panel",
    eraCompatibility: "1995-2025",
    modelSeries: "All Cissell commercial dryers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // DOMUS
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "AL01",
    manufacturer: "Domus",
    machineType: "washer",
    title: "Fill Error",
    description: "Water fill timeout.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply off",
      "Inlet screens clogged",
      "Inlet valve failure"
    ],
    troubleshootingSteps: [
      "Check water supply",
      "Clean inlet screens",
      "Test inlet valve"
    ],
    partsWithPricing: [
      { partNumber: "DOM-145432", name: "Inlet Valve", price: 65, supplier: "Domus Parts" }
    ],
    quickFix: "Clean inlet screens - universal fix for fill errors.",
    testModeEntry: "Consult service manual",
    eraCompatibility: "2000-2025",
    modelSeries: "All Domus commercial washers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRIMUS (Alliance)
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "F1",
    manufacturer: "Primus",
    machineType: "washer",
    title: "Fill Timeout",
    description: "Machine did not fill within allowed time.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply off",
      "Inlet screens clogged",
      "Inlet valve failure",
      "Low water pressure"
    ],
    troubleshootingSteps: [
      "Check water supply valves",
      "Clean inlet screens (85% fix)",
      "Test inlet valve coils",
      "Verify water pressure"
    ],
    partsWithPricing: [
      { partNumber: "F808213P", name: "Inlet Valve", price: 55, supplier: "Alliance Parts" }
    ],
    quickFix: "Clean inlet screens - same fix as Speed Queen/Huebsch.",
    testModeEntry: "Same as Speed Queen - Delicates + Cold buttons",
    eraCompatibility: "2000-2025",
    modelSeries: "All Primus commercial washers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // IPSO (Alliance)
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "E-FL",
    manufacturer: "IPSO",
    machineType: "washer",
    title: "Fill Error",
    description: "No water fill detected within timeout.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply closed",
      "Inlet screens clogged",
      "Inlet valve failure"
    ],
    troubleshootingSteps: [
      "Verify water supply is on",
      "Clean inlet screens with toothbrush",
      "Test inlet valve"
    ],
    partsWithPricing: [
      { partNumber: "F808213P", name: "Inlet Valve", price: 55, supplier: "Alliance Parts" }
    ],
    quickFix: "Alliance family - clean inlet screens for 85% fix rate.",
    testModeEntry: "Same as Speed Queen controls",
    eraCompatibility: "2000-2025",
    modelSeries: "All IPSO commercial washers"
  },
  {
    code: "E-dr",
    manufacturer: "IPSO",
    machineType: "washer",
    title: "Drain Error",
    description: "Water not draining from tub.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Clogged pump filter",
      "Kinked drain hose",
      "Pump failure"
    ],
    troubleshootingSteps: [
      "Clean pump filter/coin trap - 70% fix",
      "Check drain hose for kinks",
      "Test drain pump motor"
    ],
    partsWithPricing: [
      { partNumber: "F802118P", name: "Drain Pump", price: 89, supplier: "Alliance Parts" }
    ],
    quickFix: "Clean pump filter - same as Speed Queen.",
    testModeEntry: "Same as Speed Queen controls",
    eraCompatibility: "2000-2025",
    modelSeries: "All IPSO commercial washers"
  },

  // ═══════════════════════════════════════════════════════════════════
  // UNIMAC (Alliance)
  // ═══════════════════════════════════════════════════════════════════
  {
    code: "nFL",
    manufacturer: "UniMac",
    machineType: "washer",
    title: "No Fill",
    description: "Machine not filling with water.",
    severity: "medium",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Water supply off",
      "Inlet screens clogged",
      "Inlet valve failure"
    ],
    troubleshootingSteps: [
      "Check water supply",
      "Clean inlet screens",
      "Test inlet valve"
    ],
    partsWithPricing: [
      { partNumber: "F808213P", name: "Inlet Valve", price: 55, supplier: "Alliance Parts" }
    ],
    quickFix: "Alliance family - clean inlet screens.",
    testModeEntry: "Same as Speed Queen - Delicates + Cold",
    eraCompatibility: "2000-2025",
    modelSeries: "UC/UW/UF Series"
  },
  {
    code: "ndr",
    manufacturer: "UniMac",
    machineType: "washer",
    title: "No Drain",
    description: "Water not draining from machine.",
    severity: "high",
    skillLevel: "basic",
    estimatedRepairTime: 15,
    possibleCauses: [
      "Clogged pump filter",
      "Drain hose kinked",
      "Pump failure"
    ],
    troubleshootingSteps: [
      "Clean pump filter",
      "Check drain hose",
      "Test pump motor"
    ],
    partsWithPricing: [
      { partNumber: "F802118P", name: "Drain Pump", price: 89, supplier: "Alliance Parts" }
    ],
    quickFix: "Clean pump filter - 70% fix rate.",
    testModeEntry: "Same as Speed Queen - Delicates + Cold",
    eraCompatibility: "2000-2025",
    modelSeries: "UC/UW/UF Series"
  }
];

function slugify(manufacturer: string, code: string): string {
  return `${manufacturer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
}

export async function seedErrorCodes(): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log("Starting comprehensive error code seeding...");
  console.log(`Processing ${DETAILED_ERROR_CODES.length} detailed error codes...`);

  for (const errorCode of DETAILED_ERROR_CODES) {
    try {
      const slug = slugify(errorCode.manufacturer, errorCode.code);
      
      const metaTitle = `${errorCode.manufacturer} ${errorCode.code} Error Code - Fix Guide | WashBizHub`;
      const metaDescription = `How to fix ${errorCode.manufacturer} error code ${errorCode.code}: ${errorCode.title}. ${errorCode.quickFix} Parts, pricing, and step-by-step repair instructions.`;

      await db.insert(diagnosticCodes).values({
        code: errorCode.code,
        manufacturer: errorCode.manufacturer,
        slug,
        title: errorCode.title,
        description: errorCode.description,
        severity: errorCode.severity,
        machineType: errorCode.machineType,
        possibleCauses: errorCode.possibleCauses,
        troubleshootingSteps: errorCode.troubleshootingSteps,
        skillLevel: errorCode.skillLevel,
        estimatedRepairTime: errorCode.estimatedRepairTime,
        partsWithPricing: errorCode.partsWithPricing,
        quickFix: errorCode.quickFix,
        testModeEntry: errorCode.testModeEntry,
        eraCompatibility: errorCode.eraCompatibility,
        modelSeries: errorCode.modelSeries,
        metaTitle,
        metaDescription,
      }).onConflictDoUpdate({
        target: diagnosticCodes.slug,
        set: {
          title: errorCode.title,
          description: errorCode.description,
          severity: errorCode.severity,
          machineType: errorCode.machineType,
          possibleCauses: errorCode.possibleCauses,
          troubleshootingSteps: errorCode.troubleshootingSteps,
          skillLevel: errorCode.skillLevel,
          estimatedRepairTime: errorCode.estimatedRepairTime,
          partsWithPricing: errorCode.partsWithPricing,
          quickFix: errorCode.quickFix,
          testModeEntry: errorCode.testModeEntry,
          eraCompatibility: errorCode.eraCompatibility,
          modelSeries: errorCode.modelSeries,
          metaTitle,
          metaDescription,
        }
      });

      inserted++;
      console.log(`✓ ${errorCode.manufacturer} ${errorCode.code}`);
    } catch (error: any) {
      errors.push(`${errorCode.manufacturer} ${errorCode.code}: ${error.message}`);
      console.error(`✗ ${errorCode.manufacturer} ${errorCode.code}: ${error.message}`);
    }
  }

  console.log(`\nSeeding complete: ${inserted} inserted/updated, ${skipped} skipped, ${errors.length} errors`);
  return { inserted, skipped, errors };
}
