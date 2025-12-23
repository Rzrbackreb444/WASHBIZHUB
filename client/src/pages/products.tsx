import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import {
  Map, Calculator, BookOpen, Wrench, LayoutGrid, FileText,
  ArrowRight, Play, Star, Check, Sparkles, TrendingUp,
  Users, Building2, Zap, Crown, Lock
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
              className={`w-full ${product.popular ? 'bg-[#C8A661] hover:bg-[#B89651]' : ''}`}
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
                  className={filter === audience ? "bg-[#C8A661] hover:bg-[#B89651]" : ""}
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
                        className="w-full bg-[#C8A661] hover:bg-[#B89651]"
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
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651]">
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
