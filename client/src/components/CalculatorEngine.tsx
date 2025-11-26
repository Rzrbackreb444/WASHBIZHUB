import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Download, Save, Share2, TrendingUp, DollarSign } from "lucide-react";
import { PremiumChart } from "@/components/PremiumChart";
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

interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  dataKey: string;
  labels?: string[];
}

export interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: InputField[];
  outputs: OutputField[];
  formulas: Record<string, string>;
  charts?: ChartConfig[];
  tips?: string[];
}

interface CalculatorEngineProps {
  config: CalculatorConfig;
  onSave?: (data: any) => void;
}

export function CalculatorEngine({ config, onSave }: CalculatorEngineProps) {
  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    config.inputs.forEach(field => {
      initialState[field.name] = field.defaultValue || '';
    });
    return initialState;
  });

  const [results, setResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const evaluateFormula = (formula: string, context: Record<string, any>): number => {
    try {
      // Replace variable names with values from context
      let expression = formula;
      Object.keys(context).forEach(key => {
        const value = parseFloat(context[key]) || 0;
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      });
      
      // Evaluate the expression safely
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
      context[key] = value; // Make available for dependent formulas
    });

    setResults(calculatedResults);
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
    
    // Title
    doc.setFontSize(20);
    doc.text(config.name, 20, 20);
    
    // Description
    doc.setFontSize(12);
    doc.text(config.description, 20, 30, { maxWidth: 170 });
    
    // Inputs
    doc.setFontSize(14);
    doc.text('Inputs:', 20, 50);
    doc.setFontSize(10);
    let yPos = 60;
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
    
    // Save
    doc.save(`${config.name.toLowerCase().replace(/\s/g, '-')}-results.pdf`);
  };

  const renderInput = (field: InputField) => {
    const value = inputs[field.name];
    
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

  const renderChart = (chartConfig: ChartConfig) => {
    if (!chartConfig || !results[chartConfig.dataKey]) return null;

    const data = results[chartConfig.dataKey];
    const dataPoints = Array.isArray(data) 
      ? data.map((value, index) => ({
          label: chartConfig.labels?.[index] || `Value ${index + 1}`,
          value: typeof value === 'number' ? value : 0,
        }))
      : [{ label: chartConfig.labels?.[0] || 'Result', value: typeof data === 'number' ? data : 0 }];
    
    return (
      <PremiumChart
        type={chartConfig.type as any}
        title={chartConfig.title}
        data={dataPoints}
        height={300}
        animate={true}
        showLegend={true}
        formatValue={(v) => new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(v)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-6xl mx-auto px-4">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Input Values
              </CardTitle>
              <CardDescription>
                Enter your numbers below to calculate results
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
              
              <Button 
                onClick={calculate} 
                className="w-full bg-primary hover-elevate active-elevate-2"
                data-testid="button-calculate"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Calculate Results
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Results
              </CardTitle>
              <CardDescription>
                Your calculated financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showResults ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter values and click Calculate to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
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

                  <Separator className="my-6" />

                  {/* Action Buttons */}
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
                        onClick={() => onSave({ inputs, results })}
                        data-testid="button-save"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Scenario
                      </Button>
                    )}
                    <Button variant="outline" data-testid="button-share">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {showResults && config.charts && config.charts.length > 0 && (
          <Card className="mt-8 bg-card border-border">
            <CardHeader>
              <CardTitle>Visual Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="0">
                <TabsList className="mb-4">
                  {config.charts.map((chart, idx) => (
                    <TabsTrigger key={idx} value={idx.toString()}>
                      {chart.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {config.charts.map((chart, idx) => (
                  <TabsContent key={idx} value={idx.toString()}>
                    {renderChart(chart)}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        {config.tips && config.tips.length > 0 && (
          <Card className="mt-8 bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips & Industry Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {config.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm text-muted-foreground">{tip}</span>
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
