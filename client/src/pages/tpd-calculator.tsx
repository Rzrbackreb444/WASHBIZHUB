import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, AlertCircle, Download, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface MonteCarloResult {
  mean: number;
  median: number;
  p10: number;
  p90: number;
  min: number;
  max: number;
  breakEvenProbability: number;
  simulations: number[];
}

export default function TPDCalculator() {
  const [inputs, setInputs] = useState({
    revenue: 15000,
    rent: 3500,
    utilities: 1200,
    labor: 2800,
    maintenance: 500,
    insurance: 300,
    miscExpenses: 400,
    washersCount: 20,
    dryersCount: 24,
    avgWashPrice: 3.50,
    avgDryPrice: 2.00,
    washerUtilization: 65,
    dryerUtilization: 70,
  });

  const [monteCarloResults, setMonteCarloResults] = useState<MonteCarloResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Base calculations
  const totalExpenses = inputs.rent + inputs.utilities + inputs.labor + 
    inputs.maintenance + inputs.insurance + inputs.miscExpenses;
  const netIncome = inputs.revenue - totalExpenses;
  const breakEvenRevenue = totalExpenses;
  const totalMachines = inputs.washersCount + inputs.dryersCount;
  const avgPricePerTurn = ((inputs.washersCount * inputs.avgWashPrice) + 
    (inputs.dryersCount * inputs.avgDryPrice)) / totalMachines;
  const turnsPerDay = inputs.revenue / (avgPricePerTurn * 30);
  const breakEvenTurnsPerDay = breakEvenRevenue / (avgPricePerTurn * 30);

  // Monte Carlo simulation
  const runMonteCarloSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    
    const simulations: number[] = [];
    const iterations = 10000;
    const batchSize = 100;
    
    // Run simulation in batches to allow UI updates
    let currentIteration = 0;
    
    const runBatch = () => {
      for (let i = 0; i < batchSize && currentIteration < iterations; i++, currentIteration++) {
        // Random variation factors (±20% for most variables)
        const revenueVar = inputs.revenue * (0.8 + Math.random() * 0.4);
        const rentVar = inputs.rent * (0.95 + Math.random() * 0.1); // Less variable
        const utilitiesVar = inputs.utilities * (0.8 + Math.random() * 0.4);
        const laborVar = inputs.labor * (0.9 + Math.random() * 0.2);
        const maintenanceVar = inputs.maintenance * (0.5 + Math.random() * 1.0); // High variance
        const insuranceVar = inputs.insurance * (0.95 + Math.random() * 0.1);
        const miscVar = inputs.miscExpenses * (0.7 + Math.random() * 0.6);
        
        const totalExp = rentVar + utilitiesVar + laborVar + maintenanceVar + insuranceVar + miscVar;
        const net = revenueVar - totalExp;
        const tpd = revenueVar / (avgPricePerTurn * 30);
        
        simulations.push(tpd);
      }
      
      setProgress((currentIteration / iterations) * 100);
      
      if (currentIteration < iterations) {
        setTimeout(runBatch, 0);
      } else {
        finishSimulation();
      }
    };
    
    const finishSimulation = () => {
      // Sort for percentile calculations
      const sorted = [...simulations].sort((a, b) => a - b);
      
      const results: MonteCarloResult = {
        mean: simulations.reduce((a, b) => a + b, 0) / simulations.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p10: sorted[Math.floor(sorted.length * 0.1)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        breakEvenProbability: (simulations.filter(t => t >= breakEvenTurnsPerDay).length / simulations.length) * 100,
        simulations: sorted,
      };
      
      setMonteCarloResults(results);
      setIsRunning(false);
      setProgress(100);
    };
    
    runBatch();
  };

  const exportResults = () => {
    const data = {
      inputs,
      calculations: {
        totalExpenses,
        netIncome,
        breakEvenRevenue,
        turnsPerDay: turnsPerDay.toFixed(2),
        breakEvenTurnsPerDay: breakEvenTurnsPerDay.toFixed(2),
      },
      monteCarlo: monteCarloResults,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tpd-analysis-${Date.now()}.json`;
    a.click();
  };

  return (
    <>
      <Helmet>
        <title>TPD Calculator with Monte Carlo - WashBizHub</title>
        <meta name="description" content="Calculate Turns Per Day (TPD) with Monte Carlo simulation. 10,000 iterations for probabilistic financial modeling." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-10 h-10 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">
                Turns Per Day (TPD) Calculator
              </h1>
            </div>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Advanced Monte Carlo simulation with 10,000 iterations for probabilistic TPD analysis
            </p>
            <Badge variant="default" className="mt-4 bg-amber-600">
              <Zap className="w-3 h-3 mr-1" />
              Professional Tool
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Business Inputs</CardTitle>
                  <CardDescription>Enter your monthly financials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Monthly Revenue</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={inputs.revenue}
                      onChange={(e) => setInputs({ ...inputs, revenue: parseFloat(e.target.value) || 0 })}
                      data-testid="input-revenue"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="rent">Rent</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={inputs.rent}
                      onChange={(e) => setInputs({ ...inputs, rent: parseFloat(e.target.value) || 0 })}
                      data-testid="input-rent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilities">Utilities</Label>
                    <Input
                      id="utilities"
                      type="number"
                      value={inputs.utilities}
                      onChange={(e) => setInputs({ ...inputs, utilities: parseFloat(e.target.value) || 0 })}
                      data-testid="input-utilities"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labor">Labor</Label>
                    <Input
                      id="labor"
                      type="number"
                      value={inputs.labor}
                      onChange={(e) => setInputs({ ...inputs, labor: parseFloat(e.target.value) || 0 })}
                      data-testid="input-labor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenance">Maintenance</Label>
                    <Input
                      id="maintenance"
                      type="number"
                      value={inputs.maintenance}
                      onChange={(e) => setInputs({ ...inputs, maintenance: parseFloat(e.target.value) || 0 })}
                      data-testid="input-maintenance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance</Label>
                    <Input
                      id="insurance"
                      type="number"
                      value={inputs.insurance}
                      onChange={(e) => setInputs({ ...inputs, insurance: parseFloat(e.target.value) || 0 })}
                      data-testid="input-insurance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="miscExpenses">Misc Expenses</Label>
                    <Input
                      id="miscExpenses"
                      type="number"
                      value={inputs.miscExpenses}
                      onChange={(e) => setInputs({ ...inputs, miscExpenses: parseFloat(e.target.value) || 0 })}
                      data-testid="input-misc"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="washersCount">Washers</Label>
                      <Input
                        id="washersCount"
                        type="number"
                        value={inputs.washersCount}
                        onChange={(e) => setInputs({ ...inputs, washersCount: parseInt(e.target.value) || 0 })}
                        data-testid="input-washers"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dryersCount">Dryers</Label>
                      <Input
                        id="dryersCount"
                        type="number"
                        value={inputs.dryersCount}
                        onChange={(e) => setInputs({ ...inputs, dryersCount: parseInt(e.target.value) || 0 })}
                        data-testid="input-dryers"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avgWashPrice">Avg Wash $</Label>
                      <Input
                        id="avgWashPrice"
                        type="number"
                        step="0.25"
                        value={inputs.avgWashPrice}
                        onChange={(e) => setInputs({ ...inputs, avgWashPrice: parseFloat(e.target.value) || 0 })}
                        data-testid="input-wash-price"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avgDryPrice">Avg Dry $</Label>
                      <Input
                        id="avgDryPrice"
                        type="number"
                        step="0.25"
                        value={inputs.avgDryPrice}
                        onChange={(e) => setInputs({ ...inputs, avgDryPrice: parseFloat(e.target.value) || 0 })}
                        data-testid="input-dry-price"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Analysis</TabsTrigger>
                  <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Summary</CardTitle>
                      <CardDescription>Monthly overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                          <div className="text-2xl font-bold text-green-600">${inputs.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Expenses</div>
                          <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Net Income</div>
                          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${netIncome.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Profit Margin</div>
                          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {((netIncome / inputs.revenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Turns Per Day Analysis</CardTitle>
                      <CardDescription>Current vs Breakeven</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-2">Current TPD</div>
                          <div className="text-4xl font-bold text-blue-600" data-testid="text-current-tpd">
                            {turnsPerDay.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {totalMachines} machines
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-2">Breakeven TPD</div>
                          <div className="text-4xl font-bold text-orange-600" data-testid="text-breakeven-tpd">
                            {breakEvenTurnsPerDay.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Minimum required
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Performance vs Breakeven</span>
                          <span className="font-medium">
                            {((turnsPerDay / breakEvenTurnsPerDay) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={Math.min((turnsPerDay / breakEvenTurnsPerDay) * 100, 100)} />
                      </div>

                      {turnsPerDay < breakEvenTurnsPerDay && (
                        <div className="flex items-start gap-2 p-4 bg-orange-50 dark:bg-orange-950 rounded-md border border-orange-200 dark:border-orange-800">
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                              Below Breakeven
                            </div>
                            <div className="text-orange-700 dark:text-orange-300">
                              You need {(breakEvenTurnsPerDay - turnsPerDay).toFixed(1)} more turns per day to break even.
                              Increase revenue by ${((breakEvenTurnsPerDay - turnsPerDay) * avgPricePerTurn * 30).toFixed(0)}/month.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="text-muted-foreground">Avg Price/Turn</div>
                          <div className="font-bold">${avgPricePerTurn.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Turns/Machine/Day</div>
                          <div className="font-bold">{(turnsPerDay / totalMachines).toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Revenue/Turn</div>
                          <div className="font-bold">${(inputs.revenue / (turnsPerDay * 30)).toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="montecarlo" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Monte Carlo Simulation
                      </CardTitle>
                      <CardDescription>10,000 iterations with ±20% variance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!monteCarloResults && !isRunning && (
                        <div className="text-center py-12">
                          <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Run Simulation</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Generate probabilistic TPD forecasts with 10,000 scenarios
                          </p>
                          <Button onClick={runMonteCarloSimulation} data-testid="button-run-simulation">
                            <Zap className="w-4 h-4 mr-2" />
                            Run Monte Carlo
                          </Button>
                        </div>
                      )}

                      {isRunning && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold mb-2">Running Simulation...</div>
                            <div className="text-sm text-muted-foreground mb-4">
                              {progress.toFixed(0)}% complete
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      )}

                      {monteCarloResults && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">Mean TPD</div>
                              <div className="text-2xl font-bold">{monteCarloResults.mean.toFixed(1)}</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">Median TPD</div>
                              <div className="text-2xl font-bold">{monteCarloResults.median.toFixed(1)}</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">10th Percentile</div>
                              <div className="text-2xl font-bold text-red-600">{monteCarloResults.p10.toFixed(1)}</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">90th Percentile</div>
                              <div className="text-2xl font-bold text-green-600">{monteCarloResults.p90.toFixed(1)}</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">Min TPD</div>
                              <div className="text-2xl font-bold">{monteCarloResults.min.toFixed(1)}</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">Max TPD</div>
                              <div className="text-2xl font-bold">{monteCarloResults.max.toFixed(1)}</div>
                            </div>
                          </div>

                          <Separator />

                          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-2">Breakeven Probability</div>
                              <div className="text-5xl font-bold mb-2" data-testid="text-breakeven-prob">
                                {monteCarloResults.breakEvenProbability.toFixed(1)}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Chance of meeting or exceeding breakeven TPD
                              </div>
                              <Progress value={monteCarloResults.breakEvenProbability} className="mt-4 h-3" />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={runMonteCarloSimulation} variant="outline" className="flex-1">
                              Re-run Simulation
                            </Button>
                            <Button onClick={exportResults} variant="default" className="flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Export Results
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
