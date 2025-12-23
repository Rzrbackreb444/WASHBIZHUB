import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import {
  Map, Calculator, BookOpen, Wrench, LayoutGrid, FileText,
  ArrowRight, Play, Star, Check, Sparkles, TrendingUp,
  Users, Building2, Zap, Crown, Lock, Search, DollarSign,
  Percent, MapPin, PenTool, FileCheck, AlertTriangle, Eye
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Map;
  color: string;
  demoLink: string;
  purchaseLink: string;
  price: string;
  priceNote?: string;
  features: string[];
  demoFeatures: string[];
  forWho: string[];
  popular?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "cleanbi",
    name: "CLEANBI Explorer",
    tagline: "AI Location Intelligence",
    description: "Analyze any address for laundromat investment potential. Get A/B/C grades, competitor mapping, demographics, and revenue projections in seconds.",
    icon: Map,
    color: "bg-[#C8A661]",
    demoLink: "/cleanbi-explorer",
    purchaseLink: "/pricing",
    price: "3 Free",
    priceNote: "then $49/mo for unlimited",
    features: [
      "17-factor scoring algorithm",
      "Competitor radius mapping",
      "Demographics & income data",
      "Street View integration",
      "PDF report export",
      "Revenue projections"
    ],
    demoFeatures: [
      "Try 3 analyses free",
      "See real scores instantly",
      "No credit card required"
    ],
    forWho: ["Buyers", "Investors", "Brokers"],
    popular: true
  },
  {
    id: "calculators",
    name: "Calculator Suite",
    tagline: "50+ Business Tools",
    description: "Complete financial toolkit: ROI calculator, valuation models, break-even analysis, equipment mix optimizer, and more.",
    icon: Calculator,
    color: "bg-blue-600",
    demoLink: "/calculators",
    purchaseLink: "/pricing",
    price: "Preview Free",
    priceNote: "full access $49/mo",
    features: [
      "ROI & cash flow calculator",
      "Valuation estimator",
      "Break-even analysis",
      "Equipment mix optimizer",
      "Utility cost forecaster",
      "Financing scenario planner"
    ],
    demoFeatures: [
      "Preview all calculators",
      "Sample calculations",
      "See what's included"
    ],
    forWho: ["Buyers", "Owners", "Investors"]
  },
  {
    id: "book-studio",
    name: "Book Studio",
    tagline: "AI Publishing Suite",
    description: "Create professional books on any topic with multi-AI orchestration. Word-like editor, cover generation, KDP formatting, batch production.",
    icon: BookOpen,
    color: "bg-purple-600",
    demoLink: "/book-studio",
    purchaseLink: "/pricing",
    price: "$149/mo",
    priceNote: "included in All-Access",
    features: [
      "Multi-AI writing (GPT-4, Claude, Gemini)",
      "DALL-E 3 cover generation",
      "Word-like rich text editor",
      "KDP-ready DOCX export",
      "Batch book production",
      "Template library"
    ],
    demoFeatures: [
      "Try the editor free",
      "Generate sample content",
      "See AI in action"
    ],
    forWho: ["Authors", "Publishers", "Entrepreneurs"]
  },
  {
    id: "service-guy",
    name: "Service Guy AI",
    tagline: "Equipment Diagnostics",
    description: "AI-powered troubleshooting for laundromat equipment. Photo diagnosis, error code lookup, parts ordering, job tracking.",
    icon: Wrench,
    color: "bg-orange-600",
    demoLink: "/service-guy-ai",
    purchaseLink: "/pricing",
    price: "$149/mo",
    priceNote: "included in All-Access",
    features: [
      "Photo-based diagnosis",
      "Error code database",
      "Parts recommendations",
      "Job & invoice tracking",
      "Voice input support",
      "Multi-brand coverage"
    ],
    demoFeatures: [
      "Try demo diagnosis",
      "Browse error codes",
      "See parts catalog"
    ],
    forWho: ["Technicians", "Owners", "Distributors"]
  },
  {
    id: "design-studio",
    name: "Design Studio",
    tagline: "2D/3D Floor Plans",
    description: "Professional laundromat layout design. Drag-and-drop equipment placement, 3D visualization, equipment lists with pricing.",
    icon: LayoutGrid,
    color: "bg-green-600",
    demoLink: "/design-studio",
    purchaseLink: "/pricing",
    price: "$149/mo",
    priceNote: "included in All-Access",
    features: [
      "Drag-and-drop editor",
      "Real equipment dimensions",
      "3D walkthrough view",
      "Equipment cost totals",
      "Export floor plans",
      "Save unlimited designs"
    ],
    demoFeatures: [
      "Try the editor",
      "Place equipment",
      "See 3D preview"
    ],
    forWho: ["Owners", "Developers", "Distributors"]
  },
  {
    id: "template-vault",
    name: "Template Vault",
    tagline: "Business Documents",
    description: "Professional templates: AI Business Plan Generator, Lease Red Flag Checklist (50+ alerts), Due Diligence Checklist, LOI templates.",
    icon: FileText,
    color: "bg-indigo-600",
    demoLink: "/template-vault",
    purchaseLink: "/pricing",
    price: "$149/mo",
    priceNote: "included in All-Access",
    features: [
      "AI Business Plan Generator",
      "Lease Red Flags (50+ alerts)",
      "Due Diligence Checklist",
      "LOI & legal templates",
      "Employee handbook",
      "Marketing plan template"
    ],
    demoFeatures: [
      "Preview all templates",
      "See 7 free Lease Red Flags",
      "Try AI Business Plan"
    ],
    forWho: ["Buyers", "Owners", "Brokers"]
  }
];

// ============================================
// INTERACTIVE DEMO COMPONENTS
// ============================================

function CLEANBIDemo() {
  const [address, setAddress] = useState("");
  const [showResult, setShowResult] = useState(false);
  
  const handleAnalyze = () => {
    if (address.length > 5) setShowResult(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter any US address..."
          value={address}
          onChange={(e) => { setAddress(e.target.value); setShowResult(false); }}
          className="flex-1"
          data-testid="demo-cleanbi-input"
        />
        <Button onClick={handleAnalyze} className="bg-[#C8A661]" data-testid="demo-cleanbi-analyze">
          <Search className="h-4 w-4 mr-2" />
          Analyze
        </Button>
      </div>
      
      {showResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Sample Analysis Result</span>
            <Badge className="bg-green-500 text-white text-lg px-3">A</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">CLEANBI Score</p>
              <p className="font-bold text-lg">87/100</p>
            </div>
            <div>
              <p className="text-muted-foreground">Competitors</p>
              <p className="font-bold text-lg">2 nearby</p>
            </div>
            <div>
              <p className="text-muted-foreground">Population</p>
              <p className="font-bold text-lg">45,230</p>
            </div>
          </div>
          <Link href="/cleanbi-explorer">
            <Button className="w-full mt-4 bg-[#C8A661]" data-testid="demo-cleanbi-full-report">
              Get Full Report Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      )}
      
      {!showResult && (
        <div className="text-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 inline mr-1" />
          Try: "123 Main Street, Los Angeles, CA"
        </div>
      )}
    </div>
  );
}

function CalculatorDemo() {
  const [revenue, setRevenue] = useState("200000");
  const [expenses, setExpenses] = useState("60");
  
  const annualRev = parseInt(revenue) || 0;
  const expenseRate = parseInt(expenses) || 0;
  const netIncome = annualRev * (1 - expenseRate / 100);
  const valuation = netIncome * 3.5;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Annual Revenue</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="pl-9"
              data-testid="demo-calc-revenue"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Expenses (%)</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="pl-9"
              data-testid="demo-calc-expenses"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Net Income</p>
          <p className="text-2xl font-bold text-green-600">
            ${netIncome.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Est. Valuation (3.5x)</p>
          <p className="text-2xl font-bold text-[#C8A661]">
            ${valuation.toLocaleString()}
          </p>
        </div>
      </div>
      
      <Link href="/calculators">
        <Button className="w-full bg-blue-600" data-testid="demo-calc-access">
          Access All 50+ Calculators <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function BookStudioDemo() {
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState(false);
  
  const sampleTitles = [
    "The Complete Guide to {topic}",
    "{topic}: From Beginner to Expert",
    "Mastering {topic} in 30 Days",
    "The {topic} Handbook: Strategies That Work"
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter a book topic..."
          value={topic}
          onChange={(e) => { setTopic(e.target.value); setGenerated(false); }}
          className="flex-1"
          data-testid="demo-book-topic"
        />
        <Button 
          onClick={() => topic.length > 2 && setGenerated(true)}
          className="bg-purple-600"
          data-testid="demo-book-generate"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>
      
      {generated && topic && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium">AI-Generated Title Ideas:</p>
          {sampleTitles.map((title, i) => (
            <div key={i} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>{title.replace("{topic}", topic)}</span>
              <Badge variant="secondary">Title {i + 1}</Badge>
            </div>
          ))}
        </motion.div>
      )}
      
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm font-medium mb-2">Book Studio Features:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-purple-600" />
            <span>Word-like editor</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>AI writing assist</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-purple-600" />
            <span>KDP formatting</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <span>Cover generation</span>
          </div>
        </div>
      </div>
      
      <Link href="/book-studio">
        <Button className="w-full bg-purple-600" data-testid="demo-book-open">
          Open Book Studio <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function ServiceGuyDemo() {
  const [errorCode, setErrorCode] = useState("");
  const [showResult, setShowResult] = useState(false);
  
  const errorDatabase: Record<string, { brand: string; issue: string; fix: string }> = {
    "E01": { brand: "Speed Queen", issue: "Door Lock Failure", fix: "Check door latch mechanism. Replace door lock assembly if worn." },
    "F21": { brand: "Whirlpool", issue: "Long Drain", fix: "Check drain hose for clogs. Inspect drain pump for blockage." },
    "LE": { brand: "LG", issue: "Motor Locked", fix: "Overloaded drum. Remove excess items. Check motor coupling." },
    "E2": { brand: "Dexter", issue: "Fill Timeout", fix: "Check water supply valves. Inspect inlet hoses and screens." }
  };
  
  const result = errorDatabase[errorCode.toUpperCase()];
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter error code (E01, F21, LE, E2)..."
          value={errorCode}
          onChange={(e) => { setErrorCode(e.target.value); setShowResult(true); }}
          className="flex-1 uppercase"
          data-testid="demo-serviceguy-input"
        />
        <Button className="bg-orange-600" data-testid="demo-serviceguy-lookup">
          <Search className="h-4 w-4 mr-2" />
          Lookup
        </Button>
      </div>
      
      {showResult && result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-orange-600">{result.brand}</Badge>
            <span className="font-mono font-bold">{errorCode.toUpperCase()}</span>
          </div>
          <p className="font-medium mb-2">{result.issue}</p>
          <p className="text-sm text-muted-foreground">{result.fix}</p>
        </motion.div>
      )}
      
      {!result && errorCode.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Try: E01, F21, LE, or E2
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {Object.keys(errorDatabase).map((code) => (
          <Button 
            key={code} 
            variant="outline" 
            size="sm"
            onClick={() => { setErrorCode(code); setShowResult(true); }}
            data-testid={`demo-serviceguy-code-${code.toLowerCase()}`}
          >
            {code}
          </Button>
        ))}
      </div>
      
      <Link href="/service-guy-ai">
        <Button className="w-full bg-orange-600" data-testid="demo-serviceguy-access">
          Access Full Diagnostic Tool <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function DesignStudioDemo() {
  const [machines, setMachines] = useState({ washer: 8, dryer: 10, folder: 2 });
  
  const totalCost = machines.washer * 4500 + machines.dryer * 3200 + machines.folder * 1200;
  const sqftNeeded = machines.washer * 25 + machines.dryer * 20 + machines.folder * 15;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Washers</label>
          <Input
            type="number"
            value={machines.washer}
            onChange={(e) => setMachines({ ...machines, washer: parseInt(e.target.value) || 0 })}
            min="0"
            data-testid="demo-design-washers"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Dryers</label>
          <Input
            type="number"
            value={machines.dryer}
            onChange={(e) => setMachines({ ...machines, dryer: parseInt(e.target.value) || 0 })}
            min="0"
            data-testid="demo-design-dryers"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Folders</label>
          <Input
            type="number"
            value={machines.folder}
            onChange={(e) => setMachines({ ...machines, folder: parseInt(e.target.value) || 0 })}
            min="0"
            data-testid="demo-design-folders"
          />
        </div>
      </div>
      
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Equipment Cost</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalCost.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Min. Space Needed</p>
            <p className="text-2xl font-bold">
              {sqftNeeded.toLocaleString()} sq ft
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center h-24">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutGrid className="h-8 w-8" />
          <span>Drag-and-drop floor plan editor in full version</span>
        </div>
      </div>
      
      <Link href="/design-studio">
        <Button className="w-full bg-green-600" data-testid="demo-design-open">
          Open Design Studio <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function TemplateVaultDemo() {
  const redFlags = [
    { flag: "Triple Net (NNN) lease terms", severity: "high" },
    { flag: "Personal guarantee required", severity: "high" },
    { flag: "No exclusive use clause", severity: "medium" },
    { flag: "Landlord controls HVAC", severity: "medium" },
    { flag: "60-day termination notice", severity: "low" },
    { flag: "Annual rent escalation > 3%", severity: "high" },
    { flag: "No sublease rights", severity: "medium" }
  ];
  
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span className="font-medium">Lease Red Flags Preview (7 of 50+)</span>
        </div>
        
        <div className="space-y-2">
          {redFlags.map((item, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                item.severity === "high" ? "bg-red-500/10 border border-red-500/30" :
                item.severity === "medium" ? "bg-amber-500/10 border border-amber-500/30" :
                "bg-blue-500/10 border border-blue-500/30"
              }`}
            >
              <span>{item.flag}</span>
              <Badge 
                variant="secondary"
                className={
                  item.severity === "high" ? "bg-red-500 text-white" :
                  item.severity === "medium" ? "bg-amber-500 text-white" :
                  "bg-blue-500 text-white"
                }
              >
                {item.severity}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-indigo-500/10 rounded-lg p-3 text-center">
          <FileText className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
          <span>AI Business Plan</span>
        </div>
        <div className="bg-indigo-500/10 rounded-lg p-3 text-center">
          <FileCheck className="h-6 w-6 mx-auto mb-1 text-indigo-600" />
          <span>Due Diligence</span>
        </div>
      </div>
      
      <Link href="/template-vault">
        <Button className="w-full bg-indigo-600" data-testid="demo-template-access">
          Access Template Vault <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

// Demo selector component
function InteractiveDemos() {
  const [activeDemo, setActiveDemo] = useState<string>("cleanbi");
  
  const demos = [
    { id: "cleanbi", name: "CLEANBI", icon: Map, color: "bg-[#C8A661]" },
    { id: "calculators", name: "Calculators", icon: Calculator, color: "bg-blue-600" },
    { id: "book-studio", name: "Book Studio", icon: BookOpen, color: "bg-purple-600" },
    { id: "service-guy", name: "Service Guy", icon: Wrench, color: "bg-orange-600" },
    { id: "design-studio", name: "Design Studio", icon: LayoutGrid, color: "bg-green-600" },
    { id: "template-vault", name: "Templates", icon: FileText, color: "bg-indigo-600" },
  ];
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
            <Eye className="h-3 w-3 mr-1" />
            Interactive Demos
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Try Before You Buy</h2>
          <p className="text-muted-foreground">
            Experience each product right here. No signup required.
          </p>
        </div>
        
        {/* Demo Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Button
                key={demo.id}
                variant={activeDemo === demo.id ? "default" : "outline"}
                onClick={() => setActiveDemo(demo.id)}
                className={activeDemo === demo.id ? demo.color : ""}
                data-testid={`demo-tab-${demo.id}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {demo.name}
              </Button>
            );
          })}
        </div>
        
        {/* Demo Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {demos.find(d => d.id === activeDemo)?.icon && (
                (() => {
                  const Icon = demos.find(d => d.id === activeDemo)!.icon;
                  return <Icon className="h-5 w-5" />;
                })()
              )}
              {demos.find(d => d.id === activeDemo)?.name} Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDemo === "cleanbi" && <CLEANBIDemo />}
            {activeDemo === "calculators" && <CalculatorDemo />}
            {activeDemo === "book-studio" && <BookStudioDemo />}
            {activeDemo === "service-guy" && <ServiceGuyDemo />}
            {activeDemo === "design-studio" && <DesignStudioDemo />}
            {activeDemo === "template-vault" && <TemplateVaultDemo />}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
  
  return (
    <Card 
      className={`relative overflow-hidden ${product.popular ? 'border-2 border-[#C8A661]' : ''}`}
      data-testid={`card-product-${product.id}`}
    >
      {product.popular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg bg-[#C8A661] text-white border-0">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${product.color} text-white shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{product.tagline}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{product.price}</span>
          {product.priceNote && (
            <span className="text-sm text-muted-foreground">{product.priceNote}</span>
          )}
        </div>
        
        {/* Key Features */}
        <div className="space-y-1.5">
          {product.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
          {product.features.length > 4 && (
            <p className="text-xs text-muted-foreground pl-5">
              +{product.features.length - 4} more features
            </p>
          )}
        </div>
        
        {/* Demo Features */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Try the Demo
          </p>
          {product.demoFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Play className="h-3 w-3 text-[#C8A661] shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        {/* For Who */}
        <div className="flex flex-wrap gap-1.5">
          {product.forWho.map((who, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {who}
            </Badge>
          ))}
        </div>
        
        {/* CTAs */}
        <div className="flex gap-2 pt-2">
          <Link href={product.demoLink} className="flex-1">
            <Button variant="outline" className="w-full" data-testid={`button-demo-${product.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Try Demo
            </Button>
          </Link>
          <Link href={product.purchaseLink} className="flex-1">
            <Button 
              className={`w-full ${product.popular ? 'bg-[#C8A661]' : ''}`}
              data-testid={`button-buy-${product.id}`}
            >
              Get Access
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Products() {
  const [filter, setFilter] = useState<string>("all");
  
  const audiences = ["all", "Buyers", "Owners", "Investors", "Brokers", "Technicians"];
  
  const filteredProducts = filter === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.forWho.includes(filter));

  return (
    <>
      <SEO 
        title="Products & Tools | WashBizHub"
        description="Explore our complete suite of laundromat business tools. CLEANBI location analysis, calculators, Book Studio, Service Guy AI, Design Studio, and more. Try demos free."
        canonicalUrl="/products"
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 bg-[#0A1628]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <Badge variant="outline" className="mb-6 border-[#C8A661]/40 text-[#C8A661]">
              Products
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Tools That <span className="text-[#C8A661]">Drive Results</span>
            </h1>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Every product has a free demo. Try before you buy. See exactly what you're getting.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-white/70">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">73K+</div>
                <div className="text-sm">Users</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-8 border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap justify-center gap-2">
              {audiences.map((audience) => (
                <Button
                  key={audience}
                  variant={filter === audience ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(audience)}
                  className={filter === audience ? "bg-[#C8A661]" : ""}
                  data-testid={`button-filter-${audience.toLowerCase()}`}
                >
                  {audience === "all" ? "All Products" : `For ${audience}`}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demos Section */}
        <InteractiveDemos />

        {/* All-Access Bundle */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="border-2 border-[#C8A661] overflow-hidden">
              <div className="bg-[#C8A661] text-white p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-6 w-6" />
                  <span className="text-lg font-bold">All-Access Bundle</span>
                </div>
                <p className="text-white/90">
                  Get everything for one price. Best value for serious professionals.
                </p>
              </div>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Includes All 6 Products:</h3>
                    <div className="space-y-2">
                      {PRODUCTS.map((product) => (
                        <div key={product.id} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-[#C8A661]" />
                          <span>{product.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center text-center md:text-left">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 justify-center md:justify-start">
                        <span className="text-4xl font-bold">$124</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Billed annually ($1,490/year)
                      </p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Save $298 vs buying individually
                      </p>
                    </div>
                    
                    <Link href="/pricing">
                      <Button 
                        size="lg" 
                        className="w-full bg-[#C8A661]"
                        data-testid="button-all-access"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get All-Access
                      </Button>
                    </Link>
                    
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      30-day money-back guarantee
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#0A1628]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Not sure where to start?
            </h2>
            <p className="text-white/70 mb-6">
              Try our most popular tool - CLEANBI Explorer. Analyze any address for free.
            </p>
            <Link href="/cleanbi-explorer">
              <Button size="lg" className="bg-[#C8A661]" data-testid="button-try-cleanbi">
                <Map className="h-4 w-4 mr-2" />
                Try CLEANBI Free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
