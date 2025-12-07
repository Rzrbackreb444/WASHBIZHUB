import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon } from "lucide-react";

const CALCULATOR_SEO = {
  title: "Laundromat ROI Calculator - Revenue & Profit Tool",
  description: "Calculate laundromat ROI, monthly revenue & profit projections. Free calculator for coin-op equipment investment with turns per day & utilization analysis.",
  canonicalUrl: "/calculator",
  keywords: [
    "laundromat ROI calculator",
    "laundry revenue calculator",
    "coin-op profit calculator",
    "laundromat investment",
    "washer dryer ROI",
    "turns per day calculator",
    "laundromat profitability",
    "commercial laundry income",
    "equipment investment ROI",
    "laundromat business calculator",
    "utilization rate",
    "monthly revenue projection",
    "laundry equipment payback",
    "vend pricing calculator"
  ],
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/calculators" },
    { name: "Revenue Calculator", url: "/calculator" }
  ],
  faqs: [
    {
      question: "How do I calculate ROI for my laundromat equipment investment?",
      answer: "Calculate ROI by dividing annual profit by total equipment investment. For example, if you invest $132,500 in equipment (20 washers at $4,000 + 15 dryers at $3,500) and generate $60,000 annual profit, your ROI is approximately 45%. Our calculator factors in washers, dryers, vend prices, turns per day, utilization rate, and monthly expenses."
    },
    {
      question: "What is a good turns per day rate for laundromat equipment?",
      answer: "Industry average is 4-6 turns per day for washers. High-performing laundromats achieve 6-8 turns. Factors affecting turns include location traffic, operating hours, equipment capacity, and pricing. Each additional turn can increase monthly revenue by 15-20%. Use our calculator to project revenue at different turn rates."
    },
    {
      question: "What utilization rate should I expect for my laundromat?",
      answer: "Average utilization rates range from 50-70% for established laundromats. New locations typically start at 40-50% and grow over time. Peak utilization during weekends can reach 85-95%. Our calculator defaults to 65% utilization, which represents a well-performing mid-market laundromat."
    },
    {
      question: "How much revenue can a laundromat generate monthly?",
      answer: "Monthly revenue varies by size and location. Small laundromats (8-15 machines) generate $8,000-$15,000/month. Medium facilities (16-30 machines) earn $15,000-$35,000/month. Large operations (31-50+ machines) can generate $35,000-$80,000+/month. Use our calculator with your specific equipment counts and vend prices for accurate projections."
    },
    {
      question: "What are typical monthly expenses for a laundromat?",
      answer: "Common monthly expenses include: rent ($2,000-$8,000), utilities - water/gas/electric ($1,500-$4,000), insurance ($200-$500), maintenance ($300-$800), supplies ($200-$400), and labor if attended ($1,500-$4,000). Total monthly expenses typically range from $6,000-$15,000 depending on size and location."
    },
    {
      question: "How long does it take to pay back laundromat equipment investment?",
      answer: "Equipment payback period typically ranges from 2-5 years. With 45% ROI, payback occurs in about 2.2 years. Factors affecting payback include vend pricing, location traffic, operating costs, and equipment efficiency. Energy-efficient equipment like Dexter models can reduce utility costs 20-30%, accelerating payback."
    }
  ]
};

export default function Calculator() {
  const [inputs, setInputs] = useState({
    washers: "20",
    dryers: "15",
    avgWashPrice: "3.50",
    avgDryPrice: "2.25",
    turnsPerDay: "4",
    utilization: "65",
    monthlyExpenses: "8500",
  });

  const [results, setResults] = useState<{
    dailyRevenue: number;
    monthlyRevenue: number;
    annualRevenue: number;
    monthlyProfit: number;
    annualProfit: number;
    roi: number;
  } | null>(null);

  const calculate = () => {
    const washers = parseInt(inputs.washers) || 0;
    const dryers = parseInt(inputs.dryers) || 0;
    const avgWashPrice = parseFloat(inputs.avgWashPrice) || 0;
    const avgDryPrice = parseFloat(inputs.avgDryPrice) || 0;
    const turnsPerDay = parseFloat(inputs.turnsPerDay) || 0;
    const utilization = parseFloat(inputs.utilization) / 100 || 0;
    const monthlyExpenses = parseFloat(inputs.monthlyExpenses) || 0;

    const dailyWashRevenue = washers * avgWashPrice * turnsPerDay * utilization;
    const dailyDryRevenue = dryers * avgDryPrice * turnsPerDay * utilization;
    const dailyRevenue = dailyWashRevenue + dailyDryRevenue;
    const monthlyRevenue = dailyRevenue * 30;
    const annualRevenue = monthlyRevenue * 12;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const annualProfit = monthlyProfit * 12;
    
    // Assuming initial investment of $150K for equipment
    const estimatedInvestment = (washers * 4000) + (dryers * 3500);
    const roi = (annualProfit / estimatedInvestment) * 100;

    setResults({
      dailyRevenue,
      monthlyRevenue,
      annualRevenue,
      monthlyProfit,
      annualProfit,
      roi,
    });
  };

  return (
    <>
      <SEO
        title={CALCULATOR_SEO.title}
        description={CALCULATOR_SEO.description}
        canonicalUrl={CALCULATOR_SEO.canonicalUrl}
        keywords={CALCULATOR_SEO.keywords}
        breadcrumbs={CALCULATOR_SEO.breadcrumbs}
        faqs={CALCULATOR_SEO.faqs}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <CalcIcon className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-calculator-title">
            Revenue Calculator
          </h1>
          <p className="text-xl text-white/70" data-testid="text-calculator-subtitle">
            Project your laundromat's financial performance with precision
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Business Inputs</CardTitle>
            <CardDescription className="text-white/70">
              Enter your laundromat specifications for accurate projections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="washers" className="text-white/90 font-medium">Number of Washers</Label>
                <Input
                  id="washers"
                  type="number"
                  value={inputs.washers}
                  onChange={(e) => setInputs({ ...inputs, washers: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-washers"
                />
              </div>
              
              <div>
                <Label htmlFor="dryers" className="text-white/90 font-medium">Number of Dryers</Label>
                <Input
                  id="dryers"
                  type="number"
                  value={inputs.dryers}
                  onChange={(e) => setInputs({ ...inputs, dryers: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-dryers"
                />
              </div>

              <div>
                <Label htmlFor="avgWashPrice" className="text-white/90 font-medium">Avg Wash Price ($)</Label>
                <Input
                  id="avgWashPrice"
                  type="number"
                  step="0.25"
                  value={inputs.avgWashPrice}
                  onChange={(e) => setInputs({ ...inputs, avgWashPrice: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-wash-price"
                />
              </div>

              <div>
                <Label htmlFor="avgDryPrice" className="text-white/90 font-medium">Avg Dry Price ($)</Label>
                <Input
                  id="avgDryPrice"
                  type="number"
                  step="0.25"
                  value={inputs.avgDryPrice}
                  onChange={(e) => setInputs({ ...inputs, avgDryPrice: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-dry-price"
                />
              </div>

              <div>
                <Label htmlFor="turnsPerDay" className="text-white/90 font-medium">Turns Per Day</Label>
                <Input
                  id="turnsPerDay"
                  type="number"
                  step="0.5"
                  value={inputs.turnsPerDay}
                  onChange={(e) => setInputs({ ...inputs, turnsPerDay: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-turns-per-day"
                />
              </div>

              <div>
                <Label htmlFor="utilization" className="text-white/90 font-medium">Utilization Rate (%)</Label>
                <Input
                  id="utilization"
                  type="number"
                  value={inputs.utilization}
                  onChange={(e) => setInputs({ ...inputs, utilization: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-utilization"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="monthlyExpenses" className="text-white/90 font-medium">Monthly Expenses ($)</Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={inputs.monthlyExpenses}
                  onChange={(e) => setInputs({ ...inputs, monthlyExpenses: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                  data-testid="input-monthly-expenses"
                />
              </div>
            </div>

            <Button
              onClick={calculate}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6"
              data-testid="button-calculate"
            >
              Calculate Revenue
            </Button>

            {results && (
              <div className="mt-8 space-y-4" data-testid="results-container">
                <h3 className="text-2xl font-bold text-white mb-4">Projections</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Daily Revenue</div>
                      <div className="text-4xl font-black text-accent" data-testid="result-daily-revenue">
                        ${results.dailyRevenue.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Monthly Revenue</div>
                      <div className="text-4xl font-black text-accent" data-testid="result-monthly-revenue">
                        ${results.monthlyRevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Annual Revenue</div>
                      <div className="text-4xl font-black text-accent" data-testid="result-annual-revenue">
                        ${results.annualRevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Monthly Profit</div>
                      <div className="text-4xl font-black text-accent" data-testid="result-monthly-profit">
                        ${results.monthlyProfit.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Annual Profit</div>
                      <div className="text-4xl font-black text-accent" data-testid="result-annual-profit">
                        ${results.annualProfit.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">ROI</div>
                      <div className="text-4xl font-black text-accent" data-testid="result-roi">
                        {results.roi.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-sm text-white/60 mt-4">
                  * Projections based on industry averages. Actual results may vary based on location, 
                  competition, and operational efficiency.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
