import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator, DollarSign, TrendingUp, Building2, Wrench, Truck, ExternalLink
} from "lucide-react";

interface CalculatorSheet {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  embedUrl: string;
  fullUrl: string;
}

const CALCULATOR_SHEETS: CalculatorSheet[] = [
  {
    id: 'valuation',
    name: 'Business Valuation',
    description: 'Calculate laundromat value using SDE multiples and asset-based methods',
    icon: DollarSign,
    color: '#10b981',
    embedUrl: '', // Add your Google Sheet embed URL here
    fullUrl: '', // Add link to full Google Sheet
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Analyze return on investment with detailed annual projections',
    icon: TrendingUp,
    color: '#8b5cf6',
    embedUrl: '',
    fullUrl: '',
  },
  {
    id: 'startup',
    name: 'Startup Costs',
    description: 'Estimate total capital requirements for opening a laundromat',
    icon: Building2,
    color: '#3b82f6',
    embedUrl: '',
    fullUrl: '',
  },
  {
    id: 'operations',
    name: 'Operating Costs',
    description: 'Calculate utilities, labor, and maintenance expenses',
    icon: Wrench,
    color: '#f59e0b',
    embedUrl: '',
    fullUrl: '',
  },
];

export default function CalculatorsHub() {
  const [activeCalculator, setActiveCalculator] = useState<string>('valuation');

  const selectedCalc = CALCULATOR_SHEETS.find(c => c.id === activeCalculator) || CALCULATOR_SHEETS[0];

  return (
    <>
      <SEO
        title="Laundromat Calculators | WashBizHub"
        description="Professional calculators for laundromat owners - Business valuation, ROI analysis, startup costs, and operating expenses."
        canonicalUrl="/calculators"
        keywords={["laundromat calculator", "laundry business ROI", "laundromat valuation"]}
        breadcrumbs={[{ name: "Calculators", url: "/calculators" }]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[{ name: "Calculators", url: "/calculators" }]} />
          </div>
        </div>

        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Calculator className="w-3 h-3 mr-1" />
                Professional Tools
              </Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Laundromat Calculators
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Free professional calculators powered by Google Sheets. Make a copy to save your own calculations.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {CALCULATOR_SHEETS.map(calc => {
                  const isActive = activeCalculator === calc.id;
                  const Icon = calc.icon;
                  return (
                    <button
                      key={calc.id}
                      onClick={() => setActiveCalculator(calc.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                          : 'bg-card hover:bg-muted border-border'
                      }`}
                      data-testid={`button-calc-${calc.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${calc.color}20` }}
                        >
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: isActive ? 'currentColor' : calc.color }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold">{calc.name}</div>
                          <div className={`text-sm ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {calc.description.slice(0, 40)}...
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${selectedCalc.color}20` }}
                      >
                        <selectedCalc.icon className="w-6 h-6" style={{ color: selectedCalc.color }} />
                      </div>
                      <div>
                        <CardTitle>{selectedCalc.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedCalc.description}</p>
                      </div>
                    </div>
                    {selectedCalc.fullUrl && (
                      <a href={selectedCalc.fullUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" data-testid="button-open-sheet">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Sheets
                        </Button>
                      </a>
                    )}
                  </CardHeader>
                  <CardContent>
                    {selectedCalc.embedUrl ? (
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border bg-white">
                        <iframe
                          src={selectedCalc.embedUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          title={selectedCalc.name}
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                        <div className="text-center p-8">
                          <Calculator className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">Add Your Google Sheet</h3>
                          <p className="text-muted-foreground text-sm max-w-md">
                            To embed your calculator, publish your Google Sheet to the web and add the embed URL to the code.
                          </p>
                          <div className="mt-4 p-4 bg-card rounded-lg text-left">
                            <p className="text-xs text-muted-foreground mb-2">Steps:</p>
                            <ol className="text-xs text-muted-foreground space-y-1">
                              <li>1. Open your Google Sheet</li>
                              <li>2. File → Share → Publish to web</li>
                              <li>3. Select "Embed" and copy the URL</li>
                              <li>4. Add to CALCULATOR_SHEETS in calculators.tsx</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
