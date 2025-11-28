import { db } from "./db";
import { diagnosticCodes } from "@shared/schema";

const BRANDS_AND_CODES: Record<string, string[]> = {
  "Advantage Laundry": ["CODE", "GUIDE"],
  "AEG": ["E10", "E11", "E13", "E20", "E21", "E22", "E23", "E24", "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E3A", "E40", "E41", "E42", "E43", "E44", "E45", "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E5A", "E5B", "E5C", "E5D", "E5E", "E5F", "E61", "E62", "E66", "E68", "E71", "E74", "E82", "E83", "E84", "E85", "E91", "E92", "E93", "E94", "E95", "E96", "E97", "E98", "E99", "E9A", "EA1", "EA2", "EA3", "EA4", "EA5", "EA6", "EB1", "EB2", "EB3", "EBE", "EBF", "EC1", "EC2", "EF1", "EF2", "EF3", "EF4", "EF5", "EH1", "EH2", "EH3"],
  "Alliance SE": ["E:DL", "E:DR", "E:FL", "E:HT", "E:LE", "E:TE", "E:UE"],
  "American Dryer": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"],
  "ASKO": ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"],
  "Beko": ["D01", "D02", "D03", "D04", "D05", "D06", "H1", "H2", "H3", "H4", "H5", "H6", "H7"],
  "Bosch": ["E01", "E02", "E03", "E04", "E11", "E13", "E17", "E18", "E21", "E22", "E23", "E27", "E28", "E29", "E31", "E43", "E44", "E57", "E59", "E61", "E67"],
  "Brastemp": ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08"],
  "Candy": ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09"],
  "Chicago Dryer": ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"],
  "Cissell": ["ER:D1", "ER:DL", "ER:DR", "ER:DU", "ER:FL", "ER:HT", "ER:OF", "ER:OP", "ER:SH", "ER:TE", "ER:UB", "ER:VB"],
  "Crossover": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"],
  "Danube": ["ERR1", "ERR2", "ERR3", "ERR4", "ERR5", "ERR6", "ERR7", "ERR8", "ERR9", "ERR10"],
  "Dexter": ["COMM_ERROR_1", "COMM_ERROR_2", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F16", "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24", "F25", "F26", "F27", "F28", "PCB_ERROR_2"],
  "Domus": ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  "Electrolux": ["E11", "E13", "E21", "E23", "E24", "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E41", "E42", "E43", "E44", "E45", "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E5A", "E5B", "E5C", "E5D", "E5E", "E5F", "E61", "E62", "E66", "E68", "E71", "E74", "E82", "E83", "E84", "E85", "E91", "E92", "E93", "E94", "E95", "E96", "E97", "EA1", "EA2", "EA3", "EA4", "EA5", "EA6", "EB1", "EB2", "EB3", "EBE", "EBF", "EC1", "EC2", "EF1", "EF2", "EF3", "EF4", "EF5", "EH1", "EH2", "EH3", "EHE", "EHF"],
  "Fisher & Paykel": ["C1", "C2", "C3", "D1", "D2", "D3", "F1", "F2", "F3", "F4", "F5", "H1", "H2", "M1", "M2", "M3", "M4", "P1", "P2", "S1", "S2", "U1", "U2"],
  "Frigidaire": ["E10", "E11", "E13", "E20", "E21", "E23", "E30", "E31", "E35", "E40", "E41", "E43", "E44", "E50", "E51", "E52", "E53", "E56", "E57", "E60", "E61", "E62", "E66", "E70", "E71", "E80", "E90", "E91", "E94"],
  "GE": ["E10", "E11", "E20", "E21", "E22", "E23", "E30", "E31", "E40", "E41", "E42", "E43", "E50", "E51", "E52", "E60", "E61", "E62", "E70", "E71"],
  "Girbau": ["ALn/U-04", "ALn/U-09", "ALn/U-47", "ALn/U-48", "ALn/U-49", "ALn/U-55", "ALn/U-59", "ALn/V-10", "ALn/V-11", "ALn/V-12", "ALn/V-13", "ALn/VAR0", "ALn/VAR1", "ALn/VAR2", "ALn/VAR4", "ALn/VAR5", "ALn/VAR6", "ALn/VAR7", "ALn/VAR8", "ALn/VAR9", "UA11", "UA12", "UA13", "UA14", "UA15", "UA16", "UA17", "UA18", "UA19", "UA20", "UA21", "UA22", "UA23", "UA24", "UA25", "UA27", "UA28", "UA29", "UA30", "UA31", "UA32", "UA33", "UA35", "UA36"],
  "Gorenje": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
  "Haier": ["4006", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12"],
  "Hotpoint": ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "H20"],
  "Huebsch": ["E:CE", "E:DL", "E:DR", "E:FL", "E:HE", "E:IE", "E:LE", "E:OE", "E:PE", "E:SE", "E:TE", "E:UE"],
  "Indesit": ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18"],
  "IPSO": ["ER:BB", "ER:BS", "ER:CO", "ER:D1", "ER:DL", "ER:DO", "ER:DR", "ER:DS", "ER:DU", "ER:FL", "ER:HD", "ER:HT", "ER:LE", "ER:LF", "ER:NF", "ER:NR", "ER:OF", "ER:OP", "ER:PS", "ER:SD", "ER:SH", "ER:SL", "ER:TE", "ER:UB", "ER:VB"],
  "Jensen": ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"],
  "Kenmore": ["DL", "F01", "F02", "F05", "F06", "F07", "F09", "F10", "F11", "F13", "F14", "F15", "F20", "F21", "F22", "F23", "F24", "F26", "F27", "F28", "F29", "F30", "F31", "F33", "HC", "LD", "SUD"],
  "Lavatec": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10"],
  "LG": ["AE", "CE", "DE", "EE", "FE", "HE", "IE", "LE", "OE", "PE", "PF", "SE", "TE", "UE"],
  "Maytag Washer": ["F01", "F03", "F04", "F07", "F11", "F20", "F21", "F22", "F24", "F25", "F26", "F27", "F28", "F29", "F30", "F31", "F32", "F33", "F34", "F70", "F71", "F73", "F74", "F77", "d1", "d2", "d3", "d4", "d5", "d7", "d8", "d9", "d10", "d11", "d12", "d13", "d14", "d16", "d17", "d18", "d19", "d20"],
  "Maytag Dryer": ["AF", "F-01", "F-02", "F-03", "F-22", "F-23", "F-26", "F-28", "F-29", "L2", "PF"],
  "Miele": ["F01", "F02", "F03", "F04", "F10", "F11", "F15", "F16", "F19", "F20", "F29", "F34", "F35", "F39", "F41", "F43", "F46", "F51", "F53", "F56", "F62", "F63", "F65", "F67", "F81", "F92", "F100"],
  "Milnor": ["E-1", "E-2", "E-3", "E-4", "E-5", "E-6", "E-7", "E-8", "E-9", "E-10", "E-11", "E-12", "E-13", "E-14", "E-15"],
  "Panasonic": ["H01", "H02", "H03", "U11", "U12", "U13", "U14", "U15"],
  "Payment Systems": ["EC:01", "EC:02", "EC:03", "EC:04", "EC:05", "EC:06", "EC:07", "EC:08", "EC:09", "EC:10"],
  "Pellerin Milnor": ["AL-1", "AL-2", "AL-3", "AL-4", "AL-5", "AL-6", "AL-7", "AL-8", "AL-9", "AL-10"],
  "Primus": ["E:01", "E:02", "E:03", "E:04", "E:05", "E:06", "E:07", "E:08", "E:09", "E:10", "E:11", "E:12", "E:13", "E:14", "E:15"],
  "Samsung": ["1E", "4E", "5E", "6E", "7E", "8E", "9E", "AE", "BE", "CE", "DE", "FE", "HE", "LE", "OE", "TE", "UE"],
  "Schulthess": ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10"],
  "Sharp": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"],
  "Smeg": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
  "Speed Queen": ["E:0d", "E:59", "E:60", "E:61", "E:Pr", "E:SP", "E:Ub", "E:co", "E:dF", "E:dr", "E:ds", "E:id", "E:nr", "E:ns", "E:op", "E:ro", "E:sh", "EC:06", "EC:09", "EC:19", "EC:20", "EC:21", "EC:22", "EC:23", "Er:Co", "Er:FL", "Er:Hd", "Er:Ht", "Er:LE", "Er:LF", "Er:OF", "Er:PS", "Er:SH", "Er:SL", "Er:Sd", "Er:bS", "Er:bb", "Er:d1", "Er:dL", "Er:dS", "Er:dU", "Er:do", "Er:dr", "Er:nF", "Er:nr", "Er:oP", "Er:tE", "Er:ub", "Er:vb"],
  "Speed Queen Dryer": ["E:AF", "E:BS", "E:DO", "E:FL", "E:HT", "E:IG", "E:OP", "E:SH", "E:TL", "E:TP"],
  "Toshiba": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"],
  "UniMac": ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12"],
  "Wascomat": ["7", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"],
  "Whirlpool": ["DL", "F01", "F02", "F03", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F13", "F14", "F15", "F20", "F21", "F22", "F23", "F24", "F26", "F27", "F28", "F29", "F30", "F31", "F33", "F34", "HC", "LD", "LO", "SUD"],
};

const ERROR_CODE_DETAILS: Record<string, Record<string, { title: string; description: string; severity: string; machineType: string; possibleCauses: string[]; troubleshootingSteps: string[]; }>> = {
  "Speed Queen": {
    "E:dF": { title: "Door Fault", description: "Door lock mechanism failure or door not properly closed", severity: "high", machineType: "washer", possibleCauses: ["Door switch malfunction", "Door latch broken", "Wiring harness damage"], troubleshootingSteps: ["Check door is fully closed", "Inspect door switch", "Check wiring connections"] },
    "E:dr": { title: "Drain Error", description: "Water not draining from tub within timeout", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain pump", "Drain hose kinked", "Pump motor failure"], troubleshootingSteps: ["Check drain hose for kinks", "Clear drain pump of debris", "Test drain pump motor"] },
    "Er:dL": { title: "Door Lock Failure", description: "Door lock mechanism failed to engage", severity: "high", machineType: "washer", possibleCauses: ["Door lock solenoid failure", "Door strike misaligned", "Lock mechanism jammed"], troubleshootingSteps: ["Verify door closes completely", "Test door lock solenoid", "Check for debris"] },
    "Er:FL": { title: "Fill Error", description: "Machine did not fill with water within timeout", severity: "medium", machineType: "washer", possibleCauses: ["Water supply valves closed", "Inlet valve failure", "Water pressure too low"], troubleshootingSteps: ["Verify water supply valves are open", "Check water pressure", "Clean inlet valve screens"] },
    "Er:Ht": { title: "Heater Error", description: "Water not reaching temperature within time limit", severity: "medium", machineType: "washer", possibleCauses: ["Heater element failure", "Thermistor failure", "Control board issue"], troubleshootingSteps: ["Test heater element", "Check thermistor", "Verify control board output"] },
  },
  "Dexter": {
    "F1": { title: "Door Lock Error", description: "Door lock mechanism not engaging properly", severity: "high", machineType: "washer", possibleCauses: ["Door lock solenoid failure", "Wiring issue", "Control board fault"], troubleshootingSteps: ["Check door lock operation", "Inspect wiring", "Test control output"] },
    "F2": { title: "Door Switch Error", description: "Door switch not detecting closed position", severity: "high", machineType: "washer", possibleCauses: ["Door switch failure", "Door not closing", "Wiring open"], troubleshootingSteps: ["Test door switch", "Check door alignment", "Verify wiring"] },
    "F3": { title: "Overflow Error", description: "Water level exceeded safe limit", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck", "Pressure sensor failure", "Air trap clogged"], troubleshootingSteps: ["Shut off water immediately", "Test inlet valves", "Clear air trap"] },
  },
  "LG": {
    "OE": { title: "Drain Error", description: "Water not draining properly from drum", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain filter", "Kinked drain hose", "Drain pump failure"], troubleshootingSteps: ["Clean drain filter", "Check drain hose", "Test drain pump"] },
    "UE": { title: "Unbalanced Load", description: "Load is unbalanced during spin cycle", severity: "medium", machineType: "washer", possibleCauses: ["Uneven load distribution", "Single heavy item", "Suspension issue"], troubleshootingSteps: ["Redistribute load", "Reduce load size", "Check suspension"] },
    "LE": { title: "Motor Error", description: "Motor locked or not operating correctly", severity: "critical", machineType: "washer", possibleCauses: ["Motor failure", "Rotor position sensor", "Overload"], troubleshootingSteps: ["Check for overload", "Test motor", "Inspect rotor sensor"] },
    "DE": { title: "Door Error", description: "Door not properly closed or locked", severity: "high", machineType: "washer", possibleCauses: ["Door switch failure", "Door latch issue", "Control board"], troubleshootingSteps: ["Check door closes fully", "Test door switch", "Inspect latch"] },
    "FE": { title: "Fill Error", description: "Water filling when it should not be", severity: "critical", machineType: "washer", possibleCauses: ["Inlet valve stuck open", "Control board failure", "Pressure switch"], troubleshootingSteps: ["Check inlet valve", "Test pressure switch", "Inspect control board"] },
    "PE": { title: "Pressure Sensor Error", description: "Water level pressure sensor malfunction", severity: "medium", machineType: "washer", possibleCauses: ["Pressure sensor failure", "Clogged air hose", "Control board issue"], troubleshootingSteps: ["Check air hose connection", "Test pressure sensor", "Verify board input"] },
    "TE": { title: "Temperature Error", description: "Temperature sensor reading out of range", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Wiring damage", "Control board"], troubleshootingSteps: ["Test thermistor resistance", "Check wiring", "Test at control board"] },
    "HE": { title: "Heating Error", description: "Water not reaching selected temperature", severity: "medium", machineType: "washer", possibleCauses: ["Heater failure", "Thermistor issue", "Low water level"], troubleshootingSteps: ["Test heater element", "Check thermistor", "Verify water level"] },
    "IE": { title: "Inlet Error", description: "Water not entering the machine", severity: "high", machineType: "washer", possibleCauses: ["Water supply off", "Inlet valve failure", "Clogged screens"], troubleshootingSteps: ["Check water supply", "Clean inlet screens", "Test inlet valve"] },
    "CE": { title: "Current Error", description: "Motor drawing excessive current", severity: "critical", machineType: "washer", possibleCauses: ["Motor overload", "Drive board failure", "Mechanical binding"], troubleshootingSteps: ["Check for overload", "Test drive board", "Inspect for binding"] },
    "PF": { title: "Power Failure", description: "Power interruption during cycle", severity: "low", machineType: "both", possibleCauses: ["Power outage", "Loose connection", "Breaker tripped"], troubleshootingSteps: ["Check power supply", "Verify connections", "Reset machine"] },
  },
  "Whirlpool": {
    "F01": { title: "EEPROM Error", description: "Control board memory failure", severity: "critical", machineType: "washer", possibleCauses: ["Control board failure", "Power surge", "Memory corruption"], troubleshootingSteps: ["Power cycle machine", "Replace control board", "Check for surges"] },
    "F02": { title: "Long Drain", description: "Water not draining in time", severity: "high", machineType: "washer", possibleCauses: ["Clogged drain", "Pump failure", "Kinked hose"], troubleshootingSteps: ["Clear drain system", "Test drain pump", "Check hose routing"] },
    "F05": { title: "Water Temperature Error", description: "Water not reaching temperature", severity: "medium", machineType: "washer", possibleCauses: ["Thermistor failure", "Heater issue", "Supply temperature"], troubleshootingSteps: ["Check supply temperature", "Test thermistor", "Verify heater"] },
    "F21": { title: "Long Drain", description: "Drain time exceeded 8 minutes", severity: "high", machineType: "washer", possibleCauses: ["Drain restriction", "Pump clogged", "Hose kinked"], troubleshootingSteps: ["Check drain path", "Clean pump filter", "Straighten hose"] },
    "SUD": { title: "Suds Detected", description: "Excessive suds in drum", severity: "low", machineType: "washer", possibleCauses: ["Too much detergent", "Wrong detergent type", "Drain issue"], troubleshootingSteps: ["Use less detergent", "Use HE detergent", "Run rinse cycle"] },
    "DL": { title: "Door Lock Error", description: "Door failed to lock", severity: "high", machineType: "washer", possibleCauses: ["Door latch failure", "Lock mechanism", "Control board"], troubleshootingSteps: ["Check door alignment", "Test lock mechanism", "Inspect control"] },
  },
  "Samsung": {
    "5E": { title: "Drain Error", description: "Drainage failure or slow drain", severity: "high", machineType: "washer", possibleCauses: ["Blocked drain filter", "Kinked hose", "Pump failure"], troubleshootingSteps: ["Clean drain filter", "Check hose", "Test pump"] },
    "4E": { title: "Water Supply Error", description: "No water entering machine", severity: "high", machineType: "washer", possibleCauses: ["Water off", "Inlet valve failure", "Clogged filter"], troubleshootingSteps: ["Check water supply", "Clean inlet filter", "Test valve"] },
    "UE": { title: "Unbalanced Load", description: "Load imbalance detected", severity: "medium", machineType: "washer", possibleCauses: ["Uneven distribution", "Single heavy item", "Low load"], troubleshootingSteps: ["Redistribute items", "Add items for balance", "Reduce load"] },
    "DE": { title: "Door Error", description: "Door not closed or locked", severity: "high", machineType: "washer", possibleCauses: ["Door not closed", "Latch failure", "Lock issue"], troubleshootingSteps: ["Close door firmly", "Check latch", "Test lock"] },
    "TE": { title: "Temperature Sensor Error", description: "Temperature reading abnormal", severity: "medium", machineType: "washer", possibleCauses: ["Sensor failure", "Wiring issue", "Board problem"], troubleshootingSteps: ["Test sensor", "Check wiring", "Inspect board"] },
  },
  "Maytag Washer": {
    "F21": { title: "Long Drain", description: "Drain cycle exceeded time limit", severity: "high", machineType: "washer", possibleCauses: ["Clogged pump", "Kinked hose", "Drain restriction"], troubleshootingSteps: ["Clean pump filter", "Check hose", "Clear drain"] },
    "F01": { title: "EEPROM Error", description: "Main control board memory fault", severity: "critical", machineType: "washer", possibleCauses: ["Board failure", "Power surge", "Memory error"], troubleshootingSteps: ["Power cycle", "Check for damage", "Replace board"] },
    "F20": { title: "No Water Detected", description: "No water entering during fill", severity: "high", machineType: "washer", possibleCauses: ["Supply off", "Valve failure", "Pressure switch"], troubleshootingSteps: ["Check supply", "Test valve", "Verify switch"] },
  },
};

function slugify(brand: string, code: string): string {
  return `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
}

function generateDefaultDetails(brand: string, code: string): { title: string; description: string; severity: string; machineType: string; possibleCauses: string[]; troubleshootingSteps: string[]; } {
  const codeUpper = code.toUpperCase();
  
  let title = `Error Code ${code}`;
  let description = `${brand} equipment displaying error code ${code}. This indicates a fault condition that requires attention.`;
  let severity = "medium";
  let machineType = "both";
  let possibleCauses = ["Equipment malfunction", "Sensor issue", "Control board fault", "Wiring problem"];
  let troubleshootingSteps = ["Power cycle the machine", "Check all connections", "Inspect for visible damage", "Consult service manual", "Contact qualified technician"];

  if (codeUpper.includes("DR") || codeUpper.includes("DRAIN")) {
    title = "Drain Error";
    description = `${brand} drain system fault. Water is not draining properly from the machine.`;
    severity = "high";
    machineType = "washer";
    possibleCauses = ["Clogged drain pump", "Kinked drain hose", "Drain pump motor failure", "Control board issue"];
    troubleshootingSteps = ["Check drain hose for kinks", "Clear drain pump filter", "Test drain pump motor", "Verify drain valve operation"];
  } else if (codeUpper.includes("DL") || codeUpper.includes("DOOR") || codeUpper.includes("DO")) {
    title = "Door Lock Error";
    description = `${brand} door lock mechanism fault. The door is not properly locked or the lock has failed.`;
    severity = "high";
    machineType = "washer";
    possibleCauses = ["Door switch failure", "Lock mechanism jam", "Wiring issue", "Control board fault"];
    troubleshootingSteps = ["Check door closes completely", "Inspect door switch", "Test lock mechanism", "Verify wiring connections"];
  } else if (codeUpper.includes("FL") || codeUpper.includes("FILL")) {
    title = "Fill Error";
    description = `${brand} water fill fault. Machine is not filling with water properly.`;
    severity = "high";
    machineType = "washer";
    possibleCauses = ["Water supply closed", "Inlet valve failure", "Low water pressure", "Clogged inlet screens"];
    troubleshootingSteps = ["Verify water supply is on", "Check inlet screens", "Test inlet valve", "Verify water pressure"];
  } else if (codeUpper.includes("HT") || codeUpper.includes("HE") || codeUpper.includes("HEAT")) {
    title = "Heating Error";
    description = `${brand} heating system fault. Water or air is not reaching proper temperature.`;
    severity = "medium";
    machineType = "both";
    possibleCauses = ["Heating element failure", "Thermistor malfunction", "Control board issue", "Power supply problem"];
    troubleshootingSteps = ["Test heating element", "Check thermistor", "Verify power to heater", "Inspect control board"];
  } else if (codeUpper.includes("UE") || codeUpper.includes("UB") || codeUpper.includes("UNBAL")) {
    title = "Unbalance Error";
    description = `${brand} load imbalance detected. The load is not evenly distributed in the drum.`;
    severity = "medium";
    machineType = "washer";
    possibleCauses = ["Uneven load distribution", "Single heavy item", "Suspension damage", "Out-of-balance sensor"];
    troubleshootingSteps = ["Redistribute load evenly", "Remove single heavy items", "Check suspension components", "Test balance sensor"];
  } else if (codeUpper.includes("TE") || codeUpper.includes("TEMP")) {
    title = "Temperature Sensor Error";
    description = `${brand} temperature sensor fault. Sensor reading is out of valid range.`;
    severity = "medium";
    machineType = "both";
    possibleCauses = ["Thermistor failure", "Wiring damage", "Control board input failure", "Connector corrosion"];
    troubleshootingSteps = ["Test thermistor resistance", "Check wiring connections", "Clean connectors", "Replace sensor if faulty"];
  } else if (codeUpper.includes("OF") || codeUpper.includes("OV") || codeUpper.includes("OVER")) {
    title = "Overflow Error";
    description = `${brand} water overflow detected. Water level has exceeded safe operating limits.`;
    severity = "critical";
    machineType = "washer";
    possibleCauses = ["Inlet valve stuck open", "Pressure sensor failure", "Control board malfunction", "Air trap blocked"];
    troubleshootingSteps = ["Shut off water immediately", "Check inlet valve closes", "Test pressure sensor", "Clear air trap"];
  } else if (codeUpper.includes("LE") || codeUpper.includes("MOTOR")) {
    title = "Motor Error";
    description = `${brand} drive motor fault. Motor is not operating correctly or has stalled.`;
    severity = "critical";
    machineType = "both";
    possibleCauses = ["Motor overload", "Rotor sensor failure", "Control board issue", "Mechanical binding"];
    troubleshootingSteps = ["Check for overload", "Test motor connections", "Inspect rotor sensor", "Verify no mechanical binding"];
  } else if (codeUpper.includes("AF") || codeUpper.includes("AIR")) {
    title = "Airflow Error";
    description = `${brand} airflow restriction detected. Insufficient airflow through the exhaust system.`;
    severity = "high";
    machineType = "dryer";
    possibleCauses = ["Lint buildup in duct", "Blocked external vent", "Blower wheel damage", "Long duct run"];
    troubleshootingSteps = ["Clean lint screen", "Clear exhaust duct", "Check external vent", "Inspect blower wheel"];
  } else if (codeUpper.includes("F0") || codeUpper.includes("F1") || codeUpper.includes("EEPROM") || codeUpper.includes("COMM")) {
    title = "Control Board Error";
    description = `${brand} control board or communication fault. Electronic control system failure.`;
    severity = "critical";
    machineType = "both";
    possibleCauses = ["Control board failure", "Power surge damage", "Memory corruption", "Communication failure"];
    troubleshootingSteps = ["Power cycle for 5 minutes", "Check all board connections", "Look for visible damage", "Replace control board if needed"];
  }

  return { title, description, severity, machineType, possibleCauses, troubleshootingSteps };
}

export async function seedErrorCodes(): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log("Starting error code seeding...");
  console.log(`Processing ${Object.keys(BRANDS_AND_CODES).length} brands...`);

  for (const [brand, codes] of Object.entries(BRANDS_AND_CODES)) {
    console.log(`Processing ${brand}: ${codes.length} codes`);
    
    for (const code of codes) {
      try {
        const slug = slugify(brand, code);
        
        const brandDetails = ERROR_CODE_DETAILS[brand];
        const codeDetails = brandDetails?.[code] || generateDefaultDetails(brand, code);
        
        const metaTitle = `${brand} ${code} Error Code - Troubleshooting & Fix | WashBizHub`;
        const metaDescription = `How to fix ${brand} error code ${code}: ${codeDetails.title}. Step-by-step troubleshooting guide, common causes, required parts, and repair solutions.`;

        await db.insert(diagnosticCodes).values({
          code,
          manufacturer: brand,
          slug,
          title: codeDetails.title,
          description: codeDetails.description,
          severity: codeDetails.severity,
          machineType: codeDetails.machineType,
          possibleCauses: codeDetails.possibleCauses,
          troubleshootingSteps: codeDetails.troubleshootingSteps,
          skillLevel: "intermediate",
          metaTitle,
          metaDescription,
        }).onConflictDoNothing();

        inserted++;
      } catch (error: any) {
        if (error.code === '23505') {
          skipped++;
        } else {
          errors.push(`${brand} ${code}: ${error.message}`);
        }
      }
    }
  }

  console.log(`Seeding complete: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`);
  return { inserted, skipped, errors };
}
