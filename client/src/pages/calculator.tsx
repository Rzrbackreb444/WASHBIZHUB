import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon } from "lucide-react";

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
  );
}
