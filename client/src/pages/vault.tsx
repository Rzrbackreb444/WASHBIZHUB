import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, Download, Lock, CheckCircle, Sparkles, Crown,
  Calculator, ClipboardList, Users, Shield, TrendingUp,
  DollarSign, Building, Wrench, Calendar, Phone, FileCheck,
  BookOpen, BarChart3, Target, Briefcase
} from "lucide-react";

interface VaultTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  icon: any;
  pages?: number;
  featured?: boolean;
}

const vaultTemplates: VaultTemplate[] = [
  { id: "business-plan", name: "Full Business Plan (30+ Pages)", description: "Comprehensive laundromat business plan template with financials, market analysis, and operations strategy", price: 197, category: "business", icon: Briefcase, pages: 30, featured: true },
  { id: "financial-proforma", name: "5-Year Financial Pro Forma", description: "Detailed financial projections with revenue forecasting, expense modeling, and ROI analysis", price: 147, category: "financial", icon: BarChart3, pages: 15 },
  { id: "employee-handbook", name: "Employee Handbook (40+ Pages)", description: "Complete employee manual with policies, procedures, safety protocols, and training guidelines", price: 97, category: "operations", icon: Users, pages: 40 },
  { id: "grand-opening", name: "Grand Opening Marketing Kit", description: "Full marketing campaign bundle with flyers, social media templates, press release, and launch checklist", price: 197, category: "marketing", icon: Sparkles, featured: true },
  { id: "due-diligence", name: "Due Diligence Master Packet", description: "Comprehensive acquisition checklist covering equipment, financials, lease, environmental, and legal review", price: 197, category: "acquisition", icon: ClipboardList, pages: 25 },
  { id: "wdf-manual", name: "WDF Operations Manual", description: "Wash-Dry-Fold service operations guide with pricing, quality control, and customer management", price: 127, category: "operations", icon: FileText, pages: 20 },
  { id: "lease-script", name: "Lease Negotiation Script", description: "Proven negotiation strategies and scripts for securing favorable commercial lease terms", price: 97, category: "legal", icon: Building },
  { id: "cleanbi-template", name: "CLEANBI Report Template", description: "Professional valuation report template following our proprietary CLEANBI scoring methodology", price: 97, category: "valuation", icon: Calculator },
  { id: "pricing-calendar", name: "Dynamic Pricing Calendar", description: "Seasonal pricing optimization calendar with demand forecasting and promotional scheduling", price: 77, category: "operations", icon: Calendar },
  { id: "roi-calculator", name: "Equipment ROI Calculator", description: "Excel-based ROI calculator for evaluating equipment purchases and upgrade decisions", price: 97, category: "financial", icon: TrendingUp },
  { id: "nda-template", name: "NDA Template", description: "Professional non-disclosure agreement for use in acquisition discussions and partnerships", price: 47, category: "legal", icon: Shield },
  { id: "loi-template", name: "Letter of Intent (LOI)", description: "Industry-standard LOI template for making offers on laundromat acquisitions", price: 67, category: "acquisition", icon: FileCheck },
  { id: "purchase-agreement", name: "Purchase Agreement Outline", description: "Comprehensive purchase agreement framework with key terms and contingencies", price: 127, category: "acquisition", icon: FileText, pages: 15 },
  { id: "maintenance-schedule", name: "Preventative Maintenance Schedule", description: "Complete PM schedule for all major equipment brands with task checklists", price: 77, category: "operations", icon: Wrench },
  { id: "customer-survey", name: "Customer Survey System", description: "Customer feedback collection templates with analysis framework and improvement tracking", price: 47, category: "marketing", icon: Target },
  { id: "emergency-plan", name: "Emergency Response Plan", description: "Emergency protocols for equipment failures, floods, power outages, and safety incidents", price: 47, category: "operations", icon: Shield },
  { id: "insurance-checklist", name: "Insurance Checklist", description: "Comprehensive insurance coverage checklist for laundromat owners with recommended limits", price: 47, category: "legal", icon: Shield },
  { id: "exit-workbook", name: "Exit Strategy Workbook", description: "Business sale preparation guide with valuation factors, timing strategies, and buyer qualification", price: 97, category: "acquisition", icon: DollarSign },
  { id: "broker-disclosure", name: "Broker Disclosure Form", description: "Professional broker disclosure and listing agreement templates", price: 47, category: "acquisition", icon: FileCheck },
  { id: "ops-checklist", name: "Operations Checklist (D/W/M)", description: "Daily, weekly, and monthly operations checklists for consistent store management", price: 97, category: "operations", icon: ClipboardList },
];

const totalValue = vaultTemplates.reduce((sum, t) => sum + t.price, 0);
const bundlePrice = 997;
const savings = totalValue - bundlePrice;

export default function Vault() {
  const { toast } = useToast();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  
  const checkoutMutation = useMutation({
    mutationFn: async (data: { type: 'bundle' | 'template'; templateId?: string }) => {
      const response = await apiRequest("POST", "/api/vault/checkout", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setPurchasingId(null);
    },
  });

  const handleBundlePurchase = () => {
    setPurchasingId("bundle");
    checkoutMutation.mutate({ type: "bundle" });
  };

  const handleTemplatePurchase = (templateId: string) => {
    setPurchasingId(templateId);
    checkoutMutation.mutate({ type: "template", templateId });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "The Operator's Vault - Premium Laundromat Templates",
    "description": "20 professional templates for laundromat business planning, operations, marketing, and acquisitions",
    "brand": { "@type": "Brand", "name": "WashBizHub" },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "47",
      "highPrice": "997",
      "priceCurrency": "USD",
      "offerCount": "21"
    }
  };

  return (
    <>
      <SEO
        title="The Operator's Vault - 20 Premium Laundromat Templates | WashBizHub"
        description="Professional laundromat templates worth $5,917 for just $997. Includes business plans, financial pro formas, employee handbooks, marketing kits, due diligence packets, and more."
        canonicalUrl="/vault"
        keywords={["laundromat business plan", "laundromat templates", "coin laundry operations", "laundromat due diligence", "laundromat employee handbook"]}
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-green-500/10" />
          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-lg px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Premium Resource Library
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-green-400 bg-clip-text text-transparent">
                THE OPERATOR'S VAULT™
              </h1>
              
              <p className="text-2xl md:text-3xl text-yellow-300 font-bold mb-4">
                ${totalValue.toLocaleString()} Value — Yours for ${bundlePrice}
              </p>
              
              <p className="text-lg text-white/70 max-w-3xl mx-auto mb-8">
                20 premium templates covering every aspect of laundromat ownership — from acquisition 
                due diligence to daily operations. Built by industry veterans with 50+ years combined experience.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={handleBundlePurchase}
                  disabled={checkoutMutation.isPending}
                  className="bg-gradient-to-r from-yellow-400 to-green-500 text-black font-bold text-xl px-12 py-8 rounded-2xl hover:scale-105 transition-all shadow-2xl"
                  data-testid="button-vault-bundle-checkout"
                >
                  {purchasingId === "bundle" ? (
                    "Processing..."
                  ) : (
                    <>
                      <Crown className="w-6 h-6 mr-3" />
                      Get All 20 Templates — ${bundlePrice}
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-green-400 font-bold text-lg">Save ${savings.toLocaleString()}</p>
                  <p className="text-white/50 text-sm">vs. individual purchases</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-8 bg-black/30 border-y border-yellow-500/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-4xl font-black text-yellow-400">20</p>
                <p className="text-white/70">Premium Templates</p>
              </div>
              <div>
                <p className="text-4xl font-black text-green-400">200+</p>
                <p className="text-white/70">Pages of Content</p>
              </div>
              <div>
                <p className="text-4xl font-black text-yellow-400">50+</p>
                <p className="text-white/70">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-black text-green-400">24/7</p>
                <p className="text-white/70">Instant Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              All 20 Templates Included
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vaultTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`h-full bg-white/5 backdrop-blur-xl border ${template.featured ? 'border-yellow-400/50' : 'border-white/10'} hover:border-yellow-400/30 transition-all hover:scale-[1.02] p-6 flex flex-col`}
                    data-testid={`card-template-${template.id}`}
                  >
                    {template.featured && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
                        Featured
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400/20 to-green-400/20">
                        <template.icon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm leading-tight">{template.name}</h3>
                        {template.pages && (
                          <p className="text-yellow-400/80 text-xs mt-1">{template.pages}+ pages</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-xs flex-1 mb-4">{template.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <p className="text-2xl font-black text-yellow-400">${template.price}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTemplatePurchase(template.id)}
                        disabled={checkoutMutation.isPending}
                        className="text-xs border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                        data-testid={`button-buy-${template.id}`}
                      >
                        {purchasingId === template.id ? "..." : "Buy Now"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bundle CTA Section */}
        <section className="py-20 bg-gradient-to-r from-yellow-500/10 to-green-500/10 border-y border-yellow-500/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-white mb-6">
              Get Everything for Just ${bundlePrice}
            </h2>
            
            <div className="bg-black/40 rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                {[
                  "All 20 premium templates",
                  "200+ pages of professional content",
                  "Instant digital download",
                  "Lifetime access & updates",
                  "Microsoft Office & PDF formats",
                  "Commercial use license",
                  "Email support included",
                  "30-day money-back guarantee"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-white/50 line-through text-xl">${totalValue.toLocaleString()} if purchased separately</p>
                  <p className="text-4xl font-black text-yellow-400">${bundlePrice} Today</p>
                </div>
                
                <Button
                  size="lg"
                  onClick={handleBundlePurchase}
                  disabled={checkoutMutation.isPending}
                  className="bg-gradient-to-r from-yellow-400 to-green-500 text-black font-bold text-xl px-16 py-8 rounded-2xl hover:scale-105 transition-all shadow-2xl"
                  data-testid="button-vault-cta-checkout"
                >
                  {purchasingId === "bundle" ? (
                    "Processing..."
                  ) : (
                    <>
                      <Download className="w-6 h-6 mr-3" />
                      Download The Vault Now
                    </>
                  )}
                </Button>
                
                <p className="text-white/50 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CLEANBI Upsell */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
                    <Calculator className="w-4 h-4 mr-2" />
                    Instant Valuation
                  </Badge>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Need a Property Valuation?
                  </h3>
                  <p className="text-white/70 mb-6">
                    Get a professional CLEANBI™ score for any address. Our 17-factor analysis 
                    evaluates demographics, competition, foot traffic, and economic indicators.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/cleanbi'}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                    data-testid="button-cleanbi-upsell"
                  >
                    Get CLEANBI Report — $97
                  </Button>
                </div>
                <div className="text-center p-8 bg-green-500/10 rounded-2xl">
                  <p className="text-6xl font-black text-green-400">$97</p>
                  <p className="text-white/70">per report</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
