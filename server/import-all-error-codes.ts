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
}

const TEST_MODES: Record<string, string> = {
  "Speed Queen": "Press 'Delicates + Cold' buttons simultaneously",
  "Huebsch": "Press 'Delicates + Cold' buttons simultaneously",
  "UniMac": "Press 'Delicates + Cold' buttons simultaneously",
  "Maytag": "Press 'Soil + Spin' 3 times fast",
  "Whirlpool": "Press 'Soil + Spin' 3 times fast",
  "Dexter": "Hold 'Medium + Start' for 5 seconds",
  "ADC": "Hold 'High Temp + Start'",
  "Electrolux": "Hold '90°C + Start'",
  "Miele": "Hold 'Cotton + Start' for 6 seconds",
  "LG": "Hold 'Rinse+Spin + Power' for 3 seconds",
  "Wascomat": "Hold key 1 + key 6 on keypad",
  "Continental Girbau": "Refer to service manual for test mode entry",
  "Primus": "Press 'Delicates + Cold' buttons simultaneously",
  "IPSO": "Press 'Delicates + Cold' buttons simultaneously",
  "Cissell": "Press 'Delicates + Cold' buttons simultaneously",
};

const MANUFACTURER_NORMALIZATION: Record<string, string> = {
  "SPEED QUEEN": "Speed Queen",
  "speed queen": "Speed Queen",
  "HUEBSCH": "Huebsch",
  "huebsch": "Huebsch",
  "UNIMAC": "UniMac",
  "unimac": "UniMac",
  "ALLIANCE": "Alliance",
  "ALLIANCE SE": "Alliance",
  "DEXTER": "Dexter",
  "dexter": "Dexter",
  "ADC": "ADC",
  "AMERICAN DRYER": "ADC",
  "American Dryer": "ADC",
  "American Dryer Corp": "ADC",
  "MAYTAG": "Maytag",
  "maytag": "Maytag",
  "MAYTAG COMMERCIAL": "Maytag",
  "Maytag Commercial": "Maytag",
  "MAYTAG WASHER": "Maytag",
  "MAYTAG DRYER": "Maytag",
  "WHIRLPOOL": "Whirlpool",
  "whirlpool": "Whirlpool",
  "WHIRLPOOL COMMERCIAL": "Whirlpool",
  "LG": "LG",
  "LG COMMERCIAL": "LG",
  "Lg Commercial": "LG",
  "ELECTROLUX": "Electrolux",
  "ELECTROLUX PROFESSIONAL": "Electrolux",
  "Electrolux Professional": "Electrolux",
  "Electrolux Pro": "Electrolux",
  "MIELE": "Miele",
  "MIELE PROFESSIONAL": "Miele",
  "Miele Professional": "Miele",
  "Miele Pro": "Miele",
  "CONTINENTAL GIRBAU": "Continental Girbau",
  "Continental Girbau": "Continental Girbau",
  "GIRBAU": "Continental Girbau",
  "Girbau": "Continental Girbau",
  "GIRBAU / CONTINENTAL GIRBAU": "Continental Girbau",
  "WASCOMAT": "Wascomat",
  "wascomat": "Wascomat",
  "DOMUS": "Domus",
  "domus": "Domus",
  "CISSELL": "Cissell",
  "cissell": "Cissell",
  "PRIMUS": "Primus",
  "primus": "Primus",
  "IPSO": "IPSO",
  "ipso": "IPSO",
  "MILNOR": "Milnor",
  "PELLERIN MILNOR": "Milnor",
  "Pellerin Milnor": "Milnor",
  "GE": "GE",
  "HOTPOINT": "Hotpoint",
  "KENMORE": "Kenmore",
  "SAMSUNG": "Samsung",
  "BOSCH": "Bosch",
  "AEG": "AEG",
  "FRIGIDAIRE": "Frigidaire",
  "FISHER & PAYKEL": "Fisher & Paykel",
  "HAIER": "Haier",
  "BEKO": "Beko",
  "CANDY": "Candy",
  "INDESIT": "Indesit",
  "PANASONIC": "Panasonic",
  "TOSHIBA": "Toshiba",
  "SHARP": "Sharp",
  "SMEG": "Smeg",
  "ASKO": "Asko",
  "CROSSOVER": "Crossover",
  "DANUBE": "Danube",
  "CHICAGO DRYER": "Chicago Dryer",
  "BRASTEMP": "Brastemp",
  "GORENJE": "Gorenje",
  "LAVATEC": "Lavatec",
  "SCHULTHESS": "Schulthess",
  "JENSEN": "Jensen",
  "GREENWALD": "Greenwald",
  "PAYRANGE": "PayRange",
  "PAYMENT SYSTEMS": "Payment Systems",
  "HAMILTON": "Hamilton",
  "ADVANTAGE LAUNDRY": "Advantage Laundry",
};

function normalizeManufacturer(manufacturer: string): string {
  const trimmed = manufacturer.trim().replace(/\s*\([^)]*\)/g, '').trim();
  return MANUFACTURER_NORMALIZATION[trimmed] || 
         MANUFACTURER_NORMALIZATION[trimmed.toUpperCase()] || 
         trimmed.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function createSlug(manufacturer: string, code: string, machineType: string): string {
  const mfr = manufacturer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const codeClean = code.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${mfr}-${codeClean}`.substring(0, 100);
}

function parseParts(partsText: string): PartWithPricing[] {
  const parts: PartWithPricing[] = [];
  const partRegexes = [
    /([A-Z0-9][A-Z0-9\-]+P?)\s+([^$│|]+?)\s*\$(\d+(?:\.\d+)?)/gi,
    /([A-Z0-9][A-Z0-9\-]+P?)\s*\$(\d+)/g,
    /(\d{5,}P?)\s+([^$]+?)\s*\$(\d+)/gi,
  ];
  
  for (const regex of partRegexes) {
    const matches = partsText.matchAll(regex);
    for (const match of matches) {
      const partNum = match[1].trim();
      const name = match[2]?.trim().replace(/[│|]+/g, '').trim() || "Part";
      const price = parseFloat(match[3] || match[2]);
      
      if (!parts.find(p => p.partNumber === partNum)) {
        parts.push({
          partNumber: partNum,
          name: name.length > 2 ? name : "Replacement Part",
          price: price,
          supplier: "Alliance Parts"
        });
      }
    }
  }
  
  return parts;
}

function determineSeverity(code: string, description: string): string {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("critical") || lowerDesc.includes("inverter fail") ||
      lowerDesc.includes("board fail") || lowerDesc.includes("motor fail") ||
      lowerDesc.includes("fire") || lowerDesc.includes("emergency")) {
    return "critical";
  }
  if (lowerDesc.includes("no heat") || lowerDesc.includes("no drain") ||
      lowerDesc.includes("no fill") || lowerDesc.includes("door lock") ||
      lowerDesc.includes("error") || lowerDesc.includes("fault") ||
      lowerDesc.includes("failure") || lowerDesc.includes("timeout")) {
    return "high";
  }
  if (lowerDesc.includes("power fail") || lowerDesc.includes("suds") ||
      lowerDesc.includes("reminder") || lowerDesc.includes("info") ||
      lowerDesc.includes("not error")) {
    return "low";
  }
  return "medium";
}

function determineSkillLevel(description: string, parts: PartWithPricing[]): string {
  const lowerDesc = description.toLowerCase();
  const hasBoardParts = parts.some(p => 
    p.name.toLowerCase().includes("board") || 
    p.name.toLowerCase().includes("inverter") ||
    p.price > 150
  );
  if (hasBoardParts || lowerDesc.includes("inverter") || lowerDesc.includes("control board") ||
      lowerDesc.includes("eeprom") || lowerDesc.includes("electronic")) {
    return "advanced";
  }
  if (lowerDesc.includes("pump") || lowerDesc.includes("motor") ||
      lowerDesc.includes("element") || lowerDesc.includes("valve") ||
      lowerDesc.includes("lock") || lowerDesc.includes("sensor")) {
    return "intermediate";
  }
  return "basic";
}

function parseSpeedQueenFull2025(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentSection = "washer";
  const lines = content.split('\n');
  let currentCodeEntry: { code: string; description: string; parts: string[] } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes("DRYERS") || line.includes("Dryer")) {
      currentSection = "dryer";
      continue;
    }
    if (line.includes("WASHERS") || line.includes("Washer")) {
      currentSection = "washer";
      continue;
    }
    
    const mainCodeMatch = line.match(/^([A-Za-z][A-Za-z0-9_:]+(?:\s*\/\s*[A-Za-z0-9_:]+)?)\s{2,}(.+?)\s{2,}(.+)$/);
    
    if (mainCodeMatch) {
      if (currentCodeEntry) {
        const codeVariants = currentCodeEntry.code.split('/').map(c => c.trim());
        const allParts = parseParts(currentCodeEntry.parts.join(' '));
        
        for (const code of codeVariants) {
          if (code.length > 0) {
            codes.push({
              code: code.trim(),
              manufacturer: "Speed Queen",
              machineType: currentSection,
              title: currentCodeEntry.description,
              description: `Speed Queen ${currentSection} error: ${currentCodeEntry.description}`,
              severity: determineSeverity(code, currentCodeEntry.description),
              skillLevel: determineSkillLevel(currentCodeEntry.description, allParts),
              estimatedRepairTime: 30,
              possibleCauses: [],
              troubleshootingSteps: ["Power cycle - unplug 60 seconds", "Check voltage 208-240V", "Enter test mode to diagnose"],
              partsWithPricing: allParts,
              quickFix: "",
              testModeEntry: TEST_MODES["Speed Queen"],
              eraCompatibility: "2020-2025",
              modelSeries: "Quantum Touch, Quantum Gold, SC/SCN/SUF Series"
            });
          }
        }
      }
      
      currentCodeEntry = {
        code: mainCodeMatch[1].trim(),
        description: mainCodeMatch[2].trim(),
        parts: [mainCodeMatch[3]]
      };
    } else if (currentCodeEntry && line.match(/^\s{20,}/) && line.includes('$')) {
      currentCodeEntry.parts.push(line.trim());
    }
  }
  
  if (currentCodeEntry) {
    const codeVariants = currentCodeEntry.code.split('/').map(c => c.trim());
    const allParts = parseParts(currentCodeEntry.parts.join(' '));
    
    for (const code of codeVariants) {
      if (code.length > 0) {
        codes.push({
          code: code.trim(),
          manufacturer: "Speed Queen",
          machineType: currentSection,
          title: currentCodeEntry.description,
          description: `Speed Queen ${currentSection} error: ${currentCodeEntry.description}`,
          severity: determineSeverity(code, currentCodeEntry.description),
          skillLevel: determineSkillLevel(currentCodeEntry.description, allParts),
          estimatedRepairTime: 30,
          possibleCauses: [],
          troubleshootingSteps: [],
          partsWithPricing: allParts,
          quickFix: "",
          testModeEntry: TEST_MODES["Speed Queen"],
          eraCompatibility: "2020-2025",
          modelSeries: "Quantum Touch, Quantum Gold, SC/SCN/SUF Series"
        });
      }
    }
  }
  
  return codes;
}

function parseDetailedCodesFile(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentManufacturer = "";
  let currentMachineType = "washer";
  const lines = content.split('\n');
  
  for (const line of lines) {
    const brandMatch = line.match(/▓▓▓\s*([A-Za-z][A-Za-z\s&()]+?)\s*▓▓▓/);
    if (brandMatch) {
      currentManufacturer = normalizeManufacturer(brandMatch[1].replace(/\([^)]+\)/g, '').trim());
      continue;
    }
    
    if (/^WASHERS:?\s*$/i.test(line.trim()) || line.includes("WASHERS:")) {
      currentMachineType = "washer";
      continue;
    }
    if (/^DRYERS:?\s*$/i.test(line.trim()) || line.includes("DRYERS:")) {
      currentMachineType = "dryer";
      continue;
    }
    
    const codeMatch = line.match(/^\s{0,4}([A-Za-z0-9_:\-\/]+)\s+-\s+(.+)$/);
    if (codeMatch && currentManufacturer) {
      const codeText = codeMatch[1].trim();
      const description = codeMatch[2].trim();
      
      const codeVariants = codeText.split('/').map(c => c.trim()).filter(c => c.length > 0);
      
      for (const code of codeVariants) {
        codes.push({
          code,
          manufacturer: currentManufacturer,
          machineType: currentMachineType,
          title: description,
          description: `${currentManufacturer} ${currentMachineType}: ${description}`,
          severity: determineSeverity(code, description),
          skillLevel: "intermediate",
          estimatedRepairTime: 30,
          possibleCauses: [],
          troubleshootingSteps: [],
          partsWithPricing: [],
          quickFix: "",
          testModeEntry: TEST_MODES[currentManufacturer] || "",
          eraCompatibility: "2000-2025",
          modelSeries: ""
        });
      }
    }
  }
  
  return codes;
}

function parseBrandCodesList(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  const lines = content.split('\n');
  let currentManufacturer = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes("===") || line.includes("TOTAL") || line.length === 0) continue;
    
    const brandMatch = line.match(/^([A-Z][A-Za-z\s&\/]+?)\s*\((\d+)\)\s*$/);
    if (brandMatch) {
      currentManufacturer = normalizeManufacturer(brandMatch[1].trim());
      continue;
    }
    
    const justBrandMatch = line.match(/^([A-Z][A-Za-z\s&]+),\s*GUIDE\s*$/);
    if (justBrandMatch) {
      currentManufacturer = normalizeManufacturer(justBrandMatch[1].trim());
      continue;
    }
    
    if (currentManufacturer && line.includes(',') && !line.includes('(')) {
      const codeList = line.split(',').map(c => c.trim()).filter(c => c.length > 0 && c.length < 20);
      
      for (const code of codeList) {
        let machineType = "both";
        if (currentManufacturer.toLowerCase().includes("dryer")) machineType = "dryer";
        if (currentManufacturer.toLowerCase().includes("washer")) machineType = "washer";
        
        const cleanMfr = currentManufacturer.replace(/\s*(WASHER|DRYER)\s*/gi, '').trim();
        
        codes.push({
          code,
          manufacturer: cleanMfr || currentManufacturer,
          machineType,
          title: `Error Code ${code}`,
          description: `${cleanMfr || currentManufacturer} error code ${code}`,
          severity: "medium",
          skillLevel: "intermediate",
          estimatedRepairTime: 30,
          possibleCauses: [],
          troubleshootingSteps: [],
          partsWithPricing: [],
          quickFix: "",
          testModeEntry: TEST_MODES[normalizeManufacturer(cleanMfr)] || "",
          eraCompatibility: "2000-2025",
          modelSeries: ""
        });
      }
    }
  }
  
  return codes;
}

function parseTopLoadDryerFile(content: string, defaultMachineType: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentManufacturer = "Speed Queen";
  let currentEra = "2000-2025";
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes("SPEED QUEEN") || line.includes("HUEBSCH") || line.includes("ALLIANCE")) {
      currentManufacturer = "Speed Queen";
    } else if (line.includes("MAYTAG") || line.includes("WHIRLPOOL") || line.includes("ADMIRAL")) {
      currentManufacturer = "Maytag";
    } else if (line.includes("DEXTER")) {
      currentManufacturer = "Dexter";
    } else if (line.includes("ADC") || line.includes("American Dryer")) {
      currentManufacturer = "ADC";
    } else if (line.includes("GE") || line.includes("HOTPOINT")) {
      currentManufacturer = "GE";
    } else if (line.includes("IPSO") || line.includes("CIMEX")) {
      currentManufacturer = "IPSO";
    } else if (line.includes("CISSELL")) {
      currentManufacturer = "Cissell";
    } else if (line.includes("CHICAGO")) {
      currentManufacturer = "Chicago Dryer";
    } else if (line.includes("PRIMUS")) {
      currentManufacturer = "Primus";
    } else if (line.includes("LG")) {
      currentManufacturer = "LG";
    } else if (line.includes("ELECTROLUX")) {
      currentManufacturer = "Electrolux";
    } else if (line.includes("MIELE")) {
      currentManufacturer = "Miele";
    } else if (line.includes("KENMORE")) {
      currentManufacturer = "Kenmore";
    }
    
    if (line.includes("1990")) currentEra = "1990-2000";
    else if (line.includes("2000") || line.includes("2010") || line.includes("2015") || line.includes("2020") || line.includes("2025")) {
      currentEra = "2000-2025";
    }
    
    const codeMatch = line.match(/^(.+?)\s{2,}(.+?)\s{2,}(.+\$\d+.*)$/);
    if (codeMatch) {
      const codeText = codeMatch[1].trim();
      const description = codeMatch[2].trim();
      const partsText = codeMatch[3];
      
      if (line.startsWith("─") || line.startsWith("╔") || line.startsWith("║") || line.startsWith("╚")) continue;
      if (codeText.startsWith("Models:") || codeText.startsWith("Parts source:") || codeText.includes("WHERE TO BUY")) continue;
      
      const codeVariants = codeText.split('/').map(c => c.trim().replace(/["""]/g, '')).filter(c => c.length > 0 && c.length < 25);
      const parts = parseParts(partsText);
      
      for (let codeRaw of codeVariants) {
        let code = codeRaw;
        if (code.toLowerCase().startsWith("no display")) code = code.replace(/no display\s*\/?\s*/i, '').trim() || "NO-DISPLAY";
        if (code.toLowerCase().startsWith("no code")) code = code.replace(/no code\s*\/?\s*/i, '').trim() || "NO-CODE";
        if (code.toLowerCase().startsWith("no heat")) code = "NO-HEAT";
        if (code.toLowerCase().startsWith("no tumble")) code = "NO-TUMBLE";
        if (code.toLowerCase().startsWith("no agitate")) code = "NO-AGITATE";
        if (!code || code.length === 0 || code === "No") continue;
        
        codes.push({
          code,
          manufacturer: currentManufacturer,
          machineType: defaultMachineType,
          title: description,
          description: `${currentManufacturer} ${defaultMachineType}: ${description}`,
          severity: determineSeverity(code, description),
          skillLevel: determineSkillLevel(description, parts),
          estimatedRepairTime: 30,
          possibleCauses: [],
          troubleshootingSteps: [],
          partsWithPricing: parts,
          quickFix: "",
          testModeEntry: TEST_MODES[currentManufacturer] || "",
          eraCompatibility: currentEra,
          modelSeries: ""
        });
      }
    }
  }
  
  return codes;
}

function parseHuebschFile(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentManufacturer = "";
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith("HUEBSCH")) { currentManufacturer = "Huebsch"; continue; }
    if (line.startsWith("UNIMAC")) { currentManufacturer = "UniMac"; continue; }
    if (line.startsWith("IPSO")) { currentManufacturer = "IPSO"; continue; }
    if (line.startsWith("PRIMUS")) { currentManufacturer = "Primus"; continue; }
    
    const codeMatch = line.match(/^([A-Za-z0-9_:\-]+)\s{2,}(.+?)\s{2,}([A-Z0-9\-]+P?\s+.+\$\d+)/);
    if (codeMatch && currentManufacturer) {
      const code = codeMatch[1].trim();
      const description = codeMatch[2].trim();
      const parts = parseParts(codeMatch[3]);
      const machineType = description.toLowerCase().includes("dryer") || code.includes("OP") ? "dryer" : "washer";
      
      codes.push({
        code,
        manufacturer: currentManufacturer,
        machineType,
        title: description,
        description: `${currentManufacturer} ${machineType}: ${description}`,
        severity: determineSeverity(code, description),
        skillLevel: determineSkillLevel(description, parts),
        estimatedRepairTime: 30,
        possibleCauses: [],
        troubleshootingSteps: [],
        partsWithPricing: parts,
        quickFix: "",
        testModeEntry: TEST_MODES[currentManufacturer] || "",
        eraCompatibility: "2000-2025",
        modelSeries: ""
      });
    }
  }
  
  return codes;
}

function parseContinentalFile(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentManufacturer = "";
  let currentMachineType = "washer";
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes("CONTINENTAL GIRBAU")) { currentManufacturer = "Continental Girbau"; currentMachineType = "washer"; }
    else if (line.includes("WASCOMAT")) { currentManufacturer = "Wascomat"; currentMachineType = "washer"; }
    else if (line.includes("DOMUS")) { currentManufacturer = "Domus"; currentMachineType = "washer"; }
    else if (line.includes("CISSELL")) { currentManufacturer = "Cissell"; currentMachineType = "dryer"; }
    
    const codeMatch = line.match(/^([A-Za-z0-9\-:_]+)\s{2,}(.+?)\s{2,}([A-Z0-9\-]+P?\s+.+\$\d+)/);
    if (codeMatch && currentManufacturer) {
      const code = codeMatch[1].trim();
      const description = codeMatch[2].trim();
      const parts = parseParts(codeMatch[3]);
      
      codes.push({
        code,
        manufacturer: currentManufacturer,
        machineType: currentMachineType,
        title: description,
        description: `${currentManufacturer}: ${description}`,
        severity: determineSeverity(code, description),
        skillLevel: determineSkillLevel(description, parts),
        estimatedRepairTime: 30,
        possibleCauses: [],
        troubleshootingSteps: [],
        partsWithPricing: parts,
        quickFix: "",
        testModeEntry: TEST_MODES[currentManufacturer] || "",
        eraCompatibility: "2020-2025",
        modelSeries: ""
      });
    }
  }
  
  return codes;
}

function parseLegacyFile(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentMachineType = "washer";
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes("DRYERS")) currentMachineType = "dryer";
    if (line.includes("WASHERS")) currentMachineType = "washer";
    
    const codeMatch = line.match(/^([A-Za-z0-9_:\s\/\-"]+?)\s{2,}(.+?)\s{2,}(.+\$\d+.*?)$/);
    if (codeMatch) {
      const codeText = codeMatch[1].trim().replace(/"/g, '');
      const description = codeMatch[2].trim();
      const partsText = codeMatch[3];
      
      if (codeText.toLowerCase().includes("no code") || codeText.toLowerCase() === "no") continue;
      
      const codeParts = codeText.split('/').map(c => c.trim()).filter(c => c.length > 0 && c.length < 15);
      const parts = parseParts(partsText);
      
      for (const code of codeParts) {
        if (!code.toLowerCase().includes("no ") && code.length > 0) {
          codes.push({
            code,
            manufacturer: "Speed Queen",
            machineType: currentMachineType,
            title: description,
            description: `Legacy Speed Queen/Huebsch (1990-2005): ${description}`,
            severity: "medium",
            skillLevel: "intermediate",
            estimatedRepairTime: 30,
            possibleCauses: [],
            troubleshootingSteps: [],
            partsWithPricing: parts,
            quickFix: "",
            testModeEntry: TEST_MODES["Speed Queen"],
            eraCompatibility: "1990-2005",
            modelSeries: "Phase 3-5, SWN/SCN/SWF Series"
          });
        }
      }
    }
  }
  
  return codes;
}

function parseMainDatabaseFile(content: string): ParsedCode[] {
  const codes: ParsedCode[] = [];
  let currentManufacturer = "";
  let currentMachineType = "both";
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes("SPEED QUEEN")) { currentManufacturer = "Speed Queen"; }
    else if (line.includes("HUEBSCH")) { currentManufacturer = "Huebsch"; }
    else if (line.includes("UNIMAC")) { currentManufacturer = "UniMac"; }
    else if (line.includes("IPSO")) { currentManufacturer = "IPSO"; }
    else if (line.includes("PRIMUS")) { currentManufacturer = "Primus"; }
    else if (line.includes("ADC") || line.includes("American Dryer")) { currentManufacturer = "ADC"; }
    else if (line.includes("MILNOR")) { currentManufacturer = "Milnor"; }
    else if (line.includes("DEXTER")) { currentManufacturer = "Dexter"; }
    else if (line.includes("ELECTROLUX")) { currentManufacturer = "Electrolux"; }
    else if (line.includes("MIELE")) { currentManufacturer = "Miele"; }
    else if (line.includes("LG COMMERCIAL") || line.includes("LG ")) { currentManufacturer = "LG"; }
    else if (line.includes("CONTINENTAL GIRBAU")) { currentManufacturer = "Continental Girbau"; }
    else if (line.includes("WASCOMAT")) { currentManufacturer = "Wascomat"; }
    else if (line.includes("MAYTAG")) { currentManufacturer = "Maytag"; }
    else if (line.includes("WHIRLPOOL")) { currentManufacturer = "Whirlpool"; }
    else if (line.includes("SAMSUNG")) { currentManufacturer = "Samsung"; }
    
    if (line.toLowerCase().includes("dryer")) currentMachineType = "dryer";
    else if (line.toLowerCase().includes("washer")) currentMachineType = "washer";
    
    const codeMatch = line.match(/^([A-Za-z0-9_:\-\/]+)\s{2,}(.+?)\s{2,}(.+\$\d+.*?)$/);
    if (codeMatch && currentManufacturer) {
      const codeText = codeMatch[1].trim();
      const description = codeMatch[2].trim();
      const partsText = codeMatch[3];
      
      const codeVariants = codeText.split('/').map(c => c.trim()).filter(c => c.length > 0 && c.length < 20);
      const parts = parseParts(partsText);
      
      for (const code of codeVariants) {
        const mt = codeText.includes("dryer") || description.toLowerCase().includes("dryer") ? "dryer" : 
                   codeText.includes("washer") || description.toLowerCase().includes("fill") || description.toLowerCase().includes("drain") ? "washer" : currentMachineType;
        
        codes.push({
          code,
          manufacturer: currentManufacturer,
          machineType: mt,
          title: description,
          description: `${currentManufacturer}: ${description}`,
          severity: determineSeverity(code, description),
          skillLevel: determineSkillLevel(description, parts),
          estimatedRepairTime: 30,
          possibleCauses: [],
          troubleshootingSteps: [],
          partsWithPricing: parts,
          quickFix: "",
          testModeEntry: TEST_MODES[currentManufacturer] || "",
          eraCompatibility: "2020-2025",
          modelSeries: ""
        });
      }
    }
  }
  
  return codes;
}

function generateComprehensiveCodes(): ParsedCode[] {
  const codes: ParsedCode[] = [];
  
  const brandCodes: Record<string, { codes: string[]; machineType: string; descriptions?: Record<string, string> }> = {
    "AEG": { codes: ["E10", "E11", "E13", "E20", "E21", "E22", "E23", "E24", "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E3A", "E40", "E41", "E42", "E43", "E44", "E45", "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E5A", "E5B", "E5C", "E5D", "E5E", "E5F", "E61", "E62", "E66", "E68", "E71", "E74", "E82", "E83", "E84", "E85", "E91", "E92", "E93", "E94", "E95", "E96", "E97", "E98", "E99", "E9A", "EA1", "EA2", "EA3", "EA4", "EA5", "EA6", "EB1", "EB2", "EB3", "EBE", "EBF", "EC1", "EC2", "EF1", "EF2", "EF3", "EF4", "EF5", "EH1", "EH2", "EH3"], machineType: "washer" },
    "Samsung": { codes: ["1E", "4E", "4E1", "4E2", "5E", "5E1", "5E2", "6E", "7E", "8E", "8E1", "9E1", "9E2", "AE", "BE", "CE", "dE", "dE1", "dE2", "FE", "HE", "HE1", "HE2", "HE3", "IE", "LE", "LE1", "OE", "PE", "PE1", "SE", "SE1", "tE", "tE1", "tE2", "tE3", "UE", "UB", "bc", "bE", "bE2", "dc", "Hot", "LC", "LC1", "nd", "nF", "nF1", "OF"], machineType: "washer", descriptions: { "1E": "Water Level Sensor Error", "4E": "Water Supply Error", "5E": "Drain Error", "dE": "Door Lock Error", "FE": "Overfill Error", "HE": "Heater Error", "LE": "Water Leak", "OE": "Overflow Error", "tE": "Temperature Sensor", "UE": "Unbalance Error" } },
    "Bosch": { codes: ["E01", "E02", "E03", "E04", "E11", "E13", "E17", "E18", "E21", "E22", "E23", "E27", "E28", "E29", "E31", "E43", "E44", "E57", "E59", "E61", "E67", "F01", "F02", "F03", "F04", "F05", "F16", "F17", "F18", "F19", "F20", "F21", "F23", "F29", "F30", "F31", "F32", "F34", "F40", "F42", "F43", "F44", "F57", "F60", "F61", "F63"], machineType: "washer" },
    "Kenmore": { codes: ["DL", "F01", "F02", "F05", "F06", "F07", "F09", "F10", "F11", "F13", "F14", "F15", "F20", "F21", "F22", "F23", "F24", "F26", "F27", "F28", "F29", "F30", "F31", "F33", "F35", "F40", "F41", "F42", "F43", "F44", "F50", "F51", "F52", "F53", "F60", "F61", "F70", "F71", "F99", "HC", "LD", "SUD", "Sud"], machineType: "washer" },
    "Whirlpool": { codes: ["DL", "F01", "F02", "F03", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F13", "F14", "F15", "F20", "F21", "F22", "F23", "F24", "F26", "F27", "F28", "F29", "F30", "F31", "F33", "F34", "F35", "F40", "F41", "F50", "F51", "F52", "F53", "F54", "F55", "F56", "F57", "F58", "F59", "F60", "F61", "F62", "F70", "F71", "F72", "HC", "LD", "LO", "LF", "SUD", "SD"], machineType: "washer" },
    "Frigidaire": { codes: ["E10", "E11", "E13", "E14", "E15", "E20", "E21", "E23", "E24", "E25", "E30", "E31", "E35", "E40", "E41", "E43", "E44", "E45", "E50", "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58", "E59", "E60", "E61", "E62", "E63", "E64", "E65", "E66", "E67", "E68", "E69", "E70", "E71", "E80", "E90", "E91", "E92", "E93", "E94", "E95", "E96", "E97", "E98", "EF0", "EF1", "EF2", "EH0", "EH1", "EH2", "EH3"], machineType: "washer" },
    "GE": { codes: ["E10", "E11", "E20", "E21", "E22", "E23", "E24", "E25", "E30", "E31", "E32", "E33", "E40", "E41", "E42", "E43", "E44", "E45", "E50", "E51", "E52", "E53", "E54", "E55", "E60", "E61", "E62", "E63", "E64", "E70", "E71", "E72", "E73", "E80", "E81", "E82", "E83", "E90", "E91", "E92", "E93", "E94", "E95"], machineType: "washer" },
    "LG": { codes: ["OE", "IE", "UE", "uE", "dE", "dE1", "dE2", "dE4", "FE", "PE", "PE1", "LE", "LE1", "tE", "tE1", "tE2", "tE3", "CE", "PF", "E6", "tcL", "CL", "AE", "SE", "HE", "EE", "E1", "E3", "E5", "E7", "FF", "nE", "nF", "Cd", "d3", "d5", "DH", "F1", "LO"], machineType: "washer", descriptions: { "OE": "Drain Error", "IE": "Inlet Error", "UE": "Unbalance (manual)", "uE": "Unbalance (auto)", "dE": "Door Error", "FE": "Overfill", "PE": "Pressure Sensor", "LE": "Motor Lock", "tE": "Heating Error", "CE": "Overcurrent", "PF": "Power Failure" } },
    "Hotpoint": { codes: ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "H20", "H21", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"], machineType: "washer" },
    "Indesit": { codes: ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "H20", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"], machineType: "washer" },
    "Miele": { codes: ["F01", "F02", "F03", "F04", "F05", "F10", "F11", "F15", "F16", "F18", "F19", "F20", "F24", "F26", "F29", "F34", "F35", "F39", "F41", "F43", "F44", "F46", "F51", "F53", "F55", "F56", "F62", "F63", "F64", "F65", "F66", "F67", "F68", "F69", "F81", "F82", "F92", "F100"], machineType: "washer" },
    "Fisher & Paykel": { codes: ["C1", "C2", "C3", "C4", "C5", "D1", "D2", "D3", "D4", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "H1", "H2", "H3", "M1", "M2", "M3", "M4", "M5", "P1", "P2", "P3", "S1", "S2", "S3", "U1", "U2", "U3", "U4", "U5", "W1", "W2", "W3"], machineType: "washer" },
    "Haier": { codes: ["4006", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"], machineType: "washer" },
    "Beko": { codes: ["D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "H12", "H13"], machineType: "washer" },
    "Candy": { codes: ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18"], machineType: "washer" },
    "Asko": { codes: ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "F16"], machineType: "washer" },
    "Crossover": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "F1", "F2", "F3", "F4", "F5"], machineType: "washer" },
    "Danube": { codes: ["ERR1", "ERR2", "ERR3", "ERR4", "ERR5", "ERR6", "ERR7", "ERR8", "ERR9", "ERR10", "ERR11", "ERR12", "ERR13", "ERR14", "ERR15"], machineType: "washer" },
    "Gorenje": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20"], machineType: "washer" },
    "Panasonic": { codes: ["H01", "H02", "H03", "H04", "H05", "H06", "H07", "H08", "H09", "H10", "H11", "H12", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19", "U20"], machineType: "washer" },
    "Sharp": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20"], machineType: "washer" },
    "Smeg": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25", "E26", "E27", "E28", "E29", "E30", "E31", "E32", "E33", "E34", "E35", "E36", "E37", "E38", "E39", "E40", "E41", "E42", "E43", "E44", "E45", "E46", "E47", "E48", "E49", "E50", "E51", "E52", "E53", "E54", "E55", "E56", "E57", "E58"], machineType: "washer" },
    "Toshiba": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "C1", "C2", "C3", "C4", "C5"], machineType: "washer" },
    "Brastemp": { codes: ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "F1", "F2", "F3", "F4", "F5"], machineType: "washer" },
    "Lavatec": { codes: ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"], machineType: "washer" },
    "Schulthess": { codes: ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"], machineType: "washer" },
    "Jensen": { codes: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"], machineType: "dryer" },
    "Chicago Dryer": { codes: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"], machineType: "dryer" },
    "American Dryer": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10"], machineType: "dryer" },
    "UniMac": { codes: ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "nFL", "ndr", "ndL", "ndu", "oFL", "ubL", "thE", "HEt", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"], machineType: "washer" },
    "Greenwald": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "C1", "C2", "C3", "C4", "C5", "R1", "R2", "R3", "R4", "R5"], machineType: "payment", descriptions: { "E1": "Chip Read Error", "E2": "Chip Not Responding", "E3": "Wrong Customer ID", "E4": "Location Mismatch", "E5": "Card Uses Exhausted", "E6": "Validation Failed" } },
    "PayRange": { codes: ["OFFLINE", "BT_OFF", "NO_SIGNAL", "CARD_DECLINED", "IN_USE", "TIMEOUT", "NO_AUTH", "NO_FUNDS", "EXPIRED", "BLOCKED"], machineType: "payment", descriptions: { "OFFLINE": "Device Offline", "BT_OFF": "Bluetooth Off", "NO_SIGNAL": "Poor Signal", "CARD_DECLINED": "Card Declined", "IN_USE": "Machine In Use" } },
    "Payment Systems": { codes: ["EC:01", "EC:02", "EC:03", "EC:04", "EC:05", "EC:06", "EC:07", "EC:08", "EC:09", "EC:10", "EC:11", "EC:12", "EC:13", "EC:14", "EC:15", "EC:16", "EC:17", "EC:18", "EC:19", "EC:20"], machineType: "payment" },
    "Maytag Dryer": { codes: ["AF", "L2", "PF", "E1", "E2", "E3", "F01", "F02", "F22", "F23", "F70", "F71", "F72", "F73", "F74", "F75", "F76", "F77", "F78", "F79", "do", "dt", "rL", "HC"], machineType: "dryer" },
    "Whirlpool Dryer": { codes: ["AF", "L2", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "F01", "F02", "F03", "F04", "F21", "F22", "F23", "F24", "F25", "F26", "F27", "F28", "F29", "F30", "F70", "F71", "F72", "F73", "PF"], machineType: "dryer" },
    "GE Dryer": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22", "E23", "E24", "E25"], machineType: "dryer" },
    "LG Dryer": { codes: ["tE", "tE1", "tE2", "tE3", "tE4", "dE", "dE1", "dE2", "dE3", "dE4", "E1", "E3", "E4", "E5", "E6", "E7", "E8", "d80", "d90", "d95", "PF", "PS", "nP", "CL", "Cd", "HS"], machineType: "dryer" },
    "Samsung Dryer": { codes: ["bE", "bE2", "dc", "dF", "dO", "Et", "FC", "FE", "HC", "HE", "HS", "tE", "tE1", "tE2", "tE3", "tS", "tO", "9E1", "9C1", "1AC7", "AC4", "1DC6"], machineType: "dryer" },
    "Frigidaire Dryer": { codes: ["E1A", "E20", "E21", "E22", "E23", "E24", "E25", "E40", "E41", "E42", "E43", "E44", "E45", "E50", "E51", "E52", "E53", "E54", "E55", "E56", "E60", "E61", "E62", "E63", "E64", "E65", "E66", "E67", "E68", "E69", "E70", "E71", "E80"], machineType: "dryer" },
    "Kenmore Dryer": { codes: ["AF", "L2", "E1", "E2", "E3", "E4", "E5", "F01", "F02", "F03", "F04", "F21", "F22", "F23", "F24", "F25", "F26", "F27", "F28", "F29", "F30", "F70", "F71", "F72", "F73", "PF"], machineType: "dryer" },
    "Girbau": { codes: ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10"], machineType: "washer" },
    "Electrolux Dryer": { codes: ["E10", "E20", "E21", "E40", "E50", "E60", "E61", "E62", "E63", "E64", "E65", "E66", "E70", "E71", "E80", "E90", "E91", "EH1", "EH2", "EH3"], machineType: "dryer" },
    "Miele Dryer": { codes: ["F01", "F02", "F03", "F04", "F05", "F10", "F11", "F15", "F16", "F18", "F19", "F20", "F24", "F26", "F29", "F34", "F35", "F39", "F55", "F62", "F63", "F66"], machineType: "dryer" },
    "Advantage Laundry": { codes: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"], machineType: "washer" },
    "Nayax": { codes: ["OFFLINE", "NO_AUTH", "DECLINED", "TIMEOUT", "BUSY", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"], machineType: "payment" },
    "Hamilton": { codes: ["EXTRA_COIN", "JAM", "EMPTY", "BUSY", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"], machineType: "payment" },
    "Rowe": { codes: ["EXTRA_COIN", "JAM", "EMPTY", "BUSY", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"], machineType: "payment" },
    "ESD": { codes: ["COIN_ERR", "CARD_ERR", "COMM_ERR", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"], machineType: "payment" },
    "Fascard": { codes: ["OFFLINE", "NO_FUNDS", "NO_AUTH", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10"], machineType: "payment" },
  };
  
  for (const [manufacturer, data] of Object.entries(brandCodes)) {
    for (const code of data.codes) {
      const desc = data.descriptions?.[code] || `Error Code ${code}`;
      codes.push({
        code,
        manufacturer,
        machineType: data.machineType,
        title: desc,
        description: `${manufacturer} ${data.machineType}: ${desc}`,
        severity: "medium",
        skillLevel: "intermediate",
        estimatedRepairTime: 30,
        possibleCauses: [],
        troubleshootingSteps: [],
        partsWithPricing: [],
        quickFix: "",
        testModeEntry: TEST_MODES[manufacturer] || "",
        eraCompatibility: "2000-2025",
        modelSeries: ""
      });
    }
  }
  
  const speedQueenCodes = [
    { code: "Er_dL", title: "Door Lock Failure", machineType: "washer", parts: [{ partNumber: "F808214P", name: "Lock Solenoid", price: 65, supplier: "Alliance Parts" }], quickFix: "Spray WD-40 on strike & latch first" },
    { code: "Er_dr", title: "Drain Error", machineType: "washer", parts: [{ partNumber: "F802118P", name: "Drain Pump", price: 89, supplier: "Alliance Parts" }], quickFix: "Clean pump filter/coin trap first - 70% fix" },
    { code: "Er_FL", title: "Fill Error", machineType: "washer", parts: [{ partNumber: "F808213P", name: "Inlet Valve", price: 55, supplier: "Alliance Parts" }], quickFix: "Clean inlet screens with toothbrush - 85% fix" },
    { code: "Er_Ub", title: "Unbalance Error", machineType: "washer", parts: [{ partNumber: "F8534701P", name: "Shock Kit (4)", price: 120, supplier: "Alliance Parts" }], quickFix: "Redistribute load first" },
    { code: "Er_dF", title: "Drive Failure", machineType: "washer", parts: [{ partNumber: "F808227P", name: "Comm Cable", price: 15, supplier: "Alliance Parts" }], quickFix: "9/10 times it's the $15 comm cable - reseat J6 first" },
    { code: "E:AF", title: "Airflow Restriction", machineType: "dryer", parts: [{ partNumber: "F8424501", name: "Sail Switch", price: 35, supplier: "Alliance Parts" }], quickFix: "Clean lint screen + exhaust duct - 60% fix" },
    { code: "E:HC", title: "Heater Circuit Error", machineType: "dryer", parts: [{ partNumber: "279834", name: "Gas Coil Kit", price: 25, supplier: "Whirlpool" }], quickFix: "GAS: If igniter glows but no flame, replace $25 coils" },
    { code: "PF", title: "Power Failure", machineType: "both", parts: [{ partNumber: "F808229P", name: "Fuse Kit", price: 12, supplier: "Alliance Parts" }], quickFix: "Press Start to resume, check breaker if recurring" },
  ];
  
  for (const sq of speedQueenCodes) {
    codes.push({
      code: sq.code,
      manufacturer: "Speed Queen",
      machineType: sq.machineType,
      title: sq.title,
      description: `Speed Queen ${sq.machineType} error: ${sq.title}`,
      severity: determineSeverity(sq.code, sq.title),
      skillLevel: determineSkillLevel(sq.title, sq.parts),
      estimatedRepairTime: 30,
      possibleCauses: [],
      troubleshootingSteps: ["Power cycle - unplug 60 seconds", "Check voltage 208-240V", "Enter test mode"],
      partsWithPricing: sq.parts,
      quickFix: sq.quickFix,
      testModeEntry: TEST_MODES["Speed Queen"],
      eraCompatibility: "1990-2025",
      modelSeries: "All Speed Queen commercial"
    });
  }
  
  const dexterCodes = [
    { code: "D001", title: "Main Control Board Failure", parts: [{ partNumber: "9857-132-001", name: "Control Board", price: 180, supplier: "Dexter Parts" }] },
    { code: "D013", title: "Inverter Over-Current", parts: [{ partNumber: "9857-134-001", name: "Inverter Fuse 15A", price: 10, supplier: "Dexter Parts" }], quickFix: "95% of the time it's the $10 fuse" },
    { code: "D015", title: "Door Lock Timeout", parts: [{ partNumber: "9857-116-001", name: "Door Lock", price: 68, supplier: "Dexter Parts" }] },
    { code: "DF08", title: "Rotation Fault", parts: [{ partNumber: "9857-072-001", name: "Drive Belt", price: 28, supplier: "Dexter Parts" }], quickFix: "Check belt for cracks first" },
  ];
  
  for (const dx of dexterCodes) {
    codes.push({
      code: dx.code,
      manufacturer: "Dexter",
      machineType: dx.code.startsWith("DF") ? "dryer" : "washer",
      title: dx.title,
      description: `Dexter error: ${dx.title}`,
      severity: determineSeverity(dx.code, dx.title),
      skillLevel: determineSkillLevel(dx.title, dx.parts),
      estimatedRepairTime: 30,
      possibleCauses: [],
      troubleshootingSteps: [],
      partsWithPricing: dx.parts,
      quickFix: dx.quickFix || "",
      testModeEntry: TEST_MODES["Dexter"],
      eraCompatibility: "2000-2025",
      modelSeries: "T-300, T-400, T-600, T-900, T-1200"
    });
  }
  
  const adcCodes = [
    { code: "SAIL_OPEN", title: "Sail Switch Open", parts: [{ partNumber: "ADC-881210", name: "Sail Switch", price: 35, supplier: "ADC Parts" }], quickFix: "Bend sail switch arm 1/8 inch - saves $35 part" },
    { code: "IGNITION", title: "Ignition Failure", parts: [{ partNumber: "ADC-008P", name: "Igniter", price: 45, supplier: "ADC Parts" }] },
    { code: "FLAME", title: "Flame Sensor Fault", parts: [{ partNumber: "ADC-009P", name: "Flame Sensor", price: 25, supplier: "ADC Parts" }] },
    { code: "ROTATION", title: "Rotation Fault", parts: [{ partNumber: "ADC-010P", name: "Belt", price: 28, supplier: "ADC Parts" }] },
  ];
  
  for (const adc of adcCodes) {
    codes.push({
      code: adc.code,
      manufacturer: "ADC",
      machineType: "dryer",
      title: adc.title,
      description: `ADC dryer error: ${adc.title}`,
      severity: determineSeverity(adc.code, adc.title),
      skillLevel: determineSkillLevel(adc.title, adc.parts),
      estimatedRepairTime: 30,
      possibleCauses: [],
      troubleshootingSteps: [],
      partsWithPricing: adc.parts,
      quickFix: adc.quickFix || "",
      testModeEntry: TEST_MODES["ADC"],
      eraCompatibility: "1990-2025",
      modelSeries: "AD-15 through AD-200"
    });
  }
  
  return codes;
}

function mergeCode(existing: ParsedCode, newCode: ParsedCode): ParsedCode {
  return {
    code: existing.code,
    manufacturer: existing.manufacturer,
    machineType: existing.machineType !== "both" ? existing.machineType : newCode.machineType,
    title: existing.title.length > newCode.title.length ? existing.title : newCode.title,
    description: existing.description.length > newCode.description.length ? existing.description : newCode.description,
    severity: existing.severity !== "medium" ? existing.severity : newCode.severity,
    skillLevel: existing.skillLevel !== "intermediate" ? existing.skillLevel : newCode.skillLevel,
    estimatedRepairTime: existing.estimatedRepairTime !== 30 ? existing.estimatedRepairTime : newCode.estimatedRepairTime,
    possibleCauses: [...new Set([...existing.possibleCauses, ...newCode.possibleCauses])],
    troubleshootingSteps: existing.troubleshootingSteps.length > 0 ? existing.troubleshootingSteps : newCode.troubleshootingSteps,
    partsWithPricing: existing.partsWithPricing.length > 0 ? existing.partsWithPricing : newCode.partsWithPricing,
    quickFix: existing.quickFix || newCode.quickFix,
    testModeEntry: existing.testModeEntry || newCode.testModeEntry,
    eraCompatibility: existing.eraCompatibility || newCode.eraCompatibility,
    modelSeries: existing.modelSeries || newCode.modelSeries
  };
}

async function importAllCodes() {
  console.log("=== Starting comprehensive error code import ===\n");
  
  const allCodes: Map<string, ParsedCode> = new Map();
  
  const files = [
    { path: "attached_assets/Pasted---1764294452049_1764294452049.txt", parser: (c: string) => parseSpeedQueenFull2025(c), name: "Speed Queen FULL 2025" },
    { path: "attached_assets/Pasted---1764294370439_1764294370439.txt", parser: (c: string) => parseDetailedCodesFile(c), name: "Detailed Codes (400+)" },
    { path: "attached_assets/Pasted---1764291118743_1764291118743.txt", parser: (c: string) => parseBrandCodesList(c), name: "939 Codes List" },
    { path: "attached_assets/Pasted--Y-1764295318717_1764295318717.txt", parser: (c: string) => parseTopLoadDryerFile(c, "washer"), name: "Top-Load Washers" },
    { path: "attached_assets/Pasted--E-1764295369085_1764295369085.txt", parser: (c: string) => parseTopLoadDryerFile(c, "dryer"), name: "Dryer Codes" },
    { path: "attached_assets/Pasted-HUEBSCH-E-FL-Fill-error-M401027P-Inlet-valve-50-E-DR--1764294706616_1764294706616.txt", parser: (c: string) => parseHuebschFile(c), name: "Huebsch/UniMac/IPSO" },
    { path: "attached_assets/Pasted---1764294820053_1764294820053.txt", parser: (c: string) => parseContinentalFile(c), name: "Continental/Wascomat/Domus/Cissell" },
    { path: "attached_assets/Pasted---1764295058384_1764295058384.txt", parser: (c: string) => parseLegacyFile(c), name: "Legacy 1990-2005" },
    { path: "attached_assets/Pasted--WA-1764294438019_1764294438019.txt", parser: (c: string) => parseMainDatabaseFile(c), name: "Main Database" },
  ];
  
  for (const file of files) {
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      console.log(`Parsing ${file.name}...`);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const codes = file.parser(content);
        console.log(`  Found ${codes.length} codes`);
        
        for (const code of codes) {
          const key = `${code.manufacturer.toLowerCase()}-${code.code.toLowerCase()}`;
          if (allCodes.has(key)) {
            allCodes.set(key, mergeCode(allCodes.get(key)!, code));
          } else {
            allCodes.set(key, code);
          }
        }
      } catch (error) {
        console.error(`  Error parsing ${file.name}:`, error);
      }
    } else {
      console.log(`  Skipping (not found): ${file.path}`);
    }
  }
  
  console.log(`\nTotal codes from files: ${allCodes.size}`);
  
  const comprehensiveCodes = generateComprehensiveCodes();
  console.log(`Adding ${comprehensiveCodes.length} comprehensive codes...`);
  
  for (const code of comprehensiveCodes) {
    const key = `${code.manufacturer.toLowerCase()}-${code.code.toLowerCase()}`;
    if (allCodes.has(key)) {
      allCodes.set(key, mergeCode(allCodes.get(key)!, code));
    } else {
      allCodes.set(key, code);
    }
  }
  
  console.log(`Total unique codes: ${allCodes.size}\n`);
  console.log("=== Inserting codes into database ===\n");
  
  let processedCount = 0;
  let errorCount = 0;
  const codesToInsert = Array.from(allCodes.values());
  
  for (const code of codesToInsert) {
    try {
      const slug = createSlug(code.manufacturer, code.code, code.machineType);
      
      await db.insert(diagnosticCodes)
        .values({
          slug,
          code: code.code,
          manufacturer: code.manufacturer,
          machineType: code.machineType,
          title: code.title || `Error ${code.code}`,
          description: code.description || `${code.manufacturer} error code ${code.code}`,
          severity: code.severity || "medium",
          skillLevel: code.skillLevel || "intermediate",
          estimatedRepairTime: code.estimatedRepairTime || 30,
          possibleCauses: code.possibleCauses.length > 0 ? code.possibleCauses : null,
          troubleshootingSteps: code.troubleshootingSteps.length > 0 ? code.troubleshootingSteps : null,
          partsWithPricing: code.partsWithPricing.length > 0 ? code.partsWithPricing : null,
          quickFix: code.quickFix || null,
          testModeEntry: code.testModeEntry || null,
          eraCompatibility: code.eraCompatibility || null,
          modelSeries: code.modelSeries || null,
        })
        .onConflictDoUpdate({
          target: diagnosticCodes.slug,
          set: {
            title: sql`CASE WHEN LENGTH(EXCLUDED.title) > LENGTH(diagnostic_codes.title) THEN EXCLUDED.title ELSE diagnostic_codes.title END`,
            description: sql`CASE WHEN LENGTH(EXCLUDED.description) > LENGTH(diagnostic_codes.description) THEN EXCLUDED.description ELSE diagnostic_codes.description END`,
            severity: sql`COALESCE(EXCLUDED.severity, diagnostic_codes.severity)`,
            skillLevel: sql`COALESCE(EXCLUDED.skill_level, diagnostic_codes.skill_level)`,
            estimatedRepairTime: sql`COALESCE(EXCLUDED.estimated_repair_time, diagnostic_codes.estimated_repair_time)`,
            possibleCauses: sql`COALESCE(EXCLUDED.possible_causes, diagnostic_codes.possible_causes)`,
            troubleshootingSteps: sql`COALESCE(EXCLUDED.troubleshooting_steps, diagnostic_codes.troubleshooting_steps)`,
            partsWithPricing: sql`COALESCE(EXCLUDED.parts_with_pricing, diagnostic_codes.parts_with_pricing)`,
            quickFix: sql`COALESCE(EXCLUDED.quick_fix, diagnostic_codes.quick_fix)`,
            testModeEntry: sql`COALESCE(EXCLUDED.test_mode_entry, diagnostic_codes.test_mode_entry)`,
            eraCompatibility: sql`COALESCE(EXCLUDED.era_compatibility, diagnostic_codes.era_compatibility)`,
            modelSeries: sql`COALESCE(EXCLUDED.model_series, diagnostic_codes.model_series)`,
            updatedAt: sql`NOW()`
          }
        });
      
      processedCount++;
      
      if (processedCount % 200 === 0) {
        console.log(`  Processed ${processedCount} codes...`);
      }
    } catch (error: any) {
      errorCount++;
      if (errorCount < 5) {
        console.error(`  Error with ${code.manufacturer} ${code.code}: ${error.message?.substring(0, 100)}`);
      }
    }
  }
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(diagnosticCodes);
  const totalCount = countResult[0]?.count || 0;
  
  const manufacturerStats = await db.execute(sql`
    SELECT manufacturer, COUNT(*) as count 
    FROM diagnostic_codes 
    GROUP BY manufacturer 
    ORDER BY count DESC
    LIMIT 25
  `);
  
  console.log("\n=== Import Complete ===");
  console.log(`Total codes in database: ${totalCount}`);
  console.log(`Codes processed this run: ${processedCount}`);
  console.log(`Errors: ${errorCount}`);
  
  console.log("\n=== Top Manufacturers ===");
  for (const row of manufacturerStats.rows as any[]) {
    console.log(`  ${row.manufacturer}: ${row.count}`);
  }
}

importAllCodes()
  .then(() => {
    console.log("\n=== Script completed successfully ===");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  });
