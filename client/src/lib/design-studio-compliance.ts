/**
 * WashBizHub Design Studio Compliance Checker
 * ADA, Venting, Parking, Service Access, Fire Safety Validation
 * Based on 2025 codes: IRC/IFC/NFPA 2021-2025, ADA 2010, OSHA 1910.264, NEC 2025
 */

import { COMPLIANCE_RULES } from "./equipment-database-2025";

export interface PlacedEquipment {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
  type: string;
}

export interface RoomDimensions {
  width: number;  // feet
  length: number; // feet
  sqft: number;
}

export interface ComplianceIssue {
  id: string;
  type: "error" | "warning" | "info";
  category: "ada" | "venting" | "parking" | "service" | "fire" | "layout";
  title: string;
  description: string;
  recommendation: string;
  affectedItems?: string[];
  code?: string;
}

export interface ComplianceResult {
  passed: boolean;
  score: number; // 0-100
  grade: "A" | "B" | "C" | "Needs Work";
  issues: ComplianceIssue[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
  breakdown: {
    ada: { score: number; passed: boolean };
    venting: { score: number; passed: boolean };
    parking: { score: number; passed: boolean };
    service: { score: number; passed: boolean };
    fire: { score: number; passed: boolean };
    layout: { score: number; passed: boolean };
  };
}

/**
 * Check ADA compliance for the layout
 */
function checkADACompliance(
  equipment: PlacedEquipment[],
  room: RoomDimensions
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const { ada, aisles } = COMPLIANCE_RULES;

  // Check for 36" minimum aisle width between equipment
  const machines = equipment.filter(e => 
    ["washer", "dryer", "stack", "combo"].includes(e.type)
  );

  // Check minimum path width
  if (machines.length >= 2) {
    for (let i = 0; i < machines.length; i++) {
      for (let j = i + 1; j < machines.length; j++) {
        const m1 = machines[i];
        const m2 = machines[j];
        
        // Calculate gap between machines (simplified - horizontal check)
        const m1Right = m1.x + m1.width / 12; // convert inches to feet
        const m2Left = m2.x;
        const horizontalGap = Math.abs(m2Left - m1Right) * 12; // back to inches
        
        if (horizontalGap > 0 && horizontalGap < ada.pathWidth) {
          issues.push({
            id: `ada-path-${i}-${j}`,
            type: "error",
            category: "ada",
            title: "Insufficient ADA Path Width",
            description: `Gap between equipment is ${horizontalGap.toFixed(0)}" - minimum required is ${ada.pathWidth}"`,
            recommendation: `Increase spacing to at least ${ada.pathWidth}" for wheelchair accessibility`,
            affectedItems: [m1.id, m2.id],
            code: "ADA 2010 §403.5.1"
          });
        }
      }
    }
  }

  // Check front clearance for each machine
  machines.forEach((machine, idx) => {
    const frontClearance = machine.y * 12; // Assuming y=0 is front wall
    if (frontClearance < ada.frontClearance) {
      issues.push({
        id: `ada-front-${idx}`,
        type: "warning",
        category: "ada",
        title: "Limited Front Clearance",
        description: `Machine has ${frontClearance.toFixed(0)}" front clearance - ${ada.frontClearance}" recommended for wheelchair access`,
        recommendation: "Move machine back to provide 48\" clear floor space in front",
        affectedItems: [machine.id],
        code: "ADA 2010 §305"
      });
    }
  });

  // Check for ADA restroom (60x60 turning radius)
  const restrooms = equipment.filter(e => e.type === "restroom");
  if (restrooms.length === 0 && room.sqft >= 1000) {
    issues.push({
      id: "ada-restroom-missing",
      type: "error",
      category: "ada",
      title: "ADA Restroom Required",
      description: "No ADA-compliant restroom detected. Spaces over 1,000 sq ft require accessible facilities.",
      recommendation: "Add ADA restroom with 60\"x60\" turning radius, grab bars, and 32\" door",
      code: "IBC 2021 §1109"
    });
  }

  // Check accessible machine ratio (2/3 must be accessible)
  const accessibleCount = machines.filter(m => {
    const heightInches = m.height;
    return heightInches <= 48; // Stack units may exceed accessible reach
  }).length;

  const accessibleRatio = machines.length > 0 ? accessibleCount / machines.length : 1;
  if (accessibleRatio < ada.accessibleRatio) {
    issues.push({
      id: "ada-accessible-ratio",
      type: "warning",
      category: "ada",
      title: "Accessible Machine Ratio",
      description: `Only ${(accessibleRatio * 100).toFixed(0)}% of machines are accessible - ${(ada.accessibleRatio * 100).toFixed(0)}% required`,
      recommendation: "Replace some stacked units with single-pocket machines for better accessibility",
      code: "ADA 2010 §4.1.3"
    });
  }

  return issues;
}

/**
 * Check dryer venting compliance
 */
function checkVentingCompliance(
  equipment: PlacedEquipment[],
  room: RoomDimensions
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const { venting, service } = COMPLIANCE_RULES;

  const dryers = equipment.filter(e => 
    ["dryer", "stack", "combo"].includes(e.type)
  );

  dryers.forEach((dryer, idx) => {
    // Check rear clearance for venting
    const rearClearance = (room.length - dryer.y - dryer.depth / 12) * 12; // inches from rear wall
    
    if (rearClearance < venting.rearClearance) {
      issues.push({
        id: `venting-rear-${idx}`,
        type: "error",
        category: "venting",
        title: "Insufficient Rear Venting Clearance",
        description: `Dryer has ${rearClearance.toFixed(0)}" rear clearance - minimum ${venting.rearClearance}" required for 4\" rigid duct`,
        recommendation: `Move dryer forward to provide ${venting.rearClearance}-${venting.maxRearClearance}" clearance for proper venting`,
        affectedItems: [dryer.id],
        code: "NFPA 54/58, IRC M1502"
      });
    }

    // Check side clearance for service access
    const leftGap = dryer.x * 12;
    const rightGap = (room.width - dryer.x - dryer.width / 12) * 12;
    
    if (leftGap < 18 && rightGap < 18) {
      issues.push({
        id: `venting-side-${idx}`,
        type: "warning",
        category: "venting",
        title: "Limited Side Access",
        description: "Dryer may be difficult to service - recommend 18\" minimum from corners",
        recommendation: "Provide 18\" side clearance for service technician access",
        affectedItems: [dryer.id],
        code: "IBC 2021"
      });
    }
  });

  // Check for shared vent header concerns
  if (dryers.length > 4) {
    issues.push({
      id: "venting-shared-header",
      type: "info",
      category: "venting",
      title: "Multi-Dryer Venting Consideration",
      description: `${dryers.length} dryers detected - consider booster fans for runs over 15 ft`,
      recommendation: "Use individual vents preferred; if shared header, limit to ≤15 ft horizontal per dryer at 45° angle joins. Consider Greenheck G-Series exhaust fans (500-2k CFM).",
      code: "NFPA 54"
    });
  }

  return issues;
}

/**
 * Check service access compliance
 */
function checkServiceCompliance(
  equipment: PlacedEquipment[],
  room: RoomDimensions
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const { service } = COMPLIANCE_RULES;

  const machines = equipment.filter(e => 
    ["washer", "dryer", "stack", "combo"].includes(e.type)
  );

  machines.forEach((machine, idx) => {
    // Check rear service access
    const rearClearance = (room.length - machine.y - machine.depth / 12) * 12;
    
    if (rearClearance < service.rearAccess) {
      issues.push({
        id: `service-rear-${idx}`,
        type: "warning",
        category: "service",
        title: "Limited Rear Service Access",
        description: `Machine has ${rearClearance.toFixed(0)}" rear access - ${service.rearAccess}-${service.maxRearAccess}" recommended for technicians`,
        recommendation: "Provide 24-36\" rear clearance for belts, pipes, and service tools. Consider lockable access panels.",
        affectedItems: [machine.id],
        code: "OSHA 1910.264"
      });
    }

    // Check front service/user access
    const frontClearance = machine.y * 12;
    if (frontClearance < service.frontAccess) {
      issues.push({
        id: `service-front-${idx}`,
        type: "warning",
        category: "service",
        title: "Limited Front Access",
        description: `Machine has ${frontClearance.toFixed(0)}" front clearance - ${service.frontAccess}" recommended`,
        recommendation: "Provide 48\" front path for wheelchair + cart access and customer loading",
        affectedItems: [machine.id],
        code: "ADA/UD"
      });
    }
  });

  return issues;
}

/**
 * Check fire safety compliance
 */
function checkFireCompliance(
  equipment: PlacedEquipment[],
  room: RoomDimensions
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const { fire, aisles } = COMPLIANCE_RULES;

  // Check for emergency exits
  const doors = equipment.filter(e => e.type === "door");
  const emergencyDoors = doors.filter(d => d.equipmentId?.includes("emergency"));
  
  if (room.sqft >= 1500 && emergencyDoors.length === 0) {
    issues.push({
      id: "fire-emergency-exit",
      type: "warning",
      category: "fire",
      title: "Emergency Exit Recommended",
      description: "No emergency exit door detected. Spaces over 1,500 sq ft should have secondary egress.",
      recommendation: "Add emergency exit door with push bar. Ensure 3 ft clear aisle to all exits.",
      code: "IFC 2021"
    });
  }

  // Check fire extinguisher spacing
  const maxDistance = room.sqft > (fire.extinguisherSpacing * fire.extinguisherSpacing) ? true : false;
  if (maxDistance) {
    issues.push({
      id: "fire-extinguisher",
      type: "info",
      category: "fire",
      title: "Fire Extinguisher Placement",
      description: `Large space (${room.sqft} sq ft) - ensure fire extinguishers every ${fire.extinguisherSpacing} ft`,
      recommendation: "Mount Class E fire extinguishers for electrical equipment. Add signage. Annual inspections required.",
      code: "NFPA 10"
    });
  }

  // Check aisle width for emergency egress
  if (equipment.length > 0) {
    issues.push({
      id: "fire-egress-aisles",
      type: "info",
      category: "fire",
      title: "Emergency Egress Aisles",
      description: "Ensure 3 ft minimum clear aisle to all exits for emergency egress",
      recommendation: `Main aisles should be ${aisles.mainAisle}" (5 ft) for high-traffic areas. Secondary aisles minimum ${aisles.minWidth}" (3 ft).`,
      code: "IFC 2021 §1005"
    });
  }

  return issues;
}

/**
 * Check layout optimization
 */
function checkLayoutCompliance(
  equipment: PlacedEquipment[],
  room: RoomDimensions
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const { layout } = COMPLIANCE_RULES;

  const machines = equipment.filter(e => 
    ["washer", "dryer", "stack", "combo"].includes(e.type)
  );
  
  // Calculate space allocation
  const totalMachineArea = machines.reduce((sum, m) => {
    return sum + (m.width / 12) * (m.depth / 12);
  }, 0);
  
  const machinePercent = (totalMachineArea / room.sqft) * 100;

  if (machinePercent > 50) {
    issues.push({
      id: "layout-machine-density",
      type: "warning",
      category: "layout",
      title: "High Machine Density",
      description: `Equipment occupies ${machinePercent.toFixed(0)}% of floor space - optimal is ${layout.machinePercent}%`,
      recommendation: "Reduce equipment count or increase space. Aim for 40% machines, 30% aisles, 20% amenities, 10% utilities.",
      code: "Best Practice"
    });
  }

  if (machinePercent < 25 && machines.length > 0) {
    issues.push({
      id: "layout-underutilized",
      type: "info",
      category: "layout",
      title: "Space Underutilized",
      description: `Equipment only uses ${machinePercent.toFixed(0)}% of floor space - consider adding amenities`,
      recommendation: "Add WDF counter (200-500 sq ft for +45% revenue), seating areas, or vending to maximize revenue per sq ft.",
      code: "Best Practice"
    });
  }

  // Check for WDF area
  const wdfCounters = equipment.filter(e => e.type === "counter" || e.equipmentId?.includes("wdf"));
  if (wdfCounters.length === 0 && room.sqft >= 1500) {
    issues.push({
      id: "layout-wdf-missing",
      type: "info",
      category: "layout",
      title: "WDF Counter Recommended",
      description: "No Wash-Dry-Fold counter detected. WDF adds 40-50% profit margins.",
      recommendation: "Add 8-12 ft WDF counter near entrance. Target 200-500 sq ft WDF zone for $3-15k/mo additional revenue.",
      code: "Best Practice"
    });
  }

  // Check washer/dryer ratio
  const washers = machines.filter(m => m.type === "washer");
  const dryers = machines.filter(m => m.type === "dryer" || m.type === "stack");
  
  if (washers.length > 0 && dryers.length > 0) {
    const ratio = dryers.length / washers.length;
    if (ratio < 0.8) {
      issues.push({
        id: "layout-dryer-shortage",
        type: "warning",
        category: "layout",
        title: "Dryer Capacity Low",
        description: `Washer:Dryer ratio is 1:${ratio.toFixed(1)} - customers may wait for dryers`,
        recommendation: "Aim for 1:1 washer:dryer ratio or better. Consider stack dryers to save floor space.",
        code: "Best Practice"
      });
    }
  }

  return issues;
}

/**
 * Check parking compliance
 */
function checkParkingCompliance(
  equipment: PlacedEquipment[],
  room: RoomDimensions,
  parkingSpots: number = 0,
  adaSpots: number = 0
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const { parking } = COMPLIANCE_RULES;

  const washers = equipment.filter(e => e.type === "washer");
  const requiredSpots = Math.ceil(washers.length * parking.spotsPerWasher) + 1; // +1 for employee
  const requiredAda = Math.max(1, Math.ceil(parkingSpots / parking.adaRatio));

  if (parkingSpots > 0) {
    if (parkingSpots < requiredSpots) {
      issues.push({
        id: "parking-count",
        type: "warning",
        category: "parking",
        title: "Insufficient Parking",
        description: `${parkingSpots} spots available - ${requiredSpots} required (0.5/washer + 1/employee)`,
        recommendation: `Add ${requiredSpots - parkingSpots} parking spots to meet code requirements`,
        code: "Local Zoning"
      });
    }

    if (adaSpots < requiredAda) {
      issues.push({
        id: "parking-ada",
        type: "error",
        category: "parking",
        title: "Insufficient ADA Parking",
        description: `${adaSpots} ADA spots - ${requiredAda} required (1 per 25 total spots)`,
        recommendation: `Add ${requiredAda - adaSpots} ADA parking spaces (${parking.carSpaceWidth}" + ${60}" access aisle for cars, ${parking.vanSpaceWidth}" + ${60}" for vans)`,
        code: "ADA 2010 §502"
      });
    }
  }

  return issues;
}

/**
 * Run full compliance check
 */
export function runComplianceCheck(
  equipment: PlacedEquipment[],
  room: RoomDimensions,
  options: {
    parkingSpots?: number;
    adaSpots?: number;
  } = {}
): ComplianceResult {
  const allIssues: ComplianceIssue[] = [
    ...checkADACompliance(equipment, room),
    ...checkVentingCompliance(equipment, room),
    ...checkServiceCompliance(equipment, room),
    ...checkFireCompliance(equipment, room),
    ...checkLayoutCompliance(equipment, room),
    ...checkParkingCompliance(equipment, room, options.parkingSpots || 0, options.adaSpots || 0),
  ];

  const errors = allIssues.filter(i => i.type === "error").length;
  const warnings = allIssues.filter(i => i.type === "warning").length;
  const info = allIssues.filter(i => i.type === "info").length;

  // Calculate category scores
  const categoryScore = (category: ComplianceIssue["category"]) => {
    const categoryIssues = allIssues.filter(i => i.category === category);
    const categoryErrors = categoryIssues.filter(i => i.type === "error").length;
    const categoryWarnings = categoryIssues.filter(i => i.type === "warning").length;
    const score = Math.max(0, 100 - (categoryErrors * 25) - (categoryWarnings * 10));
    return { score, passed: categoryErrors === 0 };
  };

  const breakdown = {
    ada: categoryScore("ada"),
    venting: categoryScore("venting"),
    parking: categoryScore("parking"),
    service: categoryScore("service"),
    fire: categoryScore("fire"),
    layout: categoryScore("layout"),
  };

  // Calculate overall score
  const weights = { ada: 0.25, venting: 0.2, parking: 0.15, service: 0.15, fire: 0.15, layout: 0.1 };
  const overallScore = Math.round(
    Object.entries(breakdown).reduce((sum, [key, val]) => {
      return sum + val.score * (weights[key as keyof typeof weights] || 0.1);
    }, 0)
  );

  // Determine grade
  let grade: ComplianceResult["grade"];
  if (overallScore >= 85 && errors === 0) grade = "A";
  else if (overallScore >= 70) grade = "B";
  else if (overallScore >= 55) grade = "C";
  else grade = "Needs Work";

  return {
    passed: errors === 0,
    score: overallScore,
    grade,
    issues: allIssues,
    summary: {
      total: allIssues.length,
      errors,
      warnings,
      info,
    },
    breakdown,
  };
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade: ComplianceResult["grade"]): string {
  switch (grade) {
    case "A": return "#22C55E"; // green
    case "B": return "#A3E635"; // lime
    case "C": return "#FBBF24"; // amber
    case "Needs Work": return "#C8A661"; // gold
    default: return "#6B7280"; // gray
  }
}

/**
 * Get issue icon for UI
 */
export function getIssueIcon(type: ComplianceIssue["type"]): string {
  switch (type) {
    case "error": return "XCircle";
    case "warning": return "AlertTriangle";
    case "info": return "Info";
    default: return "Circle";
  }
}

/**
 * Get issue color for UI
 */
export function getIssueColor(type: ComplianceIssue["type"]): string {
  switch (type) {
    case "error": return "#EF4444"; // red
    case "warning": return "#F59E0B"; // amber
    case "info": return "#3B82F6"; // blue
    default: return "#6B7280"; // gray
  }
}
