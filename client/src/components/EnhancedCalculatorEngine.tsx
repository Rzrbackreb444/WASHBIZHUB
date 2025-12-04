import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Calculator, Download, Save, Share2, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { SimpleGauge } from "@/components/calculator/SimpleGauge";
import { ProgressRing } from "@/components/calculator/ProgressRing";
import { ScenarioCard, type Scenario } from "@/components/calculator/ScenarioCard";
import { BenchmarkBar, type BenchmarkData } from "@/components/calculator/BenchmarkBar";
import { ActionItemCard, type ActionItem } from "@/components/calculator/ActionItemCard";
import jsPDF from 'jspdf';

interface InputField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'currency' | 'percentage';
  defaultValue?: string | number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
}

interface OutputField {
  name: string;
  label: string;
  format: 'currency' | 'number' | 'percentage' | 'text';
  decimals?: number;
  highlight?: boolean;
}

// Enhanced result with advanced analytics
interface EnhancedResult {
  mainScore?: number; // 0-10 overall score
  secondaryScore?: number; // Additional score
  scenarios?: Scenario[];
  benchmarks?: BenchmarkData[];
  actions?: ActionItem[];
  insights?: string[];
  warnings?: string[];
}

interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: InputField[];
  outputs: OutputField[];
  formulas: Record<string, string>;
  enhancedAnalytics?: (inputs: Record<string, any>, results: Record<string, any>) => EnhancedResult;
  tips?: string[];
}

interface EnhancedCalculatorEngineProps {
  config: CalculatorConfig;
  onSave?: (data: any) => void;
}

export function EnhancedCalculatorEngine({ config, onSave }: EnhancedCalculatorEngineProps) {
  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    config.inputs.forEach(field => {
      initialState[field.name] = field.defaultValue || '';
    });
    return initialState;
  });

  const [results, setResults] = useState<Record<string, any>>({});
  const [enhanced, setEnhanced] = useState<EnhancedResult>({});
  const [showResults, setShowResults] = useState(false);
  const [whatIfMode, setWhatIfMode] = useState(false);

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    
    // Auto-recalculate in what-if mode
    if (whatIfMode && showResults) {
      setTimeout(() => calculate(), 100);
    }
  };

  const evaluateFormula = (formula: string, context: Record<string, any>): number => {
    try {
      let expression = formula;
      Object.keys(context).forEach(key => {
        const value = parseFloat(context[key]) || 0;
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      });
      
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expression})`)();
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return 0;
    }
  };

  const calculate = () => {
    const calculatedResults: Record<string, any> = {};
    const context = { ...inputs };

    // Evaluate all formulas
    Object.entries(config.formulas).forEach(([key, formula]) => {
      const value = evaluateFormula(formula, { ...context, ...calculatedResults });
      calculatedResults[key] = value;
      context[key] = value;
    });

    setResults(calculatedResults);

    // Generate enhanced analytics if provided
    if (config.enhancedAnalytics) {
      const enhancedResult = config.enhancedAnalytics(inputs, calculatedResults);
      setEnhanced(enhancedResult);
    }

    setShowResults(true);
  };

  const formatValue = (value: number, format: OutputField['format'], decimals: number = 2): string => {
    if (isNaN(value)) return 'N/A';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(decimals)}%`;
      case 'number':
        return value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      default:
        return value.toString();
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text(config.name, 20, yPos);
    yPos += 10;

    // Description
    doc.setFontSize(12);
    doc.text(config.description, 20, yPos, { maxWidth: 170 });
    yPos += 20;

    // Overall Score
    if (enhanced.mainScore !== undefined) {
      doc.setFontSize(16);
      doc.text(`Overall Score: ${enhanced.mainScore.toFixed(1)}/10`, 20, yPos);
      yPos += 15;
    }

    // Inputs
    doc.setFontSize(14);
    doc.text('Inputs:', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    config.inputs.forEach(input => {
      const value = inputs[input.name];
      doc.text(`${input.label}: ${value}`, 30, yPos);
      yPos += 7;
    });

    // Results
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Results:', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    config.outputs.forEach(output => {
      const value = results[output.name];
      if (value !== undefined) {
        const formatted = formatValue(value, output.format, output.decimals);
        doc.text(`${output.label}: ${formatted}`, 30, yPos);
        yPos += 7;
      }
    });

    // Scenarios
    if (enhanced.scenarios && enhanced.scenarios.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Scenarios:', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      enhanced.scenarios.forEach(scenario => {
        doc.text(`${scenario.label}: ${formatValue(scenario.value, 'currency', 0)}`, 30, yPos);
        yPos += 7;
      });
    }

    // Action Items
    if (enhanced.actions && enhanced.actions.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Recommended Actions:', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      enhanced.actions.slice(0, 5).forEach((action, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${idx + 1}. ${action.title} - ${action.impact}`, 30, yPos);
        yPos += 7;
      });
    }

    doc.save(`${config.name.toLowerCase().replace(/\s/g, '-')}-analysis.pdf`);
  };

  const renderInput = (field: InputField) => {
    const value = inputs[field.name];
    
    if (whatIfMode && showResults) {
      // What-if slider mode
      const numValue = parseFloat(value) || 0;
      const min = field.min || 0;
      const max = field.max || numValue * 2 || 100;
      
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{formatValue(numValue, 'number', 0)}</span>
          </div>
          <Slider
            value={[numValue]}
            onValueChange={([v]) => handleInputChange(field.name, v)}
            min={min}
            max={max}
            step={field.step || 1}
            className="w-full"
            data-testid={`slider-${field.name}`}
          />
        </div>
      );
    }
    
    switch (field.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleInputChange(field.name, v)}>
            <SelectTrigger data-testid={`select-${field.name}`}>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'currency':
      case 'percentage':
      case 'number':
        return (
          <div className="relative">
            {field.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {field.prefix}
              </span>
            )}
            <Input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={field.prefix ? 'pl-8' : field.suffix ? 'pr-8' : ''}
              min={field.min}
              max={field.max}
              step={field.step || 0.01}
              data-testid={`input-${field.name}`}
            />
            {field.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {field.suffix}
              </span>
            )}
          </div>
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            data-testid={`input-${field.name}`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            {config.category}
          </Badge>
          <Calculator className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tight" data-testid="text-calculator-title">
            {config.name}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto" data-testid="text-calculator-description">
            {config.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <Card className="bg-card border-border lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                {whatIfMode ? 'What-If Analysis' : 'Input Values'}
              </CardTitle>
              <CardDescription>
                {whatIfMode ? 'Adjust sliders to see live impact' : 'Enter your numbers below'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.inputs.map(field => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.tooltip && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({field.tooltip})
                      </span>
                    )}
                  </Label>
                  {renderInput(field)}
                </div>
              ))}
              
              {!showResults ? (
                <Button 
                  onClick={calculate} 
                  className="w-full bg-primary hover-elevate active-elevate-2"
                  data-testid="button-calculate"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Calculate Results
                </Button>
              ) : (
                <Button 
                  onClick={() => setWhatIfMode(!whatIfMode)} 
                  variant={whatIfMode ? "default" : "outline"}
                  className="w-full hover-elevate active-elevate-2"
                  data-testid="button-whatif"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {whatIfMode ? 'Lock Values' : 'What-If Mode'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-8">
            {!showResults ? (
              <Card className="bg-card border-border">
                <CardContent className="py-20">
                  <div className="text-center text-muted-foreground">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Enter values and click Calculate to see world-class analysis</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score Gauges */}
                {(enhanced.mainScore !== undefined || enhanced.secondaryScore !== undefined) && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Performance Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-8">
                        {enhanced.mainScore !== undefined && (
                          <SimpleGauge
                            score={enhanced.mainScore}
                            label="Investment Score"
                            subtitle="Overall Rating"
                          />
                        )}
                        {enhanced.secondaryScore !== undefined && (
                          <SimpleGauge
                            score={enhanced.secondaryScore}
                            label="Risk Score"
                            subtitle="Risk Assessment"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Standard Results */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Core Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {config.outputs.map(output => {
                        const value = results[output.name];
                        if (value === undefined) return null;
                        
                        return (
                          <div 
                            key={output.name} 
                            className={`p-4 rounded-lg ${output.highlight ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30'}`}
                          >
                            <div className="text-sm text-muted-foreground mb-1">{output.label}</div>
                            <div className={`text-2xl font-bold ${output.highlight ? 'text-primary' : 'text-foreground'}`} data-testid={`result-${output.name}`}>
                              {formatValue(value, output.format, output.decimals)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        onClick={exportToPDF}
                        data-testid="button-export-pdf"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                      {onSave && (
                        <Button 
                          variant="outline"
                          onClick={() => onSave({ inputs, results, enhanced })}
                          data-testid="button-save"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Analysis
                        </Button>
                      )}
                      <Button variant="outline" data-testid="button-share">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scenario Analysis */}
                {enhanced.scenarios && enhanced.scenarios.length > 0 && (
                  <ScenarioCard 
                    scenarios={enhanced.scenarios}
                    formatValue={(v) => formatValue(v, 'currency', 0)}
                  />
                )}

                {/* Benchmarks */}
                {enhanced.benchmarks && enhanced.benchmarks.map((benchmark, idx) => (
                  <BenchmarkBar 
                    key={idx}
                    data={benchmark}
                    formatValue={(v) => formatValue(v, 'percentage', 1)}
                  />
                ))}

                {/* Action Items */}
                {enhanced.actions && enhanced.actions.length > 0 && (
                  <ActionItemCard actions={enhanced.actions} />
                )}

                {/* Insights & Warnings */}
                {(enhanced.insights || enhanced.warnings) && (
                  <Card className="bg-muted/30 border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enhanced.insights && enhanced.insights.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-green-500 mb-2">✓ Key Insights:</h4>
                          <ul className="space-y-1">
                            {enhanced.insights.map((insight, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {enhanced.warnings && enhanced.warnings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-yellow-500 mb-2">⚠ Warnings:</h4>
                          <ul className="space-y-1">
                            {enhanced.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tips Section */}
        {config.tips && config.tips.length > 0 && (
          <Card className="mt-8 bg-accent/5 dark:bg-accent/10 border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips & Industry Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {config.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span className="text-sm text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
