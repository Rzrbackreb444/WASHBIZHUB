import { db } from "./db";
import { diagnosticCodes } from "@shared/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface PartWithPricing {
  partNumber: string;
  name: string;
  price: number;
  supplier: string;
}

interface ParsedCode {
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
  modelSeries: string;
  fixRate: number;
}

const TEST_MODES: Record<string, string> = {
  "Speed Queen": "Press 'Delicates + Cold' buttons simultaneously",
  "Huebsch": "Press 'Delicates + Cold' buttons simultaneously",
  "UniMac": "Press 'Delicates + Cold' buttons simultaneously",
  "Primus": "Press 'Delicates + Cold' buttons simultaneously",
  "IPSO": "Press 'Delicates + Cold' buttons simultaneously",
  "Dexter": "Hold 'Medium + Start' for 5 seconds",
  "ADC": "Hold 'High Temp + Start'",
  "Electrolux": "Hold '90°C + Start'",
  "Miele": "Hold 'Cotton + Start' for 6 seconds",
  "LG": "Hold 'Rinse+Spin + Power' for 3 seconds",
  "Maytag": "Press 'Soil + Spin' 3 times fast",
  "Whirlpool": "Press 'Soil + Spin' 3 times fast",
  "Milnor": "Refer to service manual for test mode entry",
  "Continental Girbau": "Refer to service manual for test mode entry",
};

function parsePartsString(partsStr: string): PartWithPricing[] {
  const parts: PartWithPricing[] = [];
  if (!partsStr || partsStr.includes("no part") || partsStr.includes("Reset") || partsStr.includes("Reprogram")) {
    return parts;
  }

  const partSegments = partsStr.split(" · ");
  for (const segment of partSegments) {
    const match = segment.match(/([A-Z0-9\-]+P?)\s+(.+?)\s+\$(\d+(?:\.\d{2})?)/i);
    if (match) {
      parts.push({
        partNumber: match[1].trim(),
        name: match[2].trim(),
        price: parseFloat(match[3]),
        supplier: "OEM"
      });
    }
  }
  return parts;
}

function determineSeverity(description: string, fixRate: number): string {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("safety") || lowerDesc.includes("gas") || lowerDesc.includes("fire") || 
      lowerDesc.includes("ignition") || lowerDesc.includes("break-in") || lowerDesc.includes("emergency")) {
    return "critical";
  }
  if (fixRate < 85 || lowerDesc.includes("board") || lowerDesc.includes("inverter") || 
      lowerDesc.includes("motor") || lowerDesc.includes("drive")) {
    return "high";
  }
  if (fixRate < 90) return "medium";
  return "low";
}

function determineSkillLevel(description: string, parts: PartWithPricing[]): string {
  const lowerDesc = description.toLowerCase();
  const hasExpensiveParts = parts.some(p => p.price > 150);
  
  if (lowerDesc.includes("board") || lowerDesc.includes("inverter") || 
      lowerDesc.includes("gas") || hasExpensiveParts) {
    return "professional";
  }
  if (lowerDesc.includes("motor") || lowerDesc.includes("bearing") || 
      lowerDesc.includes("seal") || lowerDesc.includes("element")) {
    return "intermediate";
  }
  return "basic";
}

function estimateRepairTime(description: string, parts: PartWithPricing[]): number {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("board") || lowerDesc.includes("inverter")) return 90;
  if (lowerDesc.includes("motor") || lowerDesc.includes("bearing")) return 120;
  if (lowerDesc.includes("element") || lowerDesc.includes("pump")) return 60;
  if (lowerDesc.includes("valve") || lowerDesc.includes("sensor")) return 45;
  if (lowerDesc.includes("switch") || lowerDesc.includes("door")) return 30;
  return 45;
}

function generateTroubleshootingSteps(description: string, parts: PartWithPricing[]): string[] {
  const steps: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  steps.push("1. Disconnect power and verify zero voltage before servicing");
  steps.push("2. Note the exact error code display and any flashing patterns");
  
  if (lowerDesc.includes("drain")) {
    steps.push("3. Check drain hose for kinks or blockages");
    steps.push("4. Inspect drain pump filter for debris");
    steps.push("5. Test drain pump motor with multimeter");
  } else if (lowerDesc.includes("door")) {
    steps.push("3. Inspect door latch alignment and strike plate");
    steps.push("4. Test door switch continuity");
    steps.push("5. Check door lock solenoid operation");
  } else if (lowerDesc.includes("heat") || lowerDesc.includes("temperature")) {
    steps.push("3. Test heating element resistance (should be 10-30 ohms)");
    steps.push("4. Check thermistor/NTC sensor readings");
    steps.push("5. Verify relay operation on control board");
  } else if (lowerDesc.includes("motor") || lowerDesc.includes("drive")) {
    steps.push("3. Check motor harness connections");
    steps.push("4. Test motor windings with multimeter");
    steps.push("5. Inspect inverter board for burnt components");
  } else if (lowerDesc.includes("water") || lowerDesc.includes("fill") || lowerDesc.includes("inlet")) {
    steps.push("3. Verify water supply is on and adequate pressure");
    steps.push("4. Clean inlet valve screens");
    steps.push("5. Test inlet valve solenoids");
  } else {
    steps.push("3. Inspect related components for visible damage");
    steps.push("4. Check wiring harness connections");
    steps.push("5. Test component with multimeter if applicable");
  }
  
  steps.push("6. Replace faulty component and test operation");
  steps.push("7. Clear error code and run test cycle");
  
  return steps;
}

function generatePossibleCauses(description: string): string[] {
  const causes: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("drain")) {
    causes.push("Clogged drain pump filter");
    causes.push("Kinked or blocked drain hose");
    causes.push("Faulty drain pump motor");
    causes.push("Debris in drain line");
  } else if (lowerDesc.includes("door")) {
    causes.push("Door not properly closed");
    causes.push("Worn door strike or latch");
    causes.push("Faulty door lock solenoid");
    causes.push("Door switch malfunction");
  } else if (lowerDesc.includes("heat")) {
    causes.push("Open heating element");
    causes.push("Faulty temperature sensor");
    causes.push("Defective relay on control board");
    causes.push("High-limit thermostat tripped");
  } else if (lowerDesc.includes("motor") || lowerDesc.includes("drive")) {
    causes.push("Motor winding failure");
    causes.push("Inverter board malfunction");
    causes.push("Loose motor harness connection");
    causes.push("Overload condition");
  } else if (lowerDesc.includes("water") || lowerDesc.includes("fill")) {
    causes.push("Low water pressure");
    causes.push("Clogged inlet screens");
    causes.push("Faulty inlet valve");
    causes.push("Pressure sensor malfunction");
  } else {
    causes.push("Component failure");
    causes.push("Wiring harness issue");
    causes.push("Control board malfunction");
  }
  
  return causes;
}

interface RawCodeData {
  manufacturer: string;
  machineType: string;
  codes: string;
  description: string;
  fixRate: string;
  parts: string;
}

function parseTableFile(filePath: string): RawCodeData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const codes: RawCodeData[] = [];
  
  let currentManufacturer = "";
  let currentMachineType = "washer";
  
  for (const line of lines) {
    if (line.includes("SPEED QUEEN") && line.includes("WASHER")) {
      currentManufacturer = "Speed Queen";
      currentMachineType = "washer";
    } else if (line.includes("SPEED QUEEN") && line.includes("DRYER")) {
      currentManufacturer = "Speed Queen";
      currentMachineType = "dryer";
    } else if (line.includes("HUEBSCH")) {
      currentManufacturer = "Huebsch";
    } else if (line.includes("PRIMUS")) {
      currentManufacturer = "Primus";
    } else if (line.includes("ADC") || line.includes("AMERICAN DRYER")) {
      currentManufacturer = "ADC";
      currentMachineType = "dryer";
    } else if (line.includes("MILNOR")) {
      currentManufacturer = "Milnor";
      currentMachineType = "washer";
    } else if (line.includes("DEXTER")) {
      currentManufacturer = "Dexter";
    } else if (line.includes("ELECTROLUX")) {
      currentManufacturer = "Electrolux";
    } else if (line.includes("MIELE")) {
      currentManufacturer = "Miele";
    } else if (line.includes("LG COMMERCIAL") || line.includes("LG —")) {
      currentManufacturer = "LG";
    } else if (line.includes("MAYTAG") || line.includes("WHIRLPOOL")) {
      currentManufacturer = line.includes("MAYTAG") ? "Maytag" : "Whirlpool";
    }
    
    if (line.includes("**WASHERS**") || line.includes("WASHERS (")) {
      currentMachineType = "washer";
      continue;
    }
    if (line.includes("**DRYERS**") || line.includes("DRYERS (")) {
      currentMachineType = "dryer";
      continue;
    }
    
    if (line.startsWith("|") && !line.includes("Code") && !line.includes("---") && !line.includes("**")) {
      const parts = line.split("|").map(p => p.trim()).filter(p => p);
      if (parts.length >= 4) {
        codes.push({
          manufacturer: currentManufacturer,
          machineType: currentMachineType,
          codes: parts[0],
          description: parts[1],
          fixRate: parts[2],
          parts: parts[3] || ""
        });
      }
    }
  }
  
  return codes;
}

function expandCodeVariants(codeString: string): string[] {
  const variants = codeString.split(/\s*\/\s*/).map(c => c.trim());
  return variants.filter(v => v.length > 0);
}

async function importCodes() {
  const files = [
    "attached_assets/Pasted---1764312135786_1764312135786.txt",
    "attached_assets/Pasted---1764312280056_1764312280056.txt",
    "attached_assets/Pasted---1764312350181_1764312350181.txt",
    "attached_assets/Pasted---1764312400891_1764312400891.txt",
    "attached_assets/Pasted---1764312423361_1764312423361.txt",
    "attached_assets/Pasted---1764312481448_1764312481449.txt",
    "attached_assets/Pasted---1764312586581_1764312586581.txt",
    "attached_assets/Pasted--ELE-1764312621671_1764312621671.txt",
    "attached_assets/Pasted--MIE-1764312653638_1764312653639.txt",
    "attached_assets/Pasted---1764312688301_1764312688301.txt",
  ];

  let totalImported = 0;
  let totalUpdated = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`Skipping ${file} - not found`);
      continue;
    }

    console.log(`\nProcessing: ${file}`);
    const rawCodes = parseTableFile(file);
    console.log(`  Found ${rawCodes.length} raw code entries`);

    for (const raw of rawCodes) {
      if (!raw.manufacturer || !raw.codes) continue;
      
      const codeVariants = expandCodeVariants(raw.codes);
      const parts = parsePartsString(raw.parts);
      const fixRate = parseInt(raw.fixRate.replace('%', '')) || 90;
      
      for (const code of codeVariants) {
        const severity = determineSeverity(raw.description, fixRate);
        const skillLevel = determineSkillLevel(raw.description, parts);
        const repairTime = estimateRepairTime(raw.description, parts);
        const troubleshootingSteps = generateTroubleshootingSteps(raw.description, parts);
        const possibleCauses = generatePossibleCauses(raw.description);
        
        const codeData = {
          manufacturer: raw.manufacturer,
          code: code.replace(/^E:/, '').replace(/^E_/, '').trim(),
          machineType: raw.machineType,
          title: raw.description,
          description: `${raw.description}. Fix rate: ${fixRate}%`,
          severity,
          skillLevel,
          estimatedRepairTime: repairTime,
          possibleCauses,
          troubleshootingSteps,
          partsWithPricing: parts.length > 0 ? parts : null,
          quickFix: parts.length > 0 ? `Primary fix: ${parts[0].name} (${parts[0].partNumber}) - $${parts[0].price}` : "See troubleshooting steps",
          testModeEntry: TEST_MODES[raw.manufacturer] || "Refer to service manual",
          eraCompatibility: "2020-2025",
          modelSeries: "All current models"
        };

        try {
          await db.insert(diagnosticCodes).values(codeData)
            .onConflictDoUpdate({
              target: [diagnosticCodes.manufacturer, diagnosticCodes.code],
              set: {
                title: codeData.title,
                description: codeData.description,
                severity: codeData.severity,
                skillLevel: codeData.skillLevel,
                estimatedRepairTime: codeData.estimatedRepairTime,
                possibleCauses: codeData.possibleCauses,
                troubleshootingSteps: codeData.troubleshootingSteps,
                partsWithPricing: codeData.partsWithPricing,
                quickFix: codeData.quickFix,
                testModeEntry: codeData.testModeEntry,
                eraCompatibility: codeData.eraCompatibility,
                modelSeries: codeData.modelSeries
              }
            });
          totalImported++;
        } catch (error: any) {
          console.error(`  Error importing ${raw.manufacturer} ${code}:`, error.message);
        }
      }
    }
  }

  const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM diagnostic_codes`);
  const totalCodes = (countResult as any).rows?.[0]?.count || totalImported;
  
  console.log(`\n========================================`);
  console.log(`Import Complete!`);
  console.log(`  Codes processed: ${totalImported}`);
  console.log(`  Total codes in DB: ${totalCodes}`);
  console.log(`========================================`);
}

importCodes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
