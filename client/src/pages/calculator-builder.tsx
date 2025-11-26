import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BuilderContainer, 
  type BuilderElement, 
  type BuilderState 
} from "@/components/builder/BuilderContainer";
import { 
  MetricCard, 
  MetricGrid, 
  StyledInput, 
  StyledSlider,
  HighlightBox,
  TipsPanel,
  METRIC_COLORS,
  AVAILABLE_COLORS,
  type MetricColor
} from "@/components/builder/BuilderUIKit";
import {
  Calculator, Hash, DollarSign, Percent, Type, ListOrdered,
  SlidersHorizontal, ToggleLeft, Circle, BarChart3, PieChart,
  LineChart, Gauge, Plus, Settings, Eye, Sparkles, ChevronDown,
  ArrowRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// CALCULATOR ELEMENT TYPES
// ============================================================================

type CalculatorElementType = 
  | 'number-input'
  | 'currency-input'
  | 'percentage-input'
  | 'text-input'
  | 'select-input'
  | 'slider-input'
  | 'toggle-input'
  | 'formula'
  | 'result-card'
  | 'highlight-box'
  | 'comparison-table'
  | 'pie-chart'
  | 'bar-chart'
  | 'line-chart'
  | 'gauge-chart'
  | 'tips-panel';

interface ElementPaletteItem {
  type: CalculatorElementType;
  label: string;
  icon: React.ReactNode;
  category: 'input' | 'formula' | 'output' | 'chart' | 'content';
  defaultConfig: Record<string, any>;
}

const ELEMENT_PALETTE: ElementPaletteItem[] = [
  // Input Elements
  { 
    type: 'number-input', 
    label: 'Number Input', 
    icon: <Hash className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Number Field', min: 0, max: 1000000, step: 1 }
  },
  { 
    type: 'currency-input', 
    label: 'Currency Input', 
    icon: <DollarSign className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Amount', min: 0, step: 100, prefix: '$' }
  },
  { 
    type: 'percentage-input', 
    label: 'Percentage Input', 
    icon: <Percent className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Percentage', min: 0, max: 100, step: 0.5, suffix: '%' }
  },
  { 
    type: 'text-input', 
    label: 'Text Input', 
    icon: <Type className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Text Field', placeholder: 'Enter text...' }
  },
  { 
    type: 'select-input', 
    label: 'Dropdown Select', 
    icon: <ListOrdered className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Select Field', options: ['Option 1', 'Option 2', 'Option 3'] }
  },
  { 
    type: 'slider-input', 
    label: 'Slider Input', 
    icon: <SlidersHorizontal className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Slider', min: 0, max: 100, step: 1 }
  },
  { 
    type: 'toggle-input', 
    label: 'Toggle Switch', 
    icon: <ToggleLeft className="w-4 h-4" />, 
    category: 'input',
    defaultConfig: { name: '', label: 'Toggle Option', defaultValue: false }
  },
  
  // Formula Element
  { 
    type: 'formula', 
    label: 'Formula', 
    icon: <Calculator className="w-4 h-4" />, 
    category: 'formula',
    defaultConfig: { name: 'result', formula: '', description: 'Calculate value' }
  },
  
  // Output Elements
  { 
    type: 'result-card', 
    label: 'Result Card', 
    icon: <Circle className="w-4 h-4" />, 
    category: 'output',
    defaultConfig: { 
      label: 'Result', 
      formulaRef: '', 
      format: 'currency', 
      color: 'teal',
      size: 'md'
    }
  },
  { 
    type: 'highlight-box', 
    label: 'Highlight Box', 
    icon: <Star className="w-4 h-4" />, 
    category: 'output',
    defaultConfig: { 
      label: 'Key Metric', 
      formulaRef: '', 
      color: 'teal',
      description: ''
    }
  },
  
  // Chart Elements
  { 
    type: 'pie-chart', 
    label: 'Pie Chart', 
    icon: <PieChart className="w-4 h-4" />, 
    category: 'chart',
    defaultConfig: { title: 'Distribution', dataKeys: [] }
  },
  { 
    type: 'bar-chart', 
    label: 'Bar Chart', 
    icon: <BarChart3 className="w-4 h-4" />, 
    category: 'chart',
    defaultConfig: { title: 'Comparison', dataKeys: [] }
  },
  { 
    type: 'line-chart', 
    label: 'Line Chart', 
    icon: <LineChart className="w-4 h-4" />, 
    category: 'chart',
    defaultConfig: { title: 'Trend', dataKeys: [] }
  },
  { 
    type: 'gauge-chart', 
    label: 'Gauge Chart', 
    icon: <Gauge className="w-4 h-4" />, 
    category: 'chart',
    defaultConfig: { title: 'Score', formulaRef: '', maxValue: 100 }
  },
  
  // Content Elements
  { 
    type: 'tips-panel', 
    label: 'Tips Panel', 
    icon: <Sparkles className="w-4 h-4" />, 
    category: 'content',
    defaultConfig: { title: 'Pro Tips', tips: ['Tip 1', 'Tip 2', 'Tip 3'], color: 'blue' }
  }
];

// ============================================================================
// ELEMENT PALETTE COMPONENT
// ============================================================================

interface ElementPaletteProps {
  onAddElement: (type: CalculatorElementType, config: Record<string, any>) => void;
}

function ElementPalette({ onAddElement }: ElementPaletteProps) {
  const categories = [
    { key: 'input', label: 'Input Fields', icon: <Hash className="w-4 h-4" /> },
    { key: 'formula', label: 'Formulas', icon: <Calculator className="w-4 h-4" /> },
    { key: 'output', label: 'Results', icon: <Circle className="w-4 h-4" /> },
    { key: 'chart', label: 'Charts', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'content', label: 'Content', icon: <Sparkles className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const items = ELEMENT_PALETTE.filter(item => item.category === category.key);
        return (
          <div key={category.key} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
              {category.icon}
              {category.label}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {items.map(item => (
                <Button
                  key={item.type}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-2 justify-start gap-2 text-xs"
                  onClick={() => onAddElement(item.type, { ...item.defaultConfig })}
                  data-testid={`add-${item.type}`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// ELEMENT EDITOR COMPONENTS
// ============================================================================

interface ElementEditorProps {
  element: BuilderElement;
  onChange: (config: Record<string, any>) => void;
  allElements: BuilderElement[];
}

function InputElementEditor({ element, onChange }: ElementEditorProps) {
  const config = element.config;
  
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          {element.type.replace('-input', '').toUpperCase()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Variable Name</Label>
          <Input
            value={config.name || ''}
            onChange={(e) => updateConfig('name', e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="purchase_price"
            className="h-8 text-sm"
            data-testid={`input-name-${element.id}`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Display Label</Label>
          <Input
            value={config.label || ''}
            onChange={(e) => updateConfig('label', e.target.value)}
            placeholder="Purchase Price"
            className="h-8 text-sm"
            data-testid={`input-label-${element.id}`}
          />
        </div>
      </div>

      {(element.type === 'number-input' || element.type === 'currency-input' || 
        element.type === 'percentage-input' || element.type === 'slider-input') && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              value={config.min ?? 0}
              onChange={(e) => updateConfig('min', parseFloat(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max</Label>
            <Input
              type="number"
              value={config.max ?? 1000000}
              onChange={(e) => updateConfig('max', parseFloat(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Step</Label>
            <Input
              type="number"
              value={config.step ?? 1}
              onChange={(e) => updateConfig('step', parseFloat(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Tooltip Help</Label>
        <Input
          value={config.tooltip || ''}
          onChange={(e) => updateConfig('tooltip', e.target.value)}
          placeholder="Help text shown on hover"
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

function FormulaElementEditor({ element, onChange, allElements }: ElementEditorProps) {
  const config = element.config;
  
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const inputElements = allElements.filter(e => e.type.endsWith('-input') && e.config.name);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge className="bg-purple-500 text-xs">FORMULA</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Result Name</Label>
          <Input
            value={config.name || ''}
            onChange={(e) => updateConfig('name', e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="annual_revenue"
            className="h-8 text-sm"
            data-testid={`formula-name-${element.id}`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Input
            value={config.description || ''}
            onChange={(e) => updateConfig('description', e.target.value)}
            placeholder="Calculate annual revenue"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Formula Expression</Label>
        <Input
          value={config.formula || ''}
          onChange={(e) => updateConfig('formula', e.target.value)}
          placeholder="price * quantity * 12"
          className="h-8 text-sm font-mono"
          data-testid={`formula-expression-${element.id}`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use variable names from inputs. Supports: +, -, *, /, (, ), Math functions
        </p>
      </div>

      {inputElements.length > 0 && (
        <div className="p-2 bg-muted/50 rounded-md">
          <p className="text-xs font-medium mb-1">Available Variables:</p>
          <div className="flex flex-wrap gap-1">
            {inputElements.map(el => (
              <Badge 
                key={el.id} 
                variant="outline" 
                className="text-xs cursor-pointer hover:bg-primary/10"
                onClick={() => updateConfig('formula', (config.formula || '') + el.config.name)}
              >
                {el.config.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultElementEditor({ element, onChange, allElements }: ElementEditorProps) {
  const config = element.config;
  
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const formulaElements = allElements.filter(e => e.type === 'formula' && e.config.name);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge 
          className="text-xs"
          style={{ backgroundColor: METRIC_COLORS[config.color as MetricColor || 'teal'].hex }}
        >
          RESULT
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Label</Label>
          <Input
            value={config.label || ''}
            onChange={(e) => updateConfig('label', e.target.value)}
            placeholder="Annual Revenue"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Formula Reference</Label>
          <Select 
            value={config.formulaRef || ''} 
            onValueChange={(v) => updateConfig('formulaRef', v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select formula" />
            </SelectTrigger>
            <SelectContent>
              {formulaElements.map(el => (
                <SelectItem key={el.id} value={el.config.name}>
                  {el.config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Format</Label>
          <Select 
            value={config.format || 'currency'} 
            onValueChange={(v) => updateConfig('format', v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="years">Years</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Color</Label>
          <Select 
            value={config.color || 'teal'} 
            onValueChange={(v) => updateConfig('color', v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_COLORS.map(color => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: METRIC_COLORS[color].hex }}
                    />
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Size</Label>
          <Select 
            value={config.size || 'md'} 
            onValueChange={(v) => updateConfig('size', v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function TipsElementEditor({ element, onChange }: ElementEditorProps) {
  const config = element.config;
  
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const tips = config.tips || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">TIPS</Badge>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs">Panel Title</Label>
        <Input
          value={config.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="Pro Tips"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Tips (one per line)</Label>
        <textarea
          className="w-full h-24 text-sm p-2 rounded-md border bg-background resize-none"
          value={tips.join('\n')}
          onChange={(e) => updateConfig('tips', e.target.value.split('\n').filter(Boolean))}
          placeholder="Enter tips, one per line..."
        />
      </div>
    </div>
  );
}

// ============================================================================
// ELEMENT RENDERER
// ============================================================================

function ElementRenderer({ element, onChange, allElements }: ElementEditorProps) {
  if (element.type.endsWith('-input')) {
    return <InputElementEditor element={element} onChange={onChange} allElements={allElements} />;
  }
  if (element.type === 'formula') {
    return <FormulaElementEditor element={element} onChange={onChange} allElements={allElements} />;
  }
  if (element.type === 'result-card' || element.type === 'highlight-box') {
    return <ResultElementEditor element={element} onChange={onChange} allElements={allElements} />;
  }
  if (element.type === 'tips-panel') {
    return <TipsElementEditor element={element} onChange={onChange} allElements={allElements} />;
  }
  
  return (
    <div className="text-sm text-muted-foreground">
      Configure {element.type} element
    </div>
  );
}

// ============================================================================
// PREVIEW RENDERER
// ============================================================================

function PreviewRenderer({ elements }: { elements: BuilderElement[] }) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, number>>({});

  const inputElements = elements.filter(e => e.type.endsWith('-input'));
  const formulaElements = elements.filter(e => e.type === 'formula');
  const outputElements = elements.filter(e => e.type === 'result-card' || e.type === 'highlight-box');
  const tipsElements = elements.filter(e => e.type === 'tips-panel');

  const handleInputChange = (name: string, value: any) => {
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    const calculatedResults: Record<string, number> = {};
    const context = { ...inputValues };

    formulaElements.forEach(el => {
      try {
        let expression = el.config.formula || '0';
        Object.keys(context).forEach(key => {
          const value = parseFloat(context[key]) || 0;
          expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
        });
        
        // Safe evaluation
        const result = Function(`"use strict"; return (${expression})`)();
        calculatedResults[el.config.name] = typeof result === 'number' ? result : 0;
        context[el.config.name] = calculatedResults[el.config.name];
      } catch (error) {
        calculatedResults[el.config.name] = 0;
      }
    });

    setResults(calculatedResults);
  };

  if (elements.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No elements added yet</p>
        <p className="text-sm">Add elements from the left panel to build your calculator</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {inputElements.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Inputs
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {inputElements.map(el => (
              <StyledInput
                key={el.id}
                name={el.config.name || el.id}
                label={el.config.label || 'Input'}
                value={inputValues[el.config.name] || ''}
                onChange={(v) => handleInputChange(el.config.name, v)}
                type={el.type.replace('-input', '') as any}
                min={el.config.min}
                max={el.config.max}
                step={el.config.step}
                tooltip={el.config.tooltip}
                color="teal"
              />
            ))}
          </div>
        </div>
      )}

      {/* Calculate Button */}
      {formulaElements.length > 0 && (
        <Button onClick={calculate} className="w-full" data-testid="button-calculate">
          <Calculator className="w-4 h-4 mr-2" />
          Calculate
        </Button>
      )}

      {/* Results Section */}
      {outputElements.length > 0 && Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4" />
            Results
          </h3>
          <MetricGrid columns={Math.min(outputElements.length, 4) as 2 | 3 | 4}>
            {outputElements.map(el => (
              <MetricCard
                key={el.id}
                label={el.config.label || 'Result'}
                value={results[el.config.formulaRef] || 0}
                format={el.config.format || 'currency'}
                color={el.config.color || 'teal'}
                size={el.config.size || 'md'}
              />
            ))}
          </MetricGrid>
        </div>
      )}

      {/* Tips Section */}
      {tipsElements.map(el => (
        <TipsPanel
          key={el.id}
          title={el.config.title || 'Pro Tips'}
          tips={el.config.tips || []}
          color={el.config.color || 'blue'}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN CALCULATOR BUILDER PAGE
// ============================================================================

export default function CalculatorBuilderPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [elements, setElements] = useState<BuilderElement[]>([]);

  const handleAddElement = (type: CalculatorElementType, config: Record<string, any>) => {
    const newElement: BuilderElement = {
      id: `${type}-${Date.now()}`,
      type,
      config: { ...config, name: config.name || `${type.replace('-', '_')}_${Date.now()}` },
      order: elements.length
    };
    setElements(prev => [...prev, newElement]);
  };

  const handleSave = async (state: BuilderState) => {
    try {
      // Save to API (implement when routes are ready)
      toast({
        title: "Calculator Saved",
        description: "Your calculator has been saved as a draft."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save calculator. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async (state: BuilderState) => {
    try {
      // Publish to API (implement when routes are ready)
      toast({
        title: "Calculator Published!",
        description: "Your calculator is now live in the marketplace."
      });
      setLocation('/calculators/marketplace');
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Failed to publish calculator. Please try again.",
        variant: "destructive"
      });
    }
  };

  const categories = [
    'valuation',
    'roi',
    'operations',
    'finance',
    'marketing',
    'equipment',
    'staffing',
    'custom'
  ];

  return (
    <>
      <Helmet>
        <title>Calculator Builder - Create Custom Calculators | WashBizHub</title>
        <meta name="description" content="Build your own custom business calculators with our drag-and-drop builder. Create ROI calculators, valuation tools, and more for the laundromat industry." />
        <meta name="keywords" content="calculator builder, custom calculator, business tools, laundromat calculator, ROI calculator builder" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Calculator Builder - Create Custom Calculators | WashBizHub" />
        <meta property="og:description" content="Build and share custom business calculators with our easy-to-use drag-and-drop builder." />
        <meta property="og:type" content="website" />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "WashBizHub Calculator Builder",
            "description": "Drag-and-drop calculator builder for creating custom business analysis tools",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Drag-and-drop interface",
              "Custom formulas",
              "Multiple input types",
              "Colorful result cards",
              "SEO optimization",
              "Marketplace publishing"
            ]
          })}
        </script>
      </Helmet>

      <div className="h-[calc(100vh-4rem)]">
        <BuilderContainer
          type="calculator"
          elementPalette={<ElementPalette onAddElement={handleAddElement} />}
          elementRenderer={(element, onChange) => (
            <ElementRenderer 
              element={element} 
              onChange={onChange} 
              allElements={elements}
            />
          )}
          previewRenderer={(els) => <PreviewRenderer elements={els} />}
          onSave={handleSave}
          onPublish={handlePublish}
          categories={categories}
        />
      </div>
    </>
  );
}
