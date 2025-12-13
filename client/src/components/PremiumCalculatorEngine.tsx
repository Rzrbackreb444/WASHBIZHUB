import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { 
  Calculator, Download, Save, Share2, TrendingUp, DollarSign, 
  Lock, Mail, FileSpreadsheet, Sparkles, Info, CheckCircle2,
  BarChart3, PieChart, LineChart, ArrowRight, Shield, Eye, EyeOff,
  Loader2, Crown
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, PieChart as RechartsPie, Pie, LineChart as RechartsLine, Line, Legend, Tooltip as RechartsTooltip } from "recharts";
import jsPDF from 'jspdf';

interface InputField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'currency' | 'percentage' | 'slider';
  defaultValue?: string | number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  formatDisplay?: (value: number) => string;
}

interface OutputField {
  name: string;
  label: string;
  format: 'currency' | 'number' | 'percentage' | 'text';
  decimals?: number;
  highlight?: boolean;
  color?: string;
  description?: string;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'comparison';
  title: string;
  dataKeys: string[];
  labels?: string[];
  colors?: string[];
}

export interface PremiumCalculatorConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: InputField[];
  outputs: OutputField[];
  formulas: Record<string, string>;
  charts?: ChartConfig[];
  tips?: string[];
  comparisonOutputs?: string[];
  premiumFeatures?: {
    pdfExport?: boolean;
    emailResults?: boolean;
    sheetsExport?: boolean;
    advancedCharts?: boolean;
  };
}

interface PremiumCalculatorProps {
  config: PremiumCalculatorConfig;
  onSave?: (data: any) => void;
}

const CHART_COLORS = ['#C8A661', '#1e3a5f', '#22C55E', '#8B5CF6', '#F59E0B', '#EF4444'];

export function PremiumCalculatorEngine({ config, onSave }: PremiumCalculatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    config.inputs.forEach(field => {
      initialState[field.name] = field.defaultValue || 0;
    });
    return initialState;
  });

  const [results, setResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'sheets' | 'email'>('pdf');

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    if (showResults) {
      calculateResults({ ...inputs, [name]: value });
    }
  };

  const evaluateFormula = useCallback((formula: string, context: Record<string, any>): number => {
    try {
      let expression = formula;
      Object.keys(context).forEach(key => {
        const value = parseFloat(context[key]) || 0;
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      });
      const result = Function(`"use strict"; return (${expression})`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return 0;
    }
  }, []);

  const calculateResults = useCallback((inputValues: Record<string, any>) => {
    const calculatedResults: Record<string, any> = {};
    const context = { ...inputValues };

    Object.entries(config.formulas).forEach(([key, formula]) => {
      const value = evaluateFormula(formula, { ...context, ...calculatedResults });
      calculatedResults[key] = value;
      context[key] = value;
    });

    setResults(calculatedResults);
    setShowResults(true);
  }, [config.formulas, evaluateFormula]);

  const handleCalculate = () => {
    calculateResults(inputs);
    setIsBlurred(false);
  };

  const formatValue = (value: number, format: OutputField['format'], decimals: number = 2): string => {
    if (isNaN(value) || value === undefined) return 'N/A';
    
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

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const premiumSummary = useMemo(() => {
    if (!showResults || Object.keys(results).length === 0) return undefined;
    
    const highlightedOutputs = config.outputs.filter(o => o.highlight);
    const regularOutputs = config.outputs.filter(o => !o.highlight);
    const keyOutputs = highlightedOutputs.length > 0 ? highlightedOutputs : regularOutputs.slice(0, 4);
    const firstKey = keyOutputs[0];
    const headlineValue = firstKey ? formatValue(results[firstKey.name], firstKey.format, firstKey.decimals) : '';
    
    return {
      headline: firstKey ? `${firstKey.label}: ${headlineValue}` : config.name,
      metrics: keyOutputs.slice(0, 4).map(output => ({
        label: output.label,
        value: formatValue(results[output.name], output.format, output.decimals),
      })),
    };
  }, [showResults, results, config.outputs, config.name]);

  const calculatedData = useMemo(() => {
    if (!showResults) return {};
    return {
      ...inputs,
      ...results,
      calculatorName: config.name,
      calculatorId: config.id,
      category: config.category,
      timestamp: new Date().toISOString(),
    };
  }, [showResults, inputs, results, config]);

  const exportToPDF = async () => {
    if (!user) {
      setExportType('pdf');
      setShowExportDialog(true);
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(200, 166, 97);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(config.name, pageWidth / 2, 25, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Powered by WashBizHub.com', pageWidth / 2, 38, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(config.description, 20, 65, { maxWidth: pageWidth - 40 });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Input Parameters', 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let yPos = 100;
    config.inputs.forEach(input => {
      const value = inputs[input.name];
      const displayValue = input.prefix ? `${input.prefix}${parseFloat(value).toLocaleString()}` : 
                          input.suffix ? `${value}${input.suffix}` : value;
      doc.text(`${input.label}: ${displayValue}`, 25, yPos);
      yPos += 8;
    });
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Calculated Results', 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    config.outputs.forEach(output => {
      const value = results[output.name];
      if (value !== undefined) {
        const formatted = formatValue(value, output.format, output.decimals);
        if (output.highlight) {
          doc.setFillColor(200, 166, 97);
          doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
          doc.setTextColor(30, 58, 95);
          doc.setFont('helvetica', 'bold');
        }
        doc.text(`${output.label}: ${formatted}`, 25, yPos);
        if (output.highlight) {
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }
        yPos += 10;
      }
    });
    
    yPos += 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | WashBizHub.com - Professional Laundromat Intelligence`, 20, yPos);
    doc.text('This report is for informational purposes only and does not constitute financial advice.', 20, yPos + 5);
    
    doc.save(`${config.id}-report-${Date.now()}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Your professional report has been saved.",
    });
  };

  const sendEmailResults = async () => {
    if (!emailAddress) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/calculator-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailAddress,
          calculatorName: config.name,
          inputs: config.inputs.map(input => ({
            label: input.label,
            value: inputs[input.name],
            prefix: input.prefix,
            suffix: input.suffix,
          })),
          results: config.outputs.map(output => ({
            label: output.label,
            value: formatValue(results[output.name], output.format, output.decimals),
            highlight: output.highlight,
          })),
        }),
      });

      if (response.ok) {
        toast({
          title: "Results Sent!",
          description: `Calculator results have been emailed to ${emailAddress}`,
        });
        setShowEmailDialog(false);
        setEmailAddress("");
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Error sending email",
        description: "Please try again or download the PDF instead.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const exportToSheets = async () => {
    if (!user) {
      setExportType('sheets');
      setShowExportDialog(true);
      return;
    }

    try {
      const response = await fetch('/api/calculator-sheets-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculatorName: config.name,
          inputs: config.inputs.map(input => ({
            label: input.label,
            value: inputs[input.name],
          })),
          results: config.outputs.map(output => ({
            label: output.label,
            value: results[output.name],
          })),
        }),
      });

      const data = await response.json();
      if (data.spreadsheetUrl) {
        window.open(data.spreadsheetUrl, '_blank');
        toast({
          title: "Google Sheet Created!",
          description: "Your calculator results have been exported.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const renderSliderInput = (field: InputField, value: number) => {
    const displayValue = field.formatDisplay 
      ? field.formatDisplay(value)
      : field.prefix 
        ? `${field.prefix}${value.toLocaleString()}`
        : field.suffix 
          ? `${value}${field.suffix}`
          : value.toLocaleString();

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            {field.label}
            {field.tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{field.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
          <Badge variant="outline" className="font-mono text-sm px-3 bg-[#C8A661]/15 text-[#C8A661] border-[#C8A661]/30 font-semibold">
            {displayValue}
          </Badge>
        </div>
        <Slider
          value={[value]}
          onValueChange={([v]) => handleInputChange(field.name, v)}
          min={field.min || 0}
          max={field.max || 1000000}
          step={field.step || 1000}
          className="w-full"
          data-testid={`slider-${field.name}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{field.prefix}{(field.min || 0).toLocaleString()}{field.suffix}</span>
          <span>{field.prefix}{(field.max || 1000000).toLocaleString()}{field.suffix}</span>
        </div>
      </div>
    );
  };

  const renderInput = (field: InputField) => {
    const value = inputs[field.name];
    
    if (field.type === 'slider') {
      return renderSliderInput(field, parseFloat(value) || 0);
    }
    
    if (field.type === 'select') {
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
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            {field.label}
            {field.tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{field.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
        </div>
        <div className="relative">
          {field.prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {field.prefix}
            </span>
          )}
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`${field.prefix ? 'pl-8' : ''} ${field.suffix ? 'pr-10' : ''} font-mono`}
            min={field.min}
            max={field.max}
            step={field.step || 0.01}
            data-testid={`input-${field.name}`}
          />
          {field.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {field.suffix}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderComparisonChart = () => {
    if (!config.comparisonOutputs || config.comparisonOutputs.length === 0) return null;

    const chartData = config.comparisonOutputs.map((outputName, index) => {
      const output = config.outputs.find(o => o.name === outputName);
      return {
        name: output?.label?.replace(' Valuation', '').replace(' Value', '') || outputName,
        value: results[outputName] || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    const avgValue = chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;

    return (
      <div className="space-y-6">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                type="number" 
                tickFormatter={formatCurrency}
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                stroke="#6B7280"
                fontSize={12}
              />
              <RechartsTooltip
                formatter={(value: number) => [formatValue(value, 'currency', 0), 'Value']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#0A1628' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>

        <Card className="bg-muted/50 border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Valuation</p>
                <p className="text-2xl font-bold text-[#C8A661]">{formatValue(avgValue, 'currency', 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valuation Range</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatValue(Math.min(...chartData.map(d => d.value)), 'currency', 0)} - {formatValue(Math.max(...chartData.map(d => d.value)), 'currency', 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPieChart = () => {
    if (!config.comparisonOutputs || config.comparisonOutputs.length === 0) return null;

    const chartData = config.comparisonOutputs.map((outputName, index) => {
      const output = config.outputs.find(o => o.name === outputName);
      return {
        name: output?.label?.replace(' Valuation', '').replace(' Value', '') || outputName,
        value: results[outputName] || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return (
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              labelLine={{ stroke: '#9CA3AF' }}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number) => [formatValue(value, 'currency', 0), 'Value']}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#0A1628' }}
            />
            <Legend />
          </RechartsPie>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {config.category}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight" data-testid="text-calculator-title">
            {config.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="text-calculator-description">
            {config.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card border shadow-sm overflow-hidden sticky top-4">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-[#C8A661]" />
                  </div>
                  Input Values
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Adjust the sliders or enter values below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {config.inputs.map(field => (
                  <div key={field.name}>
                    {renderInput(field)}
                  </div>
                ))}
                
                <Separator />
                
                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white font-bold py-6 text-lg"
                  data-testid="button-calculate"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Calculate Results
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <PremiumResults
              featureName={config.id}
              analysisType={config.id}
              title={config.name}
              data={calculatedData}
              summary={premiumSummary}
              benefits={[
                "Save unlimited analyses to your profile",
                "Export to Google Sheets & Docs",
                "Priority support & advanced features"
              ]}
            >
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader className="border-b">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    Results
                  </CardTitle>
                  {showResults && !isBlurred && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToPDF}
                        className="border-[#0A1628] text-[#0A1628]"
                        data-testid="button-export-pdf"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmailDialog(true)}
                        className="border-[#0A1628] text-[#0A1628]"
                        data-testid="button-email-results"
                      >
                        <Mail className="w-4 h-4 mr-1.5" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToSheets}
                        className="border-[#0A1628] text-[#0A1628]"
                        data-testid="button-export-sheets"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                        Sheets
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 relative">
                {!showResults ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Calculator className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                    </div>
                    <p className="text-lg text-foreground">Enter values and click Calculate to see results</p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Professional-grade valuation with 4 proven methodologies
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {isBlurred && (
                      <div className="absolute inset-0 z-20 backdrop-blur-lg bg-background/80 flex flex-col items-center justify-center rounded-lg">
                        <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                          <Lock className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Results Ready</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-sm">
                          Click the Calculate button to reveal your detailed analysis
                        </p>
                        <Button 
                          onClick={() => setIsBlurred(false)}
                          className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-bold"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal Results
                        </Button>
                      </div>
                    )}
                    
                    <div className={isBlurred ? 'blur-xl' : ''}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {config.outputs.map(output => {
                          const value = results[output.name];
                          if (value === undefined) return null;
                          
                          return (
                            <div 
                              key={output.name} 
                              className={`p-4 rounded-lg transition-all ${
                                output.highlight 
                                  ? 'bg-[#C8A661]/10 border-2 border-[#C8A661]/40 col-span-full' 
                                  : 'bg-muted/50 border border-border'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">{output.label}</span>
                                {output.highlight && (
                                  <Badge variant="outline" className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30 text-xs">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Key Metric
                                  </Badge>
                                )}
                              </div>
                              <div 
                                className={`text-2xl font-bold ${output.highlight ? 'text-[#C8A661]' : 'text-foreground'}`}
                                data-testid={`result-${output.name}`}
                              >
                                {formatValue(value, output.format, output.decimals)}
                              </div>
                              {output.description && (
                                <p className="text-xs text-muted-foreground mt-1">{output.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {showResults && !isBlurred && config.comparisonOutputs && (
              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    Visual Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="bar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 mb-6">
                      <TabsTrigger value="bar" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Bar Chart
                      </TabsTrigger>
                      <TabsTrigger value="pie" className="data-[state=active]:bg-[#0A1628] data-[state=active]:text-white">
                        <PieChart className="w-4 h-4 mr-2" />
                        Pie Chart
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="bar">
                      {renderComparisonChart()}
                    </TabsContent>
                    <TabsContent value="pie">
                      {renderPieChart()}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {config.tips && config.tips.length > 0 && (
              <Card className="bg-[#0A1628] border-[#C8A661]/30 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    Pro Tips & Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {config.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            </PremiumResults>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Bank-Grade Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Data Never Shared</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Industry Verified</span>
          </div>
        </div>
      </div>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="bg-card border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#C8A661]" />
              </div>
              Email Your Results
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              We'll send you a professional PDF report with your calculator results.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-foreground">Email Address</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="bg-muted/50 border"
                data-testid="input-email-results"
              />
            </div>
            <Button
              onClick={sendEmailResults}
              disabled={isSending}
              className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white font-bold"
              data-testid="button-send-email"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Results
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-card border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#C8A661]" />
              </div>
              Sign In to Export
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a free account to export your results to {exportType === 'pdf' ? 'PDF' : 'Google Sheets'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-[#C8A661]/10 border border-[#C8A661]/30 rounded-lg p-4">
              <h4 className="text-[#C8A661] font-semibold mb-2">Free Account Benefits:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                  Save unlimited calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                  Export to PDF and Google Sheets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                  Email reports to yourself or clients
                </li>
              </ul>
            </div>
            <Button
              onClick={() => window.location.href = '/api/auth/cloudflare/login'}
              className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-bold"
            >
              Sign In / Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
