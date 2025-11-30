/**
 * LAUNDROMAT CONSULTATION COUNCIL
 * 
 * A team of AI experts that collaborate to provide multi-million dollar 
 * business decisions for laundromat investments.
 * 
 * Expert Personas:
 * 1. Market Analyst - Demographics, competition, location scoring
 * 2. Financial Analyst - Valuation, ROI, cash flow projections  
 * 3. Operations Expert - Equipment efficiency, layout optimization
 * 4. Risk Assessor - Market saturation, economic factors, threats
 * 5. Strategic Advisor - Final synthesis and recommendations
 * 6. Dave Menz (Laundromat123.com) - 30+ years industry expertise
 */

import { askCouncil, consultCouncil } from './ai-council';
import { CONSULTATION_TIERS, DAVE_MENZ_PERSONA, ConsultationTier } from './consultation-tiers';
import { analyzeCompetition, generateHeatmapPoints } from './competition-analyzer';
import { generatePricingStrategy, analyzeFootTraffic, projectOptimizedRevenue, analyzeEquipmentCapacity } from './pricing-optimizer';

// Expert persona definitions
const EXPERT_PERSONAS = {
  marketAnalyst: {
    name: "Dr. Sarah Chen",
    title: "Market Analyst",
    expertise: "Demographics, Competition Analysis, Location Intelligence",
    style: "Data-driven, analytical, focuses on market trends and population dynamics",
    icon: "📊"
  },
  financialAnalyst: {
    name: "Michael Torres, CFA",
    title: "Financial Analyst", 
    expertise: "Valuation, ROI Projections, Cash Flow Analysis, Deal Structuring",
    style: "Numbers-focused, conservative estimates, emphasizes risk-adjusted returns",
    icon: "💰"
  },
  operationsExpert: {
    name: "James Williams",
    title: "Operations Expert",
    expertise: "Equipment Efficiency, Layout Optimization, Utility Management",
    style: "Practical, hands-on experience, focuses on operational excellence",
    icon: "⚙️"
  },
  riskAssessor: {
    name: "Dr. Emily Rodriguez",
    title: "Risk Assessor",
    expertise: "Market Saturation, Economic Factors, Threat Analysis",
    style: "Cautious, identifies potential pitfalls, stress-tests assumptions",
    icon: "⚠️"
  },
  strategicAdvisor: {
    name: "Robert Anderson",
    title: "Strategic Advisor",
    expertise: "Business Strategy, Investment Decisions, Growth Planning",
    style: "Big-picture thinker, synthesizes all inputs, provides actionable recommendations",
    icon: "🎯"
  },
  daveMenz: {
    name: "Dave Menz",
    title: "Industry Expert",
    company: "Laundromat123.com",
    expertise: "30+ years ownership, 500+ acquisitions consulted, Due Diligence Expert",
    style: "Tells it like it is, practical real-world experience, focuses on avoiding costly mistakes",
    icon: "👔",
    knowledgeBase: DAVE_MENZ_PERSONA.knowledgeBase
  }
};

// Calculator functions (simplified versions - integrate with existing calculators)
function calculateCLEANBI(data: LocationData): CLEANBIResult {
  const {
    population = 10000,
    medianIncome = 50000,
    competitors = 2,
    rentPerSqFt = 15,
    squareFootage = 2000,
    walkScore = 50,
    trafficCount = 5000
  } = data;

  // Population density score (0-20 points)
  const popScore = Math.min(20, (population / 1000) * 2);
  
  // Income score (0-20 points) - sweet spot $40K-$70K
  const incomeScore = medianIncome >= 40000 && medianIncome <= 70000 
    ? 20 
    : medianIncome < 40000 
      ? (medianIncome / 40000) * 15 
      : Math.max(10, 20 - ((medianIncome - 70000) / 10000));
  
  // Competition score (0-20 points) - fewer is better
  const compScore = Math.max(0, 20 - (competitors * 5));
  
  // Rent affordability score (0-15 points)
  const rentScore = rentPerSqFt <= 12 ? 15 : Math.max(0, 15 - ((rentPerSqFt - 12) * 1.5));
  
  // Accessibility score (0-15 points)
  const accessScore = (walkScore / 100) * 10 + Math.min(5, (trafficCount / 10000) * 5);
  
  // Size efficiency score (0-10 points)
  const sizeScore = squareFootage >= 1500 && squareFootage <= 3500 ? 10 : 
    squareFootage < 1500 ? (squareFootage / 1500) * 8 : Math.max(5, 10 - ((squareFootage - 3500) / 500));

  const totalScore = popScore + incomeScore + compScore + rentScore + accessScore + sizeScore;
  const grade = totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 55 ? 'C' : totalScore >= 40 ? 'D' : 'F';

  return {
    totalScore: Math.round(totalScore),
    grade,
    breakdown: {
      population: { score: Math.round(popScore), max: 20, description: "Trade area population density" },
      income: { score: Math.round(incomeScore), max: 20, description: "Median household income fit" },
      competition: { score: Math.round(compScore), max: 20, description: "Competitive landscape" },
      rent: { score: Math.round(rentScore), max: 15, description: "Rent affordability" },
      accessibility: { score: Math.round(accessScore), max: 15, description: "Walk score & traffic" },
      size: { score: Math.round(sizeScore), max: 10, description: "Space efficiency" }
    }
  };
}

function calculateValuation(data: FinancialData): ValuationResult {
  const {
    monthlyRevenue,
    monthlyRent,
    monthlyExpenses = monthlyRevenue * 0.35,
    askingPrice
  } = data;

  const annualRevenue = monthlyRevenue * 12;
  const annualRent = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualNOI = annualRevenue - annualRent - annualExpenses;
  
  // Multiple valuation methods
  const incomeApproach = annualNOI / 0.10; // 10% cap rate
  const revenueMultiple = annualRevenue * 1.5; // 1.5x revenue
  const cashFlowMultiple = annualNOI * 3.5; // 3.5x cash flow
  
  const averageValue = (incomeApproach + revenueMultiple + cashFlowMultiple) / 3;
  const priceToValue = askingPrice ? askingPrice / averageValue : null;

  return {
    annualRevenue,
    annualNOI,
    valuations: {
      incomeApproach: Math.round(incomeApproach),
      revenueMultiple: Math.round(revenueMultiple),
      cashFlowMultiple: Math.round(cashFlowMultiple),
      averageValue: Math.round(averageValue)
    },
    askingPrice,
    priceToValue: priceToValue ? Math.round(priceToValue * 100) / 100 : null,
    verdict: priceToValue 
      ? priceToValue <= 0.85 ? "STRONG BUY" 
        : priceToValue <= 1.0 ? "FAIR VALUE" 
        : priceToValue <= 1.15 ? "OVERPRICED" 
        : "AVOID"
      : "NEEDS PRICE"
  };
}

function calculateROI(data: InvestmentData): ROIResult {
  const {
    purchasePrice,
    downPayment = purchasePrice * 0.25,
    loanRate = 0.08,
    loanTerm = 10,
    monthlyNOI
  } = data;

  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = loanRate / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const monthlyCashFlow = monthlyNOI - monthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashROI = (annualCashFlow / downPayment) * 100;
  const paybackYears = downPayment / Math.max(1, annualCashFlow);

  return {
    downPayment: Math.round(downPayment),
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    annualCashFlow: Math.round(annualCashFlow),
    cashOnCashROI: Math.round(cashOnCashROI * 10) / 10,
    paybackYears: Math.round(paybackYears * 10) / 10,
    verdict: cashOnCashROI >= 20 ? "EXCELLENT" : cashOnCashROI >= 12 ? "GOOD" : cashOnCashROI >= 8 ? "ACCEPTABLE" : "POOR"
  };
}

function calculateBreakeven(data: BreakevenData): BreakevenResult {
  const {
    monthlyRevenue,
    monthlyFixedCosts,
    variableCostPercent = 0.15
  } = data;

  const monthlyVariableCosts = monthlyRevenue * variableCostPercent;
  const contributionMargin = 1 - variableCostPercent;
  const breakevenRevenue = monthlyFixedCosts / contributionMargin;
  const currentMargin = ((monthlyRevenue - monthlyFixedCosts - monthlyVariableCosts) / monthlyRevenue) * 100;
  const cushion = ((monthlyRevenue - breakevenRevenue) / monthlyRevenue) * 100;

  return {
    breakevenRevenue: Math.round(breakevenRevenue),
    currentRevenue: monthlyRevenue,
    marginOfSafety: Math.round(cushion),
    profitMargin: Math.round(currentMargin * 10) / 10,
    verdict: cushion >= 40 ? "VERY SAFE" : cushion >= 25 ? "HEALTHY" : cushion >= 10 ? "TIGHT" : "AT RISK"
  };
}

// Types
interface LocationData {
  address: string;
  population?: number;
  medianIncome?: number;
  competitors?: number;
  rentPerSqFt?: number;
  squareFootage?: number;
  walkScore?: number;
  trafficCount?: number;
}

interface FinancialData {
  monthlyRevenue: number;
  monthlyRent: number;
  monthlyExpenses?: number;
  askingPrice?: number;
}

interface InvestmentData {
  purchasePrice: number;
  downPayment?: number;
  loanRate?: number;
  loanTerm?: number;
  monthlyNOI: number;
}

interface BreakevenData {
  monthlyRevenue: number;
  monthlyFixedCosts: number;
  variableCostPercent?: number;
}

interface CLEANBIResult {
  totalScore: number;
  grade: string;
  breakdown: Record<string, { score: number; max: number; description: string }>;
}

interface ValuationResult {
  annualRevenue: number;
  annualNOI: number;
  valuations: Record<string, number>;
  askingPrice?: number;
  priceToValue: number | null;
  verdict: string;
}

interface ROIResult {
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashROI: number;
  paybackYears: number;
  verdict: string;
}

interface BreakevenResult {
  breakevenRevenue: number;
  currentRevenue: number;
  marginOfSafety: number;
  profitMargin: number;
  verdict: string;
}

interface ConsultationInput {
  address: string;
  // Coordinates (for heatmaps)
  lat?: number;
  lng?: number;
  // Location data
  population?: number;
  medianIncome?: number;
  competitors?: number;
  rentPerSqFt?: number;
  squareFootage?: number;
  walkScore?: number;
  trafficCount?: number;
  // Financial data
  monthlyRevenue?: number;
  monthlyRent?: number;
  monthlyExpenses?: number;
  askingPrice?: number;
  // Investment data
  downPaymentPercent?: number;
  loanRate?: number;
  loanTerm?: number;
  // Equipment data
  washers?: number;
  dryers?: number;
  equipmentAge?: number;
  // Additional context
  additionalContext?: string;
}

interface ExpertAnalysis {
  expert: typeof EXPERT_PERSONAS[keyof typeof EXPERT_PERSONAS];
  analysis: string;
  keyFindings: string[];
  recommendation: string;
  confidence: number;
}

interface ConsultationResult {
  sessionId: string;
  address: string;
  timestamp: string;
  calculatorResults: {
    cleanbi: CLEANBIResult;
    valuation: ValuationResult | null;
    roi: ROIResult | null;
    breakeven: BreakevenResult | null;
  };
  expertAnalyses: ExpertAnalysis[];
  finalRecommendation: {
    verdict: "STRONG BUY" | "BUY" | "HOLD" | "CAUTION" | "AVOID";
    confidence: number;
    summary: string;
    keyStrengths: string[];
    keyRisks: string[];
    actionItems: string[];
  };
  totalCost: number;
}

/**
 * Run the full Laundromat Consultation Council
 */
export async function runConsultationCouncil(input: ConsultationInput): Promise<ConsultationResult> {
  const sessionId = `LCC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  let totalCost = 0;

  console.log(`[Consultation Council] Starting session ${sessionId} for ${input.address}`);

  // Step 1: Run all calculators
  const cleanbiResult = calculateCLEANBI({
    address: input.address,
    population: input.population,
    medianIncome: input.medianIncome,
    competitors: input.competitors,
    rentPerSqFt: input.rentPerSqFt,
    squareFootage: input.squareFootage,
    walkScore: input.walkScore,
    trafficCount: input.trafficCount
  });

  let valuationResult: ValuationResult | null = null;
  let roiResult: ROIResult | null = null;
  let breakevenResult: BreakevenResult | null = null;

  if (input.monthlyRevenue && input.monthlyRent) {
    valuationResult = calculateValuation({
      monthlyRevenue: input.monthlyRevenue,
      monthlyRent: input.monthlyRent,
      monthlyExpenses: input.monthlyExpenses,
      askingPrice: input.askingPrice
    });

    if (input.askingPrice) {
      const monthlyNOI = (input.monthlyRevenue - input.monthlyRent - (input.monthlyExpenses || input.monthlyRevenue * 0.35));
      roiResult = calculateROI({
        purchasePrice: input.askingPrice,
        downPayment: input.askingPrice * (input.downPaymentPercent || 0.25),
        loanRate: input.loanRate || 0.08,
        loanTerm: input.loanTerm || 10,
        monthlyNOI
      });
    }

    const monthlyFixedCosts = input.monthlyRent + (input.monthlyExpenses || input.monthlyRevenue * 0.35);
    breakevenResult = calculateBreakeven({
      monthlyRevenue: input.monthlyRevenue,
      monthlyFixedCosts
    });
  }

  // Step 2: Prepare data summary for AI experts
  const dataSummary = `
LAUNDROMAT INVESTMENT ANALYSIS
==============================
Address: ${input.address}

LOCATION METRICS:
- Trade Area Population: ${input.population?.toLocaleString() || 'Unknown'}
- Median Household Income: $${input.medianIncome?.toLocaleString() || 'Unknown'}
- Competitors within 1 mile: ${input.competitors ?? 'Unknown'}
- Rent per Sq Ft: $${input.rentPerSqFt || 'Unknown'}
- Square Footage: ${input.squareFootage?.toLocaleString() || 'Unknown'} sq ft
- Walk Score: ${input.walkScore || 'Unknown'}
- Daily Traffic Count: ${input.trafficCount?.toLocaleString() || 'Unknown'}

CLEANBI SCORE: ${cleanbiResult.totalScore}/100 (Grade: ${cleanbiResult.grade})
${Object.entries(cleanbiResult.breakdown).map(([k, v]) => `  - ${v.description}: ${v.score}/${v.max}`).join('\n')}

${input.monthlyRevenue ? `
FINANCIAL METRICS:
- Monthly Revenue: $${input.monthlyRevenue.toLocaleString()}
- Monthly Rent: $${input.monthlyRent?.toLocaleString()}
- Monthly Expenses: $${(input.monthlyExpenses || input.monthlyRevenue * 0.35).toLocaleString()}
- Annual Revenue: $${(input.monthlyRevenue * 12).toLocaleString()}
- Asking Price: ${input.askingPrice ? '$' + input.askingPrice.toLocaleString() : 'Not provided'}

VALUATION ANALYSIS:
- Income Approach (10% cap): $${valuationResult?.valuations.incomeApproach.toLocaleString()}
- Revenue Multiple (1.5x): $${valuationResult?.valuations.revenueMultiple.toLocaleString()}
- Cash Flow Multiple (3.5x): $${valuationResult?.valuations.cashFlowMultiple.toLocaleString()}
- Average Value: $${valuationResult?.valuations.averageValue.toLocaleString()}
- Price-to-Value Ratio: ${valuationResult?.priceToValue || 'N/A'}
- Valuation Verdict: ${valuationResult?.verdict}
` : 'FINANCIAL DATA: Not provided'}

${roiResult ? `
ROI ANALYSIS:
- Down Payment (25%): $${roiResult.downPayment.toLocaleString()}
- Loan Amount: $${roiResult.loanAmount.toLocaleString()}
- Monthly Payment: $${roiResult.monthlyPayment.toLocaleString()}
- Monthly Cash Flow: $${roiResult.monthlyCashFlow.toLocaleString()}
- Annual Cash Flow: $${roiResult.annualCashFlow.toLocaleString()}
- Cash-on-Cash ROI: ${roiResult.cashOnCashROI}%
- Payback Period: ${roiResult.paybackYears} years
- ROI Verdict: ${roiResult.verdict}
` : ''}

${breakevenResult ? `
BREAKEVEN ANALYSIS:
- Breakeven Revenue: $${breakevenResult.breakevenRevenue.toLocaleString()}/month
- Current Revenue: $${breakevenResult.currentRevenue.toLocaleString()}/month
- Margin of Safety: ${breakevenResult.marginOfSafety}%
- Profit Margin: ${breakevenResult.profitMargin}%
- Safety Verdict: ${breakevenResult.verdict}
` : ''}

${input.washers ? `
EQUIPMENT:
- Washers: ${input.washers}
- Dryers: ${input.dryers}
- Equipment Age: ${input.equipmentAge || 'Unknown'} years
` : ''}

${input.additionalContext ? `
ADDITIONAL CONTEXT:
${input.additionalContext}
` : ''}
`;

  // Step 3: Get analysis from each expert
  const expertAnalyses: ExpertAnalysis[] = [];

  // Market Analyst
  const marketPrompt = `You are ${EXPERT_PERSONAS.marketAnalyst.name}, ${EXPERT_PERSONAS.marketAnalyst.title}.
Your expertise: ${EXPERT_PERSONAS.marketAnalyst.expertise}
Your style: ${EXPERT_PERSONAS.marketAnalyst.style}

Analyze this laundromat opportunity from a MARKET perspective:
${dataSummary}

Provide your analysis in this format:
1. MARKET ANALYSIS (2-3 paragraphs)
2. KEY FINDINGS (3-5 bullet points)
3. RECOMMENDATION (1 sentence)
4. CONFIDENCE LEVEL (percentage)`;

  const marketResult = await askCouncil({ prompt: marketPrompt, taskType: "analysis" });
  totalCost += marketResult.cost;
  
  expertAnalyses.push({
    expert: EXPERT_PERSONAS.marketAnalyst,
    analysis: marketResult.result,
    keyFindings: extractBulletPoints(marketResult.result),
    recommendation: extractRecommendation(marketResult.result),
    confidence: extractConfidence(marketResult.result)
  });

  // Financial Analyst
  const financialPrompt = `You are ${EXPERT_PERSONAS.financialAnalyst.name}, ${EXPERT_PERSONAS.financialAnalyst.title}.
Your expertise: ${EXPERT_PERSONAS.financialAnalyst.expertise}
Your style: ${EXPERT_PERSONAS.financialAnalyst.style}

Analyze this laundromat opportunity from a FINANCIAL perspective:
${dataSummary}

Provide your analysis in this format:
1. FINANCIAL ANALYSIS (2-3 paragraphs focusing on valuation, ROI, cash flow)
2. KEY FINDINGS (3-5 bullet points with specific numbers)
3. RECOMMENDATION (1 sentence on whether the deal makes financial sense)
4. CONFIDENCE LEVEL (percentage)`;

  const financialResult = await askCouncil({ prompt: financialPrompt, taskType: "analysis" });
  totalCost += financialResult.cost;

  expertAnalyses.push({
    expert: EXPERT_PERSONAS.financialAnalyst,
    analysis: financialResult.result,
    keyFindings: extractBulletPoints(financialResult.result),
    recommendation: extractRecommendation(financialResult.result),
    confidence: extractConfidence(financialResult.result)
  });

  // Operations Expert
  const operationsPrompt = `You are ${EXPERT_PERSONAS.operationsExpert.name}, ${EXPERT_PERSONAS.operationsExpert.title}.
Your expertise: ${EXPERT_PERSONAS.operationsExpert.expertise}
Your style: ${EXPERT_PERSONAS.operationsExpert.style}

Analyze this laundromat opportunity from an OPERATIONS perspective:
${dataSummary}

Provide your analysis in this format:
1. OPERATIONS ANALYSIS (2-3 paragraphs on equipment, efficiency, improvements)
2. KEY FINDINGS (3-5 bullet points)
3. RECOMMENDATION (1 sentence on operational viability)
4. CONFIDENCE LEVEL (percentage)`;

  const operationsResult = await askCouncil({ prompt: operationsPrompt, taskType: "analysis" });
  totalCost += operationsResult.cost;

  expertAnalyses.push({
    expert: EXPERT_PERSONAS.operationsExpert,
    analysis: operationsResult.result,
    keyFindings: extractBulletPoints(operationsResult.result),
    recommendation: extractRecommendation(operationsResult.result),
    confidence: extractConfidence(operationsResult.result)
  });

  // Risk Assessor
  const riskPrompt = `You are ${EXPERT_PERSONAS.riskAssessor.name}, ${EXPERT_PERSONAS.riskAssessor.title}.
Your expertise: ${EXPERT_PERSONAS.riskAssessor.expertise}
Your style: ${EXPERT_PERSONAS.riskAssessor.style}

Analyze this laundromat opportunity from a RISK perspective:
${dataSummary}

Provide your analysis in this format:
1. RISK ANALYSIS (2-3 paragraphs identifying threats, concerns, vulnerabilities)
2. KEY RISKS (3-5 bullet points - be specific about what could go wrong)
3. MITIGATION STRATEGIES (2-3 ways to reduce risk)
4. CONFIDENCE LEVEL (percentage - how confident are you in your risk assessment)`;

  const riskResult = await askCouncil({ prompt: riskPrompt, taskType: "analysis" });
  totalCost += riskResult.cost;

  expertAnalyses.push({
    expert: EXPERT_PERSONAS.riskAssessor,
    analysis: riskResult.result,
    keyFindings: extractBulletPoints(riskResult.result),
    recommendation: extractRecommendation(riskResult.result),
    confidence: extractConfidence(riskResult.result)
  });

  // Step 4: Strategic Advisor synthesizes all analyses
  const synthesisPrompt = `You are ${EXPERT_PERSONAS.strategicAdvisor.name}, ${EXPERT_PERSONAS.strategicAdvisor.title}.
Your expertise: ${EXPERT_PERSONAS.strategicAdvisor.expertise}
Your style: ${EXPERT_PERSONAS.strategicAdvisor.style}

You are the lead advisor synthesizing input from your expert team:

ORIGINAL DATA:
${dataSummary}

MARKET ANALYST (${EXPERT_PERSONAS.marketAnalyst.name}):
${marketResult.result}

FINANCIAL ANALYST (${EXPERT_PERSONAS.financialAnalyst.name}):
${financialResult.result}

OPERATIONS EXPERT (${EXPERT_PERSONAS.operationsExpert.name}):
${operationsResult.result}

RISK ASSESSOR (${EXPERT_PERSONAS.riskAssessor.name}):
${riskResult.result}

As the Strategic Advisor, synthesize all expert opinions and provide a FINAL RECOMMENDATION.

Format your response EXACTLY as follows:
VERDICT: [STRONG BUY / BUY / HOLD / CAUTION / AVOID]
CONFIDENCE: [percentage]

EXECUTIVE SUMMARY:
[2-3 paragraph synthesis of all expert opinions into a cohesive recommendation]

KEY STRENGTHS:
- [strength 1]
- [strength 2]
- [strength 3]

KEY RISKS:
- [risk 1]
- [risk 2]
- [risk 3]

ACTION ITEMS:
1. [Most important next step]
2. [Second priority]
3. [Third priority]`;

  const synthesisResult = await askCouncil({ prompt: synthesisPrompt, taskType: "analysis" });
  totalCost += synthesisResult.cost;

  expertAnalyses.push({
    expert: EXPERT_PERSONAS.strategicAdvisor,
    analysis: synthesisResult.result,
    keyFindings: extractBulletPoints(synthesisResult.result),
    recommendation: extractRecommendation(synthesisResult.result),
    confidence: extractConfidence(synthesisResult.result)
  });

  // Parse final recommendation
  const finalRecommendation = parseFinalRecommendation(synthesisResult.result);

  console.log(`[Consultation Council] Session ${sessionId} complete. Total cost: $${totalCost.toFixed(4)}`);

  return {
    sessionId,
    address: input.address,
    timestamp,
    calculatorResults: {
      cleanbi: cleanbiResult,
      valuation: valuationResult,
      roi: roiResult,
      breakeven: breakevenResult
    },
    expertAnalyses,
    finalRecommendation,
    totalCost
  };
}

// Helper functions
function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
      bullets.push(trimmed.replace(/^[-•\d.]+\s*/, '').trim());
    }
  }
  return bullets.slice(0, 5);
}

function extractRecommendation(text: string): string {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('recommendation')) {
      // Get next non-empty line
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j].trim();
        if (line && !line.includes(':')) {
          return line.replace(/^[-•\d.]+\s*/, '').trim();
        }
      }
    }
  }
  return "See full analysis for recommendation.";
}

function extractConfidence(text: string): number {
  const match = text.match(/(\d{1,3})%/);
  if (match) {
    const confidence = parseInt(match[1]);
    return Math.min(100, Math.max(0, confidence));
  }
  return 75; // Default confidence
}

function parseFinalRecommendation(text: string): ConsultationResult['finalRecommendation'] {
  let verdict: "STRONG BUY" | "BUY" | "HOLD" | "CAUTION" | "AVOID" = "HOLD";
  let confidence = 75;
  let summary = "";
  const keyStrengths: string[] = [];
  const keyRisks: string[] = [];
  const actionItems: string[] = [];

  const lines = text.split('\n');
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();
    const upper = trimmed.toUpperCase();

    if (upper.includes('VERDICT:')) {
      if (upper.includes('STRONG BUY')) verdict = "STRONG BUY";
      else if (upper.includes('BUY')) verdict = "BUY";
      else if (upper.includes('HOLD')) verdict = "HOLD";
      else if (upper.includes('CAUTION')) verdict = "CAUTION";
      else if (upper.includes('AVOID')) verdict = "AVOID";
    }

    if (upper.includes('CONFIDENCE:')) {
      const match = trimmed.match(/(\d{1,3})%?/);
      if (match) confidence = parseInt(match[1]);
    }

    if (upper.includes('EXECUTIVE SUMMARY')) {
      currentSection = "summary";
    } else if (upper.includes('KEY STRENGTHS')) {
      currentSection = "strengths";
    } else if (upper.includes('KEY RISKS')) {
      currentSection = "risks";
    } else if (upper.includes('ACTION ITEMS')) {
      currentSection = "actions";
    } else if (trimmed && !trimmed.endsWith(':')) {
      const bulletText = trimmed.replace(/^[-•\d.]+\s*/, '').trim();
      
      if (currentSection === "summary" && !trimmed.startsWith('-')) {
        summary += (summary ? ' ' : '') + trimmed;
      } else if (currentSection === "strengths" && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        keyStrengths.push(bulletText);
      } else if (currentSection === "risks" && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        keyRisks.push(bulletText);
      } else if (currentSection === "actions" && (trimmed.match(/^\d+\./) || trimmed.startsWith('-'))) {
        actionItems.push(bulletText);
      }
    }
  }

  return {
    verdict,
    confidence,
    summary: summary || "See detailed expert analyses for complete evaluation.",
    keyStrengths: keyStrengths.slice(0, 5),
    keyRisks: keyRisks.slice(0, 5),
    actionItems: actionItems.slice(0, 5)
  };
}

/**
 * Run tiered consultation based on selected package
 */
export async function runTieredConsultation(
  input: ConsultationInput,
  tierId: string = "professional"
): Promise<ConsultationResult & {
  tier: ConsultationTier;
  competitionHeatmap?: any;
  pricingStrategy?: any;
  footTraffic?: any;
  equipmentAnalysis?: any;
  daveMenzReview?: any;
}> {
  const tier = CONSULTATION_TIERS.find(t => t.id === tierId);
  if (!tier) {
    throw new Error(`Invalid tier: ${tierId}`);
  }

  console.log(`[Consultation Council] Running ${tier.name} (${tierId}) consultation`);

  // Run base consultation
  const baseResult = await runConsultationCouncil(input);
  
  // For basic tier, just return base with limited experts
  if (tierId === "basic") {
    return {
      ...baseResult,
      tier,
      expertAnalyses: baseResult.expertAnalyses.slice(0, 1) // Just market analyst
    };
  }

  // For professional tier, return full base result
  if (tierId === "professional") {
    return {
      ...baseResult,
      tier
    };
  }

  // Enterprise and Premium tiers get enhanced features
  const lat = input.lat || 34.7465; // Default coordinates if not provided
  const lng = input.lng || -92.2896;

  // Competition Heatmap (Enterprise+)
  let competitionHeatmap = null;
  if (tier.includes.competitionHeatmap) {
    const competition = await analyzeCompetition(lat, lng, 3);
    const heatmapPoints = generateHeatmapPoints(lat, lng, competition.competitors);
    competitionHeatmap = {
      ...competition,
      heatmapPoints
    };
  }

  // Pricing Strategy (Enterprise+)
  let pricingStrategy = null;
  if (tier.includes.pricingOptimizer && input.washers && input.dryers) {
    pricingStrategy = generatePricingStrategy({
      machines: [
        { type: "frontLoad20lb", count: Math.floor(input.washers * 0.5) },
        { type: "frontLoad40lb", count: Math.floor(input.washers * 0.3) },
        { type: "frontLoad60lb", count: Math.floor(input.washers * 0.2) },
        { type: "dryer30lb", count: Math.floor(input.dryers * 0.6) },
        { type: "dryer50lb", count: Math.floor(input.dryers * 0.4) }
      ],
      location: {
        lat,
        lng,
        medianIncome: input.medianIncome || 50000,
        population: input.population || 30000
      },
      competition: {
        count: input.competitors || 2
      }
    });
  }

  // Foot Traffic Analysis (Enterprise+)
  let footTraffic = null;
  if (tier.includes.footTrafficAnalysis && input.trafficCount) {
    footTraffic = analyzeFootTraffic({ lat, lng }, input.trafficCount);
  }

  // Equipment Analysis (Enterprise+)
  let equipmentAnalysis = null;
  if (tier.includes.pricingOptimizer && input.washers && input.dryers && input.monthlyRevenue) {
    equipmentAnalysis = analyzeEquipmentCapacity(
      input.washers,
      input.dryers,
      input.monthlyRevenue,
      footTraffic || { hourlyPattern: [], dailyPattern: [], peakHours: [], slowHours: [], estimatedDailyVisitors: 0, estimatedMonthlyCustomers: 0, conversionRate: 0 }
    );
  }

  // Dave Menz Review (Enterprise+)
  let daveMenzReview = null;
  if (tier.includes.daveMenzReview) {
    const daveMenzPrompt = `You are ${EXPERT_PERSONAS.daveMenz.name}, founder of Laundromat123.com with 30+ years of experience.

YOUR EXPERTISE:
- Consulted on 500+ laundromat acquisitions
- Former multi-store owner and operator
- Known for practical, no-nonsense advice

YOUR KNOWLEDGE BASE:
RED FLAGS TO WATCH FOR:
${DAVE_MENZ_PERSONA.knowledgeBase.redFlags.map(f => `- ${f}`).join('\n')}

GREEN FLAGS (GOOD SIGNS):
${DAVE_MENZ_PERSONA.knowledgeBase.greenFlags.map(f => `- ${f}`).join('\n')}

VALUATION RULES:
${DAVE_MENZ_PERSONA.knowledgeBase.valuationRules.map(r => `- ${r}`).join('\n')}

NEGOTIATION TIPS:
${DAVE_MENZ_PERSONA.knowledgeBase.negotiationTips.map(t => `- ${t}`).join('\n')}

OPERATIONAL BEST PRACTICES:
${DAVE_MENZ_PERSONA.knowledgeBase.operationalBestPractices.map(p => `- ${p}`).join('\n')}

DEAL UNDER REVIEW:
Address: ${input.address}
Asking Price: $${input.askingPrice?.toLocaleString() || 'Unknown'}
Monthly Revenue: $${input.monthlyRevenue?.toLocaleString() || 'Unknown'}
Equipment: ${input.washers || '?'} washers, ${input.dryers || '?'} dryers (${input.equipmentAge || '?'} years old)
Competitors: ${input.competitors || '?'} within 1 mile
Additional Context: ${input.additionalContext || 'None provided'}

Based on your 30+ years of experience, provide:
1. DAVE'S VERDICT (1-2 sentences - would you pursue this deal?)
2. RED FLAGS I SEE (list any concerns)
3. GREEN FLAGS I SEE (list any positives)
4. MY TOP NEGOTIATION TIPS for this specific deal
5. DUE DILIGENCE CHECKLIST (3-5 items the buyer MUST verify)
6. CONFIDENCE LEVEL (percentage)

Be direct and practical - this is a real investment decision.`;

    const daveMenzResult = await askCouncil({ prompt: daveMenzPrompt, taskType: "analysis" });
    daveMenzReview = {
      expert: EXPERT_PERSONAS.daveMenz,
      analysis: daveMenzResult.result,
      cost: daveMenzResult.cost
    };
    baseResult.totalCost += daveMenzResult.cost;
  }

  // Revenue projection with optimized pricing (Enterprise+)
  let revenueProjection = null;
  if (pricingStrategy && footTraffic && input.monthlyRevenue) {
    revenueProjection = projectOptimizedRevenue(input.monthlyRevenue, pricingStrategy, footTraffic);
  }

  return {
    ...baseResult,
    tier,
    competitionHeatmap,
    pricingStrategy,
    footTraffic,
    equipmentAnalysis,
    daveMenzReview,
    revenueProjection
  };
}

export { EXPERT_PERSONAS, CONSULTATION_TIERS, DAVE_MENZ_PERSONA };
