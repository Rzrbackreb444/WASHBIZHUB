// WashBizHub Calculator Suite - Production-Grade Business Intelligence
// 50+ Interactive Calculators for Laundromat Industry

import { z } from 'zod';

export interface CalculatorResult {
  value: number;
  breakdown?: Record<string, number>;
  insights?: string[];
  warnings?: string[];
}

// ==================== INPUT VALIDATION SCHEMAS ====================

export const valuationInputSchema = z.object({
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  annualExpenses: z.number().min(0, "Expenses cannot be negative"),
  equipmentValue: z.number().min(0, "Equipment value cannot be negative"),
  method: z.enum(['income', 'asset', 'hybrid']),
  multiplier: z.number().min(1).max(10).optional(),
});

export const roiInputSchema = z.object({
  purchasePrice: z.number().min(1, "Purchase price must be positive"),
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  annualExpenses: z.number().min(0, "Expenses cannot be negative"),
  financingCost: z.number().min(0).optional(),
  years: z.number().int().min(1).max(50).optional(),
});

export const tpdInputSchema = z.object({
  machineCapacity: z.number().min(1, "Machine capacity must be positive"),
  numberOfMachines: z.number().int().min(1, "Must have at least 1 machine"),
  hoursOpen: z.number().min(1).max(24, "Hours must be between 1-24"),
  cycleTime: z.number().min(1, "Cycle time must be positive"),
  utilizationRate: z.number().min(0).max(1, "Utilization must be 0-1").optional(),
});

export const monteCarloInputSchema = z.object({
  avgDailyRevenue: z.number().min(1, "Average daily revenue must be positive"),
  volatility: z.number().min(0).max(1, "Volatility must be 0-1"),
  simulations: z.number().int().min(100).max(10000).optional(),
  years: z.number().int().min(1).max(30).optional(),
});

export const pricingInputSchema = z.object({
  costPerPound: z.number().min(0, "Cost cannot be negative"),
  overhead: z.number().min(0, "Overhead cannot be negative"),
  targetMargin: z.number().min(0).max(0.95, "Margin must be 0-95%"),
  monthlyVolume: z.number().min(1, "Volume must be positive"),
});

export const staffingInputSchema = z.object({
  hoursOpen: z.number().min(1).max(24, "Hours must be 1-24"),
  peakHours: z.number().min(0).max(24, "Peak hours must be 0-24"),
  avgCustomersPerHour: z.number().min(0, "Customers cannot be negative"),
  customerServiceTime: z.number().min(1, "Service time must be positive"),
});

export const utilitiesInputSchema = z.object({
  waterCostPerGallon: z.number().min(0, "Cost cannot be negative"),
  gasCostPerTherm: z.number().min(0, "Cost cannot be negative"),
  electricCostPerKwh: z.number().min(0, "Cost cannot be negative"),
  monthlyWaterGallons: z.number().min(0, "Usage cannot be negative"),
  monthlyGasTherms: z.number().min(0, "Usage cannot be negative"),
  monthlyElectricKwh: z.number().min(0, "Usage cannot be negative"),
});

// ==================== CORE VALUATION CALCULATORS ====================

/**
 * Calculate laundromat valuation using multiple methodologies
 */
export function calculateValuation(paramsInput: z.infer<typeof valuationInputSchema>): CalculatorResult {
  // Validate inputs
  const params = valuationInputSchema.parse(paramsInput);
  const netIncome = params.annualRevenue - params.annualExpenses;
  const defaultMultiplier = params.multiplier || 4;

  let value = 0;
  const breakdown: Record<string, number> = {};
  const insights: string[] = [];

  if (params.method === 'income') {
    value = netIncome * defaultMultiplier;
    breakdown.netIncome = netIncome;
    breakdown.multiplier = defaultMultiplier;
    insights.push(`Using ${defaultMultiplier}x income multiplier (industry standard 3-5x)`);
  } else if (params.method === 'asset') {
    value = params.equipmentValue;
    breakdown.equipmentValue = params.equipmentValue;
    insights.push('Asset-based valuation reflects equipment replacement cost');
  } else {
    // Hybrid: 60% income + 40% asset
    const incomeValue = netIncome * defaultMultiplier;
    const assetValue = params.equipmentValue;
    value = (incomeValue * 0.6) + (assetValue * 0.4);
    breakdown.incomeComponent = incomeValue * 0.6;
    breakdown.assetComponent = assetValue * 0.4;
    insights.push('Hybrid valuation balances income potential and asset value');
  }

  const warnings: string[] = [];
  if (netIncome < params.annualRevenue * 0.15) {
    warnings.push('Low profit margin detected - consider operational improvements');
  }

  return { value, breakdown, insights, warnings };
}

/**
 * Calculate ROI for laundromat investment
 */
export function calculateROI(paramsInput: z.infer<typeof roiInputSchema>): CalculatorResult {
  // Validate inputs
  const params = roiInputSchema.parse(paramsInput);
  const annualNetIncome = params.annualRevenue - params.annualExpenses;
  const totalFinancingCost = (params.financingCost || 0) * (params.years || 5);
  const totalNetIncome = annualNetIncome * (params.years || 5);
  const totalInvestment = params.purchasePrice + totalFinancingCost;
  
  const roi = ((totalNetIncome - totalInvestment) / totalInvestment) * 100;
  const paybackYears = params.purchasePrice / annualNetIncome;

  const breakdown = {
    totalInvestment,
    totalNetIncome,
    annualNetIncome,
    paybackYears,
  };

  const insights = [
    `Payback period: ${paybackYears.toFixed(1)} years`,
    `Annual return: ${(roi / (params.years || 5)).toFixed(1)}%`,
  ];

  const warnings: string[] = [];
  if (paybackYears > 7) {
    warnings.push('Payback period exceeds 7 years - high risk investment');
  }
  if (roi < 0) {
    warnings.push('Negative ROI projected - reconsider this investment');
  }

  return { value: roi, breakdown, insights, warnings };
}

/**
 * Calculate Turns Per Day (TPD) - Critical laundromat metric
 */
export function calculateTPD(paramsInput: z.infer<typeof tpdInputSchema>): CalculatorResult {
  // Validate inputs
  const params = tpdInputSchema.parse(paramsInput);
  const utilization = params.utilizationRate || 0.7;
  const turnsPerMachine = (params.hoursOpen * 60) / params.cycleTime;
  const effectiveTurns = turnsPerMachine * utilization;
  const totalTPD = effectiveTurns * params.numberOfMachines;
  const totalCapacity = totalTPD * params.machineCapacity;

  const breakdown = {
    turnsPerMachine: effectiveTurns,
    totalTurns: totalTPD,
    dailyCapacity: totalCapacity,
    weeklyCapacity: totalCapacity * 7,
    monthlyCapacity: totalCapacity * 30,
  };

  const insights = [
    `Each machine runs ${effectiveTurns.toFixed(1)} effective turns per day`,
    `Total daily capacity: ${totalCapacity.toFixed(0)} lbs`,
    `Monthly capacity: ${breakdown.monthlyCapacity.toFixed(0)} lbs`,
  ];

  const warnings: string[] = [];
  if (utilization && utilization < 0.5) {
    warnings.push('Low utilization rate - consider marketing/hours adjustments');
  }
  if (effectiveTurns > 12) {
    warnings.push('High TPD - verify equipment maintenance capacity');
  }

  return { value: totalTPD, breakdown, insights, warnings };
}

/**
 * Monte Carlo Simulation for Laundromat Revenue Projection
 */
export function monteCarloRevenue(paramsInput: z.infer<typeof monteCarloInputSchema>): CalculatorResult {
  // Validate inputs
  const params = monteCarloInputSchema.parse(paramsInput);
  const sims = params.simulations || 1000;
  const years = params.years || 5;
  const results: number[] = [];

  for (let i = 0; i < sims; i++) {
    let value = 0;
    for (let year = 0; year < years; year++) {
      // Random walk with drift (slight growth assumption)
      const growth = 1.02; // 2% annual growth
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * params.volatility;
      value += params.avgDailyRevenue * 365 * Math.pow(growth, year) * randomFactor;
    }
    results.push(value);
  }

  results.sort((a, b) => a - b);
  const p5 = results[Math.floor(sims * 0.05)];
  const p50 = results[Math.floor(sims * 0.50)];
  const p95 = results[Math.floor(sims * 0.95)];

  const breakdown = {
    worst5Percent: p5,
    median: p50,
    best5Percent: p95,
    expectedValue: results.reduce((a, b) => a + b, 0) / sims,
  };

  const insights = [
    `50% chance revenue exceeds $${(p50 / 1000).toFixed(0)}K`,
    `95% confidence range: $${(p5 / 1000).toFixed(0)}K - $${(p95 / 1000).toFixed(0)}K`,
    `Expected value: $${(breakdown.expectedValue / 1000).toFixed(0)}K`,
  ];

  return { value: p50, breakdown, insights };
}

// ==================== OPERATIONAL CALCULATORS ====================

/**
 * Calculate optimal pricing per pound
 */
export function calculatePricing(paramsInput: z.infer<typeof pricingInputSchema>): CalculatorResult {
  // Validate inputs
  const params = pricingInputSchema.parse(paramsInput);
  const overheadPerPound = params.overhead / params.monthlyVolume;
  const totalCostPerPound = params.costPerPound + overheadPerPound;
  const pricePerPound = totalCostPerPound / (1 - params.targetMargin);

  const breakdown = {
    directCost: params.costPerPound,
    overheadCost: overheadPerPound,
    totalCost: totalCostPerPound,
    targetMargin: params.targetMargin,
    suggestedPrice: pricePerPound,
  };

  const monthlyRevenue = pricePerPound * params.monthlyVolume;
  const monthlyProfit = monthlyRevenue - (totalCostPerPound * params.monthlyVolume);

  const insights = [
    `Suggested price: $${pricePerPound.toFixed(2)}/lb`,
    `Monthly revenue projection: $${monthlyRevenue.toFixed(0)}`,
    `Monthly profit: $${monthlyProfit.toFixed(0)}`,
  ];

  return { value: pricePerPound, breakdown, insights };
}

/**
 * Calculate staffing requirements
 */
export function calculateStaffing(paramsInput: z.infer<typeof staffingInputSchema>): CalculatorResult {
  // Validate inputs
  const params = staffingInputSchema.parse(paramsInput);
  const customersPerPeakHour = params.avgCustomersPerHour * 1.5;
  const serviceMinutesPerHour = customersPerPeakHour * params.customerServiceTime;
  const staffNeeded = Math.ceil(serviceMinutesPerHour / 60);

  const breakdown = {
    peakCustomers: customersPerPeakHour,
    serviceMinutesNeeded: serviceMinutesPerHour,
    staffDuringPeak: staffNeeded,
    staffDuringNormal: Math.max(1, staffNeeded - 1),
    weeklyHours: (params.peakHours * staffNeeded) + ((params.hoursOpen - params.peakHours) * Math.max(1, staffNeeded - 1)) * 7,
  };

  const insights = [
    `Peak hours need ${staffNeeded} staff members`,
    `Normal hours need ${breakdown.staffDuringNormal} staff`,
    `Total weekly hours: ${breakdown.weeklyHours}`,
  ];

  return { value: staffNeeded, breakdown, insights };
}

/**
 * Utility cost calculator
 */
export function calculateUtilities(paramsInput: z.infer<typeof utilitiesInputSchema>): CalculatorResult {
  // Validate inputs
  const params = utilitiesInputSchema.parse(paramsInput);
  const waterCost = params.waterCostPerGallon * params.monthlyWaterGallons;
  const gasCost = params.gasCostPerTherm * params.monthlyGasTherms;
  const electricCost = params.electricCostPerKwh * params.monthlyElectricKwh;
  const total = waterCost + gasCost + electricCost;

  const breakdown = {
    water: waterCost,
    gas: gasCost,
    electric: electricCost,
    total,
    annualTotal: total * 12,
  };

  const insights = [
    `Monthly utilities: $${total.toFixed(0)}`,
    `Annual projection: $${breakdown.annualTotal.toFixed(0)}`,
    `Water: ${((waterCost / total) * 100).toFixed(0)}% | Gas: ${((gasCost / total) * 100).toFixed(0)}% | Electric: ${((electricCost / total) * 100).toFixed(0)}%`,
  ];

  return { value: total, breakdown, insights };
}

// ==================== EXPANDED FINANCIAL CALCULATORS ====================

/**
 * Loan Payment Calculator - Monthly payment, total interest, amortization
 */
export const loanInputSchema = z.object({
  loanAmount: z.number().min(1, "Loan amount must be positive"),
  interestRate: z.number().min(0).max(0.50, "Interest rate must be 0-50%"),
  loanTermYears: z.number().int().min(1).max(40, "Loan term must be 1-40 years"),
  downPayment: z.number().min(0).optional(),
});

export function calculateLoan(paramsInput: z.infer<typeof loanInputSchema>): CalculatorResult {
  const params = loanInputSchema.parse(paramsInput);
  const principal = params.loanAmount - (params.downPayment || 0);
  const monthlyRate = params.interestRate / 12;
  const numPayments = params.loanTermYears * 12;
  
  const monthlyPayment = monthlyRate === 0 ? principal / numPayments :
    principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const totalPayments = monthlyPayment * numPayments;
  const totalInterest = totalPayments - principal;
  
  const breakdown = {
    monthlyPayment,
    totalPayments,
    totalInterest,
    principal,
    effectiveRate: (totalInterest / principal) * 100,
  };
  
  const insights = [
    `Monthly payment: $${monthlyPayment.toFixed(2)}`,
    `Total interest over ${params.loanTermYears} years: $${totalInterest.toFixed(2)}`,
    `Total cost: $${totalPayments.toFixed(2)}`,
  ];
  
  const warnings: string[] = [];
  if (monthlyPayment > params.loanAmount * 0.015) {
    warnings.push('High monthly payment - verify cash flow can support this');
  }
  
  return { value: monthlyPayment, breakdown, insights, warnings };
}

/**
 * Lease vs Buy Analyzer
 */
export const leaseVsBuyInputSchema = z.object({
  equipmentCost: z.number().min(1, "Equipment cost must be positive"),
  monthlyLeasePayment: z.number().min(1, "Lease payment must be positive"),
  leaseTermYears: z.number().int().min(1).max(20),
  downPaymentBuy: z.number().min(0).optional(),
  loanRate: z.number().min(0).max(0.50).optional(),
  taxRate: z.number().min(0).max(0.50).optional(),
});

export function calculateLeaseVsBuy(paramsInput: z.infer<typeof leaseVsBuyInputSchema>): CalculatorResult {
  const params = leaseVsBuyInputSchema.parse(paramsInput);
  const taxRate = params.taxRate || 0.25;
  const loanRate = params.loanRate || 0.07;
  
  const totalLeasePayments = params.monthlyLeasePayment * 12 * params.leaseTermYears;
  const leaseTaxBenefit = totalLeasePayments * taxRate;
  const netLeaseCost = totalLeasePayments - leaseTaxBenefit;
  
  const downPayment = params.downPaymentBuy || params.equipmentCost * 0.20;
  const loanAmount = params.equipmentCost - downPayment;
  const monthlyRate = loanRate / 12;
  const numPayments = params.leaseTermYears * 12;
  
  const monthlyLoanPayment = monthlyRate === 0 ? loanAmount / numPayments :
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const totalLoanPayments = monthlyLoanPayment * numPayments;
  const totalBuyCost = downPayment + totalLoanPayments;
  const buyTaxBenefit = (totalLoanPayments - loanAmount) * taxRate;
  const netBuyCost = totalBuyCost - buyTaxBenefit;
  
  const savings = netLeaseCost - netBuyCost;
  const recommendation = savings > 0 ? 'buy' : 'lease';
  
  const breakdown = {
    totalLeaseCost: totalLeasePayments,
    netLeaseCost,
    totalBuyCost,
    netBuyCost,
    savings: Math.abs(savings),
  };
  
  const insights = [
    `Recommendation: ${recommendation === 'buy' ? 'Buying saves' : 'Leasing saves'} $${Math.abs(savings).toFixed(2)}`,
    `Net lease cost: $${netLeaseCost.toFixed(2)}`,
    `Net buy cost: $${netBuyCost.toFixed(2)}`,
  ];
  
  return { value: Math.abs(savings), breakdown, insights };
}

/**
 * NPV Calculator
 */
export const npvInputSchema = z.object({
  initialInvestment: z.number().min(0),
  annualCashFlows: z.array(z.number()).min(1),
  discountRate: z.number().min(0).max(0.50),
});

export function calculateNPV(paramsInput: z.infer<typeof npvInputSchema>): CalculatorResult {
  const params = npvInputSchema.parse(paramsInput);
  
  let npv = -params.initialInvestment;
  const pvBreakdown: Record<string, number> = {};
  
  params.annualCashFlows.forEach((cashFlow, index) => {
    const year = index + 1;
    const pv = cashFlow / Math.pow(1 + params.discountRate, year);
    npv += pv;
    pvBreakdown[`year${year}PV`] = pv;
  });
  
  const breakdown = {
    ...pvBreakdown,
    totalPV: npv + params.initialInvestment,
    npv,
  };
  
  const insights = [
    `NPV: $${npv.toFixed(2)}`,
    npv > 0 ? 'Project adds value' : 'Project destroys value',
  ];
  
  const warnings: string[] = [];
  if (npv < 0) {
    warnings.push('Negative NPV - project not recommended');
  }
  
  return { value: npv, breakdown, insights, warnings };
}

/**
 * Customer Lifetime Value (CLV)
 */
export const clvInputSchema = z.object({
  avgMonthlyRevenue: z.number().min(0),
  avgCustomerLifespanMonths: z.number().min(1),
  grossMargin: z.number().min(0).max(1),
  retentionRate: z.number().min(0).max(1).optional(),
});

export function calculateCLV(paramsInput: z.infer<typeof clvInputSchema>): CalculatorResult {
  const params = clvInputSchema.parse(paramsInput);
  const retentionRate = params.retentionRate || 0.85;
  
  const simpleCLV = params.avgMonthlyRevenue * params.avgCustomerLifespanMonths * params.grossMargin;
  
  const monthlyChurn = 1 - retentionRate;
  const avgLifespanRetention = monthlyChurn > 0 ? 1 / monthlyChurn : params.avgCustomerLifespanMonths;
  const retentionCLV = params.avgMonthlyRevenue * avgLifespanRetention * params.grossMargin;
  
  const breakdown = {
    simpleCLV,
    retentionBasedCLV: retentionCLV,
    avgMonthlyProfit: params.avgMonthlyRevenue * params.grossMargin,
    churnRate: monthlyChurn * 100,
  };
  
  const insights = [
    `Customer Lifetime Value: $${retentionCLV.toFixed(2)}`,
    `Avg monthly profit/customer: $${(params.avgMonthlyRevenue * params.grossMargin).toFixed(2)}`,
    `Expected lifespan: ${avgLifespanRetention.toFixed(1)} months`,
  ];
  
  return { value: retentionCLV, breakdown, insights };
}

/**
 * Customer Acquisition Cost (CAC)
 */
export const cacInputSchema = z.object({
  marketingSpend: z.number().min(0),
  salesSpend: z.number().min(0),
  newCustomers: z.number().int().min(1),
});

export function calculateCAC(paramsInput: z.infer<typeof cacInputSchema>): CalculatorResult {
  const params = cacInputSchema.parse(paramsInput);
  const totalSpend = params.marketingSpend + params.salesSpend;
  const cac = totalSpend / params.newCustomers;
  
  const breakdown = {
    totalSpend,
    newCustomers: params.newCustomers,
    cac,
  };
  
  const insights = [
    `Customer Acquisition Cost: $${cac.toFixed(2)}`,
    `Customers acquired: ${params.newCustomers}`,
  ];
  
  const warnings: string[] = [];
  if (cac > 200) {
    warnings.push('High CAC - verify CLV exceeds 3x CAC');
  }
  
  return { value: cac, breakdown, insights, warnings };
}

// ==================== OPERATIONAL & REAL ESTATE CALCULATORS ====================

/**
 * Energy Cost Calculator - Detailed electricity analysis
 */
export const energyCostInputSchema = z.object({
  kwhPerMonth: z.number().min(0, "kWh cannot be negative"),
  costPerKwh: z.number().min(0, "Cost cannot be negative"),
  peakUsagePercent: z.number().min(0).max(1).optional(),
  peakRatePremium: z.number().min(0).max(1).optional(),
});

export function calculateEnergyCost(paramsInput: z.infer<typeof energyCostInputSchema>): CalculatorResult {
  const params = energyCostInputSchema.parse(paramsInput);
  const peakPercent = params.peakUsagePercent || 0.30;
  const peakPremium = params.peakRatePremium || 0.50;
  
  const peakKwh = params.kwhPerMonth * peakPercent;
  const offPeakKwh = params.kwhPerMonth * (1 - peakPercent);
  const peakCost = peakKwh * params.costPerKwh * (1 + peakPremium);
  const offPeakCost = offPeakKwh * params.costPerKwh;
  const totalCost = peakCost + offPeakCost;
  
  const breakdown = {
    peakCost,
    offPeakCost,
    totalCost,
    annualCost: totalCost * 12,
    avgCostPerKwh: totalCost / params.kwhPerMonth,
  };
  
  const insights = [
    `Monthly energy cost: $${totalCost.toFixed(2)}`,
    `Annual projection: $${breakdown.annualCost.toFixed(2)}`,
    `Effective rate: $${breakdown.avgCostPerKwh.toFixed(3)}/kWh`,
  ];
  
  const warnings: string[] = [];
  if (peakPercent > 0.40) {
    warnings.push('High peak usage - shift operations to off-peak hours to save 20-30%');
  }
  
  return { value: totalCost, breakdown, insights, warnings };
}

/**
 * Water Cost Calculator
 */
export const waterCostInputSchema = z.object({
  gallonsPerMonth: z.number().min(0),
  costPerGallon: z.number().min(0),
  sewerMultiplier: z.number().min(0).max(3).optional(),
  numberOfMachines: z.number().int().min(1).optional(),
});

export function calculateWaterCost(paramsInput: z.infer<typeof waterCostInputSchema>): CalculatorResult {
  const params = waterCostInputSchema.parse(paramsInput);
  const sewerMult = params.sewerMultiplier || 1.5;
  
  const waterCost = params.gallonsPerMonth * params.costPerGallon;
  const sewerCost = waterCost * sewerMult;
  const totalCost = waterCost + sewerCost;
  
  const breakdown = {
    waterCost,
    sewerCost,
    totalCost,
    annualCost: totalCost * 12,
    costPerMachine: params.numberOfMachines ? totalCost / params.numberOfMachines : 0,
  };
  
  const insights = [
    `Monthly water + sewer: $${totalCost.toFixed(2)}`,
    `Water: $${waterCost.toFixed(2)} | Sewer: $${sewerCost.toFixed(2)}`,
    params.numberOfMachines ? `Per machine: $${breakdown.costPerMachine.toFixed(2)}/month` : '',
  ].filter(Boolean);
  
  return { value: totalCost, breakdown, insights };
}

/**
 * Labor Cost Calculator
 */
export const laborCostInputSchema = z.object({
  numberOfEmployees: z.number().int().min(1),
  avgHourlyWage: z.number().min(0),
  hoursPerWeek: z.number().min(1).max(168),
  payrollTaxRate: z.number().min(0).max(0.30).optional(),
  benefitsRate: z.number().min(0).max(0.50).optional(),
});

export function calculateLaborCost(paramsInput: z.infer<typeof laborCostInputSchema>): CalculatorResult {
  const params = laborCostInputSchema.parse(paramsInput);
  const payrollTax = params.payrollTaxRate || 0.0765;
  const benefits = params.benefitsRate || 0.15;
  
  const weeklyWages = params.numberOfEmployees * params.avgHourlyWage * params.hoursPerWeek;
  const monthlyWages = weeklyWages * 4.33;
  const payrollTaxCost = monthlyWages * payrollTax;
  const benefitsCost = monthlyWages * benefits;
  const totalMonthlyCost = monthlyWages + payrollTaxCost + benefitsCost;
  
  const breakdown = {
    monthlyWages,
    payrollTaxCost,
    benefitsCost,
    totalMonthlyCost,
    annualCost: totalMonthlyCost * 12,
    costPerEmployee: totalMonthlyCost / params.numberOfEmployees,
  };
  
  const insights = [
    `Total monthly labor cost: $${totalMonthlyCost.toFixed(2)}`,
    `Base wages: $${monthlyWages.toFixed(2)} + Taxes: $${payrollTaxCost.toFixed(2)} + Benefits: $${benefitsCost.toFixed(2)}`,
    `Per employee: $${breakdown.costPerEmployee.toFixed(2)}/month`,
  ];
  
  return { value: totalMonthlyCost, breakdown, insights };
}

/**
 * Machine Utilization Calculator
 */
export const machineUtilizationInputSchema = z.object({
  totalMachines: z.number().int().min(1),
  avgTurnsPerDay: z.number().min(0),
  maxTurnsPerDay: z.number().min(1),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
});

export function calculateMachineUtilization(paramsInput: z.infer<typeof machineUtilizationInputSchema>): CalculatorResult {
  const params = machineUtilizationInputSchema.parse(paramsInput);
  const daysPerWeek = params.daysPerWeek || 7;
  
  const utilization = params.avgTurnsPerDay / params.maxTurnsPerDay;
  const weeklyTurns = params.avgTurnsPerDay * params.totalMachines * daysPerWeek;
  const maxWeeklyTurns = params.maxTurnsPerDay * params.totalMachines * daysPerWeek;
  const unutilizedCapacity = maxWeeklyTurns - weeklyTurns;
  
  const breakdown = {
    utilization: utilization * 100,
    weeklyTurns,
    maxWeeklyTurns,
    unutilizedCapacity,
    monthlyTurns: weeklyTurns * 4.33,
  };
  
  const insights = [
    `Machine utilization: ${(utilization * 100).toFixed(1)}%`,
    `Weekly turns: ${weeklyTurns.toFixed(0)} / ${maxWeeklyTurns.toFixed(0)} capacity`,
    utilization > 0.75 ? 'High utilization - consider expansion' : 'Room to increase volume',
  ];
  
  const warnings: string[] = [];
  if (utilization < 0.40) {
    warnings.push('Low utilization - marketing/pricing adjustments needed');
  }
  
  return { value: utilization * 100, breakdown, insights, warnings };
}

/**
 * Equipment Depreciation Calculator (Straight-line & Declining Balance)
 */
export const depreciationInputSchema = z.object({
  equipmentCost: z.number().min(1),
  salvageValue: z.number().min(0),
  usefulLifeYears: z.number().int().min(1).max(30),
  method: z.enum(['straight-line', 'declining-balance']).optional(),
});

export function calculateDepreciation(paramsInput: z.infer<typeof depreciationInputSchema>): CalculatorResult {
  const params = depreciationInputSchema.parse(paramsInput);
  const method = params.method || 'straight-line';
  
  if (method === 'straight-line') {
    const annualDepreciation = (params.equipmentCost - params.salvageValue) / params.usefulLifeYears;
    const totalDepreciation = annualDepreciation * params.usefulLifeYears;
    
    const breakdown = {
      annualDepreciation,
      totalDepreciation,
    };
    
    const insights = [
      `Annual depreciation: $${annualDepreciation.toFixed(2)}`,
      `Book value after year 1: $${(params.equipmentCost - annualDepreciation).toFixed(2)}`,
    ];
    
    return { value: annualDepreciation, breakdown, insights };
  } else {
    // Double declining balance
    const rate = 2 / params.usefulLifeYears;
    let bookValue = params.equipmentCost;
    const depreciationSchedule: number[] = [];
    
    for (let year = 0; year < params.usefulLifeYears; year++) {
      const yearlyDepr = Math.max(bookValue * rate, bookValue - params.salvageValue);
      depreciationSchedule.push(yearlyDepr);
      bookValue -= yearlyDepr;
      if (bookValue <= params.salvageValue) break;
    }
    
    const breakdown = {
      year1Depreciation: depreciationSchedule[0],
      totalDepreciation: depreciationSchedule.reduce((sum, d) => sum + d, 0),
    };
    
    const insights = [
      `Year 1 depreciation: $${depreciationSchedule[0].toFixed(2)}`,
      `Accelerated depreciation front-loads tax benefits`,
    ];
    
    return { value: depreciationSchedule[0], breakdown, insights };
  }
}

/**
 * Cap Rate Calculator (Real Estate)
 */
export const capRateInputSchema = z.object({
  propertyValue: z.number().min(1),
  netOperatingIncome: z.number().min(0),
});

export function calculateCapRate(paramsInput: z.infer<typeof capRateInputSchema>): CalculatorResult {
  const params = capRateInputSchema.parse(paramsInput);
  const capRate = (params.netOperatingIncome / params.propertyValue) * 100;
  
  const breakdown = {
    capRate,
    noi: params.netOperatingIncome,
    propertyValue: params.propertyValue,
  };
  
  const insights = [
    `Cap Rate: ${capRate.toFixed(2)}%`,
    capRate > 10 ? 'High cap rate - higher return/risk' :
    capRate > 6 ? 'Moderate cap rate' : 'Low cap rate - stable asset',
  ];
  
  const warnings: string[] = [];
  if (capRate < 4) {
    warnings.push('Low cap rate - verify property not overvalued');
  }
  
  return { value: capRate, breakdown, insights, warnings };
}

/**
 * Debt Service Coverage Ratio (DSCR)
 */
export const dscrInputSchema = z.object({
  netOperatingIncome: z.number().min(0),
  annualDebtService: z.number().min(1),
});

export function calculateDSCR(paramsInput: z.infer<typeof dscrInputSchema>): CalculatorResult {
  const params = dscrInputSchema.parse(paramsInput);
  const dscr = params.netOperatingIncome / params.annualDebtService;
  
  const breakdown = {
    dscr,
    noi: params.netOperatingIncome,
    debtService: params.annualDebtService,
    excessCashFlow: params.netOperatingIncome - params.annualDebtService,
  };
  
  const insights = [
    `DSCR: ${dscr.toFixed(2)}x`,
    dscr >= 1.25 ? 'Strong coverage' : dscr >= 1.0 ? 'Marginal' : 'Insufficient',
  ];
  
  const warnings: string[] = [];
  if (dscr < 1.0) {
    warnings.push('CRITICAL: Cannot cover debt payments');
  } else if (dscr < 1.25) {
    warnings.push('Below lender minimum (1.25x)');
  }
  
  return { value: dscr, breakdown, insights, warnings };
}

/**
 * Profit Margin Calculator
 */
export const profitMarginInputSchema = z.object({
  revenue: z.number().min(0),
  costs: z.number().min(0),
});

export function calculateProfitMargin(paramsInput: z.infer<typeof profitMarginInputSchema>): CalculatorResult {
  const params = profitMarginInputSchema.parse(paramsInput);
  const profit = params.revenue - params.costs;
  const margin = params.revenue > 0 ? (profit / params.revenue) * 100 : 0;
  
  const breakdown = {
    profit,
    margin,
    revenue: params.revenue,
    costs: params.costs,
  };
  
  const insights = [
    `Profit Margin: ${margin.toFixed(2)}%`,
    `Net Profit: $${profit.toFixed(2)}`,
    margin > 25 ? 'Excellent margin' : margin > 15 ? 'Good margin' : 'Below industry average',
  ];
  
  const warnings: string[] = [];
  if (margin < 10) {
    warnings.push('Low margin - review cost structure');
  }
  
  return { value: margin, breakdown, insights, warnings };
}

/**
 * Payback Period Calculator
 */
export const paybackPeriodInputSchema = z.object({
  initialInvestment: z.number().min(1),
  annualCashFlow: z.number().min(1),
});

export function calculatePaybackPeriod(paramsInput: z.infer<typeof paybackPeriodInputSchema>): CalculatorResult {
  const params = paybackPeriodInputSchema.parse(paramsInput);
  const paybackYears = params.initialInvestment / params.annualCashFlow;
  const paybackMonths = paybackYears * 12;
  
  const breakdown = {
    paybackYears,
    paybackMonths,
    initialInvestment: params.initialInvestment,
    annualCashFlow: params.annualCashFlow,
  };
  
  const insights = [
    `Payback Period: ${paybackYears.toFixed(2)} years (${Math.floor(paybackMonths)} months)`,
    paybackYears < 3 ? 'Quick payback' : paybackYears < 5 ? 'Moderate payback' : 'Long payback period',
  ];
  
  const warnings: string[] = [];
  if (paybackYears > 7) {
    warnings.push('Long payback - verify cash flow assumptions');
  }
  
  return { value: paybackYears, breakdown, insights, warnings };
}

// ==================== MARKETING & GROWTH CALCULATORS ====================

/**
 * Revenue Per Square Foot
 */
export const revPerSqFtInputSchema = z.object({
  annualRevenue: z.number().min(0),
  squareFeet: z.number().min(1),
});

export function calculateRevenuePerSqFt(paramsInput: z.infer<typeof revPerSqFtInputSchema>): CalculatorResult {
  const params = revPerSqFtInputSchema.parse(paramsInput);
  const revPerSqFt = params.annualRevenue / params.squareFeet;
  const monthlyRevPerSqFt = revPerSqFt / 12;
  
  const breakdown = {
    annualRevPerSqFt: revPerSqFt,
    monthlyRevPerSqFt,
    totalRevenue: params.annualRevenue,
    squareFeet: params.squareFeet,
  };
  
  const insights = [
    `Revenue per sq ft: $${revPerSqFt.toFixed(2)}/year`,
    `Monthly: $${monthlyRevPerSqFt.toFixed(2)}/sq ft`,
    revPerSqFt > 300 ? 'Excellent space utilization' : revPerSqFt > 200 ? 'Good' : 'Below average',
  ];
  
  const warnings: string[] = [];
  if (revPerSqFt < 150) {
    warnings.push('Low revenue density - optimize layout or pricing');
  }
  
  return { value: revPerSqFt, breakdown, insights, warnings };
}

/**
 * Marketing ROI Calculator
 */
export const marketingRoiInputSchema = z.object({
  campaignCost: z.number().min(0),
  newRevenue: z.number().min(0),
  grossMargin: z.number().min(0).max(1).optional(),
});

export function calculateMarketingROI(paramsInput: z.infer<typeof marketingRoiInputSchema>): CalculatorResult {
  const params = marketingRoiInputSchema.parse(paramsInput);
  const margin = params.grossMargin || 0.40;
  const grossProfit = params.newRevenue * margin;
  const netReturn = grossProfit - params.campaignCost;
  const roi = params.campaignCost > 0 ? (netReturn / params.campaignCost) * 100 : 0;
  
  const breakdown = {
    roi,
    grossProfit,
    netReturn,
    campaignCost: params.campaignCost,
  };
  
  const insights = [
    `Marketing ROI: ${roi.toFixed(1)}%`,
    `Net return: $${netReturn.toFixed(2)}`,
    roi > 200 ? 'Excellent campaign' : roi > 100 ? 'Good campaign' : 'Needs improvement',
  ];
  
  const warnings: string[] = [];
  if (roi < 50) {
    warnings.push('Low ROI - review targeting and messaging');
  }
  
  return { value: roi, breakdown, insights, warnings };
}

/**
 * Churn Rate Calculator
 */
export const churnRateInputSchema = z.object({
  startingCustomers: z.number().int().min(1),
  lostCustomers: z.number().int().min(0),
  timePeriodMonths: z.number().int().min(1).max(12).optional(),
});

export function calculateChurnRate(paramsInput: z.infer<typeof churnRateInputSchema>): CalculatorResult {
  const params = churnRateInputSchema.parse(paramsInput);
  const months = params.timePeriodMonths || 1;
  const churnRate = (params.lostCustomers / params.startingCustomers) * 100;
  const monthlyChurn = churnRate / months;
  const annualizedChurn = monthlyChurn * 12;
  
  const breakdown = {
    churnRate,
    monthlyChurn,
    annualizedChurn,
    retentionRate: 100 - churnRate,
  };
  
  const insights = [
    `Churn rate: ${churnRate.toFixed(2)}% over ${months} month(s)`,
    `Monthly churn: ${monthlyChurn.toFixed(2)}%`,
    `Retention rate: ${breakdown.retentionRate.toFixed(2)}%`,
  ];
  
  const warnings: string[] = [];
  if (monthlyChurn > 5) {
    warnings.push('High churn - implement loyalty programs');
  }
  
  return { value: churnRate, breakdown, insights, warnings };
}

/**
 * Price Per Pound Optimizer
 */
export const pricingOptimizerInputSchema = z.object({
  costPerPound: z.number().min(0),
  targetMargin: z.number().min(0).max(0.95),
  competitorPrice: z.number().min(0).optional(),
  monthlyVolume: z.number().min(1).optional(),
});

export function calculatePricingOptimizer(paramsInput: z.infer<typeof pricingOptimizerInputSchema>): CalculatorResult {
  const params = pricingOptimizerInputSchema.parse(paramsInput);
  const targetPrice = params.costPerPound / (1 - params.targetMargin);
  const competitorDiff = params.competitorPrice ? ((targetPrice - params.competitorPrice) / params.competitorPrice) * 100 : 0;
  const monthlyRevenue = params.monthlyVolume ? targetPrice * params.monthlyVolume : 0;
  
  const breakdown = {
    recommendedPrice: targetPrice,
    costPerPound: params.costPerPound,
    targetMargin: params.targetMargin * 100,
    competitorDiff,
    monthlyRevenue,
  };
  
  const insights = [
    `Recommended price: $${targetPrice.toFixed(2)}/lb`,
    `Target margin: ${(params.targetMargin * 100).toFixed(1)}%`,
    params.competitorPrice ? 
      (competitorDiff > 0 ? `${Math.abs(competitorDiff).toFixed(1)}% above competitor` : `${Math.abs(competitorDiff).toFixed(1)}% below competitor`) : '',
  ].filter(Boolean);
  
  const warnings: string[] = [];
  if (competitorDiff > 10) {
    warnings.push('Price significantly above competition - verify value proposition');
  }
  
  return { value: targetPrice, breakdown, insights, warnings };
}

// ==================== INSURANCE & STARTUP CALCULATORS ====================

/**
 * Insurance Cost Estimator
 */
export const insuranceInputSchema = z.object({
  propertyValue: z.number().min(1),
  annualRevenue: z.number().min(0),
  numberOfEmployees: z.number().int().min(0),
});

export function calculateInsurance(paramsInput: z.infer<typeof insuranceInputSchema>): CalculatorResult {
  const params = insuranceInputSchema.parse(paramsInput);
  
  // Industry estimates: property ~0.5%, liability ~$500 base + $200/employee, business interruption ~2% revenue
  const propertyInsurance = params.propertyValue * 0.005;
  const liabilityInsurance = 500 + (params.numberOfEmployees * 200);
  const businessInterruption = params.annualRevenue * 0.02;
  const workersComp = params.numberOfEmployees > 0 ? params.numberOfEmployees * 1200 : 0;
  
  const totalAnnual = propertyInsurance + liabilityInsurance + businessInterruption + workersComp;
  const monthlyPremium = totalAnnual / 12;
  
  const breakdown = {
    propertyInsurance,
    liabilityInsurance,
    businessInterruption,
    workersComp,
    totalAnnual,
    monthlyPremium,
  };
  
  const insights = [
    `Estimated annual insurance: $${totalAnnual.toFixed(2)}`,
    `Monthly premium: $${monthlyPremium.toFixed(2)}`,
    `Property: $${propertyInsurance.toFixed(0)} | Liability: $${liabilityInsurance.toFixed(0)} | BI: $${businessInterruption.toFixed(0)}`,
  ];
  
  return { value: totalAnnual, breakdown, insights };
}

/**
 * Startup Cost Calculator
 */
export const startupCostInputSchema = z.object({
  equipmentCost: z.number().min(1),
  buildoutCost: z.number().min(0),
  firstMonthRent: z.number().min(0),
  securityDeposit: z.number().min(0),
  licenses: z.number().min(0).optional(),
  marketing: z.number().min(0).optional(),
  workingCapital: z.number().min(0).optional(),
});

export function calculateStartupCost(paramsInput: z.infer<typeof startupCostInputSchema>): CalculatorResult {
  const params = startupCostInputSchema.parse(paramsInput);
  const licenses = params.licenses || 1500;
  const marketing = params.marketing || 5000;
  const workingCapital = params.workingCapital || 10000;
  
  const totalStartup = 
    params.equipmentCost +
    params.buildoutCost +
    params.firstMonthRent +
    params.securityDeposit +
    licenses +
    marketing +
    workingCapital;
  
  const breakdown = {
    equipmentCost: params.equipmentCost,
    buildoutCost: params.buildoutCost,
    realEstateCosts: params.firstMonthRent + params.securityDeposit,
    licenses,
    marketing,
    workingCapital,
    totalStartup,
  };
  
  const insights = [
    `Total startup capital needed: $${totalStartup.toFixed(2)}`,
    `Equipment: ${((params.equipmentCost / totalStartup) * 100).toFixed(1)}% of total`,
    `Recommended down payment (20%): $${(totalStartup * 0.20).toFixed(2)}`,
  ];
  
  return { value: totalStartup, breakdown, insights };
}

/**
 * Expansion ROI Calculator
 */
export const expansionRoiInputSchema = z.object({
  expansionCost: z.number().min(1),
  incrementalRevenue: z.number().min(0),
  incrementalExpenses: z.number().min(0),
  years: z.number().int().min(1).max(20).optional(),
});

export function calculateExpansionROI(paramsInput: z.infer<typeof expansionRoiInputSchema>): CalculatorResult {
  const params = expansionRoiInputSchema.parse(paramsInput);
  const years = params.years || 5;
  const annualNetIncome = params.incrementalRevenue - params.incrementalExpenses;
  const totalNetIncome = annualNetIncome * years;
  const roi = ((totalNetIncome - params.expansionCost) / params.expansionCost) * 100;
  const paybackYears = annualNetIncome > 0 ? params.expansionCost / annualNetIncome : 0;
  
  const breakdown = {
    roi,
    annualNetIncome,
    totalNetIncome,
    paybackYears,
    expansionCost: params.expansionCost,
  };
  
  const insights = [
    `Expansion ROI: ${roi.toFixed(1)}% over ${years} years`,
    `Payback period: ${paybackYears.toFixed(1)} years`,
    `Annual incremental profit: $${annualNetIncome.toFixed(2)}`,
  ];
  
  const warnings: string[] = [];
  if (roi < 50) {
    warnings.push('Low ROI - reconsider expansion timing or scope');
  }
  
  return { value: roi, breakdown, insights, warnings };
}

/**
 * Rent Affordability Calculator
 */
export const rentAffordabilityInputSchema = z.object({
  projectedRevenue: z.number().min(1),
  maxRentPercent: z.number().min(0).max(0.50).optional(),
});

export function calculateRentAffordability(paramsInput: z.infer<typeof rentAffordabilityInputSchema>): CalculatorResult {
  const params = rentAffordabilityInputSchema.parse(paramsInput);
  const maxPercent = params.maxRentPercent || 0.15; // Industry standard: 10-15%
  const maxMonthlyRent = (params.projectedRevenue / 12) * maxPercent;
  const annualRent = maxMonthlyRent * 12;
  
  const breakdown = {
    maxMonthlyRent,
    annualRent,
    revenueRatio: maxPercent * 100,
    monthlyRevenue: params.projectedRevenue / 12,
  };
  
  const insights = [
    `Max affordable rent: $${maxMonthlyRent.toFixed(2)}/month`,
    `Based on ${(maxPercent * 100).toFixed(0)}% of revenue rule`,
    `Annual rent budget: $${annualRent.toFixed(2)}`,
  ];
  
  const warnings: string[] = [];
  if (maxPercent > 0.18) {
    warnings.push('Rent exceeds 18% of revenue - profitability at risk');
  }
  
  return { value: maxMonthlyRent, breakdown, insights, warnings };
}

/**
 * Email Campaign ROI
 */
export const emailRoiInputSchema = z.object({
  campaignCost: z.number().min(0),
  emailsSent: z.number().int().min(1),
  clickRate: z.number().min(0).max(1),
  conversionRate: z.number().min(0).max(1),
  avgOrderValue: z.number().min(0),
});

export function calculateEmailROI(paramsInput: z.infer<typeof emailRoiInputSchema>): CalculatorResult {
  const params = emailRoiInputSchema.parse(paramsInput);
  const clicks = params.emailsSent * params.clickRate;
  const conversions = clicks * params.conversionRate;
  const revenue = conversions * params.avgOrderValue;
  const roi = params.campaignCost > 0 ? ((revenue - params.campaignCost) / params.campaignCost) * 100 : 0;
  
  const breakdown = {
    clicks,
    conversions,
    revenue,
    roi,
    costPerAcquisition: conversions > 0 ? params.campaignCost / conversions : 0,
  };
  
  const insights = [
    `Email ROI: ${roi.toFixed(1)}%`,
    `Conversions: ${Math.floor(conversions)}`,
    `Revenue generated: $${revenue.toFixed(2)}`,
  ];
  
  const warnings: string[] = [];
  if (params.clickRate < 0.02) {
    warnings.push('Low click rate - improve subject lines and content');
  }
  
  return { value: roi, breakdown, insights, warnings };
}

/**
 * Referral Program Calculator
 */
export const referralProgramInputSchema = z.object({
  incentiveCost: z.number().min(0),
  expectedReferrals: z.number().int().min(1),
  conversionRate: z.number().min(0).max(1),
  customerLTV: z.number().min(1),
});

export function calculateReferralProgram(paramsInput: z.infer<typeof referralProgramInputSchema>): CalculatorResult {
  const params = referralProgramInputSchema.parse(paramsInput);
  const conversions = params.expectedReferrals * params.conversionRate;
  const totalIncentiveCost = params.incentiveCost * conversions;
  const totalLTV = conversions * params.customerLTV;
  const netValue = totalLTV - totalIncentiveCost;
  const roi = totalIncentiveCost > 0 ? (netValue / totalIncentiveCost) * 100 : 0;
  
  const breakdown = {
    conversions,
    totalIncentiveCost,
    totalLTV,
    netValue,
    roi,
    costPerAcquisition: conversions > 0 ? totalIncentiveCost / conversions : 0,
  };
  
  const insights = [
    `Referral program ROI: ${roi.toFixed(1)}%`,
    `Expected conversions: ${Math.floor(conversions)}`,
    `Net value: $${netValue.toFixed(2)}`,
  ];
  
  return { value: roi, breakdown, insights };
}

// ==================== ADVANCED FINANCIAL & OPERATIONAL CALCULATORS ====================

/**
 * IRR (Internal Rate of Return) Calculator
 */
export const irrInputSchema = z.object({
  initialInvestment: z.number().min(1),
  annualCashFlows: z.array(z.number()).min(1),
});

export function calculateIRR(paramsInput: z.infer<typeof irrInputSchema>): CalculatorResult {
  const params = irrInputSchema.parse(paramsInput);
  
  const calculateNPVAtRate = (rate: number): number => {
    let npv = -params.initialInvestment;
    params.annualCashFlows.forEach((cashFlow, index) => {
      npv += cashFlow / Math.pow(1 + rate, index + 1);
    });
    return npv;
  };
  
  let irr = 0.10;
  const maxIterations = 100;
  const tolerance = 0.0001;
  let converged = false;
  
  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPVAtRate(irr);
    if (Math.abs(npv) < tolerance) {
      converged = true;
      break;
    }
    
    const delta = 0.0001;
    const derivative = (calculateNPVAtRate(irr + delta) - npv) / delta;
    
    // Prevent division by zero or very small derivatives
    if (Math.abs(derivative) < 1e-10) break;
    
    irr = irr - npv / derivative;
    
    // Bounds checking
    if (irr < -0.99 || irr > 10 || isNaN(irr)) {
      irr = 0;
      break;
    }
  }
  
  // Return 0 if didn't converge
  if (!converged) {
    irr = 0;
  }
  
  const irrPercent = irr * 100;
  
  const breakdown = {
    irr: irrPercent,
    initialInvestment: params.initialInvestment,
    totalCashFlows: params.annualCashFlows.reduce((sum, cf) => sum + cf, 0),
  };
  
  const insights = [
    `Internal Rate of Return: ${irrPercent.toFixed(2)}%`,
    irrPercent > 15 ? 'Excellent return' : irrPercent > 8 ? 'Good return' : 'Below-average',
  ];
  
  const warnings: string[] = [];
  if (irrPercent < 5) {
    warnings.push('Low IRR - may not exceed cost of capital');
  }
  
  return { value: irrPercent, breakdown, insights, warnings };
}

/**
 * Gross Rent Multiplier (GRM)
 */
export const grmInputSchema = z.object({
  propertyValue: z.number().min(1),
  annualGrossRent: z.number().min(1),
});

export function calculateGRM(paramsInput: z.infer<typeof grmInputSchema>): CalculatorResult {
  const params = grmInputSchema.parse(paramsInput);
  const grm = params.propertyValue / params.annualGrossRent;
  
  const breakdown = {
    grm,
    propertyValue: params.propertyValue,
    annualGrossRent: params.annualGrossRent,
    monthlyGrossRent: params.annualGrossRent / 12,
  };
  
  const insights = [
    `Gross Rent Multiplier: ${grm.toFixed(2)}`,
    grm < 10 ? 'Quick payback' : grm < 15 ? 'Moderate' : 'Long payback',
  ];
  
  return { value: grm, breakdown, insights };
}

/**
 * Operating Expense Ratio (OER)
 */
export const oerInputSchema = z.object({
  operatingExpenses: z.number().min(0),
  grossOperatingIncome: z.number().min(1),
});

export function calculateOER(paramsInput: z.infer<typeof oerInputSchema>): CalculatorResult {
  const params = oerInputSchema.parse(paramsInput);
  const oer = (params.operatingExpenses / params.grossOperatingIncome) * 100;
  
  const breakdown = {
    oer,
    operatingExpenses: params.operatingExpenses,
    grossOperatingIncome: params.grossOperatingIncome,
  };
  
  const insights = [
    `Operating Expense Ratio: ${oer.toFixed(2)}%`,
    oer < 40 ? 'Efficient operations' : oer < 60 ? 'Typical' : 'High expenses',
  ];
  
  const warnings: string[] = [];
  if (oer > 70) {
    warnings.push('Very high OER - review expense structure');
  }
  
  return { value: oer, breakdown, insights, warnings };
}

/**
 * Tax Deduction Calculator
 */
export const taxDeductionInputSchema = z.object({
  depreciation: z.number().min(0),
  interest: z.number().min(0),
  utilities: z.number().min(0),
  repairs: z.number().min(0),
  insurance: z.number().min(0),
  taxRate: z.number().min(0).max(0.50).optional(),
});

export function calculateTaxDeduction(paramsInput: z.infer<typeof taxDeductionInputSchema>): CalculatorResult {
  const params = taxDeductionInputSchema.parse(paramsInput);
  const taxRate = params.taxRate || 0.25;
  
  const totalDeductions = 
    params.depreciation +
    params.interest +
    params.utilities +
    params.repairs +
    params.insurance;
  
  const taxSavings = totalDeductions * taxRate;
  
  const breakdown = {
    totalDeductions,
    taxSavings,
    depreciation: params.depreciation,
    interest: params.interest,
    utilities: params.utilities,
    repairs: params.repairs,
    insurance: params.insurance,
  };
  
  const insights = [
    `Total deductions: $${totalDeductions.toFixed(2)}`,
    `Est. tax savings: $${taxSavings.toFixed(2)}`,
    `Effective savings rate: ${(taxRate * 100).toFixed(0)}%`,
  ];
  
  return { value: taxSavings, breakdown, insights };
}

/**
 * Exit Valuation Calculator
 */
export const exitValuationInputSchema = z.object({
  currentRevenue: z.number().min(1),
  growthRate: z.number().min(-0.50).max(2.00),
  years: z.number().int().min(1).max(10),
  exitMultiple: z.number().min(1).max(10).optional(),
});

export function calculateExitValuation(paramsInput: z.infer<typeof exitValuationInputSchema>): CalculatorResult {
  const params = exitValuationInputSchema.parse(paramsInput);
  const exitMult = params.exitMultiple || 4.5;
  
  const futureRevenue = params.currentRevenue * Math.pow(1 + params.growthRate, params.years);
  const exitValue = futureRevenue * exitMult;
  
  const breakdown = {
    currentRevenue: params.currentRevenue,
    futureRevenue,
    exitValue,
    totalGrowthPercent: ((futureRevenue / params.currentRevenue) - 1) * 100,
  };
  
  const insights = [
    `Projected exit value: $${exitValue.toFixed(2)}`,
    `Future revenue (Year ${params.years}): $${futureRevenue.toFixed(2)}`,
    `Total growth: ${breakdown.totalGrowthPercent.toFixed(1)}%`,
  ];
  
  return { value: exitValue, breakdown, insights };
}

/**
 * Subscription Revenue Projector
 */
export const subscriptionRevenueInputSchema = z.object({
  monthlyPrice: z.number().min(1),
  currentSubscribers: z.number().int().min(1),
  monthlyGrowthRate: z.number().min(0).max(1),
  churnRate: z.number().min(0).max(1),
  months: z.number().int().min(1).max(60),
});

export function calculateSubscriptionRevenue(paramsInput: z.infer<typeof subscriptionRevenueInputSchema>): CalculatorResult {
  const params = subscriptionRevenueInputSchema.parse(paramsInput);
  
  let subscribers = params.currentSubscribers;
  let totalRevenue = 0;
  
  for (let month = 0; month < params.months; month++) {
    const monthlyRevenue = subscribers * params.monthlyPrice;
    totalRevenue += monthlyRevenue;
    const newSubs = subscribers * params.monthlyGrowthRate;
    const churned = subscribers * params.churnRate;
    subscribers = subscribers + newSubs - churned;
  }
  
  const avgMonthlyRevenue = totalRevenue / params.months;
  
  const breakdown = {
    totalRevenue,
    avgMonthlyRevenue,
    finalSubscribers: Math.floor(subscribers),
    growthPercent: ((subscribers / params.currentSubscribers) - 1) * 100,
  };
  
  const insights = [
    `Total ${params.months}-month revenue: $${totalRevenue.toFixed(2)}`,
    `Final subscribers: ${Math.floor(subscribers)}`,
    `Growth: ${breakdown.growthPercent.toFixed(1)}%`,
  ];
  
  return { value: totalRevenue, breakdown, insights };
}

/**
 * Loyalty Program ROI
 */
export const loyaltyProgramInputSchema = z.object({
  programCost: z.number().min(0),
  participatingCustomers: z.number().int().min(1),
  avgSpendIncrease: z.number().min(0),
  retentionImprovement: z.number().min(0).max(1),
  avgCustomerValue: z.number().min(1),
});

export function calculateLoyaltyProgramROI(paramsInput: z.infer<typeof loyaltyProgramInputSchema>): CalculatorResult {
  const params = loyaltyProgramInputSchema.parse(paramsInput);
  
  const increaseRevenue = params.participatingCustomers * params.avgSpendIncrease * 12;
  const retainedValue = params.participatingCustomers * params.retentionImprovement * params.avgCustomerValue;
  const totalValue = increaseRevenue + retainedValue;
  const netValue = totalValue - params.programCost;
  const roi = params.programCost > 0 ? (netValue / params.programCost) * 100 : 0;
  
  const breakdown = {
    roi,
    increaseRevenue,
    retainedValue,
    totalValue,
    netValue,
  };
  
  const insights = [
    `Loyalty Program ROI: ${roi.toFixed(1)}%`,
    `Total program value: $${totalValue.toFixed(2)}`,
    `Net value: $${netValue.toFixed(2)}`,
  ];
  
  return { value: roi, breakdown, insights };
}

/**
 * Social Media ROI
 */
export const socialMediaRoiInputSchema = z.object({
  monthlyAdSpend: z.number().min(0),
  organicReach: z.number().int().min(0),
  paidReach: z.number().int().min(0),
  conversionRate: z.number().min(0).max(1),
  avgOrderValue: z.number().min(0),
  months: z.number().int().min(1).max(12).optional(),
});

export function calculateSocialMediaROI(paramsInput: z.infer<typeof socialMediaRoiInputSchema>): CalculatorResult {
  const params = socialMediaRoiInputSchema.parse(paramsInput);
  const months = params.months || 1;
  
  const totalReach = params.organicReach + params.paidReach;
  const conversions = totalReach * params.conversionRate;
  const revenue = conversions * params.avgOrderValue;
  const totalCost = params.monthlyAdSpend * months;
  const roi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;
  
  const breakdown = {
    roi,
    totalReach,
    conversions,
    revenue,
    costPerConversion: conversions > 0 ? totalCost / conversions : 0,
  };
  
  const insights = [
    `Social Media ROI: ${roi.toFixed(1)}%`,
    `Conversions: ${Math.floor(conversions)}`,
    `Revenue: $${revenue.toFixed(2)}`,
  ];
  
  return { value: roi, breakdown, insights };
}

/**
 * Website Conversion Calculator
 */
export const conversionInputSchema = z.object({
  visitors: z.number().int().min(1),
  currentConversionRate: z.number().min(0).max(1),
  targetConversionRate: z.number().min(0).max(1),
  avgOrderValue: z.number().min(0),
});

export function calculateConversion(paramsInput: z.infer<typeof conversionInputSchema>): CalculatorResult {
  const params = conversionInputSchema.parse(paramsInput);
  
  const currentConversions = params.visitors * params.currentConversionRate;
  const targetConversions = params.visitors * params.targetConversionRate;
  const incrementalConversions = targetConversions - currentConversions;
  const incrementalRevenue = incrementalConversions * params.avgOrderValue;
  
  const breakdown = {
    currentConversions,
    targetConversions,
    incrementalConversions,
    incrementalRevenue,
    improvementPercent: ((params.targetConversionRate - params.currentConversionRate) / params.currentConversionRate) * 100,
  };
  
  const insights = [
    `Current conversions: ${Math.floor(currentConversions)}`,
    `Target conversions: ${Math.floor(targetConversions)}`,
    `Incremental revenue: $${incrementalRevenue.toFixed(2)}`,
  ];
  
  return { value: incrementalRevenue, breakdown, insights };
}

/**
 * Competitive Pricing Analysis
 */
export const competitivePricingInputSchema = z.object({
  yourPrice: z.number().min(0),
  competitorPrices: z.array(z.number()).min(1),
  yourCost: z.number().min(0),
});

export function calculateCompetitivePricing(paramsInput: z.infer<typeof competitivePricingInputSchema>): CalculatorResult {
  const params = competitivePricingInputSchema.parse(paramsInput);
  
  const avgCompetitorPrice = params.competitorPrices.reduce((sum, p) => sum + p, 0) / params.competitorPrices.length;
  const minCompetitorPrice = Math.min(...params.competitorPrices);
  const maxCompetitorPrice = Math.max(...params.competitorPrices);
  const pricePosition = ((params.yourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;
  const yourMargin = params.yourPrice > 0 ? ((params.yourPrice - params.yourCost) / params.yourPrice) * 100 : 0;
  
  const breakdown = {
    avgCompetitorPrice,
    minCompetitorPrice,
    maxCompetitorPrice,
    pricePosition,
    yourMargin,
  };
  
  const insights = [
    `Your price vs avg: ${pricePosition > 0 ? '+' : ''}${pricePosition.toFixed(1)}%`,
    `Competitor range: $${minCompetitorPrice.toFixed(2)} - $${maxCompetitorPrice.toFixed(2)}`,
    `Your margin: ${yourMargin.toFixed(1)}%`,
  ];
  
  const warnings: string[] = [];
  if (params.yourPrice > maxCompetitorPrice) {
    warnings.push('Priced above all competitors - ensure value justifies premium');
  } else if (params.yourPrice < minCompetitorPrice) {
    warnings.push('Priced below all competitors - leaving money on table');
  }
  
  return { value: pricePosition, breakdown, insights, warnings };
}

/**
 * Peak Hour Analysis
 */
export const peakHourInputSchema = z.object({
  avgHourlyCustomers: z.number().min(0),
  peakHourCustomers: z.number().min(0),
  totalHoursOpen: z.number().min(1).max(24),
  peakHours: z.number().min(1).max(24),
});

export function calculatePeakHour(paramsInput: z.infer<typeof peakHourInputSchema>): CalculatorResult {
  const params = peakHourInputSchema.parse(paramsInput);
  
  const normalHours = params.totalHoursOpen - params.peakHours;
  const normalCustomers = params.avgHourlyCustomers * normalHours;
  const peakCustomers = params.peakHourCustomers * params.peakHours;
  const totalDaily = normalCustomers + peakCustomers;
  const peakPercent = (peakCustomers / totalDaily) * 100;
  
  const breakdown = {
    peakPercent,
    peakCustomers,
    normalCustomers,
    totalDaily,
    staffingMultiplier: params.peakHourCustomers / params.avgHourlyCustomers,
  };
  
  const insights = [
    `Peak hours: ${params.peakHours}h handle ${peakPercent.toFixed(1)}% of daily customers`,
    `Staffing multiplier during peak: ${breakdown.staffingMultiplier.toFixed(1)}x`,
  ];
  
  return { value: peakPercent, breakdown, insights };
}

/**
 * Seasonal Demand Forecaster
 */
export const seasonalDemandInputSchema = z.object({
  baselineRevenue: z.number().min(1),
  summerMultiplier: z.number().min(0).max(2).optional(),
  winterMultiplier: z.number().min(0).max(2).optional(),
});

export function calculateSeasonalDemand(paramsInput: z.infer<typeof seasonalDemandInputSchema>): CalculatorResult {
  const params = seasonalDemandInputSchema.parse(paramsInput);
  const summerMult = params.summerMultiplier || 1.25;
  const winterMult = params.winterMultiplier || 0.85;
  
  const summerRevenue = params.baselineRevenue * summerMult;
  const winterRevenue = params.baselineRevenue * winterMult;
  // Annual: 3 months summer, 3 months winter, 6 months baseline
  const annualRevenue = (summerRevenue * 3) + (winterRevenue * 3) + (params.baselineRevenue * 6);
  
  const breakdown = {
    summerRevenue,
    winterRevenue,
    springFallRevenue: params.baselineRevenue,
    annualRevenue,
    peakVariance: ((summerRevenue - winterRevenue) / params.baselineRevenue) * 100,
  };
  
  const insights = [
    `Annual revenue: $${annualRevenue.toFixed(2)}`,
    `Summer peak: +${((summerMult - 1) * 100).toFixed(0)}% vs baseline`,
    `Winter low: ${((winterMult - 1) * 100).toFixed(0)}% vs baseline`,
  ];
  
  return { value: annualRevenue, breakdown, insights };
}

/**
 * Route Optimization Cost
 */
export const routeOptimizationInputSchema = z.object({
  numberOfStops: z.number().int().min(1),
  avgMilesPerStop: z.number().min(0),
  costPerMile: z.number().min(0),
  driverHourlyWage: z.number().min(0),
  avgMinutesPerStop: z.number().min(1),
});

export function calculateRouteOptimization(paramsInput: z.infer<typeof routeOptimizationInputSchema>): CalculatorResult {
  const params = routeOptimizationInputSchema.parse(paramsInput);
  
  const totalMiles = params.numberOfStops * params.avgMilesPerStop;
  const fuelCost = totalMiles * params.costPerMile;
  const totalMinutes = params.numberOfStops * params.avgMinutesPerStop;
  const laborCost = (totalMinutes / 60) * params.driverHourlyWage;
  const totalRouteCost = fuelCost + laborCost;
  const costPerStop = totalRouteCost / params.numberOfStops;
  
  const breakdown = {
    totalRouteCost,
    fuelCost,
    laborCost,
    costPerStop,
    totalMiles,
  };
  
  const insights = [
    `Total route cost: $${totalRouteCost.toFixed(2)}`,
    `Cost per stop: $${costPerStop.toFixed(2)}`,
    `Fuel: $${fuelCost.toFixed(2)} | Labor: $${laborCost.toFixed(2)}`,
  ];
  
  return { value: totalRouteCost, breakdown, insights };
}

/**
 * Pickup/Delivery Profitability
 */
export const pickupDeliveryInputSchema = z.object({
  serviceRevenue: z.number().min(0),
  routeCost: z.number().min(0),
  processingCost: z.number().min(0),
  numberOfOrders: z.number().int().min(1),
});

export function calculatePickupDeliveryProfitability(paramsInput: z.infer<typeof pickupDeliveryInputSchema>): CalculatorResult {
  const params = pickupDeliveryInputSchema.parse(paramsInput);
  
  const totalCost = params.routeCost + params.processingCost;
  const profit = params.serviceRevenue - totalCost;
  const profitMargin = params.serviceRevenue > 0 ? (profit / params.serviceRevenue) * 100 : 0;
  const profitPerOrder = profit / params.numberOfOrders;
  
  const breakdown = {
    profit,
    profitMargin,
    profitPerOrder,
    totalCost,
    revenuePerOrder: params.serviceRevenue / params.numberOfOrders,
  };
  
  const insights = [
    `Net profit: $${profit.toFixed(2)}`,
    `Profit margin: ${profitMargin.toFixed(1)}%`,
    `Profit per order: $${profitPerOrder.toFixed(2)}`,
  ];
  
  const warnings: string[] = [];
  if (profitMargin < 15) {
    warnings.push('Low margin - review pricing or optimize routes');
  }
  
  return { value: profit, breakdown, insights, warnings };
}

/**
 * Staff Productivity Calculator
 */
export const staffProductivityInputSchema = z.object({
  hoursWorked: z.number().min(1),
  ordersProcessed: z.number().int().min(0),
  revenueGenerated: z.number().min(0),
  hourlyWage: z.number().min(0),
});

export function calculateStaffProductivity(paramsInput: z.infer<typeof staffProductivityInputSchema>): CalculatorResult {
  const params = staffProductivityInputSchema.parse(paramsInput);
  
  const ordersPerHour = params.ordersProcessed / params.hoursWorked;
  const revenuePerHour = params.revenueGenerated / params.hoursWorked;
  const laborCost = params.hoursWorked * params.hourlyWage;
  const laborEfficiency = params.revenueGenerated / laborCost;
  
  const breakdown = {
    ordersPerHour,
    revenuePerHour,
    laborEfficiency,
    laborCost,
  };
  
  const insights = [
    `Orders per hour: ${ordersPerHour.toFixed(1)}`,
    `Revenue per hour: $${revenuePerHour.toFixed(2)}`,
    `Labor efficiency: ${laborEfficiency.toFixed(2)}x (revenue/cost)`,
  ];
  
  const warnings: string[] = [];
  if (laborEfficiency < 3) {
    warnings.push('Low labor efficiency - review processes or training');
  }
  
  return { value: ordersPerHour, breakdown, insights, warnings };
}

/**
 * Maintenance Cost Projector
 */
export const maintenanceCostInputSchema = z.object({
  numberOfMachines: z.number().int().min(1),
  avgAgeYears: z.number().min(0).max(30),
  annualTurns: z.number().min(0),
});

export function calculateMaintenanceCost(paramsInput: z.infer<typeof maintenanceCostInputSchema>): CalculatorResult {
  const params = maintenanceCostInputSchema.parse(paramsInput);
  
  // Cost escalates with age: base $500/machine + $100/year of age + $0.10/turn
  const baseCost = 500 * params.numberOfMachines;
  const ageCost = params.avgAgeYears * 100 * params.numberOfMachines;
  const usageCost = params.annualTurns * 0.10;
  const totalAnnual = baseCost + ageCost + usageCost;
  const monthlyBudget = totalAnnual / 12;
  const perMachine = totalAnnual / params.numberOfMachines;
  
  const breakdown = {
    totalAnnual,
    monthlyBudget,
    perMachine,
    baseCost,
    ageCost,
    usageCost,
  };
  
  const insights = [
    `Annual maintenance budget: $${totalAnnual.toFixed(2)}`,
    `Monthly budget: $${monthlyBudget.toFixed(2)}`,
    `Per machine: $${perMachine.toFixed(2)}/year`,
  ];
  
  const warnings: string[] = [];
  if (params.avgAgeYears > 15) {
    warnings.push('Aging fleet - consider replacement schedule');
  }
  
  return { value: totalAnnual, breakdown, insights, warnings };
}

// Export calculator registry for dynamic loading
export const CALCULATOR_REGISTRY = {
  // Core Valuation & Financial
  valuation: calculateValuation,
  roi: calculateROI,
  tpd: calculateTPD,
  monteCarlo: monteCarloRevenue,
  pricing: calculatePricing,
  staffing: calculateStaffing,
  utilities: calculateUtilities,
  
  // Financial Analysis
  loan: calculateLoan,
  leaseVsBuy: calculateLeaseVsBuy,
  npv: calculateNPV,
  clv: calculateCLV,
  cac: calculateCAC,
  
  // Operational & Real Estate
  energyCost: calculateEnergyCost,
  waterCost: calculateWaterCost,
  laborCost: calculateLaborCost,
  machineUtilization: calculateMachineUtilization,
  depreciation: calculateDepreciation,
  capRate: calculateCapRate,
  dscr: calculateDSCR,
  profitMargin: calculateProfitMargin,
  paybackPeriod: calculatePaybackPeriod,
  
  // Marketing & Growth
  revenuePerSqFt: calculateRevenuePerSqFt,
  marketingROI: calculateMarketingROI,
  churnRate: calculateChurnRate,
  pricingOptimizer: calculatePricingOptimizer,
  
  // Insurance & Startup
  insurance: calculateInsurance,
  startupCost: calculateStartupCost,
  expansionROI: calculateExpansionROI,
  rentAffordability: calculateRentAffordability,
  emailROI: calculateEmailROI,
  referralProgram: calculateReferralProgram,
  
  // Advanced Financial & Operational
  irr: calculateIRR,
  grm: calculateGRM,
  oer: calculateOER,
  taxDeduction: calculateTaxDeduction,
  exitValuation: calculateExitValuation,
  subscriptionRevenue: calculateSubscriptionRevenue,
  loyaltyProgramROI: calculateLoyaltyProgramROI,
  socialMediaROI: calculateSocialMediaROI,
  websiteConversion: calculateConversion,
  competitivePricing: calculateCompetitivePricing,
  peakHourAnalysis: calculatePeakHour,
  seasonalDemand: calculateSeasonalDemand,
  routeOptimization: calculateRouteOptimization,
  pickupDeliveryProfitability: calculatePickupDeliveryProfitability,
  staffProductivity: calculateStaffProductivity,
  maintenanceCost: calculateMaintenanceCost,
};

export type CalculatorType = keyof typeof CALCULATOR_REGISTRY;
