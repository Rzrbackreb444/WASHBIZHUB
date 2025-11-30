/**
 * CLEANBI™ Grading System - Single Source of Truth
 * 
 * MANDATORY: Chrome Web Store Style - ONLY A, B, C, Needs Work
 * NEVER use D or F grades!
 * 
 * Grade thresholds:
 * - A = 85+ (Excellent opportunity)
 * - B = 70-84 (Good opportunity)  
 * - C = 55-69 (Fair opportunity)
 * - Needs Work = Below 55 (Requires strategic improvements)
 * 
 * Colors:
 * - A = #22C55E (green)
 * - B = #A3E635 (lime)
 * - C = #FBBF24 (amber)
 * - Needs Work = #C8A661 (gold)
 */

export type CLEANBIGrade = 'A' | 'B' | 'C' | 'Needs Work';

export interface GradeInfo {
  grade: CLEANBIGrade;
  label: string;
  color: string;
  opportunity: string;
  description: string;
}

export const GRADE_THRESHOLDS = {
  A: 85,
  B: 70,
  C: 55,
} as const;

export const GRADE_COLORS: Record<CLEANBIGrade, string> = {
  'A': '#22C55E',
  'B': '#A3E635',
  'C': '#FBBF24',
  'Needs Work': '#C8A661',
};

export const GRADE_LABELS: Record<CLEANBIGrade, string> = {
  'A': 'Excellent',
  'B': 'Good Potential',
  'C': 'Fair',
  'Needs Work': 'Needs Improvement',
};

export const GRADE_OPPORTUNITIES: Record<CLEANBIGrade, string> = {
  'A': 'Gold Mine Zone',
  'B': 'High Opportunity',
  'C': 'Good Potential',
  'Needs Work': 'Room to Grow',
};

export const GRADE_DESCRIPTIONS: Record<CLEANBIGrade, string> = {
  'A': 'Excellent location with high growth potential',
  'B': 'Strong fundamentals with good opportunity',
  'C': 'Moderate potential with room for optimization',
  'Needs Work': 'Strategic improvements recommended',
};

/**
 * Get the CLEANBI grade for a given score
 * Uses ONLY A, B, C, Needs Work - NO D or F grades!
 */
export function getGrade(score: number): CLEANBIGrade {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  return 'Needs Work';
}

/**
 * Get full grade information for a given score
 */
export function getGradeInfo(score: number): GradeInfo {
  const grade = getGrade(score);
  return {
    grade,
    label: GRADE_LABELS[grade],
    color: GRADE_COLORS[grade],
    opportunity: GRADE_OPPORTUNITIES[grade],
    description: GRADE_DESCRIPTIONS[grade],
  };
}

/**
 * Validate that a grade string is valid (no D or F!)
 */
export function isValidGrade(grade: string): grade is CLEANBIGrade {
  return ['A', 'B', 'C', 'Needs Work'].includes(grade);
}

/**
 * Convert legacy grades (D, F) to proper CLEANBI grades
 */
export function normalizeGrade(grade: string): CLEANBIGrade {
  const upper = grade.toUpperCase();
  if (upper === 'A' || upper === 'A+' || upper === 'A-') return 'A';
  if (upper === 'B' || upper === 'B+' || upper === 'B-') return 'B';
  if (upper === 'C' || upper === 'C+' || upper === 'C-') return 'C';
  return 'Needs Work';
}
