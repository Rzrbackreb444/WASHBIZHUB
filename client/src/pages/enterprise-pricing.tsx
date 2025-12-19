import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SEO } from "@/components/SEO";
import {
  Check,
  Crown,
  Building2,
  Factory,
  Zap,
  Shield,
  Phone,
  Users,
  Wrench,
  Package,
  Headphones,
  LineChart,
  Bot,
  MapPin,
  Clock,
  Calendar,
  Cpu,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Star,
  Lock,
  Globe,
  MessageSquare
} from "lucide-react";

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  icon: any;
  features: string[];
  popular?: boolean;
}

export default function EnterprisePricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [machineCount, setMachineCount] = useState([250]);
  const [selectedModules, setSelectedModules] = useState<string[]>(["fleet", "service"]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const annualDiscount = 0.15;

  const basePlatformTiers = [
    {
      id: "starter",
      name: "Regional Partner",
      description: "For single-location distributors",
      monthlyBase: 2499,
      machineLimit: 500,
      includedMachines: 100,
      perMachinePrice: 3,
      features: [
        "Up to 500 machines monitored",
        "3 user accounts",
        "Email support",
        "Basic fleet dashboard",
        "Standard reporting",
        "API access (1,000 calls/day)"
      ],
      icon: Building2,
      cta: "Start Free Trial"
    },
    {
      id: "professional",
      name: "Enterprise",
      description: "For multi-location distributors",
      monthlyBase: 4999,
      machineLimit: 2000,
      includedMachines: 250,
      perMachinePrice: 4,
      features: [
        "Up to 2,000 machines monitored",
        "10 user accounts",
        "Priority phone support",
        "Advanced fleet analytics",
        "Custom reporting",
        "API access (10,000 calls/day)",
        "White-label branding",
        "Custom domain"
      ],
      icon: Factory,
      popular: true,
      cta: "Schedule Demo"
    },
    {
      id: "enterprise",
      name: "National Partner",
      description: "For enterprise distributors",
      monthlyBase: 0,
      machineLimit: 0,
      includedMachines: 0,
      perMachinePrice: 0,
      features: [
        "Unlimited machines",
        "Unlimited users",
        "24/7 dedicated support",
        "Enterprise SLA (99.9% uptime)",
        "Custom integrations",
        "Unlimited API access",
        "Full white-label platform",
        "On-premise deployment option",
        "Dedicated account team"
      ],
      icon: Crown,
      cta: "Contact Sales"
    }
  ];

  const modules: ModuleConfig[] = [
    {
      id: "fleet",
      name: "Fleet Health Dashboard",
      description: "Real-time multi-brand equipment monitoring across all locations",
      monthlyPrice: 499,
      icon: Cpu,
      popular: true,
      features: [
        "Real-time machine status",
        "Multi-brand support (12+ brands)",
        "Revenue per machine tracking",
        "Predictive maintenance alerts",
        "Equipment lifecycle analytics"
      ]
    },
    {
      id: "service",
      name: "Service AI Engine",
      description: "AI-powered diagnostics and technician dispatch",
      monthlyPrice: 799,
      icon: Wrench,
      popular: true,
      features: [
        "AI diagnostic assistant",
        "Photo-based troubleshooting",
        "Voice-to-text service notes",
        "Repair history tracking",
        "First-time fix rate analytics"
      ]
    },
    {
      id: "parts",
      name: "Parts Intelligence",
      description: "Predictive parts ordering and inventory management",
      monthlyPrice: 399,
      icon: Package,
      features: [
        "Parts catalog (50,000+ SKUs)",
        "Predictive ordering",
        "Inventory optimization",
        "Supplier integration",
        "Parts margin tracking"
      ]
    },
    {
      id: "dispatch",
      name: "Technician Dispatch",
      description: "Smart routing and job management for field teams",
      monthlyPrice: 599,
      icon: MapPin,
      features: [
        "Intelligent route optimization",
        "Real-time job tracking",
        "Customer SMS updates",
        "Time & materials capture",
        "Technician performance metrics"
      ]
    },
    {
      id: "receptionist",
      name: "AI Receptionist",
      description: "24/7 call handling and appointment scheduling",
      monthlyPrice: 699,
      icon: Headphones,
      features: [
        "24/7 AI call answering",
        "Service request intake",
        "Appointment scheduling",
        "Emergency escalation",
        "Call analytics & transcripts"
      ]
    },
    {
      id: "analytics",
      name: "Advanced Analytics",
      description: "Business intelligence and custom reporting",
      monthlyPrice: 299,
      icon: LineChart,
      features: [
        "Custom dashboards",
        "Scheduled reports",
        "Market share analysis",
        "ROI projections",
        "Executive summaries"
      ]
    }
  ];

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getDisplayPrice = (price: number) => {
    if (price === 0) return "Custom";
    if (isAnnual) {
      return Math.round(price * (1 - annualDiscount));
    }
    return price;
  };

  const calculateTotalPrice = (baseTier: typeof basePlatformTiers[0]) => {
    if (baseTier.monthlyBase === 0) return "Custom";
    
    let total = baseTier.monthlyBase;
    
    const extraMachines = Math.max(0, machineCount[0] - baseTier.includedMachines);
    total += extraMachines * baseTier.perMachinePrice;
    
    selectedModules.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        total += module.monthlyPrice;
      }
    });

    if (isAnnual) {
      total = Math.round(total * (1 - annualDiscount));
    }

    return total;
  };

  const enterpriseFaqs = [
    {
      question: "What equipment brands do you support?",
      answer: "We support all major commercial laundry equipment brands including Dexter, Speed Queen, Continental, Huebsch, IPSO, UniMac, Maytag Commercial, LG Commercial, Samsung Commercial, Wascomat, Electrolux Professional, and more. Our platform is brand-agnostic, meaning you can monitor equipment from multiple manufacturers in a single dashboard."
    },
    {
      question: "How does per-machine pricing work?",
      answer: "Each plan includes a base number of machines. You only pay the per-machine fee for equipment beyond your included allotment. For example, the Enterprise plan includes 250 machines. If you're monitoring 400 machines, you'd pay the base fee plus $4/month for the additional 150 machines."
    },
    {
      question: "Is there a setup fee?",
      answer: "For Regional Partner and Enterprise plans, there's no setup fee. For National Partner (custom) deployments, implementation fees may apply depending on integration complexity and training requirements. Your dedicated account team will provide a detailed proposal."
    },
    {
      question: "What's included in white-label branding?",
      answer: "White-label branding includes your company logo throughout the platform, custom color schemes, your domain (e.g., fleet.yourcompany.com), branded reports and customer-facing communications, and removal of WashBizHub branding from customer-facing interfaces."
    },
    {
      question: "How does the AI Receptionist work?",
      answer: "Our AI Receptionist answers calls 24/7, captures service requests, schedules appointments based on technician availability, handles emergency escalations, and provides callers with job status updates. All conversations are transcribed and logged in your dashboard."
    },
    {
      question: "Can I start with fewer modules and add more later?",
      answer: "Absolutely. Most distributors start with Fleet Health Dashboard and Service AI Engine, then add Parts Intelligence or Dispatch as they scale. Modules can be added or removed monthly (or at renewal for annual plans)."
    },
    {
      question: "What about data security and compliance?",
      answer: "We maintain SOC 2 Type II compliance, use AES-256 encryption at rest and in transit, support SSO/SAML integration, and offer role-based access controls. For National Partner customers, we also support HIPAA BAAs if needed for healthcare-adjacent facilities."
    },
    {
      question: "Do you offer annual discounts?",
      answer: "Yes, annual billing provides a 15% discount on all platform fees, module costs, and per-machine charges. This typically represents 1.5-2 months of savings over monthly billing."
    }
  ];

  const socialProof = [
    { metric: "98.7%", label: "Average Uptime" },
    { metric: "12", label: "Equipment Brands" },
    { metric: "45%", label: "Reduction in Callbacks" },
    { metric: "24/7", label: "AI Support Available" }
  ];

  return (
    <>
      <SEO 
        title="Enterprise Pricing | Distributor Command Center | WashBizHub"
        description="Flexible pricing for equipment distributors. Fleet monitoring, AI diagnostics, parts intelligence, and dispatch - all in one white-label platform."
        keywords="laundry equipment distributor software, fleet management pricing, service dispatch software, commercial laundry enterprise"
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <Badge variant="outline" className="mb-4" data-testid="badge-enterprise">
              <Building2 className="w-3 h-3 mr-1" />
              Enterprise Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-pricing-title">
              Pricing Built for Distributors
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8" data-testid="text-pricing-subtitle">
              Modular pricing that scales with your business. Start with what you need, add capabilities as you grow.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={!isAnnual ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                data-testid="switch-billing-toggle"
              />
              <span className={isAnnual ? "font-semibold" : "text-muted-foreground"}>
                Annual
                <Badge variant="secondary" className="ml-2">Save 15%</Badge>
              </span>
            </div>

            <div className="flex justify-center gap-6 flex-wrap">
              {socialProof.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid={`text-metric-${idx}`}>{item.metric}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Choose Your Platform</h2>
            <p className="text-muted-foreground">Select a base platform tier, then add the modules you need</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {basePlatformTiers.map((tier) => {
              const TierIcon = tier.icon;
              const displayPrice = tier.monthlyBase === 0 ? "Custom" : `$${getDisplayPrice(tier.monthlyBase).toLocaleString()}`;
              
              return (
                <Card 
                  key={tier.id} 
                  className={`relative ${tier.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  data-testid={`card-tier-${tier.id}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <TierIcon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold" data-testid={`text-price-${tier.id}`}>
                        {displayPrice}
                      </span>
                      {tier.monthlyBase > 0 && (
                        <span className="text-muted-foreground">/mo</span>
                      )}
                    </div>

                    {tier.includedMachines > 0 && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium">Includes {tier.includedMachines} machines</div>
                        <div className="text-xs text-muted-foreground">
                          +${tier.perMachinePrice}/machine after
                        </div>
                      </div>
                    )}

                    <ul className="space-y-2 text-left mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? "default" : "outline"}
                      asChild
                      data-testid={`button-select-${tier.id}`}
                    >
                      <Link href={tier.id === "enterprise" ? "/contact-sales" : "/enterprise-demo"}>
                        {tier.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Add Capability Modules</h2>
              <p className="text-muted-foreground">Extend your platform with specialized features</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => {
                const ModuleIcon = module.icon;
                const isSelected = selectedModules.includes(module.id);
                const displayPrice = getDisplayPrice(module.monthlyPrice);

                return (
                  <Card 
                    key={module.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => toggleModule(module.id)}
                    data-testid={`card-module-${module.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <ModuleIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {module.name}
                              {module.popular && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </CardTitle>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-xl font-bold">${displayPrice}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      <ul className="space-y-1">
                        {module.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="mb-16 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Estimate Your Investment</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Machines Monitored</span>
                        <span className="text-sm font-bold">{machineCount[0]} machines</span>
                      </div>
                      <Slider
                        value={machineCount}
                        onValueChange={setMachineCount}
                        min={50}
                        max={2000}
                        step={50}
                        className="w-full"
                        data-testid="slider-machine-count"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>50</span>
                        <span>2,000+</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Selected Modules</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedModules.length === 0 ? (
                          <span className="text-sm text-muted-foreground">None selected</span>
                        ) : (
                          selectedModules.map(moduleId => {
                            const module = modules.find(m => m.id === moduleId);
                            return module ? (
                              <Badge key={moduleId} variant="secondary">
                                {module.name}
                              </Badge>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-6">
                  <h4 className="font-medium mb-4">Estimated Monthly Cost</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Enterprise Platform Base</span>
                      <span>${getDisplayPrice(4999).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Additional Machines ({Math.max(0, machineCount[0] - 250)} x $4)</span>
                      <span>${(Math.max(0, machineCount[0] - 250) * (isAnnual ? 4 * 0.85 : 4)).toLocaleString()}</span>
                    </div>
                    {selectedModules.map(moduleId => {
                      const module = modules.find(m => m.id === moduleId);
                      return module ? (
                        <div key={moduleId} className="flex justify-between text-sm">
                          <span>{module.name}</span>
                          <span>${getDisplayPrice(module.monthlyPrice)}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Estimated Total</span>
                      <span className="text-primary text-xl" data-testid="text-total-price">
                        ${calculateTotalPrice(basePlatformTiers[1]).toLocaleString()}/mo
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="text-xs text-green-600 text-right">
                        Saving 15% with annual billing
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-6" size="lg" asChild data-testid="button-get-quote">
                    <Link href="/contact-sales">
                      Get Custom Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-16">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">Exclusive Early Adopter Program</h3>
                    <p className="text-muted-foreground mb-4">
                      Join as a founding enterprise partner and lock in preferential pricing for 24 months. 
                      Limited to 10 distributor partners in 2025.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Price Lock Guarantee
                      </Badge>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        Priority Onboarding
                      </Badge>
                      <Badge variant="outline">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Direct Product Input
                      </Badge>
                    </div>
                  </div>
                  <Button size="lg" className="flex-shrink-0" asChild data-testid="button-early-adopter">
                    <Link href="/contact-sales?program=early-adopter">
                      Apply Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about our enterprise platform</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {enterpriseFaqs.map((faq, idx) => (
                <Card key={idx} className="overflow-hidden" data-testid={`card-faq-${idx}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    data-testid={`button-faq-${idx}`}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Distribution Business?</h2>
              <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                Schedule a personalized demo to see how WashBizHub can reduce callbacks, increase parts revenue, 
                and give your customers 24/7 AI-powered support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild data-testid="button-schedule-demo">
                  <Link href="/distributor-command-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Demo Platform
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild data-testid="button-contact-sales">
                  <Link href="/contact-sales">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
