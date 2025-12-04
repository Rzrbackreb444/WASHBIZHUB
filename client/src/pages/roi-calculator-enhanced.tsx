import { AuthGuard } from "@/components/AuthGuard";
import { FeatureGate } from "@/components/monetization/FeatureGate";
import { EnhancedCalculatorEngine } from "@/components/EnhancedCalculatorEngine";
import type { Scenario } from "@/components/calculator/ScenarioCard";
import type { BenchmarkData } from "@/components/calculator/BenchmarkBar";
import type { ActionItem } from "@/components/calculator/ActionItemCard";
import { SEO } from "@/components/SEO";

export default function ROICalculatorEnhanced() {
  const roiConfig = {
    id: 'roi-enhanced',
    name: 'ROI Calculator Pro',
    description: 'World-class investment analysis with scenario modeling, industry benchmarks, and actionable recommendations',
    category: 'Financial Analysis',
    
    inputs: [
      {
        name: 'purchasePrice',
        label: 'Purchase Price',
        type: 'currency' as const,
        defaultValue: 250000,
        min: 10000,
        max: 5000000,
        step: 5000,
        tooltip: 'Total acquisition cost',
        prefix: '$',
      },
      {
        name: 'monthlyRevenue',
        label: 'Monthly Revenue',
        type: 'currency' as const,
        defaultValue: 15000,
        min: 1000,
        max: 100000,
        step: 500,
        tooltip: 'Average monthly gross revenue',
        prefix: '$',
      },
      {
        name: 'monthlyExpenses',
        label: 'Monthly Operating Expenses',
        type: 'currency' as const,
        defaultValue: 6000,
        min: 0,
        max: 50000,
        step: 250,
        tooltip: 'Rent, utilities, labor, supplies',
        prefix: '$',
      },
      {
        name: 'downPayment',
        label: 'Down Payment',
        type: 'percentage' as const,
        defaultValue: 25,
        min: 0,
        max: 100,
        step: 5,
        tooltip: 'Down payment percentage',
        suffix: '%',
      },
      {
        name: 'interestRate',
        label: 'Interest Rate',
        type: 'percentage' as const,
        defaultValue: 7.5,
        min: 0,
        max: 20,
        step: 0.25,
        tooltip: 'Annual loan interest rate',
        suffix: '%',
      },
    ],
    
    outputs: [
      {
        name: 'annualCashFlow',
        label: 'Annual Cash Flow',
        format: 'currency' as const,
        decimals: 0,
        highlight: true,
      },
      {
        name: 'cashOnCash',
        label: 'Cash-on-Cash Return',
        format: 'percentage' as const,
        decimals: 1,
        highlight: true,
      },
      {
        name: 'breakEven',
        label: 'Payback Period',
        format: 'number' as const,
        decimals: 1,
        highlight: false,
      },
      {
        name: 'fiveYearROI',
        label: '5-Year Total ROI',
        format: 'percentage' as const,
        decimals: 1,
        highlight: false,
      },
    ],
    
    formulas: {
      annualRevenue: 'monthlyRevenue * 12',
      annualExpenses: 'monthlyExpenses * 12',
      annualCashFlow: 'annualRevenue - annualExpenses',
      downPaymentAmount: '(downPayment / 100) * purchasePrice',
      loanAmount: 'purchasePrice - downPaymentAmount',
      monthlyLoanPayment: '(loanAmount * (interestRate/100/12)) / (1 - Math.pow(1 + (interestRate/100/12), -360))',
      annualDebtService: 'monthlyLoanPayment * 12',
      netCashFlow: 'annualCashFlow - annualDebtService',
      cashOnCash: '(netCashFlow / downPaymentAmount) * 100',
      breakEven: 'downPaymentAmount / netCashFlow',
      fiveYearROI: '((netCashFlow * 5) / downPaymentAmount) * 100',
    },
    
    enhancedAnalytics: (inputs: Record<string, any>, results: Record<string, any>) => {
      const cashOnCash = results.cashOnCash || 0;
      const annualCashFlow = results.annualCashFlow || 0;
      const breakEven = results.breakEven || 0;
      const revenue = parseFloat(inputs.monthlyRevenue) * 12;
      const expenses = parseFloat(inputs.monthlyExpenses) * 12;
      const profitMargin = ((revenue - expenses) / revenue) * 100;

      // Calculate main investment score (0-10)
      let score = 5; // baseline
      if (cashOnCash >= 20) score += 3;
      else if (cashOnCash >= 15) score += 2;
      else if (cashOnCash >= 10) score += 1;
      else if (cashOnCash < 5) score -= 2;
      
      if (profitMargin >= 50) score += 1.5;
      else if (profitMargin >= 40) score += 1;
      else if (profitMargin < 30) score -= 1;
      
      if (breakEven <= 4) score += 1;
      else if (breakEven <= 6) score += 0.5;
      else if (breakEven > 8) score -= 1.5;
      
      const mainScore = Math.max(0, Math.min(10, score));

      // Risk score (inverse of investment score for simplicity)
      const secondaryScore = Math.max(0, Math.min(10, 10 - score + 3));

      // Scenario analysis with confidence intervals
      const scenarios: Scenario[] = [
        {
          type: 'worst',
          label: 'Worst Case',
          value: annualCashFlow * 0.7, // 30% revenue drop
          probability: 0.10,
          description: '30% revenue decline scenario',
        },
        {
          type: 'likely',
          label: 'Most Likely',
          value: annualCashFlow,
          probability: 0.70,
          description: 'Expected performance based on inputs',
        },
        {
          type: 'best',
          label: 'Best Case',
          value: annualCashFlow * 1.35, // 35% revenue growth
          probability: 0.20,
          description: 'Optimized operations + market growth',
        },
      ];

      // Industry benchmarks
      const benchmarks: BenchmarkData[] = [
        {
          yourValue: cashOnCash,
          industryAverage: 11.5,
          top25Threshold: 15.0,
          top10Threshold: 18.0,
          label: 'Cash-on-Cash Return vs Industry',
          unit: '%',
        },
      ];

      // Actionable recommendations
      const actions: ActionItem[] = [];
      
      // Calculate potential revenue increase from TPD optimization
      const currentTPD = 4.2; // assumed baseline
      const targetTPD = 6.0;
      const tpdIncrease = (targetTPD - currentTPD) / currentTPD;
      const tpdRevImpact = revenue * tpdIncrease;
      
      if (tpdRevImpact > 5000) {
        actions.push({
          priority: 1,
          title: `Increase TPD from ${currentTPD} to ${targetTPD}`,
          impact: `+$${(tpdRevImpact / 1000).toFixed(1)}K/yr (+${(tpdRevImpact / revenue * 100).toFixed(0)}% revenue)`,
          description: 'Add high-efficiency washers, optimize pricing during peak hours, extend operating hours',
          difficulty: 'medium',
        });
      }

      // Utility cost reduction
      const utilityReduction = expenses * 0.08;
      actions.push({
        priority: 2,
        title: 'Reduce utility costs 8%',
        impact: `+$${(utilityReduction / 1000).toFixed(1)}K/yr (+${((utilityReduction / annualCashFlow) * 100).toFixed(0)}% cash flow)`,
        description: 'Install LED lighting, high-efficiency washers, schedule machines during off-peak electric hours',
        difficulty: 'easy',
      });

      // Add wash-dry-fold service
      const wdfRevenue = revenue * 0.15;
      actions.push({
        priority: 3,
        title: 'Launch Wash-Dry-Fold service',
        impact: `+$${(wdfRevenue / 1000).toFixed(1)}K/yr (+${((wdfRevenue / revenue) * 100).toFixed(0)}% revenue)`,
        description: 'Hire 1 attendant, add folding table, promote to existing customer base',
        difficulty: 'medium',
      });

      // Vending machines
      if (revenue < 200000) {
        actions.push({
          priority: 4,
          title: 'Add snack/detergent vending',
          impact: '+$2.4K/yr (passive income)',
          description: 'Install 2 vending machines for detergent, snacks, drinks - minimal maintenance',
          difficulty: 'easy',
        });
      }

      // Refinance opportunity
      if (parseFloat(inputs.interestRate) > 6.5) {
        const rateDiff = parseFloat(inputs.interestRate) - 6.0;
        const savings = (results.loanAmount * (rateDiff / 100));
        if (savings > 1000) {
          actions.push({
            priority: 5,
            title: 'Refinance at 6.0% APR',
            impact: `+$${(savings / 1000).toFixed(1)}K/yr`,
            description: 'Current rates lower - refinancing could reduce annual debt service significantly',
            difficulty: 'easy',
          });
        }
      }

      // Insights
      const insights: string[] = [];
      
      if (cashOnCash >= 15) {
        insights.push(`Outstanding ${cashOnCash.toFixed(1)}% cash-on-cash return - you're in the top 25% of laundromats nationally`);
      } else if (cashOnCash >= 10) {
        insights.push(`Solid ${cashOnCash.toFixed(1)}% cash-on-cash return - above industry average of 11.5%`);
      }

      if (profitMargin >= 50) {
        insights.push(`Exceptional ${profitMargin.toFixed(0)}% profit margin indicates efficient operations`);
      }

      if (breakEven <= 5) {
        insights.push(`Fast ${breakEven.toFixed(1)}-year payback period reduces investment risk`);
      }

      const totalImpact = actions.slice(0, 3).reduce((sum, action) => {
        const match = action.impact.match(/\+\$([0-9.]+)K/);
        return sum + (match ? parseFloat(match[1]) * 1000 : 0);
      }, 0);

      if (totalImpact > 10000) {
        insights.push(`Implementing top 3 actions could increase annual cash flow by $${(totalImpact / 1000).toFixed(0)}K (+${((totalImpact / annualCashFlow) * 100).toFixed(0)}%)`);
      }

      // Warnings
      const warnings: string[] = [];
      
      if (cashOnCash < 8) {
        warnings.push(`${cashOnCash.toFixed(1)}% cash-on-cash return is below industry average - consider operational improvements before purchasing`);
      }

      if (breakEven > 7) {
        warnings.push(`${breakEven.toFixed(1)}-year payback period is high risk - typical range is 4-6 years`);
      }

      if (profitMargin < 35) {
        warnings.push(`${profitMargin.toFixed(0)}% profit margin is thin - review expenses for reduction opportunities`);
      }

      const debtCoverage = annualCashFlow / (results.annualDebtService || 1);
      if (debtCoverage < 1.25) {
        warnings.push(`Debt coverage ratio of ${debtCoverage.toFixed(2)}x is tight - lenders typically want 1.25x minimum`);
      }

      return {
        mainScore,
        secondaryScore,
        scenarios,
        benchmarks,
        actions,
        insights,
        warnings,
      };
    },
    
    tips: [
      'Cash-on-Cash return is the gold standard metric for laundromat investments',
      'Top performers achieve 18%+ annual returns through operational excellence',
      'A 4-6 year payback period is ideal - anything over 7 years carries higher risk',
      'Profit margins of 50%+ indicate a well-run operation with room for expansion',
      'Consider both cash flow AND asset appreciation when evaluating total returns',
    ],
  };

  return (
    <AuthGuard title="Sign In to Use Enhanced ROI Calculator" description="Sign in to access this calculator and track your usage.">
      <FeatureGate 
        feature="calculators-advanced" 
        blurContent={true}
        title="Advanced ROI Calculator Pro"
        description="Get professional-grade investment analysis with scenario modeling, industry benchmarks, and AI-powered recommendations."
      >
        <SEO
          title="ROI Calculator Pro - Advanced Laundromat Investment Analysis | WashBizHub"
          description="World-class laundromat ROI calculator with scenario modeling, industry benchmarks, and AI-powered recommendations. Calculate cash-on-cash returns, payback period, and 5-year projections with professional-grade analytics."
          canonicalUrl="/roi-calculator-enhanced"
          keywords={[
            "laundromat ROI calculator",
            "cash on cash return calculator",
            "laundromat investment analysis",
            "laundry business ROI",
            "laundromat payback period",
            "investment calculator",
            "laundromat profitability",
          ]}
        />
        <EnhancedCalculatorEngine config={roiConfig} />
      </FeatureGate>
    </AuthGuard>
  );
}
