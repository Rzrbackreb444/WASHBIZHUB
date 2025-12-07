import { db } from "./db";
import { diagnosticCodes } from "@shared/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface ParsedCode {
  code: string;
  manufacturer: string;
  machineType: string;
  description: string;
  possibleCauses: string[];
  troubleshootingSteps: string[];
  requiredParts: string[];
  partsWithPricing: { partNumber: string; name: string; price?: string }[];
  quickFix: string;
  severity: string;
}

function slugify(manufacturer: string, code: string): string {
  const combined = `${manufacturer}-${code}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

function inferSeverity(code: string, description: string): string {
  const lowerDesc = description.toLowerCase();
  const lowerCode = code.toLowerCase();
  
  if (
    lowerDesc.includes("failure") ||
    lowerDesc.includes("fault") ||
    lowerDesc.includes("fire") ||
    lowerDesc.includes("safety") ||
    lowerDesc.includes("emergency") ||
    lowerDesc.includes("critical")
  ) {
    return "high";
  }
  
  if (
    lowerDesc.includes("error") ||
    lowerDesc.includes("alarm") ||
    lowerDesc.includes("stuck") ||
    lowerDesc.includes("overflow") ||
    lowerDesc.includes("leak")
  ) {
    return "medium";
  }
  
  if (
    lowerDesc.includes("reminder") ||
    lowerDesc.includes("indicator") ||
    lowerDesc.includes("not error") ||
    lowerDesc.includes("service due")
  ) {
    return "low";
  }
  
  return "medium";
}

function inferSkillLevel(description: string, partsCount: number): string {
  const lowerDesc = description.toLowerCase();
  
  if (
    lowerDesc.includes("board") ||
    lowerDesc.includes("inverter") ||
    lowerDesc.includes("motor") ||
    lowerDesc.includes("wiring") ||
    lowerDesc.includes("module") ||
    partsCount > 3
  ) {
    return "professional";
  }
  
  if (
    lowerDesc.includes("sensor") ||
    lowerDesc.includes("valve") ||
    lowerDesc.includes("pump") ||
    lowerDesc.includes("lock")
  ) {
    return "intermediate";
  }
  
  return "basic";
}

function extractParts(text: string): { parts: string[]; partsWithPricing: { partNumber: string; name: string; price?: string }[] } {
  const parts: string[] = [];
  const partsWithPricing: { partNumber: string; name: string; price?: string }[] = [];
  
  const partsMatch = text.match(/Parts:\s*(.+?)(?:\.|$)/i);
  if (partsMatch) {
    const partsSection = partsMatch[1];
    
    const partPatterns = [
      /([^(,]+?)\s*\(([A-Z0-9-]+P?)\s*(?:,?\s*\$?([\d.]+))?\)/gi,
      /([A-Z0-9-]+P)\s*(?:,?\s*\$?([\d.]+))?/gi,
    ];
    
    let match;
    const pattern1 = /([^(,]+?)\s*\(([A-Z0-9-]+P?)\s*(?:,?\s*\$?([\d.]+))?\)/gi;
    while ((match = pattern1.exec(partsSection)) !== null) {
      const name = match[1].trim();
      const partNumber = match[2].trim();
      const price = match[3] ? `$${match[3]}` : undefined;
      
      if (partNumber && !parts.includes(partNumber)) {
        parts.push(partNumber);
        partsWithPricing.push({ partNumber, name, price });
      }
    }
    
    if (parts.length === 0) {
      const pattern2 = /\(([A-Z0-9-]+P?)\)/g;
      while ((match = pattern2.exec(partsSection)) !== null) {
        const partNumber = match[1].trim();
        if (!parts.includes(partNumber)) {
          parts.push(partNumber);
          partsWithPricing.push({ partNumber, name: "Part" });
        }
      }
    }
  }
  
  return { parts, partsWithPricing };
}

function generateQuickFix(description: string, machineType: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("drain")) {
    return "Check and clean the drain pump filter first - this resolves 70% of drain issues.";
  }
  if (lowerDesc.includes("door") && (lowerDesc.includes("lock") || lowerDesc.includes("latch"))) {
    return "Verify door is fully closed and check door switch for debris or damage.";
  }
  if (lowerDesc.includes("fill") || lowerDesc.includes("water inlet")) {
    return "Check water supply valves are fully open and inlet screens are not clogged.";
  }
  if (lowerDesc.includes("overflow")) {
    return "Immediately check inlet valve for stuck condition and verify water level sensor.";
  }
  if (lowerDesc.includes("unbalance")) {
    return "Redistribute load evenly and ensure machine is level on the floor.";
  }
  if (lowerDesc.includes("heat") || lowerDesc.includes("temp")) {
    return "Verify heating element continuity and check temperature sensor connections.";
  }
  if (lowerDesc.includes("motor") || lowerDesc.includes("drive")) {
    return "Check motor connections and verify no mechanical obstructions in the drum.";
  }
  if (lowerDesc.includes("coin") || lowerDesc.includes("card")) {
    return "Clear any debris from the coin mechanism and reset the payment system.";
  }
  if (lowerDesc.includes("power") || lowerDesc.includes("voltage")) {
    return "Verify proper voltage at outlet and check circuit breaker.";
  }
  if (lowerDesc.includes("communication") || lowerDesc.includes("comm")) {
    return "Check all cable connections between control boards and power cycle the machine.";
  }
  
  return "Power cycle the machine and check all connections before further diagnostics.";
}

function generateTroubleshootingSteps(description: string, machineType: string): string[] {
  const steps: string[] = [
    "Power off the machine and wait 30 seconds before restarting",
    "Check the error code display and note any additional indicators",
  ];
  
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("drain")) {
    steps.push(
      "Locate and clean the drain pump filter",
      "Check drain hose for kinks or blockages",
      "Verify drain pump impeller spins freely",
      "Test drain pump motor with multimeter"
    );
  } else if (lowerDesc.includes("door")) {
    steps.push(
      "Inspect door latch mechanism for damage",
      "Check door switch actuator alignment",
      "Test door lock solenoid with multimeter",
      "Verify wiring harness connections"
    );
  } else if (lowerDesc.includes("fill") || lowerDesc.includes("inlet")) {
    steps.push(
      "Verify water supply valves are fully open",
      "Check and clean inlet valve screens",
      "Test inlet valve solenoids with multimeter",
      "Verify water pressure is adequate (20-120 PSI)"
    );
  } else if (lowerDesc.includes("heat") || lowerDesc.includes("temp")) {
    steps.push(
      "Test heating element continuity with multimeter",
      "Check temperature sensor resistance",
      "Verify heater relay is functioning",
      "Inspect wiring for damage or loose connections"
    );
  } else if (lowerDesc.includes("motor") || lowerDesc.includes("drive")) {
    steps.push(
      "Check motor connections for corrosion",
      "Test motor windings with multimeter",
      "Inspect drive belt for wear or damage",
      "Verify inverter board LEDs for diagnostic codes"
    );
  } else {
    steps.push(
      "Inspect relevant components for visible damage",
      "Check all electrical connections",
      "Test suspect components with multimeter",
      "Consult service manual for specific diagnostic procedures"
    );
  }
  
  steps.push("If problem persists, contact authorized service technician");
  
  return steps;
}

function generatePossibleCauses(description: string): string[] {
  const causes: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("drain")) {
    causes.push("Clogged drain pump filter", "Blocked drain hose", "Faulty drain pump motor", "Debris in pump impeller");
  }
  if (lowerDesc.includes("door") || lowerDesc.includes("lock") || lowerDesc.includes("latch")) {
    causes.push("Faulty door switch", "Damaged door latch", "Door lock solenoid failure", "Misaligned door strike");
  }
  if (lowerDesc.includes("fill") || lowerDesc.includes("water") || lowerDesc.includes("inlet")) {
    causes.push("Clogged inlet screens", "Faulty inlet valve", "Low water pressure", "Closed supply valves");
  }
  if (lowerDesc.includes("overflow")) {
    causes.push("Stuck inlet valve", "Faulty water level sensor", "Clogged pressure hose", "Control board malfunction");
  }
  if (lowerDesc.includes("heat") || lowerDesc.includes("temp")) {
    causes.push("Open heating element", "Faulty temperature sensor", "Heater relay failure", "Wiring issue");
  }
  if (lowerDesc.includes("motor") || lowerDesc.includes("drive")) {
    causes.push("Motor winding failure", "Inverter board malfunction", "Drive belt broken", "Motor capacitor failed");
  }
  if (lowerDesc.includes("unbalance")) {
    causes.push("Overloaded drum", "Unevenly distributed load", "Worn suspension components", "Machine not level");
  }
  if (lowerDesc.includes("coin") || lowerDesc.includes("card") || lowerDesc.includes("payment")) {
    causes.push("Coin jam", "Card reader malfunction", "Communication error", "Faulty validator");
  }
  if (lowerDesc.includes("voltage") || lowerDesc.includes("power")) {
    causes.push("Power surge", "Low supply voltage", "Faulty power cord", "Blown fuse");
  }
  if (lowerDesc.includes("sensor")) {
    causes.push("Faulty sensor", "Loose sensor connection", "Damaged wiring", "Sensor calibration needed");
  }
  
  if (causes.length === 0) {
    causes.push("Component failure", "Wiring issue", "Control board malfunction", "Wear and tear");
  }
  
  return causes;
}

function normalizeBrandName(rawBrand: string): string {
  const brandMappings: Record<string, string> = {
    "SPEED QUEEN": "Speed Queen",
    "SPEED QUEEN (ALLIANCE LAUNDRY SYSTEMS)": "Speed Queen",
    "HUEBSCH": "Huebsch",
    "HUEBSCH (ALLIANCE LAUNDRY SYSTEMS)": "Huebsch",
    "PRIMUS": "Primus",
    "PRIMUS (ALLIANCE LAUNDRY SYSTEMS)": "Primus",
    "ADC": "ADC",
    "ADC (AMERICAN DRYER CORPORATION)": "ADC",
    "AMERICAN DRYER CORPORATION": "ADC",
    "MILNOR": "Milnor",
    "MILNOR (PELLERIN MILNOR CORPORATION)": "Milnor",
    "PELLERIN MILNOR CORPORATION": "Milnor",
    "DEXTER": "Dexter",
    "DEXTER (LAUNDRY SYSTEMS)": "Dexter",
    "ELECTROLUX PROFESSIONAL": "Electrolux",
    "ELECTROLUX": "Electrolux",
    "MIELE PROFESSIONAL": "Miele",
    "MIELE": "Miele",
    "LG COMMERCIAL": "LG Commercial",
    "LG": "LG Commercial",
    "MAYTAG COMMERCIAL": "Maytag Commercial",
    "MAYTAG": "Maytag Commercial",
    "CONTINENTAL GIRBAU": "Continental Girbau",
    "GIRBAU": "Continental Girbau",
    "WASCOMAT": "Wascomat",
    "WASCOMAT (EUROPEAN COMMERCIAL)": "Wascomat",
    "UNIMAC": "UniMac",
    "UNIMAC (ALLIANCE LAUNDRY SYSTEMS)": "UniMac",
    "IPSO": "IPSO",
    "IPSO (ALLIANCE LAUNDRY SYSTEMS)": "IPSO",
    "DOMUS": "Domus",
    "DOMUS (EUROPEAN INDUSTRIAL)": "Domus",
    "GREENWALD": "Greenwald",
    "GREENWALD (SMART CARD & COIN SYSTEMS)": "Greenwald",
    "PAYRANGE": "PayRange",
    "PAYRANGE (MOBILE PAYMENT)": "PayRange",
    "HAMILTON": "Hamilton",
    "HAMILTON (COIN CHANGERS)": "Hamilton",
    "ROWE": "Rowe",
    "ROWE (BILL CHANGERS)": "Rowe",
    "SPYDERWASH": "SpyderWash",
    "SPYDERWASH (CARD PAYMENT)": "SpyderWash",
    "CISSELL": "Cissell",
    "SCHULTHESS": "Schulthess",
    "SCHULTHEISS": "Schulthess",
    "FAGOR": "Fagor",
    "B&C TECHNOLOGIES": "B&C Technologies",
    "NAYAX": "Nayax",
    "JENSEN": "Jensen",
    "CHICAGO DRYER": "Chicago Dryer",
    "WHIRLPOOL COMMERCIAL": "Whirlpool Commercial",
  };
  
  const upperBrand = rawBrand.toUpperCase().trim();
  return brandMappings[upperBrand] || rawBrand.trim();
}

function parseErrorCodeFile(filePath: string): ParsedCode[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const codes: ParsedCode[] = [];
  
  let currentBrand = "";
  let currentMachineType = "washer";
  let isPaymentSection = false;
  
  const brandHeaderPattern = /^▓▓▓\s*(.+?)\s*▓▓▓/;
  const machineTypePattern = /^(WASHERS?|DRYERS?|SMART CARD ERRORS?|LED FLASH (?:CODES|PATTERNS)?|TAC.*ERRORS?|COIN DETECTOR ERRORS?|BILL ACCEPTOR ERRORS?):/i;
  
  const compactCodePattern = /^\s{0,4}([A-Za-z0-9_\-\/\*\s]+?)\s{2,}-\s*(.+)$/;
  
  const expandedCodePattern = /^(?:New:?\s*)?([A-Za-z0-9_\-\/]+)(?:\s*\/\s*[A-Za-z0-9_\-]+)*:\s*(.+?)(?:→|->)\s*(.+?)\.?\s*(?:Parts?:\s*(.+))?$/i;
  
  const fixRatePattern = /^(.+?)(?:\s*→\s*|\s*->\s*)(.+?)\.?\s*Fix Rate:\s*(\d+)%\.\s*Parts?:\s*(.+)$/i;
  
  const seenCodes = new Set<string>();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith("═") || trimmedLine.startsWith("─")) {
      continue;
    }
    
    if (trimmedLine.includes("DATABASE SUMMARY") || trimmedLine.includes("TOTAL BRANDS")) {
      continue;
    }
    
    const brandMatch = brandHeaderPattern.exec(trimmedLine);
    if (brandMatch) {
      currentBrand = normalizeBrandName(brandMatch[1]);
      isPaymentSection = trimmedLine.toUpperCase().includes("PAYMENT") || 
                         ["GREENWALD", "PAYRANGE", "HAMILTON", "ROWE", "SPYDERWASH", "NAYAX"].some(
                           p => trimmedLine.toUpperCase().includes(p)
                         );
      currentMachineType = isPaymentSection ? "payment_system" : "washer";
      continue;
    }
    
    const machineTypeMatch = machineTypePattern.exec(trimmedLine);
    if (machineTypeMatch) {
      const typeText = machineTypeMatch[1].toUpperCase();
      if (typeText.includes("WASHER")) {
        currentMachineType = "washer";
      } else if (typeText.includes("DRYER")) {
        currentMachineType = "dryer";
      } else {
        currentMachineType = "payment_system";
      }
      continue;
    }
    
    if (trimmedLine.match(/^\d+\s+codes?/i) || trimmedLine.match(/^Added\s+/i) || trimmedLine.match(/^New\s+\d+/i)) {
      continue;
    }
    
    if (!currentBrand) {
      continue;
    }
    
    let parsedCode: ParsedCode | null = null;
    
    const fixRateMatch = fixRatePattern.exec(trimmedLine);
    if (fixRateMatch) {
      const codeMatch = fixRateMatch[1].match(/^([A-Za-z0-9_\-\/]+)(?:\s*\/\s*[A-Za-z0-9_\-]+)*:\s*(.+)/);
      if (codeMatch) {
        const code = codeMatch[1].trim();
        const description = codeMatch[2].trim();
        const fix = fixRateMatch[2].trim();
        const partsText = fixRateMatch[4] || "";
        
        const { parts, partsWithPricing } = extractParts(`Parts: ${partsText}`);
        
        const uniqueKey = `${currentBrand}:${code}`;
        if (!seenCodes.has(uniqueKey)) {
          seenCodes.add(uniqueKey);
          parsedCode = {
            code,
            manufacturer: currentBrand,
            machineType: currentMachineType,
            description: `${description} - ${fix}`,
            possibleCauses: generatePossibleCauses(description),
            troubleshootingSteps: generateTroubleshootingSteps(description, currentMachineType),
            requiredParts: parts,
            partsWithPricing,
            quickFix: generateQuickFix(description, currentMachineType),
            severity: inferSeverity(code, description),
          };
        }
      }
    }
    
    if (!parsedCode) {
      const expandedMatch = expandedCodePattern.exec(trimmedLine);
      if (expandedMatch) {
        const code = expandedMatch[1].trim();
        const description = expandedMatch[2].trim();
        const fix = expandedMatch[3].trim();
        const partsText = expandedMatch[4] || "";
        
        const { parts, partsWithPricing } = extractParts(`Parts: ${partsText}`);
        
        const uniqueKey = `${currentBrand}:${code}`;
        if (!seenCodes.has(uniqueKey)) {
          seenCodes.add(uniqueKey);
          parsedCode = {
            code,
            manufacturer: currentBrand,
            machineType: currentMachineType,
            description: `${description} - ${fix}`,
            possibleCauses: generatePossibleCauses(description),
            troubleshootingSteps: generateTroubleshootingSteps(description, currentMachineType),
            requiredParts: parts,
            partsWithPricing,
            quickFix: generateQuickFix(description, currentMachineType),
            severity: inferSeverity(code, description),
          };
        }
      }
    }
    
    if (!parsedCode) {
      const compactMatch = compactCodePattern.exec(line);
      if (compactMatch) {
        const code = compactMatch[1].trim();
        const description = compactMatch[2].trim();
        
        if (code.length > 0 && code.length < 30 && !code.match(/^[\d\s]+$/)) {
          const { parts, partsWithPricing } = extractParts(description);
          
          const uniqueKey = `${currentBrand}:${code}`;
          if (!seenCodes.has(uniqueKey)) {
            seenCodes.add(uniqueKey);
            parsedCode = {
              code,
              manufacturer: currentBrand,
              machineType: currentMachineType,
              description: description.replace(/\s*Parts?:\s*.+$/, "").trim(),
              possibleCauses: generatePossibleCauses(description),
              troubleshootingSteps: generateTroubleshootingSteps(description, currentMachineType),
              requiredParts: parts,
              partsWithPricing,
              quickFix: generateQuickFix(description, currentMachineType),
              severity: inferSeverity(code, description),
            };
          }
        }
      }
    }
    
    if (parsedCode) {
      codes.push(parsedCode);
    }
  }
  
  return codes;
}

async function seedDiagnosticCodes() {
  console.log("🚀 Starting diagnostic codes seeding...\n");
  
  const filePath = path.join(process.cwd(), "attached_assets", "Pasted---1765063231657_1765063231661.txt");
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found at ${filePath}`);
    process.exit(1);
  }
  
  console.log(`📄 Reading file: ${filePath}\n`);
  
  const codes = parseErrorCodeFile(filePath);
  console.log(`📊 Parsed ${codes.length} error codes\n`);
  
  const brandCounts: Record<string, number> = {};
  for (const code of codes) {
    brandCounts[code.manufacturer] = (brandCounts[code.manufacturer] || 0) + 1;
  }
  
  console.log("📋 Codes by manufacturer:");
  for (const [brand, count] of Object.entries(brandCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${brand}: ${count} codes`);
  }
  console.log("");
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const code of codes) {
    try {
      const slug = slugify(code.manufacturer, code.code);
      const title = `${code.manufacturer} ${code.code} Error`;
      const metaTitle = `${code.manufacturer} ${code.code} Error Code - Fix Guide | WashBizHub`;
      const metaDescription = `Learn how to fix ${code.manufacturer} error code ${code.code}: ${code.description.substring(0, 120)}. Complete troubleshooting guide with parts and step-by-step instructions.`;
      
      await db.insert(diagnosticCodes).values({
        code: code.code,
        manufacturer: code.manufacturer,
        machineType: code.machineType,
        slug,
        title,
        description: code.description,
        possibleCauses: code.possibleCauses,
        troubleshootingSteps: code.troubleshootingSteps,
        requiredParts: code.requiredParts,
        partsWithPricing: code.partsWithPricing.length > 0 ? code.partsWithPricing : null,
        quickFix: code.quickFix,
        severity: code.severity,
        skillLevel: inferSkillLevel(code.description, code.requiredParts.length),
        metaTitle,
        metaDescription,
      }).onConflictDoUpdate({
        target: diagnosticCodes.slug,
        set: {
          description: code.description,
          possibleCauses: code.possibleCauses,
          troubleshootingSteps: code.troubleshootingSteps,
          requiredParts: code.requiredParts,
          partsWithPricing: code.partsWithPricing.length > 0 ? code.partsWithPricing : null,
          quickFix: code.quickFix,
          severity: code.severity,
          skillLevel: inferSkillLevel(code.description, code.requiredParts.length),
          metaTitle,
          metaDescription,
          updatedAt: sql`NOW()`,
        },
      });
      
      inserted++;
      
      if (inserted % 50 === 0) {
        console.log(`   ✅ Processed ${inserted}/${codes.length} codes...`);
      }
    } catch (error: any) {
      if (error.message?.includes("duplicate") || error.code === "23505") {
        skipped++;
      } else {
        errors++;
        console.error(`   ❌ Error inserting ${code.manufacturer} ${code.code}:`, error.message);
      }
    }
  }
  
  console.log("\n" + "═".repeat(60));
  console.log("📊 SEEDING COMPLETE");
  console.log("═".repeat(60));
  console.log(`   ✅ Inserted: ${inserted} codes`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped} codes`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log("═".repeat(60) + "\n");
  
  const totalInDb = await db.select({ count: sql<number>`count(*)` }).from(diagnosticCodes);
  console.log(`📈 Total codes in database: ${totalInDb[0]?.count || 0}\n`);
  
  process.exit(0);
}

seedDiagnosticCodes().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
