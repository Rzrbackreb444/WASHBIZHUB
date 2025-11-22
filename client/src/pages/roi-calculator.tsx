import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PDFExportButton } from "@/components/PDFExportButton";
import { TrendingUp } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ROICalculator() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [inputs, setInputs] = useState({
    purchasePrice: "250000",
    monthlyRevenue: "15000",
    monthlyExpenses: "6000",
    numMachines: "20",
  });

  const [results, setResults] = useState({
    annualCashFlow: 0,
    cashOnCash: 0,
    breakEven: 0,
    fiveYearROI: 0,
  });

  const calculateROI = () => {
    const price = parseFloat(inputs.purchasePrice) || 0;
    const rev = (parseFloat(inputs.monthlyRevenue) || 0) * 12;
    const exp = (parseFloat(inputs.monthlyExpenses) || 0) * 12;
    const cashFlow = rev - exp;
    const coc = (cashFlow / price) * 100;
    const breakEven = (price / cashFlow) * 12;
    const fiveYear = ((cashFlow * 5 - price) / price) * 100;

    setResults({
      annualCashFlow: cashFlow,
      cashOnCash: coc,
      breakEven: breakEven,
      fiveYearROI: Math.max(0, fiveYear),
    });
  };

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const chartData = {
    labels: ['Year 1', 'Year 3', 'Year 5'],
    datasets: [
      {
        label: 'Cumulative ROI (%)',
        data: [results.cashOnCash, results.cashOnCash * 3, results.fiveYearROI],
        backgroundColor: '#b8860b',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
    plugins: {
      legend: { labels: { color: '#fff' } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <TrendingUp className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-roi-title">
            Free Laundromat ROI Calculator 2025
          </h1>
          <p className="text-xl text-white/70" data-testid="text-roi-subtitle">
            Project returns, break-even, and cash flow for your investment—faster and smarter than basic tools
          </p>
          <div className="mt-6">
            <PDFExportButton
              contentRef={contentRef}
              fileName="ROI_Analysis"
              title="Export PDF Report"
              variant="outline"
              className="bg-white/95 text-gray-900 hover:bg-white border-2 border-white/30 font-semibold"
            />
          </div>
        </div>

        <div ref={contentRef}>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Calculate Your Laundromat ROI</CardTitle>
              <CardDescription className="text-white/70">
                Enter details for instant projections
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="purchasePrice" className="text-white/90 font-medium">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={inputs.purchasePrice}
                    onChange={(e) => setInputs({ ...inputs, purchasePrice: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-purchase-price"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyRevenue" className="text-white/90 font-medium">Monthly Revenue ($)</Label>
                  <Input
                    id="monthlyRevenue"
                    type="number"
                    value={inputs.monthlyRevenue}
                    onChange={(e) => setInputs({ ...inputs, monthlyRevenue: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-monthly-revenue"
                  />
                </div>

                <div>
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

                <div>
                  <Label htmlFor="numMachines" className="text-white/90 font-medium">Number of Machines</Label>
                  <Input
                    id="numMachines"
                    type="number"
                    value={inputs.numMachines}
                    onChange={(e) => setInputs({ ...inputs, numMachines: e.target.value })}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 mt-2"
                    data-testid="input-num-machines"
                  />
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-accent mb-6">ROI Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Annual Cash Flow:</span>
                    <strong className="text-2xl text-accent" data-testid="result-annual-cash-flow">
                      ${results.annualCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Cash-on-Cash Return:</span>
                    <strong className="text-2xl text-accent" data-testid="result-cash-on-cash">
                      {results.cashOnCash.toFixed(1)}%
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Break-Even (Months):</span>
                    <strong className="text-2xl text-accent" data-testid="result-break-even">
                      {results.breakEven.toFixed(0)}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/70">5-Year ROI:</span>
                    <strong className="text-2xl text-accent" data-testid="result-five-year-roi">
                      {results.fiveYearROI.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

              <p className="text-sm text-white/60 text-center mt-8">
                * Estimates based on standard laundromat benchmarks. Consult professionals for personalized advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
